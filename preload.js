const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('api', {
    // メインプロセスの 'open-window' チャンネルへ送信
    openSubWindow: (fileMeta) => ipcRenderer.invoke('open-window', fileMeta),
    closeSubWindow: () => ipcRenderer.invoke('close-window'),
    // playerEnded: () => ipcRenderer.invoke('player-ended'),
    getFiles: (target) => ipcRenderer.invoke("getFiles", target),
    storeFiles: (target, files) => ipcRenderer.invoke("storeFiles", target, files),
    subWindowShow: (callback) => ipcRenderer.on('subWindowShow', callback),
    subWindowHide: (callback) => ipcRenderer.on('subWindowHide', callback),
    openCgm: (cgm) => ipcRenderer.invoke('openCgm', cgm),
    cgmLoadedFromCgmWindow: () => ipcRenderer.invoke('cgmLoadedFromCgmWindow'),
    cgmLoaded: (callback) => ipcRenderer.on('cgmLoaded', callback),
    errorCgmOpen: (callback) => ipcRenderer.on('errorCgmOpen', callback),
    playCgm: () => ipcRenderer.invoke('playCgm'),
    closeCgm: () => ipcRenderer.invoke('closeCgm'),
    getCgmList: () => ipcRenderer.invoke("getCgmList"),
    storeCgmList: (cgmList) => ipcRenderer.invoke("storeCgmList", cgmList),
    getVersion: () => ipcRenderer.invoke('getVersion'),
});

// プリロードプロセスでは Node.js の全 API が利用可能です。
// Chrome 拡張機能と同じサンドボックスも持っています。
window.addEventListener('DOMContentLoaded', () => {

})


