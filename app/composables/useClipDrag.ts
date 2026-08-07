import {ref, type Ref} from 'vue'
import {pxToSec, snapSec} from '~/utils/clip'

export interface ClipDragOptions {
  // 全尺座標の秒をハンドル固有の値（例: 終端からの距離）に変換しクランプする
  toValue: (rawSec: number) => number
  // ドラッグ中のプレビュー表示（file には書かない）
  onPreview: (value: number) => void
  // pointerup で確定した値を file に書き込む
  onCommit: (value: number) => void
}

/**
 * クリップストリップのハンドルドラッグ（px→秒変換）
 * ドラッグ中はプレビューのみ更新し、pointerup で初めて commit する。
 * （file への書き込みは deep watch 経由で storeHistory/storeFiles のディスク書込を
 *   起こすため、pointermove 毎に書いてはいけない）
 * @param bodyRef px⇔秒変換の基準となる要素
 * @param duration メディア実尺（未確定なら null でドラッグ不可）
 */
export function useClipDrag(bodyRef: Ref<HTMLElement | null>, duration: Ref<number | null>) {
  // ドラッグ中のハンドルキー（数値入力欄のハイライトに使う）
  const activeKey = ref<string | null>(null)

  function startDrag(e: PointerEvent, key: string, opts: ClipDragOptions) {
    if (!bodyRef.value || !duration.value) return
    e.preventDefault()

    const handleEl = e.currentTarget as HTMLElement
    const dur = duration.value
    activeKey.value = key
    let lastValue: number | null = null

    const toDragValue = (ev: PointerEvent) => {
      const rect = bodyRef.value!.getBoundingClientRect()
      return opts.toValue(snapSec(pxToSec(ev.clientX, rect, dur)))
    }

    const onMove = (ev: PointerEvent) => {
      lastValue = toDragValue(ev)
      opts.onPreview(lastValue)
    }

    const onUp = () => {
      handleEl.removeEventListener('pointermove', onMove)
      handleEl.removeEventListener('pointerup', onUp)
      handleEl.removeEventListener('pointercancel', onUp)
      activeKey.value = null
      if (lastValue !== null) opts.onCommit(lastValue)
    }

    handleEl.setPointerCapture(e.pointerId)
    handleEl.addEventListener('pointermove', onMove)
    handleEl.addEventListener('pointerup', onUp)
    handleEl.addEventListener('pointercancel', onUp)

    // 押した瞬間の位置もプレビューに反映する
    onMove(e)
  }

  return {activeKey, startDrag}
}
