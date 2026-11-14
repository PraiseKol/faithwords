// Pure game rules: board, racks, scoring, bot. No DOM here (so it can be tested in Node).
import { CONFIG } from './config.js';
import { W, H } from './generator.js';

export function newGame(puzzle, { botLevel = 1 } = {}) {
  const board = puzzle.cells.map((c) => ({ ch: c.t === 'l' && c.given ? c.ch : null, by: c.t === 'l' && c.given ? 'given' : null }));
  const cellWords = {};
  puzzle.words.forEach((w) => wordCells(w).forEach((k) => (cellWords[k] ||= []).push(w.id)));
  const st = {
    puzzle, board, cellWords, botLevel,
    scores: { you: 0, opp: 0 }, turn: 'you', placed: 0, rackAtStart: 0,
    racks: { you: [], opp: [] }, over: false, quota: 0, passes: 0,
    log: [], // every action: [who, type, arg, time] — the server replays this to verify results
  };
  refill(st, 'you'); refill(st, 'opp');
  st.rackAtStart = st.racks.you.length;
  return st;
}

/** type: p place(cell) · e end turn · r reveal word(id) · s paid swap · x free swap · h hint */
export const logMove = (st, who, t, k = 0) => { st.log.push([who, t, k, Date.now()]); };

export const wordCells = (w) => {
  const out = [];
  for (let i = 0; i < w.len; i++) out.push((w.r + (w.dir === 'd' ? i : 0)) * W + w.c + (w.dir === 'a' ? i : 0));
  return out;
};
export const isLetterCell = (st, k) => st.puzzle.cells[k].t === 'l';
export const solution = (st, k) => st.puzzle.cells[k].ch;

export function remaining(st) {
  const m = {};
  st.puzzle.cells.forEach((c, k) => { if (c.t === 'l' && !st.board[k].ch) m[c.ch] = (m[c.ch] || 0) + 1; });
  return m;
}
export const emptyCount = (st) => st.puzzle.cells.reduce((n, c, k) => n + (c.t === 'l' && !st.board[k].ch ? 1 : 0), 0);
export const targets = (st, letter) => st.puzzle.cells.reduce((a, c, k) => (c.t === 'l' && !st.board[k].ch && c.ch === letter ? (a.push(k), a) : a), []);

export function draw(st, who, n, avoid = []) {
  const rem = remaining(st);
  st.racks[who].forEach((l) => { if (rem[l]) rem[l]--; });
  let bag = [];
  Object.entries(rem).forEach(([l, c]) => { for (let i = 0; i < c; i++) bag.push(l); });
  let pool = bag.filter((l) => !avoid.includes(l));
  if (pool.length < n) pool = bag;
  const out = [];
  for (let i = 0; i < n && pool.length; i++) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}
export function refill(st, who, avoid = []) {
  const need = CONFIG.tilesPerRack - st.racks[who].length;
  if (need > 0) st.racks[who].push(...draw(st, who, need, avoid));
}
export function trimRacks(st) {
  const rem = remaining(st);
  ['you', 'opp'].forEach((who) => {
    const used = {};
    st.racks[who] = st.racks[who].filter((l) => { used[l] = (used[l] || 0) + 1; return used[l] <= (rem[l] || 0); });
  });
}

function wordDone(st, w) { return wordCells(w).every((k) => st.board[k].ch); }

/** Place a tile. Returns {ok, points, completed:[wordIds]} */
export function place(st, who, letter, cell) {
  if (st.over || st.turn !== who) return { ok: false };
  const ri = st.racks[who].indexOf(letter);
  if (ri < 0) return { ok: false };
  const c = st.puzzle.cells[cell];
  if (c.t !== 'l' || st.board[cell].ch || c.ch !== letter) return { ok: false, wrong: true };
  st.board[cell] = { ch: letter, by: who };
  logMove(st, who, 'p', cell);
  st.racks[who].splice(ri, 1);
  st.placed++;
  let points = 1;
  const completed = [];
  (st.cellWords[cell] || []).forEach((id) => {
    const w = st.puzzle.words[id];
    if (wordDone(st, w)) { points += w.len; completed.push(id); }
  });
  st.scores[who] += points;
  trimRacks(st);
  if (emptyCount(st) === 0) st.over = true;
  return { ok: true, points, completed };
}

/** Power-up: fill a whole word for free (no points). */
export function revealWord(st, who, wordId) {
  const w = st.puzzle.words[wordId];
  logMove(st, who, 'r', wordId);
  let n = 0;
  wordCells(w).forEach((k) => { if (!st.board[k].ch) { st.board[k] = { ch: st.puzzle.cells[k].ch, by: 'rev' }; n++; } });
  trimRacks(st);
  if (emptyCount(st) === 0) st.over = true;
  return n;
}

export function swap(st, who, letters, paid = true) {
  logMove(st, who, paid ? 's' : 'x');
  letters.forEach((l) => { const i = st.racks[who].indexOf(l); if (i >= 0) st.racks[who].splice(i, 1); });
  refill(st, who, letters);
}

/** End the current turn. Returns {bonus} */
export function endTurn(st) {
  const who = st.turn;
  logMove(st, who, 'e');
  let bonus = 0;
  if (st.placed >= CONFIG.tilesPerRack && st.rackAtStart >= CONFIG.tilesPerRack) {
    bonus = CONFIG.allTilesBonus;
    st.scores[who] += bonus;
  }
  st.passes = st.placed === 0 ? st.passes + 1 : 0;
  if (emptyCount(st) === 0 || st.passes >= 6) st.over = true;
  st.turn = who === 'you' ? 'opp' : 'you';
  st.placed = 0;
  trimRacks(st);
  refill(st, st.turn);
  st.rackAtStart = st.racks[st.turn].length;
  if (st.turn === 'opp') {
    const p = Math.min(0.85, 0.4 + 0.04 * st.botLevel);
    st.quota = 0;
    st.racks.opp.forEach(() => { if (Math.random() < p) st.quota++; });
    if (st.quota === 0) st.quota = 1;
  }
  return { bonus };
}

/** One bot move. Returns {letter, cell} or null when the bot is done. */
export function botStep(st) {
  if (st.placed >= st.quota) return null;
  const options = [];
  [...new Set(st.racks.opp)].forEach((l) => targets(st, l).forEach((k) => options.push({ letter: l, cell: k })));
  if (!options.length) return null;
  const smart = Math.random() < Math.min(0.7, 0.15 + 0.05 * st.botLevel);
  if (smart) {
    // prefer a cell that completes a word
    const score = (o) => (st.cellWords[o.cell] || []).reduce((s, id) => {
      const left = wordCells(st.puzzle.words[id]).filter((k) => !st.board[k].ch).length;
      return s + (left === 1 ? 10 : 0);
    }, 0);
    options.sort((a, b) => score(b) - score(a));
    return options[0];
  }
  return options[Math.floor(Math.random() * options.length)];
}

export { levelFromXp } from './progress.js';

export function serialize(st) { return JSON.stringify({ ...st, puzzle: undefined, seed: st.puzzle.seed }); }
