<template>
  <div class="page-shell">
    <header class="page-head">
      <h1 class="page-title">CGM映像</h1>
      <button class="button is-small" @click="reset()">表示リセット</button>
    </header>

    <div class="is-flex is-justify-content-flex-end mb-2">
      <button class="button is-small" @click="isPresetOpen = true">
        <NuxtIcon class="mr-1" name="mdi:bookmark-multiple-outline" size="15"/>
        保存リストから追加
      </button>
    </div>

    <CgmList ref="cgmListRef" @preview="preview"/>
    <button class="button is-add is-fullwidth mt-4" @click="addRow()">
      ＋ 追加
    </button>

    <section v-if="previewCgm.path" class="mt-6">
      <p class="eyebrow">Preview</p>
      <h2 class="preview-title">{{ previewCgm.title }}</h2>
      <div class="preview-frame" style="aspect-ratio: 16/9">
        <iframe
            :key="videoReload" :src="previewCgm.path"
            height="100%" width="100%"/>
      </div>
      <p class="note mt-2">※プレビューを再生すると音が出ます。</p>
    </section>

    <!-- 件数が増えても扱えるよう、保存リストは右からのドロワーで開く -->
    <!-- 閉じても入力途中の行を残すため、v-if ではなく is-active の付け外しで開閉する -->
    <div :class="{'is-open': isPresetOpen}" class="drawer-overlay">
      <div class="drawer-scrim" @click="isPresetOpen = false"/>
      <aside class="drawer-panel">
        <header class="drawer-head">
          <p class="is-size-6 has-text-weight-bold">保存リスト</p>
          <button aria-label="close" class="delete" @click="isPresetOpen = false"/>
        </header>
        <div class="drawer-body">
          <CgmPresetList @add="addFromPresets"/>
        </div>
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from "vue"
import CgmList from "~/components/cgm/CgmList.vue";
import CgmPresetList from "~/components/cgm/CgmPresetList.vue";
import NuxtIcon from "~/components/icon/NuxtIcon.vue";
import type {CgmItem} from "~/types/models";

const cgmListRef = ref<InstanceType<typeof CgmList> | null>(null)

// --------------------------------------------------
// state
// --------------------------------------------------
const isPresetOpen = ref(false)
const previewCgm = ref({title: "", path: ""})
const videoReload = ref(0)

const cgmApi = window.cgmApi
const {notifyError} = useNotification()

// --------------------------------------------------
// lifecycle
// --------------------------------------------------
let offErrorCgmOpen: (() => void) | null = null

onMounted(async () => {
  offErrorCgmOpen = cgmApi.errorCgmOpen(() => {
    notifyError("CGM映像の表示に失敗しました。")
  })
  window.addEventListener("keydown", closeOnEsc)
})

onUnmounted(() => {
  offErrorCgmOpen?.()
  window.removeEventListener("keydown", closeOnEsc)
})

function closeOnEsc(e: KeyboardEvent) {
  if (e.key === "Escape") isPresetOpen.value = false
}

// --------------------------------------------------
// watchers
// --------------------------------------------------


// --------------------------------------------------
// methods
// --------------------------------------------------
function reset() {
  cgmListRef.value?.closeStatusAll()  // 子のメソッドを呼び出す
}

function addRow() {
  cgmListRef.value?.addCgm()  // 子のメソッドを呼び出す
}

function preview(cgm: any) {
  previewCgm.value = cgm
  videoReload.value++
}

// 追加結果（リスト末尾）が見えるよう、追加したら閉じる
function addFromPresets(items: CgmItem[]) {
  cgmListRef.value?.addCgmItems(items)
  isPresetOpen.value = false
}
</script>


<style scoped>
/*
 * Bulmaの .modal は display:none / flex の切替でスライドが効かないため、専用のドロワーとして組む。
 * display / visibility を切り替えず opacity と transform だけで開閉するので、必ずアニメーションする。
 */
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: 40;
  overflow: hidden; /* 閉じている間、画面外へ寄せたパネルを隠す */
  pointer-events: none; /* 閉じている間は下の画面を操作できるようにする */
}

.drawer-overlay.is-open {
  pointer-events: auto;
}

.drawer-scrim {
  position: absolute;
  inset: 0;
  background: hsla(215, 30%, 12%, 0.5);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.drawer-overlay.is-open .drawer-scrim {
  opacity: 1;
}

.drawer-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  /* 左端がサイドメニューに掛からない範囲まで広げる */
  width: min(46rem, calc(100% - var(--sidebar-width) - 2rem));
  background: var(--pp-surface);
  box-shadow: -8px 0 24px hsla(215, 30%, 20%, 0.18);
  transform: translateX(100%);
  transition: transform 0.25s ease;
}

.drawer-overlay.is-open .drawer-panel {
  transform: translateX(0);
}

.drawer-head {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: var(--pp-surface-2);
  border-bottom: 1px solid var(--pp-line-soft);
}

/* 件数が増えても、スクロールするのはドロワーの中身だけ */
.drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem 1.5rem;
}
</style>