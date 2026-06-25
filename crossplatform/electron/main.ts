import { app, BrowserWindow, ipcMain, dialog } from "electron";
import { spawn } from "node:child_process";
import { join } from "node:path";

// __dirname is a native global in the CommonJS bundle (dist-electron/main.cjs).

// FFmpeg location. Dev: rely on PATH or FFMPEG_PATH. Packaged: bundle ffmpeg.exe
// via electron-builder extraResources and point here. See README "Bundling FFmpeg".
const FFMPEG = process.env.FFMPEG_PATH
  ?? (app.isPackaged ? join(process.resourcesPath, "ffmpeg", "ffmpeg.exe") : "ffmpeg");

function run(args: string[], onStderr?: (s: string) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const ps = spawn(FFMPEG, args);
    const out: Buffer[] = [];
    ps.stdout.on("data", (d) => out.push(d));
    if (onStderr) ps.stderr.on("data", (d) => onStderr(d.toString()));
    ps.on("error", reject);
    ps.on("close", (code) =>
      code === 0 ? resolve(Buffer.concat(out)) : reject(new Error(`ffmpeg exited ${code}`))
    );
  });
}

// Probe duration + dimensions by parsing ffmpeg's stderr banner.
async function probe(path: string) {
  let log = "";
  await run(["-i", path], (s) => (log += s)).catch(() => {});
  const dur = /Duration: (\d+):(\d+):(\d+\.\d+)/.exec(log);
  const dim = /, (\d{2,5})x(\d{2,5})/.exec(log);
  const fps = /(\d+(?:\.\d+)?) fps/.exec(log);
  const seconds = dur ? +dur[1] * 3600 + +dur[2] * 60 + +dur[3] : 0;
  return {
    name: path.split(/[\\/]/).pop() ?? "clip",
    src: path,
    durationSeconds: seconds,
    width: dim ? +dim[1] : 1920,
    height: dim ? +dim[2] : 1080,
    frameRate: fps ? +fps[1] : 30,
    hasAudio: /Audio:/.test(log),
  };
}

async function decodeFrame(path: string, t: number) {
  const png = await run(["-ss", String(t), "-i", path, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "pipe:1"]);
  return png.length ? { pngBase64: png.toString("base64"), width: 0, height: 0 } : null;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 960,
    minHeight: 600,
    backgroundColor: "#0a0a0a",
    title: "PalmierPro",
    webPreferences: {
      preload: join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) win.loadURL(devUrl);
  else win.loadFile(join(__dirname, "../dist/index.html"));
}

ipcMain.handle("media:probe", (_e, path: string) => probe(path));
ipcMain.handle("media:decodeFrame", (_e, path: string, t: number) => decodeFrame(path, t));
ipcMain.handle("dialog:openFile", async () => {
  const r = await dialog.showOpenDialog({
    properties: ["openFile"],
    filters: [{ name: "Video", extensions: ["mp4", "mov", "mkv", "webm", "m4v"] }],
  });
  return r.canceled ? null : r.filePaths[0];
});
ipcMain.handle("media:export", async (e, request: { width: number; height: number; frameRate: number; clips: unknown[] }) => {
  // Placeholder: real timeline export builds an ffmpeg filtergraph from clips.
  e.sender.send("export:progress", { fraction: 0, message: "Export filtergraph not yet implemented." });
  throw new Error("Export pipeline is scaffolded but not implemented yet.");
});

app.whenReady().then(createWindow);
app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
app.on("activate", () => BrowserWindow.getAllWindows().length === 0 && createWindow());
