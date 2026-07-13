import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth"
import { praiseAuth } from "~/utils/praise/firebase"

export type { User }

export const PraiseAuth = {
  /**
   * メール・パスワードでログインする（アプリ再起動後もセッションを維持）
   */
  async login(email: string, password: string) {
    await setPersistence(praiseAuth, browserLocalPersistence)
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
