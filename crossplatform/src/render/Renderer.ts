import { VERTEX_SRC, FRAGMENT_SRC, type AdjustParams } from "./shaders";

// Minimal WebGL2 renderer: uploads a source frame to a texture and runs the
// ported effect chain over a fullscreen triangle. Designed so a WebGPU backend
// can implement the same surface (setSource / render) later.
export class Renderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private texture: WebGLTexture;
  private uniforms: Record<string, WebGLUniformLocation | null> = {};
  private hasSource = false;

  constructor(private canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: false, antialias: false });
    if (!gl) throw new Error("WebGL2 is unavailable in this environment.");
    this.gl = gl;

    this.program = this.link(VERTEX_SRC, FRAGMENT_SRC);
    gl.useProgram(this.program);

    // Fullscreen triangle.
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(this.program, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    this.texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    for (const name of [
      "u_tex", "u_highlights", "u_shadows",
      "u_vigAmount", "u_vigMidpoint", "u_vigRoundness", "u_vigFeather",
    ]) {
      this.uniforms[name] = gl.getUniformLocation(this.program, name);
    }
    gl.uniform1i(this.uniforms.u_tex, 0);
  }

  private link(vsSrc: string, fsSrc: string): WebGLProgram {
    const gl = this.gl;
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        throw new Error(`Shader compile failed: ${gl.getShaderInfoLog(sh)}`);
      }
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSrc));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSrc));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(`Program link failed: ${gl.getProgramInfoLog(prog)}`);
    }
    return prog;
  }

  setSource(image: TexImageSource): void {
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    this.hasSource = true;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    this.gl.viewport(0, 0, width, height);
  }

  render(p: AdjustParams): void {
    const gl = this.gl;
    if (!this.hasSource) return;
    gl.useProgram(this.program);
    gl.uniform1f(this.uniforms.u_highlights, p.highlights);
    gl.uniform1f(this.uniforms.u_shadows, p.shadows);
    gl.uniform1f(this.uniforms.u_vigAmount, p.vignetteAmount);
    gl.uniform1f(this.uniforms.u_vigMidpoint, p.vignetteMidpoint);
    gl.uniform1f(this.uniforms.u_vigRoundness, p.vignetteRoundness);
    gl.uniform1f(this.uniforms.u_vigFeather, p.vignetteFeather);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose(): void {
    const gl = this.gl;
    gl.deleteTexture(this.texture);
    gl.deleteProgram(this.program);
  }
}
