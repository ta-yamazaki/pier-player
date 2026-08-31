import {ipcMain} from 'electron';
import {createCgmWindow, getCgmWindow} from '../windows/cgmWindow.js';
import {getMainWindow} from '../windows/mainWindow.js';
import {CgmChannels} from './channels';

// 再生終了を待って、CGMウィンドウを閉じメイン画面へ通知する。
// CGMウィンドウは外部サイトを開くためpreloadを持たせておらず、
// executeJavaScript が返すPromiseの解決を終了イベント代わりに使う。
const closeOnEnded = async (cgmWindow) => {
    try {
        await cgmWindow.webContents.executeJavaScript(`
            new Promise(resolve => {
                const media = document.querySelector('video, audio');
                // 映像が見つからない場合は解決させない（誤って閉じないため）
                if (!media) return;

                // ループ再生だと ended が発火しないため、末尾到達も終了とみなす
                media.loop = false;
                media.addEventListener('ended', () => resolve(), {once: true});
                media.addEventListener('timeupdate', () => {
                    if (!media.duration) return;
                    if (media.currentTime >= media.duration - 0.3) resolve();
                });
            })
        `, true);
    } catch {
        // 終了前にウィンドウが閉じられた場合など。通知は不要
        return;
    }

    // 「閉じる」後に別の映像が表示されている場合は対象外
    if (cgmWindow.isDestroyed() || getCgmWindow() !== cgmWindow) return;

    cgmWindow.destroy();
    getMainWindow().webContents.send(CgmChannels.ended);
};

export const registerCgmHandlers = () => {
    ipcMain.handle(CgmChannels.open, async (_event, cgm) => {
        const cgmWindow = createCgmWindow();
        try {
            await cgmWindow.loadURL(cgm.path);
            cgmWindow.setTitle(cgm.title || "CGM Player");
            cgmWindow.showInactive();
        } catch (e) {
            console.error(e);
            cgmWindow.destroy();
            getMainWindow().webContents.send(CgmChannels.errorOpen);
        }
    });

    ipcMain.handle(CgmChannels.play, () => {
        const cgmWindow = getCgmWindow();
        if (!cgmWindow) return;
        cgmWindow.webContents.executeJavaScript(`$('#player1')[0].player.play()`, true);
        closeOnEnded(cgmWindow);
    });

    ipcMain.handle(CgmChannels.close, () => {
        getCgmWindow()?.destroy();
    });
};
