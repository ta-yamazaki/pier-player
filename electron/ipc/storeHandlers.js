import Store from 'electron-store';
import {ipcMain} from "electron";

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
     * メイン画面 通常モード
     */
    ipcMain.handle('getFiles', (_event, target) => {
        return store.get(target, [{path: "", name: "", type: "", showCloseButton: false}]);
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
        return store.get(keys.timelineList, []);
    });
    ipcMain.handle("storeTimelineFiles", (_event, files) => {
        store.set(keys.timelineList, files);
    });
};
