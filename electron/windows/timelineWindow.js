import {BrowserWindow, screen} from 'electron';
import path from 'node:path';
import {iconPath} from "../utils/path.js";
import {MAIN_DIST} from "./mainWindow";

let timelineWindow;

export const createTimelineWindow = () => {
    // if (timelineWindow && !timelineWindow.isDestroyed()) return timelineWindow;

    timelineWindow = new BrowserWindow({
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
            preload: path.join(MAIN_DIST, '/timelineReceiver.js')
        },
    });

    const displays = screen.getAllDisplays();
    for (const display of displays) {
        if (display.bounds.x === 0 && display.bounds.y === 0) continue;
        timelineWindow.setBounds({x: display.bounds.x, y: display.bounds.y});
        timelineWindow.setFullScreen(true);
        break;
    }

    // if (devToolsEnabled) timelineWindow.webContents.openDevTools();

    return timelineWindow;
};

export const loadTimelineWindow = async (timelineWindow, fileMeta) => {
    if (process.env.VITE_DEV_SERVER_URL) {
        await timelineWindow.loadURL(path.join(process.env.VITE_DEV_SERVER_URL, 'timeline/player.html'))
        timelineWindow.webContents.openDevTools()
    } else {
        await timelineWindow.loadFile(path.join(process.env.VITE_PUBLIC, 'timeline', 'player.html'))
    }

    if (fileMeta.type.match(/video\/.*/)) {
        timelineWindow.showInactive();
        timelineWindow.moveTop();
    }

    timelineWindow.setTitle(fileMeta.name);
    timelineWindow.setOpacity(1);
    timelineWindow.webContents.send("timelineWindowShow", {
        file: fileMeta
    });
};

export const hideTimelineWindow = () => {
    timelineWindow.setOpacity(0);
    timelineWindow.webContents.send("timelineWindowHide");
    timelineWindow.hide();
};

export const getTimelineWindow = () => timelineWindow;
