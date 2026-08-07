<template>
  <div class="clip-strip">

    <!-- タイムルーラー -->
    <div class="clip-ruler">
      <template v-if="duration">
        <span
            v-for="t in ticks"
            :key="t"
            :style="{left: pct(t)}"
            class="clip-tick"
        >{{ minSecColonFrom(t) }}</span>
      </template>
      <span v-else class="clip-loading">尺を読み込み中…</span>
    </div>

    <!-- クリップ本体（px⇔秒変換の基準要素） -->
    <div
        ref="bodyRef"
        :class="{'is-disabled': !duration}"
        class="clip-body"
        @click="onBodyClick"
    >
      <!-- Vトラック（映像フェード） -->
      <div v-if="isVideo" class="clip-track video">
        <svg
            v-if="duration"
            class="clip-fade"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
        >
          <polygon :points="fadeInPoints('startFadeSec')"/>
          <polygon :points="fadeOutPoints('endFadeSec')"/>
        </svg>
        <span class="clip-track-label">V</span>
        <button
            v-if="duration"
            :style="{left: pct(effStart + displayVal('startFadeSec'))}"
            class="clip-fade-knob"
            data-handle
            draggable="false"
            title="映像フェードイン"
            type="button"
            @pointerdown="dragFade($event, 'startFadeSec', 'in')"
        />
        <button
            v-if="duration"
            :style="{left: pct(effEnd - displayVal('endFadeSec'))}"
            class="clip-fade-knob"
            data-handle
            draggable="false"
            title="映像フェードアウト"
            type="button"
            @pointerdown="dragFade($event, 'endFadeSec', 'out')"
        />
      </div>

      <!-- Aトラック（音声フェード、背景に波形） -->
      <div class="clip-track audio">
        <div class="clip-wave">
          <TimelineWaveform
              v-if="waveVisible && waveformPeaksHydrated"
              :key="waveKey"
              :file-path="file.path"
              :height="36"
              :hover="false"
              @ready="onWaveReady"
          />
        </div>
        <svg
            v-if="duration"
            class="clip-fade"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
        >
          <polygon :points="fadeInPoints('startAudioFadeSec')"/>
          <polygon :points="fadeOutPoints('endAudioFadeSec')"/>
        </svg>
        <span class="clip-track-label">A</span>
        <button
            v-if="duration"
            :style="{left: pct(effStart + displayVal('startAudioFadeSec'))}"
            class="clip-fade-knob"
            data-handle
            draggable="false"
            title="音声フェードイン"
            type="button"
            @pointerdown="dragFade($event, 'startAudioFadeSec', 'in')"
        />
        <button
            v-if="duration"
            :style="{left: pct(effEnd - displayVal('endAudioFadeSec'))}"
            class="clip-fade-knob"
            data-handle
            draggable="false"
            title="音声フェードアウト"
            type="button"
            @pointerdown="dragFade($event, 'endAudioFadeSec', 'out')"
        />
      </div>

      <!-- トリムで捨てる領域（両トラックを覆う） -->
      <template v-if="duration">
        <div
            :style="{width: pct(displayVal('startTrimSec'))}"
            class="clip-trim-shade left"
        />
        <div
            :style="{width: pct(displayVal('endTrimSec'))}"
            class="clip-trim-shade right"
        />
        <!-- トリムハンドル（クリップ両端） -->
        <div
            :style="{left: pct(effStart)}"
            class="clip-trim-handle"
            data-handle
            draggable="false"
            title="冒頭カット"
            @pointerdown="dragTrim($event, 'startTrimSec')"
        />
        <div
            :style="{left: pct(effEnd)}"
            class="clip-trim-handle"
            data-handle
            draggable="false"
            title="末尾カット"
            @pointerdown="dragTrim($event, 'endTrimSec')"
        />
        <!-- プレイヘッド -->
        <div
            v-if="file.isPlaying && playheadSec !== null"
            :style="{left: pct(playheadSec)}"
            class="clip-playhead"
        />
      </template>
    </div>

    <!-- 音量・全体時間・波形再取得 -->
    <div class="clip-values">
      <span class="clip-group clip-gain" title="音量（元の音量＝1。ダブルクリックで1に戻す）">
        <NuxtIcon name="mdi:volume-high"/>
        <input
            v-model="file.gain"
            :max="gainMax"
            :min="gainMin"
            :style="{background: sliderBackground()}"
            step="0.1" type="range"
            @dblclick="file.gain = 1">
        <span class="clip-gain-value">{{ file.gain }}</span>
      </span>
      <span class="clip-values-right">
        <span v-if="duration" class="clip-values-total">
          全体 {{ minSecColonFrom(duration) }}（有効 {{ minSecColonFrom(effectiveLen) }}）
        </span>
        <span
            class="is-clickable clip-wave-refresh"
            title="波形を再取得（同じ場所のファイルを差し替えた場合に）"
            @click="refreshWaveform"
        >
          <NuxtIcon name="mdi:refresh"/>
        </span>
      </span>
    </div>

    <!-- 数値入力（ドラッグと併用） -->
    <div class="clip-values">
      <span class="clip-group" title="カット（秒）">
        <NuxtIcon name="mdi:content-cut"/>
        <label>冒頭</label>
        <input
            :class="{'is-dragging': activeKey === 'startTrimSec'}"
            :value="displayVal('startTrimSec')"
            class="input editInput is-small px-1 py-0"
            min="0" step="0.1" title="冒頭カット（秒）" type="number"
            @change="commitInput('startTrimSec', $event)">
        <label>末尾</label>
        <input
            :class="{'is-dragging': activeKey === 'endTrimSec'}"
            :value="displayVal('endTrimSec')"
            class="input editInput is-small px-1 py-0"
            min="0" step="0.1" title="末尾カット（秒）" type="number"
            @change="commitInput('endTrimSec', $event)">
      </span>
      <span v-if="isVideo" class="clip-group" title="映像フェード（秒）">
        <span class="clip-group-label">映像</span>
        <svg class="fade-ico" viewBox="0 0 12 12"><polygon points="0,12 12,12 12,0"/></svg>
        <input
            :class="{'is-dragging': activeKey === 'startFadeSec'}"
            :value="displayVal('startFadeSec')"
            class="input editInput is-small px-1 py-0"
            min="0" step="0.1" title="映像フェードイン（秒）" type="number"
            @change="commitInput('startFadeSec', $event)">
        <svg class="fade-ico" viewBox="0 0 12 12"><polygon points="0,0 0,12 12,12"/></svg>
        <input
            :class="{'is-dragging': activeKey === 'endFadeSec'}"
            :value="displayVal('endFadeSec')"
            class="input editInput is-small px-1 py-0"
            min="0" step="0.1" title="映像フェードアウト（秒）" type="number"
            @change="commitInput('endFadeSec', $event)">
      </span>
      <span class="clip-group" title="音声フェード（秒）">
        <span class="clip-group-label">音声</span>
        <svg class="fade-ico" viewBox="0 0 12 12"><polygon points="0,12 12,12 12,0"/></svg>
        <input
            :class="{'is-dragging': activeKey === 'startAudioFadeSec'}"
            :value="displayVal('startAudioFadeSec')"
            class="input editInput is-small px-1 py-0"
            min="0" step="0.1" title="音声フェードイン（秒）" type="number"
            @change="commitInput('startAudioFadeSec', $event)">
        <svg class="fade-ico" viewBox="0 0 12 12"><polygon points="0,0 0,12 12,12"/></svg>
        <input
            :class="{'is-dragging': activeKey === 'endAudioFadeSec'}"
            :value="displayVal('endAudioFadeSec')"
            class="input editInput is-small px-1 py-0"
            min="0" step="0.1" title="音声フェードアウト（秒）" type="number"
            @change="commitInput('endAudioFadeSec', $event)">
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, onUnmounted, reactive, ref, toRef} from 'vue'
import NuxtIcon from "~/components/icon/NuxtIcon.vue";
import TimelineWaveform from "~/components/timeline/TimelineWaveform.vue";
import type {TimelineFileMeta} from "~/types/models";
import {
  dropWaveformPeaks,
  hydrateWaveformPeaksCache,
  saveWaveformPeaks,
  waveformPeaksCache,
  waveformPeaksHydrated,
} from "~/utils/waveformPeaks";

