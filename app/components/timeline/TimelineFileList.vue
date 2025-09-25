<template>
  <table v-if="files.length > 0"
         class="table my-2 is-fullwidth borderless"
         style="background-color: transparent">
    <tbody>
    <tr v-for="(file, i) in files"
        :key="file"
        :class="{'dragging': i === dragIndex}">
      <td :draggable="!playerMeta.isPlaying"
          @dragstart="dragStart(i)"
          @dragenter="dragEnter(i)"
          @dragover.prevent
          @dragend="dragEnd()"
          class="pl-1 pr-0 fitContent"
          style="white-space: nowrap;">
        <NuxtIcon name="ic:baseline-drag-indicator" class="m-0 is-draggable"/>
      </td>
      <td class="p-1" style="font-size: 0.9rem; overflow-x: auto;">
        <TimelineFile
            :file="file"
            @mediaStart="mediaStart(i)"
            @mediaClose="mediaClose"
            :isLast="i === files.length - 1"
        />
      </td>
      <td class="mx-0 px-1 fitContent">
        <button class="delete" @click="removeRow(i)"></button>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

/**
 * emits
 */
type Emits = {
  (event: "changeFiles", value: any): void;
  (event: "mediaStart", value: any): void;
  (event: "mediaClose"): void;
};
const emit = defineEmits<Emits>();

/**
 * props
 */
interface Props {
  playerMeta: {
    selectedFilename: string,
    currentTime: number,
    duration: number | null,
    loadedmetadata: false,
    isPlaying: false,
    seeking: false,
    iconColor: "rgb(9, 150, 175)",
  };
}

const props = defineProps<Props>();

const files = ref<any[]>([])
const dragIndex = ref<number | null>(null)
const timelineApi = window.timeline

/* -------------------- ライフサイクル -------------------- */
onMounted(async () => {
  files.value = await timelineApi.getFiles()
})

watch(files, (newFiles) => {
  emit("changeFiles", newFiles)
  timelineApi.storeFiles(toRaw(newFiles))
}, {deep: true})

/* -------------------- computed -------------------- */


/* -------------------- 再生関連 -------------------- */
function mediaStart(i) {
  reset()
  emit("mediaStart", files.value[i])
}

function mediaClose() {
  emit("mediaClose")
}

function reset() {
  timelineApi.closeSubWindow()
  files.value.forEach(f => f.isPlaying = false)
}

function addRow(file) {
  files.value.push(file)
}

function removeRow(i: number) {
  files.value.splice(i, 1)
}

/* -------------------- DnD -------------------- */
function dragStart(i: number) {
  if (props.playerMeta.isPlaying) return alert("再生中は順番を変えられません")
  dragIndex.value = i
}

function dragEnter(i: number) {
  if (props.playerMeta.isPlaying) return alert("再生中は順番を変えられません")
  if (i === dragIndex.value) return
  const el = files.value.splice(dragIndex.value!, 1)[0]
  files.value.splice(i, 0, el)
  dragIndex.value = i
}

function dragEnd() {
  dragIndex.value = null
}

defineExpose({addRow, reset})
</script>

<style scoped>
td {
  vertical-align: middle !important;
}
</style>