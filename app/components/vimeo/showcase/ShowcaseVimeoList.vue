<template>
  <nav class="level is-mobile mt-5 mb-2">
    <div class="level-left">
      <p v-if="items.length > 0" class="note">{{ items.length }}件 ・ 「再生」ボタンのあと少し時間がかかります。</p>
    </div>
    <div class="level-right">
      <button class="button is-small" @click="closeAll()">表示リセット</button>
    </div>
  </nav>

  <SortableList v-if="items.length > 0" :items="items" @remove="removeRow">
    <template #default="{ item }">
      <ShowcaseVimeo
          :password="password"
          :showcase-url="showcaseUrl"
          :vimeo="item"
          @view="closeAll"
      />
    </template>
  </SortableList>
  <div v-else class="box has-text-centered py-6">
    <p class="has-text-grey">映像がまだありません。</p>
    <p class="note mt-1">上の欄にショーケースURLとパスワードを入れて「映像一覧を取得」を押してください。</p>
  </div>
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

// 表示中・再生中の行を消すときだけ確認してウィンドウを閉じる（他の行を消しても投影は止めない）
const removeRow = (i: number) => {
  const item = items.value[i]
  if (!item) return
  if (item.isViewed || item.isPlaying) {
    if (!confirm(`「${item.title}」は表示中です。映像を閉じて一覧から削除しますか？`)) return
    showcaseApi.closeVimeoShowcase()
  }
  items.value.splice(i, 1)
}

defineExpose({closeAll})
</script>
