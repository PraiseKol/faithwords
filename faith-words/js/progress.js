// Player progress rules (XP, levels, coins, check-in, streaks, shop). Pure functions on a plain
// data object, used by the phone (instant feedback) and by the server (the real source of truth).
import { CONFIG } from './config.js';
import { questsFor, questGain, questState, chestReward } from './quests.js';

export const SERVER_KEYS = ['xp', 'coins', 'inv', 'checkin', 'winStreak', 'bestWinStreak', 'stats', 'mainNext', 'daily', 'events', 'album', 'quests', 'title', 'cosmetics', 'weekly', 'communityClaimed'];

export const freshProgress = () => ({
  xp: 0, coins: CONFIG.startCoins,
  inv: { hint: CONFIG.startHints, word: CONFIG.startWords, freeze: 0 },
  checkin: { last: null, streak: 0, best: 0 }, winStreak: 0, bestWinStreak: 0,
  stats: { games: 0, wins: 0, losses: 0, draws: 0, bestScore: 0, totalWords: 0, quests: 0, chests: 0 },
  mainNext: 1, daily: {}, events: {}, album: {}, quests: null, title: '',
  cosmetics: { own: [], board: 'b-classic', tile: 't-classic' },
  weekly: { key: '', xp: 0, words: 0 }, communityClaimed: '',
});

/** The Monday of the week a date (YYYY-MM-DD) falls in: the week's name for leagues and community goals. */
export function weekKey(date) {
  const d = new Date(date + 'T00:00:00Z'); const back = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - back * 86400000).toISOString().slice(0, 10);
}

/** Fill in anything an older save is missing (new fields added by later versions). */
export function migrate(d) {
  const f = freshProgress();
  d.inv = { ...f.inv, ...d.inv }; d.stats = { ...f.stats, ...d.stats }; d.checkin = { ...f.checkin, ...d.checkin };
  d.album ||= {}; d.title ||= ''; d.weekly = { ...f.weekly, ...d.weekly }; d.communityClaimed ||= ''; d.cosmetics = { ...f.cosmetics, ...d.cosmetics, own: [...(d.cosmetics?.own || [])] }; if (d.quests === undefined) d.quests = null;
  return d;
}

const dayDiff = (a, b) => Math.round((new Date(a + 'T00:00:00Z') - new Date(b + 'T00:00:00Z')) / 86400000);
export const checkinReward = (n) => Math.round(CONFIG.checkin.base * (1 + CONFIG.checkin.step * (Math.min(n, CONFIG.checkin.maxDay) - 1)));
export const winMultiplier = (streak) => Math.min(CONFIG.win.maxMult, 1 + CONFIG.win.step * (streak - 1));

export function checkinInfo(d, today) {
  const c = d.checkin, claimed = c.last === today;
  let day, used = 0, lost = false;
  if (claimed) day = c.streak;
  else if (c.last && dayDiff(today, c.last) === 1) day = c.streak + 1;
  else if (c.last && c.streak > 0) { // missed day(s): streak freezes cover them, one per day
    const missed = dayDiff(today, c.last) - 1, have = d.inv.freeze || 0;
    if (missed >= 1 && missed <= have) { day = c.streak + 1; used = missed; } else { day = 1; lost = c.streak > 1; }
  } else day = 1;
  return { claimed, day, reward: checkinReward, today: checkinReward(day), usedFreezes: used, lost };
}
export function claimCheckin(d, today) {
  const i = checkinInfo(d, today);
  if (i.claimed) return 0;
  d.coins += i.today; d.inv.freeze = (d.inv.freeze || 0) - i.usedFreezes;
  d.checkin = { last: today, streak: i.day, best: Math.max(d.checkin.best || 0, i.day) };
  return i.today;
}

