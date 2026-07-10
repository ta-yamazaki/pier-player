# リファクタリングポイント一覧

コードベース全体（`app/` + `electron/`、約4,400行）を調査した結果。
優先度別に「高（バグ・セキュリティ）」「中（重複排除・設計）」「低（掃除・整備）」に分類。

## 対応状況（2026-07-09 実施）

「推奨する着手順」に沿って以下を実装済み:

- **実施済み**: #1〜#8（バグ・セキュリティ・設定）、#9〜#12・#14（共通化・重複削除）、#17・#18（IPC定数化・型付け）、#22（ビルド設定一本化）、#24〜#27（掃除・通知統一）、#31（vitest導入・lint修復・test/lintスクリプト追加）
- **未実施**: #32（Electron/Nuxtのメジャーアップグレード）— マルチウィンドウ再生・ffmpeg・インストーラー生成の実機検証とセットで行うべきため見送り。#2 の webPreferences 見直しは実施済みなので、アップグレード時の負担は軽減されている
- **未実施（着手順対象外）**: #13（ウィンドウファクトリ統合）、#15・#16（increase/decrease・ffmpeg実行の汎用化）、#19〜#21、#23、#28〜#30

補足: #31 の過程で、`@nuxt/eslint` モジュールが Nuxt 3.6.5 では設定ファイルを生成しない問題が見つかったため、`@nuxt/eslint-config` を直接使うスタンドアロン構成に切り替えて lint を復旧した。`no-explicit-any` は warn 扱い（80件）で段階的に解消する。

---

## 優先度: 高 — バグ・セキュリティ

### 1. IPCリスナーの多重登録（メモリリーク & 動作不良の温床）
preload で公開している `ipcRenderer.on` 系 API に解除手段がなく、コンポーネントの mount ごとにリスナーが蓄積される。

- `app/components/timeline/TimelinePlayer.vue:175` — `playerHooks()` が mount ごとに6つのリスナーを登録。再生のたびに TimelinePlayer が再マウントされるため、リスナーが無限に増える
- `app/pages/cgm.vue:42` と `app/components/cgm/CgmList.vue:67` — **両方**が `errorCgmOpen` を登録しており、エラー時に alert が複数回出る
- `app/components/timeline/TimelineFile.vue:365` — `onNormalizeProgress` が `normalize()` を呼ぶたびに登録される

**対応**: preload 側で `ipcRenderer.removeListener` を返す形にし（`const off = api.on(...)` パターン）、`onUnmounted` で解除する。

### 2. レンダラーの webPreferences が危険な設定
すべてのウィンドウで `nodeIntegration: true` + `webSecurity: false`（`electron/windows/*.js`）。
特に Vimeo ウィンドウ（`vimeoWindow.js:16-21`）と CGM ウィンドウは **外部サイトの URL を直接ロード**するため、リモートコンテンツに Node 権限が渡るリスクがある。

**対応**: preload + contextBridge 経由で通信している現構成なら `nodeIntegration: false` にできるはず。`webSecurity: false` はローカルファイル再生のために必要なウィンドウ（sub/timeline）だけに限定し、外部URLをロードするウィンドウでは有効に戻す。

### 3. `spawn(..., {shell: true})` によるコマンドインジェクション・パス問題
`electron/ipc/convertHandlers.js:46, 94, 148` — ffmpeg を `shell: true` で起動している。ファイルパスはユーザーのドロップしたファイル名がそのまま入るため、スペースや `&` などを含むファイル名で壊れる／任意コマンド実行につながる。`getLoudness`（82行目）だけ手動で `"` を付けているのも場当たり的。

**対応**: `shell: true` を外す（引数配列で渡せばエスケープ不要）。

### 4. 存在しない preload ファイルを指定
- `electron/windows/cgmWindow.js:20` → `cgmReceiver.js`
- `electron/windows/vimeoWindow.js:20` → `vimeoReceiver.js`

どちらも `electron/preload/` に存在せず、`nuxt.config.ts` の `electron.build` にもエントリがない。ロードは静かに失敗している。

**対応**: 不要なら preload 指定を削除。必要なら実ファイルを作成してビルドエントリに追加。

### 5. タイムライン履歴の検索時にチェックボックスが別ファイルに付くバグ
`app/components/timeline/TimelineHistoryList.vue` — テンプレートは `filteredFiles` を `v-for` しているのに、`toggle(i)` / `isSelected(i)`（82, 89行目）は `files.value[i]` を参照。検索で絞り込むとインデックスがずれ、**意図しないファイルが選択される**。
また `filteredFiles`（71-75行目）の `if (!searchText) return files` は、ref オブジェクト自体の真偽判定のため常に false であり、`files`（ref そのもの）を返しているのも誤り。

