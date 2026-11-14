// The server's side of the game: everything that earns XP or coins is decided here, from the move log.
// Pure (no network, no storage) so it is tested in Node and runs unchanged inside the Edge Function.
import * as P from './progress.js';
import { CONFIG, EVENTS, EVENT_PUZZLES } from './config.js';
import { specMain, specDaily, specEvent, buildPuzzle } from './spec.js';
import { replay } from './replay.js';

export class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status; } }
const bad = (status, msg) => { throw new HttpError(status, msg); };

export const LIMITS = { resultsPerHour: 40, msPerTile: 500, importXp: 1500, importCoins: 400, importItems: 10, importMain: 30 };
const DAY = 86400000;
const dateOk = (s, now) => /^\d{4}-\d{2}-\d{2}$/.test(s) && Math.abs(Date.parse(s + 'T00:00:00Z') - Date.parse(new Date(now).toISOString().slice(0, 10) + 'T00:00:00Z')) <= DAY;

function startState(local) {
  const g = { ...P.freshProgress(), v: 1, ops: [], rewarded: [], recent: [] };
  const l = local || {}, n = (x, max) => Math.max(0, Math.min(max, Math.floor(Number(x) || 0)));
  if (n(l.stats?.games, 1e6) > 0) { // a guest's first sign-in: keep a small, capped head start
    g.xp = n(l.xp, LIMITS.importXp); g.coins = Math.max(g.coins, n(l.coins, LIMITS.importCoins));
    g.inv = { hint: Math.max(g.inv.hint, n(l.inv?.hint, LIMITS.importItems)), word: Math.max(g.inv.word, n(l.inv?.word, LIMITS.importItems)) };
    g.mainNext = Math.max(1, n(l.mainNext, LIMITS.importMain));
    g.stats.games = n(l.stats.games, 30); g.stats.wins = Math.min(g.stats.games, n(l.stats.wins, 30));
    g.bestWinStreak = n(l.bestWinStreak, 10);
  }
  return g;
}

function canonicalSpec(g, s, now) {
  s = s || {};
  if (s.kind === 'main') { const n = s.n; if (!Number.isInteger(n) || n < 1 || n > g.mainNext) bad(400, 'bad puzzle'); return specMain(n); }
  if (s.kind === 'daily') { if (!dateOk(s.date, now)) bad(400, 'bad date'); return specDaily(s.date); }
  if (s.kind === 'event') {
    if (!EVENTS.some((e) => e.id === s.id) || !Number.isInteger(s.idx) || s.idx < 0 || s.idx >= EVENT_PUZZLES || s.idx > (g.events[s.id] || 0)) bad(400, 'bad event');
    return specEvent(s.id, s.idx);
  }
  return bad(400, 'bad kind');
}

/** op: { op, id, ...payload }. ctx: { uid, now, loadMatch(id), loadCustom() }. Returns { game, summary? } and mutates `game`. */
export async function handleOp(game, op, ctx) {
  const now = ctx.now ?? Date.now();
  let g = game && game.v ? structuredClone(game) : null;
  if (op.op === 'sync') return { game: g || startState(op.local) };
  g ||= startState(null);
  if (op.id && g.ops.includes(op.id)) return { game: g, repeat: true }; // the phone retried an action we already did
  const done = (summary) => { if (op.id) g.ops = [...g.ops, op.id].slice(-40); return { game: g, summary }; };

  if (op.op === 'checkin') {
    if (!dateOk(op.today, now)) bad(400, 'bad date');
    P.claimCheckin(g, op.today);
    return done();
  }
  if (op.op === 'buy') { if (!P.buy(g, op.kind)) bad(402, 'cannot buy'); return done(); }
  if (op.op !== 'result') bad(400, 'unknown op');

  // ---- a finished match
  g.recent = (g.recent || []).filter((t) => now - t < 3600000);
  if (g.recent.length >= LIMITS.resultsPerHour) bad(429, 'too many matches this hour');
  let spec, log, idx = 0, winner = null, mode = null, wallMs = null;
  if (op.matchId) {
    if ((g.rewarded || []).includes(op.matchId)) return done(); // already paid
    const row = await ctx.loadMatch(op.matchId);
    if (!row) bad(404, 'no such match');
    idx = row.p1 === ctx.uid ? 0 : row.p2 === ctx.uid ? 1 : bad(403, 'not your match');
    if (row.status === 'playing' || row.status === 'waiting') bad(425, 'match not finished yet');
    if (row.status !== 'done') bad(409, 'match was cancelled');
    if (!/^online-/.test(row.spec?.seed || '')) bad(400, 'bad match');
    spec = { kind: 'online', seed: row.spec.seed, label: 'Online match' };
    log = row.state?.log; winner = row.winner ?? null;
    wallMs = Date.parse(row.updated_at) - Date.parse(row.created_at);
  } else {
    spec = canonicalSpec(g, op.spec, now);
    log = op.log; mode = op.mode === 'concede' ? 'concede' : null;
  }
  const custom = spec.useCustom ? await ctx.loadCustom() : [];
  const puzzle = buildPuzzle(spec, custom);
  const rep = replay(puzzle, log);
  if (!rep.ok) bad(422, 'match did not replay: ' + rep.err);
  if (!op.matchId && idx !== 0) bad(400, 'bad seat');

  let you = rep.scores[idx], opp = rep.scores[1 - idx];
  if (op.matchId && winner) { if (winner === idx + 1) you = Math.max(you, opp + 1); else opp = Math.max(opp, you + 1); }
  else if (mode === 'concede') opp = Math.max(opp, you + 1);
  else if (!rep.over) bad(422, 'match not finished');

  // humans need time to place tiles
  const mine = rep.placed[idx];
  if (op.matchId ? wallMs < (rep.placed[0] + rep.placed[1]) * LIMITS.msPerTile * 0.4 : rep.spanMs < mine * LIMITS.msPerTile) bad(422, 'too fast');

  // power-ups used are charged here, from the log
  const pw = rep.power[idx];
  for (const [n, kind] of [[pw.h, 'hint'], [pw.r, 'word'], [pw.s, 'swap']]) for (let i = 0; i < n; i++) if (!P.spend(g, kind)) bad(402, 'could not afford power-ups');

  const summary = P.applyResult(g, { spec, score: you, oppScore: opp });
  g.recent.push(now);
  if (op.matchId) g.rewarded = [...(g.rewarded || []), op.matchId].slice(-50);
  return done(summary);
}

/** Flat columns kept in step with the game for the leaderboard. */
export const publicColumns = (g) => ({ xp: g.xp, coins: g.coins, level: P.levelFromXp(g.xp).level, wins: g.stats.wins, games: g.stats.games, best_streak: g.bestWinStreak });
