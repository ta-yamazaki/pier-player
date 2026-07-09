import {BrowserWindow, screen} from 'electron';
import path from 'node:path';
import {iconPath} from "../utils/path.js";
import {MAIN_DIST} from "./mainWindow";
import {TimelineChannels} from "../ipc/channels";

let timelineWindow;

export const createTimelineWindow = () => {
    timelineWindow = new BrowserWindow({
        show: false,
        icon: iconPath,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: 'black',
        opacity: 0,
        alwaysOnTop: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false, // ローカルファイルの再生に必要
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
    timelineWindow.webContents.send(TimelineChannels.windowShow, {
        file: fileMeta
    });
};

export const getTimelineWindow = () => timelineWindow;
