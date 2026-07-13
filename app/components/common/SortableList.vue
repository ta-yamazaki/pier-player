<template>
  <div v-if="items.length > 0" :class="{'box py-1 px-2': boxed}">
    <table :class="{'is-plain': !boxed}" class="table my-2 is-fullwidth sortable-list">
      <thead v-if="$slots.head">
      <slot name="head"/>
      </thead>
      <tbody>
      <tr
          v-for="(item, i) in items"
          :key="item.id"
          :class="{
            'dragging': i === dragIndex,
            'is-standby': item.isViewed && !item.isPlaying,
            'is-live': item.isPlaying
          }">
        <td
            :draggable="draggable"
            class="cell-drag is-draggable"
            @dragend="dragEnd()"
            @dragenter="dragEnter(i)"
            @dragstart="dragStart(i)"
            @dragover.prevent>
          <NuxtIcon class="m-0 drag-handle" name="ic:baseline-drag-indicator"/>
        </td>
        <td class="cell-content">
          <slot :index="i" :item="item"/>
        </td>
        <td class="cell-delete">
          <button class="delete" @click="emit('remove', i)"/>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import {computed} from "vue";
import NuxtIcon from "~/components/icon/NuxtIcon.vue";

/**
 * 一覧テーブルの共通コンポーネント。
 * 「ドラッグハンドル｜行コンテンツ（デフォルトslot）｜削除ボタン」の3カラム構成。
 * 行の状態表示は item.isPlaying → is-live、item.isViewed → is-standby で統一。
 * 並べ替えは items を直接並び替える。削除は remove イベントを親が処理する。
 */
interface Props {
  /** 表示するリスト（並べ替えで直接変更される。各要素に安定した id が必要） */
  items: any[];
  /** false でボックス・罫線なしの素のテーブルにする（行自体がカードのタイムライン用） */
  boxed?: boolean;
  /** ドラッグ並べ替えの許可 */
  draggable?: boolean;
  /** falseを返すと並べ替えを禁止する（省略時は常に許可） */
  canDrag?: () => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  boxed: true,
  draggable: true,
  canDrag: undefined,
});

/**
 * emits
 */
// 1つめにイベント名, ２つ目にemitする値の型
type Emits = {
  (event: "remove", index: number): void;
};
const emit = defineEmits<Emits>();

const list = computed(() => props.items);
const {dragIndex, dragStart, dragEnter, dragEnd} = useDragSort(list, props.canDrag);
</script>

<style scoped>
td {
  vertical-align: middle;
}

.cell-drag,
.cell-delete {
  width: 0;
  white-space: nowrap;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.cell-delete {
  padding-right: 0.5rem;
}

.sortable-list.is-plain td {
  border: none;
}
</style>
