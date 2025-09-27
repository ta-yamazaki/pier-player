<template>
  <div class="dropArea"
       @dragenter="dragDropEnter()"
       @dragleave="dragDropLeave()"
       @dragover.prevent
       @drop.prevent="droppedFile($event)"
       :class="{'enter': isEnter}"
  >ドラッグ＆ドロップしてファイルを追加
  </div>
  <p class="help is-danger">{{ disallowedFileTypeMessage }}</p>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'

/**
 * emits
 */
type Emits = {
  (event: "droppedFile", value: any): void;
};
const emit = defineEmits<Emits>();

const isEnter = ref(false)
const disallowedFileTypeMessage = ref("")

/* -------------------- ライフサイクル -------------------- */
onMounted(async () => {
})

/* -------------------- computed -------------------- */

/* -------------------- ファイル関連 -------------------- */
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
  if (!allowedFileType(file.type)) {
    disallowedFileTypeMessage.value = "動画か音源ファイルのみ追加可能です。"
    return
  }
  emit("droppedFile", file)
}

function isVideo(type: string) {
  return /video\/.*/.test(type)
}

function isAudio(type: string) {
  return /audio\/.*/.test(type)
}

function allowedFileType(type: string) {
  return isVideo(type) || isAudio(type)
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
</style>