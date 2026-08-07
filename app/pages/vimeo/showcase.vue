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

    <ShowcaseSetting
        @update-showcase="updateShowcase"
        @get-showcase-video-titles="getShowcaseVideoTitles"
    />
    <ShowcaseVimeoList
        ref="showcaseVimeoListRef"
        :password="showcasePassword"
        :showcase-url="showcaseUrl"
    />
  </div>
</template>

<script lang="ts" setup>
import {ref} from 'vue'
import ShowcaseVimeoList from "~/components/vimeo/showcase/ShowcaseVimeoList.vue";
import ShowcaseSetting from "~/components/vimeo/showcase/ShowcaseSetting.vue";

const showcaseVimeoListRef = ref<InstanceType<typeof ShowcaseVimeoList> | null>(null)

// state
const showcaseUrl = ref("")
const showcasePassword = ref("")

// methods
const updateShowcase = (url: string, password: string) => {
  showcaseUrl.value = url
  showcasePassword.value = password
}

const getShowcaseVideoTitles = (isOverride: boolean, titles: any[]) => {
  showcaseVimeoListRef.value?.getShowcaseVideoTitles(isOverride, titles)
}
</script>

<style scoped>
</style>