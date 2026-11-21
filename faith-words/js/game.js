// The game screen: board, tiles (tap or drag), turns, power-ups, bot or live opponent, result.
import { turnBanner, h, toast, modal, confetti, bigConfetti, burst, wordBanner, icon, buzz, coin } from './ui.js';
import { shareText, shareOut } from './share.js';
import { syncMusic } from './audio.js';
import { A, currentUser, challengeAnswer } from './cloud.js';
import { randomOnlineSeed } from './spec.js';
import { CONFIG, BOT_NAMES, EVENT_PUZZLES } from './config.js';
import { getPuzzle, specMain, specEvent, specDrop } from './puzzles.js';
import { findDrop } from './spec.js';
import * as E from './engine.js';
import { store, todayStr } from './store.js';
import { sfx } from './audio.js';
import { findMatch, waitForOpponent, makeWriter, applyRemoteState } from './online.js';
import { absLog } from './replay.js';
import { verseCard } from './verseui.js';
import { questsFor, questText } from './quests.js';
import { showHowTo } from './howto.js';

let G = null; // current game
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hap = (p) => buzz(p, store.d.settings);
const TILE_MS = 280, COUNT_STEP = 70, BOT_TILE_MS = 700; // pace of the point count: a little slower than before
export const TURN_SECONDS = 30; // online: each turn lasts this long, then the game plays it for the player
const BOT_PAUSE = 1700; // ms between the player's score count and the bot's first move

export const _debug = () => G;
export function hasActive() { return !!store.d.active; }
export function activeLabel() { return store.d.active?.spec.label; }
export const hasOnlineActive = () => !!store.d.activeOnline;

// ---------- starting games
// Open the game screen. Already being on it (Next puzzle after a result) does not fire a hashchange,
// so the screen is redrawn explicitly: otherwise the new puzzle would exist but the old board stay on screen.
function showGame() {
  if (location.hash === '#/game') window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = '#/game';
}
// Saved games: one is active; the others are parked, so an event puzzle and the main game can both be in progress.
const MAX_PARKED = 6;
function parkActive(exceptSeed) {
  const a = store.d.active;
  if (!a || a.spec.seed === exceptSeed) return;
  const p = (store.d.parked ||= {});
  p[a.spec.seed] = a;
  Object.keys(p).slice(0, Math.max(0, Object.keys(p).length - MAX_PARKED)).forEach((k) => delete p[k]);
}
export const parkedGames = () => Object.values(store.d.parked || {}).map((a) => ({ seed: a.spec.seed, label: a.spec.label }));
export function resumeParked(seed) {
  const a = store.d.parked?.[seed]; if (!a) return false;
  parkActive(seed);
  delete store.d.parked[seed];
  store.d.active = a; store.save();
  return resumeGame();
}
export function discardParked(seed) { if (store.d.parked) { delete store.d.parked[seed]; store.save(); } }
// ---- friend challenges: play the same puzzle at different times and compare scores
export const challengeLink = (id) => location.origin + location.pathname + '#/c/' + id;
export function startChallenge() { // you go first: finish it and a link to send comes up
  if (!currentUser()) { toast('Sign in to challenge a friend'); location.hash = '#/me'; return; }
  startGame({ kind: 'challenge', seed: randomOnlineSeed(), label: 'Friend challenge', ch: { create: true } });
}
export function startChallengeReply(c) { startGame({ kind: 'challenge', seed: c.seed, label: 'Challenge from ' + c.creator_name, ch: { reply: c.id } }); }

// ---- quick reactions in live matches
const REACTS = { amen: ['🙏', 'Amen'], praise: ['🙌', 'Praise God'], well: ['👏', 'Well done'], bless: ['❤️', 'Blessed'] };
let lastReact = 0;
export function showReaction(key, who) {
  const r = REACTS[key]; if (!r) return;
  const el = h('div', { class: 'react-bubble ' + who }, r[0] + ' ' + r[1]); document.body.append(el);
  if (who === 'opp') sfx('right', 1);
  setTimeout(() => el.remove(), 2400);
}
function sendReaction(key) {
  const O = G?.online; if (!O || Date.now() - lastReact < 1500) return; lastReact = Date.now();
  O.sub?.react?.(key); showReaction(key, 'you');
}
const reactBar = () => h('div', { class: 'react-bar', id: 'react-bar' }, Object.entries(REACTS).map(([k, [e, t]]) => h('button', { class: 'react-btn', 'data-react': k, 'aria-label': t, title: t, onclick: () => sendReaction(k) }, e)));

