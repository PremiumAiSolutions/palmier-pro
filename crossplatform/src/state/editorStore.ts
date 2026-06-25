import { create } from "zustand";
import type { Clip, MediaAsset } from "../engine/types";
import { DEFAULT_ADJUST, type AdjustParams } from "../render/shaders";

interface EditorState {
  assets: Record<string, MediaAsset>;
  clips: Clip[];
  selectedClipId: string | null;
  playhead: number; // seconds
  duration: number; // seconds (timeline length)
  isPlaying: boolean;
  adjust: AdjustParams;

  addAsset: (asset: MediaAsset) => void;
  addClipFromAsset: (assetId: string, track?: number) => void;
  selectClip: (id: string | null) => void;
  setPlayhead: (t: number) => void;
  togglePlay: () => void;
  setPlaying: (v: boolean) => void;
  setAdjust: (patch: Partial<AdjustParams>) => void;
}

const DEMO_DURATION = 30;

export const useEditor = create<EditorState>((set, get) => ({
  assets: {},
  clips: [
    // A seeded demo clip so the timeline/preview have content on first launch.
    {
      id: "demo-1",
      assetId: "demo-asset",
      name: "Test Source",
      kind: "video",
      start: 0,
      duration: DEMO_DURATION,
      sourceStart: 0,
      track: 0,
    },
  ],
  selectedClipId: "demo-1",
  playhead: 0,
  duration: DEMO_DURATION,
  isPlaying: false,
  adjust: { ...DEFAULT_ADJUST },

  addAsset: (asset) => set((s) => ({ assets: { ...s.assets, [asset.id]: asset } })),

  addClipFromAsset: (assetId, track = 0) => {
    const asset = get().assets[assetId];
    if (!asset) return;
    const clips = get().clips;
    const start = clips
      .filter((c) => c.track === track)
      .reduce((end, c) => Math.max(end, c.start + c.duration), 0);
    const clip: Clip = {
      id: crypto.randomUUID(),
      assetId,
      name: asset.name,
      kind: asset.kind,
      start,
      duration: asset.durationSeconds || 5,
      sourceStart: 0,
      track,
    };
    set((s) => ({
      clips: [...s.clips, clip],
      selectedClipId: clip.id,
      duration: Math.max(s.duration, start + clip.duration),
    }));
  },

  selectClip: (id) => set({ selectedClipId: id }),
  setPlayhead: (t) => set((s) => ({ playhead: Math.max(0, Math.min(t, s.duration)) })),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (v) => set({ isPlaying: v }),
  setAdjust: (patch) => set((s) => ({ adjust: { ...s.adjust, ...patch } })),
}));
