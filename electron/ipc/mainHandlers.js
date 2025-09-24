import fs from 'fs';
import {ipcMain, screen, shell} from 'electron';
import {createSubWindow, getSubWindow, loadSubWindow} from '../windows/subWindow.js';
import {channels} from "../utils/channels";

export const registerMainHandlers = () => {
    ipcMain.handle(channels.openSubWindow, async (_event, fileMeta) => {
        const currentWindow = getSubWindow();
        const subWindow = createSubWindow();

        if (!fs.existsSync(fileMeta.path)) return false;

        const displays = screen.getAllDisplays();
        for (const display of displays) {
            if (display.bounds.x === 0 && display.bounds.y === 0) continue;
            loadSubWindow(subWindow, fileMeta);
            currentWindow.destroy()
            break;
        }
        return true;
    });

    ipcMain.handle('close-window', () => {
        getSubWindow()?.destroy();
    });

    ipcMain.handle('checkFilePath', async (_event, file) => {
        return {
            ...file,
            exists: file.path === "" ? true : fs.existsSync(file.path)
        }
    });

    ipcMain.handle('checkFilePaths', async (_event, files) => {
        return files.map(file => ({
            ...file,
            exists: file.path === "" ? true : fs.existsSync(file.path)
        }));
    });


    // フォルダを開く処理
    ipcMain.on("open-folder", (event, folderPath) => {
        // フォルダをエクスプローラーで開く
        shell.openPath(folderPath);
    });
};
