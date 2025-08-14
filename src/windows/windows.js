import {createMainWindow} from "./mainWindow.js";
import {createSubWindow} from "./subWindow.js";
import {createCgmWindow} from "./cgmWindow.js";
import {createVimeoWindow} from "./vimeoWindow.js";

export const createWindows = () => {
    createMainWindow();
    createSubWindow();
    createCgmWindow();
    createVimeoWindow();
};

export const initMainWindow = () => {
    createMainWindow();
};
