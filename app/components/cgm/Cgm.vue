<template>
  <div class="field has-addons mb-1" style="white-space: nowrap;">
    <p class="control">
      <a
class="button is-small label is-light"
         :class="{'is-primary': isViewedBeforePlay, 'is-danger': isPlaying}"
      >タイトル</a>
    </p>
    <p class="control is-expanded">
      <input v-model="cgm.title" type="text" class="input is-small" placeholder="映像タイトル（任意）">
    </p>
    <button
v-if="cgmPathExists && !cgm.isViewed"
            class="button is-small is-link is-outlined ml-2"
            :class="isLoading ? 'is-loading' : ''"
            @click="view()"
    ><b>表示</b></button>
    <button
v-if="isViewedBeforePlay"
            class="button is-small is-primary ml-2"
            :class="{'is-loading': isLoading}"
            @click="play()"
    ><b>再生</b></button>
    <button
v-if="isPlaying"
            class="button is-small is-danger ml-2"
            @click="close()"
    ><b>閉じる</b></button>
  </div>
  <div class="field has-addons">
    <p class="control">
      <a
class="button is-small label is-light"
         :class="{'is-primary': isViewedBeforePlay, 'is-danger': isPlaying}"
      >URL</a>
    </p>
    <p class="control is-expanded">
      <input v-model="cgm.path" type="url" class="input is-small" placeholder="CGM映像URL">
    </p>
    <p v-if="cgmPathExists">
      <button class="button is-small ml-2" @click="preview()">プレビュー</button>
    </p>
  </div>
</template>

<script setup lang="ts">
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

const cgmApi = window.cgm

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
.control a.label {
  width: 5rem;
  cursor: unset;
}

.control input {
  min-width: 15rem
}

.field button {
  width: 5rem !important;
}
</style>