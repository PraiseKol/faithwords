// Phase 2 rules: combos (engine = server replay), cosmetics (buy / equip / badge unlock) through the server.
import assert from 'node:assert';
import { newGame, place, submit, endTurn, botStep, targets } from '../js/engine.js';
import { getPuzzle } from '../js/puzzles.js';
import { specMain } from '../js/spec.js';
import { replay, absLog } from '../js/replay.js';
import { buildPuzzle } from '../js/spec.js';
import { handleOp } from '../js/serverlogic.js';
import { COSMETICS } from '../js/cosmetics.js';
import { squares, shareText } from '../js/share.js';

// 1. a perfect 5-tile round pays 1+1+(1+1)+(1+2)+(1+2) = 10 plus the 5 bonus; a wrong tile resets the streak
{
  const st = newGame(getPuzzle(specMain(3)), { botLevel: 1 });
  const items = []; const used = new Set();
  for (const l of st.racks.you) { const t = targets(st, l).find((k) => !used.has(k)); if (t != null) { used.add(t); items.push({ letter: l, cell: t }); } }
  assert.equal(items.length, 5);
  const wordFreeBefore = st.scores.you;
  const res = submit(st, 'you', items);
  const combos = res.right.map((r) => r.combo); assert.deepEqual(combos, [0, 0, 1, 2, 2], 'combo bonus per tile: ' + combos);
  assert.deepEqual(res.right.map((r) => r.streak), [1, 2, 3, 4, 5]);
  // replay agrees with the engine
  endTurn(st);
  const puzzle = buildPuzzle(specMain(3)); const rep = replay(puzzle, absLog(st.log, 0).map((e, i) => [e[0], e[1], e[2], 1000 + i * 900]));
  assert.ok(rep.ok, rep.err); assert.equal(rep.scores[0], st.scores.you, 'replay score = engine score (with combo)');
  console.log('perfect round scored', st.scores.you, 'combos', combos);
}
{ // a wrong tile in the same submit does not hide the streak of right ones, but the next submit starts again
  const st = newGame(getPuzzle(specMain(3)), { botLevel: 1 });
  const l = st.racks.you[0], t = targets(st, l)[0], wrongCell = st.puzzle.cells.findIndex((c, k) => c.t === 'l' && !st.board[k].ch && c.ch !== l);
  submit(st, 'you', [{ letter: l, cell: wrongCell }]); assert.equal(st.streak, 0);
  const r2 = submit(st, 'you', [{ letter: l, cell: t }]); assert.equal(r2.right[0].combo, 0);
}
// 2. cosmetics through the server
const ctx = { uid: 'u', now: Date.parse('2026-11-14T12:00:00Z'), loadMatch: async () => null, loadCustom: async () => [] };
const rejects = async (g, op, status) => { try { await handleOp(g, op, ctx); assert.fail('should reject'); } catch (e) { assert.strictEqual(e.status, status, e.message); } };
let g = (await handleOp(null, { op: 'sync' }, ctx)).game; g.coins = 700;
assert.equal(g.cosmetics.board, 'b-classic');
await rejects(g, { op: 'equipCosmetic', cid: 'b-parch' }, 403);
g = (await handleOp(g, { op: 'buyCosmetic', cid: 'b-parch' }, ctx)).game; assert.equal(g.coins, 500);
await rejects(g, { op: 'buyCosmetic', cid: 'b-parch' }, 402); // already owned
g = (await handleOp(g, { op: 'equipCosmetic', cid: 'b-parch' }, ctx)).game; assert.equal(g.cosmetics.board, 'b-parch');
await rejects(g, { op: 'buyCosmetic', cid: 'b-meadow' }, 402); // badge-only items cannot be bought
await rejects(g, { op: 'equipCosmetic', cid: 'b-meadow' }, 403);
g.stats.totalWords = 100; g = (await handleOp(g, { op: 'equipCosmetic', cid: 't-stone' }, ctx)).game; assert.equal(g.cosmetics.tile, 't-stone', 'Scribe unlocks the stone tablet');
await rejects(g, { op: 'equipCosmetic', cid: 'nope' }, 403);
// an older save without cosmetics is migrated
const old = { v: 1, ops: [], rewarded: [], recent: [], xp: 0, coins: 400, inv: { hint: 1, word: 1 }, checkin: { last: null, streak: 0 }, winStreak: 0, bestWinStreak: 0, stats: { games: 0, wins: 0, losses: 0, draws: 0, bestScore: 0, totalWords: 0 }, mainNext: 1, daily: {}, events: {} };
const mg = (await handleOp(old, { op: 'buyCosmetic', cid: 't-gold' }, ctx)).game; assert.deepEqual(mg.cosmetics.own, ['t-gold']);
assert.equal(new Set(COSMETICS.map((c) => c.id)).size, COSMETICS.length);
// 3. share text
const log = [['you', 'p', 1, 1], ['you', 'p', 2, 2], ['you', 'w', 1, 3], ['you', 'e', 0, 4], ['opp', 'p', 3, 5], ['opp', 'e', 0, 6], ['you', 'p', 4, 7], ['you', 'e', 0, 8]];
assert.deepEqual(squares(log), ['🟩🟩🟥', '🟩']);
const txt = shareText({ spec: { label: 'Puzzle 7' }, score: 20, oppScore: 11, log, verse: 'John 3:16', url: 'https://x.test/' });
assert.ok(txt.includes('Puzzle 7') && txt.includes('20–11') && txt.includes('John 3:16') && txt.includes('🟩🟩🟥')); console.log(txt);
console.log('phase 2 checks passed');
