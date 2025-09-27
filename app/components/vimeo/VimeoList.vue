<template>
  <div v-if="vimeoList.length > 0" class="box py-1 px-2">
    <table class="table my-2 is-fullwidth">
      <tbody>
      <tr v-for="(vimeo, i) in vimeoList"
          :key="vimeo"
          :class="{
              'dragging': i === dragIndex,
              'has-background-primary-light': isViewedBeforePlay(vimeo),
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
        <td>
          <Vimeo
              :vimeo="vimeo"
              @view="closeAll()"
          />
        </td>
        <td class="pl-0 pr-1" style="width: 1rem; vertical-align: middle">
          <button class="delete" @click="removeRow(i)"></button>
        </td>
      </tr>

      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue"
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

/**
 * state
 */
const vimeoList = ref<any[]>([])
const dragIndex = ref<number | null>(null)

const vimeoApi = window.vimeo

/**
 * lifecycle
 */
onMounted(async () => {
  vimeoList.value = await vimeoApi.getVimeoList()
})

/**
 * watch
 */
watch(
    vimeoList,
    (newVal) => {
      vimeoApi.storeVimeoList(toRaw(newVal))
    },
    {deep: true}
)

/**
 * methods
 */
const view = async (i: number) => {
  closeAll()
  const vimeo = vimeoList.value[i]
  await vimeoApi.openVimeo(toRaw(vimeo.playerUrl), toRaw(vimeo.password))
  vimeo.isViewed = true
}

const play = (i: number) => {
  const vimeo = vimeoList.value[i]
  vimeoApi.playVimeo()
  vimeo.isPlaying = true
}

const close = (i: number) => {
  const vimeo = vimeoList.value[i]
  vimeoApi.closeVimeo()
  vimeo.isViewed = false
  vimeo.isPlaying = false
}

const isBeforeViewing = (vimeo: any) => !vimeo.isViewed && !vimeo.isPlaying
const isViewedBeforePlay = (vimeo: any) => vimeo.isViewed && !vimeo.isPlaying
const isPlaying = (vimeo: any) => vimeo.isPlaying

const closeAll = () => {
  vimeoApi.closeVimeo()
  vimeoList.value.forEach((vimeo) => {
    vimeo.isViewed = false
    vimeo.isPlaying = false
  })
}

const addVimeo = () => {
  vimeoList.value.push({
    title: "",
    isViewed: false,
    isPlaying: false
  })
}

const removeRow = (i: number) => {
  close(i)
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
    typeof v !== "undefined" && v !== null && v !== "" && v !== {}

const generatePlayerUrl = (vimeo: any) => {
  const url = vimeo.url
  if (!url) return (vimeo.playerUrl = "")

  // https://vimeo.com/[videoId] または https://vimeo.com/[videoId]?share=copy
  const match = url.match(/^https:\/\/vimeo\.com\/(.+)/)
  if (!match) return (vimeo.playerUrl = "")

  const videoId = match[1].replace(/\?.*$/, "")
  vimeo.playerUrl = `https://player.vimeo.com/video/${videoId}?title=0&byline=0&badge=0&portrait=0&preload=auto`
}

defineExpose({addVimeo, closeAll})
</script>

<style scoped>
.control a.label {
  width: 5rem;
  cursor: unset;
}

.control button.label {
  cursor: unset;
}
</style>