const { contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('sub', {
    // サブwindowからイベントを受け取る
    subWindowShow: (callback) => ipcRenderer.on('subWindowShow', callback),
    subWindowHide: (callback) => ipcRenderer.on('subWindowHide', callback),
});

// プリロードプロセスでは Node.js の全 API が利用可能です。
// Chrome 拡張機能と同じサンドボックスも持っています。
window.addEventListener('DOMContentLoaded', () => {

})


