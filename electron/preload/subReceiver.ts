import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('sub', {
    // サブwindowからイベントを受け取る
    subWindowShow: (callback: any) => ipcRenderer.on('subWindowShow', callback),
    subWindowHide: (callback: any) => ipcRenderer.on('subWindowHide', callback),
});

// プリロードプロセスでは Node.js の全 API が利用可能です。
// Chrome 拡張機能と同じサンドボックスも持っています。
window.addEventListener('DOMContentLoaded', () => {

})