export function startGame(spec) {
  if (store.d.parked?.[spec.seed]) return resumeParked(spec.seed); // that puzzle was already in progress: carry on
  parkActive(spec.seed);
  const puzzle = getPuzzle(spec);
  const st = E.newGame(puzzle, { botLevel: store.level().level });
  G = newCtx(spec, st, BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]);
  persist();
  showGame();
}
export function resumeGame() {
  const a = store.d.active; if (!a) return false;
  const st = E.newGame(getPuzzle(a.spec), { botLevel: a.st.botLevel });
  Object.assign(st, a.st);
  G = newCtx(a.spec, st, a.botName);
  showGame();
  return true;
}
function newCtx(spec, st, botName) {
  return { spec, st, botName, online: null, sel: { tile: null, cell: null }, pend: new Map(), badShow: null, hintMode: false, wordMode: false, busy: false,  last: null, flash: null, root: null, floats: [], finished: false };
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
  const oppTitle = (role === 'p1' ? row.p2_title : row.p1_title) || '';
  const oppName = ((role === 'p1' ? row.p2_name : row.p1_name) || 'Opponent') + (oppTitle ? ' · ' + oppTitle : '');
  G = newCtx(spec, st, oppName);
  G.online = { id: row.id, role, write: makeWriter(row.id, role), stamp: row.updated_at, timer: null, pending: 0, busy: false, lastActive: Date.now(), idle: false };
  store.d.activeOnline = { id: row.id, role }; store.save();
  showGame();
}
function sync(extra) {
  const O = G.online; O.pending++;
  return O.write(G.st, extra).finally(() => { O.pending--; });
}
// Live updates: Supabase Realtime pushes the opponent's move the moment it is saved; a slow poll
// is the safety net (and the fast fallback if the realtime connection is not available).
function turnLeft() { const O = G.online; return O ? Math.max(0, TURN_SECONDS - (Date.now() - O.lastActive) / 1000) : TURN_SECONDS; }
/** Once a second: show the countdown, and when my 30 seconds are up submit what is on the board (or pass). */
function tickTurn() {
  const O = G?.online; if (!O || O.stopped || G.finished) return;
  const left = Math.ceil(turnLeft()), el = document.getElementById('turn-clock');
  if (el) { el.textContent = G.st.over ? '' : left + 's'; el.classList.toggle('low', left <= 8); el.classList.toggle('mine', G.st.turn === 'you'); }
  const urgent = G.st.turn === 'you' && !G.st.over && left <= 8 && left > 0;
  document.body.classList.toggle('urgent', urgent);
  if (urgent && O.lastTick !== left) { O.lastTick = left; sfx('pick'); buzz?.(6); }
  if (G.st.turn === 'you' && !G.busy && !G.st.over && left <= 0 && !O.expiring && O.pending === 0) {
    O.expiring = true;
    document.querySelectorAll('.modal-back').forEach((e) => e.remove());
    G.hintMode = false; G.wordMode = false;
    (G.pend.size ? submitTurn() : Promise.resolve(passTurn())).finally(() => { O.expiring = false; O.lastActive = Date.now(); });
  }
}
function startPolling() {
  const O = G.online; if (!O || O.timer) return;
  O.clock = setInterval(tickTurn, 500);
  O.stopped = false; O.live = false;
  O.sub = A.subscribeMatch(O.id, (row) => handleRow(row), (ok) => { O.live = ok; }, (p) => showReaction(p?.k, 'opp'));
  const tick = async () => {
    if (O.stopped) return;
    await pollOnline();
    if (!O.stopped) O.timer = setTimeout(tick, O.live ? 6000 : 1300);
  };
  O.timer = setTimeout(tick, 1300);
}
function stopOnline() {
  document.body.classList.remove('urgent');
  const O = G?.online; if (!O) return;
  O.stopped = true; clearTimeout(O.timer); O.timer = null; clearInterval(O.clock);
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
  if (G.st.turn === 'opp' && !O.idle && Date.now() - O.lastActive > (TURN_SECONDS + 20) * 1000) { O.idle = true; paint(); }
}

