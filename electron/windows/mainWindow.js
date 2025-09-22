import {app, BrowserWindow} from 'electron';
import path from 'node:path';
import {iconPath} from "../utils/path.js";

process.env.APP_ROOT = path.join(__dirname, '..')
const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')

let mainWindow;

export const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: "Pier Player",
        width: 900,
        height: 700,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(MAIN_DIST, '/preload.js'),
        },
        titleBarStyle: 'customButtonsOnHover',
    });
    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('close', () => {
        app.quit();
    });

    console.log("DEV URL:", process.env.VITE_DEV_SERVER_URL)
    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(process.env.VITE_PUBLIC, 'index.html'))
    }

    return mainWindow;
};

export const getMainWindow = () => mainWindow;
