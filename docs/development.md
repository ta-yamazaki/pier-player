# 開発手順

## 前提条件

- Node.js（LTS推奨）
- npm
- Git

## セットアップ

```bash
git clone https://github.com/ta-yamazaki/pier-player.git
cd pier-player
npm install
```

`npm install` 後、`postinstall` フックで `nuxt prepare` が自動実行される。

## 開発サーバー起動

```bash
npm run dev
```

`nuxt-electron` モジュールにより、Nuxt開発サーバーとElectronが同時に起動する。

- `app/` 配下のVue/Nuxtファイルを変更するとレンダラーが自動リロード
- `electron/preload/` 配下を変更するとプリロードが再ビルドされ、レンダラーがリロード
- `electron/main.ts` を変更するとElectronメインプロセスが再起動

## プロジェクト構造

```
pier-player/
├── app/                    # Nuxt フロントエンド (srcDir)
│   ├── pages/              # 各再生モードのページ
│   ├── components/         # ドメイン別コンポーネント
│   ├── composables/        # Vue 3 Composition API フック
│   └── assets/css/         # グローバルスタイル
└── electron/               # Electron メインプロセス
    ├── main.ts             # エントリポイント
    ├── ipc/                # IPCハンドラ（機能別）
    ├── preload/            # コンテキストブリッジ定義
    └── windows/            # ウィンドウ生成ファクトリ
```

## 主要な開発ポイント

### 再生モードの追加・修正

各モードは `app/pages/` のページコンポーネントと `electron/ipc/` のハンドラがペアになっている。

| モード | ページ | IPCハンドラ |
|---|---|---|
| ファイル再生 | `app/pages/index.vue` | `electron/ipc/mainHandlers.js` |
| タイムライン | `app/pages/timeline/index.vue` | `electron/ipc/timelineHandlers.js` |
| CGM動画 | `app/pages/cgm.vue` | `electron/ipc/cgmHandlers.js` |
| Vimeo | `app/pages/vimeo/index.vue` | `electron/ipc/vimeoHandlers.js` |
| ピッチ変換 | `app/pages/convert/pitch.vue` | `electron/ipc/convertHandlers.js` |

### IPC APIの追加手順

1. `electron/ipc/<機能>Handlers.js` にハンドラを追加
2. `electron/ipc/handlers.js` でインポート・登録
3. `electron/preload/preload.ts` でコンテキストブリッジに公開
4. Vue側で `window.<api名>.<メソッド名>()` を呼び出す

### データ永続化

`electron/ipc/storeHandlers.js` で `electron-store` を管理。新しいデータを永続化する場合はこのファイルにキーとハンドラを追加する。

### ウィンドウの追加・修正

`electron/windows/windows.js` でウィンドウを生成し、`electron/main.ts` で初期化する。

## リント

```bash
npx eslint .
```

ESLintはNuxtプリセット（`@nuxt/eslint`）を使用。
