<template>
  <div class="tabs is-centered is-fullwidth mb-4">
    <ul>
      <li><NuxtLink to="/vimeo/showcase">ショーケース</NuxtLink></li>
      <li class="is-active"><a>個別映像</a></li>
    </ul>
  </div>

  <div style="margin: auto; width: 95%; max-width: 640px">
    <div class="buttons is-right mb-2">
      <button class="button is-small" @click="reset()">表示リセット</button>
    </div>
    <VimeoList ref="vimeoListRef"/>
    <button class="button is-link is-outlined is-fullwidth mt-5" @click="addRow()">
      ＋追加
    </button>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from "vue"

const vimeoListRef = ref<InstanceType<typeof VimeoList> | null>(null)

/**
 * state
 */

/**
 * lifecycle
 */
onMounted(async () => {
})

/**
 * watch
 */


/**
 * methods
 */
const reset = () => {
  vimeoListRef.value?.closeAll()  // 子のメソッドを呼び出す
}

const addRow = () => {
  vimeoListRef.value?.addVimeo()  // 子のメソッドを呼び出す
}

const isExists = (v: any) =>
    typeof v !== "undefined" && v !== null && v !== "" && v !== {}
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