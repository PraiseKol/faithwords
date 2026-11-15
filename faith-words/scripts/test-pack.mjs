import { PACK, PACK_INFO } from '../js/pack.js';
import { buildPuzzle, specMain, specDaily, specEvent, randomOnlineSeed } from '../js/spec.js';
import { EVENTS, EVENT_PUZZLES } from '../js/config.js';
const fail = (m) => { console.error('FAIL', m); process.exit(1); };
const keys = Object.keys(PACK);
const sizes = {}; let empty = 0, orphan = 0;
for (const k of keys) {
  const p = buildPuzzle({ seed: k, kind: 'x' }), q = buildPuzzle({ seed: k, kind: 'x' });
  if (JSON.stringify(p) !== JSON.stringify(q)) fail('not deterministic ' + k);
  sizes[p.W + 'x' + p.H] = (sizes[p.W + 'x' + p.H] || 0) + 1;
  if (p.cells.some((c) => c.t === 'x')) empty++;
  p.cells.forEach((c) => { if (c.t === 'c' && (c.clues.length < 1 || c.clues.length > 2)) fail('clue cell size ' + k); });
  p.words.forEach((w) => {
    const cc = p.cells[w.cr * p.W + w.cc]; if (cc.t !== 'c' || !cc.clues.includes(w.id)) fail('word without clue cell ' + k);
    if (w.len < 2) fail('short word ' + k);
  });
  if (p.cells.filter((c) => c.given).length < 3) fail('few givens ' + k);
}
if (empty) fail(empty + ' puzzles with empty squares');
if (Object.keys(sizes).length < 4) fail('sizes do not vary ' + JSON.stringify(sizes));
// coverage
for (let n = 1; n <= PACK_INFO.main; n++) if (!PACK['main-' + n]) fail('missing main-' + n);
for (let d = new Date(PACK_INFO.dailyFrom + 'T00:00:00Z'); d <= new Date(PACK_INFO.dailyTo + 'T00:00:00Z'); d = new Date(d.getTime() + 86400000)) {
  const s = d.toISOString().slice(0, 10); if (!PACK['daily-' + s]) fail('missing daily ' + s);
}
for (const ev of EVENTS) for (let i = 0; i < EVENT_PUZZLES; i++) if (!PACK[`ev-${ev.id}-${i}`]) fail('missing event ' + ev.id + i);
for (let i = 1; i <= PACK_INFO.online; i++) if (!PACK['online-' + i]) fail('missing online-' + i);
buildPuzzle(specMain(PACK_INFO.main + 7)); buildPuzzle(specDaily('2030-01-01')); buildPuzzle({ kind: 'online', seed: randomOnlineSeed() });
console.log('pack ok', keys.length, 'puzzles', sizes);
