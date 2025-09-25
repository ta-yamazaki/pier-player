import {app, BrowserWindow, dialog} from 'electron'
import path from 'node:path'
import electronUpdater from 'electron-updater'
import {registerIpcHandlers} from "./ipc/handlers";
import {createWindows, initMainWindow} from "./windows/windows";

const {autoUpdater} = electronUpdater;

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js
// │ ├─┬ preload
// │ │ └── index.js
// │ ├─┬ renderer
// │ │ └── index.html
process.env.APP_ROOT = path.join(__dirname, '..')
process.env.VITE_PUBLIC = path.join(process.env.APP_ROOT, '.output/public')

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
    console.log("activate")
    if (BrowserWindow.getAllWindows().length === 0)
        initMainWindow();
});

app.whenReady().then(() => {
    createWindows();
    registerIpcHandlers();

    checkForUpdatesDialog();
})

function checkForUpdatesDialog() {
    autoUpdater.checkForUpdatesAndNotify();

    // ダウンロード完了時
    autoUpdater.on('update-downloaded', (info) => {
        dialog.showMessageBox({
            type: 'info',
            title: 'アップデートがあります',
            message: `新しいバージョンが利用可能です。アプリを再起動すると最新になります。`,
            buttons: ['今すぐ再起動', '後で']
        }).then(result => {
            if (result.response === 0)
                autoUpdater.quitAndInstall();
        });
    });

    autoUpdater.on('error', (err) => {
        console.error('アップデートエラー:', err);
    });
}
