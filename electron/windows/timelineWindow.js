import path from 'node:path';
import {MAIN_DIST, VITE_PUBLIC} from "../utils/path.js";
import {isVideoType} from "../utils/media.js";
import {createPlayerWindow} from "./playerWindow.js";
import {TimelineChannels} from "../ipc/channels";

let timelineWindow;

export const createTimelineWindow = () => {
    timelineWindow = createPlayerWindow({
        preload: path.join(MAIN_DIST, '/timelineReceiver.js'),
        startTransparent: true,
        disableWebSecurity: true, // ローカルファイルの再生に必要
    });
    return timelineWindow;
};

export const loadTimelineWindow = async (timelineWindow, fileMeta) => {
    if (process.env.VITE_DEV_SERVER_URL) {
        await timelineWindow.loadURL(path.join(process.env.VITE_DEV_SERVER_URL, 'timeline/player.html'))
        timelineWindow.webContents.openDevTools()
    } else {
        await timelineWindow.loadFile(path.join(VITE_PUBLIC, 'timeline', 'player.html'))
    }

    if (isVideoType(fileMeta.type)) {
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
