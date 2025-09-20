import { ipcMain, app } from 'electron';
import pkg from 'electron-updater';
const {autoUpdater} = pkg;

export const registerCommonHandlers = () => {
    ipcMain.handle('getVersion', () => app.getVersion());
    ipcMain.handle('checkUpdate', () => {
       return autoUpdater.checkForUpdates()
    });
};
