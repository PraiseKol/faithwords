// The game screen: board, tiles, turns, power-ups, bot opponent, result.
import { h, toast, modal, confetti } from './ui.js';
import { W, H } from './generator.js';
import { CONFIG, BOT_NAMES, EVENT_PUZZLES } from './config.js';
import { getPuzzle, specMain, specEvent } from './puzzles.js';
import * as E from './engine.js';
import { store } from './store.js';
import { sfx } from './audio.js';

let G = null; // current game
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const _debug = () => G;
export function hasActive() { return !!store.d.active; }
export function activeLabel() { return store.d.active?.spec.label; }

export function startGame(spec) {
  const puzzle = getPuzzle(spec);
  const lvl = store.level().level;
  const st = E.newGame(puzzle, { botLevel: lvl });
  G = newCtx(spec, st, BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]);
  persist();
  location.hash = '#/game';
}
export function resumeGame() {
  const a = store.d.active; if (!a) return false;
  const puzzle = getPuzzle(a.spec);
  const st = E.newGame(puzzle, { botLevel: a.st.botLevel });
  Object.assign(st, a.st);
  G = newCtx(a.spec, st, a.botName);
  location.hash = '#/game';
  return true;
}
function newCtx(spec, st, botName) {
  return { spec, st, botName, sel: { tile: null, cell: null, word: null }, busy: false, strikes: 0, hintUntil: 0, last: null, root: null, floats: [], finished: false };
}
function persist() {
  const { board, scores, turn, placed, rackAtStart, racks, quota, passes, botLevel } = G.st;
  store.d.active = { spec: G.spec, botName: G.botName, st: { board, scores, turn, placed, rackAtStart, racks, quota, passes, botLevel } };
  store.save();
}

// ---------- rendering
export function renderGame(root) {
  if (!G) { location.hash = '#/'; return; }
  G.root = root;
  paint();
  if (G.st.turn === 'opp' && !G.busy && !G.st.over) runBot();
}

function paint() {
  const { st, spec } = G;
  const root = G.root; root.innerHTML = '';
  const lv = store.level();
  root.append(
    h('div', { class: 'game' },
      h('div', { class: 'g-head' },
        h('button', { class: 'icon-btn', 'aria-label': 'Back', onclick: () => { location.hash = '#/'; } }, '‹'),
        h('div', { class: 'g-title' }, spec.label),
        h('button', { class: 'icon-btn', 'aria-label': 'Settings', onclick: settingsPopup }, '⚙')),
      h('div', { class: 'g-score' },
        h('span', { class: 'who' }, 'You'),
        h('div', { class: 'sc' + (st.turn === 'you' && !st.over ? ' on' : ''), id: 'sc-you' }, st.scores.you),
        h('span', { class: 'vs' }, 'vs'),
        h('div', { class: 'sc' + (st.turn === 'opp' && !st.over ? ' on' : ''), id: 'sc-opp' }, st.scores.opp),
        h('span', { class: 'who opp' }, G.botName, h('small', {}, ' Lv ' + st.botLevel))),
      boardEl(),
      rackEl(),
      actionsEl(),
      h('div', { class: 'g-foot' }, st.turn === 'you' ? 'Your turn — pick a tile, then tap its cell' : `${G.botName} is playing…`),
    ));
  // floating points queued by last action
  G.floats.splice(0).forEach(spawnFloat);
}

function clueNode(w, dirClass) {
  const long = (w.clue || '').length;
  const body = w.emoji && !w.clue
    ? h('span', { class: 'emo' }, w.emoji)
    : h('span', { class: 'ct ' + (long > 24 ? 'xs' : long > 15 ? 'sm' : '') }, w.clue.replace('__', '___'));
  return h('div', { class: 'cl ' + dirClass, onclick: (e) => { e.stopPropagation(); showClue(w); } }, body);
}

