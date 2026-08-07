<template>
<!--  <h2 class="section-title mb-2">ショーケース設定</h2>-->
  <div class="box">
    <div class="field mb-2">
      <label class="label is-size-7 mb-0">ショーケースURL</label>
      <p class="control mb-0">
        <input v-model="showcase.rawUrl" class="input is-small" placeholder="VimeoショーケースURL" type="url">
      </p>
      <p v-if="showcaseRawUrlExists && showcaseUrlInvalid" class="has-text-danger"
      >VimeoショーケースURLの形式が正しくありません。</p>
      <small class="is-size-7">{{ showcaseUrl }}</small>
    </div>
    <div class="field">
      <label class="label is-size-7 mb-0">パスワード</label>
      <p class="control">
        <input v-model="showcase.password" class="input is-small" placeholder="パスワード" type="text">
      </p>
    </div>

      <button
          :class="{'is-loading': isGettingShowcaseVideos}"
          class="button is-small is-primary is-outlined has-text-primary is-fullwidth"
          :disabled="!canGetTitles"
          @click="getShowcaseVideoTitles()">
        ショーケースの映像一覧を取得
      </button>
      <label v-if="canGetTitles" class="checkbox has-text-right">
        <input v-model="overrideVideoList" type="checkbox">
        <small>映像一覧を上書きする</small>
      </label>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, reactive, ref, watch} from 'vue'

/**
 * emits
 */
type Emits = {
  (event: "updateShowcase", url: string, password: string): void;
  (event: "getShowcaseVideoTitles", isOverride: boolean, titles: any[]): void;
};
const emit = defineEmits<Emits>();

// state
const overrideVideoList = ref(true)
const isGettingShowcaseVideos = ref(false)
const showcase = reactive({
  rawUrl: '',
  password: ''
})

// API (Electron preload で expose 済みのやつを参照)
const showcaseApi = window.showcaseApi
const {notify, notifyError} = useNotification()
const {fetchShowcaseVideos} = useShowcaseVideos()

// computed
const showcaseUrlInvalid = computed(() => {
  const pattern = /^https:\/\/vimeo\.com\/showcase\/\d+\/embed$/
  return !pattern.test(showcaseUrl.value)
})
const showcaseRawUrlExists = computed(() => !!showcase.rawUrl)
const showcasePasswordExists = computed(() => !!showcase.password)
const canGetTitles = computed(() => !showcaseUrlInvalid.value && showcasePasswordExists.value)
// 再生時に開くショーケースのページURL（クエリを落としただけのもの）
const showcaseBaseUrl = computed(() => showcase.rawUrl.replace(/\?.*$/, ''))
// 映像一覧の取得に使う埋め込みURL
const showcaseUrl = computed(() => {
  if (!showcase.rawUrl) return ''
  return `${showcaseBaseUrl.value}/embed`
})

// init
onMounted(async () => {
  Object.assign(showcase, await showcaseApi.getShowcase())
  emit('updateShowcase', showcaseBaseUrl.value, showcase.password) // 親に変更を通知
})

// watchers
watch(showcase, (newVal) => {
  showcaseApi.storeShowcase(toRaw(newVal))
  emit('updateShowcase', showcaseBaseUrl.value, showcase.password) // 親に変更を通知
}, {deep: true})

// methods
const getShowcaseVideoTitles = async () => {
  if (overrideVideoList.value) {
    const ok = confirm('映像一覧を取得し、上書きしてもよいですか？')
    if (!ok) return
  }

  isGettingShowcaseVideos.value = true
  try {
    const result = await fetchShowcaseVideos(showcaseUrl.value, showcase.password)
    if (!result) {
      notifyError('映像一覧を取得できませんでした。URLとパスワードを確認してください。何度試しても取得できない場合は手動で追加してください。')
      return
    }

    const titles = result.videos.map((video) => ({
      isPlaying: false,
      isViewed: false,
      title: video.title,
      clipId: video.clipId
    }))
    emit('getShowcaseVideoTitles', overrideVideoList.value, titles)

    notify(`映像一覧を取得しました。（${titles.length}件）`)

    // 動画IDが取れないと再生時に映像を指定できないため、取りこぼしを知らせる
    const noClipId = result.videos.filter((video) => !video.clipId).map((video) => video.title)
    if (noClipId.length) {
      notifyError(`次の映像は動画IDを取得できなかったため再生できない場合があります：${noClipId.join('、')}`)
    }
  } catch (e) {
    console.error(e)
    notifyError('映像一覧の取得に失敗しました。手動で追加してください。')
  } finally {
    isGettingShowcaseVideos.value = false
  }
}
</script>

<style scoped>
</style>