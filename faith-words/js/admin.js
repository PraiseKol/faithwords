// Admin panel: view puzzles, edit clues, add words, export/import content.
// NOTE: the PIN only hides the screen in this offline build. When Supabase is connected, protect
// admin writes with a Supabase role (see README) — never trust a client-side PIN for real security.
import { h, toast } from './ui.js';
import { BANK } from './bank.js';
import { CONFIG, EVENTS, EVENT_PUZZLES } from './config.js';
import { store, todayStr } from './store.js';
import { getPuzzle, specMain, specDaily, specEvent, CUSTOM_FROM_PUZZLE } from './puzzles.js';
import { startGame } from './game.js';
import { W, H } from './generator.js';

let tab = 'puzzles';
let pz = { kind: 'main', n: 1, date: todayStr(), ev: 'hero', idx: 0 };
let bankQ = '', bankPage = 0;

export function renderAdmin() {
  const root = h('div', { class: 'screen admin' });
  const draw = () => {
    root.innerHTML = '';
    if (sessionStorage.getItem('fw.admin') !== '1') return root.append(gate(draw));
    root.append(
      h('div', { class: 'a-head' }, h('a', { href: '#/me', class: 'icon-btn' }, '‹'), h('h2', {}, 'Admin'),
        h('button', { class: 'link', onclick: () => { sessionStorage.removeItem('fw.admin'); draw(); } }, 'Lock')),
      h('div', { class: 'tabs' }, ['puzzles', 'bank', 'data'].map((t) => h('button', { class: 'tab' + (tab === t ? ' on' : ''), onclick: () => { tab = t; draw(); } }, t === 'bank' ? 'Word bank' : t[0].toUpperCase() + t.slice(1)))),
      tab === 'puzzles' ? puzzlesTab(draw) : tab === 'bank' ? bankTab(draw) : dataTab(draw));
  };
  draw();
  return root;
}

function gate(draw) {
  const pin = h('input', { type: 'password', placeholder: 'Admin PIN' });
  return h('div', { class: 'card gate' }, h('h3', {}, 'Admin'), pin,
    h('button', { class: 'btn', onclick: () => { if (pin.value === CONFIG.adminPin) { sessionStorage.setItem('fw.admin', '1'); draw(); } else toast('Wrong PIN'); } }, 'Enter'),
    h('a', { href: '#/me', class: 'link' }, 'Back'));
}

function specFromState() {
  if (pz.kind === 'main') return specMain(+pz.n || 1);
  if (pz.kind === 'daily') return specDaily(pz.date);
  return specEvent(pz.ev, +pz.idx || 0);
}

function puzzlesTab(draw) {
  const kindSel = h('select', { onchange: (e) => { pz.kind = e.target.value; draw(); } }, ['main', 'daily', 'event'].map((k) => h('option', { value: k, selected: pz.kind === k }, k)));
  let ctl;
  if (pz.kind === 'main') ctl = h('input', { type: 'number', min: 1, value: pz.n, onchange: (e) => { pz.n = e.target.value; draw(); } });
  else if (pz.kind === 'daily') ctl = h('input', { type: 'date', value: pz.date, onchange: (e) => { pz.date = e.target.value; draw(); } });
  else ctl = h('span', {}, h('select', { onchange: (e) => { pz.ev = e.target.value; draw(); } }, EVENTS.map((e) => h('option', { value: e.id, selected: pz.ev === e.id }, e.name))),
    h('input', { type: 'number', min: 0, max: EVENT_PUZZLES - 1, value: pz.idx, onchange: (e) => { pz.idx = e.target.value; draw(); } }));
  const spec = specFromState();
  const p = getPuzzle(spec);
  const grid = h('div', { class: 'a-grid', style: { gridTemplateColumns: `repeat(${W}, 1fr)` } }, p.cells.map((c) =>
    h('div', { class: 'a-cell ' + c.t }, c.t === 'l' ? c.ch : c.t === 'c' ? '▪' : '')));
  const rows = p.words.map((w) => {
    const clue = h('input', { value: w.clue, placeholder: w.emoji ? '(picture clue)' : '', onchange: (e) => { setOv(w.entry, { c: e.target.value }); toast('Saved'); } });
    const emo = h('input', { class: 'emo-in', value: w.emoji || '', onchange: (e) => { setOv(w.entry, { e: e.target.value }); toast('Saved'); } });
    return h('div', { class: 'a-word' }, h('b', {}, w.ans), h('small', {}, `${w.dir === 'a' ? '→' : '↓'} ${w.len}`), clue, emo);
  });
  return h('div', {}, h('div', { class: 'a-ctl' }, kindSel, ctl, h('button', { class: 'btn sm', onclick: () => startGame(spec) }, 'Play it')),
    h('small', { class: 'muted' }, `${spec.label} · ${p.words.length} words · ${p.letterCount} letters. Edits change the clue text only — the grid never changes.`),
    grid, h('div', { class: 'a-words' }, rows));
}
function setOv(entry, patch) { store.d.clueOverrides[entry] = { ...(store.d.clueOverrides[entry] || {}), ...patch }; store.save(); }