function boardEl() {
  const { st } = G;
  const hint = Date.now() < G.hintUntil;
  const selLetter = G.sel.tile != null ? st.racks.you[G.sel.tile] : null;
  const hintCells = new Set();
  if (hint) (selLetter ? [selLetter] : st.racks.you).forEach((l) => E.targets(st, l).forEach((k) => hintCells.add(k)));
  const wordSel = G.sel.word != null ? new Set(E.wordCells(st.puzzle.words[G.sel.word])) : new Set();
  const grid = h('div', { class: 'grid', style: { '--cols': W, '--rows': H } });
  st.puzzle.cells.forEach((c, k) => {
    if (c.t === 'e') return grid.append(h('div', { class: 'cell blank' }));
    if (c.t === 'c') {
      const hasA = c.a >= 0, hasD = c.d >= 0;
      const kids = [];
      if (hasA) kids.push(clueNode(st.puzzle.words[c.a], 'a'));
      if (hasD) kids.push(clueNode(st.puzzle.words[c.d], 'd'));
      return grid.append(h('div', { class: 'cell clue ' + (hasA && hasD ? 'two' : '') }, kids));
    }
    const b = st.board[k];
    const cls = ['cell', 'letter'];
    if (b.ch) cls.push('f-' + b.by);
    if (c.given) cls.push('given');
    if (wordSel.has(k)) cls.push('wsel');
    if (G.sel.cell === k) cls.push('csel');
    if (hintCells.has(k)) cls.push('hint');
    if (G.last && G.last.cell === k) cls.push('pop');
    grid.append(h('div', { class: cls.join(' '), 'data-k': k, onclick: () => onCell(k) }, b.ch || ''));
  });
  return h('div', { class: 'grid-wrap' }, grid);
}

function rackEl() {
  const { st } = G;
  const mine = st.turn === 'you' && !G.busy && !st.over;
  const tiles = st.racks.you.map((l, i) => h('button', { class: 'tile' + (G.sel.tile === i ? ' sel' : '') + (mine ? '' : ' dim'), onclick: () => onTile(i) }, l));
  return h('div', { class: 'rack' }, tiles.length ? tiles : h('span', { class: 'muted' }, 'No tiles'));
}

function badge(n) { return n > 0 ? h('span', { class: 'badge' }, n) : null; }
function actionsEl() {
  const { st } = G;
  const mine = st.turn === 'you' && !G.busy && !st.over;
  const inv = store.d.inv;
  const btn = (cls, label, icon, onclick, extra) => h('button', { class: 'act ' + cls, onclick, disabled: !mine }, h('span', { class: 'ico' }, icon), h('span', { class: 'lbl' }, label), extra);
  const center = st.placed > 0
    ? h('button', { class: 'main-act ok', disabled: !mine, onclick: confirmTurn, 'aria-label': 'Confirm' }, '✓')
    : h('button', { class: 'main-act', disabled: !mine, onclick: passTurn }, 'Pass');
  return h('div', { class: 'actions' },
    btn('swap', 'Swap', '⇄', swapPopup, h('span', { class: 'cost' }, '🪙' + CONFIG.price.swap)),
    center,
    btn('word', 'Word', '▤', useWord, inv.word > 0 ? badge(inv.word) : h('span', { class: 'cost' }, '🪙' + CONFIG.price.word)),
    btn('hint', 'Hint', '💡', useHint, inv.hint > 0 ? badge(inv.hint) : h('span', { class: 'cost' }, '🪙' + CONFIG.price.hint)));
}

// ---------- interactions
function showClue(w) {
  G.sel.word = w.id; G.sel.cell = null;
  paint();
  const text = w.emoji && !w.clue ? h('div', { class: 'big-emo' }, w.emoji) : h('div', { class: 'big-clue' }, w.clue.replace('__', '_____'));
  const m = modal(h('div', { class: 'clue-pop' }, text, h('div', { class: 'len' }, `${w.len} letters · ${w.dir === 'a' ? 'across →' : 'down ↓'}`)), { cls: 'clue-modal' });
  m.back.classList.add('clear');
}

function onTile(i) {
  if (G.busy || G.st.turn !== 'you') return;
  const letter = G.st.racks.you[i];
  if (G.sel.cell != null) return tryPlace(letter, G.sel.cell);
  if (G.sel.word != null) {
    const w = G.st.puzzle.words[G.sel.word];
    const k = E.wordCells(w).find((c) => !G.st.board[c].ch && G.st.puzzle.cells[c].ch === letter);
    if (k != null) return tryPlace(letter, k);
  }
  G.sel.tile = G.sel.tile === i ? null : i;
  paint();
}
function onCell(k) {
  if (G.busy || G.st.turn !== 'you') return;
  if (G.st.board[k].ch) return;
  if (G.sel.tile != null) return tryPlace(G.st.racks.you[G.sel.tile], k);
  G.sel.cell = G.sel.cell === k ? null : k; G.sel.word = null;
  paint();
}

function cellRect(k) {
  const el = G.root.querySelector(`[data-k="${k}"]`);
  return el ? el.getBoundingClientRect() : null;
}
function spawnFloat(f) {
  const r = cellRect(f.cell); if (!r) return;
  const el = h('div', { class: 'float ' + (f.cls || '') }, f.text);
  el.style.left = r.left + r.width / 2 + 'px'; el.style.top = r.top + 'px';
  document.body.append(el);
  setTimeout(() => el.remove(), 1200);
}
function bigFloat(text) {
  const el = h('div', { class: 'bigfloat' }, text);
  document.body.append(el); setTimeout(() => el.remove(), 1500);
}

