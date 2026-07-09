import fs from 'fs';
import {ipcMain, screen, shell} from 'electron';
import {createSubWindow, getSubWindow, loadSubWindow} from '../windows/subWindow.js';
import {withExists} from "../utils/fileCheck.js";

export const registerMainHandlers = () => {
    ipcMain.handle("open-sub-window", async (_event, fileMeta) => {
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

    ipcMain.handle('close-window', () => {
        getSubWindow()?.destroy();
    });

    ipcMain.handle('checkFilePath', async (_event, file) => withExists(file));


    // フォルダを開く処理
    ipcMain.on("open-folder", (event, folderPath) => {
        // フォルダをエクスプローラーで開く
        shell.openPath(folderPath);
    });
};
