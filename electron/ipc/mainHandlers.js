import fs from 'fs';
import {ipcMain, shell} from 'electron';
import {createSubWindow, getSubWindow, loadSubWindow} from '../windows/subWindow.js';
import {getSecondaryDisplay} from '../windows/playerWindow.js';
import {withExists} from "../utils/fileCheck.js";
import {CommonChannels, FileChannels} from "./channels";

export const registerMainHandlers = () => {
    ipcMain.handle(FileChannels.openSubWindow, async (_event, fileMeta) => {
        if (!fs.existsSync(fileMeta.path)) return false;

        // セカンダリモニターが無い場合は何も表示しない（従来動作を維持）
        if (!getSecondaryDisplay()) return true;

        const currentWindow = getSubWindow();
        const subWindow = createSubWindow();
        loadSubWindow(subWindow, fileMeta);
        currentWindow.destroy();
        return true;
    });

    ipcMain.handle(FileChannels.closeSubWindow, () => {
        getSubWindow()?.destroy();
    });

    ipcMain.handle(FileChannels.checkFilePath, async (_event, file) => withExists(file));

    // フォルダをエクスプローラーで開く
    ipcMain.on(CommonChannels.openFolder, (event, folderPath) => {
        shell.openPath(folderPath);
    });
};
