import {ipcMain} from 'electron';
import {createVimeoWindow, getVimeoWindow} from "../windows/vimeoWindow.js";

export const registerVimeoHandlers = () => {
    /**
     * 個別動画
     */
    ipcMain.handle("openVimeo", async (event, url, password) => {
        const vimeoWindow = createVimeoWindow()
        try {
            await vimeoWindow.loadURL(url);
            await vimeoWindow.webContents.executeJavaScript(verifyVimeoPassword(password), true);
            vimeoWindow.setTitle("Vimeo Player");
            vimeoWindow.showInactive();
            return true;
        } catch (e) {
            console.error(e);
            vimeoWindow.close();
            return false;
        }
    });
    ipcMain.handle("playVimeo", (event) => {
        getVimeoWindow()?.webContents.executeJavaScript(`
        document.querySelector('div[class^="PlayButton_"] > button').click();
        `, true)
    });
    ipcMain.handle("closeVimeo", (event) => {
        const vimeoWindow = getVimeoWindow()
        if (vimeoWindow && !vimeoWindow.isDestroyed()) vimeoWindow.close();
    });

    /**
     * ショーケース
     */
    ipcMain.handle("openShowcaseVimeo", async (event, vimeo, showcaseUrl) => {
        const vimeoWindow = createVimeoWindow()
        try {
            await vimeoWindow.loadURL(showcaseUrl);
            await vimeoWindow.webContents.executeJavaScript(showcaseTitleSelect(vimeo.title), true);
            vimeoWindow.showInactive();
            return true;
        } catch (e) {
            console.error(e);
            vimeoWindow.close();
            return false;
        }
    });
    ipcMain.handle("playShowcaseVimeo", (event) => {
        getVimeoWindow()?.webContents.executeJavaScript(`
        document.querySelector('div[class^="PlayButton_"] > button').click();
        `, true)
    });
    ipcMain.handle("closeShowcaseVimeo", (event) => {
        const vimeoWindow = getVimeoWindow()
        if (vimeoWindow && !vimeoWindow.isDestroyed()) vimeoWindow.close();
    });

};

function verifyVimeoPassword(password) {
    return `
        const html = document.getElementsByTagName("html")[0];
        
        const interval = setInterval(() => {
            const passwordInput = document.querySelector('input[class^="PasswordGate_module_passwordInput"]');
            const submitButton = document.querySelector('button[class*="PasswordGate_module_submitPassword"]');
            if (!passwordInput) return;
            if (!submitButton) return;
           
            passwordInput.value = "${password}";
            submitButton.click();
            
            setTimeout(() => {
                html.style.opacity = 1
            }, 500)
            
            clearInterval(interval);
        }, 50);
        
        // 2回目以降の表示ではパスワードを要求されない
        // インターバル開始から2秒後に強制表示
        setTimeout(() => {
            html.style.opacity = 1
            clearInterval(interval);
        }, 2000);
    `;
}

function showcaseTitleSelect(title) {
    return `
      const html = document.getElementsByTagName("html")[0];

      const interval_click = setInterval(() => {
        const selected = document.querySelector('ul#playlist-tracklist li[aria-selected="true"] div[class*="playlistTrackClipTitle"]');
        if (!selected) return;

        const selectedTitle = selected.getAttribute("title");
        if (selectedTitle !== "${title}") {
            const el = document.querySelector('div[class^="PlaylistTrack-module-scss-module__"]:has([title="${title}"])');
            if (!el) return clearInterval(interval_click);
           
            if (!el.className.includes("PlaylistTrack_selected"))
                el.click();
        }
        
        setTimeout(() => {
            html.style.opacity = 1
        }, 500)
        
        clearInterval(interval_click);
      }, 50);

      // タイトル不一致や要素未検出の場合でも必ず表示する
      setTimeout(() => {
        html.style.opacity = 1;
        clearInterval(interval_click);
      }, 1000);
    `;
}
