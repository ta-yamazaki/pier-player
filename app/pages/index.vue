<template>
  <div class="page-shell">
    <header class="page-head">
      <h1 class="page-title">ファイル再生</h1>
      <button class="button is-small" @click="reset()">表示リセット</button>
    </header>

    <div class="tabs is-centered is-fullwidth mb-4">
      <ul>
        <li :class="{'is-active': selectedTab === 'sunday'}" @click="selectedTab = 'sunday'"><a>主日礼拝</a></li>
        <li :class="{'is-active': selectedTab === 'wednesday'}" @click="selectedTab = 'wednesday'"><a>水曜礼拝</a></li>
        <li :class="{'is-active': selectedTab === 'other'}" @click="selectedTab = 'other'"><a>その他</a></li>
      </ul>
    </div>

    <FileDropInput @dropped-file="selectFile"/>

    <div class="mt-4">
      <MediaFileList
          ref="mediaFileListRef"
          :tab="selectedTab"
          @preview="preview"
      />
    </div>

    <section v-if="previewFile.path" class="mt-6">
      <p class="eyebrow">Preview</p>
      <h2 class="preview-title">{{ previewFile.name }}</h2>
      <div class="preview-frame" style="aspect-ratio: 16/9">
        <video :key="videoReload" autoplay controls muted>
          <source :src="previewFile.path" :type="previewFile.type">
        </video>
      </div>
      <p class="note mt-2">※サブモニターでは再生バーは表示されません。</p>
    </section>
  </div>
</template>
<script lang="ts" setup>
import {ref} from "vue";
import MediaFileList from "~/components/file/MediaFileList.vue";
import FileDropInput from "~/components/input/FileDropInput.vue";

const mediaFileListRef = ref<InstanceType<typeof MediaFileList> | null>(null)

/**
 * state
 */
const selectedTab = ref("sunday");
const previewFile = ref({name: "", path: "", type: ""});
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

const preview = (file: any) => {
  previewFile.value = {name: file.name, path: file.path, type: file.type};
  videoReload.value++;
};
</script>