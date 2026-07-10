<template>
  <div v-if="targetFiles.length > 0" class="box py-1 px-2">
  <table class="table my-2 is-fullwidth">
    <tbody>
    <tr
v-for="(file, i) in targetFiles" :key="file.id"
        :class="{
              'dragging': i === dragIndex,
              'is-live': file.isPlaying
            }">
      <td
:draggable="true"
          class="px-0 fitContent"
          @dragstart="dragStart(i)"
          @dragenter="dragEnter(i)"
          @dragover.prevent
          @dragend="dragEnd()">
        <NuxtIcon name="ic:baseline-drag-indicator" class="m-0 is-draggable drag-handle"/>
      </td>
      <td class="pr-0 py-0">
        <MediaFile :file="file" @play="reset" @preview="preview"/>
      </td>
      <td class="mx-2 fitContent">
        <button class="delete" @click="removeRow(i)"/>
      </td>
    </tr>
    </tbody>
  </table>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import MediaFile from "~/components/file/MediaFile.vue";
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

/**
 * emits
 */
// 1つめにイベント名, ２つ目にemitする値の型
type Emits = {
  (event: "preview", value: any): void;
};
const emit = defineEmits<Emits>();

/**
 * props
 */
interface Props {
  tab: string;
}

const props = defineProps<Props>();

/**
 * state
 */
const filesByTab = ref<Record<string, any[]>>({
  sunday: [],
  wednesday: [],
  other: [],
});

const targetFiles = computed(() => filesByTab.value[props.tab] ?? []);
const {dragIndex, dragStart, dragEnter, dragEnd} = useDragSort(targetFiles);
const api = window.api;

/**
 * lifecycle
 */
onMounted(async () => {
  for (const tab of Object.keys(filesByTab.value)) {
    filesByTab.value[tab] = ensureIds(await api.getFiles(tab));
  }
});

/**
 * methods
 */
function addFile(file: any) {
  targetFiles.value.push({...file, id: newId()})
}

function reset() {
  api.closeSubWindow();
  targetFiles.value.forEach((file) => {
    file.isPlaying = false;
  });
}

const removeRow = (i: number) => {
  api.closeSubWindow();
  targetFiles.value.splice(i, 1);
};

const preview = (file: any) => {
  emit("preview", file)
};

defineExpose({addFile, reset})

/**
 * watch
 */
watch(
    targetFiles,
    (newVal) => {
      api.storeFiles(props.tab, toRaw(newVal));
    },
    {deep: true}
);
</script>

<style scoped>
.enter {
  color: white;
  background-color: powderblue;
}

td {
  vertical-align: middle !important;
}
</style>
