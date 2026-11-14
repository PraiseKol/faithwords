// Server-checkable replay of a match. Given the puzzle and the action log it re-plays every move
// with the real rules and returns the scores — nothing the phone says about points is trusted.
// Log entries: [who, type, arg, ms]  who = 0 (first player) | 1 (second player)
import { CONFIG } from './config.js';
import { W } from './generator.js';

const wordCellsOf = (w) => {
  const out = [];
  for (let i = 0; i < w.len; i++) out.push((w.r + (w.dir === 'd' ? i : 0)) * W + w.c + (w.dir === 'a' ? i : 0));
  return out;
};

export function replay(puzzle, log) {
  const cells = puzzle.cells;
  const have = cells.map((c) => c.t === 'l' && !!c.given);
  const cellWords = {};
  puzzle.words.forEach((w) => wordCellsOf(w).forEach((k) => (cellWords[k] ||= []).push(w.id)));
  let empty = cells.reduce((n, c, k) => n + (c.t === 'l' && !have[k] ? 1 : 0), 0);
  const out = { ok: true, err: null, scores: [0, 0], over: false, power: [{ h: 0, r: 0, s: 0 }, { h: 0, r: 0, s: 0 }], placed: [0, 0], turns: 0, spanMs: 0 };
  const fail = (m) => { out.ok = false; out.err = m; return out; };
  if (!Array.isArray(log) || log.length > 600) return fail('bad log');
  let turn = 0, placed = 0, passes = 0, lastTs = null, firstTs = null;
  for (const e of log) {
    if (!Array.isArray(e) || e.length < 4) return fail('bad entry');
    const [w, t, k, ts] = e;
    if (out.over) return fail('moves after the end');
    if (w !== turn) return fail('out of turn');
    if (!Number.isFinite(ts) || (lastTs != null && ts < lastTs)) return fail('bad time');
    if (firstTs == null) firstTs = ts; lastTs = ts;
    if (t === 'p') {
      if (!Number.isInteger(k) || k < 0 || k >= cells.length) return fail('bad cell');
      if (cells[k].t !== 'l' || have[k]) return fail('cell not open');
      if (++placed > CONFIG.tilesPerRack) return fail('too many tiles in a turn');
      have[k] = true; empty--; out.placed[w]++;
      let pts = 1;
      for (const id of cellWords[k] || []) {
        const ww = puzzle.words[id];
        if (wordCellsOf(ww).every((c) => have[c])) pts += ww.len;
      }
      out.scores[w] += pts;
      if (empty === 0) out.over = true;
    } else if (t === 'e') {
      if (placed >= CONFIG.tilesPerRack) out.scores[w] += CONFIG.allTilesBonus;
      passes = placed === 0 ? passes + 1 : 0;
      if (empty === 0 || passes >= 6) out.over = true;
      turn = 1 - turn; placed = 0; out.turns++;
    } else if (t === 'r') {
      const ww = puzzle.words[k];
      if (!ww) return fail('bad word');
      wordCellsOf(ww).forEach((c) => { if (!have[c]) { have[c] = true; empty--; } });
      out.power[w].r++;
      if (empty === 0) out.over = true;
    } else if (t === 's') out.power[w].s++;
    else if (t === 'h') out.power[w].h++;
    else if (t !== 'x') return fail('unknown action');
  }
  out.spanMs = firstTs == null ? 0 : lastTs - firstTs;
  return out;
}

/** Phone log ('you'/'opp' entries) -> absolute log (0 = first player). role is 0 for you-first games. */
export function absLog(log, role = 0) {
  return log.map(([w, t, k, ts]) => [w === 'you' ? role : w === 'opp' ? 1 - role : w, t, k, ts]);
}
export function relLog(log, role = 0) {
  return log.map(([w, t, k, ts]) => [w === role ? 'you' : 'opp', t, k, ts]);
}
