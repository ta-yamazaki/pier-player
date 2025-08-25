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

// プリロードプロセスでは Node.js の全 API が利用可能です。
// Chrome 拡張機能と同じサンドボックスも持っています。
window.addEventListener('DOMContentLoaded', () => {

})


