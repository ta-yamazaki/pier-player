const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('timeline', {
    // timeline windowからイベントを受け取る
    timelineWindowShow: (callback) => ipcRenderer.on('timelineWindowShow', callback),
    timelineWindowHide: (callback) => ipcRenderer.on('timelineWindowHide', callback),

    // player from mainPage
    mainPlayer: {
        restart: (callback) => ipcRenderer.on("timelineRestart", callback),
        rewind: (callback) => ipcRenderer.on("timelineRewind", callback),
        play: (callback) => ipcRenderer.on("timelinePlay", callback),
        pause: (callback) => ipcRenderer.on("timelinePause", callback),
        forward: (callback) => ipcRenderer.on("timelineForward", callback),
        toEnd: (callback) => ipcRenderer.on("timelineToEnd", callback),
        seek: (callback) => ipcRenderer.on('timelineSeek', callback),
    },

    // player from playerPage
    listener: {
        targetReady: () => ipcRenderer.send("targetTimelineReady"),
        targetDuration: (duration) => ipcRenderer.send("targetTimelineDuration", duration),
        targetPlaying: () => ipcRenderer.send("targetTimelinePlay"),
        targetTimeupdate: (currentTime) => ipcRenderer.send("targetTimelineTimeupdate", currentTime),
        targetPaused: () => ipcRenderer.send("targetTimelinePaused"),
        targetEnded: () => ipcRenderer.send("targetTimelineEnded"),
    },
});

// プリロードプロセスでは Node.js の全 API が利用可能です。
// Chrome 拡張機能と同じサンドボックスも持っています。
window.addEventListener('DOMContentLoaded', () => {

})


