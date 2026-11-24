import {ref} from 'vue'

// Vimeoショーケースで選択中のタブID
// 個別映像ページなどとの行き来でも選択を保つため、モジュールスコープで共有する
const selectedTabId = ref("")

export function useShowcaseTab() {
  return {selectedTabId}
}
