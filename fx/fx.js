/* =========================================================================
   fx — the motion layer. Purely decorative and progressive: without WebGL,
   with reduced motion or Save-Data the page keeps its static look.
   One rAF loop drives the field, the cursor and the HUD clock; it stops
   while the tab is hidden.
   ========================================================================= */
import { scrambleFrame, tilt, magnet, serveArc, canRunGL, progress } from './core.js';
import { createField } from './field.js';

const root = document.documentElement;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const saveData = !!(navigator.connection && navigator.connection.saveData);

const state = { scroll: 0, ptrX: 0, ptrY: 0, tx: 0, ty: 0, cx: -100, cy: -100, rx: -100, ry: -100 };

function el(tag, cls, parent = document.body) {
  const n = document.createElement(tag);
  n.className = cls;
  n.setAttribute('aria-hidden', 'true');
  parent.appendChild(n);
  return n;
}

// ---------- scroll progress (also used without motion: it is static per position) ----------
let maxScroll = 1;
const measure = () => { maxScroll = document.documentElement.scrollHeight - window.innerHeight; };
const onScroll = () => {
  state.scroll = progress(window.scrollY, maxScroll);
  root.style.setProperty('--fx-progress', state.scroll.toFixed(4));
};
measure();
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
window.addEventListener('load', () => { measure(); onScroll(); });

// source text of decoded nodes (see scramble); shared with the HUD section readout
const originals = new WeakMap();

// ---------- HUD ----------
const hud = el('div', 'fx-hud');
hud.innerHTML = '<span class="fx-bar"></span><span class="fx-corner tl"></span><span class="fx-corner tr"></span>'
  + '<span class="fx-corner bl"></span><span class="fx-corner br"></span>'
  + '<span class="fx-read fx-sec"></span><span class="fx-read fx-geo">BRNO · 49.195°N 16.608°E · <b class="fx-clock">T+00:00.0</b></span>';
const secOut = hud.querySelector('.fx-sec');
const clock = hud.querySelector('.fx-clock');
const sections = Array.from(document.querySelectorAll('main > section'));
let activeSec = 0;

function sectionName(s) {
  const lbl = s.querySelector('.s-label, .ph-eyebrow, .h-eyebrow, .eyebrow') || s.querySelector('h2');
  if (!lbl) return (s.getAttribute('aria-label') || '').trim().toUpperCase();
  // read the source text, not a frame of a running decode effect
  let text = '';
  const walker = document.createTreeWalker(lbl, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) text += originals.get(walker.currentNode) ?? walker.currentNode.nodeValue;
  return text.trim().toUpperCase();
}
function renderSection() {
  const s = sections[activeSec];
  if (!s) return;
  const pad = n => String(n).padStart(2, '0');
  secOut.textContent = `SEC ${pad(activeSec + 1)}/${pad(sections.length)} · ${sectionName(s)}`;
}
if ('IntersectionObserver' in window && sections.length) {
  const sio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { activeSec = sections.indexOf(e.target); renderSection(); }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  sections.forEach(s => sio.observe(s));
}
renderSection();

// ---------- text decode ----------
// only short, single-line uppercase labels: decoding body headings would reflow lines (CLS)
const SCRAMBLE = '.s-label, .eyebrow, .ph-eyebrow, .h-eyebrow, .axis-kicker, .stat .num';
const DURATION = 750;
const revealed = new Set();
// source text per node and the active run per element, so a re-run never
// captures a half-scrambled frame as the "original"
const runs = new WeakMap();

function scramble(target) {
  const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (!originals.has(n)) originals.set(n, n.nodeValue);
    if (originals.get(n).trim()) nodes.push([n, originals.get(n)]);
  }
  if (!nodes.length) return;
  const run = {};
  runs.set(target, run);
  const seed = Math.floor(Math.random() * 1e6);
  const t0 = performance.now();
  (function frame(now) {
    if (runs.get(target) !== run) return;
    const p = Math.min(1, (now - t0) / DURATION);
    nodes.forEach(([n, text], i) => { n.nodeValue = scrambleFrame(text, p, seed + i); });
    if (p < 1) requestAnimationFrame(frame);
  })(t0);
}

if (!reduceMotion && 'IntersectionObserver' in window) {
  const targets = document.querySelectorAll(SCRAMBLE);
  const tio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      tio.unobserve(e.target);
      revealed.add(e.target);
      scramble(e.target);
    });
  }, { threshold: 0.2 });
  targets.forEach(t => tio.observe(t));
}

document.addEventListener('langchange', () => {
  revealed.forEach(scramble);
  renderSection();
  measure();
  onScroll();
});

// ---------- WebGL field ----------
let field = null;
let canvas = null;
const probe = () => { try { return !!document.createElement('canvas').getContext('webgl'); } catch { return false; } };

if (canRunGL({ reducedMotion: reduceMotion, webgl: probe(), saveData })) {
  canvas = document.createElement('canvas');
  canvas.className = 'fx-field';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  field = createField(canvas);
  if (field) {
    root.classList.add('fx-gl');
    window.addEventListener('resize', () => field && field.resize(), { passive: true });
    canvas.addEventListener('webglcontextlost', e => {
      e.preventDefault();
      field = null;
      root.classList.remove('fx-gl');
      canvas.remove();
    });
  } else {
    canvas.remove();
    canvas = null;
  }
}

