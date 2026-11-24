<template>
  <div>
    <!-- 設定済みなら1行に畳み、一覧をすぐ見られるようにする -->
    <div v-if="!isEditing" class="is-flex is-align-items-center is-gap-2 mb-3">
      <p class="is-size-7 has-text-grey is-flex-grow-1" style="min-width: 0; overflow-wrap: anywhere;">
        ショーケース <strong class="has-text-grey-dark">{{ showcaseId }}</strong>
      </p>
      <button class="button is-small is-text" @click="isEditing = true">設定を編集</button>
    </div>

    <template v-else>
      <div class="field mb-2">
        <label class="label is-size-7 mb-0">ショーケースURL</label>
        <p class="control mb-0">
          <input v-model="showcase.rawUrl" class="input is-small" placeholder="https://vimeo.com/showcase/12345678" type="url">
        </p>
        <p v-if="showcaseRawUrlExists && showcaseUrlInvalid" class="help is-danger">
          VimeoショーケースURLの形式が正しくありません（例：https://vimeo.com/showcase/12345678）。
        </p>
      </div>
      <div class="field mb-3">
        <label class="label is-size-7 mb-0">パスワード</label>
        <p class="control">
          <input v-model="showcase.password" class="input is-small" placeholder="パスワード" type="text">
        </p>
      </div>
    </template>

    <div class="buttons mb-0">
      <button
          :class="{'is-loading': isGettingShowcaseVideos && !isAppending}"
          :disabled="!canGetTitles || isGettingShowcaseVideos"
          class="button is-small is-primary is-outlined has-text-primary is-flex-grow-1 mb-0"
          @click="getShowcaseVideoTitles(false)">
        {{ hasPlayList ? '映像一覧を取得し直す' : '映像一覧を取得' }}
      </button>
      <button
          v-if="hasPlayList"
          :class="{'is-loading': isGettingShowcaseVideos && isAppending}"
          :disabled="!canGetTitles || isGettingShowcaseVideos"
          class="button is-small mb-0"
          title="いまの一覧を残したまま、取得した映像を末尾に追加します"
          @click="getShowcaseVideoTitles(true)">
        末尾に追加
      </button>
    </div>
    <p v-if="!canGetTitles" class="note mt-1">ショーケースURLとパスワードを入力すると取得できます。</p>
  </div>
</template>

<script lang="ts" setup>
import {computed, ref, toRef} from 'vue'
import type {ShowcaseTab} from "~/types/models";
import {isValidShowcaseEmbedUrl, parseShowcaseId, showcaseEmbedUrl} from "~/utils/vimeo";

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
const isGettingShowcaseVideos = ref(false)
const isAppending = ref(false)
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
const showcaseId = computed(() => parseShowcaseId(showcaseUrl.value) ?? '')
const hasPlayList = computed(() => showcase.value.playList.length > 0)

// 設定済みのタブは畳んだ状態で開く（タブ切替時は key で作り直される）
const isEditing = ref(!canGetTitles.value)

// methods
const getShowcaseVideoTitles = async (append: boolean) => {
  // 取得中にタブを切り替えても、取得を始めたタブに書き込む
  const target = showcase.value
  if (!append && target.playList.length > 0) {
    const ok = confirm(`いまの映像一覧（${target.playList.length}件）を、取得した一覧で置き換えます。よろしいですか？`)
    if (!ok) return
  }

  isAppending.value = append
  isGettingShowcaseVideos.value = true
  try {
    const result = await fetchShowcaseVideos(showcaseEmbedUrl(target.rawUrl), target.password)
    if (!result) {
      notifyError('映像一覧を取得できませんでした。URLとパスワードを確認してください。何度試しても取得できない場合は「個別映像」から再生してください。')
      return
    }

    const titles = result.videos.map((video) => ({
      id: newId(),
      isPlaying: false,
      isViewed: false,
      title: video.title,
      clipId: video.clipId
    }))
    target.playList = append ? [...target.playList, ...titles] : titles
    isEditing.value = false

    notify(`映像一覧を取得しました。（${titles.length}件）`)

    // 動画IDが取れないと再生時に映像を指定できないため、取りこぼしを知らせる
    const noClipId = result.videos.filter((video) => !video.clipId).map((video) => video.title)
    if (noClipId.length) {
      notifyError(`次の映像は動画IDを取得できなかったため再生できない場合があります：${noClipId.join('、')}`)
    }
  } catch (e) {
    console.error(e)
    notifyError('映像一覧の取得に失敗しました。時間をおいて再度お試しいただくか、「個別映像」から再生してください。')
  } finally {
    isGettingShowcaseVideos.value = false
  }
}
</script>
