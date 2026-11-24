<template>
  <div class="is-flex is-align-items-center">
    <div class="is-flex-grow-1" style="min-width: 0;">
      <p :class="{'has-text-grey-light': isNotPlayable}" class="video-title">{{ vimeo.title || '（タイトルなし）' }}</p>
      <p v-if="isNotPlayable" class="note">動画IDが無いため再生できません。「映像一覧を取得し直す」で取得し直してください。</p>
    </div>
    <!-- ボタンの有無で行ごとにタイトル幅が変わらないよう、操作欄は固定幅にする -->
    <div class="actions ml-2">
      <button
          v-if="!vimeo.isViewed"
          :class="{'is-loading': isLoading}"
          :disabled="isNotPlayable"
          class="button is-link is-outlined action-btn"
          @click="view()"
      >表示
      </button>
      <button
          v-else-if="isViewedBeforePlay"
          class="button is-primary action-btn"
          @click="play()"
      >再生
      </button>
      <button
          v-if="vimeo.isViewed"
          :class="{'ml-2': isViewedBeforePlay}"
          class="button is-danger action-btn"
          :title="isViewedBeforePlay ? '表示をやめてウィンドウを閉じます' : undefined"
          @click="close()"
      >閉じる
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, toRef} from 'vue'
import type {ShowcaseItem} from "~/types/models";

/**
 * emits
 */
type Emits = {
  (event: "view"): void;
};
const emit = defineEmits<Emits>();

/**
 * Props
 */
interface Props {
  vimeo: ShowcaseItem,
  showcaseUrl: string,
  password: string,
}

const props = defineProps<Props>();

// state
const isLoading = ref(false)
// 親のリストと同一オブジェクトを共有し、変更は親のdeep watchで永続化される
const vimeo = toRef(props, 'vimeo')

// API (Electron preload で expose 済みのやつを参照)
const showcaseApi = window.showcaseApi
const {notifyError} = useNotification()

// computed
const isViewedBeforePlay = computed(() => vimeo.value.isViewed && !vimeo.value.isPlaying)
// 再生は ?video=<clipId> で映像を指定するため、動画IDが無い項目は操作させない
const isNotPlayable = computed(() => !vimeo.value.clipId)

// methods
const view = () => {
  emit("view")
  isLoading.value = true
  showcaseApi.openVimeoShowcase(toRaw(vimeo.value), unref(props.showcaseUrl), unref(props.password)).then((opened: boolean) => {
    if (opened) vimeo.value.isViewed = true
    else notifyError("ショーケース映像の表示に失敗しました。URLやタイトルが間違っている可能性があります。")
  }).catch((e: any) => {
    notifyError("ショーケース映像の表示に失敗しました。URLやタイトルが間違っている可能性があります。")
    console.error(e)
  }).finally(() => {
    isLoading.value = false
  })
}

const play = () => {
  showcaseApi.playVimeoShowcase()
  vimeo.value.isPlaying = true
}

const close = () => {
  showcaseApi.closeVimeoShowcase()
  vimeo.value.isViewed = false
  vimeo.value.isPlaying = false
}
</script>

<style scoped>
.video-title {
  overflow-wrap: anywhere;
}

.actions {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  width: 10.5rem; /* ボタン2つ分（表示後は「再生」「閉じる」が並ぶ） */
}

.action-btn {
  width: 5rem;
}
</style>