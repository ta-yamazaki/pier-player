<template>
  <div v-if="cgmList.length > 0" class="box py-1 px-2">
    <table class="table mb-2 is-fullwidth">
      <tbody>
      <tr class="is-size-7" style="white-space: nowrap;">
        <td colspan="3">
          <small>※表示に少し時間がかかる場合があります。</small>
        </td>
      </tr>
      <tr v-for="(cgm, i) in cgmList" :key="cgm"
          :class="{
              'dragging': i === dragIndex,
              'has-background-success-light': isViewedBeforePlay(cgm),
              'has-background-danger-light': isPlaying(cgm)
            }">
        <td :draggable="true"
            @dragstart="dragStart(i)"
            @dragenter="dragEnter(i)"
            @dragover.prevent
            @dragend="dragEnd()"
            style="width: min-content; white-space: nowrap; vertical-align: middle"
            class="px-0 is-draggable">
          <NuxtIcon name="ic:baseline-drag-indicator" class="m-0"/>
        </td>
        <td>
          <Cgm
              :cgm="cgm"
              @preview="preview(cgm)"
              @view="closeStatusAll()"
          />
        </td>
        <td class="pl-0 pr-1" style="width: 1rem; vertical-align: middle">
          <button class="delete" @click="removeRow(i)"></button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue"
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

// --------------------------------------------------
// state
// --------------------------------------------------
const cgmList = ref<any[]>([])
const dragIndex = ref(null);
const cgmApi = window.cgm

/**
 * emits
 */
// 1つめにイベント名, ２つ目にemitする値の型
type Emits = {
  (event: "preview", value: any): void;
};
const emit = defineEmits<Emits>();

// --------------------------------------------------
// lifecycle
// --------------------------------------------------
onMounted(async () => {
  cgmList.value = await cgmApi.getCgmList()

  cgmApi.errorCgmOpen(() => {
    alert("CGM映像の表示に失敗しました。")
  })
})

// --------------------------------------------------
// watchers
// --------------------------------------------------
watch(
    cgmList,
    (newVal) => {
      cgmApi.storeCgmList(toRaw(newVal))
    },
    {deep: true}
)

// --------------------------------------------------
// methods
// --------------------------------------------------
function isViewedBeforePlay(cgm: any) {
  return cgm.isViewed && !cgm.isPlaying
}

function isPlaying(cgm: any) {
  return cgm.isPlaying
}

function closeStatusAll() {
  cgmApi.closeCgm()
  cgmList.value.forEach((cgm) => {
    cgm.isViewed = false
    cgm.isPlaying = false
  })
}

function addCgm() {
  cgmList.value.push({
    path: "",
    title: "",
    isViewed: false,
    isPlaying: false,
  })
}

function removeRow(i: number) {
  cgmApi.closeCgm()
  cgmList.value.splice(i, 1)
}

function preview(cgm: any) {
  emit("preview", cgm)
}

function storeFileInfo() {
  cgmApi.storeCgmList(cgmList.value)
}

const dragStart = (index) => (dragIndex.value = index);
const dragEnter = (index) => {
  if (index === dragIndex.value) return;
  const deleteElement = cgmList.value.splice(dragIndex.value, 1)[0];
  cgmList.value.splice(index, 0, deleteElement);
  dragIndex.value = index;
};
const dragEnd = () => (dragIndex.value = null);

function isExists(v: any) {
  return v !== undefined && v !== null && v !== "" && v !== {}
}

defineExpose({addCgm, closeStatusAll})
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