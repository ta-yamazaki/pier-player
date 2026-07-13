import path from "node:path";

const __dirname = path.dirname(__filename);

// ビルド後は dist-electron/ 直下で実行されるため、1つ上がプロジェクトルート
export const APP_ROOT = path.join(__dirname, '..');
// コンパイル済みElectronファイル（preloadスクリプト）の場所
export const MAIN_DIST = path.join(APP_ROOT, 'dist-electron');
// Nuxtの静的生成出力
export const VITE_PUBLIC = path.join(APP_ROOT, '.output/public');

// Windowsではマルチサイズ.icoを使うとタイトルバー/タスクバーで最適な解像度が選ばれる
export const iconPath = path.join(__dirname, '../electron/assets/img/icon.ico')
