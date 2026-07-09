import fs from 'fs';
import path from "path";
import {ipcMain} from 'electron';
import {execFile, spawn} from "child_process";
import {ConvertChannels} from "./channels";
const ffprobePath = require('ffprobe-static');
const ffmpegPath = require('ffmpeg-static');

export const registerConvertHandlers = () => {
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

    ipcMain.handle(ConvertChannels.convertPitch, async (event, originalPath, semitones) => {
        const filePath = originalPath;

        const totalDuration = await getDuration(filePath); // 全体秒数
        event.sender.send(ConvertChannels.totalDuration, {totalDuration});

        return new Promise((resolve, reject) => {
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

            const ff = spawn(ffmpegPath, args);

            ff.stdout.setEncoding("utf8");
            ff.stdout.on("data", (data) => {
                // 複数行まとめて来ることがある
                const lines = data.toString().split("\n");
                lines.forEach(line => {
                    if (!line.startsWith("out_time_ms")) return

                    const ms = parseInt(line.split("=")[1].trim());
                    const sec = ms / 1_000_000;
                    if (sec < 0) return
                    event.sender.send(ConvertChannels.convertProgress, {
                        seconds: sec
                    });
                });
            });

            ff.stderr.on("data", (data) => {
                console.error("FFmpeg stderr:", data.toString());
            });

            ff.on("error", (err) => {
                reject(err);
            });

            ff.on("close", (code) => {
                if (code === 0) {
                    resolve({outputFile});
                } else {
                    reject(new Error(`FFmpeg exited with code ${code}`));
                }
            });
        });
    });

    ipcMain.handle(ConvertChannels.getLoudness, (_event, originalPath) => {
        const filePath = originalPath;

        const args = [
            '-hide_banner',
            '-nostats',
            '-i', filePath,
            '-filter_complex', 'ebur128=peak=true',
            '-f', 'null', '-'
        ];

        return new Promise((resolve, reject) => {
            const ffmpeg = spawn(ffmpegPath, args);
            // ラウドネスはエラー出力に出てくる
            let stderr = "";

            ffmpeg.stderr.on("data", (data) => {
                const dataText = data.toString()
                if (!dataText.includes("Summary:")) return
                console.log(dataText)

                // 複数行まとめて来ることがある
                const lines = dataText.split("\n");
                lines.forEach(line => {
                    if (!line.includes("I:")) return
                    stderr = line;
                });
            });

            ffmpeg.on("error", (err) => {
                reject(err);
            });

            ffmpeg.on("close", (code) => {
                const match = stderr.match(/I:\s*(-?\d+(\.\d+)?)\s*LUFS/i);
                if (match) {
                    resolve(parseFloat(match[1]));
                } else {
                    reject(new Error("ラウドネス値を取得できませんでした"));
                }
            });
        });
    });

    ipcMain.handle(ConvertChannels.normalize, async (event, originalPath, isVideo, isAudio) => {
        const filePath = `${originalPath}`;
        const ext = path.extname(originalPath);
        const outputPath = filePath.replace(ext, `_temp${ext}`);

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

        return new Promise((resolve, reject) => {
            const ff = spawn(ffmpegPath, args);

            ff.stdout.setEncoding("utf8");
            ff.stdout.on("data", (data) => {
                // 進捗解析例: out_time_ms が含まれる場合に Renderer に送信
                const lines = data.toString().split("\n");
                lines.forEach(line => {
                    if (!line.startsWith("out_time_ms")) return
                    const ms = parseInt(line.split("=")[1].trim());
                    const sec = ms / 1_000_000;
                    event.sender.send(ConvertChannels.normalizeProgress, {seconds: sec});
                });
                console.log("FFmpeg stdout:", data.toString());
            });

            ff.on("error", (err) => reject(err));

            ff.on("close", (code) => {
                if (code !== 0) {
                    reject(new Error(`FFmpeg exited with code ${code}`));
                    return
                }

                fs.renameSync(outputPath, filePath);
                resolve({outputFile: filePath});
            });
        });
    });

};
