import {app, BrowserWindow} from 'electron';
import electronUpdater from 'electron-updater'
import {registerIpcHandlers} from './ipc/handlers.js';
import {createWindows, initMainWindow} from "./windows/windows.js";

const {autoUpdater} = electronUpdater;

app.whenReady().then(() => {
    autoUpdater.checkForUpdatesAndNotify()

    createWindows();
    registerIpcHandlers();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
        initMainWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
