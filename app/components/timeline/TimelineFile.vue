<template>
  <!-- ファイルが存在する-->
  <template v-if="file.exists">
    <div class="box p-2 mb-1" :class="{'has-background-danger-light': file.isPlaying}">
      <nav class="level is-mobile mb-0">
        <div class="level-left" style="max-width: calc(100% - 55px);">
          <div style="line-break: anywhere">
            <NuxtIconVideo v-if="isVideo" class="mr-2"/>
            <NuxtIconAudio v-if="isAudio" class="mr-2"/>
            <b class="is-size-6" style="word-break: break-all;">{{ file.name }}</b>
            <NuxtIconFolder
                v-if="file.path"
                class="has-text-grey ml-1 is-clickable"
                @click="openFolder()"/>
          </div>
        </div>
        <div class="level-right">
          <button
v-if="!file.isPlaying"
                  class="button is-small is-primary"
                  :class="{'is-loading': startLoading}"
                  @click="start()"
          ><b>再生</b></button>
          <button
v-if="file.isPlaying"
                  class="button is-small is-danger"
                  :class="{'is-loading': startLoading}"
                  @click="close()"
          ><b>停止</b></button>
        </div>
      </nav>
      <nav class="level is-mobile py-1 m-0 v-center">
        <div class="level-left">
          <div class="is-clickable is-size-7" @click="editorOpen = !editorOpen">
            <NuxtIcon :name="editorOpen? 'iconamoon:arrow-up-2' : 'iconamoon:arrow-down-2'" size="14"/>
            調整
          </div>
        </div>
        <div class="level-right">
          <label v-if="!isLast" class="checkbox">
            <input v-model="file.continuousPlay" type="checkbox">
            次を自動再生
          </label>
        </div>
      </nav>
      <!-- 再生編集-->
      <div v-if="editorOpen" class="mx-2 mt-2 mb-0 is-size-7 editor">
        <nav class="level is-mobile py-0 my-0 border-bottom">
          <div class="level-left">
            <p class="nowrap" style="width: 5.75rem"/>
            冒頭（秒）
          </div>
          <div class="level-right">
            末尾（秒）
            <p class="nowrap" style="width: 0.1rem"/>
          </div>
        </nav>
        <nav class="level is-mobile py-1 m-0 border-bottom">
          <div class="level-left">
            <p class="nowrap" style="width: 4.5rem">
              <NuxtIcon name="mdi:content-cut"/>
              カット
            </p>
            <NuxtIconMinus class="is-clickable" @click="adjust('startTrimSec', -trimStep)"/>
            <input
v-model="file.startTrimSec"
                   class="input is-primary borderless editInput is-small px-1 py-0"
                   type="number" min="0" style="width: 2.75rem;height: 1.75em;">
            <NuxtIconPlus class="is-clickable" @click="adjust('startTrimSec', trimStep)"/>
          </div>
          <div class="level-right">
            <NuxtIconMinus class="is-clickable" @click="adjust('endTrimSec', -trimStep)"/>
            <input
v-model="file.endTrimSec"
                   class="input is-primary borderless editInput is-small px-1 py-0"
                   type="number" min="0" style="width: 2.75rem;height: 1.75em;">
            <NuxtIconPlus class="is-clickable" @click="adjust('endTrimSec', trimStep)"/>
          </div>
        </nav>
        <nav v-if="isVideo" class="level is-mobile py-1 m-0 border-bottom">
          <div class="level-left">
            <p class="nowrap" style="width: 4.5rem">
              映像フェード
            </p>
            <NuxtIconMinus class="is-clickable" @click="adjust('startFadeSec', -fadeStep)"/>
            <input
v-model="file.startFadeSec"
                   class="input is-primary borderless editInput is-small px-1 py-0"
                   type="number" min="0" style="width: 2.75rem;height: 1.75em;">
            <NuxtIconPlus class="is-clickable" @click="adjust('startFadeSec', fadeStep)"/>
          </div>
          <div class="level-right">
            <NuxtIconMinus class="is-clickable" @click="adjust('endFadeSec', -fadeStep)"/>
            <input
v-model="file.endFadeSec"
                   class="input is-primary borderless editInput is-small px-1 py-0"
                   type="number" min="0" style="width: 2.75rem;height: 1.75em;">
            <NuxtIconPlus class="is-clickable" @click="adjust('endFadeSec', fadeStep)"/>
          </div>
        </nav>
        <nav class="level is-mobile py-1 m-0 border-bottom">
          <div class="level-left">
            <p class="nowrap" style="width: 4.5rem">
              音声フェード
            </p>
            <NuxtIconMinus class="is-clickable" @click="adjust('startAudioFadeSec', -fadeStep)"/>
            <input
