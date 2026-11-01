/* =========================================================================
   fx field — one full-screen WebGL1 fragment shader: a volleyball court in
   perspective flying towards the viewer, a mirrored ceiling grid, drifting
   particles, a scan beam and a lit ball on a serve trajectory.
   ========================================================================= */

const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 u_res;
uniform float u_time;
uniform float u_travel;
uniform float u_scroll;
uniform vec2 u_ptr;
uniform vec3 u_ball;
uniform float u_spin;

const vec3 CYAN = vec3(0.37, 0.95, 1.0);
const vec3 RED = vec3(0.84, 0.32, 0.23);
const vec3 AMBER = vec3(1.0, 0.72, 0.2);
const vec3 CREAM = vec3(0.97, 0.96, 0.93);

// sin-free hash (Hoskins): no large intermediates, safe in fp16
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float line(float v, float w){ float d = 0.5 - abs(fract(v) - 0.5); return 1.0 - smoothstep(0.0, w, d); }
float band(float d, float w){ return 1.0 - smoothstep(0.0, w, abs(d)); }

void main(){
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float aspect = u_res.x / u_res.y;
  vec2 cam = u_ptr * vec2(0.06, 0.03);
  float horizon = 0.08 + cam.y - u_scroll * 0.05;
  float dy = p.y - horizon;
  float travel = u_travel;

  vec3 col = mix(vec3(0.028, 0.03, 0.04), vec3(0.05, 0.045, 0.065), smoothstep(-0.5, 0.5, p.y));

  if (dy < 0.0) {
    float z = min(0.35 / -dy, 120.0);
    float x = (p.x + cam.x) * z;
    float zz = z + travel;
    float fade = exp(-z * 0.085);
    float wx = z / u_res.y * 1.6 + 0.012;
    float wz = z * z / (0.35 * u_res.y) * 1.6 + 0.012;
    col += CYAN * max(line(x, wx), line(zz, wz)) * 0.16 * fade;

    // court: 9 m wide, 18 m long, attack lines 3 m from the net, repeating
    float inside = step(abs(x), 4.5 + wx);
    float cz = mod(zz, 18.0);
    float court = band(abs(x) - 4.5, wx * 2.0)
      + inside * (band(min(cz, 18.0 - cz), wz * 2.0) + 0.6 * band(cz - 6.0, wz * 2.0) + 0.6 * band(cz - 12.0, wz * 2.0));
    float net = inside * band(cz - 9.0, wz * 3.0);
    col += RED * min(court, 1.0) * 0.6 * fade;
    col += AMBER * net * 0.75 * fade;
    col += RED * 0.03 * inside * fade;
  } else {
    float z = min(0.5 / dy, 120.0);
    float x = (p.x + cam.x) * z;
    float wx = z / u_res.y * 1.6 + 0.012;
    float wz = z * z / (0.5 * u_res.y) * 1.6 + 0.012;
    col += CYAN * max(line(x, wx), line(z + travel * 0.5, wz)) * 0.05 * exp(-z * 0.12);
  }

  // the horizon is the hero's centrepiece; keep it quiet behind body text
  float hz = 1.0 - 0.7 * smoothstep(0.03, 0.15, u_scroll);
  col += RED * exp(-abs(dy) * 55.0) * 0.32 * hz;
  col += CYAN * exp(-abs(dy) * 240.0) * 0.22 * hz;

  // particles
  vec2 q = p * 11.0 + vec2(0.0, u_time * 0.12 + u_scroll * 4.0);
  vec2 id = floor(q);
  float h = hash(id);
  vec2 o = vec2(hash(id + 1.3), hash(id + 7.1)) - 0.5;
  float d = length(fract(q) - 0.5 - o * 0.7);
  float tw = 0.5 + 0.5 * sin(u_time * 2.0 + h * 40.0);
  col += mix(CYAN, AMBER, step(0.9, h)) * smoothstep(0.05, 0.0, d) * step(0.74, h) * tw * 0.45;

  // pointer spotlight
  col += CYAN * 0.045 * exp(-length(p - u_ptr * vec2(0.5 * aspect, 0.5)) * 4.0);

  // scan beam
  float sy = 0.5 - fract(u_time * 0.06) * 1.2 + 0.1;
  col += CYAN * exp(-abs(p.y - sy) * 140.0) * 0.05;

  // ball
  vec2 bd = (p - u_ball.xy) / u_ball.z;
  float r = length(bd);
  col += AMBER * exp(-r * 1.4) * 0.16;
  if (r < 1.0) {
    vec3 n = vec3(bd, sqrt(1.0 - r * r));
    float a = u_spin;
    vec3 m = vec3(n.x * cos(a) - n.z * sin(a), n.y, n.x * sin(a) + n.z * cos(a));
    float s = min(abs(m.x), min(abs(m.y - 0.4 * sin(3.0 * m.z)), abs(m.z + 0.4 * sin(3.0 * m.y))));
    float seam = 1.0 - smoothstep(0.0, 0.06, s);
    float diff = max(dot(n, normalize(vec3(-0.4, 0.6, 0.7))), 0.0);
    vec3 base = mix(CREAM, RED, step(0.0, m.x) * step(0.0, m.y));
    vec3 ball = base * (0.22 + 0.78 * diff);
    ball = mix(ball, vec3(0.08), seam * 0.75);
    ball += CYAN * pow(1.0 - n.z, 3.0) * 0.9;
    col = mix(col, ball, smoothstep(1.0, 0.93, r) * 0.92);
  }

  col *= 0.45 + 0.55 * smoothstep(1.25, 0.15, length(p * vec2(0.85, 1.35)));
  col += (hash(mod(gl_FragCoord.xy, 512.0) + fract(u_time) * 17.0) - 0.5) * 0.014;
  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error('Shader compile failed: ' + log);
  }
  return s;
}

