import {ipcMain} from 'electron';
import {createCgmWindow, getCgmWindow} from '../windows/cgmWindow.js';
import {getMainWindow} from '../windows/mainWindow.js';
import {CgmChannels} from './channels';

export const registerCgmHandlers = () => {
    ipcMain.handle(CgmChannels.open, async (_event, cgm) => {
        const cgmWindow = createCgmWindow();
        try {
            await cgmWindow.loadURL(cgm.path);
            cgmWindow.setTitle(cgm.title || "CGM Player");
            cgmWindow.showInactive();
        } catch (e) {
            console.error(e);
            cgmWindow.destroy();
            getMainWindow().webContents.send(CgmChannels.errorOpen);
        }
    });

    ipcMain.handle(CgmChannels.play, () => {
        getCgmWindow()?.webContents.executeJavaScript(`$('#player1')[0].player.play()`, true);
    });

    ipcMain.handle(CgmChannels.close, () => {
        getCgmWindow()?.destroy();
    });
};
