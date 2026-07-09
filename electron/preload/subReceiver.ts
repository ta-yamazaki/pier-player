import {contextBridge, ipcRenderer} from 'electron'
import {FileChannels} from '../ipc/channels'

contextBridge.exposeInMainWorld('sub', {
    // サブwindowからイベントを受け取る
    subWindowShow: (callback: any) => ipcRenderer.on(FileChannels.subWindowShow, callback),
    subWindowHide: (callback: any) => ipcRenderer.on(FileChannels.subWindowHide, callback),
});
