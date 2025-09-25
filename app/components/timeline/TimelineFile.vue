<template>
  <!-- ファイルが存在しない-->
  <div v-if="!file.exists" class="box p-2 has-background-light">
    <nav class="level is-mobile mb-0">
      <div class="level-left" style="max-width: calc(100% - 55px);">
        <NuxtIconVideo v-if="isVideo" class="has-text-link"/>
        <NuxtIconAudio v-if="isAudio" style="color:#eebe3a!important"/>
        <span class="is-size-6" style="word-break: break-all;">{{ file.name }}</span>
      </div>
    </nav>
    <p class="has-text-danger mb-0">
      ファイルが開けませんでした。ファイルが無いか、アクセスできない場所にあります。
    </p>
  </div>
  <!-- ファイルが存在する-->
  <div v-else
       class="box p-2"
       :class="{'has-background-danger-light': file.isPlaying}">
    <nav class="level is-mobile mb-0">
      <div class="level-left" style="max-width: calc(100% - 55px);">
        <NuxtIconVideo v-if="isVideo" class="has-text-link"/>
        <NuxtIconAudio v-if="isAudio" style="color:#eebe3a!important"/>
        <b class="is-size-6" style="word-break: break-all;">{{ file.name }}</b>
        <NuxtIconFolder
            v-if="file.path"
            class="icon is-small has-text-grey is-clickable"
            @click="openFolder()"/>
      </div>
      <div class="level-right">
        <button v-if="!file.isPlaying"
                class="button is-small is-success"
                @click="start()"
        ><b>再生</b></button>
        <button v-if="file.isPlaying"
                class="button is-small is-danger"
                @click="close()"
        ><b>停止</b></button>
      </div>
    </nav>

    <!-- 再生編集-->
    <div class="mx-2 mt-2 mb-0">
      <div class="is-flex is-align-items-center py-0">
        <nav class="level is-mobile is-flex-grow-1 is-size-7">
          <div class="level-left">
            <p class="nowrap" style="width: 5.75rem"></p>
            冒頭（秒）
          </div>
          <div class="level-right">
            末尾（秒）
            <p class="nowrap" style="width: 0.1rem"></p>
          </div>
        </nav>
      </div>
      <nav class="level is-mobile is-size-7 py-1 m-0" style="border-bottom: 1px dashed lightgray;">
        <div class="level-left">
          <p class="nowrap" style="width: 4.5rem">
            <NuxtIcon name="mdi:content-cut"/>
            カット
          </p>
          <NuxtIconMinus @click="decreaseStartTrim()" class="is-clickable"/>
          <input v-model="file.startTrimSec"
                 class="input borderless editInput is-small px-1 py-0"
                 type="number" min="0" style="width: 2.75rem;height: 1.75em;">
          <NuxtIconPlus @click="increaseStartTrim()" class="is-clickable"/>
        </div>
        <div class="level-right">
          <NuxtIconMinus @click="decreaseEndTrim()" class="is-clickable"/>
          <input v-model="file.endTrimSec"
                 class="input borderless editInput is-small px-1 py-0"
                 type="number" min="0" style="width: 2.75rem;height: 1.75em;">
          <NuxtIconPlus @click="increaseEndTrim()" class="is-clickable"/>
        </div>
      </nav>
      <nav v-if="isVideo"
           class="level is-mobile is-size-7 py-1 m-0" style="border-bottom: 1px dashed lightgray;">
        <div class="level-left">
          <p class="nowrap" style="width: 4.5rem">
            <NuxtIcon name="material-symbols:transition-fade"/>
            フェード
          </p>
          <NuxtIconMinus @click="decreaseStartFade()" class="is-clickable"/>
          <input v-model="file.startFadeSec"
                 class="input borderless editInput is-small px-1 py-0"
                 type="number" min="0">
          <NuxtIconPlus @click="increaseStartFade()" class="is-clickable"/>
        </div>
        <div class="level-right">
          <NuxtIconMinus @click="decreaseEndFade()" class="is-clickable"/>
          <input v-model="file.endFadeSec"
                 class="input borderless editInput is-small px-1 py-0"
                 type="number" min="0" style="width: 2.75rem;height: 1.75em;">
          <NuxtIconPlus @click="increaseEndFade()" class="is-clickable"/>
        </div>
      </nav>
      <nav class="level is-mobile py-1 m-0">
        <div class="level-left nowrap">
          <NuxtIcon name="mdi:volume-high"/>
          <input v-model="file.gain"
                 type="range"
                 class="is-size-7"
                 style="vertical-align: middle"
                 :style="{background: sliderBackground()}"
                 step="0.1" :min="gainMin" :max="gainMax"
                 @change="changeGain()"
                 @mousemove="changeGain()"
                 @dblclick="file.gain = 1">
          <div class="control ml-1 is-size-7" style="font-size: inherit;">{{ file.gain }}</div>
          <div class="has-text-grey ml-2 is-size-7">（元の音量＝1）</div>
        </div>
        <div class="level-right">
          <label v-if="!isLast" class="checkbox">
            <input type="checkbox" v-model="file.continuousPlay"/>
            次を自動再生
          </label>
        </div>
      </nav>
    </div>
    <!-- 再生編集ここまで -->
  </div>
