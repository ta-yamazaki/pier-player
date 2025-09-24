<template>
  <td style="font-size: 0.9rem; max-width: 20rem; overflow-x: auto;">
    <template v-if="isVideo()">
      <NuxtIcon name="material-symbols:video-camera-back-outline"
                class="mr-2 has-text-link"/>
      <a @click="preview()">{{ file.name }}</a>
    </template>
    <template v-if="isAudio()">
      <NuxtIcon name="solar:music-notes-bold"
                class="mr-2"
                style="color:#f3b507!important"/>
      <span>{{ file.name }}</span>
    </template>
    <NuxtIcon v-if="file.exists"
              name="material-symbols:folder"
              class="has-text-grey ml-1 is-clickable"
              @click="openFolder()"/>
    <p class="has-text-danger" v-if="!file.exists"
    >ファイルが開けませんでした。ファイルが無いか、アクセスできない場所にあります。</p>
  </td>
  <td class="px-1 fitContent">
    <button v-if="isExists(file.path) && !file.isPlaying"
            class="button is-small is-success"
            @click="play()"
            :disabled="!file.exists"
    ><b>再生</b></button>
    <button v-if="file.isPlaying"
            class="button is-small is-danger"
            @click="close()"
    ><b>停止</b></button>
  </td>
  <td class="mx-2 fitContent">
    <button class="delete" @click="removeRow()"></button>
  </td>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

// 1つめにイベント名, ２つ目にemitする値の型
type Emits = {
  (event: "play"): void;
  (event: "removeRow"): void;
  (event: "preview", value: any): void;
};
const emit = defineEmits<Emits>();

interface Props {
  file: any;
}

const props = defineProps<Props>();

// state
const file = ref(props.file);
const api = window.api;

// init
onMounted(() => {
  file.value = props.file
});

// methods
const isVideo = () => file.value.type.match(/video\/.*/);
const isAudio = () => file.value.type.match(/audio\/.*/);

const openFolder = () => {
  const folderPath = file.value.path.replace(/[\\/][^\\/]+$/, "");
  api.openFolder(folderPath);
};

const play = () => {
  emit("play")
  file.value.isPlaying = true;
  api.openSubWindow(toRaw(file.value)).then((isExists) => {
    if (!isExists) {
      alert(`ファイルが開けませんでした。\n「${file.value.name}」`);
      file.value.isPlaying = false;
    }
  });
};

const close = () => {
  api.closeSubWindow();
  file.value.isPlaying = false;
};

const removeRow = () => emit("removeRow");

const preview = () => {
  emit("preview", file.value)
};

const isExists = (v) =>
    typeof v !== "undefined" && v !== null && v !== "" && v !== {};

// watch
</script>

<style scoped>
td {
  vertical-align: middle !important;
}
</style>