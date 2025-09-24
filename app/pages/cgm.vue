<template>
  <div style="margin: auto; width: 95%; max-width: 640px">
    <h5 class="title is-5 mb-1 mt-3">
      CGM映像
      <button class="button is-small is-pulled-right"
              @click="reset()"
      >表示リセット
      </button>
    </h5>
    <CgmList ref="cgmListRef" @preview="preview"/>
    <button class="button is-link is-outlined is-fullwidth mt-5"
            @click="addRow()">
      ＋追加
    </button>

    <br><br>
    <div style="width: 100%;">
      <p class="mt-4 mb-1">映像プレビュー ※再生すると音が出ます</p>
      <div class="box" style="width: 100%; background-color: whitesmoke; aspect-ratio: 16/9">
        <h6 class="title is-6 mb-2">{{ previewCgm.title }}</h6>
        <iframe :src="previewCgm.path" :key="videoReload"
                width="100%" height="100%"></iframe>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue"
import CgmList from "~/components/cgm/CgmList.vue";

const cgmListRef = ref<InstanceType<typeof CgmList> | null>(null)

// --------------------------------------------------
// state
// --------------------------------------------------
const previewCgm = ref({title: "", path: ""})
const videoReload = ref(0)

const cgmApi = window.cgm

// --------------------------------------------------
// lifecycle
// --------------------------------------------------
onMounted(async () => {
  cgmApi.errorCgmOpen(() => {
    alert("CGM映像の表示に失敗しました。")
  })
})

// --------------------------------------------------
// watchers
// --------------------------------------------------


// --------------------------------------------------
// methods
// --------------------------------------------------
function closeStatusAll() {
  cgmApi.closeCgm()
}

function reset() {
  closeStatusAll()
  cgmListRef.value?.closeStatusAll()  // 子のメソッドを呼び出す
}

function addRow() {
  cgmListRef.value?.addCgm()  // 子のメソッドを呼び出す
}

function preview(cgm: any) {
  previewCgm.value = cgm
  videoReload.value++
}

function storeFileInfo() {
  cgmApi.storeCgmList(cgmList.value)
}

function isExists(v: any) {
  return v !== undefined && v !== null && v !== "" && v !== {}
}
</script>


<style scoped>
</style>