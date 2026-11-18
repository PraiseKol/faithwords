import { h, $, toast, modal, crossSvg, trophySvg, confetti, icon, coin, applyTheme } from './ui.js';
import { store, todayStr } from './store.js';
import { CONFIG, EVENTS, EVENT_PUZZLES } from './config.js';
import { specMain, specDaily, specEvent, eventStatus, setRemoteContent } from './puzzles.js';
import { startGame, resumeGame, renderGame, leaveGame, hasActive, activeLabel, hasOnlineActive, startOnline, rejoinOnline, parkedGames, resumeParked, discardParked, _debug } from './game.js';
import { initCloud, cloudEnabled, currentUser, signIn, signUp, signOut, leaderboard, A } from './cloud.js';
import { renderAdmin } from './admin.js';
import { showHowTo } from './howto.js';
import { sfx, syncMusic } from './audio.js';
import { COSMETICS, available } from './cosmetics.js';
import { questText } from './quests.js';
import { VERSES } from './verses.js';
import { verseCard } from './verseui.js';
import { BADGES, earnedBadges } from './achievements.js';

const app = $('#app');
let dailyMonth = new Date(); dailyMonth.setDate(1);
let dailySel = todayStr();

// ---------- shell
const initial = () => (store.d.name || 'B').trim()[0].toUpperCase();
function topBar() {
  return h('div', { class: 'topbar' },
    h('div', { class: 'brand' }, h('span', { class: 'mark', html: crossSvg(18, '#fff') }), 'Faith Words'),
    h('button', { class: 'pill coin', 'aria-label': 'Coins', onclick: () => (location.hash = '#/me') }, coin(store.d.coins)));
}
function navBar(active) {
  const item = (id, ico, label) => h('a', { href: '#/' + (id === 'home' ? '' : id), class: 'nav-i' + (active === id ? ' on' : ''), 'aria-current': active === id ? 'page' : null },
    h('span', { class: 'ni', html: icon(ico, 24) }), label);
  return h('nav', { class: 'nav' }, item('home', 'home', 'Play'), item('daily', 'calendar', 'Daily'), item('me', 'user', 'Me'));
}

