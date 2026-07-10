<template>
  <table
      v-if="files.length > 0"
      class="table my-2 is-fullwidth borderless"
      style="background-color: transparent">
    <tbody>
    <tr
        v-for="(file, i) in files"
        :key="file.id"
        :class="{'dragging': i === dragIndex}">
      <td
          :draggable="!playingFileExists"
          class="pl-1 pr-0 fitContent"
          style="white-space: nowrap;"
          @dragend="dragEnd()"
          @dragenter="dragEnter(i)"
          @dragstart="dragStart(i)"
          @dragover.prevent>
        <NuxtIcon class="m-0 is-draggable drag-handle" name="ic:baseline-drag-indicator"/>
      </td>
      <td class="p-1" style="font-size: 0.9rem; overflow-x: auto;">
        <TimelineFile
            :file="file"
            :is-last="i === files.length - 1"
            @media-start="mediaStart"
            @media-ended="mediaEnded(i)"
        />
      </td>
      <td class="mx-0 px-1 fitContent">
        <button class="delete" @click="removeRow(i)"/>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import {computed, watch} from 'vue'
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

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
    () => timelineApi.getFiles().then(ensureIds).then(ensureAudioFade),
    (list) => timelineApi.storeFiles(list),
)

// 音声フェード導入前に保存されたデータには、音声フェードなし（0秒）を補完する
function ensureAudioFade(list: any[]): any[] {
  return list.map(f => ({
    startAudioFadeSec: 0,
    endAudioFadeSec: 0,
    ...f,
  }))
}

const {dragIndex, dragStart, dragEnter, dragEnd} = useDragSort(files, () => {
  if (playingFileExists.value) {
    notifyError("再生中は順番を変えられません")
    return false
  }
  return true
})

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

<style scoped>
td {
  vertical-align: middle !important;
}
</style>