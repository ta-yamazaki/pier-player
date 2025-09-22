import {ipcMain} from 'electron';
import {createVimeoWindow, getVimeoWindow} from "../windows/vimeoWindow.js";
import {getMainWindow} from "../windows/mainWindow.js";

export const registerVimeoHandlers = () => {
    /**
     * 個別動画
     */
    ipcMain.handle("openVimeo", (event, url, password) => {
        const vimeoWindow = createVimeoWindow()
        vimeoWindow.loadURL(url).then(async () => {
            await vimeoWindow.webContents.executeJavaScript(verifyVimeoPassword(password), true)
            vimeoWindow.setTitle("Vimeo Player");
            vimeoWindow.showInactive();
        }).catch((e) => {
            console.error(e)
            vimeoWindow.close();
            getMainWindow().webContents.send("errorVimeoOpen");
        });
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
    ipcMain.handle("openShowcaseVimeo", (event, vimeo, showcaseUrl) => {
        const vimeoWindow = createVimeoWindow()
        vimeoWindow.loadURL(showcaseUrl).then(() => {
            vimeoWindow.webContents.executeJavaScript(showcaseTitleSelect(vimeo.title), true)
            vimeoWindow.showInactive();
        }).catch((e) => {
            console.error(e)
            vimeoWindow.close();
            getMainWindow().webContents.send("errorVimeoOpen");
        });
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
        const el = document.querySelector('div[class^="PlaylistTrack_playlistTrack"]:has([title="${title}"])');
        if (!el) return;
       
        if (!el.className.includes("PlaylistTrack_selected"))
            el.click();
        
        setTimeout(() => {
            html.style.opacity = 1
        }, 500)
        
        clearInterval(interval_click);
      }, 50);
    `;
}
