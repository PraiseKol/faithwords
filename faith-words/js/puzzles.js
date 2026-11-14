// Puzzle provider. Puzzles are generated from a seed, so there are endless main puzzles,
// one daily puzzle for every date, and themed event puzzles.
import { buildPuzzle, specMain, specDaily, specEvent, CUSTOM_FROM_PUZZLE } from './spec.js';
import { store } from './store.js';
import { EVENTS, EVENT_PUZZLES } from './config.js';
import { currentUser } from './cloud.js';

export { specMain, specDaily, specEvent, CUSTOM_FROM_PUZZLE };

const cache = new Map();
// content published by admins to every player (loaded from Supabase at start-up)
export const remote = { clueOverrides: {}, customBank: [] };
export function setRemoteContent(c) {
  remote.clueOverrides = c?.clueOverrides || {}; remote.customBank = c?.customBank || [];
  cache.clear();
}
// Signed-in players only use published words, so the server builds the very same grid to check results.
const allCustom = () => (currentUser() ? remote.customBank : remote.customBank.concat(store.d.customBank));
export function getPuzzle(spec) {
  const custom = spec.useCustom ? allCustom() : [];
  const key = spec.seed + '|' + custom.length;
  let p = cache.get(key);
  if (!p) { p = buildPuzzle(spec, custom); cache.set(key, p); }
  // apply admin clue edits (clue text only — never changes the grid)
  const ov = { ...remote.clueOverrides, ...store.d.clueOverrides };
  return { ...p, words: p.words.map((w) => (ov[w.entry] ? { ...w, clue: ov[w.entry].c ?? w.clue, emoji: ov[w.entry].e ?? w.emoji } : w)) };
}

export function eventStatus(ev, now = new Date()) {
  if (!ev.window) return { active: true, label: 'Always on' };
  const y = now.getFullYear();
  const mk = (md, yr) => new Date(`${yr}-${md}T00:00:00`);
  const [s, e] = ev.window;
  for (const yr of [y - 1, y]) {
    const start = mk(s, yr);
    let end = mk(e, yr); if (end < start) end = mk(e, yr + 1);
    end = new Date(end.getTime() + 86400000);
    if (now >= start && now < end) return { active: true, label: 'Ends in ' + fmtLeft(end - now) };
  }
  let start = mk(s, y); if (start < now) start = mk(s, y + 1);
  return { active: false, label: 'Starts in ' + fmtLeft(start - now) };
}
function fmtLeft(ms) {
  const d = Math.floor(ms / 86400000), h = Math.floor((ms % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h` : `${h}h`;
}
