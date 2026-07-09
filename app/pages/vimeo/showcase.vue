<template>
  <div class="tabs is-centered is-fullwidth mb-4">
    <ul>
      <li class="is-active"><a>ショーケース</a></li>
      <li>
        <NuxtLink to="/vimeo">個別映像</NuxtLink>
      </li>
    </ul>
  </div>

  <div style="margin: auto; width: 95%; max-width: 640px">
    <ShowcaseSetting
        @update-url-with-password="(val) => showcaseUrlWithPassword = val"
        @get-showcase-video-titles="getShowcaseVideoTitles"
    />
    <ShowcaseVimeoList
        ref="showcaseVimeoListRef"
        :showcase-url-with-password="showcaseUrlWithPassword"
    />
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import ShowcaseVimeoList from "~/components/vimeo/showcase/ShowcaseVimeoList.vue";
import ShowcaseSetting from "~/components/vimeo/showcase/ShowcaseSetting.vue";

const showcaseVimeoListRef = ref<InstanceType<typeof ShowcaseVimeoList> | null>(null)

// state
const showcaseUrlWithPassword = ref("")

// methods
const getShowcaseVideoTitles = (isOverride: boolean, titles: any[]) => {
  showcaseVimeoListRef.value?.getShowcaseVideoTitles(isOverride, titles)
}
</script>

<style scoped>
</style>