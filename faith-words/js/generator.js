// Arrow-crossword generator (7 x 10 board, like Crossword Master).
// Deterministic: the same seed + bank always gives the same puzzle.
export const W = 7;
export const H = 10;

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function hashSeed(s) {
  let h = 2166136261;
  for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

function buildPhase(answers) {
  const byLetter = {};
  answers.forEach((ans) => {
    for (let i = 0; i < ans.length; i++) (byLetter[ans[i]] ||= []).push([ans, i]);
  });
  return { answers, byLetter };
}

function tryPlace(st, ans, dir, r, c, needCross) {
  const L = ans.length;
  const dr = dir === 'd' ? 1 : 0, dc = dir === 'a' ? 1 : 0;
  const cr = r - dr, cc = c - dc;
  if (r < 0 || c < 0 || cr < 0 || cc < 0) return false;
  if (r + dr * (L - 1) >= H || c + dc * (L - 1) >= W) return false;
  const ci = cr * W + cc;
  if (st.T[ci] === 2) return false;
  if (st.T[ci] === 1 && (dir === 'a' ? st.cA[ci] >= 0 : st.cD[ci] >= 0)) return false;
  const er = r + dr * L, ec = c + dc * L;
  if (er < H && ec < W && st.T[er * W + ec] === 2) return false;
  let cross = 0;
  for (let i = 0; i < L; i++) {
    const k = (r + dr * i) * W + c + dc * i;
    if (st.T[k] === 1) return false;
    if (st.T[k] === 2) { if (st.CH[k] !== ans.charCodeAt(i)) return false; cross++; }
  }
  if (cross === L) return false;
  if (needCross && cross === 0) return false;

  const T = st.T.slice(), CH = st.CH.slice(), cA = st.cA.slice(), cD = st.cD.slice();
  const widx = st.words.length;
  T[ci] = 1;
  if (dir === 'a') cA[ci] = widx; else cD[ci] = widx;
  const fresh = [];
  for (let i = 0; i < L; i++) {
    const k = (r + dr * i) * W + c + dc * i;
    if (T[k] !== 2) { T[k] = 2; CH[k] = ans.charCodeAt(i); fresh.push(k); }
  }
  // every run of 2+ letters must be a registered word
  const starts = new Map();
  st.words.forEach((w) => starts.set(w.dir + (w.r * W + w.c), w.ans.length));
  starts.set(dir + (r * W + c), L);
  for (let rr = 0; rr < H; rr++) {
    let cx = 0;
    while (cx < W) {
      if (T[rr * W + cx] !== 2) { cx++; continue; }
      let e = cx; while (e < W && T[rr * W + e] === 2) e++;
      if (e - cx >= 2 && starts.get('a' + (rr * W + cx)) !== e - cx) return false;
      cx = e;
    }
  }
  for (let cx = 0; cx < W; cx++) {
    let rr = 0;
    while (rr < H) {
      if (T[rr * W + cx] !== 2) { rr++; continue; }
      let e = rr; while (e < H && T[e * W + cx] === 2) e++;
      if (e - rr >= 2 && starts.get('d' + (rr * W + cx)) !== e - rr) return false;
      rr = e;
    }
  }
  st.T = T; st.CH = CH; st.cA = cA; st.cD = cD;
  st.words.push({ ans, dir, r, c, cr, cc });
  st.used.add(ans);
  fresh.forEach((k) => st.letters.push(k));
  return true;
}

export function generatePuzzle(bank, { seed, focusTag = null, tries = 40 } = {}) {
  const rnd = mulberry32(hashSeed(seed));
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const variants = {};
  bank.forEach((e) => (variants[e.a] ||= []).push(e));
  const allPhase = buildPhase(Object.keys(variants));
  const focusAnswers = focusTag ? [...new Set(bank.filter((e) => e.tags.includes(focusTag)).map((e) => e.a))] : [];
  const focusPhase = focusAnswers.length ? buildPhase(focusAnswers) : null;

  const runPhase = (st, phase, iters) => {
    for (let n = 0; n < iters; n++) {
      const k = pick(st.letters);
      const ch = String.fromCharCode(st.CH[k]);
      const pool = phase.byLetter[ch];
      if (!pool) continue;
      const [ans, idx] = pick(pool);
      if (st.used.has(ans)) continue;
      const dir = rnd() < 0.5 ? 'a' : 'd';
      const row = Math.floor(k / W), col = k % W;
      tryPlace(st, ans, dir, row - (dir === 'd' ? idx : 0), col - (dir === 'a' ? idx : 0), true);
    }
  };

  let best = null;
  for (let t = 0; t < tries; t++) {
    const st = {
      T: new Uint8Array(W * H), CH: new Uint8Array(W * H),
      cA: new Int8Array(W * H).fill(-1), cD: new Int8Array(W * H).fill(-1),
      words: [], used: new Set(), letters: [],
    };
    const firstPool = (focusPhase || allPhase).answers.filter((a) => a.length >= 4 && a.length <= 6);
    let ok = false;
    for (let i = 0; i < 50 && !ok; i++) {
      const ans = pick(firstPool);
      ok = tryPlace(st, ans, 'a', Math.floor(rnd() * H), 1 + Math.floor(rnd() * (W - ans.length)), false);
    }
    if (!ok) continue;
    if (focusPhase) runPhase(st, focusPhase, 3000);
    runPhase(st, allPhase, 6000);
    // gap filler: free-standing words that touch the grid only by adjacency rules
    for (let n = 0; n < 5000; n++) {
      const ans = pick(allPhase.answers);
      if (st.used.has(ans)) continue;
      const dir = rnd() < 0.5 ? 'a' : 'd';
      tryPlace(st, ans, dir, Math.floor(rnd() * H), Math.floor(rnd() * W), false);
    }
    runPhase(st, allPhase, 3000);
    if (!best || st.letters.length > best.letters.length) best = st;
    if (best.letters.length >= 46) break;
  }

  // ---- build the puzzle object
  const st = best;
  const words = st.words.map((w, id) => {
    const v = pick(variants[w.ans]);
    return { id, ans: w.ans, clue: v.c, emoji: v.e, entry: v.id, dir: w.dir, r: w.r, c: w.c, cr: w.cr, cc: w.cc, len: w.ans.length };
  });
  const cells = [];
  for (let k = 0; k < W * H; k++) {
    if (st.T[k] === 1) cells.push({ t: 'c', a: st.cA[k], d: st.cD[k] });
    else if (st.T[k] === 2) cells.push({ t: 'l', ch: String.fromCharCode(st.CH[k]) });
    else cells.push({ t: 'e' });
  }
  // pre-filled "given" letters: prefer crossings
  const count = new Array(W * H).fill(0);
  words.forEach((w) => {
    for (let i = 0; i < w.len; i++) count[(w.r + (w.dir === 'd' ? i : 0)) * W + w.c + (w.dir === 'a' ? i : 0)]++;
  });
  const cross = [], single = [];
  cells.forEach((c, k) => { if (c.t === 'l') (count[k] > 1 ? cross : single).push(k); });
  const givens = [];
  for (let i = 0; i < 4; i++) {
    const src = cross.length ? cross : single;
    if (!src.length) break;
    givens.push(src.splice(Math.floor(rnd() * src.length), 1)[0]);
  }
  givens.forEach((k) => (cells[k].given = true));
  return { seed: String(seed), W, H, cells, words, letterCount: st.letters.length };
}
