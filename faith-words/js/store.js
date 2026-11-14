// Player data: points/XP, levels, coins, check-ins, streaks, progress. Saved on the device;
// cloud.js mirrors it to Supabase when the player is signed in.
import { CONFIG } from './config.js';
import { levelFromXp } from './engine.js';

const KEY = 'fw.v1';
export const todayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const dayDiff = (a, b) => Math.round((new Date(a + 'T00:00:00') - new Date(b + 'T00:00:00')) / 86400000);

const fresh = () => ({
  name: 'Believer', xp: 0, coins: CONFIG.startCoins,
  inv: { hint: CONFIG.startHints, word: CONFIG.startWords },
  checkin: { last: null, streak: 0 }, winStreak: 0, bestWinStreak: 0,
  stats: { games: 0, wins: 0, losses: 0, draws: 0, bestScore: 0, totalWords: 0 },
  mainNext: 1, daily: {}, events: {}, active: null,
  settings: { sound: true, haptics: true, theme: 'system', unlockEvents: false },
  onboarded: false, activeOnline: null,
  clueOverrides: {}, customBank: [], dirty: 0,
});

let data;
try { data = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { data = fresh(); }
data.inv = { ...fresh().inv, ...data.inv };
data.settings = { ...fresh().settings, ...data.settings };
data.stats = { ...fresh().stats, ...data.stats };

const listeners = new Set();
export const store = {
  get d() { return data; },
  save() {
    data.dirty = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* private mode */ }
    listeners.forEach((f) => f(data));
  },
  onChange(f) { listeners.add(f); },
  replace(obj) { data = { ...fresh(), ...obj }; this.save(); },
  reset() { data = fresh(); this.save(); },
  level() { return levelFromXp(data.xp); },

  // ---- daily check-in: coins = base * (1 + step*(day-1)), day capped
  checkinInfo() {
    const t = todayStr(), c = data.checkin;
    const claimed = c.last === t;
    let day;
    if (claimed) day = c.streak;
    else if (c.last && dayDiff(t, c.last) === 1) day = c.streak + 1;
    else day = 1;
    const reward = (n) => Math.round(CONFIG.checkin.base * (1 + CONFIG.checkin.step * (Math.min(n, CONFIG.checkin.maxDay) - 1)));
    return { claimed, day, reward, today: reward(day) };
  },
  claimCheckin() {
    const i = this.checkinInfo();
    if (i.claimed) return 0;
    data.coins += i.today;
    data.checkin = { last: todayStr(), streak: i.day };
    this.save();
    return i.today;
  },

  winMultiplier(streak) { return Math.min(CONFIG.win.maxMult, 1 + CONFIG.win.step * (streak - 1)); },

  spend(kind) { // 'hint' | 'word' | 'swap' -> true if paid (item or coins)
    if (kind !== 'swap' && data.inv[kind] > 0) { data.inv[kind]--; this.save(); return true; }
    const p = CONFIG.price[kind];
    if (data.coins >= p) { data.coins -= p; this.save(); return true; }
    return false;
  },
  buy(kind) {
    const p = CONFIG.price[kind];
    if (data.coins < p) return false;
    data.coins -= p; data.inv[kind]++; this.save(); return true;
  },

  /** Called once when a match ends. Returns a summary for the result screen. */
  recordResult({ spec, score, oppScore }) {
    const before = this.level();
    const won = score > oppScore, draw = score === oppScore;
    const s = data.stats;
    s.games++; s.bestScore = Math.max(s.bestScore, score);
    let winBonus = 0, dailyBonus = 0, coins = 0, mult = 1;
    if (won) {
      s.wins++; data.winStreak++; data.bestWinStreak = Math.max(data.bestWinStreak, data.winStreak);
      winBonus = CONFIG.winXpBonus;
      if (spec.kind === 'daily') dailyBonus = CONFIG.dailyXpBonus;
      mult = this.winMultiplier(data.winStreak);
      coins = Math.round(CONFIG.win.base * mult);
    } else if (draw) s.draws++;
    else { s.losses++; data.winStreak = 0; }
    const xpGain = score + winBonus + dailyBonus;
    data.xp += xpGain; data.coins += coins;
    // progress
    if (spec.kind === 'main') data.mainNext = Math.max(data.mainNext, spec.n + 1);
    if (spec.kind === 'daily') data.daily[spec.date] = { score, won };
    if (spec.kind === 'event') {
      data.events[spec.id] = Math.max(data.events[spec.id] || 0, spec.idx + 1);
      if (won) { coins += CONFIG.eventCoinReward; data.coins += CONFIG.eventCoinReward; }
    }
    data.active = null;
    this.save();
    const after = this.level();
    return { won, draw, score, oppScore, winBonus, dailyBonus, xpGain, coins, mult, streak: data.winStreak, before, after, leveledUp: after.level > before.level, eventCoins: spec.kind === 'event' && won ? CONFIG.eventCoinReward : 0 };
  },
};
