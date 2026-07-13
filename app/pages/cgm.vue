<template>
  <div class="page-shell">
    <header class="page-head">
      <h1 class="page-title">CGM映像</h1>
      <button class="button is-small" @click="reset()">表示リセット</button>
    </header>

    <CgmList ref="cgmListRef" @preview="preview"/>
    <button class="button is-add is-fullwidth mt-4" @click="addRow()">
      ＋ 追加
    </button>

    <section v-if="previewCgm.path" class="mt-6">
      <p class="eyebrow">Preview</p>
      <h2 class="preview-title">{{ previewCgm.title }}</h2>
      <div class="preview-frame" style="aspect-ratio: 16/9">
        <iframe
            :key="videoReload" :src="previewCgm.path"
            height="100%" width="100%"/>
      </div>
      <p class="note mt-2">※プレビューを再生すると音が出ます。</p>
    </section>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from "vue"
import CgmList from "~/components/cgm/CgmList.vue";

const cgmListRef = ref<InstanceType<typeof CgmList> | null>(null)

// --------------------------------------------------
// state
// --------------------------------------------------
const previewCgm = ref({title: "", path: ""})
const videoReload = ref(0)

const cgmApi = window.cgmApi
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