function tryPlace(letter, k) {
  const res = E.place(G.st, 'you', letter, k);
  G.sel = { tile: null, cell: null, word: null };
  if (!res.ok) {
    sfx('wrong');
    paint();
    const el = G.root.querySelector(`[data-k="${k}"]`);
    el?.classList.add('shake');
    G.strikes++;
    const left = CONFIG.strikesPerTurn - G.strikes;
    if (left <= 0) { toast('Too many wrong guesses — turn over'); G.busy = true; setTimeout(() => { G.busy = false; confirmTurn(); }, 700); }
    else toast(`Not there — ${left} wrong guess${left > 1 ? 'es' : ''} left this turn`);
    return;
  }
  sfx(res.completed.length ? 'word' : 'place');
  G.last = { cell: k };
  G.floats.push({ cell: k, text: '+' + res.points, cls: res.completed.length ? 'big' : '' });
  persist();
  paint();
  if (G.st.over) return finish();
  if (G.st.placed >= CONFIG.tilesPerRack && G.st.rackAtStart >= CONFIG.tilesPerRack) {
    G.busy = true; paint();
    setTimeout(() => { G.busy = false; confirmTurn(); }, 650);
  }
}

function confirmTurn() {
  if (G.busy && G.st.placed < CONFIG.tilesPerRack) return;
  const r = E.endTurn(G.st);
  if (r.bonus) { sfx('bonus'); bigFloat(`ALL 5 TILES  +${r.bonus}`); }
  G.sel = { tile: null, cell: null, word: null }; G.last = null; G.strikes = 0;
  persist(); paint();
  if (G.st.over) return finish();
  runBot();
}
function passTurn() { confirmTurn(); }

async function runBot() {
  if (G.busy && G.botRunning) return;
  G.busy = true; G.botRunning = true; paint();
  await sleep(900);
  let guard = 0;
  while (guard++ < 8 && G && !G.finished) {
    const s = E.botStep(G.st);
    if (!s) break;
    const res = E.place(G.st, 'opp', s.letter, s.cell);
    if (!res.ok) break;
    sfx('opp');
    G.last = { cell: s.cell };
    G.floats.push({ cell: s.cell, text: '+' + res.points, cls: 'opp ' + (res.completed.length ? 'big' : '') });
    persist(); paint();
    if (G.st.over) { G.botRunning = false; G.busy = false; return finish(); }
    await sleep(750);
  }
  const r = E.endTurn(G.st);
  if (r.bonus) { sfx('bonus'); bigFloat(`${G.botName}: ALL 5 TILES +${r.bonus}`); }
  G.last = null; G.botRunning = false; G.busy = false;
  persist(); paint();
  if (G.st.over) finish();
}

function spendOrPrompt(kind) {
  if (store.spend(kind)) { sfx('coin'); return true; }
  toast(`Not enough coins — earn more by winning or checking in daily`);
  return false;
}
function useHint() {
  if (!spendOrPrompt('hint')) return;
  G.hintUntil = Date.now() + 5000;
  paint(); setTimeout(() => G && paint(), 5100);
}
function useWord() {
  if (G.sel.word == null) { toast('Tap a clue cell first to pick the word'); return; }
  const w = G.st.puzzle.words[G.sel.word];
  if (E.wordCells(w).every((k) => G.st.board[k].ch)) { toast('That word is already complete'); return; }
  if (!spendOrPrompt('word')) return;
  E.revealWord(G.st, 'you', w.id);
  G.sel = { tile: null, cell: null, word: null };
  sfx('word'); persist(); paint();
  if (G.st.over) finish();
}
function swapPopup() {
  const picked = new Set();
  const rackRow = h('div', { class: 'swap-rack' });
  const slots = h('div', { class: 'swap-rack' });
  const draw = () => {
    rackRow.innerHTML = ''; slots.innerHTML = '';
    G.st.racks.you.forEach((l, i) => {
      (picked.has(i) ? slots : rackRow).append(h('button', { class: 'tile', onclick: () => { picked.has(i) ? picked.delete(i) : picked.add(i); draw(); } }, l));
    });
    sw.disabled = swp.disabled = picked.size === 0;
  };
  const doSwap = (pass) => {
    if (!pass && !spendOrPrompt('swap')) return;
    E.swap(G.st, 'you', [...picked].map((i) => G.st.racks.you[i]));
    m.close(); persist();
    if (pass) confirmTurn(); else paint();
  };
  const sw = h('button', { class: 'btn', onclick: () => doSwap(false) }, `Swap  🪙${CONFIG.price.swap}`);
  const swp = h('button', { class: 'btn ghost', onclick: () => doSwap(true) }, 'Swap and Pass');
  const m = modal(h('div', {}, h('h3', {}, 'Swap Tiles'), h('p', { class: 'muted' }, 'Select up to 5 tiles that you want to swap'), slots, h('hr'), rackRow, h('div', { class: 'btn-row' }, sw, swp)), { cls: 'sheet' });
  draw();
}
function settingsPopup() {
  const s = store.d.settings;
  const snd = h('button', { class: 'btn ghost' }, 'Sound: ' + (s.sound ? 'On' : 'Off'));
  snd.onclick = () => { s.sound = !s.sound; store.save(); snd.textContent = 'Sound: ' + (s.sound ? 'On' : 'Off'); };
  const m = modal(h('div', {}, h('h3', {}, 'Game'), snd,
    h('button', { class: 'btn ghost', onclick: () => { m.close(); location.hash = '#/'; } }, 'Save & exit'),
    h('button', { class: 'btn danger', onclick: () => { m.close(); concede(); } }, 'Give up this match')), { cls: 'sheet' });
}
function concede() {
  G.st.over = true;
  finish(true);
}

