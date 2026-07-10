<template>
  <p v-if="!isReady" style="height: 0">波形読み込み中...</p>
  <div ref="containerRef"/>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import {useWaveSurfer, useWaveSurferHover} from '@meersagor/wavesurfer-vue'

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
}

const props = defineProps<Props>();

const containerRef = ref<HTMLElement | null>(null)

const {waveSurfer, totalDuration, isReady} = useWaveSurfer({
  containerRef,
  options: {
    url: props.filePath,
    height: 48,
    barGap: 2,
    waveColor: "#a3b4ca",
    progressColor: "#a3b4ca",
    fillParent: true,
    cursorWidth: 0
  }
})

useWaveSurferHover({
  waveSurfer,
  hoverOptions: {
    labelSize: 16,
    labelBackground: "#ffffff",
    labelColor: "#16283f",
    lineColor: "#0895b0"
  }
})

watch(
    isReady, (isReady) => {
      if (isReady) emit("ready", totalDuration.value)
    }
)

</script>

<style scoped>

</style>