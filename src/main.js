import {app, BrowserWindow} from 'electron';
import {registerIpcHandlers} from './ipc/handlers.js';
import {createWindows, initMainWindow} from "./windows/windows.js";

app.whenReady().then(() => {
    createWindows();
    registerIpcHandlers();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            initMainWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
