import Store from 'electron-store';
import {ipcMain} from "electron";
import fs from "fs";

const store = new Store();

const keys = {
    cgmList: "cgmList",

    vimeoList: "vimeoList",

    vimeoShowcase: "vimeoShowcase",
    vimeoShowcasePlayList: "vimeoShowcasePlayList",

    timelineList: "timelineList",
};

export const registerStoreHandlers = () => {
    /**
     * メイン画面 ファイルモード
     */
    ipcMain.handle('getFiles', (_event, target) => {
        const files = store.get(target, []);
        return files.map(file => ({
            ...file,
            exists: file.path === "" ? true : fs.existsSync(file.path)
        }));
    });
    ipcMain.handle("storeFiles", (_event, target, files) => {
        store.set(target, files);
    });

    /**
     * メイン画面 CGMモード
     */
    ipcMain.handle("getCgmList", () => {
        return store.get(keys.cgmList, [{path: "", title: "", isViewed: false, isPlaying: false}]);
    });
    ipcMain.handle("storeCgmList", (_event, cgmList) => {
        store.set(keys.cgmList, cgmList);
    });

    /**
     * メイン画面 Vimeoモード（個別動画）
     */
    ipcMain.handle("getVimeoList", (event) => {
        return store.get(keys.vimeoList, [{url: "", title: "", password: "", isViewed: false, isPlaying: false}]);
    });
    ipcMain.handle("storeVimeoList", (event, vimeoList) => {
        store.set(keys.vimeoList, vimeoList);
    });

    /**
     * メイン画面 Vimeoモード（ショーケース）
     */
    ipcMain.handle("getShowcase", (event) => {
        return store.get(keys.vimeoShowcase, {rawUrl: "", password: ""});
    });
    ipcMain.handle("storeShowcase", (event, showcase) => {
        store.set(keys.vimeoShowcase, showcase);
    });

    ipcMain.handle("getShowcasePlayList", (event) => {
        return store.get(keys.vimeoShowcasePlayList, [{title: "", isViewed: false, isPlaying: false}]);
    });
    ipcMain.handle("storeShowcasePlayList", (event, vimeoList) => {
        store.set(keys.vimeoShowcasePlayList, vimeoList);
    });

    /**
     * メイン画面 タイムラインモード
     */
    ipcMain.handle('getTimelineFiles', (_event) => {
        const files = store.get(keys.timelineList, []);
        return files.map(file => ({
            ...file,
            exists: file.path === "" ? true : fs.existsSync(file.path)
        }));
    });
    ipcMain.handle("storeTimelineFiles", (_event, files) => {
        store.set(keys.timelineList, files);
    });
};
