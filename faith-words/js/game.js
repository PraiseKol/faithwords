// The game screen: board, tiles (tap or drag), turns, power-ups, bot or live opponent, result.
import { h, toast, modal, confetti, icon, buzz, coin } from './ui.js';
import { W, H } from './generator.js';
import { CONFIG, BOT_NAMES, EVENT_PUZZLES } from './config.js';
import { getPuzzle, specMain, specEvent } from './puzzles.js';
import * as E from './engine.js';
import { store } from './store.js';
import { sfx } from './audio.js';
import { A, currentUser } from './cloud.js';
import { findMatch, waitForOpponent, makeWriter, applyRemoteState } from './online.js';
import { showHowTo } from './howto.js';

let G = null; // current game
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hap = (p) => buzz(p, store.d.settings);

export const _debug = () => G;
export function hasActive() { return !!store.d.active; }
export function activeLabel() { return store.d.active?.spec.label; }
export const hasOnlineActive = () => !!store.d.activeOnline;

// ---------- starting games
export function startGame(spec) {
  const puzzle = getPuzzle(spec);
  const st = E.newGame(puzzle, { botLevel: store.level().level });
  G = newCtx(spec, st, BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]);
  persist();
  location.hash = '#/game';
}
export function resumeGame() {
  const a = store.d.active; if (!a) return false;
  const st = E.newGame(getPuzzle(a.spec), { botLevel: a.st.botLevel });
  Object.assign(st, a.st);
  G = newCtx(a.spec, st, a.botName);
  location.hash = '#/game';
  return true;
}
function newCtx(spec, st, botName) {
  return { spec, st, botName, online: null, sel: { tile: null, cell: null, word: null }, busy: false, strikes: 0, hintUntil: 0, last: null, flash: null, root: null, floats: [], finished: false };
}

// ---------- live matches
export async function startOnline() {
  if (!currentUser()) { toast('Sign in on the Me tab to play online'); location.hash = '#/me'; return; }
  let cancelled = false, matchId = null;
  const m = modal(h('div', { class: 'finding' }, h('div', { class: 'spinner' }), h('h3', {}, 'Finding an opponent…'),
    h('p', { class: 'muted' }, 'Matching you with another believer. If nobody is online you can play a bot.'),
    h('button', { class: 'btn ghost', onclick: () => { cancelled = true; if (matchId) A.cancelMatch(matchId); m.close(); } }, 'Cancel')), { dismiss: false, cls: 'sheet' });
  try {
    const found = await findMatch(store.d.name, store.level().level);
    matchId = found.row.id;
    let row = found.row;
    if (found.role === 'p1' && row.status === 'waiting') {
      row = await waitForOpponent(row.id, { cancelled: () => cancelled });
      if (cancelled) return;
      if (!row) {
        await A.cancelMatch(matchId); m.close();
        toast('No one is online right now — here is a bot match');
        return startGame(specMain(store.d.mainNext));
      }
    }
    if (cancelled) return;
    m.close();
    beginOnline(row, found.role, found.st, found.spec);
  } catch (e) {
    console.warn(e); m.close(); toast('Could not reach the server — check your connection');
  }
}
export async function rejoinOnline() {
  const o = store.d.activeOnline; if (!o) return;
  try {
    const row = await A.fetchMatch(o.id);
    if (!row || row.status !== 'playing') { store.d.activeOnline = null; store.save(); toast('That match has ended'); return; }
    const st = E.newGame(getPuzzle(row.spec), { botLevel: store.level().level });
    applyRemoteState(st, row.state, o.role);
    beginOnline(row, o.role, st, row.spec);
  } catch { toast('Could not reach the server'); }
}
function beginOnline(row, role, st, spec) {
  const oppName = (role === 'p1' ? row.p2_name : row.p1_name) || 'Opponent';
  G = newCtx(spec, st, oppName);
  G.online = { id: row.id, role, write: makeWriter(row.id, role), stamp: row.updated_at, timer: null, pending: 0, busy: false, lastActive: Date.now(), idle: false };
  store.d.activeOnline = { id: row.id, role }; store.save();
  location.hash = '#/game';
}
function sync(extra) {
  const O = G.online; O.pending++;
  return O.write(G.st, extra).finally(() => { O.pending--; });
}
function startPolling() {
  const O = G.online; if (!O || O.timer) return;
  O.timer = setInterval(pollOnline, 1300);
}
async function pollOnline() {
  const O = G?.online;
  if (!O || G.finished || O.busy || O.pending > 0) return;
  O.busy = true;
  try {
    const row = await A.fetchMatch(O.id);
    if (!row || O.pending > 0 || G.finished) return;
    if (row.updated_at === O.stamp) return checkIdle();
    O.stamp = row.updated_at; O.lastActive = Date.now(); O.idle = false;
    const done = row.status === 'done';
    if (G.st.turn === 'you' && !done) return; // I am the one writing
    const before = G.st.board.map((b) => b.ch);
    applyRemoteState(G.st, row.state, O.role);
    let any = false;
    G.st.board.forEach((b, k) => { if (b.ch && !before[k]) { G.last = { cell: k }; G.floats.push({ cell: k, text: '', cls: 'opp' }); any = true; } });
    if (any) { sfx('opp'); hap(8); }
    paint();
    if (done || G.st.over) {
      const me = O.role === 'p1' ? 1 : 2;
      finish(row.winner ? (row.winner === me ? 'claim' : 'concede') : undefined);
    }
  } catch (e) { /* offline blip: try again next tick */ } finally { O.busy = false; }
}
function checkIdle() {
  const O = G.online;
  if (G.st.turn === 'opp' && !O.idle && Date.now() - O.lastActive > 90000) { O.idle = true; paint(); }
}

