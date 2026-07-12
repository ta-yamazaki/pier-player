<template>
  <p v-if="!isReady" style="height: 0">波形読み込み中...</p>
  <div ref="containerRef"/>
</template>

<script lang="ts" setup>
import {ref, watch} from 'vue'
import {useWaveSurfer, useWaveSurferHover} from '@meersagor/wavesurfer-vue'
import {saveWaveformPeaks, waveformPeaksCache} from '~/utils/waveformPeaks'

/**
 * emits
 */
type Emits = {
  (event: "ready", value: number): void;
};
const emit = defineEmits<Emits>();

/**
 * props
 */
interface Props {
  filePath: string,
  height?: number,
  hover?: boolean,
}

const props = withDefaults(defineProps<Props>(), {
  height: 48,
  hover: true,
});

const containerRef = ref<HTMLElement | null>(null)
const cached = waveformPeaksCache.get(props.filePath)

const {waveSurfer, totalDuration, isReady} = useWaveSurfer({
  containerRef,
  options: {
    url: props.filePath,
    ...(cached ? {peaks: cached.peaks, duration: cached.duration} : {}),
    height: props.height,
    barGap: 2,
    waveColor: "#a3b4ca",
    progressColor: "#a3b4ca",
    fillParent: true,
    cursorWidth: 0
  }
})

// クリップストリップではhoverラインがハンドル操作と干渉するため無効化できるようにする
if (props.hover) {
  useWaveSurferHover({
    waveSurfer,
    hoverOptions: {
      labelSize: 16,
      labelBackground: "#ffffff",
      labelColor: "#16283f",
      lineColor: "#0895b0"
    }
  })
}

watch(
    isReady, (isReady) => {
      if (!isReady) return
      // 初回デコード時にピークを保存（1200点程度の数値配列なのでサイズは数KB）
      if (!waveformPeaksCache.has(props.filePath) && waveSurfer.value) {
        saveWaveformPeaks(props.filePath, {
          peaks: waveSurfer.value.exportPeaks({channels: 1, maxLength: 1200, precision: 100}),
          duration: totalDuration.value,
        })
      }
      emit("ready", totalDuration.value)
    }
)

</script>

<style scoped>

</style>