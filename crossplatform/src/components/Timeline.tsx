import { useRef } from "react";
import { AppTheme as T, fontStack, monoFontStack } from "../theme";
import { useEditor } from "../state/editorStore";
import type { ClipKind } from "../engine/types";

const PPS = 44; // pixels per second
const TRACK_H = 56;
const HEADER_W = 56;
const TRACKS = [
  { index: 0, label: "V1" },
  { index: 1, label: "A1" },
];

const trackColor: Record<ClipKind, string> = {
  video: T.TrackColor.video,
  audio: T.TrackColor.audio,
  image: T.TrackColor.image,
  text: T.TrackColor.text,
  lottie: T.TrackColor.lottie,
};

export function Timeline() {
  const lanesRef = useRef<HTMLDivElement>(null);
  const clips = useEditor((s) => s.clips);
  const duration = useEditor((s) => s.duration);
  const playhead = useEditor((s) => s.playhead);
  const selectedClipId = useEditor((s) => s.selectedClipId);
  const setPlayhead = useEditor((s) => s.setPlayhead);
  const selectClip = useEditor((s) => s.selectClip);

  const width = Math.max(duration + 4, 20) * PPS;
  const ticks = Math.ceil(width / PPS);

  function scrub(e: React.MouseEvent) {
    const el = lanesRef.current!;
    const x = e.clientX - el.getBoundingClientRect().left + el.scrollLeft;
    setPlayhead(x / PPS);
  }

  return (
    <div style={panel}>
      <div style={header}>
        <span>Timeline</span>
        <span style={{ flex: 1 }} />
        <span style={{ fontFamily: monoFontStack, fontSize: T.FontSize.xs, color: T.Text.muted }}>
          {duration.toFixed(1)}s · {clips.length} clip{clips.length === 1 ? "" : "s"}
        </span>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Track labels */}
        <div style={{ width: HEADER_W, flex: "0 0 auto", background: T.Background.raised, borderRight: `${T.BorderWidth.thin}px solid ${T.Border.primary}` }}>
          <div style={{ height: 22 }} />
          {TRACKS.map((tr) => (
            <div key={tr.index} style={{ height: TRACK_H, display: "flex", alignItems: "center", justifyContent: "center", color: T.Text.tertiary, fontFamily: fontStack, fontSize: T.FontSize.xs, borderTop: `${T.BorderWidth.hairline}px solid ${T.Border.subtle}` }}>
              {tr.label}
            </div>
          ))}
        </div>

        {/* Scrollable lanes */}
        <div ref={lanesRef} onMouseDown={scrub} style={{ position: "relative", flex: 1, overflowX: "auto", overflowY: "hidden", cursor: "text" }}>
          <div style={{ position: "relative", width, minHeight: 22 + TRACKS.length * TRACK_H }}>
            {/* Ruler */}
            <div style={{ height: 22, position: "relative", borderBottom: `${T.BorderWidth.thin}px solid ${T.Border.primary}` }}>
              {Array.from({ length: ticks }, (_, i) => (
                <div key={i} style={{ position: "absolute", left: i * PPS, top: 0, height: "100%", borderLeft: `${T.BorderWidth.hairline}px solid ${T.Border.subtle}`, paddingLeft: 3, color: T.Text.muted, fontFamily: monoFontStack, fontSize: T.FontSize.micro }}>
                  {i % 5 === 0 ? `${i}s` : ""}
                </div>
              ))}
            </div>

            {/* Tracks */}
            {TRACKS.map((tr) => (
              <div key={tr.index} style={{ height: TRACK_H, position: "relative", borderTop: `${T.BorderWidth.hairline}px solid ${T.Border.subtle}`, background: tr.index % 2 ? "transparent" : "rgba(255,255,255,0.012)" }}>
                {clips.filter((c) => c.track === tr.index).map((c) => {
                  const selected = c.id === selectedClipId;
                  return (
                    <div
                      key={c.id}
                      onMouseDown={(e) => { e.stopPropagation(); selectClip(c.id); }}
                      style={{
                        position: "absolute",
                        left: c.start * PPS,
                        width: Math.max(c.duration * PPS, 8),
                        top: 6,
                        bottom: 6,
                        background: trackColor[c.kind],
                        opacity: selected ? 1 : T.Opacity.prominent,
                        border: `${T.BorderWidth.medium}px solid ${selected ? T.Accent.primary : "transparent"}`,
                        borderRadius: T.Radius.xsSm,
                        color: "#fff",
                        fontFamily: fontStack,
                        fontSize: T.FontSize.xs,
                        padding: `${T.Spacing.xs}px ${T.Spacing.sm}px`,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        cursor: "grab",
                        boxSizing: "border-box",
                      }}
                    >
                      {c.name}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Playhead */}
            <div style={{ position: "absolute", top: 0, bottom: 0, left: playhead * PPS, width: 2, background: T.Accent.timecode, pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: 0, left: -4, width: 10, height: 10, background: T.Accent.timecode, clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const panel: React.CSSProperties = {
  height: 220,
  flex: "0 0 auto",
  background: T.Background.surface,
  borderTop: `${T.BorderWidth.thin}px solid ${T.Border.primary}`,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};
const header: React.CSSProperties = {
  height: 30,
  display: "flex",
  alignItems: "center",
  gap: T.Spacing.smMd,
  padding: `0 ${T.Spacing.mdLg}px`,
  background: T.Background.raised,
  borderBottom: `${T.BorderWidth.thin}px solid ${T.Border.primary}`,
  color: T.Text.secondary,
  fontFamily: fontStack,
  fontSize: T.FontSize.smMd,
  fontWeight: T.FontWeight.semibold,
};
