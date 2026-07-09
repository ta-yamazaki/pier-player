<template>
  <div style="margin: auto; width: 95%; max-width: 640px">
    <h5 class="title is-5 mb-2 pt-3">CGM映像</h5>
    <div class="buttons is-right my-2">
      <button class="button is-small" @click="reset()">表示リセット</button>
    </div>
    <CgmList ref="cgmListRef" @preview="preview"/>
    <button class="button is-primary is-fullwidth" @click="addRow()">
      ＋追加
    </button>

    <br>
    <div v-if="previewCgm.path" style="width: 100%; margin: auto">
      <small class="mt-4 mb-1">映像プレビュー ※再生すると音が出ます</small>
      <h6 class="title is-6 mb-2">{{ previewCgm.title }}</h6>
      <div style="aspect-ratio: 16/9">
        <iframe
:key="videoReload" :src="previewCgm.path"
                width="100%" height="100%"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, onUnmounted, ref} from "vue"
import CgmList from "~/components/cgm/CgmList.vue";

const cgmListRef = ref<InstanceType<typeof CgmList> | null>(null)

// --------------------------------------------------
// state
// --------------------------------------------------
const previewCgm = ref({title: "", path: ""})
const videoReload = ref(0)

const cgmApi = window.cgm
const {notifyError} = useNotification()

// --------------------------------------------------
// lifecycle
// --------------------------------------------------
let offErrorCgmOpen: (() => void) | null = null

onMounted(async () => {
  offErrorCgmOpen = cgmApi.errorCgmOpen(() => {
    notifyError("CGM映像の表示に失敗しました。")
  })
})

onUnmounted(() => {
  offErrorCgmOpen?.()
})

// --------------------------------------------------
// watchers
// --------------------------------------------------


// --------------------------------------------------
// methods
// --------------------------------------------------
function reset() {
  cgmListRef.value?.closeStatusAll()  // 子のメソッドを呼び出す
}

function addRow() {
  cgmListRef.value?.addCgm()  // 子のメソッドを呼び出す
}

function preview(cgm: any) {
  previewCgm.value = cgm
  videoReload.value++
}
</script>


<style scoped>
</style>