**対応**: `v-for` の `file` をそのまま `toggle(file)` に渡す。computed は `files.value.filter(...)` に統一。

### 6. サブウィンドウ起動処理の順序不正
`electron/ipc/mainHandlers.js:6-20` — `open-sub-window` で、ファイル存在チェックの**前に** `createSubWindow()` で新ウィンドウを生成している。ファイルが無い場合 false を返すが、生成済みウィンドウが破棄されず残る。また旧ウィンドウの `destroy()` がセカンダリディスプレイ検出ループ内にあるため、モニターが1台のときは何も表示されないのに `true` が返る。

**対応**: 存在チェック → セカンダリディスプレイ確認 → ウィンドウ差し替え、の順に整理し、失敗パスでウィンドウを破棄する。

### 7. `openVimeo` が Promise を返さず、ローディング表示が機能していない
`electron/ipc/vimeoHandlers.js:9-20` — `loadURL(...).then(...)` を `return` していないため、レンダラー側の `await vimeoApi.openVimeo(...)`（`Vimeo.vue:117`）は即座に解決し、`isLoading` がすぐ消える。CGM 側（`cgmHandlers.js`）は `await` しており、実装が非対称。

**対応**: handler で Promise を返し、成功/失敗をレンダラーに返す（`errorVimeoOpen` イベント方式との二重化も解消できる）。

### 8. `isExists` の `v !== {}` は常に true
`app/components/vimeo/Vimeo.vue:133` ほか計5箇所 — オブジェクトリテラルとの `!==` 比較は必ず true なので意味がない。

**対応**: 共通ユーティリティ化（下記 #12）と同時に `v != null && v !== ""` に修正。

---

## 優先度: 中 — 重複コードの排除・設計改善

### 9. ドラッグ&ドロップ並べ替えロジックが5コンポーネントに重複
`dragStart` / `dragEnter` / `dragEnd` + `dragIndex` がほぼ同一実装で存在:
- `app/components/file/MediaFileList.vue:105-112`
- `app/components/cgm/CgmList.vue:120-127`
- `app/components/vimeo/VimeoList.vue:115-128`
- `app/components/vimeo/showcase/ShowcaseVimeoList.vue:115-128`
- `app/components/timeline/TimelineFileList.vue:108-123`

**対応**: `composables/useDragSort.ts` に抽出（`const {dragIndex, dragStart, dragEnter, dragEnd} = useDragSort(list)`）。

### 10. 「ストアから読込 → deep watch で保存」パターンが5箇所に重複
`onMounted` で `getXxx()` → `watch(list, storeXxx, {deep: true})` の組み合わせが上記5リストすべてにある。

**対応**: `composables/useStoredList.ts`（getter/setter を受け取る）に共通化。

### 11. ファイル存在チェックのロジックが4箇所に重複
`{...file, exists: file.path === "" ? true : fs.existsSync(file.path)}` が
`electron/ipc/mainHandlers.js:26-38`、`electron/ipc/timelineHandlers.js:29-41`、`electron/ipc/storeHandlers.js:23-29, 74-80` に同一実装。`checkFilePath` / `checkTimelineFilePath` はハンドラごと重複している。

**対応**: `electron/utils/fileCheck.js` に関数を1つ作り、チャンネルも統合（タイムライン用を別チャンネルにする理由がない）。

### 12. `isVideo` / `isAudio` / `isExists` などの小物ユーティリティが散在
- `/video\/.*/` の正規表現判定: `TimelineFile.vue`, `MediaFile.vue`, `FileDropInput.vue`, `pitch.vue`, `subWindow.js`, `timelineWindow.js`, `player.html` ×2 の計8箇所
- `isExists`: `Vimeo.vue`, `VimeoList.vue`, `CgmList.vue`, `cgm.vue`, `ShowcaseVimeoList.vue`, `ShowcaseSetting.vue` の6箇所
- 時間の `mm:ss` フォーマット: `TimelinePlayer.vue:116`（`app/assets/js/time.js` にも類似コードが放置）

**対応**: `app/utils/` に `mediaType.ts`, `format.ts` を作成して集約（Nuxt の auto-import が効く）。

### 13. ウィンドウファクトリ4種がほぼコピペ
`subWindow.js` / `timelineWindow.js` / `cgmWindow.js` / `vimeoWindow.js` は BrowserWindow オプションとセカンダリディスプレイ選択ループ（`display.bounds.x === 0 && ...` で除外して `setBounds` + `setFullScreen`）が同一。このループは `mainHandlers.js:12-18` にもあり、計5箇所。
さらに `loadSubWindow` と `loadTimelineWindow` もほぼ同一。

