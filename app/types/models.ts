/**
 * アプリ全体で使うドメイン型
 */

// ファイル再生モードのファイル情報
export interface FileMeta {
  id?: string // リスト行の :key 用（追加・読込時に付与）
  path: string
  name: string
  type: string
  exists: boolean
  isPlaying?: boolean
}

// タイムラインモードのファイル情報（再生調整パラメータ付き）
export interface TimelineFileMeta extends FileMeta {
  startTrimSec: number
  endTrimSec: number
  startFadeSec: number // 映像フェード（ウィンドウopacity）
  endFadeSec: number
  startAudioFadeSec: number // 音声フェード（GainNodeランプ）
  endAudioFadeSec: number
  gain: number
  continuousPlay: boolean
  key: number
  updatedAt?: string | Date
  durationSec?: number // メディア実尺のキャッシュ（クリップストリップ描画用、メタデータ読込時に確定）
}

// CGM映像
export interface CgmItem {
  id?: string
  path: string
  title: string
  isViewed: boolean
  isPlaying: boolean
}

// Vimeo個別動画
export interface VimeoItem {
  id?: string
  url?: string
  playerUrl?: string
  title: string
  password?: string
  isViewed: boolean
  isPlaying: boolean
}

// Vimeoショーケース内の動画
export interface ShowcaseItem {
  id?: string
  title: string
  isViewed: boolean
  isPlaying: boolean
}

// Vimeoショーケース設定
export interface Showcase {
  rawUrl: string
  password: string
}
