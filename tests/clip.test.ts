import {describe, expect, it} from 'vitest'
import {
    clampEndTrim,
    clampFade,
    clampStartTrim,
    MIN_EFFECTIVE_SEC,
    pxToSec,
    rulerStep,
    rulerTicks,
    snapSec,
    toSec,
} from '../app/utils/clip'

describe('toSec', () => {
    it('文字列数値を数値にする（永続化データの混入対応）', () => {
        expect(toSec('1.5')).toBe(1.5)
        expect(toSec(2)).toBe(2)
    })

    it('数値にならない値は 0 にする', () => {
        expect(toSec(undefined)).toBe(0)
        expect(toSec(null)).toBe(0)
        expect(toSec('abc')).toBe(0)
        expect(toSec(NaN)).toBe(0)
    })
})

describe('pxToSec', () => {
    const rect = {left: 100, width: 200}

    it('X座標を全尺座標の秒に変換する', () => {
        expect(pxToSec(100, rect, 60)).toBe(0)
        expect(pxToSec(200, rect, 60)).toBe(30)
        expect(pxToSec(300, rect, 60)).toBe(60)
    })

    it('範囲外は 0〜duration にクランプする', () => {
        expect(pxToSec(0, rect, 60)).toBe(0)
        expect(pxToSec(999, rect, 60)).toBe(60)
    })

    it('幅0や尺0では 0 を返す', () => {
        expect(pxToSec(150, {left: 100, width: 0}, 60)).toBe(0)
        expect(pxToSec(150, rect, 0)).toBe(0)
    })
})

describe('snapSec', () => {
    it('0.1秒刻みにスナップする', () => {
        expect(snapSec(1.234)).toBeCloseTo(1.2)
        expect(snapSec(1.25)).toBeCloseTo(1.3)
        expect(snapSec(0.04)).toBeCloseTo(0)
    })
})

describe('clampStartTrim / clampEndTrim', () => {
    it('0未満は 0 にする', () => {
        expect(clampStartTrim(-1, 60, 0)).toBe(0)
        expect(clampEndTrim(-1, 60, 0)).toBe(0)
    })

    it('反対側のトリムと最小有効幅を残してクランプする', () => {
        expect(clampStartTrim(999, 60, 10)).toBe(60 - 10 - MIN_EFFECTIVE_SEC)
        expect(clampEndTrim(999, 60, 5)).toBe(60 - 5 - MIN_EFFECTIVE_SEC)
    })

    it('文字列の反対側トリムも扱える', () => {
        expect(clampStartTrim(999, 60, '10')).toBe(60 - 10 - MIN_EFFECTIVE_SEC)
    })

    it('範囲内の値はそのまま', () => {
        expect(clampStartTrim(3.5, 60, 0)).toBe(3.5)
        expect(clampEndTrim('2.5', 60, 0)).toBe(2.5)
    })
})

describe('clampFade', () => {
    it('有効区間長を超えない', () => {
        expect(clampFade(999, 60, 10, 20)).toBe(30)
        expect(clampFade(-1, 60, 0, 0)).toBe(0)
        expect(clampFade(0.7, 60, 0, 0)).toBe(0.7)
    })

    it('トリムで有効区間が無い場合は 0', () => {
        expect(clampFade(5, 10, 6, 6)).toBe(0)
    })
})

describe('rulerStep / rulerTicks', () => {
    it('尺に応じてラベル過多にならない間隔を選ぶ', () => {
        expect(rulerStep(8)).toBe(1)
        expect(rulerStep(40)).toBe(5)
        expect(rulerStep(60)).toBe(10)
        expect(rulerStep(240)).toBe(30)
        expect(rulerStep(3600)).toBe(600)
        expect(rulerStep(99999)).toBe(600)
    })

    it('0 から duration 未満の目盛りを返す', () => {
        expect(rulerTicks(30)).toEqual([0, 5, 10, 15, 20, 25])
        expect(rulerTicks(0)).toEqual([])
    })
})
