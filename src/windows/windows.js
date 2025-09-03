import {createMainWindow} from "./mainWindow.js";
import {createSubWindow} from "./subWindow.js";
import {createCgmWindow} from "./cgmWindow.js";
import {createVimeoWindow} from "./vimeoWindow.js";
import {createTimelineWindow} from "./timelineWindow.js";

export const createWindows = () => {
    createMainWindow();
    createSubWindow();
    createCgmWindow();
    createVimeoWindow();
    createTimelineWindow();
};

export const initMainWindow = () => {
    createMainWindow();
};
