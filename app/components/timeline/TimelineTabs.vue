<template>
  <EditableTabs
      :model-value="modelValue"
      :remove-message="removeMessage"
      :tabs="tabs"
      @update:model-value="emit('update:modelValue', $event)"/>
</template>

<script lang="ts" setup>
import EditableTabs from '~/components/common/EditableTabs.vue'
import type {TimelineTab} from '~/types/models'

/**
 * タイムラインのタブバー。タブ一覧の永続化を受け持つ。
 */

/**
 * props
 */
interface Props {
  /** 選択中のタブID */
  modelValue: string;
}

defineProps<Props>();

/**
 * emits
 */
type Emits = {
  (event: "update:modelValue", value: string): void;
};
const emit = defineEmits<Emits>();

/**
 * state
 */
const timelineApi = window.timelineApi

const tabs = useStoredList<TimelineTab>(
    () => timelineApi.getTabs(),
    (list) => timelineApi.storeTabs(list),
)

const removeMessage = (tab: { name: string }) =>
    `タブ「${tab.name}」を削除します。\nこのタブに登録した動画・音源も削除されます。よろしいですか？`
</script>