// ---------- result
function finish(conceded) {
  if (G.finished) return; G.finished = true;
  const { spec, st } = G;
  const you = st.scores.you, opp = conceded ? Math.max(st.scores.opp, you + 1) : st.scores.opp;
  const r = store.recordResult({ spec, score: you, oppScore: opp });
  sfx(r.won ? 'win' : 'lose'); if (r.won) confetti();
  const title = r.won ? 'Victory!' : r.draw ? 'Draw' : 'Good game';
  const verse = r.won ? '“Well done, good and faithful servant.” — Matthew 25:21' : r.draw ? '“Iron sharpens iron.” — Proverbs 27:17' : '“Do not grow weary in doing good.” — Galatians 6:9';
  const row = (a, b, cls = '') => h('div', { class: 'res-row ' + cls }, h('span', {}, a), h('b', {}, b));
  const pct = Math.round((r.after.into / r.after.need) * 100);
  const next = nextAction(spec);
  const m = modal(h('div', { class: 'result' },
    h('div', { class: 'res-emoji' }, r.won ? '🏆' : r.draw ? '🤝' : '🙏'),
    h('h2', {}, title),
    h('div', { class: 'res-score' }, h('b', {}, r.score), ' – ', h('b', {}, r.oppScore)),
    h('p', { class: 'verse' }, verse),
    row('Round points → total', '+' + r.score),
    r.winBonus ? row('Win bonus XP', '+' + r.winBonus) : null,
    r.dailyBonus ? row('Daily puzzle XP', '+' + r.dailyBonus) : null,
    r.coins - r.eventCoins ? row(`Win coins${r.streak > 1 ? ` (streak ×${r.mult})` : ''}`, '+🪙' + (r.coins - r.eventCoins), 'gold') : null,
    r.eventCoins ? row('Event reward', '+🪙' + r.eventCoins, 'gold') : null,
    r.streak > 0 ? row('Win streak', '🔥 ' + r.streak) : null,
    r.leveledUp ? h('div', { class: 'levelup' }, `⬆ Level up! You are now Level ${r.after.level}`) : null,
    h('div', { class: 'lvl-line' }, h('span', {}, 'Level ' + r.after.level), h('div', { class: 'bar' }, h('i', { style: { width: pct + '%' } })), h('small', {}, `${r.after.into}/${r.after.need} XP`)),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: () => { m.close(); next.go(); } }, next.label),
      h('button', { class: 'btn ghost', onclick: () => { m.close(); location.hash = '#/'; } }, 'Home'))), { dismiss: false, cls: 'sheet' });
  paint();
}
function nextAction(spec) {
  if (spec.kind === 'main') return { label: 'Next puzzle', go: () => startGame(specMain(store.d.mainNext)) };
  if (spec.kind === 'event') {
    const idx = store.d.events[spec.id] || 0;
    return idx < EVENT_PUZZLES ? { label: 'Next event puzzle', go: () => startGame(specEvent(spec.id, idx)) } : { label: 'Event complete ✓', go: () => { location.hash = '#/'; } };
  }
  return { label: 'Daily calendar', go: () => { location.hash = '#/daily'; } };
}