/** Returns a controller, or null when WebGL is unavailable (caller falls back to CSS). */
export function createField(canvas, { maxDpr = 1.5 } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return null;

  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('Program link failed: ' + gl.getProgramInfoLog(prog));
  } catch (err) {
    console.warn('fx field disabled:', err);
    return null;
  }
  gl.useProgram(prog);

  // one triangle that covers the viewport
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {};
  ['u_res', 'u_time', 'u_travel', 'u_scroll', 'u_ptr', 'u_ball', 'u_spin'].forEach(k => { u[k] = gl.getUniformLocation(prog, k); });

  let scale = 1;
  let dpr = 1;

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, w < 700 ? 1 : maxDpr) * scale;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.u_res, canvas.width, canvas.height);
  }
  resize();

  return {
    get dpr() { return dpr; },
    resize,
    /** Lower the render scale when frames are slow (0.5..1). */
    setScale(s) { scale = s; resize(); },
    render({ time, travel, scroll, ptrX, ptrY, ball, spin }) {
      gl.uniform1f(u.u_time, time);
      gl.uniform1f(u.u_travel, travel);
      gl.uniform1f(u.u_scroll, scroll);
      gl.uniform2f(u.u_ptr, ptrX, ptrY);
      gl.uniform3f(u.u_ball, ball.x, ball.y, ball.z);
      gl.uniform1f(u.u_spin, spin);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    /** Render, then read a row of pixels in the same task (before the buffer is cleared). */
    sample(frame) {
      this.render(frame);
      const px = new Uint8Array(4 * 8);
      gl.readPixels(0, Math.floor(canvas.height * 0.45), 8, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
      const out = new Uint8Array(4 * 8);
      gl.readPixels(Math.floor(canvas.width / 2) - 4, Math.floor(canvas.height * 0.3), 8, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
      return Array.from(px).concat(Array.from(out));
    },
    destroy() {
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
  };
}