// ---------- Home
const DEBUG = location.search.includes('debug');
function home() {
  const d = store.d, lv = store.level(), ci = store.checkinInfo();
  const t = todayStr(), todayDone = !!d.daily[t];
  const cont = hasActive();

  const checkin = ci.claimed ? null : h('button', { class: 'banner gold', onclick: () => claimCheckin() },
    h('span', { class: 'b-ico', html: icon('sun', 26) }),
    h('span', { class: 'b-txt' }, h('b', {}, 'Daily check-in ready'), h('small', {}, ci.usedFreezes ? `🧊 ${ci.usedFreezes} streak freeze will save your streak` : ci.lost ? 'Your streak ended — start a new one' : ci.day > 1 ? `Day ${ci.day} streak bonus` : 'Start your streak')),
    h('span', { class: 'b-act' }, '+', coin(ci.today)));

  const dailyCard = h('button', { class: 'banner today' + (todayDone ? ' done' : ''), onclick: () => startGame(specDaily(t)) },
    h('span', { class: 'b-ico star' }, todayDone ? '★' : '☆'),
    h('span', { class: 'b-txt' }, h('b', {}, "Today's puzzle"), h('small', {}, new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))),
    h('span', { class: 'b-act' }, todayDone ? 'Replay' : 'Play'));

  const cards = EVENTS.map((ev) => {
    const st = eventStatus(ev), done = d.events[ev.id] || 0;
    const open = st.active || (DEBUG && d.settings.unlockEvents); // the testing switch only exists on ?debug builds
    const idx = Math.min(done, EVENT_PUZZLES - 1);
    return h('div', { class: 'ev-card', style: { background: `linear-gradient(160deg, ${ev.colors[0]}, ${ev.colors[1]})` } },
      h('div', { class: 'ev-time' }, st.label),
      h('div', { class: 'ev-emoji' }, ev.emoji),
      h('div', { class: 'ev-kind' }, 'EVENT'),
      h('div', { class: 'ev-name' }, ev.name),
      h('div', { class: 'ev-dots' }, Array.from({ length: EVENT_PUZZLES }, (_, i) => h('i', { class: i < done ? 'on' : '' }))),
      h('button', { class: 'ev-play' + (open ? '' : ' lock'), onclick: () => (open ? startGame(specEvent(ev.id, idx)) : toast(`${ev.name} opens soon — ${st.label.toLowerCase()}`)) }, open ? (done >= EVENT_PUZZLES ? 'Replay' : 'Play') : 'Locked'));
  });

  return h('div', { class: 'screen home' },
    topBar(),
    h('div', { class: 'card hello' },
      h('div', { class: 'avatar' }, initial()),
      h('div', { class: 'hello-main' },
        h('div', { class: 'hello-name' }, 'Hi, ' + d.name, store.titleName() ? h('em', { class: 'lb-title' }, ' · ' + store.titleName()) : null),
        h('div', { class: 'hello-sub' }, `Level ${lv.level} · ${d.xp.toLocaleString()} points`),
        h('div', { class: 'bar' }, h('i', { style: { width: (lv.into / lv.need) * 100 + '%' } }))),
      h('div', { class: 'streak', title: 'Win streak' }, h('span', { html: icon('flame', 20) }), h('b', {}, d.winStreak))),
    checkin, dailyCard, questsCard(),
    h('div', { class: 'sec-title' }, 'Events'),
    h('div', { class: 'ev-row' }, cards),
    h('div', { class: 'spacer' }),
    h('div', { class: 'cta-stack' },
      h('button', { class: 'cta', onclick: () => (cont ? resumeGame() : startGame(specMain(d.mainNext))) },
        h('b', {}, cont ? 'Continue' : 'New Game'), h('small', {}, cont ? activeLabel() : 'Puzzle ' + d.mainNext)),
      // an event or daily puzzle is in progress: the main game is still one tap away (the other game is kept)
      cont && d.active.spec.kind !== 'main' ? h('button', { class: 'cta alt', onclick: () => startGame(specMain(d.mainNext)) },
        h('span', {}, h('b', {}, 'Main game'), h('small', {}, 'Puzzle ' + d.mainNext))) : null,
      ...parkedGames().map((g) => h('div', { class: 'parked' },
        h('button', { class: 'link', onclick: () => resumeParked(g.seed) }, 'Resume: ' + g.label),
        h('button', { class: 'link x', 'aria-label': 'Discard ' + g.label, onclick: () => { discardParked(g.seed); render(); } }, '✕'))),
      h('button', { class: 'cta alt', onclick: () => startOnline() }, h('span', { html: icon('globe', 22) }), h('span', {}, h('b', {}, 'Play online'), h('small', {}, currentUser() ? 'Match with another believer' : 'Sign in to play live'))),
      hasOnlineActive() ? h('button', { class: 'link', onclick: () => rejoinOnline() }, 'Rejoin your live match') : null,
      cont ? h('button', { class: 'link', onclick: abandon }, 'Abandon saved match') : null),
    navBar('home'));
}
function questsCard() {
  const qv = store.quests();
  const rows = qv.list.map((q) => {
    const t = questText(q);
    return h('div', { class: 'quest' + (q.done ? ' done' : ''), 'data-quest': q.id },
      h('span', { class: 'q-ico' }, q.done ? '✓' : t.icon),
      h('div', { class: 'q-main' }, h('span', { class: 'q-text' }, t.text), h('div', { class: 'bar' }, h('i', { style: { width: Math.round((q.have / q.need) * 100) + '%' } }))),
      h('small', { class: 'q-n' }, `${q.have}/${q.need}`));
  });
  const r = qv.reward;
  const chest = qv.opened ? h('div', { class: 'chest opened' }, '🎁 Today\'s chest opened — new quests tomorrow')
    : h('button', { class: 'chest' + (qv.ready ? ' ready' : ''), id: 'chest-btn', disabled: !qv.ready, onclick: openChest },
      h('span', { class: 'ch-ico' }, qv.ready ? '🎁' : '🔒'), h('span', { class: 'ch-txt' }, qv.ready ? 'Open your chest!' : `Finish all 3 to open the chest (${qv.doneCount}/3)`));
  return h('div', { class: 'card quests' }, h('div', { class: 'row-between' }, h('b', {}, 'Daily quests'), h('small', { class: 'muted' }, `+${CONFIG.questCoins} 🪙 each`)), rows, chest);
}
function openChest() {
  const r = store.openChest(); if (!r) return;
  sfx('coin'); confetti();
  const item = r.kind === 'freeze' ? '🧊 Streak freeze' : r.kind === 'word' ? '👁 Word power-up' : `💡 ${r.qty} Hints`;
  const m = modal(h('div', { class: 'result' }, h('div', { class: 'res-emoji' }, '🎁'), h('h2', {}, 'Chest opened!'),
    h('div', { class: 'res-rows' }, h('div', { class: 'res-row gold' }, h('span', {}, 'Coins'), h('b', {}, '+' + r.coins + ' 🪙')), h('div', { class: 'res-row' }, h('span', {}, 'Bonus'), h('b', {}, item))),
    h('div', { class: 'btn-row' }, h('button', { class: 'btn', onclick: () => { m.close(); render(); } }, 'Amen'))), { dismiss: false, cls: 'sheet' });
}

