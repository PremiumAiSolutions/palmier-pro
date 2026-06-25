import type {
  MediaEngine,
  MediaAsset,
  DecodedFrame,
  EngineCapabilities,
  ExportRequest,
  ExportProgress,
} from "./types";

// Bridge exposed by electron/preload.ts on the Windows/desktop build.
interface PalmierBridge {
  isNative: true;
  platform: string;
  probe(path: string): Promise<Omit<MediaAsset, "id" | "kind">>;
  decodeFrame(path: string, timeSeconds: number): Promise<{ pngBase64: string; width: number; height: number } | null>;
  export(request: ExportRequest): Promise<string>;
  onExportProgress(cb: (p: ExportProgress) => void): () => void;
  openFileDialog(): Promise<string | null>;
}

declare global {
  interface Window {
    palmier?: PalmierBridge;
  }
}

// Electron/FFmpeg implementation — used by the Windows desktop build.
// All heavy lifting (probe, decode, encode) runs in the main process over a
// bundled FFmpeg binary; this class is a thin renderer-side proxy over IPC.
export class NativeEngine implements MediaEngine {
  readonly capabilities: EngineCapabilities = {
    native: true,
    decode: ["h264", "h265", "prores", "vp9", "av1"],
    encode: ["h264", "h265", "prores"],
    canExport: true,
  };

  private get bridge(): PalmierBridge {
    if (!window.palmier) throw new Error("Native bridge unavailable — not running in Electron.");
    return window.palmier;
  }

  async importMedia(file: File | string): Promise<MediaAsset> {
    const path = typeof file === "string" ? file : (file as any).path;
    const probed = await this.bridge.probe(path);
    return {
      id: crypto.randomUUID(),
      kind: "video",
      ...probed,
    };
  }

  async decodeFrameAt(asset: MediaAsset, timeSeconds: number): Promise<DecodedFrame | null> {
    const r = await this.bridge.decodeFrame(asset.src, timeSeconds);
    if (!r) return null;
    const img = new Image();
    img.src = `data:image/png;base64,${r.pngBase64}`;
    await img.decode();
    return {
      image: img,
      timestampSeconds: timeSeconds,
      width: r.width,
      height: r.height,
      release: () => {},
    };
  }

  async export(request: ExportRequest, onProgress: (p: ExportProgress) => void): Promise<string> {
    const off = this.bridge.onExportProgress(onProgress);
    try {
      return await this.bridge.export(request);
    } finally {
      off();
    }
  }
}
