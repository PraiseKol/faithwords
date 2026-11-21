// Phase 4: admin-published puzzle packs ("content drops") verified by the server, and the daily verse reminder plan.
import assert from 'node:assert';
import fs from 'node:fs';
import { newGame, place, submit, endTurn, botStep, targets } from '../js/engine.js';
import { getPuzzle, setRemoteContent, openDrops } from '../js/puzzles.js';
import { specMain, specDrop, checkDrop } from '../js/spec.js';
import { absLog } from '../js/replay.js';
import { handleOp } from '../js/serverlogic.js';
import { plan, applyReminders, verseOfDay } from '../js/reminders.js';
const fake = (t0) => { let t = t0; return () => (t += 900); };
function play(spec, botLevel = 3) {
  const st = newGame(getPuzzle(spec), { botLevel });
  const realNow = Date.now; let clock = 1e12; Date.now = () => (clock += 900);
  let guard = 0;
  while (!st.over && guard++ < 400) {
    if (st.turn === 'you') {
      const used = new Set(), items = [];
      for (const l of st.racks.you) { const t = targets(st, l).find((k) => !used.has(k)); if (t != null) { used.add(t); items.push({ letter: l, cell: t }); } }
      if (items.length > 1 && Math.random() < 0.4) items.push({ letter: items[0].letter, cell: st.puzzle.cells.findIndex((c, k) => c.t === 'l' && !st.board[k].ch && !used.has(k) && c.ch !== items[0].letter) }); // a wrong guess
      if (items.length > 5) items.length = 5;
      submit(st, 'you', items);
      endTurn(st);
    } else {
      st.quota = st.quota || 1; let s;
      while ((s = botStep(st))) place(st, 'opp', s.letter, s.cell);
      endTurn(st);
    }
  }
  Date.now = realNow;
  return st;
}

const drop = JSON.parse(fs.readFileSync(new URL('./fixtures/sample-drop.json', import.meta.url), 'utf8'));
assert.equal(checkDrop(drop), null, 'the generated sample pack passes the admin check');
setRemoteContent({ drops: [drop] });
const NOW = Date.parse('2026-11-20T12:00:00Z');
const ctx = (content = { drops: [drop] }, now = NOW) => ({ uid: 'u1', now, loadMatch: async () => null, loadCustom: async () => [], ...(content ? { loadContent: async () => content } : {}) });
const rejects = async (g, op, status, c = ctx()) => { try { await handleOp(g, op, c); assert.fail('should reject'); } catch (e) { assert.strictEqual(e.status, status, e.message); } };
let g = (await handleOp(null, { op: 'sync' }, ctx())).game;
assert.deepEqual(g.drops, {});

// 1. an honest game of pack puzzle 1: the server's scores equal the engine's, a win unlocks puzzle 2 and pays the pack coins
let won = null;
for (let i = 0; i < 6 && !won; i++) {
  const spec = specDrop(drop, 0), st = play(spec, 1);
  const r = await handleOp(g, { op: 'result', id: 'd' + i, spec, log: absLog(st.log, 0) }, ctx());
  assert.equal(r.summary.score, st.scores.you); assert.equal(r.summary.oppScore, st.scores.opp);
  if (r.summary.won) { won = r; assert.equal(r.game.drops[drop.id], 1, 'win unlocks the next puzzle'); assert.ok(r.summary.eventCoins > 0, 'pack coins'); assert.ok(r.summary.verse, 'verse card'); }
  else assert.equal(r.game.drops[drop.id] || 0, 0, 'a loss does not unlock the next puzzle');
  g = r.game;
}
assert.ok(won, 'won within 6 tries');
console.log('pack game verified by the server: score', won.summary.score, 'vs', won.summary.oppScore);

// 2. cheating / bad requests
{
  const fresh = (await handleOp(null, { op: 'sync' }, ctx())).game, spec1 = specDrop(drop, 1), st = play(spec1, 1);
  await rejects(fresh, { op: 'result', id: 'x1', spec: spec1, log: absLog(st.log, 0) }, 400);               // puzzle 2 before winning puzzle 1
  const spec0 = specDrop(drop, 0), st0 = play(spec0, 1), log0 = absLog(st0.log, 0);
  await rejects(fresh, { op: 'result', id: 'x2', spec: { ...spec0, id: 'nope', seed: 'drop-nope-0' }, log: log0 }, 400); // unknown pack
  await rejects(fresh, { op: 'result', id: 'x3', spec: spec0, log: log0 }, 400, ctx(null));                    // server has no pack content
  await rejects(fresh, { op: 'result', id: 'x4', spec: spec0, log: log0 }, 400, ctx({ drops: [drop] }, Date.parse('2027-03-01T12:00:00Z'))); // pack closed
  const swapped = { ...drop, puzzles: [drop.puzzles[1], drop.puzzles[0]] };                                      // server's pack differs from what was played
  await rejects(fresh, { op: 'result', id: 'x5', spec: spec0, log: log0 }, 422, ctx({ drops: [swapped] }));
  const broken = structuredClone(drop); broken.puzzles[0].words[0].a = 'ZZZZZZZZZZ';
  await rejects(fresh, { op: 'result', id: 'x6', spec: spec0, log: log0 }, 400, ctx({ drops: [broken] }));
}
console.log('pack cheating attempts rejected');

// 3. admin checks and the home screen list
assert.ok(checkDrop({ ...drop, id: 'Bad Id' })); assert.ok(checkDrop({ ...drop, puzzles: [] })); assert.ok(checkDrop({ ...drop, puzzles: [{ ...drop.puzzles[0], W: 99 }] }));
assert.equal(openDrops('2026-11-20').length, 1); assert.equal(openDrops('2027-03-01').length, 0); assert.equal(openDrops('2026-10-01').length, 0);

// 4. verse reminders: 30 days ahead, one verse each, at the chosen hour; plugin calls; denied permission
{
  const now = new Date(2026, 10, 20, 9, 30);
  const p = plan({ on: true, h: 8 }, now); assert.equal(p.length, 30); assert.equal(new Set(p.map((x) => x.id)).size, 30);
  assert.ok(p.every((x) => x.schedule.at.getHours() === 8 && x.schedule.at > now), 'every reminder is in the future at 8:00');
  assert.equal(p[0].schedule.at.getDate(), 21, 'today 8:00 has passed, so the first is tomorrow');
  assert.ok(p[0].body.includes(verseOfDay('2026-11-21').ref));
  assert.equal(plan({ on: true, h: 21 }, now)[0].schedule.at.getDate(), 20, 'later today still counts');
  const calls = []; const LN = { getPending: async () => ({ notifications: [{ id: 100 }] }), cancel: async (x) => calls.push(['cancel', x.notifications.length]), checkPermissions: async () => ({ display: 'prompt' }), requestPermissions: async () => ({ display: 'granted' }), schedule: async (x) => calls.push(['schedule', x.notifications.length]) };
  assert.equal(await applyReminders({ on: true, h: 8 }, now, LN), 'on'); assert.deepEqual(calls, [['cancel', 1], ['schedule', 30]]);
  calls.length = 0; assert.equal(await applyReminders({ on: false }, now, LN), 'off'); assert.deepEqual(calls, [['cancel', 1]]);
  assert.equal(await applyReminders({ on: true, h: 8 }, now, { ...LN, requestPermissions: async () => ({ display: 'denied' }) }), 'denied');
  assert.equal(await applyReminders({ on: true }, now, null), 'unsupported');
}
console.log('phase 4 checks passed');