function abandon() {
  const m = modal(h('div', {}, h('h3', {}, 'Abandon this match?'), h('p', { class: 'muted' }, 'This saved game will be lost.'),
    h('div', { class: 'btn-row' }, h('button', { class: 'btn danger', onclick: () => { m.close(); store.d.active = null; store.save(); render(); } }, 'Abandon'), h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Keep playing'))), { cls: 'sheet' });
}
function claimCheckin() {
  const c = store.claimCheckin(); sfx('coin'); confetti(); toast(`+${c} coins — see you tomorrow!`); render();
}

// ---------- Daily
function daily() {
  const y = dailyMonth.getFullYear(), m = dailyMonth.getMonth();
  const first = new Date(y, m, 1), days = new Date(y, m + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7;
  const t = todayStr(), done = store.d.daily;
  const now = new Date();
  const isCurrent = now.getFullYear() === y && now.getMonth() === m;
  let stars = 0;
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(h('div', { class: 'd-cell' }));
  for (let d = 1; d <= days; d++) {
    const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isDone = !!done[ds], future = ds > t;
    if (isDone) stars++;
    const cls = ['d-cell', 'day'];
    let inner = String(d);
    if (isDone) { cls.push('star'); inner = '★'; } else if (ds === t) cls.push('today'); else if (future) cls.push('future');
    if (dailySel === ds) cls.push('picked');
    cells.push(h('button', { class: cls.join(' '), disabled: future, 'aria-label': ds, onclick: () => { dailySel = ds; render(); } }, inner));
  }
  const allDone = stars === days;
  const canPrev = (y * 12 + m) > (2026 * 12);
  const canNext = (y * 12 + m) < (now.getFullYear() * 12 + now.getMonth());
  const shift = (n) => {
    dailyMonth = new Date(y, m + n, 1);
    const cur = dailyMonth.getFullYear() === now.getFullYear() && dailyMonth.getMonth() === now.getMonth();
    dailySel = cur ? t : `${dailyMonth.getFullYear()}-${String(dailyMonth.getMonth() + 1).padStart(2, '0')}-01`;
    render();
  };
  const sel = new Date(dailySel + 'T00:00:00');
  return h('div', { class: 'screen daily' },
    h('div', { class: 'd-hero' },
      h('button', { class: 'arrow l', 'aria-label': 'Previous month', disabled: !canPrev, onclick: () => shift(-1) }, '‹'),
      h('div', { class: 'trophy', html: trophySvg(allDone) }),
      h('button', { class: 'arrow r', 'aria-label': 'Next month', disabled: !canNext, onclick: () => shift(1) }, '›')),
    h('div', { class: 'd-body' },
      h('div', { class: 'd-title' }, h('h2', {}, first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })), h('div', { class: 'd-count' }, h('span', { class: 'gstar' }, '★'), ` ${stars}/${days}`)),
      h('div', { class: 'd-dow' }, ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x) => h('span', {}, x))),
      h('div', { class: 'd-grid' }, cells),
      h('button', { class: 'cta single', onclick: () => startGame(specDaily(dailySel)) },
        h('b', {}, done[dailySel] ? 'Play again' : 'Play'), h('small', {}, sel.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })))),
    navBar('daily'));
}

