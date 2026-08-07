import {createPlayerWindow} from "./playerWindow.js";

let vimeoWindow;

// 表示準備が整うまで隠しておく（準備完了後にJSで opacity を戻す）
export const HIDDEN_CSS = `html { opacity: 0 }`;

// Vimeoプレイヤーの余計なUIを隠す。
// プレイヤーがiframeの中にある場合はこのCSSをそのフレームへ注入する。
export const PLAYER_UI_CSS = `
    [class^="PlaylistWrapper_"],
    [class^="PlaylistWrapper-"],
    [class^="ControlBarButtonsAndMenus_"],
    [class^="Outro_module_outroWrapper"],
    [class*="SideDock_module_root"] {
      display: none !important;
    }

    [class^="ControlBar_"]:not(:hover),
    [class^="ControlBarV1_"]:not(:hover) {
      opacity: 0 !important;
    }
`;

/**
 * @param {string} [css] ロード後に注入するCSS（省略時はプレイヤーを直接開く場合の既定）
 */
export const createVimeoWindow = (css = `${HIDDEN_CSS}\n${PLAYER_UI_CSS}`) => {
    // 外部サイトをロードするためNode権限を渡さず、webSecurityも有効のまま
    vimeoWindow = createPlayerWindow({css});
    return vimeoWindow;
};

export const getVimeoWindow = () => vimeoWindow;
