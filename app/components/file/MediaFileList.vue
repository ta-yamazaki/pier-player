<template>
  <SortableList :items="targetFiles" @remove="removeRow">
    <template #default="{ item }">
      <MediaFile :file="item" @play="reset" @preview="preview"/>
    </template>
  </SortableList>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from "vue";
import MediaFile from "~/components/file/MediaFile.vue";
import SortableList from "~/components/common/SortableList.vue";

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
