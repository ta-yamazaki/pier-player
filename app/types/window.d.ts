/**
 * preload（contextBridge）で expose される API の型定義
 * 実体は electron/preload/preload.ts
 */
import type {
  api,
  cgmApi,
  commonApi,
  convertApi,
  praiseApi,
  showcaseApi,
  timelineApi,
  vimeoApi,
} from '../../electron/preload/preload'

declare global {
  interface Window {
    api: typeof api
    cgmApi: typeof cgmApi
    vimeoApi: typeof vimeoApi
    showcaseApi: typeof showcaseApi
    timelineApi: typeof timelineApi
    praiseApi: typeof praiseApi
    convertApi: typeof convertApi
    commonApi: typeof commonApi
    webUtils: {
      getPathForFile: (file: File) => string
    }
  }
}

export {}
