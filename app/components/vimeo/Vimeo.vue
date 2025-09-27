<template>
  <div class="field has-addons mb-1" style="white-space: nowrap;">
    <p class="control">
      <a class="button is-small label is-light"
         :class="{'is-primary': isViewedBeforePlay, 'is-danger': isPlaying}"
      >タイトル</a>
    </p>
    <p class="control is-expanded">
      <input type="text" v-model="vimeo.title" class="input is-small" placeholder="映像タイトル（任意）"
             :readonly="!isBeforeViewing">
    </p>
    <p>
      <button v-if="isBeforeViewing"
              class="button is-small is-link is-outlined ml-2"
              @click="view()"
              :class="{'is-loading': isLoading}"
              :disabled="!isExists(vimeo.playerUrl)"
      ><b>表示</b></button>
      <button v-if="isViewedBeforePlay"
              class="button is-small is-primary ml-2"
              @click="play()"
              :class="{'is-loading': isLoading}"
      ><b>再生</b></button>
      <button v-if="isPlaying"
              class="button is-small is-danger ml-2"
              @click="close()"
      ><b>閉じる</b></button>
    </p>
  </div>
  {{ vimeo.titleFromUrl }}
  <div class="is-flex">
    <div class="field has-addons mb-1 is-flex-grow-1">
      <p class="control">
        <a class="button is-small label is-light"
           :class="{'is-primary': isViewedBeforePlay, 'is-danger': isPlaying}"
        >URL<small class="required">*</small></a>
      </p>
      <p class="control is-expanded">
        <input type="url"
               v-model="vimeo.url"
               class="input is-small"
               :class="{'is-danger': invalidUrl}"
               :readonly="!isBeforeViewing"
               @keyup="generatePlayerUrl()"
               @change="generatePlayerUrl()">
      </p>
    </div>
    <div class="field has-addons mb-1 ml-2">
      <p class="control">
        <a class="button is-small label is-light"
           :class="{'is-primary': isViewedBeforePlay, 'is-danger': isPlaying}"
        >パスワード</a>
      </p>
      <p class="control" style="width: 6rem">
        <input type="text" v-model="vimeo.password" class="input is-small"
               :readonly="!isBeforeViewing">
      </p>
    </div>
  </div>
  <small v-if="invalidUrl"
         class="has-text-danger">URLの形式が正しくありません</small>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue"

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
  vimeo: any;
}

const props = defineProps<Props>();

/**
 * state
 */
const isLoading = ref(false)
const vimeo = ref(props.vimeo)

const vimeoApi = window.vimeo

/**
 * computed
 */
const isBeforeViewing = computed(() => !vimeo.value.isViewed && !vimeo.value.isPlaying)
const isViewedBeforePlay = computed(() => vimeo.value.isViewed && !vimeo.value.isPlaying)
const isPlaying = computed(() => vimeo.value.isPlaying)
const invalidUrl = computed(() => isExists(vimeo.value.url) && !isExists(vimeo.value.playerUrl))

/**
 * lifecycle
 */
onMounted(async () => {
})

/**
 * watch
 */

/**
 * methods
 */
const view = async () => {
  emit("view")
  isLoading.value = true
  await vimeoApi.openVimeo(toRaw(vimeo.value.playerUrl), toRaw(vimeo.value.password))
  vimeo.value.isViewed = true
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

const isExists = (v: any) =>
    typeof v !== "undefined" && v !== null && v !== "" && v !== {}

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
.control a.label {
  width: 5rem;
  cursor: unset;
}

.control button.label {
  cursor: unset;
}
</style>