<template>
  <div style="margin: auto; width: 95%; max-width: 640px;">
    <h5 class="title is-5 mb-2 pt-3">タイムライン</h5>
    <NuxtLink to="/timeline/history">履歴から追加する ></NuxtLink>
    <FileDropInput multiple @dropped-files="selectFiles"/>

    <button
class="button is-small is-pulled-right mb-3"
            @click="reset()"
    >表示リセット
    </button>
    <TimelineFileList
        ref="timelineFileListRef"
        @change-files="changeFiles"
    />
    <div style="height: var(--timeline-player-heght);"/>
  </div>
</template>

<script setup lang="ts">
import "@/assets/css/timeline.css"
import {ref} from 'vue'
import TimelineFileList from "~/components/timeline/TimelineFileList.vue";
import FileDropInput from "~/components/input/FileDropInput.vue";

const timelineFileListRef = ref<InstanceType<typeof TimelineFileList> | null>(null)

const files = ref<any[]>([])
const timelineApi = window.timelineApi

// ドロップされた順にリストへ追加するため、1件ずつ直列に処理する
async function selectFiles(files: File[]) {
  for (const file of files) {
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
      continuousPlay: true,
      key: 0,
    })

    timelineFileListRef.value?.addRow(checkedFile)
  }
}

function changeFiles(newFiles: any) {
  files.value = [...newFiles]
}

function reset() {
  timelineFileListRef.value?.reset()
}
</script>

<style scoped>
td {
  vertical-align: middle !important;
}
</style>