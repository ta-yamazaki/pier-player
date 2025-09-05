import {BrowserWindow, screen} from 'electron';
import path from 'node:path';
import {iconPath, preloadPath} from "../utils/path.js";
import {devToolsEnabled} from "../utils/devTools.js";

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
            preload: path.join(preloadPath, '/timelineReceiver.js')
        },
    });

    const displays = screen.getAllDisplays();
    for (const display of displays) {
        if (display.bounds.x === 0 && display.bounds.y === 0) continue;
        timelineWindow.setBounds({x: display.bounds.x, y: display.bounds.y});
        timelineWindow.setFullScreen(true);
        break;
    }

    if (devToolsEnabled) timelineWindow.webContents.openDevTools();

    return timelineWindow;
};

export const loadTimelineWindow = (fileMeta) => {
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
