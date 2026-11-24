<template>
  <nav class="level is-mobile mt-5 mb-2">
    <div class="level-left">
      <p class="note has-text-danger">※「再生」ボタンのあと少し時間がかかります。</p>
    </div>
    <div class="level-right">
      <button class="button is-small" @click="closeAll()">表示リセット</button>
    </div>
  </nav>

  <SortableList :items="items" @remove="removeRow">
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
import {toRef} from "vue";
import ShowcaseVimeo from "~/components/vimeo/showcase/ShowcaseVimeo.vue";
import SortableList from "~/components/common/SortableList.vue";
import type {ShowcaseItem} from "~/types/models";

/**
 * 選択中タブの映像一覧。
 * items は直接変更する（永続化は親がタブ一覧を監視して行う）。
 */

/**
 * Props
 */
interface Props {
  items: ShowcaseItem[],
  showcaseUrl: string,
  password: string,
}

const props = defineProps<Props>();

// API (Electron preload で expose 済みのやつを参照)
const showcaseApi = window.showcaseApi

// state
const items = toRef(props, 'items')

// methods
const closeAll = () => {
  showcaseApi.closeVimeoShowcase()
  items.value.forEach(v => {
    v.isViewed = false
    v.isPlaying = false
  })
}

const removeRow = (i: number) => {
  showcaseApi.closeVimeoShowcase()
  items.value.splice(i, 1)
}

defineExpose({closeAll})
</script>
