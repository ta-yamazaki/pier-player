<template>
  <div :class="{'has-player': currentAudio && currentSrc}" class="page-shell">
    <header class="page-head">
      <h1 class="page-title">Pier Praise</h1>
      <div v-if="user" class="is-flex" style="gap: 0.5rem">
        <button :class="{'is-loading': loading}" class="button is-small" @click="getAudios">再取得</button>
        <button class="button is-small" @click="logout">ログアウト</button>
      </div>
    </header>

    <Loader v-if="!authReady" class="mt-6"/>

    <!-- 未ログイン -->
    <section v-else-if="!user" class="login-wrap">
      <h2 class="section-title mb-2">Pier Praise ログイン</h2>
      <div class="box login-box">
        <div class="field">
          <label class="label is-size-7">メールアドレス</label>
          <p class="control">
            <input
                v-model="email"
                class="input is-small"
                type="email"
                placeholder="mail@example.com"
                @keyup.enter="login">
          </p>
        </div>
        <div class="field">
          <label class="label is-size-7">パスワード</label>
          <p class="control">
            <input
                v-model="password"
                class="input is-small"
                type="password"
                placeholder="パスワード"
                @keyup.enter="login">
          </p>
        </div>
        <button
            :class="{'is-loading': loginLoading}"
            :disabled="!email || !password"
            class="button is-small is-primary is-fullwidth"
            @click="login">
          ログイン
        </button>
      </div>
    </section>

    <!-- ログイン済み -->
    <template v-else>
      <Loader v-if="loading" class="mt-6"/>
      <template v-else>
        <div class="">
          <h2 class="section-title">チェックした曲</h2>
          <p v-if="selectedAudios.length === 0" class="note">チェックした曲がここに並びます。</p>
          <SortableList :items="selectedAudios" @remove="removeAt">
            <template #default="{ item }">
              <div class="is-flex is-align-items-center">
                <span style="line-break: anywhere"><b>{{ item.title }}</b></span>
                <div class="ml-auto mr-0">
                  <NuxtIconPlayer
                      name="mdi:play-circle"
                      size="32"
                      @click="playFromStart(item)"/>
                </div>
              </div>
            </template>
          </SortableList>
        </div>
        <div class="mt-5">
            <p class="control has-icons-left has-icons-right my-2">
              <span class="icon is-left"><NuxtIcon name="mdi:magnify" size="17"/></span>
              <input
                  v-model="searchText"
                  class="input underlined"
                  type="text"
                  placeholder="曲を検索...">
              <span v-if="searchText" class="icon is-right is-clickable" @click="searchText = ''">
                <NuxtIcon name="mdi:close-circle" size="17"/>
              </span>
            </p>
            <table class="table is-narrow nowrap is-fullwidth is-hoverable my-2">
              <tbody>
              <tr
                  v-for="(item, i) in filteredAudios"
                  :key="item.id"
                  :class="{'is-live': item.isPlaying}">
                <td class="fitContent">
                  <input
                      v-model="item.selected"
                      type="checkbox"
                      @click="selectClicked(item, ($event.target as HTMLInputElement).checked)">
                </td>
                <td class="fitContent has-text-grey">{{ firstLetterLabel(i) }}</td>
                <td style="line-break: anywhere; white-space: normal">
                  <b>{{ item.title }}</b>
                </td>
                <td class="fitContent">
                  <NuxtIconPlayer
                      name="mdi:play-circle"
                      size="32"
                      @click="playFromStart(item)"/>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
      </template>

      <PraiseAudioPlayer
          v-if="currentAudio && currentSrc"
          :key="playerKey"
          :audio="currentAudio"
          :src="currentSrc"
          @close="closePlayer"/>
    </template>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, onUnmounted} from "vue";
import NuxtIcon from "~/components/icon/NuxtIcon.vue";
import Loader from "~/components/common/Loader.vue";
import SortableList from "~/components/common/SortableList.vue";
import PraiseAudioPlayer from "~/components/praise/PraiseAudioPlayer.vue";
import {PraiseFirestore, type PraiseAudio} from "~/utils/praise/firestore";
import {PraiseAuth, type User} from "~/utils/praise/auth";
import NuxtIconPlayer from "~/components/icon/NuxtIconPlayer.vue";

