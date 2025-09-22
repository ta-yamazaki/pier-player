import {app, ipcMain} from 'electron';
import pkg from 'electron-updater';
import {channels} from "../utils/channels";

const {autoUpdater} = pkg;

export const registerCommonHandlers = () => {
    ipcMain.handle(channels.getVersion, () => app.getVersion());
    ipcMain.handle('checkUpdate', async () => {
        const result = await autoUpdater.checkForUpdates();
        if (!result || !result.updateInfo) {
            return {updateAvailable: false};
        }
        // プレーンオブジェクトにして返す
        return {
            updateAvailable: result.isUpdateAvailable,
            version: result.updateInfo.version,
            releaseNotes: result.updateInfo.releaseNotes,
            releaseName: result.updateInfo.releaseName,
        };
    });
};
