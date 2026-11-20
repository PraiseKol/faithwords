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

// ---- content drops: extra puzzle packs an admin publishes later (stored in the app_content table).
// A drop is { id, title, icon, from, to, puzzles: [{ W, H, words: [{a, c: clue, e: emoji, dir, r, col, cr, cc}], given: [], orn: [] }] }.
// (r, col) is the first letter's square, (cr, cc) the square that holds its clue and arrow.
// The server reads the same published drop, so a drop puzzle is verified exactly like a built-in one.
export const REMOTE = { drops: [] };
export const findDrop = (content, id) => ((content || REMOTE).drops || []).find((d) => d.id === id);
export function specDrop(drop, idx) { return { kind: 'drop', id: drop.id, idx, seed: `drop-${drop.id}-${idx}`, label: `${drop.title} ${idx + 1}/${drop.puzzles.length}` }; }
/** Is this drop open on a date (YYYY-MM-DD)? `graceDays` lets the server accept a puzzle started just before it closed. */
export function dropOpen(drop, today, graceDays = 0) {
  const day = (x) => Date.parse(x + 'T00:00:00Z'), t = day(today);
  return (!drop.from || t >= day(drop.from) - graceDays * 86400000) && (!drop.to || t <= day(drop.to) + graceDays * 86400000);
}
/** null when the puzzle is a well-formed arrow crossword, otherwise a plain-English problem. */
export function validateDropPuzzle(d) {
  if (!d || !Number.isInteger(d.W) || !Number.isInteger(d.H) || d.W < 4 || d.H < 4 || d.W > 12 || d.H > 14) return 'grid size must be 4–12 wide and 4–14 tall';
  if (!Array.isArray(d.words) || d.words.length < 3 || d.words.length > 60) return 'needs 3–60 words';
  const { W, H } = d, kind = new Array(W * H).fill(0), ch = new Array(W * H).fill(''); // 0 empty, 1 letter, 2 clue
  const inside = (r, c) => Number.isInteger(r) && Number.isInteger(c) && r >= 0 && c >= 0 && r < H && c < W;
  for (const w of d.words) {
    if (!/^[A-Z]{1,9}$/.test(w.a || '')) return `"${w.a}" must be 1–9 capital letters`;
    if (typeof w.c !== 'string' || w.c.length > 120 || (typeof w.e !== 'string' && w.e != null) || (w.e || '').length > 8) return `bad clue for ${w.a}`;
    if (!w.c && !w.e) return `${w.a} needs a clue or a picture`;
    if (w.dir !== 'a' && w.dir !== 'd') return `${w.a}: direction must be a or d`;
    if (!inside(w.r, w.col)) return `${w.a}: start square is outside the grid`;
    if (!inside(w.cr, w.cc)) return `${w.a}: clue square is outside the grid`;
    for (let i = 0; i < w.a.length; i++) {
      const r = w.r + (w.dir === 'd' ? i : 0), c = w.col + (w.dir === 'a' ? i : 0);
      if (!inside(r, c)) return `${w.a} runs off the grid`;
      const k = r * W + c;
      if (kind[k] === 2) return `${w.a} sits on a clue square`;
      if (kind[k] === 1 && ch[k] !== w.a[i]) return `${w.a} crosses another word with a different letter`;
      kind[k] = 1; ch[k] = w.a[i];
    }
  }
  const clueAt = new Map();
  for (const w of d.words) { const k = w.cr * W + w.cc; if (kind[k] === 1) return `${w.a}: its clue square is covered by a letter`; kind[k] = 2; clueAt.set(k, (clueAt.get(k) || 0) + 1); }
  for (const n of clueAt.values()) if (n > 2) return 'a clue square can hold at most two clues';
  for (const k of d.orn || []) { if (!(Number.isInteger(k) && kind[k] === 0)) return 'an ornament square must be an otherwise empty square'; kind[k] = 3; }
  if (kind.some((x) => x === 0)) { const k = kind.indexOf(0); return `square ${Math.floor(k / W) + 1},${(k % W) + 1} is empty (every square needs a letter or a clue)`; }
  for (const k of d.given || []) if (!(Number.isInteger(k) && kind[k] === 1)) return 'a given square must be a letter square';
  return null;
}
export function checkDrop(dr) {
  if (!dr || typeof dr !== 'object') return 'not a pack';
  if (!/^[a-z0-9-]{2,30}$/.test(dr.id || '')) return 'id must be 2–30 lowercase letters, digits or dashes';
  if (typeof dr.title !== 'string' || !dr.title || dr.title.length > 30) return 'title is required (30 characters max)';
  if (!Array.isArray(dr.puzzles) || dr.puzzles.length < 1 || dr.puzzles.length > 60) return 'a pack needs 1–60 puzzles';
  for (const f of ['from', 'to']) if (dr[f] && !/^\d{4}-\d{2}-\d{2}$/.test(dr[f])) return f + ' must look like 2026-12-01';
  for (let i = 0; i < dr.puzzles.length; i++) { const e = validateDropPuzzle(dr.puzzles[i]); if (e) return `puzzle ${i + 1}: ${e}`; }
  if (JSON.stringify(dr).length > 180000) return 'pack is too large';
  return null;
}
function assemble(key, W, H, defs, given, orn, seed) {
  const cells = Array.from({ length: W * H }, () => ({ t: 'x' }));
  const words = defs.map((x, id) => {
    const len = x.a.length, cs = [];
    for (let i = 0; i < len; i++) {
      const k = (x.r + (x.dir === 'd' ? i : 0)) * W + x.col + (x.dir === 'a' ? i : 0);
      cs.push(k); cells[k] = { t: 'l', ch: x.a[i] };
    }
    return { id, ans: x.a, clue: x.c, emoji: x.e, tags: x.tags || [], entry: x.entry, dir: x.dir, r: x.r, c: x.col, cr: x.cr, cc: x.cc, kind: x.kind || 's', len, cells: cs };
  });
  words.forEach((w) => {
    const k = w.cr * W + w.cc;
    if (cells[k].t !== 'c') cells[k] = { t: 'c', clues: [] };
    cells[k].clues.push(w.id);
  });
  (orn || []).forEach((k) => { cells[k] = { t: 'o' }; }); // the one clue-coloured ornament square (nothing to clue there)
  (given || []).forEach((k) => { cells[k].given = true; });
  if (cells.some((c) => c.t === 'x')) throw new Error('puzzle ' + key + ' has an empty square');
  return { seed, key, W, H, cells, words, letterCount: cells.filter((c) => c.t === 'l').length };
}

export function buildPuzzle(spec, content = REMOTE) {
  if (spec.kind === 'drop') {
    const drop = findDrop(content, spec.id), def = drop?.puzzles?.[spec.idx];
    if (!def) throw new Error('unknown content drop ' + spec.seed);
    const err = validateDropPuzzle(def); if (err) throw new Error('drop ' + spec.seed + ': ' + err);
    return assemble(spec.seed, def.W, def.H, def.words.map((x, i) => ({ ...x, entry: `drop:${spec.id}:${spec.idx}:${i}` })), def.given, def.orn, spec.seed);
  }
  const key = packKey(spec);
  const [W, H, wl, given, orn = []] = PACK[key];
  const defs = wl.map(([entry, dir, r, c, cr, cc, kind]) => { const e = BANK[entry]; return { a: e.a, c: e.c, e: e.e, tags: e.tags, entry, dir, r, col: c, cr, cc, kind }; });
  return assemble(key, W, H, defs, given, orn, spec.seed);
}
