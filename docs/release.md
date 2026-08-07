# リリース手順

## 概要

GitHub Releases を利用した自動配布。gitタグをpushするとGitHub Actionsがトリガーされ、インストーラーが自動ビルド・公開される。

## 通常リリース

### 1. バージョン番号を更新

`package.json` の `version` を更新する。

```json
{
  "version": "3.1.10"
}
```

バージョニングは `メジャー.マイナー.パッチ` 形式（例: `3.1.10`）。

### 2. 変更をコミット

```bash
git add package.json
git commit -m "3.1.10"
git push origin <ブランチ名>
```

### 3. タグをpushしてリリースを作成

```bash
npm run release
```

内部では以下を実行:

```
git tag v3.1.10
git push origin v3.1.10
```

タグのpushがGitHub Releasesのワークフローをトリガーし、インストーラー（`.exe`）が自動生成・公開される。

## タグの打ち直し（リリースやり直し）

同バージョンのタグが既に存在する場合に使用する。

```bash
node release-force.js
```

内部では以下を実行:

```
git tag -d v<バージョン>           # ローカルタグ削除
git push origin --delete v<バージョン>  # リモートタグ削除
git tag v<バージョン>              # 再作成
git push origin v<バージョン>      # push
```

## ローカルでビルドを確認する場合

GitHub Actionsに頼らず、ローカルでインストーラーを生成して確認したい場合:

```bash
npm run build
```

ビルド成果物は `release/<バージョン>/PierPlayer_<バージョン>.exe` に出力される。

ビルドの流れ:

1. `nuxi generate` — Nuxtアプリを `.output/` に静的生成
2. `electron-builder --win --x64` — `.output/` と `dist-electron/` をまとめてNSISインストーラーを生成

## 自動アップデートの仕組み

アプリ起動時に `electron-updater` がGitHub Releasesの最新バージョンを確認し、新しいバージョンがあればユーザーに通知してインストールを促す。

GitHubリポジトリ: [ta-yamazaki/pier-player](https://github.com/ta-yamazaki/pier-player)
