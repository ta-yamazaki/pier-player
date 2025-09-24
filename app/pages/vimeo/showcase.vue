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
        @updateUrlWithPassword="(val) => showcaseUrlWithPassword = val"
        @getShowcaseVideoTitles="getShowcaseVideoTitles"
    />
    <ShowcaseVimeoList
        ref="showcaseVimeoListRef"
        :showcaseUrlWithPassword="showcaseUrlWithPassword"
    />
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import ShowcaseVimeoList from "~/components/vimeo/showcase/ShowcaseVimeoList.vue";
import ShowcaseSetting from "~/components/vimeo/showcase/ShowcaseSetting.vue";

const showcaseVimeoListRef = ref<InstanceType<typeof ShowcaseVimeoList> | null>(null)

// state
const showcaseUrlWithPassword = ref("")

// init
onMounted(async () => {
})

// watchers

// computed

// methods
const getShowcaseVideoTitles = (isOverride: boolean, titles: any[]) => {
  showcaseVimeoListRef.value?.getShowcaseVideoTitles(isOverride, titles)
}
</script>

<style scoped>
</style>