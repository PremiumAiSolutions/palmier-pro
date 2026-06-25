import type { MediaEngine } from "./types";
import { WebCodecsEngine } from "./WebCodecsEngine";
import { NativeEngine } from "./NativeEngine";

let engine: MediaEngine | null = null;

// Picks the platform implementation once: FFmpeg on the Windows/Electron build,
// WebCodecs in the browser. The rest of the app only ever touches MediaEngine.
export function getEngine(): MediaEngine {
  if (engine) return engine;
  engine = typeof window !== "undefined" && window.palmier?.isNative
    ? new NativeEngine()
    : new WebCodecsEngine();
  return engine;
}

export * from "./types";
