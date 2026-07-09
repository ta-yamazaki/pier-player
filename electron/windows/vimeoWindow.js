import {BrowserWindow, screen} from 'electron';
import {iconPath} from "../utils/path.js";

let vimeoWindow;
export const createVimeoWindow = () => {
    vimeoWindow = new BrowserWindow({
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
        vimeoWindow.setBounds({x: display.bounds.x, y: display.bounds.y})
        vimeoWindow.setFullScreen(true)
        break;
    }

    vimeoWindow.webContents.insertCSS(`
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
    `)

    return vimeoWindow;
}


export const getVimeoWindow = () => vimeoWindow;
