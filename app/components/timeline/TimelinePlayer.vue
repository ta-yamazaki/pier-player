<template>
  <div class="timelinePlayer">
    <Loader v-if="!playerMeta.selectedFilename"/>
    <template v-else>
      <div class="has-text-centered player-filename">{{ playerMeta.selectedFilename }}</div>
      <nav class="level is-mobile mb-1">
        <p class="timecode">{{ currentTimeColon }}</p>
        <progress
            ref="progressBar"
            class="mx-2 mb-0"
            style="cursor: pointer;"
            :value="playerMeta.currentTime"
            :max="playerMeta.duration"
            @mousedown="startSeek"
            @mousemove="onMouseMove"
            @mouseleave="hideTooltip"
        />
        <p class="timecode">{{ durationColon }}</p>
      </nav>
      <!-- tooltip -->
      <div
v-if="tooltip.visible"
           class="tooltip"
           :style="{ left: tooltip.x + 'px' }">
        {{ tooltip.value }}
      </div>

      <nav class="level is-mobile transport">
        <p class="level-item"/>
        <p class="level-item">
          <NuxtIconPlayer name="mdi:skip-previous" @click="restart()"/>
        </p>
        <p class="level-item">
          <NuxtIconPlayer name="mdi:rewind-10" @click="rewind(10)"/>
        </p>
        <p class="level-item play-main">
          <NuxtIconPlayer
v-if="!playerMeta.isPlaying"
                          name="mdi:play-circle" size="48"
                          @click="play()"/>
          <NuxtIconPlayer
v-if="playerMeta.isPlaying"
                          name="mdi:pause-circle" size="48"
                          @click="pause()"/>
        </p>
        <p class="level-item">
          <NuxtIconPlayer name="mdi:fast-forward-10" @click="forward(10)"/>
        </p>
        <p class="level-item">
          <NuxtIconPlayer name="mdi:skip-next" @click="toEnd()"/>
        </p>
        <p class="level-item"/>
      </nav>
    </template>
  </div>
</template>

<script setup lang="ts">
import "@/assets/css/timeline.css"
import {computed, onMounted, onUnmounted, ref} from 'vue'
import NuxtIconPlayer from "~/components/icon/NuxtIconPlayer.vue";
import Loader from "~/components/common/Loader.vue";

/**
 * emits
 */
type Emits = {
  (event: "mediaEnded"): void;
};
const emit = defineEmits<Emits>();

/**
 * props
 */
interface Props {
  file: any,
}

defineProps<Props>();

/**
 * state
 */
const progressBar = ref<HTMLElement | null>(null);

const tooltip = ref({
  visible: false,
  x: 0,
  value: ""
});
const timelineApi = window.timelineApi

// プレイヤーメタ情報
const playerMeta = reactive({
  selectedFilename: "",
  currentTime: 0,
  duration: null as number | null,
  loadedmetadata: false,
  isPlaying: false,
  seeking: false,
  iconColor: "rgb(9, 150, 175)",
})

/* -------------------- ライフサイクル -------------------- */
let unsubscribes: (() => void)[] = []

onMounted(() => {
  playerHooks()
})

onUnmounted(() => {
  unsubscribes.forEach((off) => off())
  unsubscribes = []
})

/* -------------------- computed -------------------- */
const currentTimeColon = computed(() => minSecColonFrom(playerMeta.currentTime))
const durationColon = computed(() => minSecColonFrom(playerMeta.duration))

/* -------------------- tooltip -------------------- */
function onMouseMove(e: MouseEvent) {
  if (!progressBar.value) return;
  if (!playerMeta.duration) return;

  const rect = progressBar.value.getBoundingClientRect();
  const offsetX = e.clientX - rect.left; // progress 内のX位置
  const ratio = Math.min(Math.max(offsetX / rect.width, 0), 1);
  const pointerTime = playerMeta.duration * ratio
  tooltip.value.value = minSecColonFrom(pointerTime);
  tooltip.value.x = offsetX + 44;
  tooltip.value.visible = true;
}

function hideTooltip() {
  tooltip.value.visible = false;
}

/* -------------------- プレイヤー操作 -------------------- */
const restart = () => timelineApi.mainPlayer.restart()
const rewind = (seekTime: number) => timelineApi.mainPlayer.rewind(seekTime)
const play = () => timelineApi.mainPlayer.play()
const pause = () => timelineApi.mainPlayer.pause()
const forward = (seekTime: number) => timelineApi.mainPlayer.forward(seekTime)
const toEnd = () => timelineApi.mainPlayer.toEnd()

function startSeek(e: MouseEvent) {
  playerMeta.seeking = true
  updateSeek(e)
  document.addEventListener('mousemove', updateSeek)
  document.addEventListener('mouseup', stopSeek)
  document.addEventListener('mouseleave', stopSeek)
}

function updateSeek(e: MouseEvent) {
  if (!playerMeta.seeking) return
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const clickX = e.clientX - rect.left
  let ratio = clickX / rect.width
  ratio = Math.max(0, Math.min(1, ratio))
  const newTime = Math.round(ratio * (playerMeta.duration ?? 0))
  playerMeta.currentTime = newTime
  timelineApi.mainPlayer.seek(toRaw(newTime))
}

function stopSeek() {
  playerMeta.seeking = false
  document.removeEventListener('mousemove', updateSeek)
  document.removeEventListener('mouseup', stopSeek)
  document.removeEventListener('mouseleave', stopSeek)
}

function playerHooks() {
  unsubscribes = [
    timelineApi.listener.duration((_, p) => {
      playerMeta.duration = p.duration
      playerMeta.loadedmetadata = true
    }),
    timelineApi.listener.timeupdate((_, p) => {
      playerMeta.isPlaying = true

      playerMeta.currentTime = p.currentTime
      playerMeta.duration = p.duration
      playerMeta.selectedFilename = p.file.name
    }),
    timelineApi.listener.paused(() => {
      playerMeta.isPlaying = false
    }),
    timelineApi.listener.ended(() => {
      emit("mediaEnded")
    }),
  ]
}
</script>

<style scoped>
.timelinePlayer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: var(--sidebar-width); /* サイドバーの分だけ右寄せ */
  height: var(--timeline-player-heght);
  z-index: 100;
  padding: 9px 14px;
  background-color: hsla(0, 0%, 100%, 0.88);
  backdrop-filter: blur(14px);
  border-top: 1px solid var(--pp-line-soft);
  box-shadow: 0 -8px 30px hsla(215, 50%, 30%, 0.14);
  animation: SlideIN 0.3s ease-in-out;
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