// ---------- saving
function persist() {
  if (G.online) { sync(); return; }
  const { board, scores, turn, placed, rackAtStart, racks, quota, passes, botLevel, log, hints } = G.st;
  store.d.active = { spec: G.spec, botName: G.botName, st: { board, scores, turn, placed, rackAtStart, racks, quota, passes, botLevel, log, hints } };
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
  if (G.bannerTurn !== undefined && G.bannerTurn !== st.turn && !st.over && !G.finished) {
    if (st.turn === 'you') { turnBanner('Your turn', 'you'); sfx('turn'); } else turnBanner((G.botName || 'Opponent') + (G.online ? "'s turn" : ' is thinking…'), 'opp');
  }
  G.bannerTurn = st.turn;
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
          h('div', { class: 'nm' }, 'You'), h('div', { class: 'sc', id: 'sc-you' }, G.shown ? G.shown.you : st.scores.you)),
        h('span', { class: 'vs' }, G.online ? h('b', { id: 'turn-clock', class: 'turn-clock' }, Math.ceil(turnLeft()) + 's') : 'vs'),
        h('div', { class: 'side opp' + (st.turn === 'opp' && !st.over ? ' on' : '') },
          h('div', { class: 'sc', id: 'sc-opp' }, G.shown ? G.shown.opp : st.scores.opp),
          h('div', { class: 'nm' }, G.botName, G.online ? null : h('small', {}, ' Lv ' + st.botLevel)),
          h('div', { class: 'av opp' }, oppInit))),
      G.online ? reactBar() : null,
      boardEl(),
      rackEl(),
      actionsEl(),
      h('div', { class: 'g-foot' + (G.wordMode ? ' picking' : '') }, idleBtn || (G.wordMode
        ? [h('span', {}, 'Tap a glowing clue to show its word'), h('button', { class: 'linkbtn', onclick: cancelWord }, 'Cancel')]
        : st.over ? 'Match finished'
        : st.turn === 'you' ? (G.sel.cell != null ? 'Tap an empty square to move that tile' : G.pend.size ? 'Press Submit to check your tiles' : 'Drag tiles onto the board, then Submit')
        : `${G.botName} is playing…`)),
    ));
  G.floats.splice(0).forEach(spawnFloat);
  G.last = null; G.flash = null;
}

const mine = () => G.st.turn === 'you' && !G.busy && !G.st.over && !G.finished;
const ARROW = { 'a-s': '→', 'd-s': '↓', 'a-u': '↳', 'a-v': '↱', 'd-u': '↴', 'd-v': '↲' };
function clueNode(w) {
  const long = (w.clue || '').length;
  const body = w.emoji && !w.clue
    ? h('span', { class: 'emo' }, w.emoji)
    : h('span', { class: 'ct ' + (long > 24 ? 'xs' : long > 15 ? 'sm' : '') }, w.clue.replace('__', '___'));
  const key = w.dir + '-' + w.kind;
  const done = w.cells.every((k) => G.st.board[k].ch || G.st.hints.includes(k)); // nothing left to show
  const open = (e) => {
    e?.stopPropagation();
    if (G.wordMode) return done ? toast('That word is already shown or complete') : pickWord(w);
    showClue(w);
  };
  return h('div', { class: 'cl k-' + key + (G.wordMode ? (done ? ' done' : ' pick') : ''), role: 'button', tabindex: 0, onclick: open, onkeydown: (e) => { if (e.key === 'Enter') open(); } },
    body, h('i', { class: 'arr' }, ARROW[key]));
}

function boardEl() {
  const { st } = G, { W, H } = st.puzzle;
  const grid = h('div', { class: 'grid' + (G.wordMode ? ' wordmode' : ''), style: { '--cols': W, '--rows': H, '--cs': `min(calc((100vw - 16px) / ${W}), calc((100dvh - 340px) / ${H}), 60px)` } });
  st.puzzle.cells.forEach((c, k) => {
    if (c.t === 'o') return grid.append(h('div', { class: 'cell orn', 'aria-hidden': 'true' }, k % 2 ? '✝' : '🕊️'));
    if (c.t === 'c') {
      const kids = [...c.clues].sort((x, y) => (st.puzzle.words[x].dir === 'a' ? 0 : 1) - (st.puzzle.words[y].dir === 'a' ? 0 : 1)).map((id) => clueNode(st.puzzle.words[id]));
      return grid.append(h('div', { class: 'cell clue ' + (kids.length > 1 ? 'two' : '') }, kids));
    }
    const b = st.board[k];
    const cls = ['cell', 'letter'];
    let text = b.ch || '';
    if (G.anim?.has(k)) { cls.push('pend'); text = G.anim.get(k); }
    else if (b.ch) cls.push('f-' + b.by);
    else if (G.badShow?.has(k)) { cls.push('bad'); text = G.badShow.get(k); }
    else if (G.pend.has(k)) { cls.push('pend'); text = st.racks.you[G.pend.get(k)] || ''; }
    if (c.given) cls.push('given');
    if (!b.ch && st.hints.includes(k) && !G.pend.has(k) && !G.anim?.has(k) && !G.badShow?.has(k)) { cls.push('ghost-hint'); if (G.newHints?.has(k)) cls.push('hint-new'); text = c.ch; }
    if (G.hintMode && !b.ch) cls.push('pickable');
    if (G.last && G.last.cell === k) cls.push('pop');
    if (G.flash && G.flash.has(k)) cls.push('flash');
    const movable = !b.ch && G.pend.has(k) && !G.anim?.has(k) && mine() && !G.wordMode;
    if (movable && G.sel.cell === k) cls.push('sel-cell');
    grid.append(h('div', movable
      ? { class: cls.join(' '), 'data-k': k, onpointerdown: (e) => startDrag(e, G.pend.get(k), k) }
      : { class: cls.join(' '), 'data-k': k, onclick: () => onCell(k) }, text));
  });
  return h('div', { class: 'grid-wrap' }, grid);
}

