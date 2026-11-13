import { h, $, toast, modal, crossSvg, trophySvg, confetti } from './ui.js';
import { store, todayStr } from './store.js';
import { CONFIG, EVENTS, EVENT_PUZZLES } from './config.js';
import { specMain, specDaily, specEvent, eventStatus } from './puzzles.js';
import { startGame, resumeGame, renderGame, hasActive, activeLabel, _debug } from './game.js';
import { initCloud, cloudEnabled, currentUser, signIn, signUp, signOut, leaderboard } from './cloud.js';
import { renderAdmin } from './admin.js';
import { sfx } from './audio.js';

const app = $('#app');
let dailyMonth = new Date(); dailyMonth.setDate(1);
let dailySel = todayStr();

// ---------- shell
function topBar() {
  const lv = store.level();
  return h('div', { class: 'topbar' },
    h('div', { class: 'pill lvl', onclick: () => (location.hash = '#/me') }, h('b', {}, 'Lv ' + lv.level), h('div', { class: 'bar sm' }, h('i', { style: { width: (lv.into / lv.need) * 100 + '%' } }))),
    h('div', { class: 'pill coin', onclick: () => (location.hash = '#/me') }, '🪙 ', h('b', {}, store.d.coins)));
}
function navBar(active) {
  const item = (id, icon, label) => h('a', { href: '#/' + (id === 'home' ? '' : id), class: 'nav-i' + (active === id ? ' on' : '') }, h('span', { class: 'ni' }, icon), label);
  return h('nav', { class: 'nav' }, item('home', '🏠', 'Main'), item('daily', '📅', 'Daily Puzzles'), item('me', '👤', 'Me'));
}

// ---------- Home
function home() {
  const cards = EVENTS.map((ev) => {
    const st = eventStatus(ev), done = store.d.events[ev.id] || 0;
    const open = st.active || store.d.settings.unlockEvents;
    const idx = Math.min(done, EVENT_PUZZLES - 1);
    return h('div', { class: 'ev-card', style: { background: `linear-gradient(160deg, ${ev.colors[0]}, ${ev.colors[1]})` } },
      h('div', { class: 'ev-time' }, '⏱ ' + (open ? st.label : st.label)),
      h('div', { class: 'ev-emoji' }, ev.emoji),
      h('div', { class: 'ev-kind' }, 'EVENT'),
      h('div', { class: 'ev-name' }, ev.name),
      h('div', { class: 'ev-prog' }, done >= EVENT_PUZZLES ? 'Completed ✓' : `${done}/${EVENT_PUZZLES} puzzles`),
      h('button', { class: 'ev-play' + (open ? '' : ' lock'), onclick: () => (open ? startGame(specEvent(ev.id, idx)) : toast(`${ev.name} opens soon — ${st.label.toLowerCase()}`)) }, open ? 'Play' : '🔒'));
  });
  const cont = hasActive();
  return h('div', { class: 'screen home' },
    topBar(),
    h('div', { class: 'ev-row' }, cards),
    h('div', { class: 'hero' },
      h('div', { class: 'logo', html: crossSvg(46, '#2f80ed') }),
      h('h1', {}, 'Faith Words'),
      h('p', {}, 'Cross words. Bible truth.')),
    h('button', { class: 'cta', onclick: () => (cont ? resumeGame() : startGame(specMain(store.d.mainNext))) },
      cont ? 'Continue' : 'New Game', h('small', {}, cont ? activeLabel() : 'Puzzle ' + store.d.mainNext)),
    cont ? h('button', { class: 'link', onclick: () => { if (confirm('Abandon the saved match and start a new one?')) { store.d.active = null; store.save(); startGame(specMain(store.d.mainNext)); } } }, 'Abandon saved match') : null,
    navBar('home'));
}

