<template>
  <table class="table my-2 is-fullwidth">
    <tbody>
    <tr v-for="(file, i) in targetFiles" :key="file"
        :class="{
              'dragging': i === dragIndex,
              'has-background-success-light has-text-weight-bold': file.isPlaying
            }">
      <td :draggable="true"
          @dragstart="dragStart(i)"
          @dragenter="dragEnter(i)"
          @dragover.prevent
          @dragend="dragEnd()"
          class="px-0 fitContent">
        <NuxtIcon name="ic:baseline-drag-indicator" class="m-0 is-draggable"/>
      </td>
      <td class="pr-0 py-0">
        <MediaFile :file="file" @play="reset" @preview="preview"/>
      </td>
      <td class="mx-2 fitContent">
        <button class="delete" @click="removeRow(i)"></button>
      </td>
    </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
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
const files = {
  sunday: ref([]),
  wednesday: ref([]),
  other: ref([]),
};

const targetFiles = ref([]);
const dragIndex = ref(null);
const api = window.api;

/**
 * lifecycle
 */
onMounted(async () => {
  files.sunday.value = await getFiles("sunday");
  files.wednesday.value = await getFiles("wednesday");
  files.other.value = await getFiles("other");

  targetFiles.value = files.sunday.value;
});

/**
 * methods
 */
const getFiles = async (target: string) => {
  const files = await api.getFiles(target);
  return await api.checkFilePaths(files);
};

function addFile(file: any) {
  targetFiles.value.push(file)
}

const close = (i) => {
  const file = targetFiles.value[i];
  api.closeSubWindow();
  file.isPlaying = false;
};

function reset() {
  api.closeSubWindow();
  targetFiles.value.forEach((file) => {
    file.isPlaying = false;
  });
}

const removeRow = (i) => {
  api.closeSubWindow();
  targetFiles.value.splice(i, 1);
};

const preview = (file) => {
  emit("preview", file)
};

const dragStart = (index) => (dragIndex.value = index);
const dragEnter = (index) => {
  if (index === dragIndex.value) return;
  const deleteElement = targetFiles.value.splice(dragIndex.value, 1)[0];
  targetFiles.value.splice(index, 0, deleteElement);
  dragIndex.value = index;
};
const dragEnd = () => (dragIndex.value = null);

defineExpose({addFile, reset})

/**
 * watch
 */
watch(
    () => props.tab,
    (newVal) => {
      targetFiles.value = files[newVal].value;
    }
);
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