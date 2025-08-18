import {BrowserWindow, screen} from 'electron';
import path from 'node:path';
import {iconPath, preloadPath} from "../utils/path.js";

let vimeoWindow;
export const createVimeoWindow = () => {
    vimeoWindow = new BrowserWindow({
        show: false,
        icon: iconPath,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: 'black',
        // opacity: 0,
        alwaysOnTop: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(preloadPath, '/vimeoReceiver.js')
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
        [class^="ControlBarButtonsAndMenus_"],
        [class^="Outro_module_outroWrapper"],
        [class*="SideDock_module_root"] {
          display: none !important;
        }
        
        [class^="ControlBar_"]:not(:hover) {
          opacity: 0 !important;
        }
    `)

    // if (devToolsEnabled)
    //     vimeoWindow.webContents.openDevTools() // デベロッパーツール

    return vimeoWindow;
}


export const getVimeoWindow = () => vimeoWindow;
