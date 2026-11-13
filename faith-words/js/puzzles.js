// Puzzle provider. Puzzles are generated from a seed, so there are endless main puzzles,
// one daily puzzle for every date, and themed event puzzles.
import { BANK } from './bank.js';
import { generatePuzzle } from './generator.js';
import { store } from './store.js';
import { EVENTS, EVENT_PUZZLES } from './config.js';

export const CUSTOM_FROM_PUZZLE = 101; // admin-added words are used from this main puzzle on

export function specMain(n) { return { kind: 'main', n, seed: 'main-' + n, label: 'Puzzle ' + n, useCustom: n >= CUSTOM_FROM_PUZZLE }; }
export function specDaily(date) {
  const d = new Date(date + 'T00:00:00');
  return { kind: 'daily', date, seed: 'daily-' + date, label: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) };
}
export function specEvent(id, idx) {
  const ev = EVENTS.find((e) => e.id === id);
  return { kind: 'event', id, idx, seed: `ev-${id}-${idx}`, focusTag: ev.tag, label: `${ev.name} ${idx + 1}/${EVENT_PUZZLES}` };
}

const cache = new Map();
export function getPuzzle(spec) {
  const key = spec.seed + '|' + (spec.useCustom ? store.d.customBank.length : 0);
  let p = cache.get(key);
  if (!p) {
    let bank = BANK;
    if (spec.useCustom && store.d.customBank.length) {
      bank = BANK.concat(store.d.customBank.map((e, i) => ({ id: 10000 + i, a: e.a, c: e.c, e: e.e || '', tags: e.tags || [] })));
    }
    p = generatePuzzle(bank, { seed: spec.seed, focusTag: spec.focusTag || null });
    cache.set(key, p);
  }
  // apply admin clue edits (clue text only — never changes the grid)
  const ov = store.d.clueOverrides;
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
