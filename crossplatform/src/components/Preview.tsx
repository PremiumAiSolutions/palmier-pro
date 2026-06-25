import { useEffect, useRef } from "react";
import { AppTheme as T } from "../theme";
import { useEditor } from "../state/editorStore";
import { Renderer } from "../render/Renderer";
import { drawTestFrame } from "../render/TestSource";

const W = 1280;
const H = 720;

// Center preview. Runs a single rAF loop for its lifetime: advances the playhead
// when playing, draws the current frame (synthetic for now) to an offscreen 2D
// canvas, uploads it to the WebGL renderer, and applies the live grade. Reading
// the store via getState() each frame keeps the loop free of stale closures.
export function Preview() {
  const glRef = useRef<HTMLCanvasElement>(null);
  const offRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const errRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const gl = glRef.current!;
    let renderer: Renderer;
    try {
      renderer = new Renderer(gl);
    } catch (e) {
      if (errRef.current) errRef.current.textContent = String(e);
      return;
    }
    renderer.resize(W, H);
    rendererRef.current = renderer;

    const off = offRef.current!;
    off.width = W;
    off.height = H;
    const ctx = off.getContext("2d")!;

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const s = useEditor.getState();
      if (s.isPlaying) {
        let next = s.playhead + dt;
        if (next >= s.duration) next = 0;
        s.setPlayhead(next);
      }
      drawTestFrame(ctx, W, H, useEditor.getState().playhead);
      renderer.setSource(off);
      renderer.render(useEditor.getState().adjust);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, []);

  return (
    <div style={wrap}>
      <div style={stage}>
        <canvas ref={glRef} style={canvas} />
        <canvas ref={offRef} hidden />
        <div ref={errRef} style={errStyle} />
      </div>
    </div>
  );
}

const wrap: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  background: T.Background.base,
  display: "grid",
  placeItems: "center",
  padding: T.Spacing.xl,
  overflow: "hidden",
};
const stage: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  display: "grid",
  placeItems: "center",
};
const canvas: React.CSSProperties = {
  maxWidth: "100%",
  maxHeight: "100%",
  aspectRatio: "16 / 9",
  background: T.Background.previewCanvas,
  borderRadius: T.Radius.sm,
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
};
const errStyle: React.CSSProperties = {
  position: "absolute",
  color: T.Status.error,
  fontSize: T.FontSize.smMd,
  padding: T.Spacing.md,
  textAlign: "center",
};