// ---------- Me
function me() {
  const d = store.d, lv = store.level(), ci = store.checkinInfo();
  const strip = h('div', { class: 'ci-strip' }, Array.from({ length: CONFIG.checkin.maxDay }, (_, i) => {
    const n = i + 1, got = ci.claimed ? n <= ci.day : n < ci.day, now = !ci.claimed && n === ci.day;
    return h('div', { class: 'ci-day' + (got ? ' got' : '') + (now ? ' now' : '') }, h('small', {}, 'Day ' + n), coin(ci.reward(n)));
  }));
  const nextMult = store.winMultiplier(d.winStreak + 1);
  const stat = (k, v) => h('div', { class: 'stat' }, h('b', {}, v), h('small', {}, k));
  const user = currentUser();
  const shopRow = (kind, ico, name, desc) => h('div', { class: 'shop-row' }, h('span', { class: 'si', html: icon(ico, 22) }), h('div', { class: 'sd' }, h('b', {}, `${name} ×${d.inv[kind]}`), h('small', {}, desc)),
    h('button', { class: 'btn sm', onclick: () => { if (store.buy(kind)) { sfx('coin'); toast(`${name} added`); render(); } else toast('Not enough coins'); } }, coin(CONFIG.price[kind])));
  const seg = (label, key, opts) => h('div', { class: 'seg-row' }, h('span', {}, label),
    h('div', { class: 'seg' }, opts.map(([v, txt]) => h('button', { class: d.settings[key] === v ? 'on' : '', onclick: () => { d.settings[key] = v; store.save(); if (key === 'theme') applyTheme(v); if (key === 'music') syncMusic(); render(); } }, txt))));
  return h('div', { class: 'screen me' },
    topBar(),
    h('div', { class: 'card prof' },
      h('div', { class: 'avatar lg' }, initial()),
      h('div', { class: 'pname' }, h('input', { class: 'name-in', id: 'player-name', 'aria-label': 'Your name', value: d.name, maxlength: 16, onchange: (e) => { d.name = e.target.value.trim() || 'Believer'; store.save(); } }),
        h('small', {}, user ? 'Signed in · ' + user.email : 'Guest · progress saved on this device')),
      h('div', { class: 'lv-big' }, 'Level ', h('b', {}, lv.level))),
    h('div', { class: 'card' },
      h('div', { class: 'row-between' }, h('b', {}, 'Total points'), h('b', { class: 'blue' }, d.xp.toLocaleString())),
      h('div', { class: 'bar' }, h('i', { style: { width: (lv.into / lv.need) * 100 + '%' } })),
      h('small', { class: 'muted' }, `${lv.need - lv.into} points to Level ${lv.level + 1}`)),
    h('div', { class: 'card' },
      h('div', { class: 'row-between' }, h('b', {}, 'Daily check-in'), h('small', { class: 'muted' }, ci.claimed ? 'Come back tomorrow' : 'Keep your streak for bigger rewards')),
      h('small', { class: 'muted' }, `🧊 Streak freezes: ${d.inv.freeze || 0}/${CONFIG.maxFreezes}${ci.usedFreezes ? ` — ${ci.usedFreezes} will be used to save your streak` : ''}`),
      strip,
      h('button', { class: 'btn', disabled: ci.claimed, onclick: claimCheckin }, ci.claimed ? 'Claimed today ✓' : h('span', {}, 'Check in  +', coin(ci.today)))),
    h('div', { class: 'card' },
      h('div', { class: 'row-between' }, h('b', {}, 'Win streak'), h('b', { class: 'flame' }, h('span', { html: icon('flame', 18) }), d.winStreak)),
      h('small', { class: 'muted' }, `Win coins: ${CONFIG.win.base} × streak multiplier. Your next win pays ×${nextMult} (${Math.round(CONFIG.win.base * nextMult)} coins).`)),
    h('div', { class: 'card' }, h('b', {}, 'Shop'),
      shopRow('hint', 'bulb', 'Hint', 'Shows one square\'s letter faintly'),
      shopRow('word', 'eye', 'Word', 'Shows a whole word faintly'),
      shopRow('freeze', 'shield', 'Streak freeze', `Saves your check-in streak for a missed day (max ${CONFIG.maxFreezes})`)),
    themesCard(), albumCard(), badgesCard(),
    h('div', { class: 'card stats' }, stat('Games', d.stats.games), stat('Wins', d.stats.wins), stat('Best score', d.stats.bestScore), stat('Best streak', d.bestWinStreak)),
    accountCard(user),
    h('div', { class: 'card' }, h('b', {}, 'Settings'),
      seg('Theme', 'theme', [['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']]),
      seg('Sound', 'sound', [[true, 'On'], [false, 'Off']]),
      seg('Worship music', 'music', [[true, 'On'], [false, 'Off']]),
      seg('Vibration', 'haptics', [[true, 'On'], [false, 'Off']]),
      h('button', { class: 'btn ghost', onclick: () => showHowTo() }, 'How to play'),
      DEBUG ? h('button', { class: 'btn ghost', onclick: () => { d.settings.unlockEvents = !d.settings.unlockEvents; store.save(); render(); } }, 'Unlock all events (testing): ' + (d.settings.unlockEvents ? 'On' : 'Off')) : null,
      h('a', { class: 'link', href: '#/admin' }, 'Admin panel')),
    navBar('me'));
}

