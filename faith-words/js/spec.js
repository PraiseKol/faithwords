// Puzzle specs and puzzle building. Pure (no DOM, no storage) so the server runs the exact same code.
import { BANK } from './bank.js';
import { generatePuzzle } from './generator.js';
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

/** Same seed + same bank => same grid, on the phone and on the server. */
export function buildPuzzle(spec, customBank = []) {
  let bank = BANK;
  if (spec.useCustom && customBank.length) {
    bank = BANK.concat(customBank.map((e, i) => ({ id: 10000 + i, a: e.a, c: e.c, e: e.e || '', tags: e.tags || [] })));
  }
  return generatePuzzle(bank, { seed: spec.seed, focusTag: spec.focusTag || null });
}
