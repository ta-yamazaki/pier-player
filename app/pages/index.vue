<template>
  <div class="tabs is-toggle is-centered is-fullwidth mb-4">
    <ul style="background-color: #f1f5f7">
      <li @click="selectSundayTab()" :class="{'is-active': selectedTab === 'sunday'}"><a>主日礼拝</a></li>
      <li @click="selectWednesdayTab()" :class="{'is-active': selectedTab === 'wednesday'}"><a>水曜礼拝</a></li>
      <li @click="selectOtherTab()" :class="{'is-active': selectedTab === 'other'}"><a>その他</a></li>
    </ul>
  </div>

  <div style="margin: auto; width: 95%; max-width: 640px">
    <div class="dropArea"
         @dragenter="dragDropEnter()"
         @dragleave="dragDropLeave()"
         @dragover.prevent
         @drop.prevent="droppedFile($event)"
         :class="{'enter': isEnter}"
    >ドラッグ＆ドロップしてファイルを追加
    </div>
    <p class="help is-danger">{{ disallowedFileTypeMessage }}</p>

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
        <video controls autoplay muted :key="videoReload">
          <source :src="previewFile.path" :type="previewFile.type"/>
        </video>
        <br>
        <small>※サブモニターでは再生バーは表示されません。</small>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {onMounted, ref} from "vue";
import MediaFileList from "~/components/file/MediaFileList.vue";

const mediaFileListRef = ref<InstanceType<typeof MediaFileList> | null>(null)

/**
 * state
 */
const selectedTab = ref("sunday");
const previewFile = ref({src: "", type: ""});
const isEnter = ref(false);
const disallowedFileTypeMessage = ref("");
const videoReload = ref(0);
const api = window.api;

/**
 * lifecycle
 */
onMounted(async () => {
});

/**
 * methods
 */
const selectFile = async (file) => {
  const path = window.webUtils.getPathForFile(file);
  const checkedFile = await api.checkFilePath({
    path,
    name: file.name,
    type: file.type,
    exists: true,
  });

  mediaFileListRef.value?.addFile(checkedFile)  // 子のメソッドを呼び出す
};

const isVideo = (type) => type.match(/video\/.*/);
const isAudio = (type) => type.match(/audio\/.*/);
const allowedFileType = (type) => isVideo(type) || isAudio(type);

const reset = () => {
  api.closeSubWindow();
  mediaFileListRef.value?.reset()  // 子のメソッドを呼び出す
};

const preview = (file) => {
  console.log(file)
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

const dragDropEnter = () => (isEnter.value = true);
const dragDropLeave = () => (isEnter.value = false);

const droppedFile = (event) => {
  disallowedFileTypeMessage.value = "";
  isEnter.value = false;

  const file = event.dataTransfer.files[0];
  if (!allowedFileType(file.type)) {
    disallowedFileTypeMessage.value =
        "動画か音源ファイルのみ追加可能です。";
    return;
  }
  return selectFile(file);
};

/**
 * watch
 */
</script>

<style scoped>
.dropArea {
  color: gray;
  font-weight: bold;
  font-size: 0.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  height: 5rem;
  border: 3px solid powderblue;
  background-color: #f2fdff;
  border-radius: 7px;
}

.enter {
  color: white;
  background-color: powderblue;
}

td {
  vertical-align: middle !important;
}
</style>