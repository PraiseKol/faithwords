import { store } from './store.js';
let ctx;
function tone(freq, t0, dur, type = 'sine', vol = 0.12) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, ctx.currentTime + t0);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + t0 + dur);
  o.connect(g); g.connect(ctx.destination);
  o.start(ctx.currentTime + t0); o.stop(ctx.currentTime + t0 + dur + 0.05);
}
export function sfx(name) {
  if (!store.d.settings.sound) return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    if (name === 'place') tone(660, 0, 0.12);
    if (name === 'wrong') tone(150, 0, 0.18, 'sawtooth', 0.07);
    if (name === 'word') { tone(523, 0, 0.14); tone(659, 0.1, 0.14); tone(784, 0.2, 0.22); }
    if (name === 'bonus') { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.2)); }
    if (name === 'opp') tone(440, 0, 0.1, 'triangle');
    if (name === 'win') { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.3)); }
    if (name === 'lose') { tone(330, 0, 0.25, 'triangle'); tone(247, 0.2, 0.35, 'triangle'); }
    if (name === 'coin') { tone(988, 0, 0.08, 'square', 0.05); tone(1319, 0.08, 0.18, 'square', 0.05); }
  } catch { /* audio unavailable */ }
}
