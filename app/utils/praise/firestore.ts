import { collection, query, orderBy, where, getDocs } from "firebase/firestore"
import { ref as storageRef, getDownloadURL } from "firebase/storage"
import { praiseFirestore, praiseStorage } from "~/utils/praise/firebase"

export interface PraiseAudio {
  id: string
  title: string
  firstLetter: string
  src: string
  storageSrc?: string
  selected?: boolean
  isPlaying?: boolean
}

// gs:// URI → HTTPS download URL のキャッシュ
// getDownloadURL() が返すトークンは明示的に失効させない限り期限切れにならないため、
// セッション内で永続キャッシュする
const _urlCache = new Map<string, string>() // storageSrc → url

const audiosCollection = collection(praiseFirestore, "audios")

export const PraiseFirestore = {
  /**
   * 通配信使命者用の曲一覧を取得する
   */
  getSongsForOperator(): Promise<PraiseAudio[]> {
    return getDocs(query(audiosCollection, where("isClosed", "==", false), orderBy("order", "desc")))
      .then((songs) => {
        return songs.docs.map((song) => ({ id: song.id, ...song.data() }) as PraiseAudio)
      })
      .catch((e) => {
        console.error(e)
        return []
      })
  },

  /**
   * storageSrc（gs://）があればダウンロードURLに解決し、なければ src をそのまま返す
   */
  async resolvePlayableSrc(audio: PraiseAudio): Promise<string> {
    if (!audio.storageSrc) return audio.src

    const cached = _urlCache.get(audio.storageSrc)
    if (cached) return cached

    const url = await getDownloadURL(storageRef(praiseStorage, audio.storageSrc))
    _urlCache.set(audio.storageSrc, url)
    return url
  },
}
