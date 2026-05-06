# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Pier Player** (v3.1.9) は Nuxt 3 + Vue 3 + Electron で構築されたデスクトップメディアプレイヤーアプリケーション。複数の再生モード（ファイル、CGM動画、Vimeo、タイムライン）と音声処理機能を持つ。

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

# リリース（gitタグ作成 & pushでGitHub Releasesをトリガー）
npm run release
```

テストフレームワークは存在しない。TypeScript型チェックとESLintのみ。

```bash
# リント
npx eslint .
```

## アーキテクチャ

### ディレクトリ構造

- `app/` — Nuxt フロントエンド（`nuxt.config.ts` の `srcDir`）
  - `pages/` — ファイルベースルーティング（各再生モードに対応）
  - `components/` — ドメイン別コンポーネント（`cgm/`, `vimeo/`, `timeline/`, `file/` など）
  - `composables/` — Vue 3 Composition API フック
  - `assets/css/` — グローバルCSS（Bulma + カスタム）
  - `public/sub/` と `public/timeline/` — サブウィンドウ用HTMLファイル
- `electron/` — Electronメインプロセス
  - `main.ts` — エントリポイント、ウィンドウ初期化とIPCセットアップ
  - `ipc/` — IPCハンドラ（機能別に分割: `mainHandlers.js`, `timelineHandlers.js` など）
  - `preload/` — コンテキストブリッジ経由でAPIをレンダラーに公開
  - `windows/` — ウィンドウ生成ファクトリ
- `dist-electron/` — コンパイル済みElectronファイル（自動生成）
- `.output/` — Nuxtビルド出力（自動生成）

### マルチウィンドウ構成

アプリ起動時に5種類のウィンドウを管理:
1. **メインウィンドウ** — プライマリUIとナビゲーション
2. **サブウィンドウ** — セカンダリモニター再生（ファイルモード）
3. **CGMウィンドウ** — CGM動画再生
4. **Vimeoウィンドウ** — Vimeo動画再生
5. **タイムラインウィンドウ** — 同期マルチ動画再生

### IPC通信パターン

レンダラー（Vue/Nuxt）とメインプロセス（Node.js）間はElectron IPCで通信。`electron/preload/preload.ts` でコンテキストブリッジを通じて以下のAPIをグローバルに公開:

| グローバル | 用途 |
|---|---|
| `window.api` | ファイル再生モード |
| `window.cgmApi` | CGM動画再生 |
| `window.vimeoApi` | Vimeo個別再生 |
| `window.showcaseApi` | Vimeoショーケース |
| `window.timelineApi` | タイムラインプレイヤー |
| `window.convertApi` | 音声変換（ピッチ、ラウドネス） |
| `window.commonApi` | バージョン、アップデート、フォルダ |

### データ永続化

`electron-store` を使用してJSON形式で永続化。`electron/ipc/storeHandlers.js` で一元管理。ファイルリスト、CGMリスト、Vimeoリスト、タイムライン履歴などを保存。

### FFmpeg統合

`ffmpeg-static` と `ffprobe-static` をランタイム依存として同梱。ピッチシフト（rubberband）とラウドネス解析（LUFS）に使用。`electron-builder.json5` でASAR圧縮から除外して展開。

### ビルド設定

- `nuxt.config.ts`: SSR無効、ハッシュルーターモード（Electron互換）、`nuxt-electron` モジュール
- `electron-builder.json5`: Windows x64、NSIS形式インストーラー、`release/${version}/` に出力
- Electron用エントリポイントは `nuxt.config.ts` の `electron.build` で定義

### 自動アップデート

`electron-updater` でGitHub Releasesからの自動更新をサポート。`npm run release` でgitタグをpushするとGitHubリリースワークフローがトリガーされる。
