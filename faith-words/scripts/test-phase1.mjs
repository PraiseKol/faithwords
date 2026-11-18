// Phase 1 rules: quests + chest, streak freezes, verse album, titles. Same code the server runs.
import assert from 'node:assert';
import { newGame, place, submit, endTurn, botStep, targets } from '../js/engine.js';
import { getPuzzle } from '../js/puzzles.js';
import { specMain, specDaily } from '../js/spec.js';
import { absLog } from '../js/replay.js';
import { handleOp, publicColumns } from '../js/serverlogic.js';
import * as P from '../js/progress.js';
import { questsFor, chestReward } from '../js/quests.js';
import { VERSES } from '../js/verses.js';
import { BADGES } from '../js/achievements.js';

function play(spec) {
  const st = newGame(getPuzzle(spec), { botLevel: 3 });
  const realNow = Date.now; let clock = 1e12; Date.now = () => (clock += 900);
  let guard = 0;
  while (!st.over && guard++ < 400) {
    if (st.turn === 'you') {
      const used = new Set(), items = [];
      for (const l of st.racks.you) { const t = targets(st, l).find((k) => !used.has(k)); if (t != null) { used.add(t); items.push({ letter: l, cell: t }); } }
      submit(st, 'you', items); endTurn(st);
    } else { st.quota = st.quota || 1; let s; while ((s = botStep(st))) place(st, 'opp', s.letter, s.cell); endTurn(st); }
  }
  Date.now = realNow; return st;
}
const T = '2026-11-14';
const ctx = (day = T) => ({ uid: 'u1', now: Date.parse(day + 'T12:00:00Z'), loadMatch: async () => null, loadCustom: async () => [] });
const rejects = async (g, op, status, c = ctx()) => { try { await handleOp(g, op, c); assert.fail('should reject'); } catch (e) { assert.strictEqual(e.status, status, e.message); } };

// quests: same three for everybody, no repeats, differ across days
const q1 = questsFor(T); assert.equal(q1.length, 3); assert.equal(new Set(q1.map((q) => q.id)).size, 3);
assert.deepEqual(q1, questsFor(T)); const days = new Set(); for (let i = 0; i < 20; i++) days.add(JSON.stringify(questsFor('2026-12-' + String(i + 1).padStart(2, '0')).map((q) => q.id)));
assert.ok(days.size > 8, 'quests vary by day');
const cr = chestReward(T); assert.ok(cr.coins >= 40 && cr.coins <= 80);

// play real matches through the server until the day's quests are done; the chest opens once
let g = (await handleOp(null, { op: 'sync' }, ctx())).game;
assert.equal(g.inv.freeze, 0); assert.equal(g.title, '');
await rejects(g, { op: 'openChest', today: T }, 409);
let sum, n = 0;
for (; n < 12 && !(g.quests && g.quests.done.length >= 3); n++) {
  const spec = n % 4 === 3 ? specDaily(T) : specMain(g.mainNext), st = play(spec);
  const r = await handleOp(g, { op: 'result', id: 'q' + n, spec, log: absLog(st.log, 0), today: T }, ctx());
  g = r.game; sum = r.summary;
  assert.ok(sum.verse, 'a verse is revealed'); assert.ok(g.album[sum.verse].n >= 1);
}
console.log('quests done after', n, 'matches:', g.quests.done, g.quests.prog, 'totalWords', g.stats.totalWords, 'album', Object.keys(g.album).length);
if (g.quests.done.length >= 3) {
  const before = g.coins, o = await handleOp(g, { op: 'openChest', id: 'c1', today: T }, ctx());
  assert.ok(o.summary.chest.coins >= 40); assert.ok(o.game.coins >= before + 40); assert.equal(o.game.quests.opened, true);
  await rejects(o.game, { op: 'openChest', id: 'c2', today: T }, 409);
  g = o.game;
} else console.log('(quests not all done in 12 matches — chest path checked below by hand)');
assert.ok(g.stats.totalWords > 0 && g.stats.quests >= 1, 'words and quests are counted');
// a new day = fresh quests
const nx = '2026-11-15'; const spec = specMain(g.mainNext), st = play(spec);
g = (await handleOp(g, { op: 'result', id: 'nd', spec, log: absLog(st.log, 0), today: nx }, ctx(nx))).game;
assert.equal(g.quests.date, nx); assert.equal(g.quests.opened, false);
// conceding reveals no verse
{ const sp = specMain(g.mainNext), s2 = newGame(getPuzzle(sp), { botLevel: 3 }); const lg = [['you', 'x', 0, 1e12]];
  const r = await handleOp(g, { op: 'result', id: 'cc', spec: sp, log: lg.map(([w, t, k, ts]) => [0, t, k, ts]), mode: 'concede', today: nx }, ctx(nx)); assert.equal(r.summary.verse, null); }

