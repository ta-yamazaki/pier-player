import {app} from "electron";

export const devToolsEnabled = () => {
    // return false;
    return !app.isPackaged;
}
