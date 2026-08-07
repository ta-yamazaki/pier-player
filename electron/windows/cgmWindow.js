import {createPlayerWindow} from "./playerWindow.js";

let cgmWindow;

export const createCgmWindow = () => {
    // 外部サイトをロードするためNode権限を渡さず、webSecurityも有効のまま
    cgmWindow = createPlayerWindow({
        css: `
            body {
                overflow: hidden;
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            body::-webkit-scrollbar {
                display:none;
            }
            .mejs-controls:not(:hover) {
              opacity: 0 !important;
            }
        `,
    });
    return cgmWindow;
};

export const getCgmWindow = () => cgmWindow;
