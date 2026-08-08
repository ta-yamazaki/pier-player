# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Pier Player** は Nuxt 3 + Vue 3 + Electron で構築されたデスクトップメディアプレイヤーアプリケーション（Windows向け）。複数の再生モード（ファイル、CGM動画、Vimeo個別/ショーケース、タイムライン、賛美＝praise）と音声処理機能を持つ。

`docs/development.md`（開発手順・IPC追加手順）と `docs/release.md`（リリース手順）に詳細あり。

## コマンド

```bash
# 開発サーバー起動（Nuxt + Electron）
npm run dev

# 本番ビルド（Nuxt静的生成 + Electronパッケージング）
npm run build

# Nuxtのみビルド
npm run build:nuxt

# Electronのみビルド（Nuxt生成済み前提）
npm run build:electron

# テスト（vitest、tests/ 配下）
npm run test

# 単一テストファイルの実行
npx vitest run tests/utils.test.ts

# リント
npm run lint

# リリース（package.json の version から gitタグ作成 & push → GitHub Releasesをトリガー）
npm run release

# 同バージョンのタグを打ち直してリリースやり直し
npm run release:force
```

テストは `tests/` にあるユーティリティ・composableの単体テストのみ（vitest）。Electron側やコンポーネントのテストはない。

ESLintは `@nuxt/eslint-config` を直接使うスタンドアロン構成（Nuxt 3.6.5 では `@nuxt/eslint` モジュールが設定ファイルを生成しないため）。`no-explicit-any` は warn 扱いで段階的に解消中。

## アーキテクチャ

### ディレクトリ構造

- `app/` — Nuxt フロントエンド（`nuxt.config.ts` の `srcDir`）
  - `pages/` — ファイルベースルーティング（各再生モードに対応）
  - `components/` — ドメイン別コンポーネント（`cgm/`, `vimeo/`, `timeline/`, `file/` など）
  - `composables/` — Vue 3 Composition API フック（`useDragSort`, `useStoredList`, `useNotification`）
  - `utils/` — 純粋関数ユーティリティ（`format.ts`, `media.ts` など、テスト対象）
  - `types/` — 共有型定義（`models.ts`, `window.d.ts` = preload公開APIの型）
  - `assets/css/` — グローバルCSS（Bulma + カスタム）。UIはカスタムCSSより先にBulmaのクラス・ヘルパーで組む。`nuxt.config.ts` で `data-theme="light"` を固定しており、OSのダークモードには追従しない
  - `app/public/sub/` と `app/public/timeline/` — サブウィンドウ／タイムラインプレイヤー用HTML（Nuxt管轄外の素のHTML+JS。ルート直下の `public/` ではないので注意）
- `electron/` — Electronメインプロセス
  - `main.ts` — エントリポイント、ウィンドウ初期化とIPCセットアップ
  - `ipc/` — IPCハンドラ（機能別に分割: `mainHandlers.js`, `timelineHandlers.js` など）
  - `ipc/channels.ts` — IPCチャンネル名の一元定義。**preloadとハンドラは必ずここからimportする**
  - `preload/` — コンテキストブリッジ経由でAPIをレンダラーに公開
  - `windows/` — ウィンドウ生成ファクトリ
- `tests/` — vitest単体テスト
- `dist-electron/` — コンパイル済みElectronファイル（自動生成）
- `.output/` — Nuxtビルド出力（自動生成）

各モードは「`app/pages/` のページ」と「`electron/ipc/<機能>Handlers.js`」がペアになっている（対応表は `docs/development.md`）。

### マルチウィンドウ構成

アプリ起動時に5種類のウィンドウを管理:
1. **メインウィンドウ** — プライマリUIとナビゲーション
2. **サブウィンドウ** — セカンダリモニター再生（ファイルモード）
3. **CGMウィンドウ** — CGM動画再生
4. **Vimeoウィンドウ** — Vimeo動画再生
5. **タイムラインウィンドウ** — 同期マルチ動画再生

### IPC通信パターン

レンダラー（Vue/Nuxt）とメインプロセス（Node.js）間はElectron IPCで通信。チャンネル名は `electron/ipc/channels.ts` に集約。`electron/preload/preload.ts` でコンテキストブリッジを通じて以下のAPIをグローバルに公開:

| グローバル | 用途 |
|---|---|
| `window.api` | ファイル再生モード |
| `window.cgmApi` | CGM動画再生 |
| `window.vimeoApi` | Vimeo個別再生 |
| `window.showcaseApi` | Vimeoショーケース |
| `window.timelineApi` | タイムラインプレイヤー |
| `window.praiseApi` | 賛美モードのセットリスト永続化 |
| `window.convertApi` | 音声変換（ピッチ、ラウドネス） |
| `window.commonApi` | バージョン、アップデート、フォルダ |

サブウィンドウ用に別preloadがある: `subReceiver.ts` → `window.sub`、`timelineReceiver.ts` → `window.timelineReceiver`。これらの型は `app/types/window.d.ts` に定義。

`ipcRenderer.on` 系のAPIは解除関数を返す（`const off = api.on(...)` パターン）。コンポーネント側は `onUnmounted` で解除し、リスナーの多重登録を防ぐこと。

IPC APIを追加する手順: ①`electron/ipc/channels.ts` にチャンネル名を追加 → ②`electron/ipc/<機能>Handlers.js` にハンドラ → ③`electron/ipc/handlers.js` で登録 → ④`electron/preload/preload.ts` で公開 → ⑤`app/types/window.d.ts` に型を追加。

### 賛美（praise）モード

他モードと違い、データソースはElectron側ではなくレンダラーから直接叩く Firebase（`app/utils/praise/`）。`pier-praise` プロジェクトの Firestore / Storage / Auth を使い、認証は `inMemoryPersistence` 固定でアプリ終了時にセッションが消える設計（起動時に既存セッションを明示的に `signOut` する）。`onAuthStateChanged` を登録する前に必ず `PraiseAuth.ready` を await すること。Electron側に持つのはセットリストの永続化（`praiseApi`）のみ。

### データ永続化

`electron-store` を使用してJSON形式で永続化。`electron/ipc/storeHandlers.js` で一元管理（レンダラーから渡されるタブ名などのキーはホワイトリスト検証あり）。ファイルリスト、CGMリスト、Vimeoリスト、タイムライン履歴・波形ピークキャッシュ（件数上限あり）などを保存。リスト項目には安定した `id` を付与する（追加時に採番、既存データはロード時に補完）。ファイルパスを持つリストは読み出し時に存在チェック（`electron/utils/fileCheck.js`）を通す。

### FFmpeg統合

`ffmpeg-static` と `ffprobe-static` をランタイム依存として同梱。ピッチシフト（rubberband）とラウドネス解析（LUFS）に使用。バイナリを実行できるよう `electron-builder.json5` で `asar: false`（非ASAR構成）にしている。`spawn` は `shell: true` を使わず引数配列で渡す。ノーマライズ結果は元ファイルを上書きせず `_normalized` 付き別名で保存する。

### ビルド設定

- `nuxt.config.ts`: SSR無効、ハッシュルーターモード（Electron互換）、`nuxt-electron` モジュール
- `electron-builder.json5`: Windows x64、NSIS形式インストーラー、`release/${version}/` に出力
- Electron用エントリポイント（main / preload×3）は `nuxt.config.ts` の `electron.build` で定義。preloadを追加する場合はここにもエントリを足すこと

### 自動アップデート

`electron-updater` でGitHub Releasesからの自動更新をサポート。`npm run release` でgitタグをpushするとGitHubリリースワークフローがトリガーされる。
