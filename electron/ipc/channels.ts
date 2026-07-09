/**
 * IPCチャンネル名の一元定義
 * preload とメインプロセスのハンドラは必ずここから import すること
 */

// ファイル再生モード（サブウィンドウ）
export const FileChannels = {
    openSubWindow: 'open-sub-window',
    closeSubWindow: 'close-window',
    checkFilePath: 'checkFilePath',
    getFiles: 'getFiles',
    storeFiles: 'storeFiles',
    subWindowShow: 'subWindowShow',
} as const

// CGMモード
export const CgmChannels = {
    open: 'openCgm',
    play: 'playCgm',
    close: 'closeCgm',
    getList: 'getCgmList',
    storeList: 'storeCgmList',
    errorOpen: 'errorCgmOpen',
} as const

// Vimeoモード（個別動画）
export const VimeoChannels = {
    open: 'openVimeo',
    play: 'playVimeo',
    close: 'closeVimeo',
    getList: 'getVimeoList',
    storeList: 'storeVimeoList',
} as const

// Vimeoモード（ショーケース）
export const ShowcaseChannels = {
    open: 'openShowcaseVimeo',
    play: 'playShowcaseVimeo',
    close: 'closeShowcaseVimeo',
    getPlayList: 'getShowcasePlayList',
    storePlayList: 'storeShowcasePlayList',
    getShowcase: 'getShowcase',
    storeShowcase: 'storeShowcase',
} as const

// タイムラインモード
export const TimelineChannels = {
    openWindow: 'openTimelineWindow',
    closeWindow: 'closeTimelineWindow',
    continuousPlay: 'timelineContinuousPlay',
    windowShow: 'timelineWindowShow',

    // メイン画面 → プレイヤーウィンドウの操作
    restart: 'timelineRestart',
    rewind: 'timelineRewind',
    play: 'timelinePlay',
    pause: 'timelinePause',
    forward: 'timelineForward',
    toEnd: 'timelineToEnd',
    seek: 'timelineSeek',
    fileMetaChange: 'timelineFileMetaChange',

    // プレイヤーウィンドウ → メインプロセスへの通知
    targetReady: 'targetTimelineReady',
    targetDuration: 'targetTimelineDuration',
    targetPlay: 'targetTimelinePlay',
    targetTimeupdate: 'targetTimelineTimeupdate',
    targetPaused: 'targetTimelinePaused',
    targetEnded: 'targetTimelineEnded',

    // メインプロセス → メイン画面への通知
    ready: 'timelineReady',
    duration: 'timelineDuration',
    timeupdate: 'timelineTimeupdate',
    paused: 'timelinePaused',
    ended: 'timelineEnded',

    getFiles: 'getTimelineFiles',
    storeFiles: 'storeTimelineFiles',
    storeAdditionalFiles: 'storeAdditionalTimelineFiles',
    getHistory: 'getTimelineHistory',
    storeHistory: 'storeTimelineHistory',
} as const

// 変換モード（ピッチ・ラウドネス）
export const ConvertChannels = {
    convertPitch: 'convert-pitch',
    convertProgress: 'convert-progress',
    getLoudness: 'getLoudness',
    normalize: 'normalize-loudness',
    normalizeProgress: 'normalize-progress',
    totalDuration: 'get-totalDuration',
} as const

// 共通
export const CommonChannels = {
    openFolder: 'open-folder',
    getVersion: 'get-version',
    checkUpdate: 'checkUpdate',
} as const
