<template>
  <p v-if="files.length === 0">履歴がありません</p>
  <template v-else>
    <button class="button is-primary is-fullwidth"
            style="position: sticky; top: 7px;"
            @click="addTimeline">
      タイムラインに追加する
      <span class="tag is-primary-light is-rounded ml-2">{{ selectedFiles.length }}</span>
    </button>

    <div class="box py-1 px-2">
      <table class="table is-fullwidth">
        <thead>
        <tr class="is-size-7">
          <td class="fitContent">
            <input v-if="selectedFiles.length > 0"
                   type="checkbox"
                   class="is-clickable"
                   :checked="selectedFiles.length > 0"
                   @click="deselectAll">
          </td>
          <td>↓ 追加したいものにチェック</td>
          <td>最終更新日</td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(file, i) in files" :key="file"
            class="is-clickable"
            @click="files[i].selected = !files[i].selected">
          <td class="fitContent is-size-7">
            <input type="checkbox" class="is-clickable" v-model="files[i].selected">
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

/* -------------------- computed -------------------- */

const selectedFiles = computed(() =>
    files.value.filter((file) => file.selected)
);

/* -------------------- methods -------------------- */
function deselectAll() {
  files.value.forEach((file) => file.selected = false)
}

function addTimeline() {
  const selectedFiles = files.value.filter((file) => file.selected);
  timelineApi.storeAdditionalFiles(toRaw(selectedFiles))
}

</script>

<style scoped>
td {
  vertical-align: middle !important;
}
</style>