// ---------- saving
function persist() {
  if (G.online) { sync(); return; }
  const { board, scores, turn, placed, rackAtStart, racks, quota, passes, botLevel } = G.st;
  store.d.active = { spec: G.spec, botName: G.botName, st: { board, scores, turn, placed, rackAtStart, racks, quota, passes, botLevel } };
  store.save();
}

// ---------- rendering
export function renderGame(root) {
  if (!G) { location.hash = '#/'; return; }
  G.root = root;
  paint();
  if (G.online) startPolling();
  else if (G.st.turn === 'opp' && !G.busy && !G.st.over) runBot();
}
export function leaveGame() { if (G?.online?.timer) { clearInterval(G.online.timer); G.online.timer = null; } }

function paint() {
  const { st, spec } = G;
  const root = G.root; root.innerHTML = '';
  const total = st.puzzle.letterCount, filled = st.board.filter((b) => b.ch).length;
  const oppInit = (G.botName || '?').trim()[0].toUpperCase();
  const idleBtn = G.online?.idle && st.turn === 'opp'
    ? h('button', { class: 'btn sm warn', onclick: claimWin }, 'Opponent is away — claim the win') : null;
  root.append(
    h('div', { class: 'game' },
      h('div', { class: 'g-head' },
        h('button', { class: 'icon-btn', 'aria-label': 'Back', html: icon('back', 26), onclick: () => { location.hash = '#/'; } }),
        h('div', { class: 'g-title' }, spec.label, G.online ? h('span', { class: 'live' }, 'LIVE') : null),
        h('div', { class: 'g-tools' },
          h('button', { class: 'icon-btn', 'aria-label': 'How to play', html: icon('help', 22), onclick: () => showHowTo() }),
          h('button', { class: 'icon-btn', 'aria-label': 'Menu', html: icon('gear', 22), onclick: settingsPopup }))),
      h('div', { class: 'g-progress', role: 'progressbar', 'aria-valuenow': filled, 'aria-valuemax': total }, h('i', { style: { width: (filled / total) * 100 + '%' } })),
      h('div', { class: 'g-score' },
        h('div', { class: 'side you' + (st.turn === 'you' && !st.over ? ' on' : '') },
          h('div', { class: 'av you' }, (store.d.name || 'Y')[0].toUpperCase()),
          h('div', { class: 'nm' }, 'You'), h('div', { class: 'sc', id: 'sc-you' }, st.scores.you)),
        h('span', { class: 'vs' }, 'vs'),
        h('div', { class: 'side opp' + (st.turn === 'opp' && !st.over ? ' on' : '') },
          h('div', { class: 'sc', id: 'sc-opp' }, st.scores.opp),
          h('div', { class: 'nm' }, G.botName, G.online ? null : h('small', {}, ' Lv ' + st.botLevel)),
          h('div', { class: 'av opp' }, oppInit))),
      boardEl(),
      rackEl(),
      actionsEl(),
      h('div', { class: 'g-foot' }, idleBtn || (st.over ? 'Match finished' : st.turn === 'you' ? 'Your turn · drag a tile onto its cell' : `${G.botName} is playing…`)),
    ));
  G.floats.splice(0).forEach(spawnFloat);
  G.last = null; G.flash = null;
}