/** Pay for a power-up: an owned item first (hint/word), otherwise coins. */
export function spend(d, kind) {
  if (kind === 'freeze') return false;
  if (kind !== 'swap' && d.inv[kind] > 0) { d.inv[kind]--; return true; }
  const p = CONFIG.price[kind];
  if (d.coins >= p) { d.coins -= p; return true; }
  return false;
}
export function buy(d, kind) {
  const p = CONFIG.price[kind];
  if (!(kind in CONFIG.price) || kind === 'swap' || d.coins < p) return false;
  if (kind === 'freeze' && (d.inv.freeze || 0) >= CONFIG.maxFreezes) return false;
  d.coins -= p; d.inv[kind] = (d.inv[kind] || 0) + 1; return true;
}

export function levelFromXp(xp) {
  let level = 1, need = CONFIG.xpForLevel(1), rest = xp;
  while (rest >= need) { rest -= need; level++; need = CONFIG.xpForLevel(level); }
  return { level, into: rest, need };
}

/** A match ended: points, win bonus, streak coins, progress. Returns the summary for the result screen. */
export function applyResult(d, { spec, score, oppScore, rep = null, idx = 0, verse = null, today = null }) {
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
  if (spec.kind === 'main' && won) d.mainNext = Math.max(d.mainNext, spec.n + 1); // a lost level has to be played again
  if (spec.kind === 'daily') d.daily[spec.date] = { score, won };
  let eventCoins = 0;
  if (spec.kind === 'event') {
    if (won) d.events[spec.id] = Math.max(d.events[spec.id] || 0, spec.idx + 1);
    if (won) { eventCoins = CONFIG.eventCoinReward; coins += eventCoins; d.coins += eventCoins; }
  }
  // words, quests, verse
  if (rep) s.totalWords = (s.totalWords || 0) + (rep.words?.[idx] || 0);
  const questsDone = [];
  if (today && rep) {
    const q = questState(d, today);
    for (const qu of questsFor(today)) {
      if (q.done.includes(qu.id)) continue;
      q.prog[qu.id] = Math.min(qu.need, (q.prog[qu.id] || 0) + questGain(qu.id, { spec, won, rep, idx }));
      if (q.prog[qu.id] >= qu.need) { q.done.push(qu.id); d.coins += CONFIG.questCoins; s.quests++; questsDone.push(qu.id); }
    }
  }
  if (today) { // weekly xp and words (leagues, group boards, community goal)
    const wk = weekKey(today);
    if (d.weekly.key !== wk) d.weekly = { key: wk, xp: 0, words: 0 };
    d.weekly.xp += xpGain; d.weekly.words += rep?.words?.[idx] || 0;
  }
  let newVerse = false;
  if (verse) { d.album ||= {}; newVerse = !d.album[verse]; d.album[verse] = d.album[verse] ? { ...d.album[verse], n: d.album[verse].n + 1 } : { n: 1, on: today || '' }; }
  const after = levelFromXp(d.xp);
  return { seed: spec.seed, words: rep?.words?.[idx] || 0, verse, newVerse, questsDone, won, draw, score, oppScore, winBonus, dailyBonus, xpGain, coins, mult, streak: d.winStreak, before, after, leveledUp: after.level > before.level, eventCoins };
}

/** The day's chest, once all three quests are done. Returns the reward or null. */
export function openChest(d, today) {
  const q = questState(d, today);
  if (q.opened || q.done.length < 3) return null;
  q.opened = true; d.stats.chests = (d.stats.chests || 0) + 1;
  const r = chestReward(today);
  d.coins += r.coins;
  if (r.kind === 'freeze') { if ((d.inv.freeze || 0) < CONFIG.maxFreezes) d.inv.freeze = (d.inv.freeze || 0) + 1; else d.coins += 30, r.coins += 30; }
  else d.inv[r.kind] = (d.inv[r.kind] || 0) + r.qty;
  return r;
}

/** Today's quests with progress, for the home screen: [{id, need, have, done}] and chest state. */
export function questView(d, today) {
  const q = questState(d, today), list = questsFor(today).map((x) => ({ ...x, have: q.prog[x.id] || 0, done: q.done.includes(x.id) }));
  return { list, doneCount: q.done.length, opened: q.opened, ready: !q.opened && q.done.length >= 3, reward: chestReward(today) };
}
