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

## Claude Code（クラウド環境）からリリースする場合

クラウド環境のgitプロキシはタグのpushを許可していないため、`npm run release` は
`git push origin v<バージョン>` が **HTTP 403** で失敗する（リトライしても通らない。ローカルにタグだけ残る）。
代わりに以下の手順で、`release.yml` を手動実行（`workflow_dispatch`）して公開する。

1. `package.json` の `version` を上げてコミット（`npm version <x.y.z> --no-git-tag-version` で package-lock.json も更新される）
2. `master` にpush（ブランチのpushは通る。ユーザーの許可を得てから）
3. GitHub MCP の `actions_run_trigger` で `release.yml` を実行する
   - `method: run_workflow` / `ref: master` / `inputs: {"publish": "true"}`
   - `publish` を付けないとビルドのみで公開されない
   - タグ（`v<バージョン>`）は electron-builder がリリース作成時に自動で作るので、手でpushする必要はない
4. `actions_list`（`list_workflow_runs`）で完了を確認する（所要 約2〜3分）

`npm run release` を誤って実行した場合は、残ったローカルタグを `git tag -d v<バージョン>` で消しておく。

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
