import {onMounted, ref, type Ref, toRaw, watch} from 'vue'

/**
 * electron-store と同期するリスト
 * マウント時に load で読み込み、変更を検知して save で永続化する
 */
export function useStoredList<T>(
    load: () => Promise<T[]>,
    save: (list: T[]) => void,
): Ref<T[]> {
  const list = ref<T[]>([]) as Ref<T[]>

  onMounted(async () => {
    list.value = await load()
  })

  watch(list, (newVal) => {
    save(toRaw(newVal))
  }, {deep: true})

  return list
}
