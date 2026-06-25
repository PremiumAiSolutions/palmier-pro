import { AppTheme as T, fontStack } from "../theme";
import { useEditor } from "../state/editorStore";
import type { AdjustParams } from "../render/shaders";

function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: T.Spacing.smMd }}>
      <div style={{ width: 96, color: T.Text.tertiary, fontFamily: fontStack, fontSize: T.FontSize.sm }}>
        {props.label}
      </div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 0.01}
        value={props.value}
        onChange={(e) => props.onChange(parseFloat(e.target.value))}
        style={{ flex: 1, accentColor: T.Accent.timecode }}
      />
      <div style={{ width: 40, textAlign: "right", color: T.Text.secondary, fontFamily: fontStack, fontSize: T.FontSize.xs }}>
        {props.value.toFixed(2)}
      </div>
    </div>
  );
}

export function Inspector() {
  const selectedClipId = useEditor((s) => s.selectedClipId);
  const clips = useEditor((s) => s.clips);
  const adjust = useEditor((s) => s.adjust);
  const setAdjust = useEditor((s) => s.setAdjust);
  const clip = clips.find((c) => c.id === selectedClipId) ?? null;

  const set = (k: keyof AdjustParams) => (v: number) => setAdjust({ [k]: v });

  return (
    <div style={panel}>
      <div style={header}>Inspector</div>
      <div style={{ padding: T.Spacing.lgXl, overflowY: "auto", display: "flex", flexDirection: "column", gap: T.Spacing.xl }}>
        <div>
          <div style={section}>Clip</div>
          <div style={{ color: clip ? T.Text.primary : T.Text.muted, fontFamily: fontStack, fontSize: T.FontSize.md }}>
            {clip ? clip.name : "No clip selected"}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: T.Spacing.md }}>
          <div style={section}>Highlights & Shadows</div>
          <Slider label="Highlights" value={adjust.highlights} min={-1} max={1} onChange={set("highlights")} />
          <Slider label="Shadows" value={adjust.shadows} min={-1} max={1} onChange={set("shadows")} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: T.Spacing.md }}>
          <div style={section}>Vignette</div>
          <Slider label="Amount" value={adjust.vignetteAmount} min={-1} max={1} onChange={set("vignetteAmount")} />
          <Slider label="Midpoint" value={adjust.vignetteMidpoint} min={0} max={1} onChange={set("vignetteMidpoint")} />
          <Slider label="Roundness" value={adjust.vignetteRoundness} min={-1} max={1} onChange={set("vignetteRoundness")} />
          <Slider label="Feather" value={adjust.vignetteFeather} min={0} max={1} onChange={set("vignetteFeather")} />
        </div>

        <div style={{ color: T.Text.muted, fontFamily: fontStack, fontSize: T.FontSize.xs, lineHeight: 1.5 }}>
          These two effects are the app's Metal kernels (HighlightsShadows, Vignette) ported to WebGL2.
          Drag a slider to grade the preview live.
        </div>
      </div>
    </div>
  );
}

const panel: React.CSSProperties = {
  width: 280,
  flex: "0 0 auto",
  background: T.Background.surface,
  borderLeft: `${T.BorderWidth.thin}px solid ${T.Border.primary}`,
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
const section: React.CSSProperties = {
  color: T.Text.muted,
  fontFamily: fontStack,
  fontSize: T.FontSize.xs,
  fontWeight: T.FontWeight.semibold,
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: T.Spacing.smMd,
};
