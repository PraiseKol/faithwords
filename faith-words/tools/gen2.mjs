// Offline puzzle generator: every cell is a letter or a clue cell (no empty squares).
// 1) draw a clue/letter template that obeys the arrow-crossword rules, 2) fill it with Bible words by backtracking.
// Deterministic for a given seed + bank. Used by tools/make-pack.mjs to build js/pack.js; the app never runs it.
import fs from 'node:fs';
import { BANK } from '../js/bank.js';
import { mulberry32, hashSeed } from '../js/rng.js';

const LETTERS = 26;
export function wordList(bank = BANK) {
  const by = new Map();
  for (const e of bank) { if (/^[A-Z]{2,9}$/.test(e.a) && !by.has(e.a)) by.set(e.a, e); }
  return [...by.values()];
}

// ---------- templates
// A word may be clued from the cell before it (straight arrow) or, at a corner or edge, from the cell beside it
// (bent arrow). Each clue cell holds one or two clues.
export function runsOf(T, W, H) {
  const runs = []; // {cells:[k...], h}
  for (let r = 0; r < H; r++) { let s = -1; for (let c = 0; c <= W; c++) { const L = c < W && T[r * W + c] === 2; if (L && s < 0) s = c; if (!L && s >= 0) { if (c - s >= 2) runs.push({ h: true, cells: Array.from({ length: c - s }, (_, i) => r * W + s + i) }); s = -1; } } }
  for (let c = 0; c < W; c++) { let s = -1; for (let r = 0; r <= H; r++) { const L = r < H && T[r * W + c] === 2; if (L && s < 0) s = r; if (!L && s >= 0) { if (r - s >= 2) runs.push({ h: false, cells: Array.from({ length: r - s }, (_, i) => (s + i) * W + c) }); s = -1; } } }
  return runs;
}
/** Letters that belong to no word of 2+ letters. Each is a one-letter answer clued from the cell left of it or above it.
 *  Returns {singles:[{cell, clueCell, dir}], orn:[cells]} — orn = clue-coloured cells left with nothing to clue (ornaments). */
export function singlesOf(T, W, H) {
  const n = W * H, runs = runsOf(T, W, H), cov = new Uint8Array(n);
  runs.forEach((r) => r.cells.forEach((k) => cov[k]++));
  const orphans = []; for (let k = 0; k < n; k++) if (T[k] === 2 && !cov[k]) orphans.push(k);
  const clued = new Set(runs.map((r) => (r.h ? r.cells[0] - 1 : r.cells[0] - W)));
  const needy = []; for (let k = 0; k < n; k++) if (T[k] === 1 && !clued.has(k)) needy.push(k);
  const opts = (o) => { const out = []; if (o % W > 0 && T[o - 1] === 1) out.push([o - 1, 'a']); if (o >= W && T[o - W] === 1) out.push([o - W, 'd']); return out; };
  const take = new Map(); // orphan -> [clueCell, dir]
  const owner = new Map(); // clue cell -> orphan
  const tryAssign = (cc, seen) => { // cc needs an orphan to its right or below
    for (const [o, dir] of [[cc + 1, 'a'], [cc + W, 'd']]) {
      if (!orphans.includes(o) || seen.has(o)) continue; if (dir === 'a' && (cc % W) + 1 >= W) continue;
      seen.add(o); const cur = take.get(o);
      if (!cur || tryAssign(cur[0], seen)) { take.set(o, [cc, dir]); owner.set(cc, o); return true; }
    }
    return false;
  };
  const orn = []; for (const cc of needy) if (!tryAssign(cc, new Set())) orn.push(cc);
  const singles = orphans.map((o) => { const t = take.get(o) || opts(o)[0]; return t ? { cell: o, clueCell: t[0], dir: t[1] } : null; });
  if (singles.some((x) => !x)) return null;
  return { singles, orn };
}

/** Strict rule: an across word is clued by the cell directly left of it, a down word by the cell directly above it. */
export const clueCellOf = (run, W) => (run.h ? run.cells[0] - 1 : run.cells[0] - W);

// ---------- filling
export function makeFiller(words) {
  const nW = words.length, chunks = Math.ceil(nW / 32);
  const lenMask = {}, posMask = {}; // posMask[len][pos*26+letter] -> Uint32Array
  words.forEach((e, i) => {
    const L = e.a.length;
    (lenMask[L] ||= new Uint32Array(chunks))[i >> 5] |= 1 << (i & 31);
    const pm = (posMask[L] ||= Array.from({ length: L * LETTERS }, () => new Uint32Array(chunks)));
    for (let p = 0; p < L; p++) pm[p * LETTERS + e.a.charCodeAt(p) - 65][i >> 5] |= 1 << (i & 31);
  });
  const pop = (x) => { x -= (x >>> 1) & 0x55555555; x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24; };
  return { words, nW, chunks, lenMask, posMask, pop };
}

