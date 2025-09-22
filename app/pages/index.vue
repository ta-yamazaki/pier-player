<script setup>
import {onMounted, reactive, ref, watch} from "vue";

// state
const sundayFiles = ref([{path: "", name: "", type: "", exists: true}]);
const wednesdayFiles = ref([{path: "", name: "", type: "", exists: true}]);
const otherFiles = ref([{path: "", name: "", type: "", exists: true}]);

const files = ref([]);
const selectedTab = ref("sunday");
const previewFile = reactive({src: "", type: ""});
const dragIndex = ref(null);
const isEnter = ref(false);
const disallowedFileTypeMessage = ref("");
const videoReload = ref(0);
const reDraw = ref(0);
const version = ref("");
const api = window.api;

// init
onMounted(async () => {
  version.value = await api.getVersion();

  sundayFiles.value = await api.getFiles("sunday");
  wednesdayFiles.value = await api.getFiles("wednesday");
  otherFiles.value = await api.getFiles("other");
  await checkFilePaths();

  files.value = sundayFiles.value;
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

  files.value.push(checkedFile);
};

const selectVideoFile = (event) => selectFile(event.target.files[0]);
const selectAudioFile = (event) => selectFile(event.target.files[0]);

const isVideo = (type) => type.match(/video\/.*/);
const isAudio = (type) => type.match(/audio\/.*/);
const allowedFileType = (type) => isVideo(type) || isAudio(type);

const checkFilePaths = async () => {
  sundayFiles.value = await api.checkFilePaths(toRaw(sundayFiles.value));
  wednesdayFiles.value = await api.checkFilePaths(toRaw(wednesdayFiles.value));
  otherFiles.value = await api.checkFilePaths(toRaw(otherFiles.value));
};

const openFolder = (filePath) => {
  const folderPath = filePath.replace(/[\\/][^\\/]+$/, "");
  api.openFolder(folderPath);
};

const play = (i) => {
  closeStatusAll();
  const file = files.value[i];
  file.isPlaying = true;

  api.openSubWindow(file).then((isExists) => {
    if (!isExists) {
      alert(`ファイルが開けませんでした。\n「${file.name}」`);
      file.isPlaying = false;
    }
    reDraw.value++;
  });
};

const close = (i) => {
  const file = files.value[i];
  api.closeSubWindow();
  file.isPlaying = false;
  reDraw.value++;
};

const closeStatusAll = () => {
  api.closeSubWindow();
  files.value.forEach((file) => {
    file.isPlaying = false;
  });
  reDraw.value++;
};

const reset = () => closeStatusAll();
const addRow = () => files.value.push({path: "", name: "", type: ""});
const removeRow = (i) => files.value.splice(i, 1);

const preview = (file) => {
  previewFile.src = file.path;
  previewFile.type = file.type;
  videoReload.value++;
};

const storeFileInfo = async () => {
  api.storeFiles(selectedTab.value, files.value);
};

const selectSundayTab = () => {
  files.value = sundayFiles.value;
  selectedTab.value = "sunday";
};
const selectWednesdayTab = () => {
  files.value = wednesdayFiles.value;
  selectedTab.value = "wednesday";
};
const selectOtherTab = () => {
  files.value = otherFiles.value;
  selectedTab.value = "other";
};

const dragStart = (index) => (dragIndex.value = index);

const dragEnter = (index) => {
  if (index === dragIndex.value) return;
  const deleteElement = files.value.splice(dragIndex.value, 1)[0];
  files.value.splice(index, 0, deleteElement);
  dragIndex.value = index;
};

const dragEnd = () => (dragIndex.value = null);
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

const isExists = (v) =>
    typeof v !== "undefined" && v !== null && v !== "" && v !== {};

// watch
watch(
    files,
    (newVal) => {
      window.api.storeFiles(selectedTab.value, toRaw(newVal));
    },
    {deep: true}
);
</script>

<template>
  <div class="tabs is-boxed is-centered is-fullwidth mb-2">
    <ul style="background-color: #f1f5f7">
      <li @click="selectSundayTab()" :class="{isActive: selectedTab === 'sunday'}"><a>主日礼拝</a></li>
      <li @click="selectWednesdayTab()" :class="{isActive: selectedTab === 'wednesday'}"><a>水曜礼拝</a></li>
      <li @click="selectOtherTab()" :class="{isActive: selectedTab === 'other'}"><a>その他</a></li>
    </ul>
  </div>

  <div style="margin: auto; width: fit-content; min-width: 360px; max-width: 95%;">
    <div
        class="dropArea"
        @dragenter="dragDropEnter()"
        @dragleave="dragDropLeave()"
        @dragover.prevent
        @drop.prevent="droppedFile($event)"
        :class="{'enter': isEnter}"
    >ドラッグ＆ドロップしてファイルを追加
    </div>
    <p class="help is-danger">{{ disallowedFileTypeMessage }}</p>

    <table class="table my-2 is-fullwidth">
      <tbody :key="reDraw">
      <tr>
        <td colspan="4">
          <button class="button is-small is-pulled-right"
                  @click="reset()"
          >表示リセット
          </button>
        </td>
      </tr>
      <tr v-for="(file, i) in files"
          :key="i"
          :class="{
              'dragging': i === dragIndex,
              'has-background-success-light has-text-weight-bold': file.isPlaying
            }">
        <td :draggable="true"
            @dragstart="dragStart(i)"
            @dragenter="dragEnter(i)"
            @dragover.prevent
            @dragend="dragEnd()"
            style="white-space: nowrap;">
            <span class="icon ml-0 mr-0 is-draggable">
              <i class="mdi mdi-24px mdi-drag-vertical mt-1"></i>
            </span>
          <span v-if="isVideo(file.type)" class="icon has-text-link">
              <i class="mdi mdi-24px mdi-video"></i>
            </span>
          <span v-if="isAudio(file.type)" class="icon" style="color:#eebe3a!important">
              <i class="mdi mdi-24px mdi-music-note"></i>
            </span>
        </td>
        <td style="font-size: 0.9rem; max-width: 20rem; overflow-x: auto;">
          <a v-if="isVideo(file.type)" @click="preview(file)">{{ file.name }}</a>
          <span v-if="isAudio(file.type)">{{ file.name }}</span>
          <span v-if="file.exists"
                class="icon is-small has-text-grey is-clickable"
                @click="openFolder(file.path)">
              <i class="mdi mdi-folder-open"></i>
            </span>
          <p class="has-text-danger" v-if="!file.exists"
          >ファイルが開けませんでした。ファイルが無いか、アクセスできない場所にあります。</p>
        </td>
        <td class="px-1">
          <button v-if="isExists(file.path) && !file.isPlaying"
                  class="button is-small is-success"
                  @click="play(i)"
                  :disabled="!file.exists"
          ><b>再生</b></button>
          <button v-if="file.isPlaying"
                  class="button is-small is-danger"
                  @click="close(i)"
          ><b>停止</b></button>
        </td>
        <td style="width: 1rem;" class="mx-2">
          <button class="delete" @click="removeRow(i)"></button>
        </td>
      </tr>
      </tbody>
    </table>
    <br><br>
    <div style="width: 100%; max-width: 480px; margin: auto">
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