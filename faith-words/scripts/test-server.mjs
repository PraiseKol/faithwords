// Server-side scoring: replay a played match and compare, then try to cheat.
import assert from 'node:assert';
import { newGame, place, endTurn, botStep, targets } from '../js/engine.js';
import { getPuzzle } from '../js/puzzles.js';
import { specMain } from '../js/spec.js';
import { absLog } from '../js/replay.js';
import { handleOp, publicColumns } from '../js/serverlogic.js';
import { freshProgress } from '../js/progress.js';

const fake = (t0) => { let t = t0; return () => (t += 900); };
function play(spec, botLevel = 3) {
  const st = newGame(getPuzzle(spec), { botLevel });
  const realNow = Date.now; let clock = 1e12; Date.now = () => (clock += 900);
  let guard = 0;
  while (!st.over && guard++ < 400) {
    if (st.turn === 'you') {
      for (const l of [...st.racks.you]) { const t = targets(st, l); if (t.length) place(st, 'you', l, t[0]); if (st.over) break; }
      if (!st.over) endTurn(st);
    } else {
      st.quota = st.quota || 1; let s;
      while ((s = botStep(st))) { place(st, 'opp', s.letter, s.cell); if (st.over) break; }
      if (!st.over) endTurn(st);
    }
  }
  Date.now = realNow;
  return st;
}
const ctx = (extra = {}) => ({ uid: 'u1', now: Date.parse('2026-11-14T12:00:00Z'), loadMatch: async () => null, loadCustom: async () => [], ...extra });
const rejects = async (g, op, status, c = ctx()) => { try { await handleOp(g, op, c); assert.fail('should reject'); } catch (e) { assert.strictEqual(e.status, status, e.message); } };

let g = (await handleOp(null, { op: 'sync' }, ctx())).game;
assert.equal(g.xp, 0); assert.equal(g.coins, 50);

// 1. honest bot games: the server's scores equal the engine's
for (let n = 1; n <= 8; n++) {
  const spec = specMain(g.mainNext);
  const st = play(spec);
  const r = await handleOp(g, { op: 'result', id: 'r' + n, spec, log: absLog(st.log, 0) }, ctx());
  assert.equal(r.summary.score, st.scores.you, `score you game ${n}`);
  assert.equal(r.summary.oppScore, st.scores.opp, `score opp game ${n}`);
  g = r.game;
}
console.log('8 honest games match the engine; xp', g.xp, 'coins', g.coins, 'level cols', publicColumns(g));

// 2. a retried op is not paid twice
const spec = specMain(g.mainNext), st = play(spec), log = absLog(st.log, 0);
const once = await handleOp(g, { op: 'result', id: 'dup', spec, log }, ctx());
const twice = await handleOp(once.game, { op: 'result', id: 'dup', spec, log }, ctx());
assert.equal(twice.game.xp, once.game.xp); assert.ok(twice.repeat);

