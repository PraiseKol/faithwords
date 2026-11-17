// Sound: everything is synthesised with the Web Audio API (no files to download), shaped to feel like a game:
// wooden tile taps, bell-like scoring that climbs with every right tile, a buzzer for wrong tiles, fanfares.
import { store } from './store.js';
let ctx, bus, noiseBuf;

function boot() {
  if (ctx) return;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  const comp = ctx.createDynamicsCompressor(); // keeps layered sounds punchy but never harsh
  comp.threshold.value = -14; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.2;
  bus = ctx.createGain(); bus.gain.value = 0.95;
  bus.connect(comp); comp.connect(ctx.destination);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}
const now = () => ctx.currentTime;

/** One oscillator note with an attack/decay envelope, optional pitch glide, filter and stereo position. */
function tone(freq, t0, dur, { type = 'sine', vol = 0.15, attack = 0.005, glide = null, lp = null, pan = 0, detune = 0 } = {}) {
  const t = now() + t0, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t); o.detune.value = detune;
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node = o;
  if (lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; o.connect(f); node = f; }
  node.connect(g);
  let out = g;
  if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; }
  out.connect(bus);
  o.start(t); o.stop(t + dur + 0.05);
}
/** A burst of filtered noise: clicks, whooshes, sparkle dust. */
function noise(t0, dur, { vol = 0.1, type = 'bandpass', from = 1000, to = null, q = 1, attack = 0.003 } = {}) {
  const t = now() + t0, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = noiseBuf; s.loop = true; f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(from, t); if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(bus); s.start(t); s.stop(t + dur + 0.05);
}
/** A struck bell: a few inharmonic partials with different decay times. */
function bell(freq, t0, vol = 0.13, len = 0.9) {
  [[1, 1, len], [2.01, 0.45, len * 0.6], [2.76, 0.28, len * 0.4], [5.4, 0.12, len * 0.22]].forEach(([m, v, d]) => tone(freq * m, t0, d, { vol: vol * v, attack: 0.002 }));
}
/** A soft marimba / wood-block note. */
function mallet(freq, t0, vol = 0.14) { tone(freq, t0, 0.3, { vol, attack: 0.002, type: 'triangle' }); tone(freq * 4, t0, 0.08, { vol: vol * 0.35, attack: 0.001 }); noise(t0, 0.02, { vol: vol * 0.5, type: 'highpass', from: 3000 }); }
const semis = (base, n) => base * 2 ** (n / 12);
const C5 = 523.25;
const MAJOR = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21];