function applyCosmetics() { const c = store.d.cosmetics || {}; document.body.dataset.board = c.board || ''; document.body.dataset.tile = c.tile || ''; }
function themesCard() {
  const d = store.d;
  const row = (slot, label) => h('div', { class: 'theme-block' }, h('small', { class: 'muted' }, label), h('div', { class: 'theme-row' }, COSMETICS.filter((c) => c.slot === slot).map((c) => {
    const have = available(d, c), on = d.cosmetics[slot] === c.id;
    return h('button', { class: 'theme-chip' + (on ? ' on' : ''), 'data-cos': c.id, onclick: () => {
      if (have) { if (store.equipCosmetic(c.id)) { applyCosmetics(); render(); } }
      else if (c.badge) toast('Unlocked by a badge — see Titles & badges');
      else if (store.buyCosmetic(c.id)) { sfx('coin'); store.equipCosmetic(c.id); applyCosmetics(); toast(c.name + ' unlocked'); render(); } else toast('Not enough coins'); } },
      h('span', { class: 'sw' }, (c.sw || ['#fff', '#e6ecf7', '#7d92b4']).map((x) => h('i', { style: { background: x } }))), c.name,
      h('small', {}, on ? 'In use' : have ? 'Owned' : c.badge ? '🔒 Badge' : c.price + ' 🪙'));
  })));
  return h('div', { class: 'card' }, h('b', {}, 'Themes'), row('board', 'Board'), row('tile', 'Tiles'));
}
function albumCard() {
  const n = Object.keys(store.d.album || {}).length;
  return h('div', { class: 'card' }, h('div', { class: 'row-between' }, h('b', {}, 'Verse Album'), h('b', { class: 'blue' }, `${n}/${VERSES.length}`)),
    h('div', { class: 'bar' }, h('i', { style: { width: (n / VERSES.length) * 100 + '%' } })),
    h('small', { class: 'muted' }, 'Finish puzzles to collect verse cards, each with the story behind it.'),
    h('a', { class: 'btn', href: '#/album', id: 'open-album' }, 'Open album'));
}
function badgesCard() {
  const d = store.d, got = new Set(earnedBadges(d)), worn = store.titleName();
  const set = (id) => { store.setTitle(id); render(); };
  return h('div', { class: 'card badges' }, h('div', { class: 'row-between' }, h('b', {}, 'Titles & badges'), h('small', { class: 'muted' }, `${got.size}/${BADGES.length} earned`)),
    h('small', { class: 'muted' }, worn ? `You are known as “${worn}”. Tap a badge to wear it.` : 'Earn a badge, then tap it to wear it as your title.'),
    h('div', { class: 'badge-grid' }, BADGES.map((b) => h('button', { class: 'badge' + (got.has(b.id) ? ' got' : '') + (d.title === b.id && got.has(b.id) ? ' worn' : ''), title: b.desc, 'data-badge': b.id,
      onclick: () => (got.has(b.id) ? set(d.title === b.id ? '' : b.id) : toast(b.desc)) }, h('span', { class: 'b-e' }, got.has(b.id) ? b.icon : '🔒'), h('small', {}, b.name)))));
}
function album() {
  const have = store.d.album || {};
  const n = Object.keys(have).length;
  const cards = VERSES.map((v) => {
    const got = have[v.ref];
    return h('button', { class: 'al-card' + (got ? ' got' : ''), 'data-ref': v.ref, onclick: () => got ? modal(h('div', {}, verseCard(v.ref, { count: got.n }), h('button', { class: 'btn', onclick: (e) => e.target.closest('.modal-back').click() }, 'Close')), { cls: 'sheet' }) : toast('Finish more puzzles to find this verse') },
      got ? h('b', {}, v.ref) : h('b', {}, '?'), got ? h('small', {}, v.text.length > 60 ? v.text.slice(0, 57) + '…' : v.text) : h('small', {}, 'Not found yet'));
  });
  return h('div', { class: 'screen album' }, h('div', { class: 'top-row' }, h('a', { class: 'back-btn', href: '#/me', 'aria-label': 'Back', html: icon('back', 22) }), h('h2', {}, 'Verse Album'), h('b', { class: 'blue' }, `${n}/${VERSES.length}`)),
    h('div', { class: 'bar' }, h('i', { style: { width: (n / VERSES.length) * 100 + '%' } })), h('div', { class: 'al-grid' }, cards), navBar('me'));
}

