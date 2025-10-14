<template>
  <p v-if="!isReady" style="height: 0">波形読み込み中...</p>
  <div ref="containerRef"></div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
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
    waveColor: "gray",
    progressColor: "gray",
    fillParent: true,
    cursorWidth: 0
  }
})

const {hoverPlugin} = useWaveSurferHover({
  waveSurfer,
  hoverOptions: {
    labelSize: 16,
    labelBackground: "whitesmoke"
  }
})

/* -------------------- ライフサイクル -------------------- */
onMounted(() => {
})

// --------------------------------------------------
// watchers
// --------------------------------------------------
watch(
    isReady, (isReady) => {
      if (isReady) emit("ready", totalDuration.value)
    }
)

</script>

<style scoped>

</style>