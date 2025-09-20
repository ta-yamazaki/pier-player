import {app, BrowserWindow, dialog} from 'electron';
import electronUpdater from 'electron-updater'
import {registerIpcHandlers} from './ipc/handlers.js';
import {createWindows, initMainWindow} from "./windows/windows.js";

const {autoUpdater} = electronUpdater;

app.whenReady().then(() => {

    createWindows();
    registerIpcHandlers();

    checkForUpdatesDialog();
});


function checkForUpdatesDialog() {
    autoUpdater.checkForUpdates();

    // 更新がある場合
    autoUpdater.on('update-available', (info) => {
        dialog.showMessageBox({
            type: 'info',
            title: 'アップデートがあります',
            message: `新しいバージョン ${info.version} が利用可能です。ダウンロードしますか？`,
            buttons: ['はい', 'いいえ']
        }).then(result => {
            if (result.response === 0) {
                autoUpdater.downloadUpdate();
            }
        });
    });

    // 更新がない場合
    autoUpdater.on('update-not-available', () => {
        console.log('最新バージョンです');
    });

    // ダウンロード完了時
    autoUpdater.on('update-downloaded', (info) => {
        dialog.showMessageBox({
            type: 'info',
            title: 'アップデート準備完了',
            message: 'アプリを再起動すると最新になります',
            buttons: ['今すぐ再起動', '後で']
        }).then(result => {
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    });

    autoUpdater.on('error', (err) => {
        console.error('アップデートエラー:', err);
    });
}

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0)
        initMainWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