/**
 * props
 */
interface Props {
  file: TimelineFileMeta,
}

const props = defineProps<Props>();

// 親のリストと同一オブジェクトを共有し、変更は親のdeep watchで永続化・再生反映される
const file = toRef(props, 'file')

type ClipKey =
    'startTrimSec'
    | 'endTrimSec'
    | 'startFadeSec'
    | 'endFadeSec'
    | 'startAudioFadeSec'
    | 'endAudioFadeSec'

const FADE_KEYS: ClipKey[] = ['startFadeSec', 'endFadeSec', 'startAudioFadeSec', 'endAudioFadeSec']

const bodyRef = ref<HTMLElement | null>(null)
const duration = ref<number | null>(null)
const playheadSec = ref<number | null>(null)
// 画面近傍にある間だけ波形をマウントする（画面外ではデコード済みバッファを解放。
// 再表示はTimelineWaveform側のピークキャッシュにより軽い）
const waveVisible = ref(false)
let waveObserver: IntersectionObserver | null = null
// 波形の強制再マウント用（ピークキャッシュ破棄後の再取得）
const waveKey = ref(0)
// HTMLMediaElement メタデータで取得した実尺（キャッシュ差し替え検出の基準）
const probedDuration = ref<number | null>(null)

// ドラッグ中のプレビュー値（fileには書かず、pointerupで初めてcommitする）
const previews = reactive<Record<ClipKey, number | null>>({
  startTrimSec: null,
  endTrimSec: null,
  startFadeSec: null,
  endFadeSec: null,
  startAudioFadeSec: null,
  endAudioFadeSec: null,
})

