<template>
  <div class="page-shell">
    <header class="page-head">
      <h1 class="page-title">タイムライン</h1>
      <button class="button is-small" @click="reset()">表示リセット</button>
    </header>

    <TimelineTabs v-model="selectedTabId"/>

    <div class="mb-2">
      <NuxtLink class="is-size-7" to="/timeline/history">履歴から追加する →</NuxtLink>
    </div>
    <FileDropInput multiple @dropped-files="selectFiles"/>

    <div class="mt-3">
      <TimelineFileList
          v-if="selectedTabId"
          ref="timelineFileListRef"
          :key="selectedTabId"
          :tab-id="selectedTabId"
          @change-files="changeFiles"
      />
    </div>
    <div style="height: var(--timeline-player-heght);"/>
  </div>
</template>

<script lang="ts" setup>
import "@/assets/css/timeline.css"
import {ref, watch} from 'vue'
import TimelineFileList from "~/components/timeline/TimelineFileList.vue";
import TimelineTabs from "~/components/timeline/TimelineTabs.vue";
import FileDropInput from "~/components/input/FileDropInput.vue";

const timelineFileListRef = ref<InstanceType<typeof TimelineFileList> | null>(null)

const {selectedTabId} = useTimelineTab()
const files = ref<any[]>([])
const timelineApi = window.timelineApi

// タブを切り替える前に、いま再生中のものを止めておく
watch(selectedTabId, () => timelineFileListRef.value?.reset(), {flush: 'sync'})

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
      startAudioFadeSec: 0,
      endAudioFadeSec: 0,
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