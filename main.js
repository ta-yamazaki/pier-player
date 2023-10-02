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
    // mainWindow.webContents.openDevTools() // デベロッパーツール

    mainWindow.on('close', () => {
        BrowserWindow.getAllWindows().forEach(window => window.close())
    })
}

let subWindow;
const createSubWindow = () => {
    subWindow = new BrowserWindow({
        show: false,
        icon: icon,
        frame: false,
        title: 'サブモニタ',
        titleBarStyle: 'hidden',
        backgroundColor: 'black',
        opacity: 0,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });
    subWindow.on('close', () => { hideSubWindow(subWindow) })
    subWindow.loadFile('player.html').then(() => {
        subWindow.showInactive();
        // subWindow.hide();
    });

    const displays = screen.getAllDisplays();
    for (const display of displays) {
        if (display.bounds.x === 0 && display.bounds.y === 0) continue;
        subWindow.setBounds({ x: display.bounds.x, y: display.bounds.y })
        subWindow.setFullScreen(true)
        break;
    }
    // subWindow.webContents.openDevTools()
}

const loadSubWindow = (display, fileMeta) => {
    hideSubWindow();

    subWindow.setTitle(fileMeta.name)

    subWindow.webContents.send("subWindowShow",{
        path: fileMeta.path,
        type: fileMeta.type,
    });

    ipcMain.on('subContentsCreated', (_event, value) => {
        subWindow.setOpacity(1)
        // subWindow.show()
    })

    // subWindow.webContents.openDevTools() // デベロッパーツール
}
const hideSubWindow = () => {
    subWindow.setTitle("サブモニタ")
    subWindow.setOpacity(0)
    subWindow.webContents.send("subWindowHide");
    // window.hide()
    // subWindow.loadFile('player.html').then();
}

// このメソッドは、Electron の初期化が完了し、
// ブラウザウインドウの作成準備ができたときに呼ばれます。
// 一部のAPIはこのイベントが発生した後にのみ利用できます。
app.whenReady().then(() => {
    createWindow()
    createSubWindow()

    app.on('activate', () => {
        // macOS では、Dock アイコンのクリック時に他に開いているウインドウがない場合、アプリのウインドウを再作成するのが一般的です。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // レンダラープロセスからpreload.js経由で 'open-window' チャンネルへ着信
    ipcMain.handle('open-window', (event, fileMeta) => { // 子ウィンドウを作成
        const displays = screen.getAllDisplays();
        for (const display of displays) {
            if (display.bounds.x === 0 && display.bounds.y === 0) continue;
            loadSubWindow(display, fileMeta)
            break;
        }
    });
    ipcMain.handle('close-window', (event) => { // 子ウィンドウを作成
        hideSubWindow()
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
