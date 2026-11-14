// Player progress rules (XP, levels, coins, check-in, streaks, shop). Pure functions on a plain
// data object, used by the phone (instant feedback) and by the server (the real source of truth).
import { CONFIG } from './config.js';

export const SERVER_KEYS = ['xp', 'coins', 'inv', 'checkin', 'winStreak', 'bestWinStreak', 'stats', 'mainNext', 'daily', 'events'];

export const freshProgress = () => ({
  xp: 0, coins: CONFIG.startCoins,
  inv: { hint: CONFIG.startHints, word: CONFIG.startWords },
  checkin: { last: null, streak: 0 }, winStreak: 0, bestWinStreak: 0,
  stats: { games: 0, wins: 0, losses: 0, draws: 0, bestScore: 0, totalWords: 0 },
  mainNext: 1, daily: {}, events: {},
});

const dayDiff = (a, b) => Math.round((new Date(a + 'T00:00:00Z') - new Date(b + 'T00:00:00Z')) / 86400000);
export const checkinReward = (n) => Math.round(CONFIG.checkin.base * (1 + CONFIG.checkin.step * (Math.min(n, CONFIG.checkin.maxDay) - 1)));
export const winMultiplier = (streak) => Math.min(CONFIG.win.maxMult, 1 + CONFIG.win.step * (streak - 1));

export function checkinInfo(d, today) {
  const c = d.checkin, claimed = c.last === today;
  let day;
  if (claimed) day = c.streak;
  else if (c.last && dayDiff(today, c.last) === 1) day = c.streak + 1;
  else day = 1;
  return { claimed, day, reward: checkinReward, today: checkinReward(day) };
}
export function claimCheckin(d, today) {
  const i = checkinInfo(d, today);
  if (i.claimed) return 0;
  d.coins += i.today;
  d.checkin = { last: today, streak: i.day };
  return i.today;
}

/** Pay for a power-up: an owned item first (hint/word), otherwise coins. */
export function spend(d, kind) {
  if (kind !== 'swap' && d.inv[kind] > 0) { d.inv[kind]--; return true; }
  const p = CONFIG.price[kind];
  if (d.coins >= p) { d.coins -= p; return true; }
  return false;
}
export function buy(d, kind) {
  const p = CONFIG.price[kind];
  if (!(kind in CONFIG.price) || kind === 'swap' || d.coins < p) return false;
  d.coins -= p; d.inv[kind]++; return true;
}

export function levelFromXp(xp) {
  let level = 1, need = CONFIG.xpForLevel(1), rest = xp;
  while (rest >= need) { rest -= need; level++; need = CONFIG.xpForLevel(level); }
  return { level, into: rest, need };
}

/** A match ended: points, win bonus, streak coins, progress. Returns the summary for the result screen. */
export function applyResult(d, { spec, score, oppScore }) {
  const before = levelFromXp(d.xp);
  const won = score > oppScore, draw = score === oppScore;
  const s = d.stats;
  s.games++; s.bestScore = Math.max(s.bestScore, score);
  let winBonus = 0, dailyBonus = 0, coins = 0, mult = 1;
  if (won) {
    s.wins++; d.winStreak++; d.bestWinStreak = Math.max(d.bestWinStreak, d.winStreak);
    winBonus = CONFIG.winXpBonus;
    if (spec.kind === 'daily') dailyBonus = CONFIG.dailyXpBonus;
    mult = winMultiplier(d.winStreak);
    coins = Math.round(CONFIG.win.base * mult);
  } else if (draw) s.draws++;
  else { s.losses++; d.winStreak = 0; }
  const xpGain = score + winBonus + dailyBonus;
  d.xp += xpGain; d.coins += coins;
  if (spec.kind === 'main') d.mainNext = Math.max(d.mainNext, spec.n + 1);
  if (spec.kind === 'daily') d.daily[spec.date] = { score, won };
  let eventCoins = 0;
  if (spec.kind === 'event') {
    d.events[spec.id] = Math.max(d.events[spec.id] || 0, spec.idx + 1);
    if (won) { eventCoins = CONFIG.eventCoinReward; coins += eventCoins; d.coins += eventCoins; }
  }
  const after = levelFromXp(d.xp);
  return { won, draw, score, oppScore, winBonus, dailyBonus, xpGain, coins, mult, streak: d.winStreak, before, after, leveledUp: after.level > before.level, eventCoins };
}
