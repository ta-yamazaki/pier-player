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
  multiple?: boolean;
}

const props = defineProps<Props>()

/**
 * emits
 */
type Emits = {
  (event: "droppedFile", value: File): void;
  (event: "droppedFiles", value: File[]): void;
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
  const dropped = Array.from(e.dataTransfer?.files ?? [])
  if (dropped.length === 0) return

  const allowed = dropped.filter(f => isAllowedMediaType(f.type))
  if (allowed.length < dropped.length) {
    disallowedFileTypeMessage.value = "動画か音源ファイルのみ追加可能です。"
  }
  if (allowed.length === 0) return

  if (props.multiple) {
    emit("droppedFiles", allowed)
  } else {
    emit("droppedFile", allowed[0])
  }
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