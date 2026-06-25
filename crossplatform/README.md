# PalmierPro — cross-platform (Windows + Web)

A ground-up rewrite of PalmierPro's editor in web technology, packaged as a
native **Windows desktop app** (Electron + bundled FFmpeg) and deployable as an
**online editor** from a domain (same code, browser WebCodecs instead of FFmpeg).

The native macOS app under `../Sources/PalmierPro` (Swift / SwiftUI / AVFoundation /
Metal) is Apple-only and cannot be ported directly — every layer (UI, video
engine, GPU effects) is a proprietary Apple framework. This project rebuilds
those layers on portable equivalents while keeping the same visual design and,
where possible, the same effect math.

## Status (what runs today)

This is a **foundation / vertical slice**, not feature parity yet. Working now:

- Editor shell matching the app's layout + theme (`AppTheme.swift` → `src/theme.ts`).
- WebGL2 effect pipeline with two Metal kernels ported faithfully:
  `Metal/Vignette.metal` and `Metal/HighlightsShadows.metal` → `src/render/shaders.ts`.
- Live grading: Inspector sliders drive the GPU shader in real time.
- Timeline with tracks, clips, ruler, scrub-to-seek playhead.
- Preview playback loop (play/pause, Space) over a synthetic test source.
- Dual media engine seam: `NativeEngine` (Electron/FFmpeg) vs `WebCodecsEngine` (browser),
  selected automatically at runtime.
- Electron shell configured to package a Windows installer.

Verified headlessly: `tsc` clean, `vite build` clean, and the app rendered in
Chromium (WebGL2 via SwiftShader) with the grade applied — screenshots in the PR.

Not done yet (see Roadmap): real file decode wired to the preview, timeline
export filtergraph, audio, the remaining ~10 effects, and the larger feature
areas (AI agent, generation, search, captions).

## Quick start

```bash
cd crossplatform
npm install

# Web dev server (the "online" build) — open the printed localhost URL
npm run dev

# Production web build → dist/  (this is what you deploy to your domain)
npm run build && npm run preview

# Run as a desktop app (downloads the Electron binary on first run)
npm run electron

# Package a Windows installer → release/PalmierPro-Setup-0.1.0.exe
npm run dist:win
```

> Packaging a Windows `.exe` is best done **on Windows** (or Windows CI). Building
> Windows targets from Linux/macOS needs extra Wine/mono setup that `electron-builder`
> can do but isn't configured here.

## Architecture

```
src/
  theme.ts                 Port of AppTheme.swift (colors, spacing, fonts, radii)
  state/editorStore.ts     App state (zustand): assets, clips, playhead, grade
  engine/                  The portability seam
    types.ts               MediaEngine interface + media types
    NativeEngine.ts        Windows build: FFmpeg over Electron IPC
    WebCodecsEngine.ts     Online build: browser <video>/WebCodecs
    index.ts               getEngine() picks the impl at runtime
  render/
    shaders.ts             GLSL ports of the Metal kernels (the effect chain)
    Renderer.ts            WebGL2 renderer (WebGPU-ready surface)
    TestSource.ts          Synthetic footage until real decode is wired in
  components/              Toolbar, MediaPanel, Preview, Inspector, Timeline
electron/
  main.ts                  Window + FFmpeg (probe/decode/export) in the main process
  preload.ts               Secure window.palmier bridge to the renderer
```

**The key idea is the `MediaEngine` seam.** Everything above it is shared,
portable code. Below it, each platform plugs in its own video backend:

| Capability | Windows desktop (`NativeEngine`) | Online / browser (`WebCodecsEngine`) |
|---|---|---|
| Decode | bundled FFmpeg (h264/h265/ProRes/VP9/AV1) | browser codecs / WebCodecs |
| Export | FFmpeg filtergraph | MediaRecorder / WebCodecs mux (todo) |
| Effects | WebGL2 / WebGPU (same shaders) | WebGL2 / WebGPU (same shaders) |

## How the macOS app maps onto this stack

| macOS (Swift) | Cross-platform replacement | Notes |
|---|---|---|
| SwiftUI + AppKit | React + TypeScript | UI rebuild; layout/theme carried over 1:1 |
| AVFoundation (playback/compose) | FFmpeg (desktop) + WebCodecs (web) | behind `MediaEngine` |
| Core Image + Metal kernels | WebGL2 / WebGPU shaders | 2 of 11 kernels ported so far |
| Convex (convex-swift) | `convex` JS/React SDK | same backend, official web SDK |
| Clerk (clerk-ios) | `@clerk/clerk-react` | same auth, official web SDK |
| Sentry (sentry-cocoa) | `@sentry/react` | drop-in |
| MCP (swift-sdk) | `@modelcontextprotocol/sdk` (TS) | same protocol |
| Lottie (lottie-ios) | `lottie-web` | drop-in |
| HF swift-transformers | `@huggingface/transformers` (transformers.js) | on-device ML in browser/Node |
| Sparkle (updater) | electron-updater | desktop auto-update |

The services/auth/AI layers port relatively cleanly because the vendors ship
first-class web SDKs. The real engineering is the **video engine** and the
**remaining shaders**.

## Bundling FFmpeg (Windows)

`electron/main.ts` resolves FFmpeg from `FFMPEG_PATH`, else
`resources/ffmpeg/ffmpeg.exe` when packaged. To bundle it, drop `ffmpeg.exe` in
`build/ffmpeg/` and add to `package.json` build config:

```json
"extraResources": [{ "from": "build/ffmpeg", "to": "ffmpeg" }]
```

(or depend on `ffmpeg-static`). In dev, just have `ffmpeg` on your PATH.

## Roadmap to parity

1. Wire real decode: `MediaEngine.decodeFrameAt` → preview texture (replace TestSource).
2. Timeline export: build an FFmpeg filtergraph from clips in `media:export`.
3. Port the remaining 9 Metal kernels (Levels, Curves, Wheels, LUT, Glow, Grain, Clarity, ChromaKey, HueCurves).
4. Move the effect chain to WebGPU (WGSL) for performance; keep WebGL2 as fallback.
5. Audio: Web Audio graph + waveforms (replaces DSWaveformImage).
6. Auth + projects: Clerk + Convex web SDKs (reuse the existing backend).
7. Larger feature areas: AI agent, generation, search, captions/transcription.
```
