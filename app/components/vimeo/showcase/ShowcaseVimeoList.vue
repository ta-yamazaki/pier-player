<template>
  <nav class="level is-mobile mt-5 mb-2">
    <div class="level-left">
      <p class="note has-text-danger">※「再生」ボタンのあと少し時間がかかります。</p>
    </div>
    <div class="level-right">
      <button class="button is-small" @click="closeAll()">表示リセット</button>
    </div>
  </nav>

  <SortableList :items="vimeoList" @remove="removeRow">
    <template #default="{ item }">
      <ShowcaseVimeo
          :password="password"
          :showcase-url="showcaseUrl"
          :vimeo="item"
          @view="closeAll"
      />
    </template>
  </SortableList>
</template>

<script lang="ts" setup>
import ShowcaseVimeo from "~/components/vimeo/showcase/ShowcaseVimeo.vue";
import SortableList from "~/components/common/SortableList.vue";

/**
 * Props
 */
interface Props {
  showcaseUrl: string,
  password: string,
}

defineProps<Props>();

// API (Electron preload で expose 済みのやつを参照)
const showcaseApi = window.showcaseApi

// state
const vimeoList = useStoredList<any>(
    () => showcaseApi.getPlayList().then(ensureIds),
    (list) => showcaseApi.storePlayList(list),
)
// methods
const closeAll = () => {
  showcaseApi.closeVimeoShowcase()
  vimeoList.value.forEach(v => {
    v.isViewed = false
    v.isPlaying = false
  })
}

const removeRow = (i: number) => {
  showcaseApi.closeVimeoShowcase()
  vimeoList.value.splice(i, 1)
}

const getShowcaseVideoTitles = (isOverride: boolean, titles: any[]) => {
  const withIds = ensureIds(toRaw(titles))
  if (isOverride) vimeoList.value = withIds
  else vimeoList.value = [...toRaw(vimeoList.value), ...withIds]
}

defineExpose({closeAll, getShowcaseVideoTitles})
</script>