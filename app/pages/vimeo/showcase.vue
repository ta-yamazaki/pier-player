<template>
  <div class="page-shell">
    <header class="page-head">
      <h1 class="page-title">Vimeo再生</h1>
    </header>

    <div class="tabs is-centered is-fullwidth mb-4">
      <ul>
        <li class="is-active"><a>ショーケース</a></li>
        <li>
          <NuxtLink to="/vimeo">個別映像</NuxtLink>
        </li>
      </ul>
    </div>

    <!-- 設定が選択中のタブのものだと分かるよう、タブバーと設定を1つの箱にまとめる -->
    <div class="box showcase-panel">
      <EditableTabs
          v-model="selectedTabId"
          :create-tab="createTab"
          :remove-message="removeMessage"
          :tabs="tabs"
          class="mb-3"/>
      <ShowcaseSetting
          v-if="selectedTab"
          :key="selectedTab.id"
          :showcase="selectedTab"
      />
    </div>

    <template v-if="selectedTab">
      <ShowcaseVimeoList
          ref="showcaseVimeoListRef"
          :items="selectedTab.playList"
          :password="selectedTab.password"
          :showcase-url="showcasePageUrl(selectedTab.rawUrl)"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref, watch} from 'vue'
import EditableTabs from "~/components/common/EditableTabs.vue";
import ShowcaseVimeoList from "~/components/vimeo/showcase/ShowcaseVimeoList.vue";
import ShowcaseSetting from "~/components/vimeo/showcase/ShowcaseSetting.vue";
import type {ShowcaseItem, ShowcaseTab} from "~/types/models";
import {showcasePageUrl} from "~/utils/vimeo";

const showcaseVimeoListRef = ref<InstanceType<typeof ShowcaseVimeoList> | null>(null)
const showcaseApi = window.showcaseApi

// state
// タブごとにショーケースのURL・パスワードと映像一覧を持つ
const tabs = useStoredList<ShowcaseTab>(
    () => showcaseApi.getTabs().then((list: ShowcaseTab[]) =>
        list.map(tab => ({...tab, playList: ensureIds(withoutBlankRows(tab.playList ?? []))}))),
    (list) => showcaseApi.storeTabs(list),
)
const {selectedTabId} = useShowcaseTab()

const selectedTab = computed(() => tabs.value.find(tab => tab.id === selectedTabId.value))

// タブを切り替える前に、いま表示中の映像を閉じておく
watch(selectedTabId, () => showcaseVimeoListRef.value?.closeAll(), {flush: 'sync'})

// methods
// タブ導入前の既定値などで残っている、タイトルも動画IDも無い空行は読み込み時に捨てる
const withoutBlankRows = (list: ShowcaseItem[]) => list.filter(item => item.title || item.clipId)

const createTab = (id: string, name: string): ShowcaseTab =>
    ({id, name, rawUrl: "", password: "", playList: []})

const removeMessage = (tab: { name: string }) =>
    `タブ「${tab.name}」を削除します。\nこのタブのショーケース設定と映像一覧も削除されます。よろしいですか？`
</script>

<style scoped>
/* 箱の中ではタブバー自身の枠・背景は不要 */
.showcase-panel :deep(.tabs ul) {
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--pp-line-soft);
  border-radius: 0;
  padding-bottom: 0.5rem;
}
</style>
