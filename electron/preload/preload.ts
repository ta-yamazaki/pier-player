import {contextBridge, ipcRenderer, webUtils} from 'electron'
import {
    CgmChannels,
    CommonChannels,
    ConvertChannels,
    FileChannels,
    PraiseChannels,
    ShowcaseChannels,
    TimelineChannels,
    VimeoChannels,
} from '../ipc/channels'

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
    openSubWindow: (fileMeta: any) => ipcRenderer.invoke(FileChannels.openSubWindow, fileMeta),
    closeSubWindow: () => ipcRenderer.invoke(FileChannels.closeSubWindow),
    checkFilePath: (file: any) => ipcRenderer.invoke(FileChannels.checkFilePath, file),

    getFiles: (target: string) => ipcRenderer.invoke(FileChannels.getFiles, target),
    storeFiles: (target: string, files: any) => ipcRenderer.invoke(FileChannels.storeFiles, target, files),
};
contextBridge.exposeInMainWorld('api', api);

/**
 * CGMモード
 */
export const cgmApi = {
    openCgm: (cgm: any) => ipcRenderer.invoke(CgmChannels.open, cgm),
    playCgm: () => ipcRenderer.invoke(CgmChannels.play),
    closeCgm: () => ipcRenderer.invoke(CgmChannels.close),
    getCgmList: () => ipcRenderer.invoke(CgmChannels.getList),
    storeCgmList: (cgmList: any) => ipcRenderer.invoke(CgmChannels.storeList, cgmList),

    // CGM windowからイベントを受け取る
    errorCgmOpen: listen(CgmChannels.errorOpen),
}
contextBridge.exposeInMainWorld('cgmApi', cgmApi);

/**
 * Vimeoモード（個別動画）
 */
export const vimeoApi = {
    openVimeo: (url: string, password: string) => ipcRenderer.invoke(VimeoChannels.open, url, password),
    playVimeo: () => ipcRenderer.invoke(VimeoChannels.play),
    closeVimeo: () => ipcRenderer.invoke(VimeoChannels.close),

    getVimeoList: () => ipcRenderer.invoke(VimeoChannels.getList),
    storeVimeoList: (vimeoList: any[]) => ipcRenderer.invoke(VimeoChannels.storeList, vimeoList),
};
contextBridge.exposeInMainWorld('vimeoApi', vimeoApi);

/**
 * Vimeoモード（ショーケース）
 */
export const showcaseApi = {
    openVimeoShowcase: (vimeo: any, showcaseUrl: string) => ipcRenderer.invoke(ShowcaseChannels.open, vimeo, showcaseUrl),
    playVimeoShowcase: () => ipcRenderer.invoke(ShowcaseChannels.play),
    closeVimeoShowcase: () => ipcRenderer.invoke(ShowcaseChannels.close),

    getPlayList: () => ipcRenderer.invoke(ShowcaseChannels.getPlayList),
    storePlayList: (vimeoList: any) => ipcRenderer.invoke(ShowcaseChannels.storePlayList, vimeoList),
    getShowcase: () => ipcRenderer.invoke(ShowcaseChannels.getShowcase),
    storeShowcase: (showcase: any) => ipcRenderer.invoke(ShowcaseChannels.storeShowcase, showcase),
}
contextBridge.exposeInMainWorld('showcaseApi', showcaseApi);

/**
 * タイムラインモード
 */
