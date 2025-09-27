<template>
  <p v-if="files.length === 0">履歴がありません</p>
  <template v-else>
    <button v-if="selectedFiles.length > 0"
            class="button is-primary is-fullwidth my-3"
            style="position: sticky; top: 7px; z-index:100;"
            @click="addTimeline">
      タイムラインに追加する
      <span class="tag is-primary-light is-rounded ml-2">{{ selectedFiles.length }}</span>
    </button>

    <input type="text"
           class="input is-light is-fullwidth my-3"
           placeholder="検索..."
           v-model="searchText">

    <div class="box py-1 px-2">
      <table class="table is-fullwidth">
        <thead>
        <tr class="is-size-7">
          <td class="fitContent">
            <input type="checkbox"
                   class="is-clickable"
                   :checked="selectedFiles.length > 0"
                   :disabled="selectedFiles.length === 0"
                   @click="deselectAll">
          </td>
          <td>↓ 追加したいものにチェック</td>
          <td>最終更新日</td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(file, i) in filteredFiles" :key="file"
            class="is-clickable"
            @click="toggle(i)">
          <td class="fitContent is-size-7">
            <input type="checkbox"
                   class="is-clickable"
                   :checked="isSelected(i)">
          </td>
          <td style="line-break: anywhere">{{ file.name }}</td>
          <td>{{ new Date(file.updatedAt).toLocaleDateString() }}</td>
        </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'

const files = ref<any[]>([])
const selectedFiles = ref<any[]>([])
const searchText = ref("")
const timelineApi = window.timeline

/* -------------------- ライフサイクル -------------------- */
onMounted(async () => {
  const filesMap: Map<string, any> = await timelineApi.getHistory()
  files.value = filesMap.values().toArray().sort((a, b) => {
    const dateA = new Date(a.updatedAt);
    const dateB = new Date(b.updatedAt);
    return dateB.getTime() - dateA.getTime();
  })
})

/* -------------------- watch -------------------- */

/* -------------------- computed -------------------- */
const filteredFiles = computed(() => {
      if (!searchText) return files
      return files.value.filter((file) => file.name.includes(searchText.value));
    }
);

/* -------------------- methods -------------------- */
function deselectAll() {
  selectedFiles.value = []
}

function toggle(i: number) {
  const file = files.value[i]
  const index = selectedFiles.value.indexOf(file)
  if (index >= 0) selectedFiles.value.splice(index,1)
  else selectedFiles.value.push(file)
}

function isSelected(i: number) {
  const file = files.value[i]
  return selectedFiles.value.includes(file)
}

async function addTimeline() {
  try {
    await timelineApi.storeAdditionalFiles(JSON.parse(JSON.stringify(selectedFiles.value)))
    alert(`タイムラインに ${selectedFiles.value.length}件 追加しました`)
  } catch (e) {
    alert("追加に失敗しました")
  }
}

</script>

<style scoped>
td {
  vertical-align: middle !important;
}
</style>