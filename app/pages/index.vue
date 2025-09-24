<template>
  <div class="tabs is-boxed is-centered is-fullwidth mb-2">
    <ul style="background-color: #f1f5f7">
      <li @click="selectSundayTab()" :class="{'is-active': selectedTab === 'sunday'}"><a>主日礼拝</a></li>
      <li @click="selectWednesdayTab()" :class="{'is-active': selectedTab === 'wednesday'}"><a>水曜礼拝</a></li>
      <li @click="selectOtherTab()" :class="{'is-active': selectedTab === 'other'}"><a>その他</a></li>
    </ul>
  </div>

  <div style="margin: auto; width: 90%; max-width: 640px">
    <div class="dropArea"
         @dragenter="dragDropEnter()"
         @dragleave="dragDropLeave()"
         @dragover.prevent
         @drop.prevent="droppedFile($event)"
         :class="{'enter': isEnter}"
    >ドラッグ＆ドロップしてファイルを追加
    </div>
    <p class="help is-danger">{{ disallowedFileTypeMessage }}</p>

    <table class="table my-2 is-fullwidth">
      <tbody>
      <tr>
        <td colspan="4">
          <button class="button is-small is-pulled-right"
                  @click="reset()"
          >表示リセット
          </button>
        </td>
      </tr>
      <MediaFileList
          ref="mediaFileListRef"
          :tab="selectedTab"
          @preview="preview"/>
      </tbody>
    </table>
    <br><br>
    <div style="width: 100%; margin: auto">
      <h6 class="title is-6 mt-4 mb-1">映像プレビュー</h6>
      <div class="box" style="width: 100%; background-color: whitesmoke; aspect-ratio: 16/9">
        <template v-if="previewFile.src">
          <video controls autoplay muted :key="videoReload">
            <source :src="previewFile.src" :type="previewFile.type"/>
          </video>
          <br>
          <small>※サブモニターでは再生バーは表示されません。</small>
        </template>
      </div>
    </div>
  </div>

  <br>
  <footer class="footer">
    <div class="content has-text-centered">
      <p>Pier Player - v{{ version }}</p>
    </div>
  </footer>
</template>
<script setup lang="ts">
import {onMounted, reactive, ref} from "vue";
import MediaFileList from "~/components/file/MediaFileList.vue";

const mediaFileListRef = ref<InstanceType<typeof MediaFileList> | null>(null)

// state
const selectedTab = ref("sunday");
const previewFile = reactive({src: "", type: ""});
const isEnter = ref(false);
const disallowedFileTypeMessage = ref("");
const videoReload = ref(0);
const version = ref("");
const api = window.api;

// init
onMounted(async () => {
  version.value = await api.getVersion();
});

// methods
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
  previewFile.src = file.path;
  previewFile.type = file.type;
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

// watch
</script>

<style scoped>
.dropArea {
  color: gray;
  font-weight: bold;
  font-size: 0.8rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 95%;
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