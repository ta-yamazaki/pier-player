import {app, BrowserWindow} from 'electron';
import path from 'node:path';
import {iconPath, MAIN_DIST, VITE_PUBLIC} from "../utils/path.js";

let mainWindow;

export const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        title: "Pier Player",
        width: 900,
        height: 700,
        backgroundColor: '#f3f7fb', // 起動時のちらつき防止（テーマ背景色に合わせる）
        icon: iconPath,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false, // ローカルファイルのプレビュー再生に必要
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
        mainWindow.loadFile(path.join(VITE_PUBLIC, 'index.html'))
    }

    return mainWindow;
};

export const getMainWindow = () => mainWindow;
