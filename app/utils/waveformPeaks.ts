import {ref} from 'vue'

// 波形ピークキャッシュ。wavesurfer に peaks + duration を渡すと fetch もデコードもしないため、
// 初回デコード以降の波形表示コストがほぼゼロになる。
// メモリ上の Map をプライマリとし、electron-store（timelineWaveformPeaks）に永続化して
// アプリ再起動後も引き継ぐ。

export interface WaveformPeaksEntry {
  peaks: number[][]
  duration: number // wavesurfer がデコードした尺（ピーク描画用）
  mediaDuration?: number // HTMLMediaElement メタデータの実尺（同一パスでの中身差し替え検出用）
}

export const waveformPeaksCache = new Map<string, WaveformPeaksEntry>()

// 永続化ストアからの読込完了フラグ。読込前に波形を生成すると必ずキャッシュミスして
// 全デコードが走るため、これが true になるまで波形コンポーネントをマウントしないこと
export const waveformPeaksHydrated = ref(false)

let hydratePromise: Promise<void> | null = null

// 永続化済みキャッシュをメモリへ読み込む（何度呼んでも1回しか走らない）
export function hydrateWaveformPeaksCache(): Promise<void> {
  if (!hydratePromise) {
    hydratePromise = (async () => {
      try {
        const stored: Map<string, WaveformPeaksEntry> = await window.timelineApi.getWaveformPeaks()
        for (const [path, entry] of stored ?? new Map()) {
          if (!waveformPeaksCache.has(path)) waveformPeaksCache.set(path, entry)
        }
      } catch {
        // 読み込めなくてもメモリキャッシュのみで動作する
      }
      waveformPeaksHydrated.value = true
    })()
  }
  return hydratePromise
}

export function saveWaveformPeaks(path: string, entry: WaveformPeaksEntry) {
  waveformPeaksCache.set(path, entry)
  window.timelineApi.storeWaveformPeaks(path, entry).catch(() => {
    // 永続化に失敗してもメモリキャッシュは有効
  })
}

export function dropWaveformPeaks(path: string) {
  waveformPeaksCache.delete(path)
  window.timelineApi.deleteWaveformPeaks(path).catch(() => {})
}
