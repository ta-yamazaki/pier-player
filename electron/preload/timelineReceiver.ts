import {contextBridge, ipcRenderer} from 'electron'
import {TimelineChannels} from '../ipc/channels'

export const timelineReceiver = {
    // timeline windowからイベントを受け取る
    timelineWindowShow: (callback: any) => ipcRenderer.on(TimelineChannels.windowShow, callback),
    timelineWindowHide: (callback: any) => ipcRenderer.on(TimelineChannels.windowHide, callback),

    // player from mainPage
    mainPlayer: {
        restart: (callback: any) => ipcRenderer.on(TimelineChannels.restart, callback),
        rewind: (callback: any) => ipcRenderer.on(TimelineChannels.rewind, callback),
        play: (callback: any) => ipcRenderer.on(TimelineChannels.play, callback),
        pause: (callback: any) => ipcRenderer.on(TimelineChannels.pause, callback),
        forward: (callback: any) => ipcRenderer.on(TimelineChannels.forward, callback),
        toEnd: (callback: any) => ipcRenderer.on(TimelineChannels.toEnd, callback),
        seek: (callback: any) => ipcRenderer.on(TimelineChannels.seek, callback),
        fileMetaChange: (callback: any) => ipcRenderer.on(TimelineChannels.fileMetaChange, callback),
    },

    // player from playerPage
    listener: {
        targetReady: () => ipcRenderer.send(TimelineChannels.targetReady),
        targetDuration: (duration: any) => ipcRenderer.send(TimelineChannels.targetDuration, duration),
        targetPlaying: () => ipcRenderer.send(TimelineChannels.targetPlay),
        targetTimeupdate: (file: any, currentTime: any, duration: any) => ipcRenderer.send(TimelineChannels.targetTimeupdate, file, currentTime, duration),
        targetPaused: () => ipcRenderer.send(TimelineChannels.targetPaused),
        targetEnded: () => ipcRenderer.send(TimelineChannels.targetEnded),
    },
};
contextBridge.exposeInMainWorld('timelineReceiver', timelineReceiver);
