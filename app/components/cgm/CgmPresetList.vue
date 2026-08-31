<template>
  <!-- 件数が増えてもスクロールで見失わないよう先頭に貼り付ける -->
  <div class="is-flex is-align-items-center mb-2 search-bar">
    <input
        v-model="searchText"
        class="input is-small is-flex-grow-1 mr-2"
        placeholder="タイトル・URLで検索..."
        type="text">
    <button
        :disabled="selectedIds.length === 0"
        class="button is-small is-primary"
        style="white-space: nowrap;"
        @click="addToMain">
      リストに追加
      <span class="count-badge">{{ selectedIds.length }}</span>
    </button>
  </div>

  <div v-if="presets.length === 0" class="empty-state">
    <p>保存リストが空です</p>
  </div>
  <div v-else-if="filteredPresets.length === 0" class="empty-state">
    <p>検索条件に一致する映像がありません</p>
  </div>

  <SortableList :draggable="false" :items="filteredPresets" @remove="removeRow">
    <template #default="{ item }">
      <div class="is-flex is-align-items-center">
        <label class="checkbox is-clickable mr-3">
          <input
              :checked="isSelected(item)"
              class="is-clickable"
              type="checkbox"
              @change="toggle(item)">
        </label>
        <div class="is-flex-grow-1">
          <div class="field has-addons mb-1" style="white-space: nowrap;">
            <p class="control">
              <span class="button is-small is-static field-tag">タイトル</span>
            </p>
            <p class="control is-expanded">
              <input v-model="item.title" class="input is-small" placeholder="映像タイトル（任意）" type="text">
            </p>
          </div>
          <div class="field has-addons mb-0">
            <p class="control">
              <span class="button is-small is-static field-tag">URL</span>
            </p>
            <p class="control is-expanded">
              <input v-model="item.path" class="input is-small" placeholder="CGM映像URL" type="url">
            </p>
          </div>
        </div>
      </div>
    </template>
  </SortableList>

  <button class="button is-add is-small is-fullwidth mt-2" @click="addPreset()">
    ＋ 保存リストに追加
  </button>
</template>

<script lang="ts" setup>
import {computed, ref} from "vue"
import SortableList from "~/components/common/SortableList.vue";
import type {CgmItem, CgmPreset} from "~/types/models";

/**
 * CGM映像の保存リスト（右サイドドロワーの中身）。
 * ここに貯めた映像をチェックして、メインのCGM映像リストへ追加する。
 */

/**
 * emits
 */
type Emits = {
  (event: "add", value: CgmItem[]): void;
};
const emit = defineEmits<Emits>();

// --------------------------------------------------
// state
// --------------------------------------------------
const cgmApi = window.cgmApi
const {notify} = useNotification()

const presets = useStoredList<CgmPreset>(
    () => cgmApi.getCgmPresets().then(ensureIds),
    (list) => cgmApi.storeCgmPresets(list),
)

const searchText = ref("")
const selectedIds = ref<string[]>([])

// --------------------------------------------------
// computed
// --------------------------------------------------
const filteredPresets = computed(() => {
  if (!isPresent(searchText.value)) return presets.value
  const keyword = searchText.value.toLowerCase()
  return presets.value.filter(preset =>
      `${preset.title} ${preset.path}`.toLowerCase().includes(keyword))
})

// --------------------------------------------------
// methods
// --------------------------------------------------
function addPreset() {
  presets.value.push({id: newId(), path: "", title: ""})
}

// SortableList のindexは絞り込み後のものなので、idで元リストを引き直す
function removeRow(i: number) {
  const target = filteredPresets.value[i]
  if (!target) return

  const index = presets.value.findIndex(preset => preset.id === target.id)
  if (index >= 0) presets.value.splice(index, 1)

  deselect(target)
}

function isSelected(preset: CgmPreset) {
  return selectedIds.value.includes(preset.id!)
}

function toggle(preset: CgmPreset) {
  if (isSelected(preset)) deselect(preset)
  else selectedIds.value.push(preset.id!)
}

function deselect(preset: CgmPreset) {
  const index = selectedIds.value.indexOf(preset.id!)
  if (index >= 0) selectedIds.value.splice(index, 1)
}

function addToMain() {
  // 表示順（絞り込み前の並び）のまま追加する
  const items: CgmItem[] = presets.value
      .filter(preset => isSelected(preset))
      .map(preset => ({
        id: newId(),
        path: preset.path,
        title: preset.title,
        isViewed: false,
        isPlaying: false,
      }))
  if (items.length === 0) return

  emit("add", items)
  notify(`CGM映像リストに ${items.length}件 追加しました`)
  selectedIds.value = []
}
</script>

<style scoped>
.control input {
  min-width: 15rem
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--pp-surface);
  padding: 0.5rem 0;
}
</style>
