# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Pier Player** は Nuxt 3 + Vue 3 + Electron で構築されたデスクトップメディアプレイヤーアプリケーション（Windows向け）。複数の再生モード（ファイル、CGM動画、Vimeo、タイムライン）と音声処理機能を持つ。

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

# リリース（gitタグ作成 & pushでGitHub Releasesをトリガー）
npm run release
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
  - `assets/css/` — グローバルCSS（Bulma + カスタム）
  - `public/sub/` と `public/timeline/` — サブウィンドウ用HTMLファイル（Nuxt管轄外の素のHTML+JS）
- `electron/` — Electronメインプロセス
  - `main.ts` — エントリポイント、ウィンドウ初期化とIPCセットアップ
  - `ipc/` — IPCハンドラ（機能別に分割: `mainHandlers.js`, `timelineHandlers.js` など）
  - `ipc/channels.ts` — IPCチャンネル名の一元定義。**preloadとハンドラは必ずここからimportする**
  - `preload/` — コンテキストブリッジ経由でAPIをレンダラーに公開
  - `windows/` — ウィンドウ生成ファクトリ
- `tests/` — vitest単体テスト
- `dist-electron/` — コンパイル済みElectronファイル（自動生成）
- `.output/` — Nuxtビルド出力（自動生成）
- `REFACTORING.md` — リファクタリング課題の一覧と対応状況

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
| `window.convertApi` | 音声変換（ピッチ、ラウドネス） |
| `window.commonApi` | バージョン、アップデート、フォルダ |

サブウィンドウ用に別preloadがある: `subReceiver.ts` → `window.sub`、`timelineReceiver.ts` → `window.timelineReceiver`。これらの型は `app/types/window.d.ts` に定義。

`ipcRenderer.on` 系のAPIは解除関数を返す（`const off = api.on(...)` パターン）。コンポーネント側は `onUnmounted` で解除し、リスナーの多重登録を防ぐこと。

### データ永続化

`electron-store` を使用してJSON形式で永続化。`electron/ipc/storeHandlers.js` で一元管理（保存キーはホワイトリスト検証あり）。ファイルリスト、CGMリスト、Vimeoリスト、タイムライン履歴などを保存。リスト項目には安定した `id` を付与する（追加時に採番、既存データはロード時に補完）。

### FFmpeg統合

`ffmpeg-static` と `ffprobe-static` をランタイム依存として同梱。ピッチシフト（rubberband）とラウドネス解析（LUFS）に使用。バイナリを実行できるよう `electron-builder.json5` で `asar: false`（非ASAR構成）にしている。`spawn` は `shell: true` を使わず引数配列で渡す。ノーマライズ結果は元ファイルを上書きせず `_normalized` 付き別名で保存する。

### ビルド設定

- `nuxt.config.ts`: SSR無効、ハッシュルーターモード（Electron互換）、`nuxt-electron` モジュール
- `electron-builder.json5`: Windows x64、NSIS形式インストーラー、`release/${version}/` に出力
- Electron用エントリポイント（main / preload×3）は `nuxt.config.ts` の `electron.build` で定義。preloadを追加する場合はここにもエントリを足すこと

### 自動アップデート

`electron-updater` でGitHub Releasesからの自動更新をサポート。`npm run release` でgitタグをpushするとGitHubリリースワークフローがトリガーされる。
