import {BrowserWindow, screen} from 'electron';
import path from 'node:path';
import {iconPath} from "../utils/path.js";
import {MAIN_DIST} from "./mainWindow";

let subWindow;

export const createSubWindow = () => {
    // if (subWindow && !subWindow.isDestroyed()) return subWindow;

    subWindow = new BrowserWindow({
        show: false,
        icon: iconPath,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: 'black',
        opacity: 0,
        alwaysOnTop: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            webSecurity: false,
            preload: path.join(MAIN_DIST, '/subReceiver.js')
        },
    });

    const displays = screen.getAllDisplays();
    for (const display of displays) {
        if (display.bounds.x === 0 && display.bounds.y === 0) continue;
        subWindow.setBounds({x: display.bounds.x, y: display.bounds.y});
        subWindow.setFullScreen(true);
        break;
    }

    return subWindow;
};

export const loadSubWindow = async (subWindow, fileMeta) => {
    if (process.env.VITE_DEV_SERVER_URL) {
        await subWindow.loadURL(path.join(process.env.VITE_DEV_SERVER_URL, 'sub/player.html'))
        // subWindow.webContents.openDevTools()
    } else {
        await subWindow.loadFile(path.join(process.env.VITE_PUBLIC, 'public', 'sub', 'player.html'),
            {hash: '/sub/player'})
    }

    if (fileMeta.type.match(/video\/.*/)) {
        subWindow.showInactive();
        subWindow.moveTop();
    }
    subWindow.setTitle(fileMeta.name);
    subWindow.setOpacity(1);
    subWindow.webContents.send("subWindowShow", {
        path: fileMeta.path,
        type: fileMeta.type,
    });
};

export const hideSubWindow = () => {
    subWindow.setOpacity(0);
    subWindow.webContents.send("subWindowHide");
    subWindow.hide();
};

export const getSubWindow = () => subWindow;
