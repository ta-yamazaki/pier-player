import { ipcMain } from 'electron';
import { createCgmWindow, getCgmWindow } from '../windows/cgmWindow.js';
import { getMainWindow } from '../windows/mainWindow.js';

export const registerCgmHandlers = () => {
    ipcMain.handle("openCgm", async (_event, cgm) => {
        const cgmWindow = createCgmWindow();
        try {
            await cgmWindow.loadURL(cgm.path);
            cgmWindow.setTitle(cgm.title || "CGM Player");
            cgmWindow.showInactive();
        } catch (e) {
            console.error(e);
            cgmWindow.destroy();
            getMainWindow().webContents.send("errorCgmOpen");
        }
    });

    ipcMain.handle("playCgm", () => {
        getCgmWindow()?.webContents.executeJavaScript(`$('#player1')[0].player.play()`, true);
    });

    ipcMain.handle("closeCgm", () => {
        getCgmWindow()?.destroy();
    });
};
