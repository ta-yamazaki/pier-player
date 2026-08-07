// クリップストリップ（タイムライン編集UI）の座標変換・クランプの純粋関数群
// 再生側 app/public/timeline/player.html のモデルに合わせる:
//   有効区間 = [startTrimSec, duration - endTrimSec]（全尺座標）
//   フェードはトリム後の有効区間の内側に置かれる

// ドラッグのスナップ刻み（秒）
export const SNAP_SEC = 0.1

// 有効区間の最小幅（秒）。player.html の 0.03s マージンより十分大きくし、
// トリム交差による再生の即終了を防ぐ
export const MIN_EFFECTIVE_SEC = 0.5

// 永続化データに文字列数値が混ざっている可能性があるため、読み取りは必ずこれを通す
export function toSec(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

// 小数誤差を丸めて格納用の値にする（既存 adjust() と同じ精度）
export function roundSec(sec: number): number {
  return Math.round(sec * 1000) / 1000
}

// ドラッグのX座標を全尺座標の秒に変換する
export function pxToSec(clientX: number, rect: { left: number, width: number }, duration: number): number {
  if (rect.width <= 0 || duration <= 0) return 0
  const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
  return ratio * duration
}

// SNAP_SEC 刻みにスナップする
export function snapSec(sec: number): number {
  return Math.round(sec / SNAP_SEC) * SNAP_SEC
}

// 冒頭カット: 0 〜 duration - 末尾カット - 最小有効幅
export function clampStartTrim(v: unknown, duration: number, endTrimSec: unknown): number {
  const max = Math.max(0, duration - toSec(endTrimSec) - MIN_EFFECTIVE_SEC)
  return roundSec(Math.min(Math.max(toSec(v), 0), max))
}

// 末尾カット: 0 〜 duration - 冒頭カット - 最小有効幅
export function clampEndTrim(v: unknown, duration: number, startTrimSec: unknown): number {
  const max = Math.max(0, duration - toSec(startTrimSec) - MIN_EFFECTIVE_SEC)
  return roundSec(Math.min(Math.max(toSec(v), 0), max))
}

// フェード: 0 〜 有効区間長（in/out は独立にクランプ。player.html も独立計算のためモデル一致）
export function clampFade(v: unknown, duration: number, startTrimSec: unknown, endTrimSec: unknown): number {
  const max = Math.max(0, duration - toSec(startTrimSec) - toSec(endTrimSec))
  return roundSec(Math.min(Math.max(toSec(v), 0), max))
}

// ルーラーの目盛り間隔（秒）。ラベルが多すぎず少なすぎない間隔を選ぶ
const RULER_STEPS = [1, 5, 10, 30, 60, 120, 300, 600]

export function rulerStep(duration: number): number {
  const found = RULER_STEPS.find((step) => duration / step <= 8)
  return found ?? RULER_STEPS[RULER_STEPS.length - 1]!
}

// ルーラーの目盛り位置（秒）一覧。0 から duration 未満まで
export function rulerTicks(duration: number): number[] {
  if (duration <= 0) return []
  const step = rulerStep(duration)
  const ticks: number[] = []
  for (let t = 0; t < duration; t += step) ticks.push(t)
  return ticks
}
