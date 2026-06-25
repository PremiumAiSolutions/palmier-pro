// Shared media types. Platform-neutral — no DOM or Node assumptions here.

export type ClipKind = "video" | "audio" | "image" | "text" | "lottie";

export interface MediaAsset {
  id: string;
  name: string;
  kind: ClipKind;
  /** Source path (native) or object URL (web). */
  src: string;
  durationSeconds: number;
  width: number;
  height: number;
  frameRate: number;
  hasAudio: boolean;
}

export interface Clip {
  id: string;
  assetId: string;
  name: string;
  kind: ClipKind;
  /** Position on the timeline, in seconds. */
  start: number;
  /** Length on the timeline, in seconds. */
  duration: number;
  /** In-point within the source asset, in seconds. */
  sourceStart: number;
  track: number;
}

/** A decoded frame ready to be uploaded as a GPU texture. */
export interface DecodedFrame {
  /** Anything WebGL/WebGPU can sample: VideoFrame, ImageBitmap, canvas, etc. */
  image: CanvasImageSource;
  timestampSeconds: number;
  width: number;
  height: number;
  /** Call when the frame's backing resource can be released (e.g. VideoFrame.close). */
  release(): void;
}

export interface EngineCapabilities {
  /** True for the Electron/FFmpeg build, false in the browser. */
  native: boolean;
  /** Codecs the engine can decode (best-effort advertisement). */
  decode: string[];
  /** Codecs the engine can encode/export. */
  encode: string[];
  /** Whether real file export is wired up on this platform. */
  canExport: boolean;
}

export interface ExportRequest {
  clips: Clip[];
  assets: Record<string, MediaAsset>;
  width: number;
  height: number;
  frameRate: number;
  outputPath?: string;
}

export interface ExportProgress {
  fraction: number;
  message: string;
}

/**
 * The seam between the editor and the platform. The browser build binds this to
 * WebCodecsEngine; the Windows/Electron build binds it to NativeEngine (FFmpeg).
 * Everything above this interface is shared, portable code.
 */
export interface MediaEngine {
  readonly capabilities: EngineCapabilities;
  /** Probe a user-provided file into a MediaAsset (dimensions, duration, fps). */
  importMedia(file: File | string): Promise<MediaAsset>;
  /** Decode the frame at `timeSeconds` from an asset. */
  decodeFrameAt(asset: MediaAsset, timeSeconds: number): Promise<DecodedFrame | null>;
  /** Render the timeline to a file. Native only for now; web falls back to MediaRecorder later. */
  export(request: ExportRequest, onProgress: (p: ExportProgress) => void): Promise<string>;
}
