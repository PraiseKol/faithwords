// Weekly leagues: ~30 players per group, ranked by XP earned this week. Top finishers move up a tier, the bottom
// move down. Real players are few at first, so each group is topped up with deterministic "companion" players
// whose weekly totals grow through the week; the same function runs on the phone and on the server.
import { hashSeed, mulberry32 } from './rng.js';
import { BOT_NAMES } from './config.js';

export const TIERS = ['Bronze', 'Silver', 'Gold', 'Sapphire', 'Ruby', 'Diamond'];
export const SIZE = 30, PROMOTE = 5, DEMOTE = 5, REAL_CAP = 20; // at most 20 real players share a group; the rest are companions
const MS_WEEK = 7 * 86400000;
export const weekProgress = (weekStart, now) => Math.max(0, Math.min(1, (now - Date.parse(weekStart + 'T00:00:00Z')) / MS_WEEK));
export const weekEnd = (weekStart) => Date.parse(weekStart + 'T00:00:00Z') + MS_WEEK;

/** Companion players for a group: names and their final totals are fixed by (week, tier, bucket). */
export function companions(week, tier, bucket, n) {
  const r = mulberry32(hashSeed(`${week}:${tier}:${bucket}`)), out = [];
  for (let i = 0; i < n; i++) {
    const base = BOT_NAMES[Math.floor(r() * BOT_NAMES.length)], num = 10 + Math.floor(r() * 80), addNum = r() < 0.5;
    const name = addNum && /^[A-Za-z]+$/.test(base) ? base + ' ' + num : base; // "Grace 42" for a bare first name, never "Sister Joy 42"
    const final = Math.round((60 + 90 * tier) * (0.25 + r() * 1.5));
    out.push({ id: `bot-${i}`, name, final, bot: true });
  }
  return out;
}
/** Standings at a moment in the week. real: [{id, name, title, xp}]. Returns rows sorted best first. */
export function standings({ week, tier, bucket, real, frac }) {
  const n = Math.max(0, SIZE - real.length);
  const rows = [...real.map((p) => ({ ...p, bot: false })), ...companions(week, tier, bucket, n).map((b) => ({ id: b.id, name: b.name, xp: Math.round(b.final * Math.pow(frac, 0.85)), bot: true }))];
  rows.sort((a, b) => b.xp - a.xp || (a.bot ? 1 : 0) - (b.bot ? 1 : 0) || String(a.name).localeCompare(String(b.name)));
  return rows.map((r, i) => ({ ...r, rank: i + 1 }));
}
export function nextTier(tier, rank) {
  if (rank <= PROMOTE) return Math.min(TIERS.length, tier + 1);
  if (rank > SIZE - DEMOTE) return Math.max(1, tier - 1);
  return tier;
}
/** Result of last week for a player (rank among the full group at the end of the week). */
export function lastWeekResult({ week, tier, bucket, real, uid }) {
  const row = standings({ week, tier, bucket, real, frac: 1 }).find((r) => r.id === uid);
  const rank = row ? row.rank : SIZE;
  return { week, tier, rank, next: nextTier(tier, rank) };
}
/** Which group a newcomer joins: the first group of their tier with room, else a new one. counts: {bucket: realPlayers}. */
export function pickBucket(counts) {
  const keys = Object.keys(counts).map(Number).sort((a, b) => a - b);
  for (const k of keys) if (counts[k] < REAL_CAP) return k;
  return keys.length ? keys[keys.length - 1] + 1 : 0;
}
