// main.js

// このモジュールはアプリケーションの生き死にを制御し、ネイティブブラウザウインドウを作成します
const { app, BrowserWindow, screen, ipcMain } = require('electron')
const path = require('node:path')

const Store = require('electron-store');
const store = new Store();

const icon = "static/favicon.ico";

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 900, height: 700,
        icon: icon,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile('index.html').then();
    mainWindow.webContents.openDevTools() // デベロッパーツール

    mainWindow.on('close', () => {
        BrowserWindow.getAllWindows().forEach(window => window.close())
    })
}

const createSubWindow = (display, fileMeta) => {
    let subWindow = new BrowserWindow({
        show: false,
        x: display.bounds.x,
        y: display.bounds.y,
        fullscreen: true,
        title: fileMeta.name,
        icon: icon,
        frame: false,
        titleBarStyle: 'hidden',
    });

    subWindow.once('ready-to-show', () => { subWindow.show(); });
    subWindow.on('close', () => { subWindow = null })
    subWindow.loadFile('player.html', {
        query: {
            path: fileMeta.path,
            type: fileMeta.type,
        }
    }).then();
    // subWindow.webContents.openDevTools()
}

// このメソッドは、Electron の初期化が完了し、
// ブラウザウインドウの作成準備ができたときに呼ばれます。
// 一部のAPIはこのイベントが発生した後にのみ利用できます。
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        // macOS では、Dock アイコンのクリック時に他に開いているウインドウがない場合、アプリのウインドウを再作成するのが一般的です。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // レンダラープロセスからpreload.js経由で 'open-window' チャンネルへ着信
    ipcMain.handle('open-window', (event, fileMeta) => { // 子ウィンドウを作成
        console.log(fileMeta)
        const displays = screen.getAllDisplays();
        for (const display of displays) {
            if (display.bounds.x === 0 && display.bounds.y === 0) continue;
            createSubWindow(display, fileMeta)
            break;
        }
    });
    ipcMain.handle('close-window', (event, fileName) => { // 子ウィンドウを作成
        const windows = BrowserWindow.getAllWindows();
        windows.forEach((window) => {
            if (window.title === fileName) window.close()
        })
    });

    ipcMain.handle('getFiles', (event, target) => {
        return store.get(target, [{
            path: "", name: "", type: "",
            showCloseButton: false,
        }]);
    });
    ipcMain.handle("storeFiles", (event, target, files) => {
        store.set(target, files);
    });
})

// macOS を除き、全ウインドウが閉じられたときに終了します。 ユーザーが
// Cmd + Q で明示的に終了するまで、アプリケーションとそのメニューバーを
// アクティブにするのが一般的です。
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// このファイルでは、アプリ内のとある他のメインプロセスコードを
// インクルードできます。
// 別々のファイルに分割してここで require することもできます。
