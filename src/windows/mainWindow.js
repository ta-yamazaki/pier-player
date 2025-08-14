import {app, BrowserWindow} from 'electron';
import path from 'node:path';
import {devToolsEnabled} from "../utils/devTools.js";
import {iconPath, preloadPath} from "../utils/path.js";

let mainWindow;

export const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 600, height: 700,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(preloadPath, '/mainPreload.js')
        }
    });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile('src/templates/main/index.html');

    if (devToolsEnabled) mainWindow.webContents.openDevTools();

    mainWindow.on('close', () => {
        app.quit();
    });

    return mainWindow;
};

export const getMainWindow = () => mainWindow;
