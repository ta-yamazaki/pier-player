<template>
  <div class="page-shell">
    <header class="page-head">
      <h1 class="page-title">タイムライン履歴</h1>
    </header>
    <NuxtLink class="is-size-7" to="/timeline">← 戻る</NuxtLink>
    <TimelineHistoryList v-if="tab" :tab="tab"/>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import type {TimelineTab} from '~/types/models'

// 追加先はタイムラインで選択中のタブ（直接開かれた場合は先頭のタブ）
const {selectedTabId} = useTimelineTab()
const tab = ref<TimelineTab | null>(null)

onMounted(async () => {
  const tabs: TimelineTab[] = await window.timelineApi.getTabs()
  tab.value = tabs.find(t => t.id === selectedTabId.value) ?? tabs[0]!
})
</script>

<style scoped>
</style>
