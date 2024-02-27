// main.js

// このモジュールはアプリケーションの生き死にを制御し、ネイティブブラウザウインドウを作成します
const { app, BrowserWindow, screen, ipcMain, shell } = require('electron')
const path = require('node:path')

const fs = require('fs');
const fsPromises = fs.promises;

const Store = require('electron-store');
const store = new Store();

// const icon = "static/favicon.ico";
const icon = "static/icon.png";

const devToolsEnabled = false;
// const devToolsEnabled = true;

let mainWindow;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 600, height: 700,
        icon: icon,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadFile('index.html').then();

    if (devToolsEnabled)
        mainWindow.webContents.openDevTools() // デベロッパーツール

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
        alwaysOnTop: false,
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
        subWindow.moveTop()
        // subWindow.show()
    })

    if (devToolsEnabled)
        subWindow.webContents.openDevTools() // デベロッパーツール
}
const hideSubWindow = () => {
    subWindow.setTitle("サブモニタ")
    subWindow.setOpacity(0)
    subWindow.webContents.send("subWindowHide");
    // window.hide()
    // subWindow.loadFile('player.html').then();
}

let cgmWindow;
const createCgmWindow = () => {
    cgmWindow = new BrowserWindow({
        show: false,
        icon: icon,
        frame: false,
        title: 'CGMモニタ',
        titleBarStyle: 'hidden',
        backgroundColor: 'black',
        // opacity: 0,
        alwaysOnTop: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
    });
    cgmWindow.on('close', () => { cgmWindow.hide(); })

    const displays = screen.getAllDisplays();
    for (const display of displays) {
        if (display.bounds.x === 0 && display.bounds.y === 0) continue;
        cgmWindow.setBounds({ x: display.bounds.x, y: display.bounds.y })
        cgmWindow.setFullScreen(true)
        break;
    }

    cgmWindow.webContents.insertCSS(`
            body {
                overflow: hidden;
                /* IE, Edge 対応 */
                -ms-overflow-style: none;
                /* Firefox 対応 */
                scrollbar-width: none;
            }
            /* Chrome, Safari 対応 */
            body::-webkit-scrollbar {
                    display:none;
            }
        `)

    cgmWindow.webContents.executeJavaScript(`
            $(function(){
              $('body').hide()
              setTimeout(function() {
                $('#player1')[0].player.remove()
                $('#player1').mediaelementplayer({
                  success: function(media, node, player) {
                   window.api.cgmLoadedFromCgmWindow();
                   $('body').show()
                   $('.mejs-controls').hide()
                   media.addEventListener("ended", () => {
                      console.log("ended")
                       player.setMuted(true)
                    })
                  }
                });
              }, 1500)
            });
        `, true)

    if (devToolsEnabled)
        cgmWindow.webContents.openDevTools() // デベロッパーツール
}

// このメソッドは、Electron の初期化が完了し、
// ブラウザウインドウの作成準備ができたときに呼ばれます。
// 一部のAPIはこのイベントが発生した後にのみ利用できます。
app.whenReady().then(() => {
    createWindow()
    createSubWindow()
    createCgmWindow()

    app.on('activate', () => {
        // macOS では、Dock アイコンのクリック時に他に開いているウインドウがない場合、アプリのウインドウを再作成するのが一般的です。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    // レンダラープロセスからpreload.js経由で 'open-window' チャンネルへ着信
    ipcMain.handle('open-window', (event, fileMeta) => { // 子ウィンドウを作成

        // 存在チェック
        const filePath = fileMeta.path;
        const fileExists = fs.existsSync(filePath);

        if (!fileExists) {
            console.error("ファイルが存在しません。");
            return false;
        }

        console.log("file exists")

        const displays = screen.getAllDisplays();
        for (const display of displays) {
            if (display.bounds.x === 0 && display.bounds.y === 0) continue;
            loadSubWindow(display, fileMeta)
            break;
        }
        return true;
    });
    ipcMain.handle('close-window', (event) => { // 子ウィンドウを作成
        hideSubWindow()
    });

    ipcMain.handle('checkFilePaths', async (event, files) => { // 子ウィンドウを作成
        const result = [];

        for (const file of files) {
            const fileExists = file.path === ""
                ? true : fs.existsSync(file.path);

            result.push({
                path: file.path,
                name: file.name,
                type: file.type,
                exists: fileExists
            })
        }

        console.log("#### result")
        console.log(result)
        return result;
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

    ipcMain.handle("openCgm", (event, cgm) => {
        cgmWindow.close();
        createCgmWindow()
        cgmWindow.loadURL(cgm.path).then(() => {
            cgmWindow.setTitle(cgm.title)
            cgmWindow.showInactive();
        }).catch((e) => {
            console.error(e)
            cgmWindow.close();
            mainWindow.webContents.send("errorCgmOpen");
        });
    });
    ipcMain.handle("cgmLoadedFromCgmWindow", (event) => {
        mainWindow.webContents.send("cgmLoaded");
    });
    ipcMain.handle("playCgm", (event, cgmPath) => {
        // cgmWindow.setTitle(fileMeta.name)

        // cgmWindow.webContents.insertCSS(".mejs-controls {}")
        cgmWindow.webContents.executeJavaScript(`
         $('#player1')[0].player.play()
        `, true)
    });
    ipcMain.handle("closeCgm", (event) => {
        cgmWindow.webContents.executeJavaScript(`
         $('#player1')[0].player.pause()
        `, true)
        cgmWindow.hide();
    });

    ipcMain.handle("getCgmList", (event) => {
        const cgmList = store.get("cgmList");
        return cgmList ? cgmList : [{
            path: "", title: "",
            isViewed: false, isPlaying: false
        }]
    });
    ipcMain.handle("storeCgmList", (event, cgmList) => {
        store.set("cgmList", cgmList);
    });

    ipcMain.handle('getVersion', (event) => {
        return app.getVersion()
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
