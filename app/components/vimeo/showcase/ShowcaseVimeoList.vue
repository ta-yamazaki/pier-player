<template>
  <nav class="level is-mobile mt-5 mb-2">
    <div class="level-left">
      <div>
        <p class="eyebrow">Playlist</p>
        <h2 class="section-title">映像リスト</h2>
      </div>
    </div>
    <div class="level-right">
      <button class="button is-small" @click="closeAll()">表示リセット</button>
    </div>
  </nav>
  <p class="note mb-2">※最初の表示は少し時間がかかります。</p>
  <SortableList :items="vimeoList" @remove="removeRow">
    <template #head>
      <tr class="is-size-7" style="white-space: nowrap;">
        <th/>
        <th>
          <span class="note">タイトル（完全一致）</span>
        </th>
        <th/>
      </tr>
    </template>
    <template #default="{ item }">
      <ShowcaseVimeo
          :showcase-url-with-password="showcaseUrlWithPassword"
          :vimeo="item"
          @view="closeAll"
      />
    </template>
  </SortableList>

  <button class="button is-add is-fullwidth mt-4" @click="addShowcaseVimeo()">
    ＋ 追加
  </button>
</template>

<script lang="ts" setup>
import ShowcaseVimeo from "~/components/vimeo/showcase/ShowcaseVimeo.vue";
import SortableList from "~/components/common/SortableList.vue";

/**
 * Props
 */
interface Props {
  showcaseUrlWithPassword: string,
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

const addShowcaseVimeo = () => {
  vimeoList.value.push({
    id: newId(),
    title: '',
    isViewed: false,
    isPlaying: false
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

defineExpose({closeAll, addShowcaseVimeo, getShowcaseVideoTitles})
</script>