// The game screen: board, tiles (tap or drag), turns, power-ups, bot or live opponent, result.
import { h, toast, modal, confetti, icon, buzz, coin } from './ui.js';
import { CONFIG, BOT_NAMES, EVENT_PUZZLES } from './config.js';
import { getPuzzle, specMain, specEvent } from './puzzles.js';
import * as E from './engine.js';
import { store } from './store.js';
import { sfx } from './audio.js';
import { A, currentUser } from './cloud.js';
import { findMatch, waitForOpponent, makeWriter, applyRemoteState } from './online.js';
import { absLog } from './replay.js';
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
  return { spec, st, botName, online: null, sel: { tile: null }, pend: new Map(), badShow: null, busy: false, hintUntil: 0, last: null, flash: null, root: null, floats: [], finished: false };
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
// Live updates: Supabase Realtime pushes the opponent's move the moment it is saved; a slow poll
// is the safety net (and the fast fallback if the realtime connection is not available).
function startPolling() {
  const O = G.online; if (!O || O.timer) return;
  O.stopped = false; O.live = false;
  O.sub = A.subscribeMatch(O.id, (row) => handleRow(row), (ok) => { O.live = ok; });
  const tick = async () => {
    if (O.stopped) return;
    await pollOnline();
    if (!O.stopped) O.timer = setTimeout(tick, O.live ? 6000 : 1300);
  };
  O.timer = setTimeout(tick, 1300);
}
function stopOnline() {
  const O = G?.online; if (!O) return;
  O.stopped = true; clearTimeout(O.timer); O.timer = null;
  try { O.sub?.stop(); } catch { /* already closed */ } O.sub = null;
}
async function pollOnline() {
  const O = G?.online;
  if (!O || G.finished || O.busy || O.pending > 0) return;
  O.busy = true;
  try { handleRow(await A.fetchMatch(O.id)); } catch (e) { /* offline blip: try again next tick */ } finally { O.busy = false; }
}
function handleRow(row) {
  const O = G?.online;
  if (!O || !row || O.pending > 0 || G.finished) return;
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
}
function checkIdle() {
  const O = G.online;
  if (G.st.turn === 'opp' && !O.idle && Date.now() - O.lastActive > 90000) { O.idle = true; paint(); }
}

// ---------- saving
function persist() {
  if (G.online) { sync(); return; }
  const { board, scores, turn, placed, rackAtStart, racks, quota, passes, botLevel, log } = G.st;
  store.d.active = { spec: G.spec, botName: G.botName, st: { board, scores, turn, placed, rackAtStart, racks, quota, passes, botLevel, log } };
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
export function leaveGame() { stopOnline(); }

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
      h('div', { class: 'g-foot' }, idleBtn || (st.over ? 'Match finished' : st.turn === 'you' ? (G.pend.size ? 'Press Submit to check your tiles' : 'Drag tiles onto the board, then Submit') : `${G.botName} is playing…`)),
    ));
  G.floats.splice(0).forEach(spawnFloat);
  G.last = null; G.flash = null;
}

const mine = () => G.st.turn === 'you' && !G.busy && !G.st.over;
const ARROW = { 'a-s': '→', 'd-s': '↓', 'a-u': '↳', 'a-v': '↱', 'd-u': '↴', 'd-v': '↲' };
function clueNode(w) {
  const long = (w.clue || '').length;
  const body = w.emoji && !w.clue
    ? h('span', { class: 'emo' }, w.emoji)
    : h('span', { class: 'ct ' + (long > 24 ? 'xs' : long > 15 ? 'sm' : '') }, w.clue.replace('__', '___'));
  const key = w.dir + '-' + w.kind;
  return h('div', { class: 'cl k-' + key, role: 'button', tabindex: 0, onclick: (e) => { e.stopPropagation(); showClue(w); }, onkeydown: (e) => { if (e.key === 'Enter') showClue(w); } },
    body, h('i', { class: 'arr' }, ARROW[key]));
}

