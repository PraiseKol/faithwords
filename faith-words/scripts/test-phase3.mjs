// Phase 3 rules: weekly xp, leagues (promotion/demotion), community goal claim, challenge puzzles.
import assert from 'node:assert';
import { newGame, place, submit, endTurn, botStep, targets } from '../js/engine.js';
import { getPuzzle } from '../js/puzzles.js';
import { specMain } from '../js/spec.js';
import { absLog } from '../js/replay.js';
import { handleOp, publicColumns } from '../js/serverlogic.js';
import * as P from '../js/progress.js';
import { CONFIG } from '../js/config.js';
import * as L from '../js/leagues.js';

function play(spec) {
  const st = newGame(getPuzzle(spec), { botLevel: 3 }); const real = Date.now; let clock = 1e12; Date.now = () => (clock += 900); let g = 0;
  while (!st.over && g++ < 400) {
    if (st.turn === 'you') { const used = new Set(), items = []; for (const l of st.racks.you) { const t = targets(st, l).find((k) => !used.has(k)); if (t != null) { used.add(t); items.push({ letter: l, cell: t }); } } submit(st, 'you', items); endTurn(st); }
    else { let s; while ((s = botStep(st))) place(st, 'opp', s.letter, s.cell); endTurn(st); }
  }
  Date.now = real; return st;
}
const T = '2026-11-18';
const ctx = (extra = {}) => ({ uid: 'u', now: Date.parse(T + 'T12:00:00Z'), loadMatch: async () => null, loadCustom: async () => [], loadCommunity: async () => 0, ...extra });
const rejects = async (g, op, status, c = ctx()) => { try { await handleOp(g, op, c); assert.fail('should reject'); } catch (e) { assert.strictEqual(e.status, status, e.message); } };

// weeks start on Monday
assert.equal(P.weekKey('2026-11-16'), '2026-11-16'); assert.equal(P.weekKey('2026-11-22'), '2026-11-16'); assert.equal(P.weekKey('2026-11-23'), '2026-11-23');

// weekly xp and words are counted from a verified match; a challenge puzzle is accepted and carries its seed
let g = (await handleOp(null, { op: 'sync' }, ctx())).game;
const spec = { kind: 'challenge', seed: 'online-7', label: 'x' }, st = play(spec);
const r = await handleOp(g, { op: 'result', id: 'c1', spec, log: absLog(st.log, 0), today: T, challenge: { create: true } }, ctx());
g = r.game; assert.equal(r.summary.seed, 'online-7'); assert.equal(g.weekly.key, '2026-11-16'); assert.ok(g.weekly.xp > 0 && g.weekly.words > 0, JSON.stringify(g.weekly));
assert.equal(publicColumns(g).week_xp, g.weekly.xp); assert.equal(publicColumns(g).week_key, '2026-11-16');
await rejects(g, { op: 'result', id: 'c2', spec: { kind: 'challenge', seed: 'online-99999' }, log: [], today: T }, 400);
// next week resets
const st2 = play(specMain(g.mainNext)); const wk2 = (await handleOp(g, { op: 'result', id: 'c3', spec: specMain(g.mainNext), log: absLog(st2.log, 0), today: '2026-11-24' }, ctx({ now: Date.parse('2026-11-24T12:00:00Z') }))).game;
assert.equal(wk2.weekly.key, '2026-11-23'); assert.ok(wk2.weekly.xp < g.weekly.xp + 500);

// community goal: needs the shared total, your own words, and pays once
g.weekly.words = 3; await rejects(g, { op: 'claimCommunity', week: '2026-11-16' }, 403, ctx({ loadCommunity: async () => 9e9 }));
g.weekly.words = 25; await rejects(g, { op: 'claimCommunity', week: '2026-11-16' }, 409, ctx({ loadCommunity: async () => CONFIG.communityGoal - 1 }));
await rejects(g, { op: 'claimCommunity', week: '2026-10-05' }, 400);
const c0 = g.coins, cl = (await handleOp(g, { op: 'claimCommunity', week: '2026-11-16' }, ctx({ loadCommunity: async () => CONFIG.communityGoal }))).game;
assert.equal(cl.coins, c0 + CONFIG.communityReward.coins); assert.equal(cl.communityClaimed, '2026-11-16');
await rejects(cl, { op: 'claimCommunity', week: '2026-11-16' }, 409, ctx({ loadCommunity: async () => 9e9 }));

// leagues: 30 per group, deterministic companions, zones, tiers
const real = [{ id: 'u', name: 'Me', xp: 500 }, { id: 'v', name: 'Friend', xp: 0 }];
const s1 = L.standings({ week: '2026-11-16', tier: 1, bucket: 0, real, frac: 0.5 }), s2 = L.standings({ week: '2026-11-16', tier: 1, bucket: 0, real, frac: 0.5 });
assert.equal(s1.length, L.SIZE); assert.deepEqual(s1, s2, 'same standings for everyone'); assert.deepEqual(s1.map((x) => x.rank), s1.map((_, i) => i + 1));
const end = L.standings({ week: '2026-11-16', tier: 1, bucket: 0, real, frac: 1 }); assert.ok(end.find((x) => x.id === 'u').xp === 500);
assert.equal(L.nextTier(1, 3), 2); assert.equal(L.nextTier(2, 15), 2); assert.equal(L.nextTier(2, 28), 1); assert.equal(L.nextTier(1, 30), 1); assert.equal(L.nextTier(6, 1), 6);
const lw = L.lastWeekResult({ week: '2026-11-09', tier: 3, bucket: 0, real: [{ id: 'u', name: 'Me', xp: 0 }], uid: 'u' }); assert.equal(lw.next, 2, 'zero xp finishes last and drops a tier');
assert.equal(L.pickBucket({ 0: L.REAL_CAP, 1: 3 }), 1); assert.equal(L.pickBucket({ 0: L.REAL_CAP }), 1); assert.equal(L.pickBucket({}), 0);
assert.ok(L.weekProgress('2026-11-16', Date.parse('2026-11-19T12:00:00Z')) > 0.4 && L.weekProgress('2026-11-16', Date.parse('2026-11-19T12:00:00Z')) < 0.6);
// old saves are filled in
const old = { v: 1, ops: [], rewarded: [], recent: [], xp: 0, coins: 0, inv: { hint: 1, word: 1 }, checkin: { last: null, streak: 0 }, winStreak: 0, bestWinStreak: 0, stats: {}, mainNext: 1, daily: {}, events: {} };
assert.equal(P.migrate(structuredClone(old)).weekly.key, '');
console.log('phase 3 checks passed');
