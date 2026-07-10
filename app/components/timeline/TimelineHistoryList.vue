<template>
  <div v-if="files.length === 0" class="empty-state">
    <p class="eyebrow">No History</p>
    <p>履歴がありません</p>
  </div>
  <template v-else>
    <button
        :disabled="selectedFiles.length === 0"
        class="button is-primary is-fullwidth my-3"
        style="position: sticky; top: 7px; z-index:100;"
        @click="addTimeline">
      タイムラインに追加する
      <span class="count-badge">{{ selectedFiles.length }}</span>
    </button>

    <input
        v-model="searchText"
        class="input is-fullwidth my-3"
        placeholder="ファイル名で検索..."
        type="text">

    <div class="box py-1 px-2">
      <table class="table is-fullwidth is-hoverable">
        <thead>
        <tr class="is-size-7">
          <td class="fitContent">
            <input
                :checked="selectedFiles.length > 0"
                :disabled="selectedFiles.length === 0"
                class="is-clickable"
                type="checkbox"
                @click="deselectAll">
          </td>
          <td class="note">↓ 追加したいものにチェック</td>
          <td class="note">最終更新日</td>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="file in filteredFiles" :key="file.name"
            class="is-clickable"
            @click="toggle(file)">
          <td class="fitContent is-size-7">
            <input
                :checked="isSelected(file)"
                class="is-clickable"
                type="checkbox">
          </td>
          <td style="line-break: anywhere">{{ file.name }}</td>
          <td>{{ new Date(file.updatedAt).toLocaleDateString() }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'

const files = ref<any[]>([])
const selectedFiles = ref<any[]>([])
const searchText = ref("")
const timelineApi = window.timelineApi
const {notify, notifyError} = useNotification()

/* -------------------- ライフサイクル -------------------- */
onMounted(async () => {
  const filesMap: Map<string, any> = await timelineApi.getHistory()
  files.value = filesMap.values().toArray().sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);
    return dateB.getTime() - dateA.getTime();
  })
})

/* -------------------- computed -------------------- */
const filteredFiles = computed(() => {
      if (!searchText.value) return files.value
      return files.value.filter((file) => file.name.includes(searchText.value));
    }
);

/* -------------------- methods -------------------- */
function deselectAll() {
  selectedFiles.value = []
}

function toggle(file: any) {
  const index = selectedFiles.value.indexOf(file)
  if (index >= 0) selectedFiles.value.splice(index, 1)
  else selectedFiles.value.push(file)
}

function isSelected(file: any) {
  return selectedFiles.value.includes(file)
}

async function addTimeline() {
  try {
    await timelineApi.storeAdditionalFiles(JSON.parse(JSON.stringify(selectedFiles.value)))
    notify(`タイムラインに ${selectedFiles.value.length}件 追加しました`)
  } catch {
    notifyError("追加に失敗しました")
  }
}

</script>

<style scoped>
td {
  vertical-align: middle !important;
}
</style>