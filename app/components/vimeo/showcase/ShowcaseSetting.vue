<template>
  <h5 class="title is-5 mb-1">設定</h5>
  <div class="box">
    <div class="field">
      <label class="label is-size-7">ショーケースURL</label>
      <p class="control">
        <input type="url" v-model="showcase.rawUrl" class="input is-small" placeholder="VimeoショーケースURL">
      </p>
      <p v-if="showcaseRawUrlExists && showcaseUrlInvalid" class="has-text-danger"
      >VimeoショーケースURLの形式が正しくありません。</p>
      <small>{{ showcaseUrl }}</small>
    </div>
    <div class="field">
      <label class="label is-size-7">パスワード</label>
      <p class="control">
        <input type="text" v-model="showcase.password" class="input is-small" placeholder="パスワード">
      </p>
    </div>

    <div v-if="canGetTitles">
      <label class="checkbox">
        <input type="checkbox" v-model="overrideVideoList"/>
        <small>映像一覧を上書きする</small>
      </label>
      <button class="button is-small is-link is-outlined is-fullwidth"
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
const showcaseApi = window.vimeoShowcase

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
  emit('updateUrlWithPassword', showcaseUrlWithPassword) // 親に変更を通知
}, {deep: true})

// methods
const isExists = (v: any) =>
    typeof v !== 'undefined' && v !== null && v !== '' && v !== {}

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
      alert('映像一覧を取得できませんでした。URLとパスワードを確認してください。\n\n何度試しても取得できない場合は手動で追加してください。')
      return
    }

    const clips = JSON.parse(match[1])
    const titles = clips.map((clip: any) => ({
      isPlaying: false,
      isViewed: false,
      title: clip.title
    }))
    emit('getShowcaseVideoTitles', overrideVideoList.value, titles)

    alert('映像一覧を取得しました。')
  } catch (e) {
    console.error(e)
    alert('映像一覧の取得に失敗しました。手動で追加してください。')
  } finally {
    isGettingShowcaseVideos.value = false
  }
}
</script>

<style scoped>
</style>