import {ipcMain, session} from 'electron';
import {createVimeoWindow, getVimeoWindow, HIDDEN_CSS, PLAYER_UI_CSS} from "../windows/vimeoWindow.js";
import {ShowcaseChannels, VimeoChannels} from "./channels";

// ショーケースのページに読み込まれる同意管理スクリプト。
// 再生画面にCookie同意バナーが被さるため読み込ませない。
const CONSENT_SCRIPT_URLS = ['https://transcend-cdn.com/*'];

// ショーケースのページからプレイヤーのiframeだけを全画面で見せる
const SHOWCASE_PAGE_CSS = `
    ${HIDDEN_CSS}

    html, body {
      overflow: hidden !important;
      margin: 0 !important;
      background: #000 !important;
    }

    iframe[src*="player.vimeo.com"] {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2147483647 !important;
      border: 0 !important;
    }
`;

let consentBlocked = false;

const blockConsentBanner = () => {
    if (consentBlocked) return;
    consentBlocked = true;
    session.defaultSession.webRequest.onBeforeRequest(
        {urls: CONSENT_SCRIPT_URLS},
        (_details, callback) => callback({cancel: true}),
    );
};

// Vimeoプレイヤーのフレームを返す。
// プレイヤーを直接開いた場合はメインフレーム自身、ショーケースのページ経由ならiframeになる。
const getPlayerFrame = (webContents) =>
    webContents?.mainFrame?.framesInSubtree?.find(frame => frame.url.includes('player.vimeo.com'));

const waitForPlayerFrame = async (webContents, timeoutMs = 20000) => {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const frame = getPlayerFrame(webContents);
        if (frame) return frame;
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    return null;
};

export const registerVimeoHandlers = () => {
    blockConsentBanner();

    /**
     * 個別動画
     */
    ipcMain.handle(VimeoChannels.open, async (_event, url, password) => {
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
    ipcMain.handle(VimeoChannels.play, () => {
        getVimeoWindow()?.webContents.executeJavaScript(`
        document.querySelector('div[class^="PlayButton_"] > button').click();
        `, true)
    });
    ipcMain.handle(VimeoChannels.close, () => {
        const vimeoWindow = getVimeoWindow()
        if (vimeoWindow && !vimeoWindow.isDestroyed()) vimeoWindow.close();
    });

    /**
     * ショーケース
     */
    ipcMain.handle(ShowcaseChannels.open, async (_event, vimeo, showcaseUrl, password) => {
        // 映像の指定は動画IDで行う。IDが無い項目はUI側で操作できないようにしてある
        if (!vimeo.clipId) return false;
        return openShowcaseClip(vimeo, showcaseUrl, password);
    });
    ipcMain.handle(ShowcaseChannels.play, () => {
        getPlayerFrame(getVimeoWindow()?.webContents)?.executeJavaScript(`
        document.querySelector('div[class^="PlayButton_"] > button').click();
        `)
    });
    ipcMain.handle(ShowcaseChannels.close, () => {
        const vimeoWindow = getVimeoWindow()
        if (vimeoWindow && !vimeoWindow.isDestroyed()) vimeoWindow.close();
    });

};

// ショーケースのページを ?video=<clipId> で開き、プレイヤーのiframeだけを見せる
async function openShowcaseClip(vimeo, showcaseUrl, password) {
    const vimeoWindow = createVimeoWindow(SHOWCASE_PAGE_CSS)
    try {
        await vimeoWindow.loadURL(`${showcaseUrl}?video=${encodeURIComponent(vimeo.clipId)}`);
        await vimeoWindow.webContents.executeJavaScript(unlockShowcasePage(password), true);

        // プレイヤーはパスワード認証後にiframeとして現れる
        const playerFrame = await waitForPlayerFrame(vimeoWindow.webContents);
        if (!playerFrame) throw new Error('Vimeoプレイヤーが表示されませんでした');

        // insertCSS はメインフレームにしか効かないため、iframe側はJSでstyleを差し込む
        await playerFrame.executeJavaScript(`
            const style = document.createElement('style');
            style.textContent = ${JSON.stringify(PLAYER_UI_CSS)};
            document.head.appendChild(style);
        `);

        vimeoWindow.showInactive();
        await vimeoWindow.webContents.executeJavaScript(`document.documentElement.style.opacity = 1`, true);
        return true;
    } catch (e) {
        console.error(e);
        vimeoWindow.close();
        return false;
    }
}

// ショーケースのページのパスワードゲートを通す
function unlockShowcasePage(password) {
    return `
        const html = document.getElementsByTagName("html")[0];

        const interval = setInterval(() => {
            const input = document.querySelector('input[type="password"]');
            const submit = document.querySelector('button[type="submit"]');
            if (!input) return;
            if (!submit) return;

            // Reactが管理する入力欄なので、値の設定はネイティブsetter経由で行う
            const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setValue.call(input, ${JSON.stringify(password)});
            input.dispatchEvent(new Event('input', {bubbles: true}));
            submit.click();

            clearInterval(interval);
        }, 50);

        // 2回目以降の表示ではパスワードを要求されない
        setTimeout(() => clearInterval(interval), 2000);
    `;
}

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