function boardEl() {
  const { st } = G, { W, H } = st.puzzle;
  const hint = Date.now() < G.hintUntil;
  const selLetter = G.sel.tile != null ? st.racks.you[G.sel.tile] : null;
  const hintCells = new Set();
  if (hint) (selLetter ? [selLetter] : st.racks.you).forEach((l) => E.targets(st, l).forEach((k) => hintCells.add(k)));
  const grid = h('div', { class: 'grid', style: { '--cols': W, '--rows': H, '--cs': `min(calc((100vw - 16px) / ${W}), calc((100dvh - 340px) / ${H}), 60px)` } });
  st.puzzle.cells.forEach((c, k) => {
    if (c.t === 'c') {
      const kids = c.clues.map((id) => clueNode(st.puzzle.words[id]));
      return grid.append(h('div', { class: 'cell clue ' + (kids.length > 1 ? 'two' : '') }, kids));
    }
    const b = st.board[k];
    const cls = ['cell', 'letter'];
    let text = b.ch || '';
    if (b.ch) cls.push('f-' + b.by);
    else if (G.badShow?.has(k)) { cls.push('bad'); text = G.badShow.get(k); }
    else if (G.pend.has(k)) { cls.push('pend'); text = st.racks.you[G.pend.get(k)] || ''; }
    if (c.given) cls.push('given');
    if (hintCells.has(k) && !b.ch) cls.push('hint');
    if (G.last && G.last.cell === k) cls.push('pop');
    if (G.flash && G.flash.has(k)) cls.push('flash');
    grid.append(h('div', { class: cls.join(' '), 'data-k': k, onclick: () => onCell(k) }, text));
  });
  return h('div', { class: 'grid-wrap' }, grid);
}

function rackEl() {
  const { st } = G;
  const out = new Set(G.pend.values());
  const tiles = st.racks.you.map((l, i) => h('button', {
    class: 'tile' + (G.sel.tile === i ? ' sel' : '') + (mine() ? '' : ' dim') + (out.has(i) ? ' out' : ''), 'aria-label': 'Tile ' + l,
    onpointerdown: (e) => startDrag(e, i),
    onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onTile(i); } },
  }, l));
  return h('div', { class: 'rack-wrap' },
    h('div', { class: 'rack' }, tiles.length ? tiles : h('span', { class: 'muted' }, st.over ? '' : 'No tiles')),
    G.pend.size && mine() ? h('button', { class: 'recall', onclick: recall }, '↩ Take all back') : null);
}

function ab(cls, label, ico, onclick, extra, disabled) {
  return h('button', { class: 'act ' + cls, onclick, disabled }, h('span', { class: 'ico', html: icon(ico, 24) }), h('span', { class: 'lbl' }, label), extra);
}
function actionsEl() {
  const { st } = G;
  const can = mine();
  const inv = store.d.inv;
  const center = G.pend.size
    ? h('button', { class: 'main-act ok', disabled: !can, onclick: submitTurn }, h('span', { html: icon('check', 22) }), `Submit · ${G.pend.size}`)
    : h('button', { class: 'main-act', disabled: !can, onclick: passTurn }, 'Pass');
  const cost = (kind) => h('span', { class: 'cost' }, coin(CONFIG.price[kind]));
  return h('div', { class: 'actions' },
    ab('swap', 'Swap', 'swap', swapPopup, cost('swap'), !can),
    center,
    ab('word', 'Word', 'eye', () => toast('Tap a clue, then choose “Reveal this word”'), inv.word > 0 ? h('span', { class: 'badge' }, inv.word) : cost('word'), !can),
    ab('hint', 'Hint', 'bulb', useHint, inv.hint > 0 ? h('span', { class: 'badge' }, inv.hint) : cost('hint'), !can));
}

// ---------- interactions
// Tapping a clue only shows it larger. It never highlights squares or places anything.
function showClue(w) {
  const done = w.cells.every((k) => G.st.board[k].ch);
  const text = w.emoji && !w.clue ? h('div', { class: 'big-emo' }, w.emoji) : h('div', { class: 'big-clue' }, w.clue.replace('__', '_____'));
  const inv = store.d.inv;
  const reveal = h('button', { class: 'btn ghost sm', disabled: !mine() || done, onclick: () => { m.close(); useWord(w); } },
    done ? 'Word complete' : ['Reveal this word  ', inv.word > 0 ? h('span', { class: 'badge inline' }, inv.word) : coin(CONFIG.price.word)]);
  const m = modal(h('div', { class: 'clue-pop' }, text, h('div', { class: 'len' }, `${w.len} letters · ${w.dir === 'a' ? 'across →' : 'down ↓'}`), reveal), { cls: 'clue-modal' });
  m.back.classList.add('clear');
}

function onTile(i) {
  if (!mine()) return;
  if ([...G.pend.values()].includes(i)) return;
  G.sel.tile = G.sel.tile === i ? null : i;
  paint();
}
function onCell(k) {
  if (!mine() || G.st.board[k].ch) return;
  if (G.pend.has(k)) { G.pend.delete(k); sfx('place'); hap(6); return paint(); } // tap a tile on the board to take it back
  if (G.sel.tile != null) put(G.sel.tile, k);
}
/** Put rack tile i on cell k. Any tile is accepted; nothing is checked until Submit. */
function put(i, k) {
  if (!mine() || G.st.board[k].ch) return;
  for (const [cell, idx] of G.pend) if (idx === i) G.pend.delete(cell); // moving a tile that is already out
  G.pend.set(k, i);
  G.sel.tile = null;
  sfx('place'); hap(8);
  paint();
}
function recall() { G.pend.clear(); G.sel.tile = null; paint(); }