// ---------- Daily
function daily() {
  const y = dailyMonth.getFullYear(), m = dailyMonth.getMonth();
  const first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const t = todayStr();
  const done = store.d.daily;
  let stars = 0;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(h('div', { class: 'd-cell' }));
  for (let d = 1; d <= days; d++) {
    const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isDone = !!done[ds], future = ds > t;
    if (isDone) stars++;
    const cls = ['d-cell', 'day'];
    let inner = String(d);
    if (isDone) { cls.push('star'); inner = '★'; }
    else if (ds === t) cls.push('today');
    else if (future) cls.push('future');
    if (dailySel === ds) cls.push('picked');
    cells.push(h('button', { class: cls.join(' '), disabled: future, onclick: () => { dailySel = ds; render(); } }, inner));
  }
  const allDone = stars === days;
  const now = new Date(), isCurrent = now.getFullYear() === y && now.getMonth() === m;
  const canPrev = (y * 12 + m) > (2026 * 12 + 0);
  const canNext = (y * 12 + m) < (now.getFullYear() * 12 + now.getMonth());
  const shift = (n) => { dailyMonth = new Date(y, m + n, 1); dailySel = n > 0 && isCurrent ? t : `${dailyMonth.getFullYear()}-${String(dailyMonth.getMonth() + 1).padStart(2, '0')}-01`; if (dailyMonth.getMonth() === now.getMonth() && dailyMonth.getFullYear() === now.getFullYear()) dailySel = t; render(); };
  const doneSel = !!done[dailySel];
  return h('div', { class: 'screen daily' },
    h('div', { class: 'd-hero' },
      h('button', { class: 'arrow l', disabled: !canPrev, onclick: () => shift(-1) }, '‹'),
      h('div', { class: 'trophy', html: trophySvg(allDone) }),
      h('button', { class: 'arrow r', disabled: !canNext, onclick: () => shift(1) }, '›')),
    h('div', { class: 'd-body' },
      h('div', { class: 'd-title' }, h('h2', {}, first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })), h('div', { class: 'd-count' }, h('span', { class: 'gstar' }, '★'), ` ${stars}/${days}`)),
      h('div', { class: 'd-dow' }, ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x) => h('span', {}, x))),
      h('div', { class: 'd-grid' }, cells),
      h('button', { class: 'cta', onclick: () => startGame(specDaily(dailySel)) }, doneSel ? 'Play again' : 'Play')),
    navBar('daily'));
}

// ---------- Me
function me() {
  const d = store.d, lv = store.level(), ci = store.checkinInfo();
  const strip = h('div', { class: 'ci-strip' }, Array.from({ length: CONFIG.checkin.maxDay }, (_, i) => {
    const n = i + 1, got = ci.claimed ? n <= ci.day : n < ci.day, now = !ci.claimed && n === ci.day;
    return h('div', { class: 'ci-day' + (got ? ' got' : '') + (now ? ' now' : '') }, h('small', {}, 'Day ' + n), h('b', {}, '🪙' + ci.reward(n)));
  }));
  const nextMult = store.winMultiplier(d.winStreak + 1);
  const stat = (k, v) => h('div', { class: 'stat' }, h('b', {}, v), h('small', {}, k));
  const user = currentUser();
  const shopRow = (kind, icon, name, desc) => h('div', { class: 'shop-row' }, h('span', { class: 'si' }, icon), h('div', { class: 'sd' }, h('b', {}, `${name} ×${d.inv[kind]}`), h('small', {}, desc)),
    h('button', { class: 'btn sm', onclick: () => { if (store.buy(kind)) { sfx('coin'); toast(`${name} added`); render(); } else toast('Not enough coins'); } }, '🪙' + CONFIG.price[kind]));
  return h('div', { class: 'screen me' },
    topBar(),
    h('div', { class: 'card prof' },
      h('div', { class: 'avatar', html: crossSvg(34, '#fff') }),
      h('div', { class: 'pname' }, h('input', { class: 'name-in', value: d.name, maxlength: 16, onchange: (e) => { d.name = e.target.value.trim() || 'Believer'; store.save(); } }),
        h('small', {}, user ? 'Signed in · ' + user.email : 'Guest · progress saved on this device')),
      h('div', { class: 'lv-big' }, 'Level ', h('b', {}, lv.level))),
    h('div', { class: 'card' },
      h('div', { class: 'row-between' }, h('b', {}, 'Total points'), h('b', { class: 'blue' }, d.xp.toLocaleString())),
      h('div', { class: 'bar' }, h('i', { style: { width: (lv.into / lv.need) * 100 + '%' } })),
      h('small', { class: 'muted' }, `${lv.need - lv.into} XP to Level ${lv.level + 1}`)),
    h('div', { class: 'card' },
      h('div', { class: 'row-between' }, h('b', {}, 'Daily check-in'), h('small', { class: 'muted' }, ci.claimed ? 'Come back tomorrow' : 'Keep your streak for bigger rewards')),
      strip,
      h('button', { class: 'btn', disabled: ci.claimed, onclick: () => { const c = store.claimCheckin(); sfx('coin'); toast(`+${c} coins!`); confetti(); render(); } }, ci.claimed ? 'Claimed today ✓' : `Check in  +🪙${ci.today}`)),
    h('div', { class: 'card' },
      h('div', { class: 'row-between' }, h('b', {}, '🔥 Win streak'), h('b', {}, d.winStreak)),
      h('small', { class: 'muted' }, `Win coins: ${CONFIG.win.base} × streak multiplier. Your next win pays ×${nextMult} (🪙${Math.round(CONFIG.win.base * nextMult)}).`)),
    h('div', { class: 'card' }, h('b', {}, 'Shop'),
      shopRow('hint', '💡', 'Hint', 'Shows where your tiles fit'),
      shopRow('word', '▤', 'Word', 'Reveals the selected word (row/column)')),
    h('div', { class: 'card stats' }, stat('Games', d.stats.games), stat('Wins', d.stats.wins), stat('Best score', d.stats.bestScore), stat('Best streak', d.bestWinStreak)),
    accountCard(user),
    h('div', { class: 'card' },
      h('button', { class: 'btn ghost', onclick: () => { d.settings.sound = !d.settings.sound; store.save(); render(); } }, 'Sound: ' + (d.settings.sound ? 'On' : 'Off')),
      h('button', { class: 'btn ghost', onclick: () => { d.settings.unlockEvents = !d.settings.unlockEvents; store.save(); render(); } }, 'Unlock all events (testing): ' + (d.settings.unlockEvents ? 'On' : 'Off')),
      h('a', { class: 'link', href: '#/admin' }, 'Admin panel')),
    navBar('me'));
}

