<template>
  <div :class="{'is-wide': layout === 'columns'}" class="page-shell">
    <header class="page-head">
      <h1 class="page-title">タイムライン</h1>
      <div class="is-flex is-align-items-center is-gap-2">
        <div class="buttons has-addons mb-0">
          <button
              :class="{'is-primary is-selected': layout === 'stack'}"
              class="button is-small"
              title="縦に積んで表示"
              @click="layout = 'stack'">縦
          </button>
          <button
              :class="{'is-primary is-selected': layout === 'columns'}"
              class="button is-small"
              title="横に並べて表示"
              @click="layout = 'columns'">横
          </button>
        </div>
        <button class="button is-small" @click="reset()">表示リセット</button>
      </div>
    </header>

    <TimelineTabs v-model="selectedTabId"/>

    <div class="mb-2">
      <NuxtLink class="is-size-7" to="/timeline/history">履歴から追加 →</NuxtLink>
    </div>
    <FileDropInput multiple @dropped-files="selectFiles"/>

    <div class="mt-3">
      <TimelineFileList
          v-if="selectedTabId"
          ref="timelineFileListRef"
          :key="selectedTabId"
          :layout="layout"
          :tab-id="selectedTabId"
          @change-files="changeFiles"
      />
    </div>

    <!-- リストが長いとヘッダーの設定まで戻れないので、一番下でも切り替え・リセットできるようにする -->
    <div class="is-flex is-flex-direction-column is-align-items-flex-end is-gap-2 mt-3">
      <label class="checkbox is-size-7" title="再生が終わったあと、デスクトップを見せずに黒画面のまま残します">
        <input v-model="blackout" type="checkbox">
        終了後は黒画面
      </label>
      <button class="button is-small" title="再生を止めて、残っている黒画面も閉じます" @click="reset()">表示リセット</button>
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
const {layout} = useTimelineLayout()
const {blackout} = useTimelineBlackout()
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