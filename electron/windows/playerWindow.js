import {BrowserWindow, screen} from 'electron';
import {iconPath} from "../utils/path.js";

// メインモニター（原点）以外のディスプレイを返す（無ければ undefined）
export const getSecondaryDisplay = () =>
    screen.getAllDisplays().find(display => display.bounds.x !== 0 || display.bounds.y !== 0);

/**
 * セカンダリモニターにフルスクリーン表示する再生用ウィンドウの共通ファクトリ
 * @param {object} options
 * @param {string} [options.preload] preloadスクリプトの絶対パス
 * @param {boolean} [options.startTransparent] 表示準備が整うまで opacity: 0 で隠す
 * @param {boolean} [options.disableWebSecurity] ローカルファイル再生用（外部URLを開くウィンドウでは指定しない）
 * @param {string} [options.css] ロード後に注入するCSS
 */
export const createPlayerWindow = ({preload, startTransparent = false, disableWebSecurity = false, css} = {}) => {
    const win = new BrowserWindow({
        show: false,
        icon: iconPath,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: 'black',
        alwaysOnTop: false,
        ...(startTransparent && {opacity: 0}),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            ...(disableWebSecurity && {webSecurity: false}),
            ...(preload && {preload}),
        },
    });

    const display = getSecondaryDisplay();
    if (display) {
        win.setBounds({x: display.bounds.x, y: display.bounds.y});
        win.setFullScreen(true);
    }

    if (css) win.webContents.insertCSS(css);

    return win;
};
