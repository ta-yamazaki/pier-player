<template>
  <!-- ファイルが存在する-->
  <template v-if="file.exists">
    <div :class="{'is-live': file.isPlaying}" class="box p-2 mb-1">
      <nav class="level is-mobile mb-0">
        <div class="level-left is-flex-shrink-1">
          <div class="is-flex is-align-items-center is-flex-shrink-1">
            <NuxtIconVideo v-if="isVideo" class="mr-0 is-flex-shrink-0"/>
            <NuxtIconAudio v-if="isAudio" class="mr-0 is-flex-shrink-0"/>
            <b :title="file.name" class="is-size-6 file-name">{{ file.name }}</b>
            <NuxtIconFolder
                v-if="file.path"
                class="has-text-grey ml-1 is-clickable is-flex-shrink-0"
                @click="openFolder()"/>
          </div>
        </div>
        <div class="level-right is-flex-shrink-0" style="gap: 0.6rem;">
          <label v-if="!isLast" class="checkbox is-size-7 nowrap">
            <input v-model="file.continuousPlay" type="checkbox">
            次を自動再生
          </label>
          <button
              v-if="!file.isPlaying"
              :class="{'is-loading': startLoading}"
              class="button is-small is-primary"
              @click="start()"
          >再生
          </button>
          <button
              v-if="file.isPlaying"
              :class="{'is-loading': startLoading}"
              class="button is-small is-danger"
              @click="close()"
          >停止
          </button>
        </div>
      </nav>
      <!-- 再生編集-->
      <div class="mt-1 mb-0 is-size-7 editor">
        <TimelineClipStrip :file="file"/>
      </div>
      <!-- 再生編集ここまで -->
    </div>
    <TimelinePlayer
        v-if="file.isPlaying"
        :file="file"
        @media-ended="mediaEnded"
    />
  </template>
  <!-- ファイルが存在しない-->
  <div v-else class="box p-2 is-missing">
    <nav class="level is-mobile mb-0">
      <div class="level-left is-flex-shrink-1">
        <NuxtIconVideo v-if="isVideo"/>
        <NuxtIconAudio v-if="isAudio"/>
        <span class="is-size-6" style="word-break: break-all;">{{ file.name }}</span>
      </div>
    </nav>
    <p class="has-text-danger mb-0">
      ファイルが開けませんでした。ファイルが無いか、アクセスできない場所にあります。
    </p>
  </div>
</template>

<script lang="ts" setup>
import {ref, toRaw, toRef, watch} from 'vue'
import NuxtIconVideo from "~/components/icon/NuxtIconVideo.vue";
import NuxtIconAudio from "~/components/icon/NuxtIconAudio.vue";
import NuxtIconFolder from "~/components/icon/NuxtIconFolder.vue";
import TimelineClipStrip from "~/components/timeline/TimelineClipStrip.vue";
import type {TimelineFileMeta} from "~/types/models";

/**
 * emits
 */
const emit = defineEmits<{
  mediaStart: [];
  mediaEnded: [];
}>();

/**
 * props
 */
interface Props {
  file: TimelineFileMeta,
  isLast: boolean,
}

const props = defineProps<Props>();

// 親のリストと同一オブジェクトを共有し、変更は親のdeep watchで永続化される
const file = toRef(props, 'file')
const startLoading = ref(false)

const timelineApi = window.timelineApi
const commonApi = window.commonApi
const {notifyError} = useNotification()

/**
 * watch
 */
watch(
    file,
    (newVal) => {
      if (newVal.isPlaying)
        timelineApi.mainPlayer.fileMetaChange(toRaw(newVal))
      if (newVal.path)
        timelineApi.storeHistory(toRaw(newVal));
    }, {deep: true}
);

/* -------------------- computed -------------------- */
const isVideo = computed(() => isVideoType(file.value.type))
const isAudio = computed(() => isAudioType(file.value.type))

/* -------------------- ファイル関連 -------------------- */
function openFolder() {
  commonApi.openFolder(toRaw(file.value.path))
}

/* -------------------- 再生関連 -------------------- */
function start() {
  startLoading.value = true

  emit("mediaStart")

  const f = file.value
  timelineApi.openTimelineWindow(toRaw(f)).then((isExists: boolean) => {
    if (!isExists) {
      notifyError(`ファイルが開けませんでした。「${f.name}」`)
      f.isPlaying = false
      return
    }
    f.isPlaying = true
  }).catch(() => {
    notifyError(`ファイルが開けませんでした。「${f.name}」`)
    f.isPlaying = false
  }).finally(() => {
    startLoading.value = false
  })
}

function close() {
  timelineApi.closeTimelineWindow()
  const f = file.value
  f.isPlaying = false
}

function mediaEnded() {
  emit("mediaEnded")
}
</script>

<style scoped>
/* level-left とその中身が縮めるように（ellipsisにはmin-width:0が必須） */
.level-left,
.level-left > .is-flex {
  min-width: 0;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.editor {
  color: var(--pp-fog);
}

td {
  vertical-align: middle !important;
}
</style>