export const timelineApi = {
    openTimelineWindow: (fileMeta: any) => ipcRenderer.invoke(TimelineChannels.openWindow, fileMeta),
    closeTimelineWindow: () => ipcRenderer.invoke(TimelineChannels.closeWindow),
    continuousPlay: (nextFileMeta: any) => ipcRenderer.invoke(TimelineChannels.continuousPlay, nextFileMeta),
    checkFilePath: (file: any) => ipcRenderer.invoke(FileChannels.checkFilePath, file),

    // player from mainPage
    mainPlayer: {
        restart: () => ipcRenderer.invoke(TimelineChannels.restart),
        rewind: (seekTime: any) => ipcRenderer.invoke(TimelineChannels.rewind, seekTime),
        play: () => ipcRenderer.invoke(TimelineChannels.play),
        pause: () => ipcRenderer.invoke(TimelineChannels.pause),
        forward: (seekTime: any) => ipcRenderer.invoke(TimelineChannels.forward, seekTime),
        toEnd: () => ipcRenderer.invoke(TimelineChannels.toEnd),
        seek: (newTime: any) => ipcRenderer.invoke(TimelineChannels.seek, newTime),
        fileMetaChange: (fileMeta: any) => ipcRenderer.invoke(TimelineChannels.fileMetaChange, fileMeta),
    },
    // player from playerPage
    listener: {
        ready: listen(TimelineChannels.ready),
        duration: listen(TimelineChannels.duration),
        play: listen(TimelineChannels.play),
        timeupdate: listen(TimelineChannels.timeupdate),
        paused: listen(TimelineChannels.paused),
        ended: listen(TimelineChannels.ended),
    },

    getFiles: () => ipcRenderer.invoke(TimelineChannels.getFiles),
    storeFiles: (files: any) => ipcRenderer.invoke(TimelineChannels.storeFiles, files),
    storeAdditionalFiles: (files: any[]) => ipcRenderer.invoke(TimelineChannels.storeAdditionalFiles, files),

    getHistory: () => ipcRenderer.invoke(TimelineChannels.getHistory),
    storeHistory: (file: any) => ipcRenderer.invoke(TimelineChannels.storeHistory, file),

    getWaveformPeaks: () => ipcRenderer.invoke(TimelineChannels.getWaveformPeaks),
    storeWaveformPeaks: (path: string, entry: { peaks: number[][], duration: number, mediaDuration?: number }) =>
        ipcRenderer.invoke(TimelineChannels.storeWaveformPeaks, path, entry),
    deleteWaveformPeaks: (path: string) => ipcRenderer.invoke(TimelineChannels.deleteWaveformPeaks, path),
}
contextBridge.exposeInMainWorld('timelineApi', timelineApi);

/**
 * Praiseモード
 */
export const praiseApi = {
    getSetList: () => ipcRenderer.invoke(PraiseChannels.getSetList),
    storeSetList: (setList: { id: string, title: string }[]) => ipcRenderer.invoke(PraiseChannels.storeSetList, setList),
};
contextBridge.exposeInMainWorld('praiseApi', praiseApi);

/**
 * 変換モード
 */
export const convertApi = {
    convertPitch: (filePath: string, semitones: number) => ipcRenderer.invoke(ConvertChannels.convertPitch, filePath, semitones),
    onConvertProgress: listenData(ConvertChannels.convertProgress),

    getLoudness: (filePath: string) => ipcRenderer.invoke(ConvertChannels.getLoudness, filePath),
    normalize: (filePath: string, isVideo: boolean, isAudio: boolean) => ipcRenderer.invoke(ConvertChannels.normalize, filePath, isVideo, isAudio),
    onNormalizeProgress: listenData(ConvertChannels.normalizeProgress),
};
contextBridge.exposeInMainWorld('convertApi', convertApi);

/**
 * 共通API
 */
export const commonApi = {
    openFolder: (path: any) => {
        const folderPath = path.replace(/[\\/][^\\/]+$/, "")
        ipcRenderer.send(CommonChannels.openFolder, folderPath);
    },
    getCurrentVersion: () => ipcRenderer.invoke(CommonChannels.getVersion),
    checkUpdate: () => ipcRenderer.invoke(CommonChannels.checkUpdate),

    getTotalDuration: listenData(ConvertChannels.totalDuration),
};
contextBridge.exposeInMainWorld('commonApi', commonApi);

contextBridge.exposeInMainWorld('webUtils', webUtils)
