import fs from 'fs';
import {ipcMain, screen, shell} from 'electron';
import {createSubWindow, getSubWindow, loadSubWindow} from '../windows/subWindow.js';
import {channels} from "../utils/channels";

import path from "path";
import {execFile, spawn} from 'child_process'

const ffmpegPath = require('ffmpeg-static')
const ffprobePath = require('ffprobe-static')

export const registerMainHandlers = () => {
    ipcMain.handle(channels.openSubWindow, async (_event, fileMeta) => {
        const currentWindow = getSubWindow();
        const subWindow = createSubWindow();

        if (!fs.existsSync(fileMeta.path)) return false;

        const displays = screen.getAllDisplays();
        for (const display of displays) {
            if (display.bounds.x === 0 && display.bounds.y === 0) continue;
            loadSubWindow(subWindow, fileMeta);
            currentWindow.destroy()
            break;
        }
        return true;
    });

    ipcMain.handle('close-window', () => {
        getSubWindow()?.destroy();
    });

    ipcMain.handle('checkFilePath', async (_event, file) => {
        return {
            ...file,
            exists: file.path === "" ? true : fs.existsSync(file.path)
        }
    });

    ipcMain.handle('checkFilePaths', async (_event, files) => {
        return files.map(file => ({
            ...file,
            exists: file.path === "" ? true : fs.existsSync(file.path)
        }));
    });


    // フォルダを開く処理
    ipcMain.on("open-folder", (event, folderPath) => {
        // フォルダをエクスプローラーで開く
        shell.openPath(folderPath);
    });

    ipcMain.handle("convertPitch", async (event, filePath, semitones) => {
        const totalDuration = await getDuration(filePath); // 全体秒数
        event.sender.send("convert-totalDuration", {totalDuration});

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
                    event.sender.send("convert-progress", {
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
};
