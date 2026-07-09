<template>
  <div v-if="loading" class="dropArea loading">ドラッグ＆ドロップしてファイルを追加</div>
  <template v-else>
    <div
class="dropArea"
         :class="{'enter': isEnter}"
         @dragenter="dragDropEnter()"
         @dragleave="dragDropLeave()"
         @dragover.prevent
         @drop.prevent="droppedFile($event)"
    >ドラッグ＆ドロップしてファイルを追加
    </div>
    <p class="help is-danger">{{ disallowedFileTypeMessage }}</p>
  </template>
</template>

<script setup lang="ts">
import {ref} from 'vue'

/**
 * Props
 */
interface Props {
  loading?: boolean;
}

defineProps<Props>()

/**
 * emits
 */
type Emits = {
  (event: "droppedFile", value: any): void;
};
const emit = defineEmits<Emits>();

const isEnter = ref(false)
const disallowedFileTypeMessage = ref("")

/* -------------------- DnD -------------------- */
function dragDropEnter() {
  isEnter.value = true
}

function dragDropLeave() {
  isEnter.value = false
}

function droppedFile(e: DragEvent) {
  disallowedFileTypeMessage.value = ""
  isEnter.value = false
  const file = e.dataTransfer?.files[0]
  if (!file) return
  if (!isAllowedMediaType(file.type)) {
    disallowedFileTypeMessage.value = "動画か音源ファイルのみ追加可能です。"
    return
  }
  emit("droppedFile", file)
}
</script>

<style scoped>
.dropArea {
  color: var(--bulma-primary-dark);
  font-weight: bold;
  font-size: 0.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: auto;
  height: 5rem;
  border: 1px solid var(--bulma-primary);
  background-color: var(--bulma-primary-light);
  border-radius: 7px;
}

.dropArea.enter {
  color: white;
  background-color: var(--bulma-primary);
}

.dropArea.loading {
  opacity: 0.5;
}
</style>