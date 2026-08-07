<template>
  <div class="is-flex is-align-items-center">
    <div style="font-size: 0.9rem; line-break: anywhere">
      <template v-if="isVideo()">
        <NuxtIconVideo class="mr-2"/>
        <a @click="preview()"><b>{{ file.name }}</b></a>
      </template>
      <template v-if="isAudio()">
        <NuxtIconAudio class="mr-2"/>
        <span><b>{{ file.name }}</b></span>
      </template>
      <NuxtIconFolder
          v-if="file.exists"
          class="has-text-grey ml-1 is-clickable"
          @click="openFolder()"/>
      <p v-if="!file.exists" class="has-text-danger"
      >ファイルが開けませんでした。ファイルが無いか、アクセスできない場所にあります。</p>
    </div>
    <div class="ml-auto mr-0 is-flex is-align-items-center" style="gap: 0.6rem;">
      <button
          v-if="file.path && !file.isPlaying"
          :disabled="!file.exists"
          class="button is-small is-primary"
          @click="play()"
      >再生
      </button>
      <button
          v-if="file.isPlaying"
          class="button is-small is-danger"
          @click="close()"
      >停止
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {toRef} from "vue";
import NuxtIconVideo from "~/components/icon/NuxtIconVideo.vue";
import NuxtIconAudio from "~/components/icon/NuxtIconAudio.vue";
import NuxtIconFolder from "~/components/icon/NuxtIconFolder.vue";
import type {FileMeta} from "~/types/models";

// 1つめにイベント名, ２つ目にemitする値の型
type Emits = {
  (event: "play"): void;
  (event: "preview", value: FileMeta): void;
};
const emit = defineEmits<Emits>();

/**
 * Props
 */
interface Props {
  file: FileMeta;
}

const props = defineProps<Props>();

// state
// 親のリストと同一オブジェクトを共有し、変更は親のdeep watchで永続化される
const file = toRef(props, 'file');
const api = window.api;
const commonApi = window.commonApi;
const {notifyError} = useNotification();

// methods
const isVideo = () => isVideoType(file.value.type);
const isAudio = () => isAudioType(file.value.type);

const openFolder = () => {
  commonApi.openFolder(toRaw(file.value.path));
};

const play = () => {
  emit("play")
  file.value.isPlaying = true;
  api.openSubWindow(toRaw(file.value)).then((isExists) => {
    if (!isExists) {
      notifyError(`ファイルが開けませんでした。「${file.value.name}」`);
      file.value.isPlaying = false;
    }
  });
};

const close = () => {
  api.closeSubWindow();
  file.value.isPlaying = false;
};

const preview = () => {
  emit("preview", file.value)
};
</script>

<style scoped>
</style>