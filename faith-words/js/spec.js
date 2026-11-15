// Puzzle specs and puzzle building. Pure (no DOM, no storage) so the server runs the exact same code.
// Every puzzle comes from the fixed set in pack.js (made once by tools/make-pack.mjs), so each level,
// daily puzzle and event puzzle is identical for all players, on every device and on the server.
import { BANK } from './bank.js';
import { PACK, PACK_INFO } from './pack.js';
import { EVENTS, EVENT_PUZZLES } from './config.js';
import { hashSeed } from './rng.js';

export function specMain(n) { return { kind: 'main', n, seed: 'main-' + n, label: 'Puzzle ' + n }; }
export function specDaily(date) {
  const d = new Date(date + 'T00:00:00');
  return { kind: 'daily', date, seed: 'daily-' + date, label: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) };
}
export function specEvent(id, idx) {
  const ev = EVENTS.find((e) => e.id === id);
  return { kind: 'event', id, idx, seed: `ev-${id}-${idx}`, focusTag: ev.tag, label: `${ev.name} ${idx + 1}/${EVENT_PUZZLES}` };
}
export const randomOnlineSeed = () => 'online-' + (1 + Math.floor(Math.random() * PACK_INFO.online));
export const validOnlineSeed = (s) => /^online-\d+$/.test(s) && PACK[s] !== undefined;

/** Which stored puzzle a spec uses (levels past the last one repeat the set; dates outside the calendar pick a stored one). */
export function packKey(spec) {
  if (PACK[spec.seed]) return spec.seed;
  if (spec.kind === 'main') return 'main-' + (((spec.n - 1) % PACK_INFO.main) + 1);
  return 'main-' + (1 + (hashSeed(spec.seed) % PACK_INFO.main));
}

export function buildPuzzle(spec) {
  const key = packKey(spec);
  const [W, H, wl, given, orn = []] = PACK[key];
  const cells = Array.from({ length: W * H }, () => ({ t: 'x' }));
  const words = wl.map(([entry, dir, r, c, cr, cc, kind], id) => {
    const e = BANK[entry], len = e.a.length, cs = [];
    for (let i = 0; i < len; i++) {
      const k = (r + (dir === 'd' ? i : 0)) * W + c + (dir === 'a' ? i : 0);
      cs.push(k); cells[k] = { t: 'l', ch: e.a[i] };
    }
    return { id, ans: e.a, clue: e.c, emoji: e.e, entry, dir, r, c, cr, cc, kind, len, cells: cs };
  });
  words.forEach((w) => {
    const k = w.cr * W + w.cc;
    if (cells[k].t !== 'c') cells[k] = { t: 'c', clues: [] };
    cells[k].clues.push(w.id);
  });
  orn.forEach((k) => { cells[k] = { t: 'o' }; }); // the one clue-coloured ornament square (nothing to clue there)
  given.forEach((k) => { cells[k].given = true; });
  if (cells.some((c) => c.t === 'x')) throw new Error('puzzle ' + key + ' has an empty square');
  return { seed: spec.seed, key, W, H, cells, words, letterCount: cells.filter((c) => c.t === 'l').length };
}
