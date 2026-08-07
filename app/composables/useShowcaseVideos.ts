import {
  clipsToShowcaseVideos,
  parseJwtToken,
  parseShowcaseClips,
  parseShowcaseId,
  type ShowcaseVideo,
  toShowcaseVideos,
} from "~/utils/vimeo";

export type ShowcaseVideosResult = {
  videos: ShowcaseVideo[]
  // 'api' = Vimeo API から全件取得 / 'embed' = 埋め込みHTMLのclipsから取得（埋め込み可の映像のみ）
  source: 'api' | 'embed'
}

// APIの1ページあたり件数（Vimeo APIの上限は100）
const PER_PAGE = 100
// 想定外のページングで無限ループしないための上限
const MAX_PAGES = 20

// Vimeo APIでショーケースの映像を全件取得する。
// 埋め込みHTMLのclipsと違い、埋め込み不可（privacy.embed が public 以外）の映像も含まれる。
async function fetchViaApi(showcaseId: string, password: string, jwt: string): Promise<ShowcaseVideo[] | null> {
  const videos: ShowcaseVideo[] = []

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = `https://api.vimeo.com/albums/${showcaseId}/videos`
        + `?password=${encodeURIComponent(password)}`
        + `&per_page=${PER_PAGE}&page=${page}&sort=manual&fields=name,uri`

    const res = await fetch(url, {headers: {Authorization: `jwt ${jwt}`}})
    if (!res.ok) return null

    const json = await res.json()
    videos.push(...toShowcaseVideos(json?.data))

    if (!json?.paging?.next) break
  }

  return videos.length ? videos : null
}

export function useShowcaseVideos() {
  // ショーケースの映像一覧を取得する。取得できなければ null
  const fetchShowcaseVideos = async (showcaseEmbedUrl: string, password: string): Promise<ShowcaseVideosResult | null> => {
    const res = await fetch(`${showcaseEmbedUrl}?password=${encodeURIComponent(password)}`)
    const html = await res.text()

    // APIを叩くためのJWTは埋め込みHTMLに含まれる（数分で失効するため毎回取り直す）
    const showcaseId = parseShowcaseId(showcaseEmbedUrl)
    const jwt = parseJwtToken(html)
    if (showcaseId && jwt) {
      const videos = await fetchViaApi(showcaseId, password, jwt)
      if (videos) return {videos, source: 'api'}
    }

    // APIが使えない場合は従来どおり埋め込みHTMLのclipsから取得する
    const clips = parseShowcaseClips(html)
    if (!clips) return null

    return {videos: clipsToShowcaseVideos(clips), source: 'embed'}
  }

  return {fetchShowcaseVideos}
}
