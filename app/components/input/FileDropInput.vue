<template>
  <div v-if="loading" class="dropArea loading">
    <NuxtIcon name="mdi:tray-arrow-down" size="20"/>
    <span class="drop-main">ここにファイルをドラッグ＆ドロップ</span>
    <span class="drop-sub">DROP MEDIA FILES</span>
  </div>
  <template v-else>
    <div
        :class="{'enter': isEnter}"
        class="dropArea"
        @dragenter="dragDropEnter()"
        @dragleave="dragDropLeave()"
        @dragover.prevent
        @drop.prevent="droppedFile($event)"
    >
      <NuxtIcon name="mdi:tray-arrow-down" size="20"/>
      <span class="drop-main">ここにファイルをドラッグ＆ドロップ</span>
      <span class="drop-sub">DROP MEDIA FILES</span>
    </div>
    <p class="help is-danger">{{ disallowedFileTypeMessage }}</p>
  </template>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  width: 100%;
  margin: auto;
  height: 6rem;
  border: 1.5px dashed hsla(190, 90%, 31%, 0.35);
  border-radius: 12px;
  background-color: hsla(190, 90%, 31%, 0.04);
  color: var(--pp-cyan);
  transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
}

/* 子要素で dragleave が誤発火しないように */
.dropArea > * {
  pointer-events: none;
}

.drop-main {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--pp-text);
}

.drop-sub {
  font-family: var(--pp-font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.3em;
  color: var(--pp-fog);
}

.dropArea.enter {
  border-color: var(--pp-cyan);
  background-color: var(--pp-cyan-soft);
  box-shadow: 0 0 0 4px hsla(190, 90%, 31%, 0.12);
}

.dropArea.loading {
  opacity: 0.45;
}
</style>
