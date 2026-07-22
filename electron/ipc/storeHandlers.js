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

    timelineTabs: "timelineTabs",
    timelineList: "timelineList",
    timelineHistory: "timelineHistory",
    timelineWaveformPeaks: "timelineWaveformPeaks",

    praiseSetList: "praiseSetList",
};

// 波形ピークキャッシュの最大保持件数（1件あたり数KB。古いものから捨てる）
const maxWaveformPeaksEntries = 200;

// ファイルモードのタブ（getFiles/storeFiles がレンダラーから受け取れるキー）
const fileTabs = ["sunday", "wednesday", "other"];

// タイムラインのタブ導入前に保存されていたリストを引き継ぐタブのID
const defaultTimelineTabId = "default";

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
    ipcMain.handle(TimelineChannels.getTabs, (_event) => {
        return loadTimelineTabs();
    });
    ipcMain.handle(TimelineChannels.storeTabs, (_event, tabs) => {
        if (!Array.isArray(tabs) || tabs.length === 0) throw new Error("タブは1つ以上必要です");
        store.set(keys.timelineTabs, tabs);

        // 削除されたタブのファイルリストは残さない
        const filesByTab = loadTimelineFilesByTab();
        const tabIds = tabs.map(tab => tab.id);
        for (const tabId of Object.keys(filesByTab)) {
            if (!tabIds.includes(tabId)) delete filesByTab[tabId];
        }
        store.set(keys.timelineList, filesByTab);
    });

    ipcMain.handle(TimelineChannels.getFiles, (_event, tabId) => {
        return withExistsAll(loadTimelineFilesByTab()[tabId] ?? []);
    });
    ipcMain.handle(TimelineChannels.storeFiles, (_event, tabId, files) => {
        const filesByTab = loadTimelineFilesByTab();
        filesByTab[tabId] = files;
        store.set(keys.timelineList, filesByTab);
    });
    ipcMain.handle(TimelineChannels.storeAdditionalFiles, (_event, tabId, files) => {
        const filesByTab = loadTimelineFilesByTab();
        filesByTab[tabId] = (filesByTab[tabId] ?? []).concat(files);
        store.set(keys.timelineList, filesByTab);
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

// タブ未保存（タブ導入前のデータ）なら、既存リストを引き継ぐ既定タブを1つ返す
function loadTimelineTabs() {
    const tabs = store.get(keys.timelineTabs, []);
    if (Array.isArray(tabs) && tabs.length > 0) return tabs;
    return [{id: defaultTimelineTabId, name: "タブ1"}];
}

// タブ導入前の形式（ファイルの配列）は、既定タブのリストとして読み込む
function loadTimelineFilesByTab() {
    const stored = store.get(keys.timelineList, {});
    if (Array.isArray(stored)) return {[defaultTimelineTabId]: stored};
    return stored;
}

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
