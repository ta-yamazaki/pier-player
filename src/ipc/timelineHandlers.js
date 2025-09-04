import fs from 'fs';
import {ipcMain, screen, shell} from 'electron';
import {createTimelineWindow, getTimelineWindow, loadTimelineWindow} from "../windows/timelineWindow.js";
import {getMainWindow} from "../windows/mainWindow.js";

export const registerTimelineHandlers = () => {
    ipcMain.handle('openTimelineWindow', async (_event, fileMeta) => {
        const timelineWindow = createTimelineWindow();

        if (!fs.existsSync(fileMeta.path)) return false;

        await timelineWindow.loadFile('src/templates/timeline/player.html');
        if (fileMeta.type.match(/video\/.*/)) {
            timelineWindow.showInactive();
            timelineWindow.moveTop();
        }

        const displays = screen.getAllDisplays();
        for (const display of displays) {
            if (display.bounds.x === 0 && display.bounds.y === 0) continue;
            loadTimelineWindow(fileMeta);
            break;
        }
        return true;
    });

    ipcMain.handle('closeTimelineWindow', () => {
        getTimelineWindow()?.destroy();
    });

    ipcMain.handle('checkTimelineFilePath', async (_event, file) => {
        return {
            ...file,
            exists: file.path === "" ? true : fs.existsSync(file.path)
        }
    });

    ipcMain.handle('checkTimelineFilePaths', async (_event, files) => {
        return files.map(file => ({
            ...file,
            exists: file.path === "" ? true : fs.existsSync(file.path)
        }));
    });


    // フォルダを開く処理
    ipcMain.on("openTimelineFolder", (event, folderPath) => {
        // フォルダをエクスプローラーで開く
        shell.openPath(folderPath);
    });

    // player from mainPage
    ipcMain.handle('timelineRestart', (_event) => {
        getTimelineWindow().webContents.send("timelineRestart");
    });
    ipcMain.handle('timelineRewind', (_event, seekTime) => {
        getTimelineWindow().webContents.send("timelineRewind", {
            seekTime: seekTime
        });
    });
    ipcMain.handle('timelinePlay', (_event) => {
        getTimelineWindow().webContents.send("timelinePlay");
    });
    ipcMain.handle('timelinePause', (_event) => {
        getTimelineWindow().webContents.send("timelinePause");
    });
    ipcMain.handle('timelineForward', (_event, seekTime) => {
        getTimelineWindow().webContents.send("timelineForward", {
            seekTime: seekTime
        });
    });
    ipcMain.handle('timelineToEnd', (_event) => {
        getTimelineWindow().webContents.send("timelineToEnd");
    });
    ipcMain.handle('timelineSeek', (_event, newTime) => {
        getTimelineWindow().webContents.send("timelineSeek", {
            newTime: newTime
        });
    });

    // player from playerPage
    ipcMain.on("targetTimelineReady", (event) => {
        getMainWindow().webContents.send("timelineReady");
    });
    ipcMain.on("targetTimelineDuration", (event, duration) => {
        getMainWindow().webContents.send("timelineDuration", {
            duration: duration
        });
    });
    ipcMain.on("targetTimelinePlay", (event) => {
        getMainWindow().webContents.send("timelinePlay");
    });
    ipcMain.on("targetTimelineTimeupdate", (event, currentTime) => {
        getMainWindow().webContents.send("timelineTimeupdate", {
            currentTime: currentTime
        });
    });
    ipcMain.on("targetTimelinePaused", (event) => {
        getMainWindow().webContents.send("timelinePaused");
    });
    ipcMain.on("targetTimelineEnded", (event) => {
        getMainWindow().webContents.send("timelineEnded");
    });

};
