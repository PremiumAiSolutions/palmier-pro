import { useRef } from "react";
import { AppTheme as T, fontStack, monoFontStack } from "../theme";
import { useEditor } from "../state/editorStore";
import { getEngine } from "../engine";

function formatTimecode(t: number): string {
  const fps = 30;
  const total = Math.max(0, Math.floor(t * fps));
  const f = total % fps;
  const s = Math.floor(total / fps) % 60;
  const m = Math.floor(total / (fps * 60)) % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(m)}:${pad(s)}:${pad(f)}`;
}

export function Toolbar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const isPlaying = useEditor((s) => s.isPlaying);
  const togglePlay = useEditor((s) => s.togglePlay);
  const playhead = useEditor((s) => s.playhead);
  const addAsset = useEditor((s) => s.addAsset);
  const addClip = useEditor((s) => s.addClipFromAsset);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const asset = await getEngine().importMedia(file);
      addAsset(asset);
      addClip(asset.id);
    } catch (err) {
      alert(String(err));
    }
  }

  const engine = getEngine();

  return (
    <div
      style={{
        height: 48,
        display: "flex",
        alignItems: "center",
        padding: `0 ${T.Spacing.lgXl}px`,
        background: T.Background.raised,
        borderBottom: `${T.BorderWidth.thin}px solid ${T.Border.primary}`,
        gap: T.Spacing.lgXl,
        flex: "0 0 auto",
        userSelect: "none",
      }}
    >
      <div
        style={{
          fontFamily: fontStack,
          fontSize: T.FontSize.mdLg,
          fontWeight: T.FontWeight.semibold,
          color: T.Accent.primary,
          letterSpacing: 0.3,
        }}
      >
        PalmierPro
        <span style={{ color: T.Text.muted, fontWeight: T.FontWeight.regular, marginLeft: T.Spacing.smMd }}>
          {engine.capabilities.native ? "Windows" : "Web"}
        </span>
      </div>

      <div style={{ flex: 1 }} />

      <button onClick={togglePlay} style={transportBtn} title="Play / Pause (Space)">
        {isPlaying ? "❚❚" : "▶"}
      </button>
      <div
        style={{
          fontFamily: monoFontStack,
          fontSize: T.FontSize.md,
          color: T.Accent.timecode,
          minWidth: 92,
          textAlign: "center",
        }}
      >
        {formatTimecode(playhead)}
      </div>

      <div style={{ flex: 1 }} />

      <input ref={fileRef} type="file" accept="video/*" hidden onChange={onFile} />
      <button onClick={() => fileRef.current?.click()} style={ghostBtn}>
        Import
      </button>
      <button
        onClick={() => alert(engine.capabilities.canExport ? "Export runs via bundled FFmpeg in the Windows build." : "Export is available in the Windows build.")}
        style={primaryBtn}
      >
        Export
      </button>
    </div>
  );
}

const baseBtn: React.CSSProperties = {
  fontFamily: fontStack,
  fontSize: T.FontSize.smMd,
  fontWeight: T.FontWeight.medium,
  border: `${T.BorderWidth.thin}px solid ${T.Border.subtle}`,
  borderRadius: T.Radius.sm,
  padding: `${T.Spacing.sm}px ${T.Spacing.mdLg}px`,
  cursor: "pointer",
  color: T.Text.secondary,
  background: T.Background.surface,
};

const ghostBtn: React.CSSProperties = { ...baseBtn };
const primaryBtn: React.CSSProperties = {
  ...baseBtn,
  color: T.Background.base,
  background: T.Accent.primary,
  borderColor: "transparent",
  fontWeight: T.FontWeight.semibold,
};
const transportBtn: React.CSSProperties = {
  ...baseBtn,
  width: 34,
  height: 28,
  display: "grid",
  placeItems: "center",
  padding: 0,
  color: T.Text.primary,
};
