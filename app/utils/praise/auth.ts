import {
  inMemoryPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth"
import { praiseAuth } from "~/utils/praise/firebase"

export type { User }

/**
 * アプリ起動時は必ず未ログインから始める。
 * 認証情報はメモリのみに保持するため、アプリを閉じるとセッションは失われる。
 * 旧バージョンがブラウザストレージに永続化したセッションもここで破棄する。
 */
const ready = (async () => {
  await praiseAuth.authStateReady()
  if (praiseAuth.currentUser) await signOut(praiseAuth)
  await setPersistence(praiseAuth, inMemoryPersistence)
})()

export const PraiseAuth = {
  /**
   * 認証状態の初期化完了を待つ Promise。
   * onAuthStateChanged を登録する前に必ず待つこと（前回セッションで一瞬ログイン扱いになるのを防ぐ）
   */
  ready,

  /**
   * メール・パスワードでログインする
   */
  async login(email: string, password: string) {
    await ready
    return signInWithEmailAndPassword(praiseAuth, email, password)
  },

  logout() {
    return signOut(praiseAuth)
  },

  /**
   * ログイン状態の監視。解除関数を返す
   */
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(praiseAuth, callback)
  },
}