const gainMin = 0
const gainMax = 3
const timelineApi = window.timelineApi
const {activeKey, startDrag} = useClipDrag(bodyRef, duration)

/* -------------------- ライフサイクル -------------------- */
let unsubscribes: (() => void)[] = []

onMounted(() => {
  // キャッシュ済みの尺で即描画し、メタデータ確定値で上書きする（ファイル差し替え対策）
  const cached = toSec(file.value.durationSec)
  if (cached > 0) duration.value = cached
  hydrateWaveformPeaksCache()
  probeDuration()

  waveObserver = new IntersectionObserver((entries) => {
    waveVisible.value = entries[0]?.isIntersecting ?? true
  }, {rootMargin: '300px 0px'})
  if (bodyRef.value) waveObserver.observe(bodyRef.value)

  unsubscribes = [
    timelineApi.listener.timeupdate((_: unknown, p: { currentTime: number, duration?: number, file?: { path?: string } }) => {
      if (!file.value.isPlaying) return
      if (p.file?.path !== file.value.path) return
      playheadSec.value = p.currentTime
      if (!duration.value && p.duration) setDuration(p.duration)
    }),
  ]
})

onUnmounted(() => {
  unsubscribes.forEach((off) => off())
  unsubscribes = []
  waveObserver?.disconnect()
  waveObserver = null
})

/* -------------------- computed -------------------- */
const isVideo = computed(() => isVideoType(file.value.type))
const ticks = computed(() => duration.value ? rulerTicks(duration.value) : [])

// 有効区間（全尺座標）。ドラッグ中はプレビュー値で描画する
const effStart = computed(() => displayVal('startTrimSec'))
const effEnd = computed(() => (duration.value ?? 0) - displayVal('endTrimSec'))
const effectiveLen = computed(() => Math.max(0, effEnd.value - effStart.value))

/* -------------------- 値の表示と確定 -------------------- */
function displayVal(key: ClipKey): number {
  return previews[key] ?? toSec(file.value[key])
}

function commitValue(key: ClipKey, value: number) {
  file.value[key] = value
  // トリムで有効区間が縮んだ場合、フェードが区間外にはみ出さないよう追従させる
  if (key === 'startTrimSec' || key === 'endTrimSec') reclampFades()
  previews[key] = null
}

function reclampFades() {
  const dur = duration.value
  if (!dur) return
  for (const k of FADE_KEYS) {
    const clamped = clampFade(file.value[k], dur, file.value.startTrimSec, file.value.endTrimSec)
    if (clamped !== toSec(file.value[k])) file.value[k] = clamped
  }
}

function commitInput(key: ClipKey, e: Event) {
  const input = e.target as HTMLInputElement
  const dur = duration.value
  let v = Math.max(0, toSec(input.value))
  if (dur) v = clampFor(key, v, dur)
  commitValue(key, roundSec(v))
  // クランプで値が変わらなかった場合もDOMの表示を確定値に戻す
  input.value = String(displayVal(key))
}

function clampFor(key: ClipKey, v: number, dur: number): number {
  if (key === 'startTrimSec') return clampStartTrim(v, dur, file.value.endTrimSec)
  if (key === 'endTrimSec') return clampEndTrim(v, dur, file.value.startTrimSec)
  return clampFade(v, dur, file.value.startTrimSec, file.value.endTrimSec)
}

/* -------------------- ドラッグ -------------------- */
function dragTrim(e: PointerEvent, key: 'startTrimSec' | 'endTrimSec') {
  startDrag(e, key, {
    toValue: (rawSec) => {
      const dur = duration.value!
      return key === 'startTrimSec'
          ? clampStartTrim(rawSec, dur, file.value.endTrimSec)
          : clampEndTrim(dur - rawSec, dur, file.value.startTrimSec) // 右端は「終端からの距離」
    },
    onPreview: (v) => {
      previews[key] = v
    },
    onCommit: (v) => commitValue(key, v),
  })
}

