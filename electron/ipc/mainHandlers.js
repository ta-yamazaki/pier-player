import fs from 'fs';
import {ipcMain, screen, shell} from 'electron';
import {createSubWindow, getSubWindow, loadSubWindow} from '../windows/subWindow.js';
import {withExists} from "../utils/fileCheck.js";
import {CommonChannels, FileChannels} from "./channels";

export const registerMainHandlers = () => {
    ipcMain.handle(FileChannels.openSubWindow, async (_event, fileMeta) => {
        if (!fs.existsSync(fileMeta.path)) return false;

        // セカンダリモニターが無い場合は何も表示しない（従来動作を維持）
        const hasSecondaryDisplay = screen.getAllDisplays()
            .some(display => display.bounds.x !== 0 || display.bounds.y !== 0);
        if (!hasSecondaryDisplay) return true;

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
