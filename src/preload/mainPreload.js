const {contextBridge, webUtils, ipcRenderer} = require('electron');

/**
 * ファイル再生モード
 */
contextBridge.exposeInMainWorld('api', {
    // mainHandlers.jsの 'openSubWindow' チャンネルへ送信
    openSubWindow: (fileMeta) => ipcRenderer.invoke('openSubWindow', fileMeta),
    closeSubWindow: () => ipcRenderer.invoke('close-window'),
    checkFilePath: (file) => ipcRenderer.invoke('checkFilePath', file),
    checkFilePaths: (files) => ipcRenderer.invoke('checkFilePaths', files),

    openFolder: (folderPath) => ipcRenderer.send("open-folder", folderPath),

    getFiles: (target) => ipcRenderer.invoke("getFiles", target),
    storeFiles: (target, files) => ipcRenderer.invoke("storeFiles", target, files),

    getVersion: () => ipcRenderer.invoke('getVersion'),
    checkUpdate: () => ipcRenderer.invoke('checkUpdate'),
});

contextBridge.exposeInMainWorld('webUtils', webUtils)

/**
 * CGMモード
 */
contextBridge.exposeInMainWorld('cgm', {
    // cgmHandlers.jsの 'openCgm' チャンネルへ送信
    openCgm: (cgm) => ipcRenderer.invoke('openCgm', cgm),
    playCgm: () => ipcRenderer.invoke('playCgm'),
    closeCgm: () => ipcRenderer.invoke('closeCgm'),
    getCgmList: () => ipcRenderer.invoke("getCgmList"),
    storeCgmList: (cgmList) => ipcRenderer.invoke("storeCgmList", cgmList),

    // CGM windowからイベントを受け取る
    errorCgmOpen: (callback) => ipcRenderer.on('errorCgmOpen', callback),
});

/**
 * Vimeoモード（個別動画）
 */
contextBridge.exposeInMainWorld('vimeo', {
    openVimeo: (url, password) => ipcRenderer.invoke('openVimeo', url, password),
    playVimeo: () => ipcRenderer.invoke('playVimeo'),
    closeVimeo: () => ipcRenderer.invoke('closeVimeo'),

    getVimeoList: () => ipcRenderer.invoke("getVimeoList"),
    storeVimeoList: (vimeoList) => ipcRenderer.invoke("storeVimeoList", vimeoList),

    //Vimeo画面から受け取る
    errorVimeoOpen: (callback) => ipcRenderer.on("errorVimeoOpen", callback),
});

/**
 * Vimeoモード（ショーケース）
 */
contextBridge.exposeInMainWorld('vimeoShowcase', {
    openVimeoShowcase: (vimeo, showcaseUrl) => ipcRenderer.invoke('openShowcaseVimeo', vimeo, showcaseUrl),
    playVimeoShowcase: () => ipcRenderer.invoke('playShowcaseVimeo'),
    closeVimeoShowcase: () => ipcRenderer.invoke('closeShowcaseVimeo'),

    getPlayList: () => ipcRenderer.invoke("getShowcasePlayList"),
    storePlayList: (vimeoList) => ipcRenderer.invoke("storeShowcasePlayList", vimeoList),
    getShowcase: () => ipcRenderer.invoke("getShowcase"),
    storeShowcase: (showcase) => ipcRenderer.invoke("storeShowcase", showcase),
});

/**
 * タイムラインモード
 */
contextBridge.exposeInMainWorld('timeline', {
    // mainHandlers.jsの 'openSubWindow' チャンネルへ送信
    openSubWindow: (fileMeta) => ipcRenderer.invoke('openTimelineWindow', fileMeta),
    closeSubWindow: () => ipcRenderer.invoke('closeTimelineWindow'),
    continuousPlay: (nextFileMeta) => ipcRenderer.invoke('timelineContinuousPlay', nextFileMeta),
    checkFilePath: (file) => ipcRenderer.invoke('checkTimelineFilePath', file),
    checkFilePaths: (files) => ipcRenderer.invoke('checkTimelineFilePaths', files),

    openFolder: (folderPath) => ipcRenderer.send("openTimelineFolder", folderPath),

    // player from mainPage
    mainPlayer: {
        restart: () => ipcRenderer.invoke('timelineRestart'),
        rewind: (seekTime) => ipcRenderer.invoke('timelineRewind', seekTime),
        play: () => ipcRenderer.invoke('timelinePlay'),
        pause: () => ipcRenderer.invoke('timelinePause'),
        forward: (seekTime) => ipcRenderer.invoke('timelineForward', seekTime),
        toEnd: () => ipcRenderer.invoke('timelineToEnd'),
        seek: (newTime) => ipcRenderer.invoke('timelineSeek', newTime),
        fileMetaChange: (fileMeta) => ipcRenderer.invoke('timelineFileMetaChange', fileMeta),
    },
    // player from playerPage
    listener: {
        ready: (callback) => ipcRenderer.on("timelineReady", callback),
        duration: (callback) => ipcRenderer.on("timelineDuration", callback),
        play: (callback) => ipcRenderer.on("timelinePlay", callback),
        timeupdate: (callback) => ipcRenderer.on('timelineTimeupdate', callback),
        paused: (callback) => ipcRenderer.on("timelinePaused", callback),
        ended: (callback) => ipcRenderer.on("timelineEnded", callback),
    },

    getFiles: () => ipcRenderer.invoke("getTimelineFiles"),
    storeFiles: (files) => ipcRenderer.invoke("storeTimelineFiles", files),
});

// プリロードプロセスでは Node.js の全 API が利用可能です。
// Chrome 拡張機能と同じサンドボックスも持っています。
window.addEventListener('DOMContentLoaded', () => {

})


