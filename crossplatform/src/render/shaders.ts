// GPU effect chain, ported from the app's Metal kernels (Metal/*.metal).
// WebGL2 / GLSL ES 3.00 now; the same math moves to WGSL when we add the WebGPU path.

export const VERTEX_SRC = `#version 300 es
in vec2 a_pos;
out vec2 v_uv;
void main() {
  // a_pos is a fullscreen triangle in clip space; derive uv from it.
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Single pass that applies HighlightsShadows then Vignette, matching the order
// the Core Image graph uses. Faithful ports of:
//   Metal/HighlightsShadows.metal  (luma-masked tone delta)
//   Metal/Vignette.metal           (superellipse, feathered, multiplicative)
export const FRAGMENT_SRC = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_tex;
uniform float u_highlights;   // -1..1
uniform float u_shadows;      // -1..1
uniform float u_vigAmount;    // -1..1  (<0 darkens edges, >0 lightens)
uniform float u_vigMidpoint;  // 0..1
uniform float u_vigRoundness; // -1 rect .. +1 round
uniform float u_vigFeather;   // 0..1

vec3 highlightsShadows(vec3 rgb) {
  float y = dot(clamp(rgb, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722));
  float hi = y * y * y;                          // peaks at white
  float lo = (1.0 - y) * (1.0 - y) * (1.0 - y);  // peaks at black
  float dY = (u_highlights * hi + u_shadows * lo) * 0.5;
  return clamp(rgb + dY, 0.0, 1.0);
}

vec3 vignette(vec3 rgb, vec2 uv) {
  vec2 d = uv * 2.0 - 1.0;                        // -1..1 across frame
  float p = mix(6.0, 2.0, (u_vigRoundness + 1.0) * 0.5);
  float dist = pow(pow(abs(d.x), p) + pow(abs(d.y), p), 1.0 / p);
  float v = smoothstep(u_vigMidpoint, u_vigMidpoint + u_vigFeather * 1.5 + 0.05, dist);
  return clamp(rgb * (1.0 + u_vigAmount * v), 0.0, 1.0);
}

void main() {
  vec4 s = texture(u_tex, v_uv);
  vec3 c = highlightsShadows(s.rgb);
  c = vignette(c, v_uv);
  fragColor = vec4(c, s.a);
}`;

export interface AdjustParams {
  highlights: number;
  shadows: number;
  vignetteAmount: number;
  vignetteMidpoint: number;
  vignetteRoundness: number;
  vignetteFeather: number;
}

export const DEFAULT_ADJUST: AdjustParams = {
  highlights: 0,
  shadows: 0,
  vignetteAmount: 0,
  vignetteMidpoint: 0.5,
  vignetteRoundness: 0,
  vignetteFeather: 0.4,
};
