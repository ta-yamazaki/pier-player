import {app, BrowserWindow} from 'electron';
import path from 'node:path';
import {iconPath} from "../utils/path.js";

export const MAIN_DIST = path.join(__dirname, '../dist-electron')

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
            webSecurity: false,
            preload: path.join(MAIN_DIST, '/preload.js'),
        },
        titleBarStyle: 'customButtonsOnHover',
    });
    mainWindow.setMenuBarVisibility(false);

    mainWindow.on('close', () => {
        app.quit();
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL).catch(reason => {
            console.log(reason)
        })
        mainWindow.webContents.openDevTools()
    } else {
        mainWindow.loadFile(path.join(process.env.VITE_PUBLIC, 'index.html'))
    }

    return mainWindow;
};

export const getMainWindow = () => mainWindow;
