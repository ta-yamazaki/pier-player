<template>
  <div class="tabs timeline-tabs">
    <ul>
      <li
          v-for="tab in tabs" :key="tab.id"
          :class="{'is-active': tab.id === modelValue}">
        <a @click="select(tab.id)" @dblclick="startRename(tab)">
          <input
              v-if="renamingId === tab.id"
              :ref="focusInput"
              v-model="renamingName"
              class="tab-name-input"
              type="text"
              @blur="commitRename"
              @click.stop
              @keydown.enter="commitRename"
              @keydown.esc="cancelRename">
          <template v-else>
            <span>{{ tab.name }}</span>
            <button
                v-if="canRemove && tab.id === modelValue"
                class="delete is-small ml-2"
                title="タブを削除"
                @click.stop="removeTab(tab)"/>
          </template>
        </a>
      </li>
      <li>
        <a class="tab-add" title="タブを追加" @click="addTab">＋</a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import {computed, nextTick, ref, watch} from 'vue'
import type {TimelineTab} from '~/types/models'

/**
 * タイムラインのタブバー。
 * タブの追加・リネーム（ダブルクリック）・削除を行い、選択中のタブIDを v-model で親へ渡す。
 * タブ一覧の永続化はこのコンポーネントが受け持つ。
 */

/**
 * props
 */
interface Props {
  /** 選択中のタブID */
  modelValue: string;
}

const props = defineProps<Props>();

/**
 * emits
 */
type Emits = {
  (event: "update:modelValue", value: string): void;
};
const emit = defineEmits<Emits>();

/**
 * state
 */
const timelineApi = window.timelineApi

const tabs = useStoredList<TimelineTab>(
    () => timelineApi.getTabs(),
    (list) => timelineApi.storeTabs(list),
)

const renamingId = ref<string | null>(null)
const renamingName = ref("")

/* -------------------- computed -------------------- */
// タブが1つだけのときは削除できない
const canRemove = computed(() => tabs.value.length > 1)

/* -------------------- 選択 -------------------- */
// 読み込み直後や、選択中のタブが無くなったときに選び直す
watch(tabs, (list) => {
  if (list.length === 0) return
  if (list.some(tab => tab.id === props.modelValue)) return
  select(list[0].id)
}, {deep: true})

function select(tabId: string) {
  if (tabId === props.modelValue) return
  emit("update:modelValue", tabId)
}

/* -------------------- 追加・削除 -------------------- */
function addTab() {
  const tab = {id: newId(), name: `タブ${tabs.value.length + 1}`}
  tabs.value.push(tab)
  emit("update:modelValue", tab.id)
  startRename(tab)
}

function removeTab(tab: TimelineTab) {
  if (!canRemove.value) return
  if (!confirm(`タブ「${tab.name}」を削除します。\nこのタブに登録した動画・音源も削除されます。よろしいですか？`)) return

  const index = tabs.value.findIndex(t => t.id === tab.id)
  tabs.value.splice(index, 1)

  if (tab.id !== props.modelValue) return
  emit("update:modelValue", tabs.value[Math.min(index, tabs.value.length - 1)]!.id)
}

/* -------------------- リネーム -------------------- */
function startRename(tab: TimelineTab) {
  renamingId.value = tab.id
  renamingName.value = tab.name
}

function commitRename() {
  const tab = tabs.value.find(t => t.id === renamingId.value)
  if (!tab) return

  const name = renamingName.value.trim()
  if (name) tab.name = name  // 空欄なら元の名前のままにする
  renamingId.value = null
}

function cancelRename() {
  renamingId.value = null
}

// 表示された入力欄にそのままカーソルを合わせる
function focusInput(el: any) {
  if (!el) return
  nextTick(() => {
    el.focus()
    el.select()
  })
}
</script>

<style scoped>
.timeline-tabs {
  margin-bottom: 0.75rem;
}

.timeline-tabs a {
  cursor: pointer;
  user-select: none; /* ダブルクリックでの文字選択を防ぐ */
}

.tab-name-input {
  width: 7rem;
  background: var(--pp-field);
  border: 1px solid var(--pp-line);
  border-radius: 6px;
  color: var(--pp-text);
  font-size: inherit;
  padding: 0 0.35em;
  text-align: center;
}

.tab-add {
  font-weight: 700;
}
</style>
