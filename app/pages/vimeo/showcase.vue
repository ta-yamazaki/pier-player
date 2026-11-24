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

    <EditableTabs
        v-model="selectedTabId"
        :create-tab="createTab"
        :remove-message="removeMessage"
        :tabs="tabs"/>

    <template v-if="selectedTab">
      <ShowcaseSetting
          :key="selectedTab.id"
          :showcase="selectedTab"
      />
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
import type {ShowcaseTab} from "~/types/models";
import {showcasePageUrl} from "~/utils/vimeo";

const showcaseVimeoListRef = ref<InstanceType<typeof ShowcaseVimeoList> | null>(null)
const showcaseApi = window.showcaseApi

// state
// タブごとにショーケースのURL・パスワードと映像一覧を持つ
const tabs = useStoredList<ShowcaseTab>(
    () => showcaseApi.getTabs().then((list: ShowcaseTab[]) =>
        list.map(tab => ({...tab, playList: ensureIds(tab.playList ?? [])}))),
    (list) => showcaseApi.storeTabs(list),
)
const {selectedTabId} = useShowcaseTab()

const selectedTab = computed(() => tabs.value.find(tab => tab.id === selectedTabId.value))

// タブを切り替える前に、いま表示中の映像を閉じておく
watch(selectedTabId, () => showcaseVimeoListRef.value?.closeAll(), {flush: 'sync'})

// methods
const createTab = (id: string, name: string): ShowcaseTab =>
    ({id, name, rawUrl: "", password: "", playList: []})

const removeMessage = (tab: { name: string }) =>
    `タブ「${tab.name}」を削除します。\nこのタブのショーケース設定と映像一覧も削除されます。よろしいですか？`
</script>