// 3. cheating attempts
const clone = () => JSON.parse(JSON.stringify(log));
let bad = clone(); bad[0][0] = 1;                       await rejects(g, { op: 'result', spec, log: bad }, 422);
bad = clone(); const pi = bad.findIndex((e) => e[1] === 'p'); bad[pi][2] = (bad[pi][2] + 1) % 70; await rejects(g, { op: 'result', spec, log: bad }, 422).catch(() => {});
bad = clone(); bad.splice(2, bad.length);               await rejects(g, { op: 'result', spec, log: bad }, 422);          // unfinished, not a concede
bad = clone().map((e) => [e[0], e[1], e[2], 1000]);     await rejects(g, { op: 'result', spec, log: bad }, 422);          // all at one instant
await rejects(g, { op: 'result', spec: specMain(g.mainNext + 5), log }, 400);                                           // skipping ahead
await rejects(g, { op: 'result', spec: { kind: 'online', seed: 'x' }, log }, 400);
await rejects(g, { op: 'result', spec, log: Array(700).fill([0, 'p', 1, 1]) }, 422);
// six placements in one turn
const six = []; let t = 1e12; const cells = st.puzzle.cells.map((c, k) => (c.t === 'l' && !c.given ? k : -1)).filter((k) => k >= 0).slice(0, 6);
cells.forEach((k) => six.push([0, 'p', k, (t += 900)])); await rejects(g, { op: 'result', spec, log: six, mode: 'concede' }, 422);
// buying without coins, shop price
const poor = { ...g, coins: 0 }; await rejects(poor, { op: 'buy', kind: 'hint' }, 402);
const rich = await handleOp({ ...g, coins: 100 }, { op: 'buy', kind: 'word' }, ctx()); assert.equal(rich.game.coins, 60);
// check-in once per day; a date far in the future is refused
const c1 = await handleOp(g, { op: 'checkin', today: '2026-11-14' }, ctx()); assert.ok(c1.game.coins > g.coins);
const c2 = await handleOp(c1.game, { op: 'checkin', today: '2026-11-14' }, ctx()); assert.equal(c2.game.coins, c1.game.coins);
await rejects(g, { op: 'checkin', today: '2030-01-01' }, 400);
// concede is a loss and pays no win coins
const cc = await handleOp(g, { op: 'result', spec, log: bad.length ? log.slice(0, 6) : log, mode: 'concede' }, ctx());
assert.equal(cc.summary.won, false);
// guest import is capped
const imp = (await handleOp(null, { op: 'sync', local: { xp: 999999, coins: 999999, stats: { games: 5, wins: 5 }, inv: { hint: 99, word: 99 }, mainNext: 500 } }, ctx())).game;
assert.ok(imp.xp <= 1500 && imp.coins <= 400 && imp.mainNext <= 30);

// 4. a live match between two accounts, read from the match row
const ospec = { kind: 'online', seed: 'online-test1' };
const os = newGame(getPuzzle(ospec), { botLevel: 1 });
// play both seats as 'you'-style players with p1/p2 abs logs
let clock = 1e12; const realNow = Date.now; Date.now = () => (clock += 900);
const alog = [];
let guard = 0;
while (!os.over && guard++ < 400) {
  const who = os.turn;
  for (const l of [...os.racks[who]]) { const tg = targets(os, l); if (tg.length) place(os, who, l, tg[0]); if (os.over) break; }
  if (!os.over) endTurn(os);
}
Date.now = realNow;
const abs = absLog(os.log, 0);
const row = { p1: 'u1', p2: 'u2', status: 'done', winner: null, spec: ospec, state: { log: abs }, created_at: '2026-11-14T11:00:00Z', updated_at: '2026-11-14T11:20:00Z' };
const lm = async () => row;
const a = await handleOp(g, { op: 'result', id: 'm1', matchId: 'M', today: '2026-11-14' }, ctx({ loadMatch: lm }));
const b = await handleOp(g, { op: 'result', id: 'm2', matchId: 'M' }, ctx({ uid: 'u2', loadMatch: lm }));
assert.equal(a.summary.score, os.scores.you); assert.equal(b.summary.score, os.scores.opp);
assert.equal(a.summary.won, os.scores.you > os.scores.opp);
const again = await handleOp(a.game, { op: 'result', id: 'm3', matchId: 'M' }, ctx({ loadMatch: lm })); assert.equal(again.game.xp, a.game.xp);
await rejects(g, { op: 'result', matchId: 'M' }, 403, ctx({ uid: 'stranger', loadMatch: lm }));
await rejects(g, { op: 'result', matchId: 'M' }, 425, ctx({ loadMatch: async () => ({ ...row, status: 'playing' }) }));
// claim win: winner chosen by the match row
const cw = await handleOp(g, { op: 'result', matchId: 'M' }, ctx({ loadMatch: async () => ({ ...row, winner: 1, state: { log: abs.slice(0, 12) } }) }));
assert.ok(cw.summary.won);
console.log('all server checks passed');
