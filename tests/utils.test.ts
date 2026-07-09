import {describe, expect, it} from 'vitest'
import {isAllowedMediaType, isAudioType, isVideoType} from '../app/utils/media'
import {isPresent} from '../app/utils/value'
import {minSecColonFrom} from '../app/utils/format'

describe('media', () => {
    it('video/* を動画と判定する', () => {
        expect(isVideoType('video/mp4')).toBe(true)
        expect(isVideoType('audio/mpeg')).toBe(false)
        expect(isVideoType('')).toBe(false)
        expect(isVideoType(undefined)).toBe(false)
    })

    it('audio/* を音声と判定する', () => {
        expect(isAudioType('audio/mpeg')).toBe(true)
        expect(isAudioType('video/mp4')).toBe(false)
        expect(isAudioType(null)).toBe(false)
    })

    it('動画・音声のみ許可する', () => {
        expect(isAllowedMediaType('video/mp4')).toBe(true)
        expect(isAllowedMediaType('audio/wav')).toBe(true)
        expect(isAllowedMediaType('image/png')).toBe(false)
        expect(isAllowedMediaType('')).toBe(false)
    })
})

describe('isPresent', () => {
    it('undefined / null / 空文字 は未入力扱い', () => {
        expect(isPresent(undefined)).toBe(false)
        expect(isPresent(null)).toBe(false)
        expect(isPresent('')).toBe(false)
    })

    it('値があれば true', () => {
        expect(isPresent('a')).toBe(true)
        expect(isPresent(0)).toBe(true)
        expect(isPresent({})).toBe(true)
    })
})

describe('minSecColonFrom', () => {
    it('秒数を mm:ss 形式にする', () => {
        expect(minSecColonFrom(0)).toBe('00:00')
        expect(minSecColonFrom(59)).toBe('00:59')
        expect(minSecColonFrom(61.5)).toBe('01:01')
        expect(minSecColonFrom(600)).toBe('10:00')
    })

    it('数値以外は空文字を返す', () => {
        expect(minSecColonFrom(null)).toBe('')
        expect(minSecColonFrom(undefined)).toBe('')
    })
})
