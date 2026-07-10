import path from "path";
import {ipcMain} from 'electron';
import {execFile, spawn} from "child_process";
import {ConvertChannels} from "./channels";
const ffprobePath = require('ffprobe-static');
const ffmpegPath = require('ffmpeg-static');

// ffprobeでメディアの長さ（秒）を取得する
function getDuration(filePath) {
    return new Promise((resolve, reject) => {
        execFile(ffprobePath.path, [
            "-v", "error",
            "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1",
            filePath
        ], (err, stdout) => {
            if (err) return reject(err);
            resolve(parseFloat(stdout.trim())); // 秒数
        });
    });
}

/**
 * ffmpegを実行する共通ヘルパー
 * @param {string[]} args ffmpegの引数（進捗が必要なら "-progress", "pipe:1" を含めること）
 * @param {object} [callbacks]
 * @param {(seconds: number) => void} [callbacks.onProgress] out_time_ms を秒に変換して通知
 * @param {(text: string) => void} [callbacks.onStderr] stderr出力の通知
 */
function runFfmpeg(args, {onProgress, onStderr} = {}) {
    return new Promise((resolve, reject) => {
        const ff = spawn(ffmpegPath, args);

        ff.stdout.setEncoding("utf8");
        ff.stdout.on("data", (data) => {
            if (!onProgress) return;
            // 複数行まとめて来ることがある
            data.toString().split("\n").forEach(line => {
                if (!line.startsWith("out_time_ms")) return;
                const sec = parseInt(line.split("=")[1].trim()) / 1_000_000;
                if (sec < 0) return;
                onProgress(sec);
            });
        });

        ff.stderr.on("data", (data) => {
            if (onStderr) onStderr(data.toString());
        });

        ff.on("error", reject);
        ff.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`FFmpeg exited with code ${code}`));
        });
    });
}

export const registerConvertHandlers = () => {
    ipcMain.handle(ConvertChannels.convertPitch, async (event, filePath, semitones) => {
        const totalDuration = await getDuration(filePath); // 全体秒数
        event.sender.send(ConvertChannels.totalDuration, {totalDuration});

        const ext = path.extname(filePath);
        const outputFile = filePath.replace(ext, `_key${semitones}${ext}`);

        // ピッチ変更係数（半音変換 → 倍率）
        const pitchFactor = Math.pow(2, semitones / 12);

        const args = [
            '-y', // 既存ファイルを自動上書き
            "-i", filePath,
            "-c:v", "copy",
            "-af", `rubberband=pitch=${pitchFactor}`,
            "-progress", "pipe:1",
            "-nostats",
            outputFile
        ];

        await runFfmpeg(args, {
            onProgress: (sec) => event.sender.send(ConvertChannels.convertProgress, {seconds: sec}),
            onStderr: (text) => console.error("FFmpeg stderr:", text),
        });
        return {outputFile};
    });

    ipcMain.handle(ConvertChannels.getLoudness, async (_event, filePath) => {
        const args = [
            '-hide_banner',
            '-nostats',
            '-i', filePath,
            '-filter_complex', 'ebur128=peak=true',
            '-f', 'null', '-'
        ];

        // ラウドネスはエラー出力のSummaryに出てくる
        let summaryLine = "";
        try {
            await runFfmpeg(args, {
                onStderr: (text) => {
                    if (!text.includes("Summary:")) return;
                    text.split("\n").forEach(line => {
                        if (line.includes("I:")) summaryLine = line;
                    });
                },
            });
        } catch {
            // 値が取れていれば終了コードは問わない
        }

        const match = summaryLine.match(/I:\s*(-?\d+(\.\d+)?)\s*LUFS/i);
        if (!match) throw new Error("ラウドネス値を取得できませんでした");
        return parseFloat(match[1]);
    });

    ipcMain.handle(ConvertChannels.normalize, async (event, originalPath, isVideo, isAudio) => {
        const ext = path.extname(originalPath);
        // 元ファイルは上書きせず別名で保存する（convert-pitchと同様）
        const outputPath = originalPath.replace(ext, `_normalized${ext}`);

        // ffmpeg loudnorm 1パス設定
        const args = [
            "-y", // 上書き
            "-i", originalPath,
            "-af", "loudnorm=I=-15:LRA=7:TP=-1.0:print_format=summary",
            "-b:a", "128k", // ビットレート
            "-progress", "pipe:1",
            outputPath
        ];
        if (isVideo) {
            args.push("-c:a", "aac");
            args.push("-c:v", "copy");
        }
        if (isAudio)
            args.push("-c:a", "libmp3lame"); // MP3 エンコード

        await runFfmpeg(args, {
            onProgress: (sec) => event.sender.send(ConvertChannels.normalizeProgress, {seconds: sec}),
        });

        return {outputFile: outputPath};
    });
};
