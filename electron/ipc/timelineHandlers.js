import fs from 'fs';
import {ipcMain} from 'electron';
import {createTimelineWindow, getTimelineWindow, loadTimelineWindow} from "../windows/timelineWindow.js";
import {getMainWindow} from "../windows/mainWindow.js";
import {TimelineChannels} from "./channels";

export const registerTimelineHandlers = () => {
    ipcMain.handle(TimelineChannels.openWindow, async (_event, fileMeta) => {
        if (!fs.existsSync(fileMeta.path)) return false;

        const timelineWindow = createTimelineWindow();
        await loadTimelineWindow(timelineWindow, fileMeta);
        return true;
    });

    ipcMain.handle(TimelineChannels.closeWindow, () => {
        getTimelineWindow()?.destroy();
    });

    ipcMain.handle(TimelineChannels.continuousPlay, async (_event, nextFileMeta) => {
        if (!fs.existsSync(nextFileMeta.path)) return false;

        const currentWindow = getTimelineWindow();
        const newWindow = createTimelineWindow();
        await loadTimelineWindow(newWindow, nextFileMeta);
        currentWindow.destroy();
        return true;
    });

    // player from mainPage
    ipcMain.handle(TimelineChannels.restart, (_event) => {
        getTimelineWindow().webContents.send(TimelineChannels.restart);
    });
    ipcMain.handle(TimelineChannels.rewind, (_event, seekTime) => {
        getTimelineWindow().webContents.send(TimelineChannels.rewind, {
            seekTime: seekTime
        });
    });
    ipcMain.handle(TimelineChannels.play, (_event) => {
        getTimelineWindow().webContents.send(TimelineChannels.play);
    });
    ipcMain.handle(TimelineChannels.pause, (_event) => {
        getTimelineWindow().webContents.send(TimelineChannels.pause);
    });
    ipcMain.handle(TimelineChannels.forward, (_event, seekTime) => {
        getTimelineWindow().webContents.send(TimelineChannels.forward, {
            seekTime: seekTime
        });
    });
    ipcMain.handle(TimelineChannels.toEnd, (_event) => {
        getTimelineWindow().webContents.send(TimelineChannels.toEnd);
    });
    ipcMain.handle(TimelineChannels.seek, (_event, newTime) => {
        getTimelineWindow().webContents.send(TimelineChannels.seek, {
            newTime: newTime
        });
    });
    ipcMain.handle(TimelineChannels.fileMetaChange, (_event, fileMeta) => {
        const timelineWindow = getTimelineWindow();
        if (!timelineWindow) return
        timelineWindow.webContents.send(TimelineChannels.fileMetaChange, {
            file: fileMeta
        });
    });

    // player from playerPage
    ipcMain.on(TimelineChannels.targetReady, () => {
        getMainWindow().webContents.send(TimelineChannels.ready);
    });
    ipcMain.on(TimelineChannels.targetDuration, (_event, duration) => {
        getMainWindow().webContents.send(TimelineChannels.duration, {
            duration: duration
        });
    });
    ipcMain.on(TimelineChannels.targetPlay, () => {
        getMainWindow().webContents.send(TimelineChannels.play);
    });
    ipcMain.on(TimelineChannels.targetTimeupdate, (_event, file, currentTime, duration) => {
        getMainWindow().webContents.send(TimelineChannels.timeupdate, {
            file: file,
            currentTime: currentTime,
            duration: duration
        });
    });
    ipcMain.on(TimelineChannels.targetPaused, () => {
        getMainWindow().webContents.send(TimelineChannels.paused);
    });
    ipcMain.on(TimelineChannels.targetEnded, () => {
        getMainWindow().webContents.send(TimelineChannels.ended);
    });
};
