import Store from 'electron-store';
import {ipcMain} from "electron";
import {withExistsAll} from "../utils/fileCheck.js";
import {CgmChannels, FileChannels, PraiseChannels, ShowcaseChannels, TimelineChannels, VimeoChannels} from "./channels";

const store = new Store();

const keys = {
    cgmList: "cgmList",

    vimeoList: "vimeoList",

    vimeoShowcase: "vimeoShowcase",
    vimeoShowcasePlayList: "vimeoShowcasePlayList",

    timelineList: "timelineList",
    timelineHistory: "timelineHistory",
    timelineWaveformPeaks: "timelineWaveformPeaks",

    praiseSetList: "praiseSetList",
};

// 波形ピークキャッシュの最大保持件数（1件あたり数KB。古いものから捨てる）
const maxWaveformPeaksEntries = 200;

// ファイルモードのタブ（getFiles/storeFiles がレンダラーから受け取れるキー）
const fileTabs = ["sunday", "wednesday", "other"];

export const registerStoreHandlers = () => {
    /**
     * メイン画面 ファイルモード
     */
    ipcMain.handle(FileChannels.getFiles, (_event, target) => {
        if (!fileTabs.includes(target)) throw new Error(`不正なストアキー: ${target}`);
        return withExistsAll(store.get(target, []));
    });
    ipcMain.handle(FileChannels.storeFiles, (_event, target, files) => {
        if (!fileTabs.includes(target)) throw new Error(`不正なストアキー: ${target}`);
        store.set(target, files);
    });

    /**
     * メイン画面 CGMモード
     */
    ipcMain.handle(CgmChannels.getList, () => {
        return store.get(keys.cgmList, [{path: "", title: "", isViewed: false, isPlaying: false}]);
    });
    ipcMain.handle(CgmChannels.storeList, (_event, cgmList) => {
        store.set(keys.cgmList, cgmList);
    });

    /**
     * メイン画面 Vimeoモード（個別動画）
     */
    ipcMain.handle(VimeoChannels.getList, () => {
        return store.get(keys.vimeoList, [{url: "", title: "", password: "", isViewed: false, isPlaying: false}]);
    });
    ipcMain.handle(VimeoChannels.storeList, (_event, vimeoList) => {
        store.set(keys.vimeoList, vimeoList);
    });

    /**
     * メイン画面 Vimeoモード（ショーケース）
     */
    ipcMain.handle(ShowcaseChannels.getShowcase, () => {
        return store.get(keys.vimeoShowcase, {rawUrl: "", password: ""});
    });
    ipcMain.handle(ShowcaseChannels.storeShowcase, (_event, showcase) => {
        store.set(keys.vimeoShowcase, showcase);
    });

    ipcMain.handle(ShowcaseChannels.getPlayList, () => {
        return store.get(keys.vimeoShowcasePlayList, [{title: "", isViewed: false, isPlaying: false}]);
    });
    ipcMain.handle(ShowcaseChannels.storePlayList, (_event, vimeoList) => {
        store.set(keys.vimeoShowcasePlayList, vimeoList);
    });

    /**
     * メイン画面 タイムラインモード
     */
    ipcMain.handle(TimelineChannels.getFiles, (_event) => {
        return withExistsAll(store.get(keys.timelineList, []));
    });
    ipcMain.handle(TimelineChannels.storeFiles, (_event, files) => {
        store.set(keys.timelineList, files);
    });
    ipcMain.handle(TimelineChannels.storeAdditionalFiles, (_event, files) => {
        const currentFiles = store.get(keys.timelineList, []);
        const added = currentFiles.concat(files)
        store.set(keys.timelineList, added);
    });
    ipcMain.handle(TimelineChannels.getHistory, (_event) => {
        return loadMap(keys.timelineHistory);
    });
    ipcMain.handle(TimelineChannels.storeHistory, (_event, file) => {
        file.updatedAt = new Date()
        saveMap(keys.timelineHistory, file.name, file);
    });

    /**
     * メイン画面 Praiseモード（チェックした曲のセットリスト）
     */
    ipcMain.handle(PraiseChannels.getSetList, () => {
        return store.get(keys.praiseSetList, []);
    });
    ipcMain.handle(PraiseChannels.storeSetList, (_event, setList) => {
        store.set(keys.praiseSetList, setList);
    });

    /**
     * タイムラインモード 波形ピークキャッシュ（キー: ファイルパス）
     */
    ipcMain.handle(TimelineChannels.getWaveformPeaks, (_event) => {
        return loadMap(keys.timelineWaveformPeaks);
    });
    ipcMain.handle(TimelineChannels.storeWaveformPeaks, (_event, path, entry) => {
        const map = loadMap(keys.timelineWaveformPeaks);
        map.set(path, {...entry, updatedAt: new Date()});
        pruneOldest(map, maxWaveformPeaksEntries);
        store.set(keys.timelineWaveformPeaks, Array.from(map.entries()));
    });
    ipcMain.handle(TimelineChannels.deleteWaveformPeaks, (_event, path) => {
        const map = loadMap(keys.timelineWaveformPeaks);
        if (!map.delete(path)) return;
        store.set(keys.timelineWaveformPeaks, Array.from(map.entries()));
    });
};

// updatedAt が古いエントリから削除して max 件以下に抑える
function pruneOldest(map, max) {
    while (map.size > max) {
        let oldestKey = null;
        let oldestTime = Infinity;
        for (const [key, value] of map) {
            const time = new Date(value?.updatedAt ?? 0).getTime();
            if (time < oldestTime) {
                oldestTime = time;
                oldestKey = key;
            }
        }
        map.delete(oldestKey);
    }
}

function saveMap(storeKey, targetKey, targetValue) {
    const map = loadMap(storeKey);
    map.set(targetKey, targetValue);
    store.set(storeKey, Array.from(map.entries()));
}

function loadMap(storeKey) {
    const raw = store.get(storeKey, []);
    return new Map(raw);
}
