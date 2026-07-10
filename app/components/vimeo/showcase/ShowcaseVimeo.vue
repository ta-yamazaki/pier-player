<template>
  <div class="field has-addons" style="white-space: nowrap;">
    <p class="control is-expanded">
      <input
v-model="vimeo.title"
             type="text"
             class="input"
             placeholder="映像タイトル（完全一致）">
    </p>
    <p>
      <button
v-if="isPresent(vimeo.title) && !vimeo.isViewed"
              class="button is-link is-outlined ml-2 action-btn"
              :class="{'is-loading': isLoading}"
              @click="view()"
      >表示</button>
      <button
v-if="isViewedBeforePlay"
              class="button is-primary ml-2 action-btn"
              :class="{'is-loading': isLoading}"
              @click="play()"
      >再生</button>
      <button
v-if="isPlaying"
              class="button is-danger ml-2 action-btn"
              @click="close()"
      >閉じる</button>
    </p>
  </div>
</template>

<script setup lang="ts">
import {ref, toRef} from 'vue'
import type {ShowcaseItem} from "~/types/models";

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
  vimeo: ShowcaseItem,
  showcaseUrlWithPassword: string,
}

const props = defineProps<Props>();

// state
const isLoading = ref(false)
// 親のリストと同一オブジェクトを共有し、変更は親のdeep watchで永続化される
const vimeo = toRef(props, 'vimeo')

// API (Electron preload で expose 済みのやつを参照)
const showcaseApi = window.showcaseApi
const {notifyError} = useNotification()

// computed
const isViewedBeforePlay = computed(() => vimeo.value.isViewed && !vimeo.value.isPlaying)
const isPlaying = computed(() => vimeo.value.isPlaying)

// methods
const view = () => {
  emit("view")
  isLoading.value = true
  showcaseApi.openVimeoShowcase(toRaw(vimeo.value), unref(props.showcaseUrlWithPassword)).then((opened: boolean) => {
    if (opened) vimeo.value.isViewed = true
    else notifyError("ショーケース映像の表示に失敗しました。URLやタイトルが間違っている可能性があります。")
  }).catch((e: any) => {
    notifyError("ショーケース映像の表示に失敗しました。URLやタイトルが間違っている可能性があります。")
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
</script>

<style scoped>
.action-btn {
  width: 5rem;
}
</style>