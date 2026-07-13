<template>
  <div>
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
    <table class="table is-narrow nowrap is-fullwidth is-hoverable my-2 song-table">
      <tbody>
      <tr
          v-for="(item, i) in filteredAudios"
          :key="item.id"
          :class="{'is-playing': item.isPlaying}">
        <td class="fitContent">
          <input
              v-model="item.selected"
              type="checkbox"
              @click="emit('toggleSelect', item, ($event.target as HTMLInputElement).checked)">
        </td>
        <td class="fitContent has-text-grey">{{ firstLetterLabel(i) }}</td>
        <td style="line-break: anywhere; white-space: normal">
          <b>{{ item.title }}</b>
        </td>
        <td class="fitContent play-icon">
          <NuxtIconPlayer
              name="mdi:play-circle"
              size="32"
              @click="emit('play', item)"/>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed} from "vue";
import NuxtIcon from "~/components/icon/NuxtIcon.vue";
import NuxtIconPlayer from "~/components/icon/NuxtIconPlayer.vue";
import type {PraiseAudio} from "~/utils/praise/firestore";

/**
 * 曲一覧テーブル（検索付き）。
 * チェック状態は item.selected を直接更新しつつ、セットリストへの追加・削除は親に委ねる。
 */
interface Props {
  audios: PraiseAudio[];
}

const props = defineProps<Props>();

// 1つめにイベント名, ２つ目にemitする値の型
type Emits = {
  (event: "toggleSelect", audio: PraiseAudio, checked: boolean): void;
  (event: "play", audio: PraiseAudio): void;
};
const emit = defineEmits<Emits>();

// state
const searchText = ref("");

const filteredAudios = computed(() => {
  return props.audios.filter((audio) => audio.title.includes(searchText.value));
});

// 頭文字が前の行と変わったときだけ表示する
const firstLetterLabel = (i: number) => {
  const audio = filteredAudios.value[i];
  if (i === 0) return audio.firstLetter;

  return audio.firstLetter === filteredAudios.value[i - 1].firstLetter ? "" : audio.firstLetter;
};
</script>

<style scoped>
/* Bulmaの .table td (vertical-align: top) より詳細度を上げて中央寄せにする */
table.song-table td {
  vertical-align: middle;
}

/* SVGアイコンとチェックボックスのベースライン由来のズレを防ぐ */
td :deep(svg) {
  display: block;
}

td input[type="checkbox"] {
  display: block;
}

.play-icon {
  color: var(--pp-cyan);
}

/* 再生中の曲は再生ボタンと同じシアンのトーンで示す */
.song-table tbody tr.is-playing {
  background-color: var(--pp-cyan-soft);
}

.song-table tbody tr.is-playing td:first-child {
  box-shadow: inset 3px 0 0 var(--pp-cyan);
}
</style>
