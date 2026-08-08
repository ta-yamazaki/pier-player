import {ref, watch} from 'vue'

const storageKey = 'timelineBlackout'

// 再生終了後に黒画面ウィンドウを残すか（既定: 残す）
// ページを行き来しても設定を保つため、モジュールスコープで共有する
const blackout = ref(true)
let restored = false

export function useTimelineBlackout() {
  // 初回呼び出し時だけ保存値を復元し、以降の変更を保存する
  if (!restored) {
    restored = true
    const stored = localStorage.getItem(storageKey)
    if (stored === 'true' || stored === 'false') blackout.value = stored === 'true'
    watch(blackout, (value) => localStorage.setItem(storageKey, String(value)))
  }

  return {blackout}
}
