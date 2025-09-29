<template>
  <NuxtLink to="/">戻る</NuxtLink>
  <div style="margin: auto; width: 95%; max-width: 640px">
    <FileDropInput @droppedFile="selectFile"/>
    <div>{{ file.path }}</div>
    <button class="button is-fullwidth"
            :class="{'is-loading':loading}"
            @click="convertFile">変換
    </button>
    <div class="my-4">
      <div v-if="totalDuration">
        <progress :value="progress" :max="totalDuration"></progress>
        <div>{{ percent.toFixed(0) }} %</div>
      </div>
      <div>{{ converted.path }}</div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {onMounted} from "vue";
import FileDropInput from "~/components/input/FileDropInput.vue";

/**
 * state
 */
const file = ref({});
const totalDuration = ref(0);
const progress = ref(0);
const percent = ref(0);
const loading = ref(false);
const converted = ref({});
// const convertApi = window.convert;

/**
 * lifecycle
 */
onMounted(() => {
  window.api.onConvertTotalDuration((data) => {
    totalDuration.value = data.totalDuration;
  });
  window.api.onConvertProgress((data) => {
    if (totalDuration.value <= 0) return
    const sec = data.seconds;
    progress.value = sec;
    percent.value = ((sec / totalDuration.value) * 100);
  });
});

/**
 * computed
 */

/**
 * methods
 */
const selectFile = async (selectFile: File) => {
  totalDuration.value = 0
  progress.value = 0
  percent.value = 0
  file.value = selectFile
};

function convertFile() {
  if (!file.value) return;

  loading.value = true

  const semitones = -1; // 例: ユーザー指定
  window.api.convertPitch(file.value.path, semitones)
      .then((res) => {
        converted.value = res.outputFile
        progress.value = toRaw(totalDuration.value);
        percent.value = 100;
        alert(`変換完了: ${res.outputFile}`);
      })
      .catch((err) => {
        progress.value = 0;
        alert("変換できませんでした。");
        console.error("変換失敗:", err);
      })
      .finally(() => {
        loading.value = false
      });
}

</script>

<style scoped>
/* Bulmaのprogressリセット */
progress {
  all: unset; /* ほぼ全てのCSSをリセット */
  display: block; /* progress は block にする */
  width: 100%; /* 元の幅を確保 */
  height: auto; /* 高さは自分で設定 */
  box-sizing: border-box;
}

/* progress のベース */
progress {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background-color: #e6eaf0;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* WebKit (Chrome, Safari) */
progress::-webkit-progress-bar {
  background-color: #e6eaf0;
  border-radius: 999px;
}

progress::-webkit-progress-value {
  /*background: linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4)),*/
  /*            var(--timeline-linear-gradient);*/
  background-color: var(--bulma-primary-30);
  transition: width 0.5s;
}

/* Firefox */
progress::-moz-progress-bar {
  /*background: linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4)),*/
  /*            var(--timeline-linear-gradient);*/
  background-color: var(--bulma-primary-30);
  transition: width 0.5s;
}
</style>
