<template>
  <div class="field has-addons mb-1" style="white-space: nowrap;">
    <p class="control">
      <a class="button is-small label is-light"
         :class="{'is-primary': isViewedBeforePlay, 'is-danger': isPlaying}"
      >タイトル</a>
    </p>
    <p class="control is-expanded">
      <input type="text" v-model="cgm.title" class="input is-small" placeholder="映像タイトル（任意）">
    </p>
    <button v-if="cgmPathExists && !cgm.isViewed"
            class="button is-small is-link is-outlined ml-2"
            @click="view()"
            :class="isLoading ? 'is-loading' : ''"
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
  </div>
  <div class="field has-addons">
    <p class="control">
      <a class="button is-small label is-light"
         :class="{'is-primary': isViewedBeforePlay, 'is-danger': isPlaying}"
      >URL</a>
    </p>
    <p class="control is-expanded">
      <input type="url" v-model="cgm.path" class="input is-small" placeholder="CGM映像URL">
    </p>
    <p v-if="cgmPathExists">
      <button class="button is-small ml-2" @click="preview()">プレビュー</button>
    </p>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue"

/**
 * emits
 */
// 1つめにイベント名, ２つ目にemitする値の型
type Emits = {
  (event: "view"): void;
  (event: "preview"): void;
};
const emit = defineEmits<Emits>();

/**
 * Props
 */
interface Props {
  cgm: any;
}

const props = defineProps<Props>();

// --------------------------------------------------
// state
// --------------------------------------------------
const isLoading = ref(false)
const cgm = ref(props.cgm)

const cgmApi = window.cgm

// --------------------------------------------------
// computed
// --------------------------------------------------
const isViewedBeforePlay = computed(() => cgm.value.isViewed && !cgm.value.isPlaying)
const isPlaying = computed(() => cgm.value.isPlaying)
const cgmPathExists = computed(() => isExists(cgm.value.path))

// --------------------------------------------------
// lifecycle
// --------------------------------------------------
onMounted(async () => {
})

// --------------------------------------------------
// watchers
// --------------------------------------------------

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

function isExists(v: any) {
  return v !== undefined && v !== null && v !== "" && v !== {}
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