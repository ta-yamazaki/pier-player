<template>
  <div class="field has-addons mb-1" style="white-space: nowrap;">
    <p class="control">
      <span class="button is-small is-static field-tag">タイトル</span>
    </p>
    <p class="control is-expanded">
      <input
          v-model="vimeo.title" :readonly="!isBeforeViewing" class="input is-small" placeholder="映像タイトル（任意）"
          type="text">
    </p>
    <p>
      <button
          v-if="isBeforeViewing"
          :class="{'is-loading': isLoading}"
          :disabled="!isPresent(vimeo.playerUrl)"
          class="button is-small is-link is-outlined ml-2 action-btn"
          @click="view()"
      >表示
      </button>
      <button
          v-if="isViewedBeforePlay"
          :class="{'is-loading': isLoading}"
          class="button is-small is-primary ml-2 action-btn"
          @click="play()"
      >再生
      </button>
      <button
          v-if="isPlaying"
          class="button is-small is-danger ml-2 action-btn"
          @click="close()"
      >閉じる
      </button>
    </p>
  </div>
  <div class="is-flex">
    <div class="field has-addons mb-1 is-flex-grow-1">
      <p class="control">
        <span class="button is-small is-static field-tag">URL<small class="required">*</small></span>
      </p>
      <p class="control is-expanded">
        <input
            v-model="vimeo.url"
            :class="{'is-danger': invalidUrl}"
            :readonly="!isBeforeViewing"
            class="input is-small"
            type="url"
            @change="generatePlayerUrl()"
            @keyup="generatePlayerUrl()">
      </p>
    </div>
    <div class="field has-addons mb-1 ml-2">
      <p class="control">
        <span class="button is-small is-static field-tag">パスワード</span>
      </p>
      <p class="control" style="width: 6rem">
        <input
            v-model="vimeo.password" :readonly="!isBeforeViewing" class="input is-small"
            type="text">
      </p>
    </div>
  </div>
  <small
      v-if="invalidUrl"
      class="has-text-danger">URLの形式が正しくありません</small>
</template>

<script lang="ts" setup>
import {ref, toRef} from "vue"
import type {VimeoItem} from "~/types/models";

/**
 * emits
 */
// 1つめにイベント名, ２つ目にemitする値の型
type Emits = {
  (event: "view"): void;
};
const emit = defineEmits<Emits>();

/**
 * Props
 */
interface Props {
  vimeo: VimeoItem;
}

const props = defineProps<Props>();

/**
 * state
 */
const isLoading = ref(false)
// 親のリストと同一オブジェクトを共有し、変更は親のdeep watchで永続化される
const vimeo = toRef(props, 'vimeo')

const vimeoApi = window.vimeoApi
const {notifyError} = useNotification()

/**
 * computed
 */
const isBeforeViewing = computed(() => !vimeo.value.isViewed && !vimeo.value.isPlaying)
const isViewedBeforePlay = computed(() => vimeo.value.isViewed && !vimeo.value.isPlaying)
const isPlaying = computed(() => vimeo.value.isPlaying)
const invalidUrl = computed(() => isPresent(vimeo.value.url) && !isPresent(vimeo.value.playerUrl))

/**
 * methods
 */
const view = async () => {
  emit("view")
  isLoading.value = true
  const opened = await vimeoApi.openVimeo(toRaw(vimeo.value.playerUrl), toRaw(vimeo.value.password))
  if (opened) vimeo.value.isViewed = true
  else notifyError("Vimeo映像の表示に失敗しました。URLやパスワードが間違っている可能性があります。")
  isLoading.value = false
}

const play = () => {
  vimeoApi.playVimeo()
  vimeo.value.isPlaying = true
}

const close = () => {
  vimeoApi.closeVimeo()
  vimeo.value.isViewed = false
  vimeo.value.isPlaying = false
}

const generatePlayerUrl = () => {
  const url = vimeo.value.url
  if (!url) return (vimeo.value.playerUrl = "")

  // https://vimeo.com/[videoId] または https://vimeo.com/[videoId]?share=copy
  const match = url.match(/^https:\/\/vimeo\.com\/(.+)/)
  if (!match) return (vimeo.value.playerUrl = "")

  const videoId = match[1].replace(/\?.*$/, "")
  vimeo.value.playerUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&badge=0&portrait=0&preload=auto`
}
</script>

<style scoped>
.action-btn {
  width: 5rem;
}
</style>