<template>
  <SortableList :items="vimeoList" @remove="removeRow">
    <template #default="{ item }">
      <Vimeo
          :vimeo="item"
          @view="closeAll()"
      />
    </template>
  </SortableList>
</template>

<script lang="ts" setup>
import SortableList from "~/components/common/SortableList.vue";

/**
 * state
 */
const vimeoApi = window.vimeoApi

const vimeoList = useStoredList<any>(
    () => vimeoApi.getVimeoList().then(ensureIds),
    (list) => vimeoApi.storeVimeoList(list),
)

/**
 * methods
 */
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
