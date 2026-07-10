import {app, BrowserWindow, dialog} from 'electron'
import electronUpdater from 'electron-updater'
import {registerIpcHandlers} from "./ipc/handlers";
import {createWindows, initMainWindow} from "./windows/windows";

const {autoUpdater} = electronUpdater;

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
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
    autoUpdater.on('update-downloaded', () => {
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
