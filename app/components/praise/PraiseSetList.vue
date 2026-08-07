<template>
  <div>
    <p v-if="items.length === 0" class="note">チェックした曲がここに並びます。</p>
    <SortableList :items="items" @remove="emit('remove', $event)">
      <template #default="{ item }">
        <div class="is-flex is-align-items-center">
          <span style="line-break: anywhere"><b>{{ item.title }}</b></span>
          <div class="ml-auto mr-0 play-icon">
            <NuxtIconPlayer
                name="mdi:play-circle"
                size="32"
                @click="emit('play', item)"/>
          </div>
        </div>
      </template>
    </SortableList>
  </div>
</template>

<script lang="ts" setup>
import SortableList from "~/components/common/SortableList.vue";
import NuxtIconPlayer from "~/components/icon/NuxtIconPlayer.vue";
import type {PraiseAudio} from "~/utils/praise/firestore";

/**
 * チェックした曲のセットリスト。並べ替えはSortableListが items を直接入れ替える。
 */
interface Props {
  items: PraiseAudio[];
}

defineProps<Props>();

// 1つめにイベント名, ２つ目にemitする値の型
type Emits = {
  (event: "remove", index: number): void;
  (event: "play", audio: PraiseAudio): void;
};
const emit = defineEmits<Emits>();
</script>

<style scoped>
.play-icon {
  color: var(--pp-cyan);
}

/* 再生中の行は赤タリー(is-live)ではなく、再生ボタンと同じシアンのトーンで示す */
:deep(.table tr.is-live) {
  background: var(--pp-cyan-soft);
}

:deep(.table tr.is-live td:first-child) {
  box-shadow: inset 3px 0 0 var(--pp-cyan);
}
</style>
