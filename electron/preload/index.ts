import {contextBridge, ipcRenderer, webUtils} from 'electron'
import {channels} from "../utils/channels";
//
// // --------- Expose some API to the Renderer process ---------
// contextBridge.exposeInMainWorld('ipcRenderer', {
//     on(...args: Parameters<typeof ipcRenderer.on>) {
//         const [channel, listener] = args
//         return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
//     },
//     off(...args: Parameters<typeof ipcRenderer.off>) {
//         const [channel, ...omit] = args
//         return ipcRenderer.off(channel, ...omit)
//     },
//     send(...args: Parameters<typeof ipcRenderer.send>) {
//         const [channel, ...omit] = args
//         return ipcRenderer.send(channel, ...omit)
//     },
//     invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
//         const [channel, ...omit] = args
//         return ipcRenderer.invoke(channel, ...omit)
//     },
//
//     // You can expose other APTs you need here.
//     // ...
// })

/**
 * ファイル再生モード
 */
export const api = {
    // mainHandlers.jsの 'openSubWindow' チャンネルへ送信
    openSubWindow: (fileMeta: any) => ipcRenderer.invoke(channels.openSubWindow, fileMeta),
    closeSubWindow: () => ipcRenderer.invoke('close-window'),
    checkFilePath: (file: any) => ipcRenderer.invoke('checkFilePath', file),
    checkFilePaths: (files: any) => ipcRenderer.invoke('checkFilePaths', files),

    openFolder: (folderPath: any) => ipcRenderer.send("open-folder", folderPath),

    getFiles: (target: string) => ipcRenderer.invoke("getFiles", target),
    storeFiles: (target: string, files: any) => ipcRenderer.invoke("storeFiles", target, files),

    getVersion: () => ipcRenderer.invoke(channels.getVersion),
    checkUpdate: () => ipcRenderer.invoke('checkUpdate'),
};
contextBridge.exposeInMainWorld('api', api);

contextBridge.exposeInMainWorld('webUtils', webUtils)

/**
 * CGMモード
 */
export const cgmApi = {
    // cgmHandlers.jsの 'openCgm' チャンネルへ送信
    openCgm: (cgm: any) => ipcRenderer.invoke('openCgm', cgm),
    playCgm: () => ipcRenderer.invoke('playCgm'),
    closeCgm: () => ipcRenderer.invoke('closeCgm'),
    getCgmList: () => ipcRenderer.invoke("getCgmList"),
    storeCgmList: (cgmList: any) => ipcRenderer.invoke("storeCgmList", cgmList),

    // CGM windowからイベントを受け取る
    errorCgmOpen: (callback: any) => ipcRenderer.on('errorCgmOpen', callback),
}
contextBridge.exposeInMainWorld('cgm', cgmApi);

/**
 * Vimeoモード（個別動画）
 */
export const vimeoApi = {
    openVimeo: (url: string, password: string) => ipcRenderer.invoke('openVimeo', url, password),
    playVimeo: () => ipcRenderer.invoke('playVimeo'),
    closeVimeo: () => ipcRenderer.invoke('closeVimeo'),

    getVimeoList: () => ipcRenderer.invoke("getVimeoList"),
    storeVimeoList: (vimeoList: any[]) => ipcRenderer.invoke("storeVimeoList", vimeoList),

    //Vimeo画面から受け取る
    errorVimeoOpen: (callback: any) => ipcRenderer.on("errorVimeoOpen", callback),
};
contextBridge.exposeInMainWorld('vimeo', vimeoApi);

/**
 * Vimeoモード（ショーケース）
 */
export const showcaseApi = {
    openVimeoShowcase: (vimeo: any, showcaseUrl: string) => ipcRenderer.invoke('openShowcaseVimeo', vimeo, showcaseUrl),
    playVimeoShowcase: () => ipcRenderer.invoke('playShowcaseVimeo'),
    closeVimeoShowcase: () => ipcRenderer.invoke('closeShowcaseVimeo'),

    getPlayList: () => ipcRenderer.invoke("getShowcasePlayList"),
    storePlayList: (vimeoList: any) => ipcRenderer.invoke("storeShowcasePlayList", vimeoList),
    getShowcase: () => ipcRenderer.invoke("getShowcase"),
    storeShowcase: (showcase: any) => ipcRenderer.invoke("storeShowcase", showcase),
}
contextBridge.exposeInMainWorld('showcaseApi', showcaseApi);

/**
 * タイムラインモード
 */
export const timelineApi = {
    // mainWindowからhandlers.jsの 'openTimelineWindow' チャンネルへ送信
    openSubWindow: (fileMeta: any) => ipcRenderer.invoke('openTimelineWindow', fileMeta),
    closeSubWindow: () => ipcRenderer.invoke('closeTimelineWindow'),
    continuousPlay: (nextFileMeta: any) => ipcRenderer.invoke('timelineContinuousPlay', nextFileMeta),
    checkFilePath: (file: any) => ipcRenderer.invoke('checkTimelineFilePath', file),
    checkFilePaths: (files: any) => ipcRenderer.invoke('checkTimelineFilePaths', files),

    openFolder: (folderPath: any) => ipcRenderer.send("openTimelineFolder", folderPath),

    // player from mainPage
    mainPlayer: {
        restart: () => ipcRenderer.invoke('timelineRestart'),
        rewind: (seekTime: any) => ipcRenderer.invoke('timelineRewind', seekTime),
        play: () => ipcRenderer.invoke('timelinePlay'),
        pause: () => ipcRenderer.invoke('timelinePause'),
        forward: (seekTime: any) => ipcRenderer.invoke('timelineForward', seekTime),
        toEnd: () => ipcRenderer.invoke('timelineToEnd'),
        seek: (newTime: any) => ipcRenderer.invoke('timelineSeek', newTime),
        fileMetaChange: (fileMeta: any) => ipcRenderer.invoke('timelineFileMetaChange', fileMeta),
    },
    // player from playerPage
    listener: {
        ready: (callback: any) => ipcRenderer.on("timelineReady", callback),
        duration: (callback: any) => ipcRenderer.on("timelineDuration", callback),
        play: (callback: any) => ipcRenderer.on("timelinePlay", callback),
        timeupdate: (callback: any) => ipcRenderer.on('timelineTimeupdate', callback),
        paused: (callback: any) => ipcRenderer.on("timelinePaused", callback),
        ended: (callback: any) => ipcRenderer.on("timelineEnded", callback),
    },

    getFiles: () => ipcRenderer.invoke("getTimelineFiles"),
    storeFiles: (files: any) => ipcRenderer.invoke("storeTimelineFiles", files),
}
contextBridge.exposeInMainWorld('timeline', timelineApi);

// プリロードプロセスでは Node.js の全 API が利用可能です。
// Chrome 拡張機能と同じサンドボックスも持っています。
window.addEventListener('DOMContentLoaded', () => {

})


