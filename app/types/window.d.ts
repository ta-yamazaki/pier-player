/**
 * preload（contextBridge）で expose される API の型定義
 * 実体は electron/preload/preload.ts
 */
import type {
    api,
    cgmApi,
    commonApi,
    convertApi,
    showcaseApi,
    timelineApi,
    vimeoApi,
} from '../../electron/preload/preload'

declare global {
    interface Window {
        api: typeof api
        cgm: typeof cgmApi
        vimeo: typeof vimeoApi
        showcaseApi: typeof showcaseApi
        timeline: typeof timelineApi
        convertApi: typeof convertApi
        commonApi: typeof commonApi
        webUtils: {
            getPathForFile: (file: File) => string
        }
    }
}

export {}
