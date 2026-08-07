<template>
  <div class="page-shell">
    <header class="page-head">
      <h1 class="page-title">Vimeo再生</h1>
      <button class="button is-small" @click="reset()">表示リセット</button>
    </header>

    <div class="tabs is-centered is-fullwidth mb-4">
      <ul>
        <li>
          <NuxtLink to="/vimeo/showcase">ショーケース</NuxtLink>
        </li>
        <li class="is-active"><a>個別映像</a></li>
      </ul>
    </div>

    <p class="note has-text-danger mb-2">※「再生」ボタンのあと少し時間がかかります。</p>
    <VimeoList ref="vimeoListRef"/>
    <button class="button is-add is-fullwidth mt-4" @click="addRow()">
      ＋ 追加
    </button>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue"

const vimeoListRef = ref<InstanceType<typeof VimeoList> | null>(null)

/**
 * methods
 */
const reset = () => {
  vimeoListRef.value?.closeAll()  // 子のメソッドを呼び出す
}

const addRow = () => {
  vimeoListRef.value?.addVimeo()  // 子のメソッドを呼び出す
}
</script>