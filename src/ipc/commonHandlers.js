import { ipcMain, app } from 'electron';

export const registerCommonHandlers = () => {
    ipcMain.handle('getVersion', () => app.getVersion());
};
