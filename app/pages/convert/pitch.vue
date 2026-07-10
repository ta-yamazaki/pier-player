<template>
  <div class="page-shell">
    <header class="page-head">
      <div>
        <p class="eyebrow">Pitch Shift</p>
        <h1 class="page-title">ピッチ変更</h1>
      </div>
    </header>
    <FileDropInput :loading="loading" @dropped-file="selectFile"/>
    <div v-if="file.path" class="my-5">
      <div class="box p-4">
        <p class="eyebrow">Source</p>
        <div class="is-size-5 mt-1">
          <NuxtIconAudio v-if="isAudio" class="mr-3"/>
          <NuxtIconVideo v-if="isVideo" class="mr-3"/>
          <b>{{ file.name }}</b>
        </div>
        <div class="mt-4">
          <nav class="level is-mobile">
            <div class="level-left nowrap">
              <p class="nowrap mr-2">
                <small>ピッチ変更</small>
              </p>
              <input
v-model="semitones"
                     type="range"
                     class="v-center"
                     step="1" min="-12" max="12"
                     :disabled="loading"
                     @dblclick="semitones = 0">
              <div class="control ml-2 semitone-value">{{ semitonesText }}</div>
            </div>
            <div class="level-right"/>
          </nav>
        </div>

        <button
class="button is-fullwidth is-primary mt-4"
                :class="{'is-loading': loading}"
                :disabled="semitones == 0 || loading"
                @click="convertFile">
          変換
        </button>
      </div>
    </div>
    <div class="my-5">
      <div v-if="!converted && totalDuration">
        <progress
class="progress is-primary"
                  :value="progress"
                  :max="totalDuration"/>
        <span class="timecode">{{ percent.toFixed(0) }} %</span>
      </div>
      <template v-if="converted">
        <div class="result-panel mb-2">
          <p class="eyebrow" style="color: var(--pp-amber)">Output</p>
          <div class="is-size-5 mt-1">
            <NuxtIconAudio v-if="isAudio" class="mr-3"/>
            <NuxtIconVideo v-if="isVideo" class="mr-3"/>
            <b>{{ convertedFilename }}</b>
          </div>
          <a class="is-size-7" @click="openFolder()">フォルダを開く →</a>
        </div>
        <p class="note">※元のファイルと同じフォルダ内に生成されています。</p>
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
.semitone-value {
  font-family: var(--pp-font-mono);
  font-variant-numeric: tabular-nums;
  min-width: 2.2em;
}

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
      hsl(214, 30%, 88%) 49%,
      var(--pp-cyan) 50%,
      hsl(214, 30%, 88%) 51%
  );
  cursor: pointer;
}

/* ツマミ：Chrome, Safari, Edge用 */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: var(--pp-cyan);
  border: 1px solid #ffffff;
  box-shadow: 0 2px 8px hsla(215, 50%, 30%, 0.3);
}

/* ツマミ：Firefox用 */
input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--pp-cyan);
  border: 1px solid #ffffff;
  box-shadow: 0 2px 8px hsla(215, 50%, 30%, 0.3);
}
</style>
