import type {
  MediaEngine,
  MediaAsset,
  DecodedFrame,
  EngineCapabilities,
  ExportRequest,
  ExportProgress,
} from "./types";

// Browser implementation — used by the online/web build.
// Probing uses an <video> element; frame decode uses requestVideoFrameCallback.
// (A WebCodecs VideoDecoder demuxer path is the next step for frame-accurate seeking.)
export class WebCodecsEngine implements MediaEngine {
  readonly capabilities: EngineCapabilities = {
    native: false,
    decode: ["h264", "vp8", "vp9", "av1"],
    encode: typeof (globalThis as any).VideoEncoder !== "undefined" ? ["h264"] : [],
    canExport: false,
  };

  async importMedia(file: File | string): Promise<MediaAsset> {
    const src = typeof file === "string" ? file : URL.createObjectURL(file);
    const name = typeof file === "string" ? file.split("/").pop() ?? "clip" : file.name;
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.src = src;

    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error(`Cannot read media: ${name}`));
    });

    return {
      id: crypto.randomUUID(),
      name,
      kind: "video",
      src,
      durationSeconds: video.duration || 0,
      width: video.videoWidth,
      height: video.videoHeight,
      frameRate: 30,
      hasAudio: true,
    };
  }

  async decodeFrameAt(asset: MediaAsset, timeSeconds: number): Promise<DecodedFrame | null> {
    const video = document.createElement("video");
    video.src = asset.src;
    video.muted = true;
    await new Promise<void>((r) => (video.onloadeddata = () => r()));
    video.currentTime = Math.min(timeSeconds, asset.durationSeconds);
    await new Promise<void>((r) => (video.onseeked = () => r()));
    const bitmap = await createImageBitmap(video);
    return {
      image: bitmap,
      timestampSeconds: timeSeconds,
      width: bitmap.width,
      height: bitmap.height,
      release: () => bitmap.close(),
    };
  }

  async export(_request: ExportRequest, onProgress: (p: ExportProgress) => void): Promise<string> {
    onProgress({ fraction: 0, message: "Export in the browser build is not wired up yet." });
    throw new Error(
      "Web export pending (MediaRecorder/WebCodecs muxing). Use the Windows build for export today."
    );
  }
}
