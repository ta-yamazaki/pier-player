<template>
  <div class="field has-addons mb-1" style="white-space: nowrap;">
    <p class="control">
      <span class="button is-small is-static field-tag">タイトル</span>
    </p>
    <p class="control is-expanded">
      <input v-model="cgm.title" class="input is-small" placeholder="映像タイトル（任意）" type="text">
    </p>
    <button
        v-if="cgmPathExists && !cgm.isViewed"
        :class="isLoading ? 'is-loading' : ''"
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
  </div>
  <div class="field has-addons">
    <p class="control">
      <span class="button is-small is-static field-tag">URL</span>
    </p>
    <p class="control is-expanded">
      <input v-model="cgm.path" class="input is-small" placeholder="CGM映像URL" type="url">
    </p>
    <p v-if="cgmPathExists">
      <button class="button is-small ml-2 action-btn" @click="preview()">プレビュー</button>
    </p>
  </div>
</template>

<script lang="ts" setup>
import {ref, toRef} from "vue"
import type {CgmItem} from "~/types/models";

/**
 * emits
 */
const emit = defineEmits<{
  view: [];
  preview: [];
}>();

/**
 * Props
 */
interface Props {
  cgm: CgmItem;
}

const props = defineProps<Props>();

// --------------------------------------------------
// state
// --------------------------------------------------
const isLoading = ref(false)
// 親のリストと同一オブジェクトを共有し、変更は親のdeep watchで永続化される
const cgm = toRef(props, 'cgm')

const cgmApi = window.cgmApi

// --------------------------------------------------
// computed
// --------------------------------------------------
const isViewedBeforePlay = computed(() => cgm.value.isViewed && !cgm.value.isPlaying)
const isPlaying = computed(() => cgm.value.isPlaying)
const cgmPathExists = computed(() => isPresent(cgm.value.path))

// --------------------------------------------------
// methods
// --------------------------------------------------
function view() {
  emit("view")
  isLoading.value = true
  cgmApi.openCgm(toRaw(cgm.value)).then(() => {
    cgm.value.isViewed = true
    isLoading.value = false
  })
}

function play() {
  cgmApi.playCgm()
  cgm.value.isPlaying = true
}

function close() {
  cgmApi.closeCgm()
  cgm.value.isViewed = false
  cgm.value.isPlaying = false
}

function preview() {
  emit("preview")
}
</script>


<style scoped>
.control input {
  min-width: 15rem
}

.action-btn {
  width: 5rem;
}
</style>