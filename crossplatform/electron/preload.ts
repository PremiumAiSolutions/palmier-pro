import { contextBridge, ipcRenderer } from "electron";

// Secure bridge: the renderer (React app) only sees this typed surface, never
// Node or ipcRenderer directly. NativeEngine.ts consumes window.palmier.
contextBridge.exposeInMainWorld("palmier", {
  isNative: true,
  platform: process.platform,
  probe: (path: string) => ipcRenderer.invoke("media:probe", path),
  decodeFrame: (path: string, t: number) => ipcRenderer.invoke("media:decodeFrame", path, t),
  export: (request: unknown) => ipcRenderer.invoke("media:export", request),
  openFileDialog: () => ipcRenderer.invoke("dialog:openFile"),
  onExportProgress: (cb: (p: { fraction: number; message: string }) => void) => {
    const listener = (_e: unknown, p: { fraction: number; message: string }) => cb(p);
    ipcRenderer.on("export:progress", listener);
    return () => ipcRenderer.removeListener("export:progress", listener);
  },
});