function clueNode(w, dirClass) {
  const long = (w.clue || '').length;
  const body = w.emoji && !w.clue
    ? h('span', { class: 'emo' }, w.emoji)
    : h('span', { class: 'ct ' + (long > 24 ? 'xs' : long > 15 ? 'sm' : '') }, w.clue.replace('__', '___'));
  return h('div', { class: 'cl ' + dirClass, role: 'button', tabindex: 0, onclick: (e) => { e.stopPropagation(); showClue(w); }, onkeydown: (e) => { if (e.key === 'Enter') showClue(w); } }, body);
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
    if (G.flash && G.flash.has(k)) cls.push('flash');
    grid.append(h('div', { class: cls.join(' '), 'data-k': k, onclick: () => onCell(k) }, b.ch || ''));
  });
  return h('div', { class: 'grid-wrap' }, grid);
}

function rackEl() {
  const { st } = G;
  const mine = st.turn === 'you' && !G.busy && !st.over;
  const tiles = st.racks.you.map((l, i) => h('button', {
    class: 'tile' + (G.sel.tile === i ? ' sel' : '') + (mine ? '' : ' dim'), 'aria-label': 'Tile ' + l,
    onpointerdown: (e) => startDrag(e, i),
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTile(i); } },
  }, l));
  return h('div', { class: 'rack' }, tiles.length ? tiles : h('span', { class: 'muted' }, st.over ? '' : 'No tiles'));
}

