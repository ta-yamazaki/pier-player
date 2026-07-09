import {BrowserWindow, screen} from 'electron';
import {iconPath} from "../utils/path.js";

let cgmWindow;

export const createCgmWindow = () => {
    cgmWindow = new BrowserWindow({
        show: false,
        icon: iconPath,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: 'black',
        alwaysOnTop: false,
        // 外部サイトをロードするためNode権限を渡さず、webSecurityも有効のまま
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    const displays = screen.getAllDisplays();
    for (const display of displays) {
        if (display.bounds.x === 0 && display.bounds.y === 0) continue;
        cgmWindow.setBounds({x: display.bounds.x, y: display.bounds.y});
        cgmWindow.setFullScreen(true);
        break;
    }

    cgmWindow.webContents.insertCSS(`
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
    `);

    return cgmWindow;
};

export const getCgmWindow = () => cgmWindow;
