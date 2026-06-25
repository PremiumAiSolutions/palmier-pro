import { useRef } from "react";
import { AppTheme as T, fontStack } from "../theme";
import { useEditor } from "../state/editorStore";
import { getEngine } from "../engine";

export function MediaPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const assets = useEditor((s) => s.assets);
  const addAsset = useEditor((s) => s.addAsset);
  const addClip = useEditor((s) => s.addClipFromAsset);
  const list = Object.values(assets);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const asset = await getEngine().importMedia(file);
      addAsset(asset);
    } catch (err) {
      alert(String(err));
    }
  }

  return (
    <div style={panel}>
      <div style={header}>Media</div>
      <div style={{ padding: T.Spacing.smMd, display: "flex", flexDirection: "column", gap: T.Spacing.smMd, overflowY: "auto" }}>
        <input ref={fileRef} type="file" accept="video/*" hidden onChange={onFile} />
        <button onClick={() => fileRef.current?.click()} style={importBtn}>
          + Import media
        </button>

        {list.length === 0 && (
          <div style={{ color: T.Text.muted, fontFamily: fontStack, fontSize: T.FontSize.sm, padding: T.Spacing.smMd, lineHeight: 1.5 }}>
            No media yet. Import a clip to add it to the bin, then drag it to the timeline.
          </div>
        )}

        {list.map((a) => (
          <button key={a.id} onClick={() => addClip(a.id)} style={tile} title="Add to timeline">
            <div style={{ ...thumb, background: T.TrackColor.video }} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: T.Text.primary, fontSize: T.FontSize.smMd, fontFamily: fontStack, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                {a.name}
              </div>
              <div style={{ color: T.Text.muted, fontSize: T.FontSize.xs, fontFamily: fontStack }}>
                {a.width}×{a.height} · {a.durationSeconds.toFixed(1)}s
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const panel: React.CSSProperties = {
  width: 240,
  flex: "0 0 auto",
  background: T.Background.surface,
  borderRight: `${T.BorderWidth.thin}px solid ${T.Border.primary}`,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};
const header: React.CSSProperties = {
  height: 34,
  display: "flex",
  alignItems: "center",
  padding: `0 ${T.Spacing.mdLg}px`,
  background: T.Background.raised,
  borderBottom: `${T.BorderWidth.thin}px solid ${T.Border.primary}`,
  color: T.Text.secondary,
  fontFamily: fontStack,
  fontSize: T.FontSize.smMd,
  fontWeight: T.FontWeight.semibold,
};
const importBtn: React.CSSProperties = {
  fontFamily: fontStack,
  fontSize: T.FontSize.smMd,
  color: T.Text.secondary,
  background: T.Background.raised,
  border: `${T.BorderWidth.thin}px dashed ${T.Border.divider}`,
  borderRadius: T.Radius.sm,
  padding: `${T.Spacing.md}px`,
  cursor: "pointer",
};
const tile: React.CSSProperties = {
  display: "flex",
  gap: T.Spacing.smMd,
  alignItems: "center",
  background: T.Background.raised,
  border: `${T.BorderWidth.thin}px solid ${T.Border.subtle}`,
  borderRadius: T.Radius.sm,
  padding: T.Spacing.sm,
  cursor: "pointer",
  textAlign: "left",
};
const thumb: React.CSSProperties = {
  width: 44,
  height: 30,
  borderRadius: T.Radius.xs,
  flex: "0 0 auto",
  opacity: T.Opacity.strong,
};
