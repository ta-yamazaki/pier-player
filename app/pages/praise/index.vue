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
    <PraiseLogin v-else-if="!user"/>

    <!-- ログイン済み -->
    <template v-else>
      <Loader v-if="loading" class="mt-6"/>
      <template v-else>
        <section>
          <h2 class="section-title">チェックした曲</h2>
          <PraiseSetList :items="selectedAudios" @play="playFromStart" @remove="removeAt"/>
        </section>
        <section class="mt-5">
          <PraiseSongTable :audios="audios" @play="playFromStart" @toggle-select="selectClicked"/>
        </section>
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
import {ref, watch, onUnmounted} from "vue";
import Loader from "~/components/common/Loader.vue";
import PraiseLogin from "~/components/praise/PraiseLogin.vue";
import PraiseSetList from "~/components/praise/PraiseSetList.vue";
import PraiseSongTable from "~/components/praise/PraiseSongTable.vue";
import PraiseAudioPlayer from "~/components/praise/PraiseAudioPlayer.vue";
import {PraiseFirestore, type PraiseAudio} from "~/utils/praise/firestore";
import {PraiseAuth, type User} from "~/utils/praise/auth";

/**
 * state
 */
const user = ref<User | null>(null);
const authReady = ref(false);

const audios = ref<PraiseAudio[]>([]);
const selectedAudios = ref<PraiseAudio[]>([]);
const currentAudio = ref<PraiseAudio | null>(null);
const currentSrc = ref("");
const playerKey = ref(0);
const loading = ref(true);

const {notifyError} = useNotification();
const praiseApi = window.praiseApi;

/**
 * init
 */
// 前回セッションの破棄が終わってから監視を始める（起動直後に一瞬ログイン扱いになるのを防ぐ）
let offAuth: (() => void) | null = null;
PraiseAuth.ready.then(() => {
  offAuth = PraiseAuth.onAuthStateChanged((authUser) => {
    const wasLoggedOut = !user.value;
    user.value = authUser;
    authReady.value = true;
    if (authUser && wasLoggedOut) getAudios();
  });
});

onUnmounted(() => offAuth?.());

/**
 * methods
 */
const logout = async () => {
  await PraiseAuth.logout();
  closePlayer();
  audios.value = [];
  selectedAudios.value = [];
};

const getAudios = async () => {
  loading.value = true;

  const songs = await PraiseFirestore.getSongsForOperator();
  if (songs.length === 0) {
    notifyError("曲一覧を取得できませんでした。");
    audios.value = [];
    selectedAudios.value = [];
    loading.value = false;
    return;
  }

  audios.value = songs.sort((a, b) => (a.firstLetter > b.firstLetter ? 1 : -1));
  await restoreSetList();

  loading.value = false;
};

// 保存済みセットリストを現在の曲一覧に突き合わせて復元する
const restoreSetList = async () => {
  const stored: { id: string, title: string }[] = await praiseApi.getSetList();
  const restored: PraiseAudio[] = [];
  for (const entry of stored) {
    const audio = audios.value.find((a) => a.id === entry.id);
    if (!audio) continue; // 配信終了などで曲一覧から消えた曲は捨てる
    audio.selected = true;
    restored.push(audio);
  }
  selectedAudios.value = restored;
};

// セットリストの追加・削除・並べ替えを保存する（再生状態などの変化では保存しない）
watch(
    () => selectedAudios.value.map((a) => a.id).join(","),
    () => {
      // 取得失敗時などに保存済みリストを空で上書きしない
      if (loading.value || audios.value.length === 0) return;
      praiseApi.storeSetList(selectedAudios.value.map((a) => ({id: a.id, title: a.title})));
    }
);

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
</script>

<style scoped>
/* 下部固定プレイヤーに隠れないようにする */
.has-player {
  padding-bottom: 130px;
}
</style>
