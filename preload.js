// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    // メインプロセスの 'open-window' チャンネルへ送信
    openSubWindow: (fileMeta) => ipcRenderer.invoke('open-window', fileMeta),
    closeSubWindow: (fileName) => ipcRenderer.invoke('close-window', fileName),
    // playerEnded: () => ipcRenderer.invoke('player-ended'),
    getFiles: (target) => ipcRenderer.invoke("getFiles", target),
    storeFiles: (target, files) => ipcRenderer.invoke("storeFiles", target, files),
});

// プリロードプロセスでは Node.js の全 API が利用可能です。
// Chrome 拡張機能と同じサンドボックスも持っています。
window.addEventListener('DOMContentLoaded', () => {

})