function bankTab(draw) {
  const q = bankQ.toLowerCase();
  const list = BANK.filter((e) => !q || e.a.toLowerCase().includes(q) || e.c.toLowerCase().includes(q) || e.tags.includes(q));
  const per = 40, pages = Math.max(1, Math.ceil(list.length / per));
  bankPage = Math.min(bankPage, pages - 1);
  const search = h('input', { type: 'search', placeholder: 'Search answer, clue or tag (cur, xmas…)', value: bankQ, onchange: (e) => { bankQ = e.target.value; bankPage = 0; draw(); } });
  const rows = list.slice(bankPage * per, bankPage * per + per).map((e) => {
    const ov = store.d.clueOverrides[e.id] || {};
    return h('div', { class: 'a-word' }, h('b', {}, e.a), h('small', {}, e.tags.join(',')),
      h('input', { value: ov.c ?? e.c, onchange: (ev) => { setOv(e.id, { c: ev.target.value }); toast('Saved'); } }),
      h('input', { class: 'emo-in', value: ov.e ?? e.e, onchange: (ev) => { setOv(e.id, { e: ev.target.value }); toast('Saved'); } }));
  });
  // add custom
  const a = h('input', { placeholder: 'ANSWER (3–9 letters)', maxlength: 9 }), c = h('input', { placeholder: 'Clue (use __ for a blank)' }), e = h('input', { placeholder: 'Emoji (optional)', class: 'emo-in' }), t = h('input', { placeholder: 'tags: cur,xmas,…' });
  const add = () => {
    const ans = a.value.toUpperCase().replace(/[^A-Z]/g, '');
    if (!/^[A-Z]{3,9}$/.test(ans)) return toast('Answer must be 3–9 letters A–Z');
    if (!c.value && !e.value) return toast('Add a clue or an emoji');
    store.d.customBank.push({ a: ans, c: c.value, e: e.value, tags: t.value.split(',').map((x) => x.trim()).filter(Boolean) });
    store.save(); toast(`Added ${ans}. Used from main puzzle ${CUSTOM_FROM_PUZZLE}`); draw();
  };
  const custom = store.d.customBank.map((x, i) => h('div', { class: 'a-word' }, h('b', {}, x.a), h('small', {}, (x.tags || []).join(',')), h('span', { class: 'muted' }, x.c || x.e),
    h('button', { class: 'link', onclick: () => { store.d.customBank.splice(i, 1); store.save(); draw(); } }, 'Delete')));
  return h('div', {},
    h('div', { class: 'card' }, h('b', {}, 'Add a word'), a, c, e, t, h('button', { class: 'btn sm', onclick: add }, 'Add')),
    custom.length ? h('div', { class: 'card' }, h('b', {}, `Your custom words (${custom.length})`), custom) : null,
    search, h('small', { class: 'muted' }, `${list.length} entries · page ${bankPage + 1}/${pages}`),
    h('div', { class: 'a-words' }, rows),
    h('div', { class: 'btn-row' }, h('button', { class: 'btn ghost sm', disabled: bankPage === 0, onclick: () => { bankPage--; draw(); } }, 'Prev'), h('button', { class: 'btn ghost sm', disabled: bankPage >= pages - 1, onclick: () => { bankPage++; draw(); } }, 'Next')));
}

function dataTab(draw) {
  const file = h('input', { type: 'file', accept: 'application/json', onchange: async (e) => {
    try { const j = JSON.parse(await e.target.files[0].text()); store.d.clueOverrides = j.clueOverrides || {}; store.d.customBank = j.customBank || []; store.save(); toast('Imported'); draw(); } catch { toast('Not a valid content file'); }
  } });
  return h('div', { class: 'card' }, h('b', {}, 'Content export / import'),
    h('small', { class: 'muted' }, 'Clue edits and custom words as JSON — a backup now, and what you will load into Supabase later.'),
    h('button', { class: 'btn', onclick: () => {
      const blob = new Blob([JSON.stringify({ clueOverrides: store.d.clueOverrides, customBank: store.d.customBank }, null, 2)], { type: 'application/json' });
      const a = h('a', { href: URL.createObjectURL(blob), download: 'faith-words-content.json' }); a.click();
    } }, 'Export content'), file,
    h('hr'), h('b', {}, 'Player data (this device)'),
    h('button', { class: 'btn danger', onclick: () => { if (confirm('Reset ALL progress on this device?')) { store.reset(); toast('Reset'); location.hash = '#/'; } } }, 'Reset my progress'));
}
