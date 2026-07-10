import {createPlayerWindow} from "./playerWindow.js";

let vimeoWindow;

export const createVimeoWindow = () => {
    // 外部サイトをロードするためNode権限を渡さず、webSecurityも有効のまま
    vimeoWindow = createPlayerWindow({
        css: `
            html { opacity: 0 }

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
        `,
    });
    return vimeoWindow;
};

export const getVimeoWindow = () => vimeoWindow;
