<template>
  <!-- 件数が増えてもスクロールで見失わないよう先頭に貼り付ける -->
  <div class="is-flex is-align-items-center mb-1 search-bar">
      <div  class="is-flex-grow-1 mr-2">チェックを入れて「CGM映像リストに追加」をクリック</div>
    <button
        :disabled="selectedIds.length === 0"
        class="button is-small is-primary"
        style="white-space: nowrap;"
        @click="addToMain">
      CGM映像リストに追加
      <span class="count-badge">{{ selectedIds.length }}</span>
    </button>
  </div>

  <input
      v-model="searchText"
      class="input is-small mb-2"
      placeholder="タイトルで検索..."
      type="text">

  <div v-if="presets.length === 0" class="empty-state">
    <p>保存リストが空です</p>
  </div>
  <div v-else-if="filteredPresets.length === 0" class="empty-state">
    <p>検索条件に一致する映像がありません</p>
  </div>

  <SortableList :draggable="false" :items="filteredPresets" @remove="removeRow">
    <template #default="{ item }">
      <div class="is-flex is-align-items-center">
        <label :class="isInvalid(item) ? '' : 'is-clickable'" class="checkbox mr-3">
          <input
              :checked="isSelected(item)"
              :disabled="isInvalid(item)"
              type="checkbox"
              @change="toggle(item)">
        </label>
        <div class="is-flex-grow-1">
          <div class="field has-addons mb-1" style="white-space: nowrap;">
            <p class="control">
              <span class="button is-small is-static field-tag">タイトル</span>
            </p>
            <p class="control is-expanded">
              <input
                  v-model="item.title"
                  :class="{'is-danger': hasInvalidTitle(item)}"
                  class="input is-small"
                  placeholder="映像タイトル"
                  type="text">
            </p>
          </div>
          <div class="field has-addons mb-0">
            <p class="control">
              <span class="button is-small is-static field-tag">URL</span>
            </p>
            <p class="control is-expanded">
              <input
                  v-model="item.path"
                  :class="{'is-danger': hasInvalidPath(item)}"
                  class="input is-small"
                  placeholder="CGM映像URL"
                  type="url">
            </p>
          </div>
        </div>
      </div>
    </template>
  </SortableList>

  <button class="button is-add is-small is-fullwidth mt-2" @click="addPreset()">
    ＋ 新たにR指揮曲を保存
  </button>

  <hr>

  <div>
    <p class="has-text-weight-semibold mb-1">まとめて保存</p>
    <p class="help mt-0 mb-2">
      1行につき1件、「タイトル,URL」の形式で入力してください（カンマ・タブ区切り）。
    </p>
    <textarea
        v-model="bulkText"
        class="textarea is-small mb-2"
        placeholder="タイトル,URL&#10;タイトル,URL"
        rows="6"/>
    <div class="is-flex is-align-items-center">
      <span class="is-size-7 is-flex-grow-1">
        {{ bulkRows.length }}件を保存できます
        <span v-if="invalidBulkCount > 0" class="has-text-grey">
          （うち{{ invalidBulkCount }}件は入力に不備があります）
        </span>
      </span>
      <button :disabled="bulkRows.length === 0" class="button is-small is-primary" @click="addBulkPresets">
        まとめて保存
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from "vue"
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

// 保存済みプリセットと一括入力の行、どちらも同じルールで検証する
type PresetInput = { title: string; path: string };

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
const bulkText = ref("")

// --------------------------------------------------
// computed
// --------------------------------------------------
const filteredPresets = computed(() => {
  if (!isPresent(searchText.value)) return presets.value
  const keyword = searchText.value.toLowerCase()
  return presets.value.filter(preset => preset.title.toLowerCase().includes(keyword))
})

// 一括入力欄をパースした結果。件数表示と保存の両方で使う
const bulkRows = computed(() => parseBulkText(bulkText.value))

const invalidBulkCount = computed(() => bulkRows.value.filter(row => isInvalid(row)).length)

// --------------------------------------------------
// watch
// --------------------------------------------------
// 選択後に編集して不備が出た項目は、追加対象から自動的に外す
watch(presets, (list) => {
  const invalidIds = list.filter(preset => isInvalid(preset)).map(preset => preset.id)
  selectedIds.value = selectedIds.value.filter(id => !invalidIds.includes(id))
}, {deep: true})

// --------------------------------------------------
// validation
// --------------------------------------------------
function hasInvalidTitle(preset: PresetInput) {
  return !isPresent(preset.title.trim())
}

function hasInvalidPath(preset: PresetInput) {
  const path = preset.path.trim()
  if (!isPresent(path)) return true

  try {
    const url = new URL(path)
    return url.protocol !== "http:" && url.protocol !== "https:"
  } catch {
    return true
  }
}

function isInvalid(preset: PresetInput) {
  return hasInvalidTitle(preset) || hasInvalidPath(preset)
}

// --------------------------------------------------
// methods
// --------------------------------------------------
function addPreset() {
  presets.value.push({id: newId(), path: "", title: ""})
}

/**
 * 「タイトル,URL」形式の複数行テキストをプリセットの元データに変換する。
 * タイトルにカンマが含まれてもよいよう、最後の区切り文字でURLを切り出す。
 */
function parseBulkText(text: string): PresetInput[] {
  return text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line !== "")
      .map(line => {
        const index = Math.max(line.lastIndexOf(","), line.lastIndexOf("\t"))
        // 区切りがない行はURLだけの入力とみなす
        if (index < 0) return {title: "", path: line}
        return {
          title: line.slice(0, index).trim(),
          path: line.slice(index + 1).trim(),
        }
      })
      .filter(row => isPresent(row.path))
}

function addBulkPresets() {
  const rows = bulkRows.value
  if (rows.length === 0) return

  presets.value.push(...rows.map(row => ({id: newId(), path: row.path, title: row.title})))
  notify(`保存リストに ${rows.length}件 追加しました`)

  bulkText.value = ""
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
      .filter(preset => isSelected(preset) && !isInvalid(preset))
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
