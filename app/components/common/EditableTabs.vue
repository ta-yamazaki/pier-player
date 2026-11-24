<template>
  <div class="tabs editable-tabs">
    <ul class="rounded-rectangle">
      <li
          v-for="(tab, i) in tabs" :key="tab.id"
          :class="{'is-active': tab.id === modelValue, 'is-dragging': i === dragIndex}"
          :draggable="renamingId === null"
          @dragend="dragEnd()"
          @dragenter="dragEnter(i)"
          @dragstart="dragStart(i)"
          @dragover.prevent>
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
import {computed, nextTick, ref, toRef, watch} from 'vue'

/**
 * 追加・リネーム（ダブルクリック）・削除・ドラッグ並べ替えができるタブバー。
 * 選択中のタブIDを v-model で親へ渡す。
 * tabs は直接変更する（永続化は親が tabs を監視して行う）。
 */
type Tab = { id: string, name: string }

/**
 * props
 */
interface Props {
  /** 選択中のタブID */
  modelValue: string;
  /** タブ一覧（追加・削除・並べ替え・リネームで直接変更される） */
  tabs: Tab[];
  /** 新しいタブを作る（既定は id と name だけ） */
  createTab?: (id: string, name: string) => Tab;
  /** 削除前の確認メッセージ */
  removeMessage?: (tab: Tab) => string;
}

const props = withDefaults(defineProps<Props>(), {
  createTab: (id: string, name: string) => ({id, name}),
  removeMessage: (tab: Tab) => `タブ「${tab.name}」を削除します。よろしいですか？`,
});

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
const tabs = toRef(props, 'tabs')

const renamingId = ref<string | null>(null)
const renamingName = ref("")
let focusedInput: HTMLInputElement | null = null

// リネーム入力中は誤ってタブを掴まないようにする
const {dragIndex, dragStart, dragEnter, dragEnd} = useDragSort(tabs, () => renamingId.value === null)

/* -------------------- computed -------------------- */
// タブが1つだけのときは削除できない
const canRemove = computed(() => tabs.value.length > 1)

/* -------------------- 選択 -------------------- */
// 読み込み直後や、選択中のタブが無くなったときに選び直す
watch(tabs, (list) => {
  if (list.length === 0) return
  if (list.some(tab => tab.id === props.modelValue)) return
  select(list[0]!.id)
}, {deep: true, immediate: true})

function select(tabId: string) {
  if (tabId === props.modelValue) return
  emit("update:modelValue", tabId)
}

/* -------------------- 追加・削除 -------------------- */
function addTab() {
  const tab = props.createTab(newId(), `タブ${tabs.value.length + 1}`)
  tabs.value.push(tab)
  emit("update:modelValue", tab.id)
  startRename(tab)
}

function removeTab(tab: Tab) {
  if (!canRemove.value) return
  if (!confirm(props.removeMessage(tab))) return

  const index = tabs.value.findIndex(t => t.id === tab.id)
  tabs.value.splice(index, 1)

  if (tab.id !== props.modelValue) return
  emit("update:modelValue", tabs.value[Math.min(index, tabs.value.length - 1)]!.id)
}

/* -------------------- リネーム -------------------- */
function startRename(tab: Tab) {
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
// 関数refは再描画のたびに呼ばれるため、入力中に全選択し直さないよう初回だけ行う
function focusInput(el: any) {
  if (!el || el === focusedInput) return
  focusedInput = el
  nextTick(() => {
    el.focus()
    el.select()
  })
}
</script>

<style scoped>
/* Bulmaの .tabs は横1行＋横スクロール前提なので、折り返し表示に上書きする */
.editable-tabs {
  overflow: visible; /* overflow-x だけ visible にしても overflow-y: hidden に引きずられて auto になる */
  white-space: normal;
}

.editable-tabs ul {
  flex-shrink: 1;
  flex-wrap: wrap;
}

.editable-tabs a {
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

.editable-tabs li[draggable="true"] a {
  cursor: grab;
}

.editable-tabs li.is-dragging {
  opacity: 0.5;
}

.tab-add {
  font-weight: 700;
}
</style>