function accountCard(user) {
  if (!cloudEnabled()) {
    return h('div', { class: 'card' }, h('b', {}, 'Account & online play'), h('small', { class: 'muted' }, 'Cloud save, leaderboards and live matches switch on once the Supabase keys are added (see README). You are playing as a guest.'));
  }
  if (user) {
    return h('div', { class: 'card' }, h('b', {}, 'Account'),
      h('button', { class: 'btn ghost', onclick: leaderboardModal }, '🏆 Leaderboard'),
      h('button', { class: 'btn ghost', onclick: async () => { await signOut(); render(); } }, 'Sign out'));
  }
  return h('div', { class: 'card' }, h('b', {}, 'Save your progress'), h('small', { class: 'muted' }, 'Sign in to keep points, coins and levels across devices.'),
    h('button', { class: 'btn', onclick: authModal }, 'Sign in / Sign up'),
    h('button', { class: 'btn ghost', onclick: leaderboardModal }, '🏆 Leaderboard'));
}
function authModal() {
  const email = h('input', { type: 'email', placeholder: 'Email', autocomplete: 'email' });
  const pass = h('input', { type: 'password', placeholder: 'Password (6+ characters)', autocomplete: 'current-password' });
  const msg = h('small', { class: 'err' });
  const go = (fn) => async () => { try { msg.textContent = ''; const r = await fn(); m.close(); toast(r?.confirm ? 'Check your email to confirm your account, then sign in' : 'Signed in', r?.confirm ? 4500 : 1800); render(); } catch (e) { msg.textContent = e.message || 'Something went wrong'; } };
  const m = modal(h('div', { class: 'auth' }, h('h3', {}, 'Faith Words account'), email, pass, msg,
    h('button', { class: 'btn', onclick: go(() => signIn(email.value, pass.value)) }, 'Sign in'),
    h('button', { class: 'btn ghost', onclick: go(() => signUp(email.value, pass.value, store.d.name)) }, 'Create account')), { cls: 'sheet' });
}
async function leaderboardModal() {
  const body = h('div', {}, h('p', { class: 'muted' }, 'Loading…'));
  modal(h('div', {}, h('h3', {}, '🏆 Leaderboard'), body), { cls: 'sheet' });
  const rows = await leaderboard();
  body.innerHTML = '';
  if (!rows.length) body.append(h('p', { class: 'muted' }, 'No players yet — be the first!'));
  rows.forEach((r, i) => body.append(h('div', { class: 'lb-row' }, h('span', {}, `${i + 1}. ${r.name}`), h('small', {}, `Lv ${r.level}`), h('b', {}, r.xp.toLocaleString()))));
}

// ---------- router
function render() {
  const route = (location.hash || '#/').replace(/^#/, '');
  app.innerHTML = '';
  document.body.dataset.route = route;
  if (route === '/game') { const root = h('div', { class: 'screen gamescreen' }); app.append(root); renderGame(root); return; }
  if (route === '/admin') { app.append(renderAdmin()); return; }
  app.append(route === '/daily' ? daily() : route === '/me' ? me() : home());
}
window.addEventListener('hashchange', render);
store.onChange(() => { const c = $('.topbar'); if (c && document.body.dataset.route !== '/game') { /* keep scroll; coin pills refresh on next render */ } });
if (location.search.includes('debug')) window.fwDebug = { game: _debug, store };
render();
initCloud().then((ok) => { if (ok) render(); });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
