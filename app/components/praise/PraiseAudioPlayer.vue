<template>
  <div class="praisePlayer">
    <button class="delete player-close" title="プレイヤーを閉じる" @click="emit('close')"/>

    <div class="has-text-centered player-filename">{{ audio.title }}</div>
    <nav class="level is-mobile mb-1">
      <p class="timecode">{{ currentTimeColon }}</p>
      <progress
          ref="progressBar"
          :max="duration"
          :value="currentTime"
          class="mx-2 mb-0"
          style="cursor: pointer;"
          @mousedown="startSeek"
          @mouseleave="hideTooltip"
          @mousemove="onMouseMove"
      />
      <p class="timecode">{{ durationColon }}</p>
    </nav>
    <!-- tooltip -->
    <div
        v-if="tooltip.visible"
        :style="{ left: tooltip.x + 'px' }"
        class="tooltip">
      {{ tooltip.value }}
    </div>

    <nav class="level is-mobile transport">
      <p class="level-item"/>
      <p class="level-item">
        <NuxtIconPlayer name="mdi:skip-previous" @click="restart()"/>
      </p>
      <p class="level-item">
        <NuxtIconPlayer name="mdi:rewind-10" @click="skip(-10)"/>
      </p>
      <p class="level-item play-main">
        <NuxtIconPlayer
            v-if="!isPlaying"
            name="mdi:play-circle" size="48"
            @click="play()"/>
        <NuxtIconPlayer
            v-if="isPlaying"
            name="mdi:pause-circle" size="48"
            @click="pause()"/>
      </p>
      <p class="level-item">
        <NuxtIconPlayer name="mdi:fast-forward-10" @click="skip(10)"/>
      </p>
      <p class="level-item">
        <NuxtIconPlayer name="mdi:skip-next" @click="toEnd()"/>
      </p>
      <p class="level-item"/>
    </nav>

    <audio
        ref="audioRef"
        :src="src"
        autoplay
        @loadedmetadata="onLoadedMetadata"
        @timeupdate="onTimeUpdate"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @ended="isPlaying = false"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref, computed} from "vue";
import NuxtIconPlayer from "~/components/icon/NuxtIconPlayer.vue";
import {minSecColonFrom} from "~/utils/format";
import type {PraiseAudio} from "~/utils/praise/firestore";

defineProps<{
  audio: PraiseAudio
  src: string
}>()

// 1つめにイベント名, ２つ目にemitする値の型
type Emits = {
  (event: "close"): void;
};
const emit = defineEmits<Emits>();

/**
 * state
 */
const audioRef = ref<HTMLAudioElement | null>(null)
const progressBar = ref<HTMLElement | null>(null)
const isPlaying = ref(false)
const duration = ref(0)
const currentTime = ref(0)
const seeking = ref(false)

const tooltip = ref({
  visible: false,
  x: 0,
  value: ""
});

const durationColon = computed(() => minSecColonFrom(duration.value) || "00:00")
const currentTimeColon = computed(() => minSecColonFrom(currentTime.value) || "00:00")

/**
 * audioイベント
 */
const onLoadedMetadata = () => {
  duration.value = audioRef.value?.duration ?? 0
  currentTime.value = 0
}

const onTimeUpdate = () => {
  if (seeking.value) return
  currentTime.value = audioRef.value?.currentTime ?? 0
}

/* -------------------- tooltip -------------------- */
function onMouseMove(e: MouseEvent) {
  if (!progressBar.value) return;
  if (!duration.value) return;

  const rect = progressBar.value.getBoundingClientRect();
  const offsetX = e.clientX - rect.left; // progress 内のX位置
  const ratio = Math.min(Math.max(offsetX / rect.width, 0), 1);
  const pointerTime = duration.value * ratio
  tooltip.value.value = minSecColonFrom(pointerTime);
  tooltip.value.x = offsetX + 44;
  tooltip.value.visible = true;
}

function hideTooltip() {
  tooltip.value.visible = false;
}

/* -------------------- プレイヤー操作 -------------------- */
const play = () => audioRef.value?.play()
const pause = () => audioRef.value?.pause()

const restart = () => {
  const el = audioRef.value
  if (!el) return
  el.currentTime = 0
  el.play()
}

const skip = (seconds: number) => {
  const el = audioRef.value
  if (!el) return
  el.currentTime = Math.min(Math.max(el.currentTime + seconds, 0), el.duration || 0)
}

const toEnd = () => {
  const el = audioRef.value
  if (!el || !el.duration) return
  el.currentTime = el.duration - 0.1
}

function startSeek(e: MouseEvent) {
  seeking.value = true
  updateSeek(e)
  document.addEventListener('mousemove', updateSeek)
  document.addEventListener('mouseup', stopSeek)
  document.addEventListener('mouseleave', stopSeek)
}

function updateSeek(e: MouseEvent) {
  if (!seeking.value) return
  if (!progressBar.value) return
  const rect = progressBar.value.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  let ratio = clickX / rect.width
  ratio = Math.max(0, Math.min(1, ratio))
  const newTime = ratio * duration.value
  currentTime.value = newTime
  if (audioRef.value) audioRef.value.currentTime = newTime
}

function stopSeek() {
  seeking.value = false
  document.removeEventListener('mousemove', updateSeek)
  document.removeEventListener('mouseup', stopSeek)
  document.removeEventListener('mouseleave', stopSeek)
}
</script>

<style scoped>
.praisePlayer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: var(--sidebar-width); /* サイドバーの分だけ右寄せ */
  height: 118px; /* タイムラインプレイヤーと同じ高さ */
  z-index: 100;
  padding: 9px 14px;
  background-color: hsla(0, 0%, 100%, 0.88);
  backdrop-filter: blur(14px);
  border-top: 1px solid var(--pp-line-soft);
  box-shadow: 0 -8px 30px hsla(215, 50%, 30%, 0.14);
  animation: SlideIN 0.3s ease-in-out;
}

.player-close {
  position: absolute;
  top: 8px;
  right: 10px;
}

.player-filename {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--pp-text);
  margin-bottom: 2px;
}

.transport {
  color: var(--pp-fog);
}

.transport .level-item:hover {
  color: var(--pp-text);
}

.transport .play-main,
.transport .play-main:hover {
  color: var(--pp-cyan);
}

@keyframes SlideIN {
  from {
    transform: translateY(100px);
  }
  to {
    transform: translateY(0);
  }
}

/* Bulmaのprogressリセット */
progress {
  all: unset; /* ほぼ全てのCSSをリセット */
  display: block; /* progress は block にする */
  width: 100%; /* 元の幅を確保 */
  height: auto; /* 高さは自分で設定 */
  box-sizing: border-box;
}

/* progress のベース */
progress {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background-color: hsl(214, 30%, 89%);
}

/* WebKit (Chrome, Safari) */
progress::-webkit-progress-bar {
  background-color: hsl(214, 30%, 89%);
  border-radius: 999px;
}

progress::-webkit-progress-value {
  background: linear-gradient(90deg, hsl(190, 90%, 28%), hsl(189, 80%, 42%));
}

/* Firefox */
progress::-moz-progress-bar {
  background: linear-gradient(90deg, hsl(190, 90%, 28%), hsl(189, 80%, 42%));
}

.tooltip {
  position: absolute;
  top: 0; /* progressBar の上に出す */
  padding: 4px 6px;
  font-size: 12px;
  font-family: var(--pp-font-mono);
  background: #ffffff;
  border: 1px solid var(--pp-line);
  color: var(--pp-text);
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 4px 12px hsla(215, 50%, 30%, 0.15);
}
</style>