**対応**:
- `getSecondaryDisplay()` ユーティリティを作る
- `createPlayerWindow({preload, insertCSS})` のようなパラメータ化ファクトリに統合

### 14. `generatePlayerUrl` と未使用メソッド群の重複
`Vimeo.vue:136-146` と `VimeoList.vue:133-143` に同一の URL 変換ロジック。VimeoList 側の `view` / `play` / `close`（70-88行目）/ `generatePlayerUrl` / `isExists` は子コンポーネント移行後の残骸で**未使用**。`MediaFileList.vue:83` の `close` も未使用。

**対応**: 未使用分を削除し、URL 変換は utils へ。

### 15. TimelineFile の increase/decrease ×8関数
`app/components/timeline/TimelineFile.vue:244-283` — トリム/フェードの前後×増減で8つのほぼ同一関数。

**対応**: 汎用の `adjust(key: 'startTrimSec' | ..., delta)` 1関数にまとめる（テンプレート側は `@click="adjust('startTrimSec', +trimStep)"`）。

### 16. ffmpeg 実行・進捗パースの重複
`convertHandlers.js` — `out_time_ms` のパース処理が `convert-pitch`（49-62行目）と `normalize-loudness`（150-161行目）で重複。spawn → error/close のハンドリングも3ハンドラで同型。

**対応**: `runFfmpeg(args, {onProgress})` ヘルパーに集約。`getDuration` も normalize 側で再利用できる。

### 17. IPCチャンネル名の二重管理と命名の不統一
チャンネル名文字列が preload（`preload.ts`）とハンドラ（`ipc/*.js`）に別々にハードコードされている。命名も `open-sub-window`（kebab）、`openCgm`（camel）、`checkFilePath` / `checkTimelineFilePath`（接尾辞違い）、`get-version` と混在。

**対応**: `electron/ipc/channels.ts` に定数として一元定義し、両側から import。命名規則を統一。

### 18. `any` 多用・ドメイン型の欠如
`file: any`, `vimeo: any`, `cgm: any` が全コンポーネントの props に及ぶ。`FileMeta`（path/name/type/exists/startTrimSec/...）などの中心データ構造に型がない。`electron-env.ts` の `Window` 型も `ipcRenderer` しか宣言しておらず、実際に expose している `window.api` / `window.timeline` 等は全部型なし（`window.cgm` のような打ち間違いに気づけない）。

**対応**: `types/` に共有型（`FileMeta`, `VimeoItem`, `CgmItem`, `ShowcaseItem`）を定義し、preload の API 型から `declare global { interface Window {...} }` を生成する。

### 19. props の直接ミューテーション
`MediaFile.vue:56`、`Vimeo.vue:89`、`Cgm.vue:67`、`TimelineFile.vue:197` — `const file = ref(props.file)` で親のオブジェクトをエイリアスして子から直接書き換えている。親の deep watch が拾うので動作するが、Vue の一方向データフローに反しデータの流れが追いにくい。

**対応**: 状態管理を Pinia ストア（またはリスト側での一元管理 + emit）に寄せる。上記 #10 と合わせて整理すると効果的。

### 20. `v-for` の `:key` にオブジェクトを使用
`MediaFileList.vue:5`、`VimeoList.vue:6`、`CgmList.vue:10`、`ShowcaseVimeoList.vue:21`、`TimelineFileList.vue:7`、`TimelineHistoryList.vue:33` — `:key="file"` はオブジェクトの文字列化（`[object Object]`）となり全行同一キーになる。並べ替え・削除時の再描画不整合の原因。

**対応**: 各アイテムに追加時に一意な `id` を持たせて `:key="file.id"` に。

### 21. `getFiles` が任意の store キーをレンダラーから受け取る
`electron/ipc/storeHandlers.js:23` — `store.get(target, [])` にレンダラー由来の文字列をそのまま渡す。他モードのキー（`cgmList` 等）も読めてしまい、`keys` 定数マップに `sunday`/`wednesday`/`other` が登録されていないため一覧性もない。

**対応**: 許可キーのホワイトリスト検証を入れ、`keys` に登録。

### 22. ビルド設定の二重管理（矛盾あり）
`package.json` の `build` キーと `electron-builder.json5` が併存し、内容が食い違う:
- package.json: `asarUnpack`（ffmpeg用・**重要**）、`publish`、`icon`、output は `release`
- json5: `asar: false`（asarUnpack と矛盾）、mac 設定、output は `release/${version}`

electron-builder は config ファイルがあると package.json 側の一部が効かなくなるため、どちらが実際に有効か分かりにくい。

**対応**: `electron-builder.json5` に一本化し、package.json の `build` キーを削除。`asar` 方針を明示的に決める。

