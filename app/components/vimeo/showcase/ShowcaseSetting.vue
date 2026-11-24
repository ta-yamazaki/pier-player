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
import {computed, ref, toRef} from 'vue'
import type {ShowcaseTab} from "~/types/models";
import {isValidShowcaseEmbedUrl, showcaseEmbedUrl} from "~/utils/vimeo";

/**
 * 選択中タブのショーケース設定（URL・パスワード）の入力と、映像一覧の取得。
 * showcase（タブ）は直接変更する（永続化は親がタブ一覧を監視して行う）。
 */

/**
 * Props
 */
interface Props {
  showcase: ShowcaseTab,
}

const props = defineProps<Props>();

// state
const overrideVideoList = ref(true)
const isGettingShowcaseVideos = ref(false)
const showcase = toRef(props, 'showcase')

const {notify, notifyError} = useNotification()
const {fetchShowcaseVideos} = useShowcaseVideos()

// computed
// 映像一覧の取得に使う埋め込みURL
const showcaseUrl = computed(() => showcaseEmbedUrl(showcase.value.rawUrl))
const showcaseUrlInvalid = computed(() => !isValidShowcaseEmbedUrl(showcaseUrl.value))
const showcaseRawUrlExists = computed(() => !!showcase.value.rawUrl)
const showcasePasswordExists = computed(() => !!showcase.value.password)
const canGetTitles = computed(() => !showcaseUrlInvalid.value && showcasePasswordExists.value)

// methods
const getShowcaseVideoTitles = async () => {
  if (overrideVideoList.value) {
    const ok = confirm('映像一覧を取得し、上書きしてもよいですか？')
    if (!ok) return
  }

  // 取得中にタブを切り替えても、取得を始めたタブに書き込む
  const target = showcase.value
  const isOverride = overrideVideoList.value
  isGettingShowcaseVideos.value = true
  try {
    const result = await fetchShowcaseVideos(showcaseEmbedUrl(target.rawUrl), target.password)
    if (!result) {
      notifyError('映像一覧を取得できませんでした。URLとパスワードを確認してください。何度試しても取得できない場合は手動で追加してください。')
      return
    }

    const titles = result.videos.map((video) => ({
      id: newId(),
      isPlaying: false,
      isViewed: false,
      title: video.title,
      clipId: video.clipId
    }))
    target.playList = isOverride ? titles : [...target.playList, ...titles]

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