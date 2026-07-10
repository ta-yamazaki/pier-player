<template>
  <p class="eyebrow">Showcase Settings</p>
  <h2 class="section-title mb-2">ショーケース設定</h2>
  <div class="box">
    <div class="field">
      <label class="label is-size-7">ショーケースURL</label>
      <p class="control">
        <input v-model="showcase.rawUrl" type="url" class="input is-small" placeholder="VimeoショーケースURL">
      </p>
      <p v-if="showcaseRawUrlExists && showcaseUrlInvalid" class="has-text-danger"
      >VimeoショーケースURLの形式が正しくありません。</p>
      <small>{{ showcaseUrl }}</small>
    </div>
    <div class="field">
      <label class="label is-size-7">パスワード</label>
      <p class="control">
        <input v-model="showcase.password" type="text" class="input is-small" placeholder="パスワード">
      </p>
    </div>

    <div v-if="canGetTitles">
      <label class="checkbox">
        <input v-model="overrideVideoList" type="checkbox">
        <small>映像一覧を上書きする</small>
      </label>
      <button
class="button is-small is-primary is-outlined is-fullwidth"
              :class="{'is-loading': isGettingShowcaseVideos}"
              @click="getShowcaseVideoTitles()">
        ショーケースの映像一覧を取得
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from 'vue'

/**
 * emits
 */
type Emits = {
  (event: "updateUrlWithPassword", value: any): void;
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

// computed
const showcaseUrlInvalid = computed(() => {
  const pattern = /^https:\/\/vimeo\.com\/showcase\/\d+\/embed$/
  return !pattern.test(showcaseUrl.value)
})
const showcaseRawUrlExists = computed(() => !!showcase.rawUrl)
const showcasePasswordExists = computed(() => !!showcase.password)
const canGetTitles = computed(() => !showcaseUrlInvalid.value && showcasePasswordExists.value)
const showcaseUrl = computed(() => {
  if (!showcase.rawUrl) return ''
  return showcase.rawUrl.replace(/\?.*$/, '') + '/embed'
})
const showcaseUrlWithPassword = computed(() => `${showcaseUrl.value}?password=${showcase.password}`)

// init
onMounted(async () => {
  Object.assign(showcase, await showcaseApi.getShowcase())
  emit('updateUrlWithPassword', showcaseUrlWithPassword.value) // 親に変更を通知
})

// watchers
watch(showcase, (newVal) => {
  showcaseApi.storeShowcase(toRaw(newVal))
  emit('updateUrlWithPassword', showcaseUrlWithPassword.value) // 親に変更を通知
}, {deep: true})

// methods
const getShowcaseVideoTitles = async () => {
  if (overrideVideoList.value) {
    const ok = confirm('映像一覧を取得し、上書きしてもよいですか？')
    if (!ok) return
  }

  isGettingShowcaseVideos.value = true
  try {
    const res = await fetch(showcaseUrlWithPassword.value)
    const html = await res.text()
    const match = html.match(/"clips"\s*:\s*(\[[\s\S]*?])/)
    if (!match) {
      notifyError('映像一覧を取得できませんでした。URLとパスワードを確認してください。何度試しても取得できない場合は手動で追加してください。')
      return
    }

    const clips = JSON.parse(match[1])
    const titles = clips.map((clip: any) => ({
      isPlaying: false,
      isViewed: false,
      title: clip.title
    }))
    emit('getShowcaseVideoTitles', overrideVideoList.value, titles)

    notify('映像一覧を取得しました。')
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