/**
 * state
 */
const user = ref<User | null>(null);
const authReady = ref(false);
const email = ref("");
const password = ref("");
const loginLoading = ref(false);

const audios = ref<PraiseAudio[]>([]);
const selectedAudios = ref<PraiseAudio[]>([]);
const searchText = ref("");
const currentAudio = ref<PraiseAudio | null>(null);
const currentSrc = ref("");
const playerKey = ref(0);
const loading = ref(true);

const {notifyError} = useNotification();

const filteredAudios = computed(() => {
  return audios.value.filter((audio) => audio.title.includes(searchText.value));
});

/**
 * init
 */
const offAuth = PraiseAuth.onAuthStateChanged((authUser) => {
  const wasLoggedOut = !user.value;
  user.value = authUser;
  authReady.value = true;
  if (authUser && wasLoggedOut) getAudios();
});

onUnmounted(() => offAuth());

/**
 * methods
 */
const login = async () => {
  if (!email.value || !password.value || loginLoading.value) return;
  loginLoading.value = true;
  try {
    await PraiseAuth.login(email.value, password.value);
    password.value = "";
  } catch (e) {
    console.error(e);
    notifyError("ログインできませんでした。メールアドレスとパスワードを確認してください。");
  } finally {
    loginLoading.value = false;
  }
};

const logout = async () => {
  await PraiseAuth.logout();
  closePlayer();
  audios.value = [];
  selectedAudios.value = [];
};

const getAudios = async () => {
  loading.value = true;
  audios.value = [];
  selectedAudios.value = [];

  const songs = await PraiseFirestore.getSongsForOperator();
  audios.value = songs.sort((a, b) => (a.firstLetter > b.firstLetter ? 1 : -1));
  if (songs.length === 0) notifyError("曲一覧を取得できませんでした。");

  loading.value = false;
};

const playFromStart = async (audio: PraiseAudio) => {
  currentSrc.value = await PraiseFirestore.resolvePlayableSrc(audio);
  currentAudio.value = audio;
  playerKey.value++; // 同じ曲でも先頭から再生し直す
  audios.value.forEach((a) => (a.isPlaying = false));
  audio.isPlaying = true;
};

const closePlayer = () => {
  currentAudio.value = null;
  currentSrc.value = "";
  audios.value.forEach((a) => (a.isPlaying = false));
};

const selectClicked = (audio: PraiseAudio, checked: boolean) => {
  if (checked) selected(audio);
  else unselected(audio);
};

// 曲一覧からチェックした場合
const selected = (audio: PraiseAudio) => {
  selectedAudios.value.push(audio);
};

// 曲一覧からチェックを外した場合
const unselected = (audio: PraiseAudio) => {
  selectedAudios.value = selectedAudios.value.filter((s) => audio.title !== s.title);
};

// チェックした曲リストから外した場合（曲一覧のチェックも外す）
const removeAt = (i: number) => {
  const removeTarget = selectedAudios.value[i];
  unselected(removeTarget);
  audios.value.forEach((audio) => {
    if (audio.title === removeTarget.title) audio.selected = false;
  });
};

// 頭文字が前の行と変わったときだけ表示する
const firstLetterLabel = (i: number) => {
  const audio = filteredAudios.value[i];
  if (i === 0) return audio.firstLetter;

  return audio.firstLetter === filteredAudios.value[i - 1].firstLetter ? "" : audio.firstLetter;
};
</script>

<style scoped>
/* 下部固定プレイヤーに隠れないようにする */
.has-player {
  padding-bottom: 130px;
}

.login-wrap {
  max-width: 420px;
}

.setlist-no {
  font-family: var(--pp-font-mono);
  font-size: 0.75rem;
  min-width: 1.5rem;
  text-align: center;
  margin-right: 0.5rem;
}
</style>