const SOUNDS = {
  // tiles
  pick() { tone(520, 0, 0.09, { glide: 760, vol: 0.08, type: 'triangle' }); },
  drop() { tone(300, 0, 0.1, { glide: 150, vol: 0.2, type: 'triangle' }); noise(0, 0.035, { vol: 0.2, type: 'lowpass', from: 2400, to: 700 }); tone(1100, 0, 0.03, { vol: 0.05 }); },
  place() { SOUNDS.drop(); },
  recall() { tone(640, 0, 0.12, { glide: 360, vol: 0.09, type: 'triangle' }); noise(0, 0.05, { vol: 0.05, type: 'bandpass', from: 1800, to: 500 }); },
  // scoring: each right tile in a turn is a note higher on the scale
  right(n = 1) { const f = semis(C5, MAJOR[Math.min(n - 1, MAJOR.length - 1)]); bell(f, 0, 0.14, 0.7); tone(f * 2, 0.02, 0.12, { vol: 0.05, type: 'triangle' }); },
  wrong() { tone(210, 0, 0.32, { type: 'sawtooth', glide: 95, vol: 0.14, lp: 900 }); tone(70, 0, 0.3, { glide: 45, vol: 0.28 }); noise(0, 0.12, { vol: 0.1, type: 'lowpass', from: 900, to: 200 }); },
  word(n = 1) { // a finished word: a quick rising arpeggio with shimmer, a little higher each time
    const r = semis(C5, MAJOR[Math.min(Math.max(n - 1, 0), 5)]);
    [0, 4, 7, 12].forEach((s, i) => bell(semis(r, s), i * 0.07, 0.13, 0.8));
    noise(0.2, 0.35, { vol: 0.05, type: 'highpass', from: 5000 });
    tone(semis(r, 12), 0.28, 0.5, { vol: 0.07, type: 'triangle' });
  },
  bonus() { // all five tiles right
    [0, 4, 7, 12, 16, 19].forEach((s, i) => bell(semis(C5, s), i * 0.075, 0.15, 1));
    [0, 4, 7].forEach((s) => tone(semis(C5 / 2, s), 0.45, 0.9, { type: 'sawtooth', vol: 0.05, lp: 1400, attack: 0.04 }));
    noise(0.4, 0.7, { vol: 0.07, type: 'highpass', from: 4000 });
  },
  // opponent and turns
  opp() { mallet(330, 0, 0.16); mallet(494, 0.07, 0.1); },
  turn() { bell(semis(C5, 7), 0, 0.07, 0.5); bell(C5, 0.12, 0.07, 0.6); },
  // power-ups
  whoosh() { noise(0, 0.32, { vol: 0.13, type: 'bandpass', from: 300, to: 3200, q: 2.2, attack: 0.06 }); tone(300, 0, 0.3, { glide: 900, vol: 0.05, type: 'triangle' }); },
  sparkle() { [0, 4, 7, 12, 16, 19, 24].forEach((s, i) => bell(semis(C5 * 2, s), i * 0.05, 0.07, 0.5)); noise(0, 0.4, { vol: 0.04, type: 'highpass', from: 6000 }); },
  power() { // a revealed word: swoosh, then a magical run up
    noise(0, 0.25, { vol: 0.1, type: 'bandpass', from: 400, to: 3000, q: 2, attack: 0.05 });
    [0, 4, 7, 12, 16].forEach((s, i) => bell(semis(C5, s), 0.12 + i * 0.065, 0.13, 0.85));
    tone(semis(C5, 12), 0.45, 0.6, { vol: 0.07, type: 'triangle' });
  },
  coin() { tone(988, 0, 0.07, { type: 'square', vol: 0.06 }); tone(1319, 0.07, 0.3, { type: 'square', vol: 0.06 }); bell(1976, 0.07, 0.05, 0.4); },
  ui() { tone(700, 0, 0.05, { vol: 0.07, type: 'triangle' }); },
  // match end
  win() {
    const chord = (t, notes, len, v = 0.07) => notes.forEach((s) => { tone(semis(C5 / 2, s), t, len, { type: 'sawtooth', vol: v, lp: 1800, attack: 0.03 }); tone(semis(C5 / 2, s), t, len, { type: 'square', vol: v * 0.4, lp: 1200, attack: 0.03, detune: 7 }); });
    chord(0, [0, 4, 7], 0.28); chord(0.26, [5, 9, 12], 0.28); chord(0.52, [7, 11, 14], 0.28); chord(0.8, [0, 4, 7, 12], 1.5, 0.08);
    [12, 16, 19, 24, 19, 24, 28].forEach((s, i) => bell(semis(C5, s), 0.8 + i * 0.1, 0.12, 1.1));
    tone(65, 0.8, 0.5, { glide: 50, vol: 0.3 }); noise(0.8, 0.8, { vol: 0.06, type: 'highpass', from: 5000 });
  },
  lose() { [392, 349, 311, 262].forEach((f, i) => { tone(f, i * 0.26, 0.5, { type: 'triangle', vol: 0.13, lp: 1400 }); tone(f / 2, i * 0.26, 0.5, { vol: 0.08 }); }); },
};
export function sfx(name, arg) {
  if (!store.d.settings.sound) return;
  try {
    boot();
    if (ctx.state === 'suspended') ctx.resume();
    SOUNDS[name]?.(arg);
  } catch { /* audio unavailable */ }
}
export const _sounds = Object.keys(SOUNDS);
