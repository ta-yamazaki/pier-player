<template>
  <div style="margin: auto; width: 95%; max-width: 640px">
    <h5 class="title is-5 mb-2 pt-3">タイムライン</h5>
    <NuxtLink to="/timeline/history">履歴から追加する ></NuxtLink>
    <FileDropInput @droppedFile="selectFile"/>

    <button class="button is-small is-pulled-right mb-3"
            @click="reset()"
    >表示リセット
    </button>
    <TimelineFileList
        ref="timelineFileListRef"
        :playerMeta="playerMeta"
        @changeFiles="changeFiles"
        @mediaStart="mediaStart"
        @mediaClose="mediaClose"
    />
  </div>

  <!-- プレイヤー -->
  <div v-if="playingFileExists" class="timelinePlayer">
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
  <!-- プレイヤーここまで -->
</template>

<script setup lang="ts">
import "@/assets/css/timeline.css"
import {computed, onMounted, reactive, ref} from 'vue'
import TimelineFileList from "~/components/timeline/TimelineFileList.vue";
import NuxtIconPlayer from "~/components/icon/NuxtIconPlayer.vue";
import FileDropInput from "~/components/input/FileDropInput.vue";

const timelineFileListRef = ref<InstanceType<typeof TimelineFileList> | null>(null)

const files = ref<any[]>([])
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
const playingFileIndex = computed(() => {
  return files.value.findIndex(f => f.isPlaying)
})
const playingFileExists = computed(() => {
  return playingFileIndex.value >= 0
})
const playLoading = computed(() => {
  return playingFileExists.value && !playerMeta.selectedFilename
})

async function selectFile(file: File) {
  const path = window.webUtils.getPathForFile(file)
  const checkedFile = await timelineApi.checkFilePath({
    path,
    name: file.name,
    type: file.type,
    exists: true,
    startTrimSec: 0,
    endTrimSec: 0,
    startFadeSec: 0.7,
    endFadeSec: 0.7,
    gain: 1,
  })

  timelineFileListRef.value?.addRow(checkedFile)
}

function changeFiles(newFiles: any) {
  files.value = [...newFiles]
}

function continuousPlay(currentIndex: number) {
  const currentFile = files.value[currentIndex]
  const nextFile = files.value[currentIndex + 1]
  currentFile.isPlaying = false
  nextFile.isPlaying = true
  timelineApi.continuousPlay(toRaw(nextFile)).then((isExists: boolean) => {
    if (!isExists) {
      alert(`ファイルが開けませんでした。\n「${nextFile.name}」`)
      nextFile.isPlaying = false
    }
  })
}

function reset() {
  timelineFileListRef.value?.reset()
  mediaClose()
}

/* -------------------- utils -------------------- */
function minSecColonFrom(t: number | null) {
  if (typeof t !== "number") return ""
  let min = Math.floor(t / 60)
  let sec = Math.floor(t % 60)
  return `${('00' + min).slice(-2)}:${('00' + sec).slice(-2)}`
}

/* -------------------- 個別ファイルemit受け取り -------------------- */
function mediaStart(file: any) {
}

function mediaClose() {
  playerMeta.currentTime = 0
  playerMeta.isPlaying = false
  playerMeta.selectedFilename = ""
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
    const i = playingFileIndex.value
    if (i === files.value.length - 1) return

    const currentFile = files.value[i]
    if (!currentFile.continuousPlay) return;

    const nextFile = files.value[i + 1]
    if (!nextFile.exists) {
      alert(`次のファイルが読み込めません。ファイルが無いか、アクセスできない場所にあります。\n\n${nextFile.name}`)
      return;
    }

    continuousPlay(i)
  })
}
</script>

<style scoped>
td {
  vertical-align: middle !important;
}
</style>