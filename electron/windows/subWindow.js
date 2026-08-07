import path from 'node:path';
import {MAIN_DIST, VITE_PUBLIC} from "../utils/path.js";
import {isVideoType} from "../utils/media.js";
import {createPlayerWindow} from "./playerWindow.js";
import {FileChannels} from "../ipc/channels";

let subWindow;

export const createSubWindow = () => {
    subWindow = createPlayerWindow({
        preload: path.join(MAIN_DIST, '/subReceiver.js'),
        startTransparent: true,
        disableWebSecurity: true, // ローカルファイルの再生に必要
    });
    return subWindow;
};

export const loadSubWindow = async (subWindow, fileMeta) => {
    if (process.env.VITE_DEV_SERVER_URL) {
        await subWindow.loadURL(path.join(process.env.VITE_DEV_SERVER_URL, 'sub/player.html'))
    } else {
        await subWindow.loadFile(path.join(VITE_PUBLIC, 'sub', 'player.html'))
    }

    if (isVideoType(fileMeta.type)) {
        subWindow.showInactive();
        subWindow.moveTop();
    }
    subWindow.setTitle(fileMeta.name);
    subWindow.setOpacity(1);
    subWindow.webContents.send(FileChannels.subWindowShow, {
        path: fileMeta.path,
        type: fileMeta.type,
    });
};

export const getSubWindow = () => subWindow;
