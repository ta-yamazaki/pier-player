<template>
  <div v-if="cgmList.length > 0">
    <p class="note mb-2">※表示に少し時間がかかる場合があります。</p>
    <SortableList :items="cgmList" @remove="removeRow">
      <template #default="{ item }">
        <Cgm
            :cgm="item"
            @preview="preview(item)"
            @view="closeStatusAll()"
        />
      </template>
    </SortableList>
  </div>
</template>

<script lang="ts" setup>
import SortableList from "~/components/common/SortableList.vue";

// --------------------------------------------------
// state
// --------------------------------------------------
const cgmApi = window.cgmApi

const cgmList = useStoredList<any>(
    () => cgmApi.getCgmList().then(ensureIds),
    (list) => cgmApi.storeCgmList(list),
)

/**
 * emits
 */
// 1つめにイベント名, ２つ目にemitする値の型
type Emits = {
  (event: "preview", value: any): void;
};
const emit = defineEmits<Emits>();

// --------------------------------------------------
// methods
// --------------------------------------------------
function closeStatusAll() {
  cgmApi.closeCgm()
  cgmList.value.forEach((cgm) => {
    cgm.isViewed = false
    cgm.isPlaying = false
  })
}

function addCgm() {
  cgmList.value.push({
    id: newId(),
    path: "",
    title: "",
    isViewed: false,
    isPlaying: false,
  })
}

function removeRow(i: number) {
  cgmApi.closeCgm()
  cgmList.value.splice(i, 1)
}

function preview(cgm: any) {
  emit("preview", cgm)
}

defineExpose({addCgm, closeStatusAll})
</script>