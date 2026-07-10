<template>
  <div v-if="vimeoList.length > 0" class="box py-1 px-2">
    <table class="table my-2 is-fullwidth">
      <tbody>
      <tr
v-for="(vimeo, i) in vimeoList"
          :key="vimeo.id"
          :class="{
              'dragging': i === dragIndex,
              'has-background-primary-light': isViewedBeforePlay(vimeo),
              'has-background-danger-light': isPlaying(vimeo)
            }">
        <td
:draggable="true"
            style="vertical-align: middle"
            class="px-0 is-draggable fitContent"
            @dragstart="dragStart(i)"
            @dragenter="dragEnter(i)"
            @dragover.prevent
            @dragend="dragEnd()">
          <NuxtIcon name="ic:baseline-drag-indicator"/>
        </td>
        <td>
          <Vimeo
              :vimeo="vimeo"
              @view="closeAll()"
          />
        </td>
        <td class="pl-0 pr-1" style="width: 1rem; vertical-align: middle">
          <button class="delete" @click="removeRow(i)"/>
        </td>
      </tr>

      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

/**
 * state
 */
const vimeoApi = window.vimeoApi

const vimeoList = useStoredList<any>(
    () => vimeoApi.getVimeoList().then(ensureIds),
    (list) => vimeoApi.storeVimeoList(list),
)
const {dragIndex, dragStart, dragEnter, dragEnd} = useDragSort(vimeoList)

/**
 * methods
 */
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
    id: newId(),
    title: "",
    isViewed: false,
    isPlaying: false
  })
}

const removeRow = (i: number) => {
  const vimeo = vimeoList.value[i]
  vimeoApi.closeVimeo()
  vimeo.isViewed = false
  vimeo.isPlaying = false
  vimeoList.value.splice(i, 1)
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