export function fill(F, T, W, H, rnd, { weight = null, maxNodes = 60000, deadline = Infinity } = {}) {
  const { words, chunks, lenMask, posMask, pop } = F;
  const n = W * H, runs = runsOf(T, W, H);
  const slots = runs.map((r) => ({ ...r, len: r.cells.length, word: -1 }));
  const cellSlots = Array.from({ length: n }, () => []);
  slots.forEach((s, i) => s.cells.forEach((k) => cellSlots[k].push(i)));
  const letters = new Int8Array(n).fill(-1);
  const used = new Uint32Array(chunks);
  const tmp = new Uint32Array(chunks);
  let nodes = 0;

  function cand(s, out) { // candidate bitset of slot s given the letters on the board
    const lm = lenMask[s.len]; if (!lm) { out.fill(0); return 0; }
    for (let i = 0; i < chunks; i++) out[i] = lm[i] & ~used[i];
    const pm = posMask[s.len];
    for (let p = 0; p < s.len; p++) { const ch = letters[s.cells[p]]; if (ch >= 0) { const m = pm[p * LETTERS + ch]; for (let i = 0; i < chunks; i++) out[i] &= m[i]; } }
    let c = 0; for (let i = 0; i < chunks; i++) c += pop(out[i]); return c;
  }
  function solve() {
    if (++nodes > maxNodes || (nodes & 255) === 0 && Date.now() > deadline) return false;
    let best = -1, bestC = 1e9;
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].word >= 0) continue;
      const c = cand(slots[i], tmp);
      if (c < bestC) { bestC = c; best = i; if (c <= 1) break; }
    }
    if (best < 0) return true;
    if (bestC === 0) return false;
    const s = slots[best], bits = new Uint32Array(chunks); cand(s, bits);
    const opts = [];
    for (let i = 0; i < chunks; i++) { let b = bits[i]; while (b) { const t = b & -b; opts.push(i * 32 + 31 - Math.clz32(t)); b ^= t; } }
    for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    if (weight) opts.sort((a, b) => weight[b] - weight[a]);
    for (const w of opts.slice(0, 40)) {
      const a = words[w].a, changed = [];
      for (let p = 0; p < s.len; p++) { const k = s.cells[p]; if (letters[k] < 0) { letters[k] = a.charCodeAt(p) - 65; changed.push(k); } }
      s.word = w; used[w >> 5] |= 1 << (w & 31);
      let ok = true;
      for (const k of changed) { for (const o of cellSlots[k]) if (slots[o].word < 0 && cand(slots[o], tmp) === 0) { ok = false; break; } if (!ok) break; }
      if (ok && solve()) return true;
      s.word = -1; used[w >> 5] &= ~(1 << (w & 31)); changed.forEach((k) => (letters[k] = -1));
      if (nodes > maxNodes) return false;
    }
    return false;
  }
  return solve() ? { slots, letters } : null;
}

/** Build a pool of legal templates for one board size (reused by many puzzles). */
export function templatePool(W, H) {
  const all = JSON.parse(fs.readFileSync(new URL('./templates.json', import.meta.url), 'utf8'))[W + 'x' + H] || [];
  return all.map((t) => { const T = Uint8Array.from(t.g.replace(/\//g, '').split('').map((ch) => (ch === '#' ? 1 : 2))); T.dead = t.d; return T; });
}

/** One puzzle: returns { W, H, words:[{ans,entry,dir,r,c,cr,cc,kind}], T } or null.
 *  weight(i): preference score per word index (tagged words, rarely used words). */
export function generate(F, { seed, W, H, pool, weightOf = null, minTagged = 0, isTagged = null, seconds = 30, singleBank = [], singleTag = null }) {
  const rnd = mulberry32(hashSeed(seed));
  const deadline = Date.now() + seconds * 1000;
  const order = pool.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  order.sort((a, b) => pool[a].dead - pool[b].dead); // fewest ornament squares first
  for (let round = 0; round < 40 && Date.now() < deadline; round++) {
    for (const ti of order) {
      if (Date.now() > deadline) break;
      const T = pool[ti];
      const weight = weightOf ? Float32Array.from(F.words, (_, i) => weightOf(i) + rnd() * 0.01) : null;
      const res = fill(F, T, W, H, rnd, { weight, maxNodes: 5000, deadline });
      if (!res) continue;
      const words = res.slots.map((sl) => {
        const ck = clueCellOf({ h: sl.h, cells: sl.cells }, W);
        return { ans: F.words[sl.word].a, wi: sl.word, dir: sl.h ? 'a' : 'd', r: Math.floor(sl.cells[0] / W), c: sl.cells[0] % W, cr: Math.floor(ck / W), cc: ck % W, kind: 's' };
      });
      if (isTagged && minTagged && words.filter((w) => isTagged(w.wi)).length < minTagged) continue;
      // lone letters are one-letter answers with a riddle clue of their own
      const sg = singlesOf(T, W, H); if (!sg) continue;
      const usedClue = new Set(), usedEntry = new Set(), singles = [];
      let ok = true;
      for (const sl of sg.singles) {
        let opts = singleBank.filter((e) => !usedEntry.has(e.id) && !usedClue.has(e.c));
        if (singleTag) { const t = opts.filter((e) => e.tags.includes(singleTag)); if (t.length && rnd() < 0.6) opts = t; }
        if (!opts.length) { ok = false; break; }
        const e = opts[Math.floor(rnd() * opts.length)]; usedEntry.add(e.id); usedClue.add(e.c);
        singles.push({ entry: e.id, ans: e.a, dir: sl.dir, cell: sl.cell, clueCell: sl.clueCell });
      }
      if (!ok) continue;
      return { W, H, T, words, singles, orn: sg.orn };
    }
  }
  return null;
}