</template>

<script setup lang="ts">
import {onMounted} from 'vue'
import NuxtIconVideo from "~/components/icon/NuxtIconVideo.vue";
import NuxtIconAudio from "~/components/icon/NuxtIconAudio.vue";
import NuxtIconFolder from "~/components/icon/NuxtIconFolder.vue";
import NuxtIconMinus from "~/components/icon/NuxtIconMinus.vue";
import NuxtIconPlus from "~/components/icon/NuxtIconPlus.vue";
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

/**
 * emits
 */
type Emits = {
  (event: "mediaStart"): void;
  (event: "mediaClose"): void;
};
const emit = defineEmits<Emits>();

/**
 * props
 */
interface Props {
  file: any,
  isLast: boolean,
}

const props = defineProps<Props>();

const file = ref(props.file)
const trimStep = 0.5
const fadeStep = 0.1
const gainMin = 0
const gainMax = 3
const timelineApi = window.timeline

/* -------------------- ライフサイクル -------------------- */
onMounted(async () => {
})

/* -------------------- computed -------------------- */
const isVideo = computed(() => /video\/.*/.test(file.value.type))
const isAudio = computed(() => /audio\/.*/.test(file.value.type))

/* -------------------- ファイル関連 -------------------- */
function openFolder() {
  const folderPath = file.value.path.replace(/[\\/][^\\/]+$/, "")
  timelineApi.openFolder(toRaw(folderPath))
}

/* -------------------- トリミング -------------------- */
function increaseStartTrim() {
  const f = file.value
  f.startTrimSec = increase(f.startTrimSec, trimStep)
}

function decreaseStartTrim() {
  const f = file.value
  f.startTrimSec = decrease(f.startTrimSec, trimStep)
}

function increaseEndTrim() {
  const f = file.value
  f.endTrimSec = increase(f.endTrimSec, trimStep)
}

function decreaseEndTrim() {
  const f = file.value
  f.endTrimSec = decrease(f.endTrimSec, trimStep)
}

/* -------------------- フェード -------------------- */
function increaseStartFade() {
  const f = file.value
  f.startFadeSec = increase(f.startFadeSec, fadeStep)
}

function decreaseStartFade() {
  const f = file.value
  f.startFadeSec = decrease(f.startFadeSec, fadeStep)
}

function increaseEndFade() {
  const f = file.value
  f.endFadeSec = increase(f.endFadeSec, fadeStep)
}

function decreaseEndFade() {
  const f = file.value
  f.endFadeSec = decrease(f.endFadeSec, fadeStep)
}

/* -------------------- Gain -------------------- */
function changeGain() {
  timelineApi.mainPlayer.fileMetaChange(toRaw(file.value))
}

function sliderBackground() {
  const activeColor = "darkgray"
  const inactiveColor = "transparent"
  const ratio = (file.value.gain - gainMin) / (gainMax - gainMin) * 100
  const barColor = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`

  const percent = (1 / (gainMax - gainMin)) * 100
  const defaultLine = `
    linear-gradient(to right,
      transparent ${percent - 1}%,
      gray ${percent - 1}%,
      gray ${percent + 1}%,
      transparent ${percent + 1}%)
  `
  return `${defaultLine}, ${barColor}`
}

/* -------------------- 共通計算 -------------------- */
function increase(sec: number, step: number, max: number | null = null) {
  if (!sec) return step
  if (max && sec >= max) return max
  return Math.round((Number(sec) + step) * 1000) / 1000
}

function decrease(sec: number, step: number, min = 0) {
  if (!sec) return min
  if (sec <= min) return min
  return Math.round((Number(sec) - step) * 1000) / 1000
}

/* -------------------- 再生関連 -------------------- */
function start() {
  emit("mediaStart")
  const f = file.value
  f.isPlaying = true
  timelineApi.openSubWindow(toRaw(f)).then((isExists: boolean) => {
    if (!isExists) {
      alert(`ファイルが開けませんでした。\n「${f.name}」`)
      f.isPlaying = false
      return
    }
  })
}

function close() {
  const f = file.value
  timelineApi.closeSubWindow()
  f.isPlaying = false

  emit("mediaClose")
}
</script>

<style scoped>
td {
  vertical-align: middle !important;
}
</style>