function ab(cls, label, ico, onclick, extra, disabled) {
  return h('button', { class: 'act ' + cls, onclick, disabled }, h('span', { class: 'ico', html: icon(ico, 24) }), h('span', { class: 'lbl' }, label), extra);
}
function actionsEl() {
  const { st } = G;
  const mine = st.turn === 'you' && !G.busy && !st.over;
  const inv = store.d.inv;
  const center = st.placed > 0
    ? h('button', { class: 'main-act ok', disabled: !mine, onclick: confirmTurn }, h('span', { html: icon('check', 22) }), 'Done')
    : h('button', { class: 'main-act', disabled: !mine, onclick: passTurn }, 'Pass');
  const cost = (kind) => h('span', { class: 'cost' }, coin(CONFIG.price[kind]));
  return h('div', { class: 'actions' },
    ab('swap', 'Swap', 'swap', swapPopup, cost('swap'), !mine),
    center,
    ab('word', 'Word', 'eye', useWord, inv.word > 0 ? h('span', { class: 'badge' }, inv.word) : cost('word'), !mine),
    ab('hint', 'Hint', 'bulb', useHint, inv.hint > 0 ? h('span', { class: 'badge' }, inv.hint) : cost('hint'), !mine));
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

// drag a tile from the rack onto the board (a short press is treated as a tap)
function startDrag(e, i) {
  if (G.busy || G.st.turn !== 'you' || e.button > 0) return;
  const tile = e.currentTarget, x0 = e.clientX, y0 = e.clientY;
  let ghost = null, moved = false;
  const letter = G.st.racks.you[i];
  const over = (x, y) => document.elementFromPoint(x, y)?.closest('.cell.letter');
  const mark = (cell) => {
    G.root.querySelectorAll('.cell.drop').forEach((c) => c.classList.remove('drop'));
    if (cell && !G.st.board[+cell.dataset.k].ch) cell.classList.add('drop');
  };
  const move = (ev) => {
    if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return;
    if (!moved) {
      moved = true;
      ghost = h('div', { class: 'tile ghost' }, letter); document.body.append(ghost);
      tile.classList.add('lifted');
      G.root.querySelectorAll('.cell.letter:not([class*="f-"])').forEach((c) => { if (G.st.puzzle.cells[+c.dataset.k].ch === letter) c.classList.add('fits'); });
    }
    ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY - 36 + 'px';
    mark(over(ev.clientX, ev.clientY - 36));
  };
  const up = (ev) => {
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    ghost?.remove(); tile.classList.remove('lifted');
    G.root.querySelectorAll('.cell.fits, .cell.drop').forEach((c) => c.classList.remove('fits', 'drop'));
    if (!moved) return onTile(i);
    const cell = over(ev.clientX, ev.clientY - 36);
    if (cell && !G.st.board[+cell.dataset.k].ch) tryPlace(letter, +cell.dataset.k);
  };
  window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
}

function cellRect(k) {
  const el = G.root.querySelector(`[data-k="${k}"]`);
  return el ? el.getBoundingClientRect() : null;
}
function spawnFloat(f) {
  const r = cellRect(f.cell); if (!r || !f.text) return;
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
    sfx('wrong'); hap(60);
    paint();
    G.root.querySelector(`[data-k="${k}"]`)?.classList.add('shake');
    G.strikes++;
    const left = CONFIG.strikesPerTurn - G.strikes;
    if (left <= 0) { toast('Too many wrong guesses — turn over'); G.busy = true; setTimeout(() => { G.busy = false; confirmTurn(); }, 700); }
    else toast(`Not there — ${left} wrong guess${left > 1 ? 'es' : ''} left this turn`);
    return;
  }
  sfx(res.completed.length ? 'word' : 'place');
  hap(res.completed.length ? [25, 40, 25] : 12);
  G.last = { cell: k };
  if (res.completed.length) {
    G.flash = new Set(); res.completed.forEach((id) => E.wordCells(G.st.puzzle.words[id]).forEach((c) => G.flash.add(c)));
  }
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
  if (r.bonus) { sfx('bonus'); hap([20, 30, 20, 30, 40]); bigFloat(`ALL 5 TILES  +${r.bonus}`); }
  G.sel = { tile: null, cell: null, word: null }; G.last = null; G.strikes = 0;
  persist(); paint();
  if (G.st.over) return finish();
  if (!G.online) runBot();
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
    if (res.completed.length) { G.flash = new Set(); res.completed.forEach((id) => E.wordCells(G.st.puzzle.words[id]).forEach((c) => G.flash.add(c))); }
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
  toast('Not enough coins — win games or check in daily to earn more');
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
  const sw = h('button', { class: 'btn', onclick: () => doSwap(false) }, 'Swap  ', coin(CONFIG.price.swap));
  const swp = h('button', { class: 'btn ghost', onclick: () => doSwap(true) }, 'Swap and Pass');
  const m = modal(h('div', {}, h('h3', {}, 'Swap Tiles'), h('p', { class: 'muted' }, 'Select up to 5 tiles that you want to swap'), slots, h('hr'), rackRow, h('div', { class: 'btn-row' }, sw, swp)), { cls: 'sheet' });
  draw();
}
function settingsPopup() {
  const s = store.d.settings;
  const snd = h('button', { class: 'btn ghost' }, 'Sound: ' + (s.sound ? 'On' : 'Off'));
  snd.onclick = () => { s.sound = !s.sound; store.save(); snd.textContent = 'Sound: ' + (s.sound ? 'On' : 'Off'); };
  const hp = h('button', { class: 'btn ghost' }, 'Vibration: ' + (s.haptics ? 'On' : 'Off'));
  hp.onclick = () => { s.haptics = !s.haptics; store.save(); hp.textContent = 'Vibration: ' + (s.haptics ? 'On' : 'Off'); };
  const m = modal(h('div', {}, h('h3', {}, 'Game'), snd, hp,
    h('button', { class: 'btn ghost', onclick: () => { m.close(); location.hash = '#/'; } }, G.online ? 'Back to menu (match continues)' : 'Save & exit'),
    h('button', { class: 'btn danger', onclick: () => { m.close(); concede(); } }, 'Give up this match')), { cls: 'sheet' });
}
function concede() {
  G.st.over = true;
  if (G.online) sync({ status: 'done', winner: G.online.role === 'p1' ? 2 : 1 });
  finish('concede');
}
function claimWin() {
  G.st.over = true;
  sync({ status: 'done', winner: G.online.role === 'p1' ? 1 : 2 });
  finish('claim');
}