// drag a tile from the rack onto the board (a short press is treated as a tap)
function startDrag(e, i) {
  if (!mine() || e.button > 0) return;
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
    if (!moved) { moved = true; ghost = h('div', { class: 'tile ghost' }, letter); document.body.append(ghost); tile.classList.add('lifted'); }
    ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY - 36 + 'px';
    mark(over(ev.clientX, ev.clientY - 36));
  };
  const up = (ev) => {
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    ghost?.remove(); tile.classList.remove('lifted');
    G.root.querySelectorAll('.cell.drop').forEach((c) => c.classList.remove('drop'));
    if (!moved) return onTile(i);
    const cell = over(ev.clientX, ev.clientY - 36);
    if (cell && !G.st.board[+cell.dataset.k].ch) put(i, +cell.dataset.k);
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
function bigFloat(text, cls = '') {
  const el = h('div', { class: 'bigfloat ' + cls }, text);
  document.body.append(el); setTimeout(() => el.remove(), 1500);
}

/** Submit: right tiles score, wrong ones cost a point each and return to the rack, then the turn passes. */
function submitTurn() {
  if (!mine() || !G.pend.size) return;
  const items = [...G.pend].map(([cell, i]) => ({ cell, letter: G.st.racks.you[i] }));
  G.pend.clear(); G.sel.tile = null;
  const res = E.submit(G.st, 'you', items);
  if (!res.ok) return paint();
  const r = E.endTurn(G.st);
  if (res.right.length) {
    sfx(res.completed.length ? 'word' : 'place'); hap(res.completed.length ? [25, 40, 25] : 12);
    G.last = { cell: res.right[res.right.length - 1].cell };
    if (res.completed.length) { G.flash = new Set(); res.completed.forEach((id) => E.wordCells(G.st.puzzle.words[id]).forEach((c) => G.flash.add(c))); }
    G.floats.push({ cell: res.right[res.right.length - 1].cell, text: '+' + res.points, cls: res.completed.length ? 'big' : '' });
  }
  if (res.wrong.length) {
    sfx('wrong'); hap(70);
    G.badShow = new Map(res.wrong.map((w) => [w.cell, w.letter]));
    setTimeout(() => { if (G) { G.badShow = null; paint(); } }, 900);
    bigFloat(`${res.wrong.length} wrong  −${res.penalty}`, 'bad');
  }
  if (r.bonus) { sfx('bonus'); hap([20, 30, 20, 30, 40]); setTimeout(() => bigFloat(`ALL 5 RIGHT  +${r.bonus}`), res.wrong.length ? 0 : 0); }
  persist(); paint();
  if (G.st.over) return finish();
  if (!G.online) runBot();
}
function passTurn() {
  if (!mine()) return;
  G.pend.clear(); G.sel.tile = null;
  E.endTurn(G.st);
  persist(); paint();
  if (G.st.over) return finish();
  if (!G.online) runBot();
}

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
    paint();
    await sleep(750);
  }
  const r = E.endTurn(G.st);
  if (r.bonus) { sfx('bonus'); bigFloat(`${G.botName}: ALL 5 RIGHT +${r.bonus}`); }
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
  E.logMove(G.st, 'you', 'h'); persist();
  G.hintUntil = Date.now() + 5000;
  paint(); setTimeout(() => G && paint(), 5100);
}
function useWord(w) {
  if (w.cells.every((k) => G.st.board[k].ch)) { toast('That word is already complete'); return; }
  if (!spendOrPrompt('word')) return;
  for (const [cell] of [...G.pend]) if (w.cells.includes(cell)) G.pend.delete(cell);
  E.revealWord(G.st, 'you', w.id);
  sfx('word'); persist(); paint();
  if (G.st.over) finish();
}
function swapPopup() {
  G.pend.clear(); G.sel.tile = null; paint();
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
    E.swap(G.st, 'you', [...picked].map((i) => G.st.racks.you[i]), !pass);
    m.close(); persist();
    if (pass) passTurn(); else paint();
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
  if (G.online) { stopOnline(); store.d.activeOnline = null; }
  const { spec, st } = G;
  let you = st.scores.you, opp = st.scores.opp;
  if (mode === 'concede') opp = Math.max(opp, you + 1);
  if (mode === 'claim') you = Math.max(you, opp + 1);
  const role = G.online?.role === 'p2' ? 1 : 0;
  const r = store.recordResult({ spec, score: you, oppScore: opp, log: absLog(st.log, role), role, matchId: G.online?.id || null, mode: mode || null });
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