### 23. CLAUDE.md / ドキュメントと実装の乖離
CLAUDE.md には `window.cgmApi` / `window.vimeoApi` / `window.timelineApi` と記載されているが、実際の expose 名は `window.cgm` / `window.vimeo` / `window.timeline`（`preload.ts:55, 71, 127`）。変数名（`cgmApi`）と expose 名（`'cgm'`）のずれが原因。

**対応**: expose 名を `xxxApi` に統一（利用側6ファイル程度の置換）し、ドキュメントと一致させる。

---

## 優先度: 低 — デッドコード・掃除・整備

### 24. 未使用アセット・未使用エクスポート
- `app/assets/js/jquery.js`（大容量）と `app/assets/js/time.js` — どこからも import されていない
- `hideSubWindow`（`subWindow.js:58`）/ `hideTimelineWindow`（`timelineWindow.js:60`）— 未使用
- `subWindowHide` / `timelineWindowHide` リスナー — 受け側の処理がコメントアウト済みで送信側も未使用

### 25. コメントアウトされたコードの残骸
- `preload.ts:2-24` — 旧 ipcRenderer expose の雛形 23行
- `TimelineFile.vue:120-143` — ラウドネス/ノーマライズUI 24行（`loudness` 系の state・`getLoudness`・`normalize` 関数もUIから到達不能のまま残存）。機能を戻す予定がないなら関数ごと削除、あるなら feature flag 化
- `app/public/sub/player.html` / `timeline/player.html` — 未使用の video タグ雛形、`subWindowHide` 処理
- `windows/*.js` — `// if (devToolsEnabled)` などの残骸

### 26. 空のライフサイクル・プレースホルダコメント
`onMounted(async () => {})` だけのブロックや `/** watch */`（中身なし）が `index.vue`, `Vimeo.vue`, `Cgm.vue`, `showcase.vue`, `FileDropInput.vue`, `TimelineWaveform.vue` など多数。削除して見通しを良くする。

### 27. `alert()` / `confirm()` と Notification の混在
エラー通知が `alert()`（`TimelineFile.vue`, `TimelineFileList.vue`, `MediaFile.vue`, `cgm.vue`, `ShowcaseSetting.vue`, `TimelineHistoryList.vue` など約10箇所）と `useNotification`（`pitch.vue` のみ）で不統一。alert はメインウィンドウの操作をブロックする。

**対応**: `useNotification` + `Notification.vue` に統一。

### 28. `pages/index.vue` の細かい問題
- `previewFile` 初期値が `{src: "", type: ""}` だが使用プロパティは `.path` / `.name`（47行目 vs 77-80行目）
- `selectSundayTab` ほかタブ切替3関数は `selectedTab.value = 'sunday'` のインライン化で十分
- `MediaFileList.vue:56-60` の「ref をオブジェクトに詰める」パターンは、タブ→リストの `Map` か単一 `reactive` に簡素化できる

### 29. `main.ts` と `mainWindow.js` で `process.env.APP_ROOT` を二重設定
`electron/main.ts:18` と `electron/windows/mainWindow.js:5` の両方で設定しており、`__dirname` 基準が異なるファイルにあるため片方が誤値になり得る。1箇所（main.ts）に集約。

### 30. `normalize-loudness` が元ファイルを無警告で上書き
`convertHandlers.js:171` — `fs.renameSync(outputPath, filePath)` で元ファイルを破壊的に置換する（現在UIからは呼ばれないが、復活させる場合は要注意）。`convert-pitch` のように別名保存にするのが安全。

### 31. テスト・型チェックの仕組みがない
- テストフレームワーク不在。上記 #12, #15, #16 でロジックを純関数として抽出すれば、`increase`/`decrease`、`generatePlayerUrl`、ffmpeg 出力パース、ショーケースURL検証あたりは vitest で容易にテスト可能
- `package.json` に `lint` / `typecheck`（`vue-tsc --noEmit`）スクリプトがなく、CI もない

### 32. 依存関係の古さ
- `nuxt: 3.6.5`（完全固定・2023年版）、`electron: ^29`（EOL済み・セキュリティ更新が来ない）
- Electron のメジャーアップは webPreferences 見直し（#2）とセットで計画するとよい

---

## 推奨する着手順

1. **#1, #5, #6, #7** — ユーザーに見えるバグの修正（小さく独立して直せる）
2. **#3, #2** — セキュリティ（shell:true 除去は低リスクで即効）
3. **#22, #4** — ビルド/設定の整合性（リリース事故防止）
4. **#12, #9, #10, #11** — ユーティリティ・composable 抽出(コード量が目に見えて減る)
5. **#17, #18** — IPC定数化と型付け（以降の変更全部が安全になる）
6. **#24〜#27** — 掃除
7. **#31, #32** — テスト整備とアップグレード
