<template>
  <div class="timelinePlayer">
    <div v-if="!playerMeta.selectedFilename"
         class="loader mx-auto my-5"
         style="height: 40px;width: 40px;"></div>

    <template v-else>
      <div class="has-text-centered">{{ playerMeta.selectedFilename }}</div>
      <nav class="level is-mobile mb-1">
        <p>{{ currentTimeColon }}</p>
        <progress
            class="mx-2 mb-0"
            style="cursor: pointer;"
            :value="playerMeta.currentTime"
            :max="playerMeta.duration"
            @mousedown="startSeek"
        ></progress>
        <p>{{ durationColon }}</p>
      </nav>

      <nav class="level is-mobile">
        <p class="level-item"></p>
        <p class="level-item">
          <NuxtIconPlayer name="mdi:skip-previous" @click="restart()"/>
        </p>
        <p class="level-item">
          <NuxtIconPlayer name="mdi:rewind-10" @click="rewind(10)"/>
        </p>
        <p class="level-item">
          <NuxtIconPlayer v-if="!playerMeta.isPlaying"
                          name="mdi:play-circle" size="48"
                          :color="'var(--bulma-primary-30)'"
                          @click="play()"/>
          <NuxtIconPlayer v-if="playerMeta.isPlaying"
                          name="mdi:pause-circle" size="48"
                          :color="'var(--bulma-primary-30)'"
                          @click="pause()"/>
        </p>
        <p class="level-item">
          <NuxtIconPlayer name="mdi:fast-forward-10" @click="forward(10)"/>
        </p>
        <p class="level-item">
          <NuxtIconPlayer name="mdi:skip-next" @click="toEnd()"/>
        </p>
        <p class="level-item"></p>
      </nav>
    </template>
  </div>
</template>

<script setup lang="ts">
import "@/assets/css/timeline.css"
import {computed, onMounted, ref} from 'vue'
import NuxtIconPlayer from "~/components/icon/NuxtIconPlayer.vue";

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

const props = defineProps<Props>();

const timelineApi = window.timeline

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
onMounted(() => {
  playerHooks()
})

/* -------------------- watch -------------------- */


/* -------------------- computed -------------------- */
const currentTimeColon = computed(() => minSecColonFrom(playerMeta.currentTime))
const durationColon = computed(() => minSecColonFrom(playerMeta.duration))

/* -------------------- utils -------------------- */
function minSecColonFrom(t: number | null) {
  if (typeof t !== "number") return ""
  let min = Math.floor(t / 60)
  let sec = Math.floor(t % 60)
  return `${('00' + min).slice(-2)}:${('00' + sec).slice(-2)}`
}

/* -------------------- 個別ファイルemit受け取り -------------------- */

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
  timelineApi.listener.ready(() => {
  })
  timelineApi.listener.duration((_, p) => {
    playerMeta.duration = p.duration
    playerMeta.loadedmetadata = true
  })
  timelineApi.listener.play(() => {
    // playerMeta.isPlaying = true
  })
  timelineApi.listener.timeupdate((_, p) => {
    playerMeta.isPlaying = true

    playerMeta.currentTime = p.currentTime
    playerMeta.duration = p.duration
    playerMeta.selectedFilename = p.file.name
  })
  timelineApi.listener.paused(() => {
    playerMeta.isPlaying = false
  })
  timelineApi.listener.ended(() => {
    emit("mediaEnded")
  })
}
</script>

<style scoped>
.timelinePlayer {
  position: fixed;
  right: 0;
  bottom: 0;
  left: var(--sidebar-width); /* サイドバーの分だけ右寄せ */
  height: 114px;
  z-index: 100;
  padding: 7px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px 2px rgba(0, 0, 0, 0.2);
  animation: SlideIN 0.3s ease-in-out;
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
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background-color: #e6eaf0;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* WebKit (Chrome, Safari) */
progress::-webkit-progress-bar {
  background-color: #e6eaf0;
  border-radius: 999px;
}

progress::-webkit-progress-value {
  /*background: linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4)),*/
  /*            var(--timeline-linear-gradient);*/
  background-color: var(--bulma-primary-30);
}

/* Firefox */
progress::-moz-progress-bar {
  /*background: linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4)),*/
  /*            var(--timeline-linear-gradient);*/
  background-color: var(--bulma-primary-30);
}
</style>