import {BrowserWindow, screen} from 'electron';
import path from 'node:path';
import {iconPath, preloadPath} from "../utils/path.js";

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
            preload: path.join(preloadPath, '/subReceiver.js')
        },
    });

    const displays = screen.getAllDisplays();
    for (const display of displays) {
        if (display.bounds.x === 0 && display.bounds.y === 0) continue;
        subWindow.setBounds({x: display.bounds.x, y: display.bounds.y});
        subWindow.setFullScreen(true);
        break;
    }

    // if (devToolsEnabled) subWindow.webContents.openDevTools();

    return subWindow;
};

export const loadSubWindow = (fileMeta) => {
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
