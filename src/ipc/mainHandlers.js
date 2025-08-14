import fs from 'fs';
import { ipcMain, screen, app } from 'electron';
import { createSubWindow, loadSubWindow, getSubWindow } from '../windows/subWindow.js';

export const registerMainHandlers = () => {
    ipcMain.handle('openSubWindow', async (_event, fileMeta) => {
        const subWindow = createSubWindow();

        if (!fs.existsSync(fileMeta.path)) return false;

        await subWindow.loadFile('src/templates/sub/player.html');
        if (fileMeta.type.match(/video\/.*/)) {
            subWindow.showInactive();
            subWindow.moveTop();
        }

        const displays = screen.getAllDisplays();
        for (const display of displays) {
            if (display.bounds.x === 0 && display.bounds.y === 0) continue;
            loadSubWindow(fileMeta);
            break;
        }
        return true;
    });

    ipcMain.handle('close-window', () => {
        getSubWindow()?.destroy();
    });

    ipcMain.handle('checkFilePaths', async (_event, files) => {
        return files.map(file => ({
            ...file,
            exists: file.path === "" ? true : fs.existsSync(file.path)
        }));
    });
};
