import {ref, watch} from 'vue'

/** タイムライン一覧の並べ方（stack=縦積み／columns=横並び） */
export type TimelineLayout = 'stack' | 'columns'

const storageKey = 'timelineLayout'

// 履歴ページとの行き来やページ再訪でも選択を保つため、モジュールスコープで共有する
const layout = ref<TimelineLayout>('stack')
let restored = false

export function useTimelineLayout() {
  // 初回呼び出し時だけ保存値を復元し、以降の変更を保存する
  if (!restored) {
    restored = true
    const stored = localStorage.getItem(storageKey)
    if (stored === 'stack' || stored === 'columns') layout.value = stored
    watch(layout, (value) => localStorage.setItem(storageKey, value))
  }

  function toggle() {
    layout.value = layout.value === 'stack' ? 'columns' : 'stack'
  }

  return {layout, toggle}
}
