import {contextBridge, ipcRenderer} from 'electron'

contextBridge.exposeInMainWorld('timeline', {
    // timeline windowからイベントを受け取る
    timelineWindowShow: (callback: any) => ipcRenderer.on('timelineWindowShow', callback),
    timelineWindowHide: (callback: any) => ipcRenderer.on('timelineWindowHide', callback),

    // player from mainPage
    mainPlayer: {
        restart: (callback: any) => ipcRenderer.on("timelineRestart", callback),
        rewind: (callback: any) => ipcRenderer.on("timelineRewind", callback),
        play: (callback: any) => ipcRenderer.on("timelinePlay", callback),
        pause: (callback: any) => ipcRenderer.on("timelinePause", callback),
        forward: (callback: any) => ipcRenderer.on("timelineForward", callback),
        toEnd: (callback: any) => ipcRenderer.on("timelineToEnd", callback),
        seek: (callback: any) => ipcRenderer.on('timelineSeek', callback),
        fileMetaChange: (callback: any) => ipcRenderer.on('timelineFileMetaChange', callback),
    },

    // player from playerPage
    listener: {
        targetReady: () => ipcRenderer.send("targetTimelineReady"),
        targetDuration: (duration: any) => ipcRenderer.send("targetTimelineDuration", duration),
        targetPlaying: () => ipcRenderer.send("targetTimelinePlay"),
        targetTimeupdate: (currentTime: any) => ipcRenderer.send("targetTimelineTimeupdate", currentTime),
        targetPaused: () => ipcRenderer.send("targetTimelinePaused"),
        targetEnded: () => ipcRenderer.send("targetTimelineEnded"),
    },
});

// プリロードプロセスでは Node.js の全 API が利用可能です。
// Chrome 拡張機能と同じサンドボックスも持っています。
window.addEventListener('DOMContentLoaded', () => {

})


