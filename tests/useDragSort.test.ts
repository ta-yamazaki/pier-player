import {describe, expect, it} from 'vitest'
import {ref} from 'vue'
import {useDragSort} from '../app/composables/useDragSort'

describe('useDragSort', () => {
    it('ドラッグで要素を並べ替える', () => {
        const list = ref(['a', 'b', 'c'])
        const {dragIndex, dragStart, dragEnter, dragEnd} = useDragSort(list)

        dragStart(0)
        expect(dragIndex.value).toBe(0)

        dragEnter(2) // a を末尾へ
        expect(list.value).toEqual(['b', 'c', 'a'])
        expect(dragIndex.value).toBe(2)

        dragEnd()
        expect(dragIndex.value).toBeNull()
    })

    it('同じ位置へのdragEnterは何もしない', () => {
        const list = ref(['a', 'b'])
        const {dragStart, dragEnter} = useDragSort(list)

        dragStart(1)
        dragEnter(1)
        expect(list.value).toEqual(['a', 'b'])
    })

    it('dragStartしていない状態のdragEnterは何もしない', () => {
        const list = ref(['a', 'b'])
        const {dragEnter} = useDragSort(list)

        dragEnter(0)
        expect(list.value).toEqual(['a', 'b'])
    })

    it('canDragがfalseなら並べ替えを禁止する', () => {
        const list = ref(['a', 'b'])
        const {dragIndex, dragStart, dragEnter} = useDragSort(list, () => false)

        dragStart(0)
        expect(dragIndex.value).toBeNull()

        dragEnter(1)
        expect(list.value).toEqual(['a', 'b'])
    })
})
