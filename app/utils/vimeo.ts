// Vimeoショーケースの埋め込みHTML／API応答から再生リスト情報を取り出す純粋関数群

export type ShowcaseClip = {
  title?: string
  [key: string]: unknown
}

// ショーケースの映像1件。
// clipId は再生時に ?video=<clipId> で映像を指定するために使う。
export type ShowcaseVideo = {
  title: string
  clipId: string
}

// ショーケースURLからショーケースID（数値部分）を取り出す
export function parseShowcaseId(url: string): string | null {
  const m = url.match(/\/showcase\/(\d+)/)
  return m ? m[1]! : null
}

// 埋め込みHTMLに埋まっている、Vimeo APIを叩くための短命なJWTを取り出す
export function parseJwtToken(html: string): string | null {
  const m = html.match(/jwtToken\s*=\s*"([\w-]+\.[\w-]+\.[\w-]+)"/)
  return m ? m[1]! : null
}

// 動画URI（"/videos/1215437065"）やプレイヤーURLから動画IDを取り出す
export function parseClipId(source: unknown): string {
  if (typeof source !== 'string') return ''
  const m = source.match(/\/videos?\/(\d+)/)
  return m ? m[1]! : ''
}

// Vimeo API（/albums/{id}/videos）の応答をショーケース映像に変換する
export function toShowcaseVideos(data: unknown): ShowcaseVideo[] {
  if (!Array.isArray(data)) return []

  return data.flatMap((v) => {
    const title = typeof v?.name === 'string' ? v.name : ''
    if (!title) return []
    return [{title, clipId: parseClipId(v?.uri)}]
  })
}

// 埋め込みHTMLのclipsをショーケース映像に変換する（APIが使えないときのフォールバック）。
// clipsに含まれるのは埋め込み可の映像のみで、動画IDは config のURLから取り出す。
export function clipsToShowcaseVideos(clips: ShowcaseClip[]): ShowcaseVideo[] {
  return clips.map((clip) => ({
    title: typeof clip.title === 'string' ? clip.title : '',
    clipId: parseClipId(clip.config),
  }))
}

// HTML中の `"clips": [ ... ]` を括弧の対応を数えて切り出す。
// 正規表現の非貪欲マッチだとclip内のネストした配列で打ち切られるため使わない。
export function sliceClipsJson(html: string): string | null {
  const key = html.search(/"clips"\s*:\s*/)
  if (key === -1) return null

  const start = html.indexOf('[', key)
  if (start === -1) return null

  // `"clips": null` のように配列でない場合は、次のキーより先に `[` が来ない
  const between = html.slice(key, start)
  if (between.includes('}') || between.includes(',')) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < html.length; i++) {
    const c = html[i]

    if (inString) {
      if (escaped) escaped = false
      else if (c === '\\') escaped = true
      else if (c === '"') inString = false
      continue
    }

    if (c === '"') inString = true
    else if (c === '[' || c === '{') depth++
    else if (c === ']' || c === '}') {
      depth--
      if (depth === 0) return html.slice(start, i + 1)
    }
  }

  return null // 閉じ括弧が見つからない（HTMLが途中で切れている等）
}

// 埋め込みHTMLからclips配列をパースする。取り出せなければ null
export function parseShowcaseClips(html: string): ShowcaseClip[] | null {
  const json = sliceClipsJson(html)
  if (!json) return null

  try {
    const clips = JSON.parse(json)
    return Array.isArray(clips) ? clips : null
  } catch {
    return null
  }
}
