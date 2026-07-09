import {contextBridge, ipcRenderer, webUtils} from 'electron'

// on登録した際に解除関数を返す（コンポーネント再マウント時のリスナー蓄積防止）
const listen = (channel: string) => (callback: any) => {
    const listener = (event: any, ...args: any[]) => callback(event, ...args)
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
}

// callbackにdataのみ渡す版
const listenData = (channel: string) => (callback: any) => {
    const listener = (_event: any, data: any) => callback(data)
    ipcRenderer.on(channel, listener)
    return () => ipcRenderer.removeListener(channel, listener)
}

/**
 * ファイル再生モード
 */
export const api = {
    // mainHandlers.jsの 'openSubWindow' チャンネルへ送信
    openSubWindow: (fileMeta: any) => ipcRenderer.invoke("open-sub-window", fileMeta),
    closeSubWindow: () => ipcRenderer.invoke('close-window'),
    checkFilePath: (file: any) => ipcRenderer.invoke('checkFilePath', file),
    checkFilePaths: (files: any) => ipcRenderer.invoke('checkFilePaths', files),

    getFiles: (target: string) => ipcRenderer.invoke("getFiles", target),
    storeFiles: (target: string, files: any) => ipcRenderer.invoke("storeFiles", target, files),
};
contextBridge.exposeInMainWorld('api', api);

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
    errorCgmOpen: listen('errorCgmOpen'),
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
    errorVimeoOpen: listen("errorVimeoOpen"),
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
    openTimelineWindow: (fileMeta: any) => ipcRenderer.invoke('openTimelineWindow', fileMeta),
    closeTimelineWindow: () => ipcRenderer.invoke('closeTimelineWindow'),
    continuousPlay: (nextFileMeta: any) => ipcRenderer.invoke('timelineContinuousPlay', nextFileMeta),
    checkFilePath: (file: any) => ipcRenderer.invoke('checkTimelineFilePath', file),
    checkFilePaths: (files: any) => ipcRenderer.invoke('checkTimelineFilePaths', files),

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
        ready: listen("timelineReady"),
        duration: listen("timelineDuration"),
        play: listen("timelinePlay"),
        timeupdate: listen('timelineTimeupdate'),
        paused: listen("timelinePaused"),
        ended: listen("timelineEnded"),
    },

    getFiles: () => ipcRenderer.invoke("getTimelineFiles"),
    storeFiles: (files: any) => ipcRenderer.invoke("storeTimelineFiles", files),
    storeAdditionalFiles: (files: any[]) => ipcRenderer.invoke("storeAdditionalTimelineFiles", files),

    getHistory: () => ipcRenderer.invoke("getTimelineHistory"),
    storeHistory: (file: any) => ipcRenderer.invoke("storeTimelineHistory", file),
}
contextBridge.exposeInMainWorld('timeline', timelineApi);

/**
 * 変換モード
 */
const convertApi = {
    convertPitch: (filePath: string, semitones: number) => ipcRenderer.invoke('convert-pitch', filePath, semitones),
    onConvertProgress: listenData("convert-progress"),

    getLoudness: (filePath: string) => ipcRenderer.invoke('getLoudness', filePath),
    normalize: (filePath: string, isVideo: boolean, isAudio: boolean) => ipcRenderer.invoke('normalize-loudness', filePath, isVideo, isAudio),
    onNormalizeProgress: listenData("normalize-progress"),
};
contextBridge.exposeInMainWorld('convertApi', convertApi);

/**
 * 共通API
 */
const commonApi = {
    openFolder: (path: any) => {
        const folderPath = path.replace(/[\\/][^\\/]+$/, "")
        ipcRenderer.send("open-folder", folderPath);
    },
    getCurrentVersion: () => ipcRenderer.invoke("get-version"),
    checkUpdate: () => ipcRenderer.invoke('checkUpdate'),

    getTotalDuration: listenData("get-totalDuration"),
};
contextBridge.exposeInMainWorld('commonApi', commonApi);

contextBridge.exposeInMainWorld('webUtils', webUtils)

// プリロードプロセスでは Node.js の全 API が利用可能です。
// Chrome 拡張機能と同じサンドボックスも持っています。
window.addEventListener('DOMContentLoaded', () => {

})


