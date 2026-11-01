/* =========================================================================
   fx core — pure, DOM-free helpers for the motion layer (unit tested in Node)
   ========================================================================= */

const GLYPHS = 'ABCDEFGHJKLMNPRSTUVXYZ#%&@<>/=+*';
const DIGITS = '0123456789';
const WORD = /[\p{L}\p{N}]/u;
const NUM = /\p{N}/u;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// deterministic 0..1 hash, so a frame can be reproduced from (index, step, seed)
function hash(i, step, seed) {
  let h = Math.imul(i + 1, 374761393) ^ Math.imul(step + 1, 668265263) ^ Math.imul(seed + 1, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** One frame of the "decode" effect. Letters and digits not yet revealed are
 *  replaced by glyphs (digits stay digits, like a scoreboard); whitespace and
 *  punctuation never change. progress >= 1 returns the source text. */
export function scrambleFrame(text, progress, seed = 0) {
  if (progress >= 1) return text;
  const chars = Array.from(text);
  const n = chars.length || 1;
  const step = Math.floor(clamp(progress, 0, 1) * 40);
  return chars.map((ch, i) => {
    if (!WORD.test(ch)) return ch;
    if (progress >= 0.25 + 0.75 * (i / n)) return ch;
    const set = NUM.test(ch) ? DIGITS : GLYPHS;
    return set[Math.floor(hash(i, step, seed) * set.length)];
  }).join('');
}

/** 3D tilt in degrees from a pointer position normalised to the element (0..1). */
export function tilt(px, py, max) {
  return {
    rx: clamp((0.5 - py) * 2 * max, -max, max),
    ry: clamp((px - 0.5) * 2 * max, -max, max)
  };
}

/** Magnetic pull towards the pointer, offset from the element centre in px. */
export function magnet(dx, dy, max, strength = 0.3) {
  return { x: clamp(dx * strength, -max, max), y: clamp(dy * strength, -max, max) };
}

/** Ball position along a serve arc for t = 0..1, in shader space:
 *  x in -0.42..0.42 (multiply by aspect), y in screen heights, z = radius. */
export function serveArc(t) {
  const k = clamp(t, 0, 1);
  const s = Math.sin(Math.PI * k);
  return { x: -0.42 + 0.84 * k, y: -0.18 + 0.5 * s - 0.1 * k, z: 0.042 + 0.022 * s };
}

export function canRunGL({ reducedMotion, webgl, saveData }) {
  return !reducedMotion && !!webgl && !saveData;
}

export function progress(scrollY, max) {
  return max > 0 ? clamp(scrollY / max, 0, 1) : 0;
}
