<template>
  <!-- 縦積み（既定） -->
  <SortableList
      v-if="layout === 'stack'"
      :boxed="false"
      :can-drag="canDrag"
      :draggable="!playingFileExists"
      :items="files"
      @remove="removeRow">
    <template #default="{ item, index }">
      <TimelineFile
          :file="item"
          :is-last="index === files.length - 1"
          @media-start="mediaStart"
          @media-ended="mediaEnded(index)"
      />
    </template>
  </SortableList>

  <!-- 横並び（列で並べて全体の流れを見渡す） -->
  <div v-else-if="files.length > 0">
    <!-- 画面外に出た列を見失わないための、控えめな名前一覧（クリックでその列へ） -->
    <div v-if="scrollable" class="tags are-small mb-2">
      <a
          v-for="(file, i) in files"
          :key="file.id"
          :class="file.isPlaying ? 'is-danger' : 'is-light'"
          :title="file.name"
          class="tag is-clickable"
          @click="scrollToColumn(i)">
        <span class="timeline-index-name">{{ i + 1 }}. {{ file.name }}</span>
      </a>
    </div>

    <div
        ref="columnsRef"
        class="timeline-columns is-flex is-align-items-flex-start is-gap-2 is-overflow-x-auto pb-2">
      <div
          v-for="(file, i) in files"
          :key="file.id"
          class="timeline-column">
        <div class="is-flex is-align-items-center is-justify-content-space-between mb-1">
          <div class="is-flex is-align-items-center is-gap-1">
            <!-- 横並びではドラッグより前後入れ替えのほうが狙いやすい -->
            <div class="buttons has-addons mb-0">
              <button
                  :disabled="i === 0"
                  class="button is-small"
                  title="前へ移動"
                  @click="moveRow(i, i - 1)">
                <span class="icon is-small"><NuxtIcon name="mdi:chevron-left"/></span>
              </button>
              <button
                  :disabled="i === files.length - 1"
                  class="button is-small"
                  title="後ろへ移動"
                  @click="moveRow(i, i + 1)">
                <span class="icon is-small"><NuxtIcon name="mdi:chevron-right"/></span>
              </button>
            </div>
            <span class="tag is-light is-small">{{ i + 1 }}</span>
          </div>
          <button class="delete" @click="removeRow(i)"/>
        </div>
        <TimelineFile
            :file="file"
            :is-last="i === files.length - 1"
            @media-start="mediaStart"
            @media-ended="mediaEnded(i)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, onUnmounted, ref, watch} from 'vue'
import SortableList from "~/components/common/SortableList.vue";
import NuxtIcon from "~/components/icon/NuxtIcon.vue";
import type {TimelineLayout} from "~/composables/useTimelineLayout";

/**
 * props
 */
interface Props {
  /** 表示するタブのID（タブごとにファイルリストを持つ） */
  tabId: string;
  /** 一覧の並べ方（省略時は縦積み） */
  layout?: TimelineLayout;
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'stack',
});

/**
 * emits
 */
type Emits = {
  (event: "changeFiles", value: any): void;
};
const emit = defineEmits<Emits>();

const timelineApi = window.timelineApi
const {notifyError} = useNotification()

const files = useStoredList<any>(
    () => timelineApi.getFiles(props.tabId).then(ensureIds).then(ensureAudioFade).then(clearPlaying),
    (list) => timelineApi.storeFiles(props.tabId, list),
)

// 再生中にタブを切り替えたり終了したりした場合の再生中フラグを持ち越さない
function clearPlaying(list: any[]): any[] {
  return list.map(f => ({...f, isPlaying: false}))
}

// 音声フェード導入前に保存されたデータには、音声フェードなし（0秒）を補完する
function ensureAudioFade(list: any[]): any[] {
  return list.map(f => ({
    startAudioFadeSec: 0,
    endAudioFadeSec: 0,
    ...f,
  }))
}

function canDrag() {
  if (playingFileExists.value) {
    notifyError("再生中は順番を変えられません")
    return false
  }
  return true
}

/* -------------------- 横並びのスクロール補助 -------------------- */
const columnsRef = ref<HTMLElement | null>(null)
// 列がはみ出て横スクロールになっているか（名前一覧を出すかの判定）
const scrollable = ref(false)

const resizeObserver = new ResizeObserver(() => updateScrollable())
onUnmounted(() => resizeObserver.disconnect())

// レイアウト切り替えでの生成・破棄と、ウィンドウ幅の変化を拾う
watch(columnsRef, (el) => {
  resizeObserver.disconnect()
  if (el) resizeObserver.observe(el)
  updateScrollable()
})

// 列の増減でも測り直す（描画後の実寸が必要なので nextTick 後に測る）
watch(() => files.value.length, () => nextTick(updateScrollable))

function updateScrollable() {
  const el = columnsRef.value
  scrollable.value = !!el && el.scrollWidth > el.clientWidth + 1
}

// ページ自体を動かさずに、指定の列を左端へ寄せる
function scrollToColumn(i: number) {
  const el = columnsRef.value
  const target = el?.children[i] as HTMLElement | undefined
  if (!el || !target) return
  const left = target.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft
  el.scrollTo({left, behavior: 'smooth'})
}

// 横並びの前後入れ替え（SortableList のドラッグ並べ替えに相当）
function moveRow(from: number, to: number) {
  if (to < 0 || to >= files.value.length) return
  if (!canDrag()) return
  const moved = files.value.splice(from, 1)[0]
  files.value.splice(to, 0, moved)
}

watch(files, (newFiles) => {
  emit("changeFiles", newFiles)
}, {deep: true})

/* -------------------- computed -------------------- */
const playingFileExists = computed(() => {
  return files.value.findIndex(f => f.isPlaying) >= 0
})

/* -------------------- 再生関連 -------------------- */
function mediaStart() {
  reset()
}

function mediaEnded(i: number) {
  const currentFile = files.value[i]
  currentFile.isPlaying = false

  // 自動再生オフ、または最後のファイルなら再生を終了してウィンドウを閉じる
  const nextFile = files.value[i + 1]
  if (!currentFile.continuousPlay || !nextFile) {
    timelineApi.closeTimelineWindow()
    return
  }
  continuousPlay(nextFile)
}

function continuousPlay(nextFile: any) {
  if (!nextFile.exists) {
    timelineApi.closeTimelineWindow()
    notifyError(`次のファイルが読み込めません。ファイルが無いか、アクセスできない場所にあります。「${nextFile.name}」`)
    return;
  }

  nextFile.isPlaying = true
  timelineApi.continuousPlay(toRaw(nextFile)).then((isExists: boolean) => {
    if (!isExists) {
      nextFile.isPlaying = false
      timelineApi.closeTimelineWindow()
      notifyError(`ファイルが開けませんでした。「${nextFile.name}」`)
    }
  })
}

function reset() {
  timelineApi.closeTimelineWindow()
  files.value.forEach(f => f.isPlaying = false)
}

function addRow(file: any) {
  files.value.push({...file, id: newId()})
}

function removeRow(i: number) {
  files.value.splice(i, 1)
}

defineExpose({addRow, reset})
</script>