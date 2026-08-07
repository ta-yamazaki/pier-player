import { initializeApp, getApps } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Pier Praise Firebaseプロジェクト（pier-members-portal と同一プロジェクトを参照）
// Firebase WebのapiKeyは公開情報であり、アクセス制御はFirestoreルール側で行う
const praiseFirebaseConfig = {
  apiKey: "AIzaSyBzCLXCkyHXQIxNT5cYTDQGC9b0wKqI-vI",
  authDomain: "pier-praise.firebaseapp.com",
  projectId: "pier-praise",
  storageBucket: "pier-praise.appspot.com",
  messagingSenderId: "696567070196",
  appId: "1:696567070196:web:33aef36374b23eae934da1",
  measurementId: "G-JR7MW5HZQV",
}

const _getOrInitApp = (config: object, name: string) =>
  getApps().find(a => a.name === name) || initializeApp(config, name)

export const PraiseFirebaseApp = _getOrInitApp(praiseFirebaseConfig, "pierPraise")

export const praiseAuth = getAuth(PraiseFirebaseApp)
export const praiseFirestore = getFirestore(PraiseFirebaseApp)
export const praiseStorage = getStorage(PraiseFirebaseApp)