// ---------- pointer effects (fine pointers only) ----------
// the custom cursor replaces the native one (cursor:none in fx.css), so the
// dot follows the pointer exactly and only the ring eases behind it
let cursor = null;
let dot = null;
if (finePointer && !reduceMotion) {
  root.classList.add('fx-pointer');
  cursor = el('div', 'fx-cursor');
  dot = el('div', 'fx-cursor-dot');
  root.classList.add('fx-cursor-off'); // hidden until the first move

  window.addEventListener('pointermove', e => {
    state.tx = (e.clientX / window.innerWidth) * 2 - 1;
    state.ty = 1 - (e.clientY / window.innerHeight) * 2;
    state.cx = e.clientX;
    state.cy = e.clientY;
    dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
    root.classList.remove('fx-cursor-off');
    cursor.classList.toggle('is-link', !!e.target.closest('a, button, input, textarea, select, label, [role="button"]'));
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => root.classList.add('fx-cursor-off'));
  window.addEventListener('pointerdown', () => cursor.classList.add('is-down'), { passive: true });
  window.addEventListener('pointerup', () => cursor.classList.remove('is-down'), { passive: true });

  const TILT_MAX = 7;
  document.querySelectorAll('.service, .principle, .terminal, .stat, .offer-row, .ref-figure, .note').forEach(card => {
    // .note is itself a .reveal, whose transform wins; spotlight only
    const doTilt = !card.matches('.offer-row, .stat, .note');
    let rect = null;
    card.addEventListener('pointerenter', () => { rect = card.getBoundingClientRect(); });
    card.addEventListener('pointermove', e => {
      if (!rect) rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      if (doTilt) {
        const t = tilt(px, py, TILT_MAX);
        card.style.setProperty('--rx', t.rx.toFixed(2) + 'deg');
        card.style.setProperty('--ry', t.ry.toFixed(2) + 'deg');
      }
    });
    card.addEventListener('pointerleave', () => {
      rect = null;
      card.style.removeProperty('--rx');
      card.style.removeProperty('--ry');
    });
  });

  document.querySelectorAll('.btn, .nav-cta, .lang-toggle').forEach(btn => {
    btn.addEventListener('pointermove', e => {
      const r = btn.getBoundingClientRect();
      const m = magnet(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2), 8);
      btn.style.setProperty('--tx', m.x.toFixed(1) + 'px');
      btn.style.setProperty('--ty', m.y.toFixed(1) + 'px');
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.removeProperty('--tx');
      btn.style.removeProperty('--ty');
    });
  });
}

// ---------- loop ----------
let raf = 0;
let last = 0;
const start = performance.now();
let slow = 0;
let frames = 0;
let scale = 1;
// time and travel are wrapped on the CPU so the shader never sees large
// floats (mediump is fp16 on many phones); travel wraps at the 18 m court length
const TIME_WRAP = 600;

function ballAt(time) {
  const aspect = window.innerWidth / window.innerHeight;
  const b = serveArc(state.scroll);
  b.x *= Math.min(aspect, 2.2);
  if (aspect < 1) b.z *= Math.max(0.6, aspect * 1.3);
  b.y += Math.sin(time * 1.6) * 0.008;
  return b;
}

function frameState(time) {
  return {
    time: time % TIME_WRAP,
    travel: (time * 0.55 + state.scroll * 40) % 18,
    scroll: state.scroll, ptrX: state.ptrX, ptrY: state.ptrY,
    ball: ballAt(time),
    spin: (time * 1.4 + state.scroll * 18) % (Math.PI * 2)
  };
}

function tick(now) {
  raf = requestAnimationFrame(tick);
  const dt = now - last;
  last = now;
  const time = (now - start) / 1000;

  state.ptrX += (state.tx - state.ptrX) * 0.06;
  state.ptrY += (state.ty - state.ptrY) * 0.06;

  if (field) {
    field.render(frameState(time));

    // adaptive resolution: drop the render scale when frames stay slow
    if (dt > 0 && dt < 250) {
      frames++;
      if (dt > 24) slow++;
      if (frames === 30) {
        if (slow > 15 && scale > 0.5) { scale = Math.max(0.5, scale * 0.75); field.setScale(scale); }
        frames = slow = 0;
      }
    }
  }

  if (cursor) {
    state.rx += (state.cx - state.rx) * 0.25;
    state.ry += (state.cy - state.ry) * 0.25;
    cursor.style.transform = `translate3d(${state.rx.toFixed(1)}px, ${state.ry.toFixed(1)}px, 0)`;
  }
}

function play() { if (!raf && (field || cursor)) { last = performance.now(); raf = requestAnimationFrame(tick); } }
function pause() { cancelAnimationFrame(raf); raf = 0; }

if (!reduceMotion) {
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : play()));
  if (!document.hidden) play();

  // the HUD clock is a 10 Hz text update; no need for the render loop
  setInterval(() => {
    if (document.hidden) return;
    const tenths = Math.floor((performance.now() - start) / 100);
    const m = Math.floor(tenths / 600);
    clock.textContent = `T+${String(m).padStart(2, '0')}:${((tenths % 600) / 10).toFixed(1).padStart(4, '0')}`;
  }, 100);
}

// exposed for tests and debugging only
window.__fx = {
  get running() { return raf !== 0; },
  get dpr() { return field ? field.dpr : 0; },
  /** renders one frame and returns sampled RGB pixels (proves the field draws) */
  sample() { return field ? field.sample(frameState((performance.now() - start) / 1000)) : null; }
};
