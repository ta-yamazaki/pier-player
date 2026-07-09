<template>
  <div class="tabs is-centered is-fullwidth mb-4">
    <ul>
      <li :class="{'is-active': selectedTab === 'sunday'}" @click="selectSundayTab()"><a>主日礼拝</a></li>
      <li :class="{'is-active': selectedTab === 'wednesday'}" @click="selectWednesdayTab()"><a>水曜礼拝</a></li>
      <li :class="{'is-active': selectedTab === 'other'}" @click="selectOtherTab()"><a>その他</a></li>
    </ul>
  </div>

  <div style="margin: auto; width: 95%; max-width: 640px">
    <FileDropInput @dropped-file="selectFile"/>

    <div class="buttons is-right my-2">
      <button class="button is-small" @click="reset()">表示リセット</button>
    </div>

    <MediaFileList
        ref="mediaFileListRef"
        :tab="selectedTab"
        @preview="preview"
    />
    <br>
    <div v-if="previewFile.path" style="width: 100%; margin: auto">
      <small class="mt-4 mb-1">映像プレビュー</small>
      <h6 class="title is-6 mb-2">{{ previewFile.name }}</h6>
      <div style="aspect-ratio: 16/9">
        <video :key="videoReload" controls autoplay muted>
          <source :src="previewFile.path" :type="previewFile.type">
        </video>
        <br>
        <small>※サブモニターでは再生バーは表示されません。</small>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue";
import MediaFileList from "~/components/file/MediaFileList.vue";
import FileDropInput from "~/components/input/FileDropInput.vue";

const mediaFileListRef = ref<InstanceType<typeof MediaFileList> | null>(null)

/**
 * state
 */
const selectedTab = ref("sunday");
const previewFile = ref({src: "", type: ""});
const videoReload = ref(0);
const api = window.api;

/**
 * methods
 */
const selectFile = async (file: File) => {
  const path = window.webUtils.getPathForFile(file);
  const checkedFile = await api.checkFilePath({
    path,
    name: file.name,
    type: file.type,
    exists: true,
  });

  mediaFileListRef.value?.addFile(checkedFile)  // 子のメソッドを呼び出す
};

const reset = () => {
  api.closeSubWindow();
  mediaFileListRef.value?.reset()  // 子のメソッドを呼び出す
};

const preview = (file) => {
  previewFile.value.name = file.name;
  previewFile.value.path = file.path;
  previewFile.value.type = file.type;
  videoReload.value++;
};

const selectSundayTab = () => {
  selectedTab.value = "sunday";
};
const selectWednesdayTab = () => {
  selectedTab.value = "wednesday";
};
const selectOtherTab = () => {
  selectedTab.value = "other";
};
</script>

<style scoped>
td {
  vertical-align: middle !important;
}
</style>