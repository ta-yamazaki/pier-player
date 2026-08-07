import {describe, expect, it} from 'vitest'
import {
  clipsToShowcaseVideos,
  parseClipId,
  parseJwtToken,
  parseShowcaseClips,
  parseShowcaseId,
  sliceClipsJson,
  toShowcaseVideos,
} from '../app/utils/vimeo'

const wrap = (json: string) =>
    `<script>var config = {"album":{"id":1},"clips":${json},"error":null};</script>`

describe('sliceClipsJson', () => {
  it('ネストした配列を含んでいても最後まで切り出す', () => {
    const json = '[{"title":"A","tags":[]},{"title":"B","tags":["x","y"]},{"title":"C"}]'
    expect(sliceClipsJson(wrap(json))).toBe(json)
  })

  it('ネストしたオブジェクトを含んでいても最後まで切り出す', () => {
    const json = '[{"title":"A","owner":{"pictures":{"sizes":[{"w":100}]}}},{"title":"B"}]'
    expect(sliceClipsJson(wrap(json))).toBe(json)
  })

  it('文字列中の括弧に影響されない', () => {
    const json = '[{"title":"資料[1]"},{"title":"}]"},{"title":"エスケープ\\\\"}]'
    expect(sliceClipsJson(wrap(json))).toBe(json)
  })

  it('clipsがnull（パスワード未認証）のときはnull', () => {
    const html = '<script>var config = {"clips":null,"error":"album_password","x":[1]};</script>'
    expect(sliceClipsJson(html)).toBeNull()
  })

  it('clipsキーが無いときはnull', () => {
    expect(sliceClipsJson('<html><body>nothing</body></html>')).toBeNull()
  })

  it('配列が閉じていないときはnull', () => {
    expect(sliceClipsJson('"clips":[{"title":"A"}')).toBeNull()
  })
})

describe('parseShowcaseClips', () => {
  it('全件のタイトルを取得できる', () => {
    const json = '[{"title":"1"},{"title":"2","tags":[]},{"title":"3"},{"title":"4"},'
        + '{"title":"5"},{"title":"6"},{"title":"7"},{"title":"20260805水曜説教資料1"}]'
    const clips = parseShowcaseClips(wrap(json))
    expect(clips).toHaveLength(8)
    expect(clips?.[7]?.title).toBe('20260805水曜説教資料1')
  })

  it('壊れたJSONではnull', () => {
    expect(parseShowcaseClips('"clips":[{"title":]')).toBeNull()
  })
})

describe('parseShowcaseId', () => {
  it('埋め込みURLからIDを取り出す', () => {
    expect(parseShowcaseId('https://vimeo.com/showcase/11816668/embed')).toBe('11816668')
  })

  it('通常のショーケースURLからも取り出す', () => {
    expect(parseShowcaseId('https://vimeo.com/showcase/11816668?share=copy')).toBe('11816668')
  })

  it('ショーケースURLでなければnull', () => {
    expect(parseShowcaseId('https://vimeo.com/1156727297')).toBeNull()
  })
})

describe('parseJwtToken', () => {
  it('埋め込みHTMLからJWTを取り出す', () => {
    const html = '<script> var jwtToken = "eyJ0eXAi.eyJleHAi.o46i1qKe-D33"; </script>'
    expect(parseJwtToken(html)).toBe('eyJ0eXAi.eyJleHAi.o46i1qKe-D33')
  })

  it('JWTが無ければnull', () => {
    expect(parseJwtToken('<script>var jwtToken = null;</script>')).toBeNull()
  })
})

describe('parseClipId', () => {
  it('動画URIからIDを取り出す', () => {
    expect(parseClipId('/videos/1215437065')).toBe('1215437065')
  })

  it('プレイヤーURLからもIDを取り出す', () => {
    expect(parseClipId('https://player.vimeo.com/video/1156727297/config?autoplay=1')).toBe('1156727297')
  })

  it('取り出せなければ空文字', () => {
    expect(parseClipId(undefined)).toBe('')
    expect(parseClipId('/users/240174561')).toBe('')
  })
})

describe('toShowcaseVideos', () => {
  it('APIの応答からタイトルと動画IDを取り出す', () => {
    const data = [
      {name: '20260805水曜説教資料1', uri: '/videos/1215437065'},
      {name: '20260802主日説教資料1', uri: '/videos/1156727297'},
    ]
    expect(toShowcaseVideos(data)).toEqual([
      {title: '20260805水曜説教資料1', clipId: '1215437065'},
      {title: '20260802主日説教資料1', clipId: '1156727297'},
    ])
  })

  it('uriが欠けていれば動画IDは空文字', () => {
    expect(toShowcaseVideos([{name: 'A'}])).toEqual([{title: 'A', clipId: ''}])
  })

  it('タイトルが無い要素は除外する', () => {
    expect(toShowcaseVideos([{uri: '/videos/1'}, {name: '', uri: '/videos/2'}])).toEqual([])
  })

  it('配列でなければ空配列', () => {
    expect(toShowcaseVideos(null)).toEqual([])
  })
})

describe('clipsToShowcaseVideos', () => {
  it('clipsのconfig URLから動画IDを取り出す', () => {
    const clips = [
      {title: 'A', config: 'https://player.vimeo.com/video/1156727297/config?autoplay=1'},
      {title: 'B'},
    ]
    expect(clipsToShowcaseVideos(clips)).toEqual([
      {title: 'A', clipId: '1156727297'},
      {title: 'B', clipId: ''},
    ])
  })
})
