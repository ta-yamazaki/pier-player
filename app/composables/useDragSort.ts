import {ref, type Ref} from 'vue'

/**
 * リストのドラッグ&ドロップ並べ替え
 * @param list 並べ替え対象のリスト
 * @param canDrag falseを返すと並べ替えを禁止する（省略時は常に許可）
 */
export function useDragSort<T>(list: Ref<T[]>, canDrag?: () => boolean) {
  const dragIndex = ref<number | null>(null)

  function dragStart(i: number) {
    if (canDrag && !canDrag()) return
    dragIndex.value = i
  }

  function dragEnter(i: number) {
    if (canDrag && !canDrag()) return
    if (dragIndex.value === null || i === dragIndex.value) return
    const moved = list.value.splice(dragIndex.value, 1)[0]!
    list.value.splice(i, 0, moved)
    dragIndex.value = i
  }

  function dragEnd() {
    dragIndex.value = null
  }

  return {dragIndex, dragStart, dragEnter, dragEnd}
}