function rackEl() {
  const { st } = G;
  const out = new Set(G.pend.values());
  const key = st.racks.you.join(''), fresh = G.rackKey !== key && !G.pend.size; G.rackKey = key;
  const tiles = st.racks.you.map((l, i) => h('button', {
    style: fresh ? { '--i': i } : null,
    class: 'tile' + (fresh ? ' enter' : '') + (G.sel.tile === i ? ' sel' : '') + (mine() && !G.wordMode ? '' : ' dim') + (out.has(i) ? ' out' : ''), 'aria-label': 'Tile ' + l,
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
    ? h('button', { class: 'main-act ok', disabled: !can || G.wordMode, onclick: submitTurn }, h('span', { html: icon('check', 22) }), `Submit · ${G.pend.size}`)
    : h('button', { class: 'main-act', disabled: !can || G.wordMode, onclick: passTurn }, 'Pass');
  const cost = (kind) => h('span', { class: 'cost' }, coin(CONFIG.price[kind]));
  return h('div', { class: 'actions' },
    ab('swap', 'Swap', 'swap', swapPopup, cost('swap'), !can || G.wordMode),
    center,
    ab('word' + (G.wordMode ? ' on' : ''), G.wordMode ? 'Cancel' : 'Word', 'eye', useWordBtn, inv.word > 0 ? h('span', { class: 'badge' }, inv.word) : cost('word'), !can),
    ab('hint', 'Hint', 'bulb', useHint, inv.hint > 0 ? h('span', { class: 'badge' }, inv.hint) : cost('hint'), !can || G.wordMode));
}

// ---------- interactions
// Tapping a clue only shows it larger. It never highlights squares or places anything.
function showClue(w) {
  const full = w.cells.every((k) => G.st.board[k].ch), done = full || w.cells.every((k) => G.st.board[k].ch || G.st.hints.includes(k));
  const text = w.emoji && !w.clue ? h('div', { class: 'big-emo' }, w.emoji) : h('div', { class: 'big-clue' }, w.clue.replace('__', '_____'));
  const inv = store.d.inv;
  const reveal = h('button', { class: 'btn ghost sm', disabled: !mine() || done, onclick: () => { m.close(); useWord(w); } },
    full ? 'Word complete' : done ? 'Already shown' : ['Show this word  ', inv.word > 0 ? h('span', { class: 'badge inline' }, inv.word) : coin(CONFIG.price.word)]);
  const m = modal(h('div', { class: 'clue-pop' }, text, h('div', { class: 'len' }, `${w.len} ${w.len === 1 ? 'letter' : 'letters'} · ${w.dir === 'a' ? 'across →' : 'down ↓'}`), reveal), { cls: 'clue-modal' });
  m.back.classList.add('clear');
}

function onTile(i) {
  if (!mine() || G.wordMode) return;
  if (G.hintMode) G.hintMode = false;
  const cell = [...G.pend].find(([, idx]) => idx === i)?.[0];
  if (cell != null) { G.pend.delete(cell); G.sel.cell = null; sfx('recall'); hap(6); return paint(); } // tap a tile that is out: it goes back to the rack
  G.sel.cell = null;
  G.sel.tile = G.sel.tile === i ? null : i;
  sfx('pick');
  paint();
}
function onCell(k) {
  if (G.wordMode) return;
  if (G.hintMode) return pickHint(k);
  if (!mine() || G.st.board[k].ch) return;
  if (G.sel.tile != null) return put(G.sel.tile, k);                   // rack tile → this square
  const from = G.sel.cell;
  if (from != null && from !== k && G.pend.has(from)) return put(G.pend.get(from), k); // placed tile → this square
  if (G.pend.has(k)) { G.sel.cell = from === k ? null : k; sfx('pick'); return paint(); } // select a placed tile to move it
}
/** Put tile i (from the rack or from another square) on cell k. Landing on a placed tile swaps them.
 *  Any tile is accepted; nothing is checked until Submit. */
function put(i, k) {
  if (!mine() || G.wordMode || G.st.board[k].ch) return;
  let from = null;
  for (const [cell, idx] of G.pend) if (idx === i) from = cell;
  const displaced = G.pend.get(k);
  if (from != null) G.pend.delete(from);
  G.pend.set(k, i);
  if (displaced != null && displaced !== i && from != null) G.pend.set(from, displaced); // swap places
  G.sel.tile = null; G.sel.cell = null;
  sfx('drop'); hap(8);
  paint();
}
function recall() { G.pend.clear(); G.sel.tile = null; G.sel.cell = null; sfx('recall'); paint(); }

// Drag a tile: from the rack, or from a square it was already placed on (so it can go straight to another
// square, swap with another placed tile, or be dropped on the rack to take it back). A short press is a tap.
function startDrag(e, i, fromCell = null) {
  if (!mine() || G.wordMode || e.button > 0) return;
  const src = e.currentTarget, x0 = e.clientX, y0 = e.clientY;
  let ghost = null, moved = false;
  const letter = G.st.racks.you[i];
  const at = (x, y) => document.elementFromPoint(x, y);
  const overCell = (x, y) => at(x, y)?.closest('.cell.letter');
  const mark = (cell) => {
    G.root.querySelectorAll('.cell.drop').forEach((c) => c.classList.remove('drop'));
    if (cell && !G.st.board[+cell.dataset.k].ch) cell.classList.add('drop');
  };
  const move = (ev) => {
    if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return;
    if (!moved) { moved = true; ghost = h('div', { class: 'tile ghost' }, letter); document.body.append(ghost); src.classList.add('lifted'); sfx('pick'); }
    ghost.style.left = ev.clientX + 'px'; ghost.style.top = ev.clientY - 36 + 'px';
    mark(overCell(ev.clientX, ev.clientY - 36));
  };
  const up = (ev) => {
    window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
    ghost?.remove(); src.classList.remove('lifted');
    G.root.querySelectorAll('.cell.drop').forEach((c) => c.classList.remove('drop'));
    if (!moved) return fromCell != null ? onCell(fromCell) : onTile(i);
    const cell = overCell(ev.clientX, ev.clientY - 36);
    if (cell && !G.st.board[+cell.dataset.k].ch) return put(i, +cell.dataset.k);
    const onRack = at(ev.clientX, ev.clientY)?.closest('.rack-wrap') || at(ev.clientX, ev.clientY - 36)?.closest('.rack-wrap');
    if (fromCell != null && onRack) { G.pend.delete(fromCell); G.sel.cell = null; sfx('recall'); paint(); }
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

/** Submit: right tiles score, wrong ones cost a point each and return to the rack, then the turn passes.
 *  The result is worked out at once (and saved), then played back tile by tile so the player sees every point counted. */
async function submitTurn() {
  if (!mine() || !G.pend.size) return;
  const g = G;
  const items = [...G.pend].map(([cell, i]) => ({ cell, letter: G.st.racks.you[i] }));
  const before = G.st.scores.you;
  G.pend.clear(); G.sel.tile = null; G.sel.cell = null;
  const res = E.submit(G.st, 'you', items);
  if (!res.ok) return paint();
  const r = E.endTurn(G.st);
  if (G.online) G.online.lastActive = Date.now();
  persist();
  const ptsOf = new Map(res.right.map((x) => [x.cell, x.points])), comboOf = new Map(res.right.filter((x) => x.combo).map((x) => [x.cell, x.streak]));
  const doneBy = new Map(); // which tile completed which word
  res.completed.forEach((id) => { const w = G.st.puzzle.words[id]; const last = [...res.right].reverse().find((x) => w.cells.includes(x.cell)); if (last) doneBy.set(last.cell, w); });
  let rightN = 0;
  G.busy = true; G.shown = { you: before, opp: G.st.scores.opp };
  G.anim = new Map(items.map((i) => [i.cell, i.letter])); G.badShow = new Map(); G.flash = null;
  paint();
  for (const it of items) {
    await sleep(TILE_MS);
    if (G !== g) return;
    G.anim.delete(it.cell);
    let target;
    if (ptsOf.has(it.cell)) {
      const pts = ptsOf.get(it.cell), w = doneBy.get(it.cell);
      target = G.shown.you + pts; G.last = { cell: it.cell };
      rightN++;
      if (w) { G.flash = new Set(w.cells); sfx('word', rightN); hap([25, 40, 25]); } else { sfx('right', rightN); hap(10); }
      G.floats.push({ cell: it.cell, text: '+' + pts, cls: w ? 'big' : '' });
      if (comboOf.has(it.cell)) G.floats.push({ cell: it.cell, text: `COMBO ×${comboOf.get(it.cell)}`, cls: 'combo' });
      if (w) { paint(); setTimeout(() => { burst(document.querySelector(`.cell[data-k="${it.cell}"]`)); if (w.len >= 4) wordBanner(w.ans); }, 30); }
    } else {
      target = Math.max(0, G.shown.you - 1); G.badShow.set(it.cell, it.letter);
      sfx('wrong'); hap(60);
      G.floats.push({ cell: it.cell, text: '−1', cls: 'neg' });
    }
    paint();                                  // the tile lands, then the score counts up to it one point at a time
    await countTo(g, 'you', target, COUNT_STEP); if (G !== g) return;
  }
  if (r.bonus) {
    await sleep(380); if (G !== g) return;
    sfx('bonus'); hap([20, 30, 20, 30, 40]); bigFloat(`ALL 5 RIGHT  +${r.bonus}`); paint();
    await countTo(g, 'you', G.shown.you + r.bonus, 50); if (G !== g) return;
  }
  await sleep(items.length ? 620 : 0); if (G !== g) return;
  G.shown = null; G.anim = null; G.flash = null;
  const botNext = !G.online && !G.st.over;
  G.busy = botNext; // stays locked through the pause so nothing else can start the bot's turn
  setTimeout(() => { if (G === g && G.badShow) { G.badShow = null; paint(); } }, 500);
  paint();
  if (G.st.over) { G.busy = false; return finish(); }
  if (botNext) { // a clear beat after the count, then the opponent plays
    await sleep(BOT_PAUSE); if (G !== g || g.finished) return;
    runBot(0);
  }
}
function bumpScore(who = 'you') { const el = document.getElementById('sc-' + who); if (el) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); } }
/** Count a player's displayed score up (or down) to `to`, one point per step, so every point is seen being added. */
async function countTo(g, who, to, step) {
  while (G === g && g.shown && g.shown[who] !== to) {
    g.shown[who] += Math.sign(to - g.shown[who]);
    const el = document.getElementById('sc-' + who); if (el) el.textContent = g.shown[who];
    bumpScore(who); sfx('tick', g.shown[who]);
    await sleep(step);
  }
}
function passTurn() {
  if (!mine()) return;
  G.pend.clear(); G.sel.tile = null; G.sel.cell = null;
  E.endTurn(G.st);
  if (G.online) G.online.lastActive = Date.now();
  persist(); paint();
  if (G.st.over) return finish();
  if (!G.online) runBot();
}

async function runBot(lead = 900) {
  if (G.botRunning) return;
  G.busy = true; G.botRunning = true; paint(); sfx('turn');
  if (lead) await sleep(lead);
  let guard = 0;
  const g = G;
  G.shown = { you: G.st.scores.you, opp: G.st.scores.opp };
  while (guard++ < 8 && G === g && !G.finished) {
    const s = E.botStep(G.st);
    if (!s) break;
    const res = E.place(G.st, 'opp', s.letter, s.cell);
    if (!res.ok) break;
    sfx('opp');
    G.last = { cell: s.cell };
    if (res.completed.length) { G.flash = new Set(); res.completed.forEach((id) => E.wordCells(G.st.puzzle.words[id]).forEach((c) => G.flash.add(c))); }
    G.floats.push({ cell: s.cell, text: '+' + res.points, cls: 'opp ' + (res.completed.length ? 'big' : '') });
    paint();
    if (res.completed.length) burst(document.querySelector(`.cell[data-k="${s.cell}"]`), 8);
    await sleep(260); if (G !== g) return;
    await countTo(g, 'opp', G.st.scores.opp, COUNT_STEP); if (G !== g) return; // the bot's points are counted up too
    await sleep(BOT_TILE_MS - 260);
  }
  if (G !== g) return;
  const r = E.endTurn(G.st);
  if (r.bonus) {
    sfx('bonus'); bigFloat(`${G.botName}: ALL 5 RIGHT +${r.bonus}`); await sleep(300);
    await countTo(g, 'opp', G.st.scores.opp, 50); if (G !== g) return;
    await sleep(350);
  }
  G.shown = null; G.last = null; G.botRunning = false; G.busy = false;
  persist(); paint();
  if (G.st.over) finish();
}

function spendOrPrompt(kind) {
  if (store.spend(kind)) { sfx('coin'); return true; }
  toast('Not enough coins — win games or check in daily to earn more');
  return false;
}
// Hint: choose a square and its letter is shown faintly there for the rest of the game. It never fills the square.
function useHint() {
  if (!mine()) return;
  G.wordMode = false;
  if (G.hintMode) { G.hintMode = false; return paint(); }
  const left = G.st.puzzle.cells.some((c, k) => c.t === 'l' && !G.st.board[k].ch && !G.st.hints.includes(k));
  if (!left) return toast('Nothing left to hint');
  G.hintMode = true; G.sel.tile = null; G.sel.cell = null;
  toast('Tap an empty square to see its letter');
  sfx('whoosh'); paint();
}
function pickHint(k) {
  const { st } = G, c = st.puzzle.cells[k];
  if (c.t !== 'l' || st.board[k].ch || st.hints.includes(k)) return toast('Pick an empty square without a hint');
  if (!spendOrPrompt('hint')) { G.hintMode = false; return paint(); }
  E.addHint(st, 'you', k);
  G.hintMode = false; G.pend.delete(k);
  sfx('sparkle'); persist(); paint();
}
// Word power-up: tap Word and every unsolved clue on the board glows; tiles are locked until one clue is chosen.
function useWordBtn() {
  if (!mine()) return;
  G.hintMode = false;
  if (G.wordMode) return cancelWord();
  if (G.st.puzzle.words.every((w) => w.cells.every((k) => G.st.board[k].ch))) return toast('Every word is already complete');
  if (!(store.d.inv.word > 0) && !(store.d.coins >= CONFIG.price.word)) return toast('Not enough coins — win games or check in daily to earn more');
  G.wordMode = true; G.sel.tile = null; G.sel.cell = null;
  sfx('whoosh'); hap(12); paint();
}
function cancelWord() { G.wordMode = false; sfx('recall'); paint(); }
function pickWord(w) { G.wordMode = false; useWord(w); }
// Word works like Hint for a whole word: its letters appear faintly in every empty square, nothing is filled in.
function useWord(w) {
  if (w.cells.every((k) => G.st.board[k].ch || G.st.hints.includes(k))) { toast('That word is already shown or complete'); return paint(); }
  if (!spendOrPrompt('word')) return paint();
  const fresh = G.newHints = new Set(E.revealWord(G.st, 'you', w.id));
  sfx('power'); hap([20, 30, 20]); persist(); paint();
  setTimeout(() => { if (G?.newHints === fresh) G.newHints = null; }, 1400);
}
function swapPopup() {
  G.pend.clear(); G.sel.tile = null; G.sel.cell = null; paint();
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
  const mu = h('button', { class: 'btn ghost' }, 'Worship music: ' + (s.music ? 'On' : 'Off'));
  mu.onclick = () => { s.music = !s.music; store.save(); syncMusic(); mu.textContent = 'Worship music: ' + (s.music ? 'On' : 'Off'); };
  const hp = h('button', { class: 'btn ghost' }, 'Vibration: ' + (s.haptics ? 'On' : 'Off'));
  hp.onclick = () => { s.haptics = !s.haptics; store.save(); hp.textContent = 'Vibration: ' + (s.haptics ? 'On' : 'Off'); };
  const m = modal(h('div', {}, h('h3', {}, 'Game'), snd, mu, hp,
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
  sfx(r.won ? 'win' : 'lose'); if (r.won) { bigConfetti(); hap([30, 50, 30, 50, 80]); }
  const title = r.won ? 'Victory!' : r.draw ? 'Draw' : 'Good game';
  const verse = r.won ? '“Well done, good and faithful servant.” — Matthew 25:21' : r.draw ? '“Iron sharpens iron.” — Proverbs 27:17' : '“Do not grow weary in doing good.” — Galatians 6:9';
  const row = (a, b, cls = '') => h('div', { class: 'res-row ' + cls }, h('span', {}, a), h('b', {}, b));
  const startPct = r.leveledUp ? 0 : Math.round((r.before.into / r.before.need) * 100);
  const endPct = Math.round((r.after.into / r.after.need) * 100);
  const fill = h('i', { style: { width: startPct + '%' } });
  setTimeout(() => { fill.style.width = endPct + '%'; }, 350);
  const lost = !r.won; // a level that was not won must be played again: no next puzzle, no Selah
  const retry = { label: 'Try again', go: () => startGame(spec) };
  const next = lost && ['main', 'daily', 'event', 'drop'].includes(spec.kind) ? retry : nextAction(spec);
  if (lost && next !== retry) { delete next.alt; }
  const m = modal(h('div', { class: 'result' },
    h('div', { class: 'res-emoji pop' }, r.won ? '🏆' : r.draw ? '🤝' : '🙏'),
    h('h2', {}, title),
    h('div', { class: 'res-score' }, h('b', {}, r.score), ' – ', h('b', {}, r.oppScore)),
    r.verse ? verseCard(r.verse, { isNew: r.newVerse, count: store.d.album[r.verse]?.n }) : h('p', { class: 'verse' }, verse),
    h('div', { class: 'res-rows' },
      row('Round points → total', '+' + r.score),
      r.winBonus ? row('Win bonus XP', '+' + r.winBonus) : null,
      r.dailyBonus ? row('Daily puzzle XP', '+' + r.dailyBonus) : null,
      r.coins - r.eventCoins ? row(`Win coins${r.streak > 1 ? ` (streak ×${r.mult})` : ''}`, '+' + (r.coins - r.eventCoins) + ' 🪙', 'gold') : null,
      r.eventCoins ? row('Event reward', '+' + r.eventCoins + ' 🪙', 'gold') : null,
      r.streak > 0 ? row('Win streak', '🔥 ' + r.streak) : null,
      ...(r.questsDone || []).map((id) => row('Quest: ' + questText(questsFor(todayStr()).find((q) => q.id === id)).text, '+' + CONFIG.questCoins + ' 🪙', 'gold'))),
    spec.kind === 'challenge' ? h('div', { class: 'chal', id: 'chal-box' }, h('small', { class: 'muted' }, currentUser() ? 'Saving your challenge…' : 'Sign in to send challenges')) : null,
    r.leveledUp ? h('div', { class: 'levelup' }, `⬆ Level up! You are now Level ${r.after.level}`) : null,
    h('div', { class: 'lvl-line' }, h('span', {}, 'Level ' + r.after.level), h('div', { class: 'bar' }, fill), h('small', {}, `${r.after.into}/${r.after.need} XP`)),
    h('div', { class: 'btn-row' },
      h('button', { class: 'btn', onclick: () => { m.close(); next.go(); } }, next.label),
      next.alt ? h('button', { class: 'btn ghost', onclick: () => { m.close(); next.alt.go(); } }, next.alt.label) : null,
      lost ? null : h('button', { class: 'btn ghost', id: 'selah-btn', onclick: () => selah(m) }, '🕊️ Selah'),
      lost && ['main', 'daily', 'event', 'drop'].includes(spec.kind) ? null : h('button', { class: 'btn ghost', id: 'share-btn', onclick: () => shareOut(shareText({ spec, score: r.score, oppScore: r.oppScore, log: st.log, verse: r.verse, url: location.origin + location.pathname })) }, 'Share result'),
      h('button', { class: 'btn ghost', onclick: () => { m.close(); location.hash = '#/'; } }, 'Home'))), { dismiss: false, cls: 'sheet' });
  paint();
  if (spec.kind === 'challenge') fillChallengeBox(spec, r);
}
/** "Selah": pause and look back over the finished board, as it was filled (mine in blue, theirs in the other colour). */
function selah(m) {
  m.back.style.display = 'none';
  G.root.classList.add('reviewing');
  const bar = h('div', { class: 'selah-bar', id: 'selah-bar' },
    h('div', { class: 'selah-legend' }, h('span', { class: 'lg you' }, 'You'), h('span', { class: 'lg opp' }, G.botName || 'Opponent'), h('small', {}, 'Selah — pause and reflect')),
    h('button', { class: 'btn', id: 'selah-back', onclick: () => { bar.remove(); G.root.classList.remove('reviewing'); m.back.style.display = ''; } }, 'Back to results'));
  document.body.append(bar);
}
async function fillChallengeBox(spec, r) {
  const box = document.getElementById('chal-box'); if (!box) return;
  const c = await challengeAnswer(); box.innerHTML = '';
  if (!c) { box.append(h('small', { class: 'muted' }, 'Could not reach the server — your result is saved and will sync.')); return; }
  if (spec.ch?.create) {
    const text = `I scored ${r.score} on this Faith Words puzzle. Can you beat me? ${challengeLink(c.id)}`;
    box.append(h('b', {}, 'Challenge ready!'), h('small', { class: 'muted' }, 'Send the link — your friend plays the same puzzle whenever they like.'),
      h('button', { class: 'btn', id: 'send-chal', onclick: () => shareOut(text) }, 'Send challenge link'));
  } else {
    const you = c.you ?? r.score, them = c.creator_score, res = you > them ? 'You win! 🏆' : you === them ? 'A tie! 🤝' : `${c.creator_name} wins this one`;
    box.append(h('b', {}, res), h('div', { class: 'res-score' }, h('b', {}, you), ' – ', h('b', {}, them)), h('small', { class: 'muted' }, `You vs ${c.creator_name}`));
  }
}
// Every finished puzzle offers the next one straight away, so nobody has to go back to the home screen.
function nextAction(spec) {
  const nextLevel = { label: 'Next level', go: () => startGame(specMain(store.d.mainNext)) };
  if (spec.kind === 'main') return nextLevel;
  if (spec.kind === 'challenge') return { label: 'Rematch — new puzzle', go: () => startChallenge(), alt: nextLevel };
  if (spec.kind === 'online') return { label: 'Play online again', go: () => startOnline(), alt: nextLevel };
  if (spec.kind === 'event') {
    const idx = spec.idx + 1; // the puzzle after the one just played, whatever the saved progress says
    return idx < EVENT_PUZZLES ? { label: 'Next puzzle', go: () => startGame(specEvent(spec.id, idx)), alt: nextLevel } : nextLevel;
  }
  if (spec.kind === 'drop') {
    const drop = findDrop(null, spec.id), idx = spec.idx + 1;
    return drop && idx < drop.puzzles.length ? { label: 'Next puzzle', go: () => startGame(specDrop(drop, idx)), alt: nextLevel } : nextLevel;
  }
  return { ...nextLevel, alt: { label: 'Daily calendar', go: () => { location.hash = '#/daily'; } } };
}