function accountCard(user) {
  if (!cloudEnabled()) {
    return h('div', { class: 'card' }, h('b', {}, 'Account & online play'), h('small', { class: 'muted' }, 'Cloud save and live matches switch on once Supabase is configured. You are playing as a guest.'));
  }
  if (user) {
    return h('div', { class: 'card' }, h('b', {}, 'Account'),
      h('button', { class: 'btn', onclick: () => startOnline() }, 'Play online'),
      h('button', { class: 'btn ghost', onclick: leaderboardModal }, 'Leaderboard'),
      h('button', { class: 'btn ghost', onclick: async () => { await signOut(); render(); } }, 'Sign out'));
  }
  return h('div', { class: 'card' }, h('b', {}, 'Save your progress & play online'), h('small', { class: 'muted' }, 'Sign in to keep points, coins and levels on every device and to play live matches.'),
    h('button', { class: 'btn', onclick: authModal }, 'Sign in / Sign up'),
    h('button', { class: 'btn ghost', onclick: leaderboardModal }, 'Leaderboard'));
}
function authModal() {
  const email = h('input', { id: 'auth-email', type: 'email', placeholder: 'Email', autocomplete: 'email' });
  const pass = h('input', { id: 'auth-pass', type: 'password', placeholder: 'Password (6+ characters)', autocomplete: 'current-password' });
  const msg = h('small', { class: 'err', role: 'alert' });
  const go = (fn) => async () => { try { msg.textContent = ''; const r = await fn(); m.close(); toast(r?.confirm ? 'Check your email to confirm your account, then sign in' : 'Signed in', r?.confirm ? 4500 : 1800); render(); } catch (e) { msg.textContent = e.message || 'Something went wrong'; } };
  const m = modal(h('div', { class: 'auth' }, h('h3', {}, 'Faith Words account'), email, pass, msg,
    h('button', { class: 'btn', onclick: go(() => signIn(email.value, pass.value)) }, 'Sign in'),
    h('button', { class: 'btn ghost', onclick: go(() => signUp(email.value, pass.value, store.d.name)) }, 'Create account')), { cls: 'sheet' });
}
async function leaderboardModal() {
  const body = h('div', {}, h('p', { class: 'muted' }, 'Loading…'));
  modal(h('div', {}, h('h3', {}, 'Leaderboard'), body), { cls: 'sheet' });
  let rows = [];
  try { rows = await leaderboard(); } catch { /* signed out */ }
  body.innerHTML = '';
  if (!rows.length) body.append(h('p', { class: 'muted' }, currentUser() ? 'No players yet — be the first!' : 'Sign in to see the leaderboard.'));
  rows.forEach((r, i) => body.append(h('div', { class: 'lb-row' }, h('span', {}, `${i + 1}. ${r.name}`, r.title ? h('em', { class: 'lb-title' }, ' · ' + r.title) : null), h('small', {}, `Lv ${r.level}`), h('b', {}, r.xp.toLocaleString()))));
}

// ---------- router
function render() {
  applyCosmetics();
  const route = (location.hash || '#/').replace(/^#/, '');
  leaveGame();
  app.innerHTML = '';
  document.body.dataset.route = route;
  window.scrollTo(0, 0);
  if (route === '/game') { const root = h('div', { class: 'screen gamescreen' }); app.append(root); renderGame(root); return; }
  if (route === '/admin') { app.append(renderAdmin()); return; }
  app.append(route === '/daily' ? daily() : route === '/me' ? me() : route === '/album' ? album() : home());
}
window.addEventListener('hashchange', render);
applyTheme(store.d.settings.theme);
applyCosmetics(); syncMusic();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => applyTheme(store.d.settings.theme));
if (location.search.includes('debug')) window.fwDebug = { game: _debug, store };
render();
if (!store.d.onboarded) {
  showHowTo({ first: true, name: store.d.name, onDone: (name) => { if (name) store.d.name = name; store.d.onboarded = true; store.save(); render(); } });
}
initCloud().then(async (ok) => {
  if (!ok) return;
  try { const c = await A.loadContent(); if (c) setRemoteContent(c); } catch { /* offline */ }
  render();
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