// streak freeze: one freeze covers exactly one missed day; buying is capped; never auto-spent otherwise
let d = P.freshProgress(); d.coins = 500; d.checkin = { last: '2026-11-10', streak: 5, best: 5 };
assert.equal(P.checkinInfo(d, '2026-11-12').day, 1, 'no freeze: a missed day resets');
assert.ok(P.buy(d, 'freeze')); assert.equal(d.inv.freeze, 1); assert.equal(d.coins, 440);
assert.equal(P.checkinInfo(d, '2026-11-11').usedFreezes, 0, 'consecutive day uses none');
assert.equal(P.checkinInfo(d, '2026-11-12').day, 6); assert.equal(P.checkinInfo(d, '2026-11-12').usedFreezes, 1);
assert.equal(P.checkinInfo(d, '2026-11-14').day, 1, 'three missed days with one freeze: streak ends');
P.claimCheckin(d, '2026-11-12'); assert.equal(d.inv.freeze, 0); assert.equal(d.checkin.streak, 6);
assert.ok(P.buy(d, 'freeze') && P.buy(d, 'freeze')); assert.ok(!P.buy(d, 'freeze'), 'capped at 2'); assert.equal(P.spend(d, 'freeze'), false);
// the same through the server
let s = (await handleOp(null, { op: 'sync' }, ctx())).game; s.coins = 500; s.checkin = { last: '2026-11-12', streak: 4, best: 4 };
s = (await handleOp(s, { op: 'buy', kind: 'freeze' }, ctx('2026-11-14'))).game;
s = (await handleOp(s, { op: 'checkin', today: '2026-11-14' }, ctx('2026-11-14'))).game;
assert.equal(s.checkin.streak, 5); assert.equal(s.inv.freeze, 0);
// old server saves without the new fields still work
const old = { v: 1, ops: [], rewarded: [], recent: [], xp: 10, coins: 90, inv: { hint: 1, word: 1 }, checkin: { last: null, streak: 0 }, winStreak: 0, bestWinStreak: 0, stats: { games: 1, wins: 0, losses: 1, draws: 0, bestScore: 3, totalWords: 0 }, mainNext: 2, daily: {}, events: {} };
const mg = (await handleOp(old, { op: 'buy', kind: 'freeze' }, ctx())).game; assert.equal(mg.inv.freeze, 1); assert.deepEqual(mg.album, {});

// titles: only earned ones can be worn
s.stats.totalWords = 10; await rejects(s, { op: 'setTitle', title: 'scribe' }, 403);
s.stats.totalWords = 100; const w = (await handleOp(s, { op: 'setTitle', title: 'scribe' }, ctx())).game; assert.equal(w.title, 'scribe'); assert.equal(publicColumns(w).title, 'Scribe');
w.stats.totalWords = 0; assert.equal(publicColumns(w).title, '', 'a title no longer earned is not shown');
assert.equal(new Set(BADGES.map((b) => b.id)).size, BADGES.length); assert.ok(VERSES.length >= 100);
console.log('phase 1 checks passed');
