// Offline puzzle generator: every cell is a letter or a clue cell (no empty squares).
// 1) draw a clue/letter template that obeys the arrow-crossword rules, 2) fill it with Bible words by backtracking.
// Deterministic for a given seed + bank. Used by tools/make-pack.mjs to build js/pack.js; the app never runs it.
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
/** Clue cells that may clue a run: [cell index, arrow kind]. Kinds: s straight, u from above/left bent, v from below/right bent */
function clueOptions(run, T, W, H) {
  const k = run.cells[0], r = Math.floor(k / W), c = k % W, out = [];
  const add = (rr, cc, kind) => { if (rr >= 0 && rr < H && cc >= 0 && cc < W && T[rr * W + cc] === 1) out.push([rr * W + cc, kind]); };
  if (run.h) { add(r, c - 1, 's'); add(r - 1, c, 'u'); add(r + 1, c, 'v'); }
  else { add(r - 1, c, 's'); add(r, c - 1, 'u'); add(r, c + 1, 'v'); }
  return out;
}
/** Give every run a clue cell (max two per cell) so that every clue cell clues at least one run. */
export function assignClues(T, W, H) {
  const runs = runsOf(T, W, H), n = W * H;
  const opts = runs.map((r) => clueOptions(r, T, W, H));
  const cells = []; for (let k = 0; k < n; k++) if (T[k] === 1) cells.push(k);
  const slotOf = new Map(); // right nodes: cell*2+copy -> run index
  const matchR = new Map(), matchL = new Array(runs.length).fill(-1);
  const adjCell = new Map(cells.map((k) => [k, []]));
  opts.forEach((o, i) => o.forEach(([ck]) => adjCell.get(ck).push(i)));
  // step 1: each clue cell takes one run
  const seen = new Set(); let unsat = 0;
  const tryC = (ck, vis) => { for (const i of adjCell.get(ck)) { if (vis.has(i)) continue; vis.add(i); const cur = matchL[i]; if (cur < 0 || tryC(cur >> 1, vis)) { matchL[i] = ck * 2; return true; } } return false; };
  for (const ck of cells) { if (!tryC(ck, new Set())) unsat++; }
  // step 2: remaining runs go to a free second slot (or re-route)
  const copies = (i) => opts[i].flatMap(([ck]) => [ck * 2, ck * 2 + 1]);
  const owner = new Map(); matchL.forEach((v, i) => { if (v >= 0) owner.set(v, i); });
  const tryL = (i, vis) => { for (const node of copies(i)) { if (vis.has(node)) continue; vis.add(node); const cur = owner.get(node); if (cur === undefined || tryL(cur, vis)) { owner.set(node, i); matchL[i] = node; return true; } } return false; };
  let unplaced = 0;
  for (let i = 0; i < runs.length; i++) if (matchL[i] < 0 && !tryL(i, new Set())) unplaced++;
  return { runs, opts, matchL, unsat, unplaced };
}
export function templateCost(T, W, H, o) {
  const n = W * H; let cost = 0, nC = 0, two = 0;
  const cover = new Uint8Array(n);
  for (let k = 0; k < n; k++) if (T[k] === 1) nC++;
  const A = assignClues(T, W, H);
  cost += 3 * A.unplaced + 3 * A.unsat;
  for (const run of A.runs) { const len = run.cells.length; if (len > o.maxLen) cost += len - o.maxLen; if (len === 2) two++; run.cells.forEach((k) => cover[k]++); }
  for (let k = 0; k < n; k++) if (T[k] === 2 && !cover[k]) cost += 2; // a letter that belongs to no word
  if (two > o.maxTwo) cost += two - o.maxTwo;
  let cross = 0; for (let k = 0; k < n; k++) if (cover[k] > 1) cross++;
  const maxCross = Math.round((n - nC) * o.crossRatio); if (cross > maxCross) cost += cross - maxCross;
  if (nC < o.cLo) cost += (o.cLo - nC); if (nC > o.cHi) cost += (nC - o.cHi);
  return cost;
}
export function makeTemplate(W, H, rnd, o = {}) {
  o = { maxLen: 6, maxTwo: 2, crossRatio: 0.5, cLo: Math.round(W * H * 0.2), cHi: Math.round(W * H * 0.3), ...o };
  const n = W * H, dirs = [1, W, -1, -W];
  for (let restart = 0; restart < 12; restart++) {
    const T = new Uint8Array(n);
    for (let k = 0; k < n; k++) T[k] = rnd() < 0.25 ? 1 : 2;
    let cost = templateCost(T, W, H, o);
    const ITER = 12000;
    for (let it = 0; it < ITER && cost > 0; it++) {
      const temp = 1.0 * (1 - it / ITER) + 0.08;
      const k = Math.floor(rnd() * n); T[k] = 3 - T[k];
      let k2 = -1;
      if (rnd() < 0.4) { const d = dirs[Math.floor(rnd() * 4)], j = k + d; if (j >= 0 && j < n && Math.abs((j % W) - (k % W)) <= 1) { k2 = j; T[k2] = 3 - T[k2]; } }
      const c2 = templateCost(T, W, H, o);
      if (c2 <= cost || rnd() < Math.exp((cost - c2) / temp)) cost = c2;
      else { T[k] = 3 - T[k]; if (k2 >= 0) T[k2] = 3 - T[k2]; }
    }
    if (cost === 0) return T;
  }
  return null;
}

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
export function templatePool(W, H, count, seed) {
  const rnd = mulberry32(hashSeed('pool-' + seed + W + 'x' + H)), pool = [];
  let guard = 0;
  while (pool.length < count && guard++ < count * 6) {
    const T = makeTemplate(W, H, rnd, { maxLen: Math.max(W, H) - 1, crossRatio: 0.5 + 0.2 * rnd(), maxTwo: 1 + Math.floor(rnd() * 3) });
    if (T) pool.push(T);
  }
  return pool;
}

/** One puzzle: returns { W, H, words:[{ans,entry,dir,r,c,cr,cc,kind}], T } or null.
 *  weight(i): preference score per word index (tagged words, rarely used words). */
export function generate(F, { seed, W, H, pool, weightOf = null, minTagged = 0, isTagged = null, seconds = 30 }) {
  const rnd = mulberry32(hashSeed(seed));
  const deadline = Date.now() + seconds * 1000;
  const order = pool.map((_, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  for (let round = 0; round < 40 && Date.now() < deadline; round++) {
    for (const ti of order) {
      if (Date.now() > deadline) break;
      const T = pool[ti];
      const weight = weightOf ? Float32Array.from(F.words, (_, i) => weightOf(i) + rnd() * 0.01) : null;
      const res = fill(F, T, W, H, rnd, { weight, maxNodes: 5000, deadline });
      if (!res) continue;
      const A = assignClues(T, W, H);
      const words = res.slots.map((sl, i) => {
        const ck = A.matchL[i] >> 1, kind = A.opts[i].find((o) => o[0] === ck)[1];
        return { ans: F.words[sl.word].a, wi: sl.word, dir: sl.h ? 'a' : 'd', r: Math.floor(sl.cells[0] / W), c: sl.cells[0] % W, cr: Math.floor(ck / W), cc: ck % W, kind };
      });
      if (isTagged && minTagged && words.filter((w) => isTagged(w.wi)).length < minTagged) continue;
      return { W, H, T, words };
    }
  }
  return null;
}
