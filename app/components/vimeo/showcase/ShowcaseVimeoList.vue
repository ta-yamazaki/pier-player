<template>
  <nav class="level is-mobile my-2">
    <div class="level-left is-size-7">※最初の表示は少し時間がかかります。</div>
    <div class="level-right">
      <button class="button is-small" @click="closeAll()">表示リセット</button>
    </div>
  </nav>
  <div v-if="vimeoList.length > 0" class="box py-1 px-2">
    <table class="table my-2 is-narrow is-fullwidth">
      <thead>
      <tr class="is-size-7" style="white-space: nowrap;">
        <th></th>
        <th>
          <span>タイトル（完全一致）</span>
        </th>
        <th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(vimeo, i) in vimeoList"
          :key="vimeo"
          :class="{
              'dragging': i === dragIndex,
              'has-background-success-light': isViewedBeforePlay(vimeo),
              'has-background-danger-light': isPlaying(vimeo)
            }">
        <td :draggable="true"
            @dragstart="dragStart(i)"
            @dragenter="dragEnter(i)"
            @dragover.prevent
            @dragend="dragEnd()"
            style="vertical-align: middle"
            class="px-0 is-draggable fitContent">
          <NuxtIcon name="ic:baseline-drag-indicator"/>
        </td>
        <td style="width: 30rem;">
          <ShowcaseVimeo
              :vimeo="vimeo"
              :showcaseUrlWithPassword="showcaseUrlWithPassword"
              @view="closeAll"
          />
        </td>
        <td class="pl-0 pr-1" style="width: 1rem; vertical-align: middle">
          <button class="delete" @click="removeRow(i)"></button>
        </td>
      </tr>

      </tbody>
    </table>
  </div>

  <button class="button is-link is-outlined is-fullwidth mt-5" @click="addShowcaseVimeo()">
    ＋追加
  </button>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import NuxtIcon from "~/components/icon/NuxtIcon.vue";
import ShowcaseVimeo from "~/components/vimeo/showcase/ShowcaseVimeo.vue";

/**
 * Props
 */
interface Props {
  showcaseUrlWithPassword: String,
}

const props = defineProps<Props>();

// state
const vimeoList = ref<any[]>([])
const dragIndex = ref<number | null>(null)

// API (Electron preload で expose 済みのやつを参照)
const showcaseApi = window.vimeoShowcase

// init
onMounted(async () => {
  vimeoList.value = await showcaseApi.getPlayList()
})

// watchers
watch(vimeoList, (newVal) => {
  showcaseApi.storePlayList(toRaw(newVal))
}, {deep: true})

// computed

// methods
const isViewedBeforePlay = (vimeo: any) => vimeo.isViewed && !vimeo.isPlaying
const isPlaying = (vimeo: any) => vimeo.isPlaying

const closeAll = () => {
  showcaseApi.closeVimeoShowcase()
  vimeoList.value.forEach(v => {
    v.isViewed = false
    v.isPlaying = false
  })
}

const addShowcaseVimeo = () => {
  vimeoList.value.push({
    title: '',
    isViewed: false,
    isPlaying: false
  })
}

const removeRow = (i: number) => {
  showcaseApi.closeVimeoShowcase()
  vimeoList.value.splice(i, 1)
}

const dragStart = (index: number) => {
  dragIndex.value = index
}

const dragEnter = (index: number) => {
  if (index === dragIndex.value) return
  const deleteElement = vimeoList.value.splice(dragIndex.value!, 1)[0]
  vimeoList.value.splice(index, 0, deleteElement)
  dragIndex.value = index
}

const dragEnd = () => {
  dragIndex.value = null
}

const isExists = (v: any) =>
    typeof v !== 'undefined' && v !== null && v !== '' && v !== {}


const getShowcaseVideoTitles = (isOverride: boolean, titles: any[]) => {
  if (isOverride) vimeoList.value = toRaw(titles)
  else vimeoList.value = [...toRaw(vimeoList.value), ...titles]
}

defineExpose({closeAll, addShowcaseVimeo, getShowcaseVideoTitles})
</script>

<style scoped>
</style>