<template>
  <div class="field has-addons" style="white-space: nowrap;">
    <p class="control is-expanded">
      <input type="text"
             v-model="vimeo.title"
             class="input"
             placeholder="映像タイトル（完全一致）">
    </p>
    <p>
      <button v-if="isExists(vimeo.title) && !vimeo.isViewed"
              class="button is-link is-outlined ml-2"
              @click="view()"
              :class="{'is-loading': isLoading}"
      ><b>表示</b></button>
      <button v-if="isViewedBeforePlay"
              class="button is-success ml-2"
              @click="play()"
              :class="{'is-loading': isLoading}"
      ><b>再生</b></button>
      <button v-if="isPlaying"
              class="button is-danger ml-2"
              @click="close()"
      ><b>閉じる</b></button>
    </p>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'

/**
 * emits
 */
type Emits = {
  (event: "view"): void;
};
const emit = defineEmits<Emits>();

/**
 * Props
 */
interface Props {
  vimeo: any,
  showcaseUrlWithPassword: String,
}

const props = defineProps<Props>();

// state
const isLoading = ref(false)
const vimeo = ref(props.vimeo)

// API (Electron preload で expose 済みのやつを参照)
const showcaseApi = window.vimeoShowcase

// init
onMounted(() => {
})

// watchers

// computed
const isViewedBeforePlay = computed(() => vimeo.value.isViewed && !vimeo.value.isPlaying)
const isPlaying = computed(() => vimeo.value.isPlaying)

// methods
const view = () => {
  emit("view")
  isLoading.value = true
  showcaseApi.openVimeoShowcase(toRaw(vimeo.value), unref(props.showcaseUrlWithPassword)).then(() => {
    vimeo.value.isViewed = true
  }).catch((e: any) => {
    alert("ショーケース映像の表示に失敗しました。URLやタイトルが間違っている可能性があります。")
    console.error(e)
  }).finally(() => {
    isLoading.value = false
  })
}

const play = () => {
  showcaseApi.playVimeoShowcase()
  vimeo.value.isPlaying = true
}

const close = () => {
  showcaseApi.closeVimeoShowcase()
  vimeo.value.isViewed = false
  vimeo.value.isPlaying = false
}

const isExists = (v: any) =>
    typeof v !== 'undefined' && v !== null && v !== '' && v !== {}
</script>

<style scoped>
</style>