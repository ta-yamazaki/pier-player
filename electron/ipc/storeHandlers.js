import Store from 'electron-store';
import {ipcMain} from "electron";
import {withExistsAll} from "../utils/fileCheck.js";

const store = new Store();

const keys = {
    cgmList: "cgmList",

    vimeoList: "vimeoList",

    vimeoShowcase: "vimeoShowcase",
    vimeoShowcasePlayList: "vimeoShowcasePlayList",

    timelineList: "timelineList",
    timelineHistory: "timelineHistory",
};

export const registerStoreHandlers = () => {
    /**
     * メイン画面 ファイルモード
     */
    ipcMain.handle('getFiles', (_event, target) => {
        return withExistsAll(store.get(target, []));
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
        return withExistsAll(store.get(keys.timelineList, []));
    });
    ipcMain.handle("storeTimelineFiles", (_event, files) => {
        store.set(keys.timelineList, files);
    });
    ipcMain.handle("storeAdditionalTimelineFiles", (_event, files) => {
        const currentFiles = store.get(keys.timelineList, []);
        const added = currentFiles.concat(files)
        store.set(keys.timelineList, added);
    });
    ipcMain.handle("getTimelineHistory", (_event) => {
        return loadMap(keys.timelineHistory);
    });
    ipcMain.handle("storeTimelineHistory", (_event, file) => {
        file.updatedAt = new Date()
        saveMap(keys.timelineHistory, file.name, file);
    });
};

function saveMap(storeKey, targetKey, targetValue) {
    const map = loadMap(storeKey);
    map.set(targetKey, targetValue);
    store.set(storeKey, Array.from(map.entries()));
}

function loadMap(storeKey) {
    const raw = store.get(storeKey, []);
    return new Map(raw);
}
