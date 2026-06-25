// Synthetic "footage" so the render path is demonstrable before real video
// decode is wired to a file. Draws SMPTE-style bars, a sweeping playhead marker,
// and a burned-in timecode — enough motion to prove playback + live grading.

const BARS = [
  "#c0c0c0", "#c0c000", "#00c0c0", "#00c000",
  "#c000c0", "#c00000", "#0000c0",
];

function timecode(t: number, fps: number): string {
  const total = Math.max(0, Math.floor(t * fps));
  const f = total % fps;
  const s = Math.floor(total / fps) % 60;
  const m = Math.floor(total / (fps * 60)) % 60;
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  return `${pad(m)}:${pad(s)}:${pad(f)}`;
}

export function drawTestFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  fps = 30,
): void {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  const barW = width / BARS.length;
  BARS.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(i * barW, 0, barW + 1, height * 0.72);
  });

  // Lower gradient strip.
  const grad = ctx.createLinearGradient(0, height * 0.72, width, height);
  grad.addColorStop(0, "#0a0a0a");
  grad.addColorStop(0.5, "#3a3a3a");
  grad.addColorStop(1, "#0a0a0a");
  ctx.fillStyle = grad;
  ctx.fillRect(0, height * 0.72, width, height * 0.28);

  // Sweeping marker driven by time.
  const x = (t * 0.18) % 1 * width;
  ctx.fillStyle = "rgba(242,153,51,0.95)";
  ctx.fillRect(x - 2, 0, 4, height * 0.72);

  // Burned-in timecode.
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `${Math.round(height * 0.07)}px monospace`;
  ctx.textBaseline = "middle";
  ctx.fillText(timecode(t, fps), width * 0.04, height * 0.86);

  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = `${Math.round(height * 0.035)}px sans-serif`;
  ctx.fillText("TEST SOURCE — 1920×1080 · import a clip to replace", width * 0.04, height * 0.95);
}
