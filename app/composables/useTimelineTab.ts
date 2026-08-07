import {ref} from 'vue'

// タイムラインで選択中のタブID
// 履歴ページとの行き来でも選択を保つため、モジュールスコープで共有する
const selectedTabId = ref("")

export function useTimelineTab() {
  return {selectedTabId}
}