function dragFade(e: PointerEvent, key: ClipKey, edge: 'in' | 'out') {
  startDrag(e, key, {
    toValue: (rawSec) => {
      const dur = duration.value!
      const sec = edge === 'in'
          ? rawSec - toSec(file.value.startTrimSec)
          : (dur - toSec(file.value.endTrimSec)) - rawSec
      return clampFade(sec, dur, file.value.startTrimSec, file.value.endTrimSec)
    },
    onPreview: (v) => {
      previews[key] = v
    },
    onCommit: (v) => commitValue(key, v),
  })
}

/* -------------------- 描画 -------------------- */
function pct(sec: number): string {
  const dur = duration.value
  if (!dur) return '0%'
  return `${Math.min(Math.max(sec / dur * 100, 0), 100)}%`
}

function xPct(sec: number): number {
  const dur = duration.value
  if (!dur) return 0
  return Math.min(Math.max(sec / dur * 100, 0), 100)
}

// フェードイン: 斜辺（区間左下→フェード終了点上）より外側を塗る三角形
function fadeInPoints(key: ClipKey): string {
  const x0 = xPct(effStart.value)
  const x1 = xPct(effStart.value + displayVal(key))
  return `${x0},100 ${x0},0 ${x1},0`
}

// フェードアウト: 斜辺（フェード開始点上→区間右下）より外側を塗る三角形
function fadeOutPoints(key: ClipKey): string {
  const x2 = xPct(effEnd.value - displayVal(key))
  const x3 = xPct(effEnd.value)
  return `${x2},0 ${x3},0 ${x3},100`
}

/* -------------------- duration取得 -------------------- */
function setDuration(d: number) {
  if (!Number.isFinite(d) || d <= 0) return
  duration.value = d
  // deep watch 経由で electron-store にキャッシュされる
  if (file.value.durationSec !== d) file.value.durationSec = d
}

// 波形デコードの完了を待たず、メタデータのみ読み込んで尺を先に確定する
function probeDuration() {
  const el = document.createElement(isVideo.value ? 'video' : 'audio')
  el.preload = 'metadata'
  el.onloadedmetadata = () => {
    probedDuration.value = el.duration
    validatePeaksCache(el.duration)
    setDuration(el.duration)
    el.removeAttribute('src')
    el.load()
  }
  el.src = file.value.path
}

// 安全弁: 同じパスのままファイルの中身が差し替わっていたら（実尺がキャッシュ時とズレていたら）
// 古いピークを破棄して再デコードさせる
function validatePeaksCache(d: number) {
  hydrateWaveformPeaksCache().then(() => {
    const entry = waveformPeaksCache.get(file.value.path)
    if (!entry) return
    if (entry.mediaDuration != null && Math.abs(entry.mediaDuration - d) > 0.5) {
      refreshWaveform()
    } else if (entry.mediaDuration == null) {
      // 旧形式（実尺未記録）のエントリに実尺を補完する
      saveWaveformPeaks(file.value.path, {...entry, mediaDuration: d})
    }
  })
}

// フォールバック: wavesurfer が算出した尺
function onWaveReady(totalDuration: number) {
  if (!duration.value) setDuration(totalDuration)
  // 新規デコード直後のエントリに実尺を記録する（次回起動時の差し替え検出用）
  const entry = waveformPeaksCache.get(file.value.path)
  if (entry && entry.mediaDuration == null && probedDuration.value != null) {
    saveWaveformPeaks(file.value.path, {...entry, mediaDuration: probedDuration.value})
  }
}

// ピークキャッシュを破棄して波形を再デコードする
function refreshWaveform() {
  dropWaveformPeaks(file.value.path)
  waveKey.value++
}

/* -------------------- 音量 -------------------- */
function sliderBackground() {
  const activeColor = "var(--pp-cyan)"
  const inactiveColor = "hsl(214, 30%, 88%)"
  const ratio = (Number(file.value.gain) - gainMin) / (gainMax - gainMin) * 100
  const barColor = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`

  // 「元の音量＝1」の位置に目盛り線を引く
  const percent = (1 / (gainMax - gainMin)) * 100
  const defaultLine = `
    linear-gradient(to right,
      transparent ${percent - 1}%,
      var(--pp-fog) ${percent}%,
      transparent ${percent + 1}%)
  `
  return `${defaultLine}, ${barColor}`
}

/* -------------------- シーク -------------------- */
function onBodyClick(e: MouseEvent) {
  // ハンドル操作（ドラッグ後のclickはpointer captureによりハンドルがtargetになる）は無視
  if ((e.target as HTMLElement).closest('[data-handle]')) return
  if (!file.value.isPlaying || !duration.value || !bodyRef.value) return
  const sec = pxToSec(e.clientX, bodyRef.value.getBoundingClientRect(), duration.value)
  timelineApi.mainPlayer.seek(sec)
  playheadSec.value = sec
}
</script>
