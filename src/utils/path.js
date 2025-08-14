import {fileURLToPath} from "url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const preloadPath = path.join(__dirname, '../preload')

export const imagePath = path.join(__dirname, '../static/img')
export const iconPath = path.join(__dirname, '../static/img/icon.png')