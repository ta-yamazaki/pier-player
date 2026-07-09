<template>
  <div style="margin: auto; width: 95%; max-width: 640px">
    <h5 class="title is-5 mb-2 pt-3">ピッチ変更</h5>
    <FileDropInput @droppedFile="selectFile" :loading="loading"/>
    <div v-if="file.path" class="my-6">
      <div>
        <small>ピッチ変更するファイル</small>
        <div class="is-size-5">
          <NuxtIconAudio v-if="isAudio" class="mr-3"/>
          <NuxtIconVideo v-if="isVideo" class="mr-3"/>
          <b>{{ file.name }}</b>
        </div>
      </div>
      <div class="mt-4">
        <nav class="level is-mobile">
          <div class="level-left nowrap">
            <p class="nowrap">
              <small>ピッチ変更</small>
            </p>
            <input v-model="semitones"
                   type="range"
                   class="v-center"
                   step="1" min="-12" max="12"
                   @dblclick="semitones = 0"
                   :disabled="loading">
            <div class="control ml-1" style="font-size: inherit;">{{ semitonesText }}</div>
          </div>
          <div class="level-right"></div>
        </nav>
      </div>

      <button class="button is-fullwidth is-primary mt-4"
              :class="{'is-loading': loading}"
              @click="convertFile"
              :disabled="semitones == 0 || loading">
        変換
      </button>
    </div>
    <div class="my-6">
      <div v-if="!converted && totalDuration">
        <progress class="progress is-primary"
                  :value="progress"
                  :max="totalDuration"></progress>
        <span>{{ percent.toFixed(0) }} %</span>
      </div>
      <template v-if="converted">
        <div class="notification is-warning is-light mb-1">
          <small>ピッチ変更されたファイル</small>
          <div class="is-size-5">
            <NuxtIconAudio v-if="isAudio" class="mr-3"/>
            <NuxtIconVideo v-if="isVideo" class="mr-3"/>
            <b>{{ convertedFilename }}</b>
          </div>
          <a @click="openFolder()">フォルダを開く</a>
        </div>
        <small>※元のファイルと同じフォルダ内に生成されています。</small>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
import FileDropInput from "~/components/input/FileDropInput.vue";
import NuxtIconAudio from "~/components/icon/NuxtIconAudio.vue";
import NuxtIconVideo from "~/components/icon/NuxtIconVideo.vue";
import {useNotification} from "~/composables/useNotification";

const {notify, notifyError} = useNotification()

/**
 * state
 */
const file = ref({
  path: "",
  name: "",
  type: "",
});
const semitones = ref(0);

const totalDuration = ref(0);
const progress = ref(0);
const percent = ref(0);
const loading = ref(false);
const converted = ref("");
const convertApi = window.convertApi;
const commonApi = window.commonApi;

/**
 * lifecycle
 */
let unsubscribes: (() => void)[] = [];

onMounted(() => {
  unsubscribes = [
    commonApi.getTotalDuration((data: any) => {
      totalDuration.value = data.totalDuration;
    }),
    convertApi.onConvertProgress((data: any) => {
      if (totalDuration.value <= 0) return
      const sec = data.seconds;
      progress.value = sec;
      percent.value = ((sec / totalDuration.value) * 100);
    }),
  ];
});

onUnmounted(() => {
  unsubscribes.forEach((off) => off());
  unsubscribes = [];
});

/**
 * computed
 */
const isVideo = computed(() => isVideoType(file.value.type))

const isAudio = computed(() => isAudioType(file.value.type))

const semitonesText = computed(() => {
  if (semitones.value > 0) return "+" + semitones.value;
  return semitones.value;
})

const convertedFilename = computed(() => {
  return converted.value.split("\\").pop();
})

/**
 * methods
 */
const selectFile = async (selectFile: File) => {
  totalDuration.value = 0
  progress.value = 0
  percent.value = 0
  file.value = selectFile
  converted.value = ""
};

function convertFile() {
  if (!file.value) return;

  loading.value = true
  converted.value = ""

  convertApi.convertPitch(file.value.path, semitones.value)
      .then((res: any) => {
        converted.value = res.outputFile
        progress.value = toRaw(totalDuration.value);
        percent.value = 100;
        notify("ピッチ変換が完了しました。");
      })
      .catch((err: any) => {
        progress.value = 0;
        notifyError("変換できませんでした。");
        console.error("変換失敗:", err);
      })
      .finally(() => {
        loading.value = false
      });
}

const openFolder = () => {
  commonApi.openFolder(toRaw(converted.value));
};
</script>

<style scoped>
/***********************/
/* ピッチスライダー */
/***********************/
input[type="range"] {
  appearance: none;
  width: 210px;
  height: 10px;
  border-radius: 99px;
  background: linear-gradient(
      to right,
      var(--bulma-primary-light) 49%,
      var(--bulma-primary) 50%,
      var(--bulma-primary-light) 51%
  );
  cursor: pointer;
  box-shadow: var(--bulma-shadow);
}

/* ツマミ：Chrome, Safari, Edge用 */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: var(--bulma-primary);
  border: 1px solid var(--bulma-primary-light);
  box-shadow: var(--bulma-shadow);
}

/* ツマミ：Firefox用 */
input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--bulma-primary);
  border: 1px solid var(--bulma-primary-light);
  box-shadow: var(--bulma-shadow);
}
</style>