// ---------- result
function finish(mode) {
  if (G.finished) return; G.finished = true;
  if (G.online) { clearInterval(G.online.timer); G.online.timer = null; store.d.activeOnline = null; }
  const { spec, st } = G;
  let you = st.scores.you, opp = st.scores.opp;
  if (mode === 'concede') opp = Math.max(opp, you + 1);
  if (mode === 'claim') you = Math.max(you, opp + 1);
  const r = store.recordResult({ spec, score: you, oppScore: opp });
  sfx(r.won ? 'win' : 'lose'); if (r.won) { confetti(); hap([30, 50, 30, 50, 80]); }
  const title = r.won ? 'Victory!' : r.draw ? 'Draw' : 'Good game';
  const verse = r.won ? '“Well done, good and faithful servant.” — Matthew 25:21' : r.draw ? '“Iron sharpens iron.” — Proverbs 27:17' : '“Do not grow weary in doing good.” — Galatians 6:9';
  const row = (a, b, cls = '') => h('div', { class: 'res-row ' + cls }, h('span', {}, a), h('b', {}, b));
  const startPct = r.leveledUp ? 0 : Math.round((r.before.into / r.before.need) * 100);
  const endPct = Math.round((r.after.into / r.after.need) * 100);
  const fill = h('i', { style: { width: startPct + '%' } });
  setTimeout(() => { fill.style.width = endPct + '%'; }, 350);
  const next = nextAction(spec);
  const m = modal(h('div', { class: 'result' },
    h('div', { class: 'res-emoji' }, r.won ? '🏆' : r.draw ? '🤝' : '🙏'),
    h('h2', {}, title),
    h('div', { class: 'res-score' }, h('b', {}, r.score), ' – ', h('b', {}, r.oppScore)),
    h('p', { class: 'verse' }, verse),
    h('div', { class: 'res-rows' },
      row('Round points → total', '+' + r.score),
      r.winBonus ? row('Win bonus XP', '+' + r.winBonus) : null,
      r.dailyBonus ? row('Daily puzzle XP', '+' + r.dailyBonus) : null,
      r.coins - r.eventCoins ? row(`Win coins${r.streak > 1 ? ` (streak ×${r.mult})` : ''}`, '+' + (r.coins - r.eventCoins) + ' 🪙', 'gold') : null,
      r.eventCoins ? row('Event reward', '+' + r.eventCoins + ' 🪙', 'gold') : null,
      r.streak > 0 ? row('Win streak', '🔥 ' + r.streak) : null),
    r.leveledUp ? h('div', { class: 'levelup' }, `⬆ Level up! You are now Level ${r.after.level}`) : null,
    h('div', { class: 'lvl-line' }, h('span', {}, 'Level ' + r.after.level), h('div', { class: 'bar' }, fill), h('small', {}, `${r.after.into}/${r.after.need} XP`)),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: () => { m.close(); next.go(); } }, next.label),
      h('button', { class: 'btn ghost', onclick: () => { m.close(); location.hash = '#/'; } }, 'Home'))), { dismiss: false, cls: 'sheet' });
  paint();
}
function nextAction(spec) {
  if (spec.kind === 'main') return { label: 'Next puzzle', go: () => startGame(specMain(store.d.mainNext)) };
  if (spec.kind === 'online') return { label: 'Play online again', go: () => startOnline() };
  if (spec.kind === 'event') {
    const idx = store.d.events[spec.id] || 0;
    return idx < EVENT_PUZZLES ? { label: 'Next event puzzle', go: () => startGame(specEvent(spec.id, idx)) } : { label: 'Event complete ✓', go: () => { location.hash = '#/'; } };
  }
  return { label: 'Daily calendar', go: () => { location.hash = '#/daily'; } };
}