v-model="file.startAudioFadeSec"
                   class="input is-primary borderless editInput is-small px-1 py-0"
                   type="number" min="0" style="width: 2.75rem;height: 1.75em;">
            <NuxtIconPlus class="is-clickable" @click="adjust('startAudioFadeSec', fadeStep)"/>
          </div>
          <div class="level-right">
            <NuxtIconMinus class="is-clickable" @click="adjust('endAudioFadeSec', -fadeStep)"/>
            <input
v-model="file.endAudioFadeSec"
                   class="input is-primary borderless editInput is-small px-1 py-0"
                   type="number" min="0" style="width: 2.75rem;height: 1.75em;">
            <NuxtIconPlus class="is-clickable" @click="adjust('endAudioFadeSec', fadeStep)"/>
          </div>
        </nav>
        <nav class="level is-mobile py-1 m-0">
          <div class="level-left nowrap">
            <p class="nowrap" style="width: 4.5rem">
              <NuxtIcon name="mdi:volume-high"/>
              音量
            </p>
            <input
v-model="file.gain"
                   type="range"
                   class="v-center"
                   :style="{background: sliderBackground()}"
                   step="0.1" :min="gainMin" :max="gainMax"
                   @dblclick="file.gain = 1">
            <div class="control ml-1" style="font-size: inherit;">{{ file.gain }}</div>
            <div class="has-text-grey ml-0">（元の音量＝1）</div>
          </div>
          <div class="level-right"/>
        </nav>
        <nav class="py-1 m-0" style="padding-left: 5rem">
          <TimelineWaveform :file-path="file.path"/>
        </nav>
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
  <div v-else class="box p-2 has-background-light">
    <nav class="level is-mobile mb-0">
      <div class="level-left" style="max-width: calc(100% - 55px);">
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

<script setup lang="ts">
import {ref, toRaw, toRef, watch} from 'vue'
import NuxtIconVideo from "~/components/icon/NuxtIconVideo.vue";
import NuxtIconAudio from "~/components/icon/NuxtIconAudio.vue";
import NuxtIconFolder from "~/components/icon/NuxtIconFolder.vue";
import NuxtIconMinus from "~/components/icon/NuxtIconMinus.vue";
import NuxtIconPlus from "~/components/icon/NuxtIconPlus.vue";
import NuxtIcon from "~/components/icon/NuxtIcon.vue";
import TimelineWaveform from "~/components/timeline/TimelineWaveform.vue";
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
const editorOpen = ref(false)
const startLoading = ref(false)

const trimStep = 0.5
const fadeStep = 0.1
const gainMin = 0
const gainMax = 3
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

/* -------------------- トリミング・フェード調整 -------------------- */
type AdjustableKey = 'startTrimSec' | 'endTrimSec' | 'startFadeSec' | 'endFadeSec' | 'startAudioFadeSec' | 'endAudioFadeSec'

// 指定キーの秒数を delta 分増減する（0未満にはしない）
function adjust(key: AdjustableKey, delta: number) {
  const current = Number(file.value[key]) || 0
  const next = Math.round((current + delta) * 1000) / 1000
  file.value[key] = Math.max(0, next)
}

function sliderBackground() {
  const activeColor = "var(--bulma-primary)"
  const inactiveColor = "whitesmoke"
  const ratio = (file.value.gain - gainMin) / (gainMax - gainMin) * 100
  const barColor = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`

  const percent = (1 / (gainMax - gainMin)) * 100
  const defaultLine = `
    linear-gradient(to right,
      transparent ${percent - 1}%,
      var(--bulma-primary-dark) ${percent}%,
      transparent ${percent + 1}%)
  `
  return `${defaultLine}, ${barColor}`
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

/** 音量スライダー */
input[type="range"] {
  appearance: none;
  width: 140px;
  height: 6px;
  border-radius: 99px;
  background: transparent;
  cursor: pointer;
}

/* ツマミ：Chrome, Safari, Edge用 */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background: var(--bulma-primary);
  border: 1px solid var(--bulma-primary-light);
  box-shadow: none
}

/* ツマミ：Firefox用 */
input[type="range"]::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  background: var(--bulma-primary);
  border: 1px solid var(--bulma-primary-light);
  box-shadow: none;
}

.editor nav.border-bottom {
  border-bottom: 1px dashed lightgray;
}

td {
  vertical-align: middle !important;
}
</style>