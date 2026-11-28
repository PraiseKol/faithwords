import { h, $, toast, modal, crossSvg, trophySvg, confetti, icon, coin, applyTheme } from './ui.js';
import { store, todayStr } from './store.js';
import { CONFIG, EVENTS, EVENT_PUZZLES } from './config.js';
import { specMain, specDaily, specEvent, specDrop, eventStatus, setRemoteContent, openDrops } from './puzzles.js';
import { verseOfDay, localDate, remindersSupported, applyReminders } from './reminders.js';
import { startChallenge, startChallengeReply, challengeLink, startGame, resumeGame, renderGame, leaveGame, hasActive, activeLabel, hasOnlineActive, startOnline, rejoinOnline, parkedGames, resumeParked, discardParked, _debug } from './game.js';
import { initCloud, cloudEnabled, currentUser, signIn, signUp, signOut, deleteAccount, friendlyAuthError, rememberedEmail, rememberEmail, requestReset, setNewPassword, onRecovery, leaderboard, A } from './cloud.js';
import { renderAdmin } from './admin.js';
import { showHowTo } from './howto.js';
import { sfx, syncMusic } from './audio.js';
import { weekKey } from './progress.js';
import { TIERS } from './leagues.js';
import { shareOut } from './share.js';
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
  return h('nav', { class: 'nav' }, item('home', 'home', 'Play'), item('daily', 'calendar', 'Daily'), item('together', 'users', 'Together'), item('me', 'user', 'Me'));
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

  const dropCards = openDrops(t).map((dr) => {
    const done = d.drops?.[dr.id] || 0, n = dr.puzzles.length, idx = Math.min(done, n - 1), c = dr.colors || ['#2f80ed', '#1c4fb8'];
    return h('div', { class: 'ev-card drop', style: { background: `linear-gradient(160deg, ${c[0]}, ${c[1]})` } },
      h('div', { class: 'ev-time' }, dr.to ? 'Until ' + new Date(dr.to + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'New'),
      h('div', { class: 'ev-emoji' }, dr.icon || '✨'), h('div', { class: 'ev-kind' }, 'NEW PACK'), h('div', { class: 'ev-name' }, dr.title),
      h('div', { class: 'ev-dots' }, Array.from({ length: Math.min(n, 12) }, (_, i) => h('i', { class: i < done ? 'on' : '' }))),
      h('button', { class: 'ev-play', 'data-drop': dr.id, onclick: () => startGame(specDrop(dr, idx)) }, done >= n ? 'Replay' : 'Play'));
  });
  const vod = verseOfDay(t);
  const vodCard = h('div', { class: 'card vod' }, h('small', { class: 'vod-k' }, '📖 Verse of the day'), h('p', { class: 'vod-t' }, '“' + vod.text + '”'), h('b', { class: 'vod-r' }, vod.ref));

  return h('div', { class: 'screen home' },
    topBar(), signinCard(),
    h('div', { class: 'card hello' },
      h('div', { class: 'avatar' }, initial()),
      h('div', { class: 'hello-main' },
        h('div', { class: 'hello-name' }, 'Hi, ' + d.name, store.titleName() ? h('em', { class: 'lb-title' }, ' · ' + store.titleName()) : null),
        h('div', { class: 'hello-sub' }, `Level ${lv.level} · ${d.xp.toLocaleString()} points`),
        h('div', { class: 'bar' }, h('i', { style: { width: (lv.into / lv.need) * 100 + '%' } }))),
      h('div', { class: 'streak', title: 'Win streak' }, h('span', { html: icon('flame', 20) }), h('b', {}, d.winStreak))),
    checkin, dailyCard, vodCard, questsCard(),
    h('div', { class: 'sec-title' }, 'Events'),
    h('div', { class: 'ev-row' }, dropCards, cards),
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
function reminderRow() {
  const d = store.d, r = d.settings.remind || (d.settings.remind = { on: false, h: 8 });
  if (!remindersSupported()) return h('div', { class: 'seg-row' }, h('span', {}, 'Daily verse reminder'), h('small', { class: 'muted' }, 'Available in the mobile app'));
  const apply = async () => { const res = await applyReminders(r); if (res === 'denied') { r.on = false; store.save(); toast('Allow notifications in your phone settings to get reminders'); render(); } };
  return h('div', { class: 'seg-row remind' }, h('span', {}, 'Daily verse reminder'),
    h('div', { class: 'seg' }, [[true, 'On'], [false, 'Off']].map(([v, t]) => h('button', { class: r.on === v ? 'on' : '', onclick: () => { r.on = v; store.save(); apply(); render(); } }, t))),
    r.on ? h('select', { 'aria-label': 'Reminder time', onchange: (e) => { r.h = +e.target.value; store.save(); apply(); } }, [6, 7, 8, 9, 12, 18, 20, 21].map((x) => h('option', { value: x, selected: r.h === x }, (x % 12 || 12) + (x < 12 ? ' am' : ' pm')))) : null);
}
function meParts() {
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
  const P = {};
  P.prof = h('div', { class: 'card prof hero' },
      h('div', { class: 'avatar lg' }, initial()),
      h('div', { class: 'pname' }, h('input', { class: 'name-in', id: 'player-name', 'aria-label': 'Your name', value: d.name, maxlength: 16, onchange: (e) => { d.name = e.target.value.trim() || 'Believer'; store.save(); } }),
        h('small', {}, user ? 'Signed in · ' + user.email : 'Guest · progress saved on this device')),
      h('div', { class: 'lv-big' }, 'Level ', h('b', {}, lv.level))  );
  P.level = h('div', { class: 'card' },
      h('div', { class: 'row-between' }, h('b', {}, 'Total points'), h('b', { class: 'blue' }, d.xp.toLocaleString())),
      h('div', { class: 'bar' }, h('i', { style: { width: (lv.into / lv.need) * 100 + '%' } })),
      h('small', { class: 'muted' }, `${lv.need - lv.into} points to Level ${lv.level + 1}`)  );
  P.checkin = h('div', { class: 'card' },
      h('div', { class: 'row-between' }, h('b', {}, 'Daily check-in'), h('small', { class: 'muted' }, ci.claimed ? 'Come back tomorrow' : 'Keep your streak for bigger rewards')),
      h('small', { class: 'muted' }, `🧊 Streak freezes: ${d.inv.freeze || 0}/${CONFIG.maxFreezes}${ci.usedFreezes ? ` — ${ci.usedFreezes} will be used to save your streak` : ''}`),
      strip,
      h('button', { class: 'btn', disabled: ci.claimed, onclick: claimCheckin }, ci.claimed ? 'Claimed today ✓' : h('span', {}, 'Check in  +', coin(ci.today)))  );
  P.streak = h('div', { class: 'card' },
      h('div', { class: 'row-between' }, h('b', {}, 'Win streak'), h('b', { class: 'flame' }, h('span', { html: icon('flame', 18) }), d.winStreak)),
      h('small', { class: 'muted' }, `Win coins: ${CONFIG.win.base} × streak multiplier. Your next win pays ×${nextMult} (${Math.round(CONFIG.win.base * nextMult)} coins).`)  );
  P.shop = h('div', { class: 'card' }, h('b', {}, 'Shop'),
      shopRow('hint', 'bulb', 'Hint', 'Shows one square\'s letter faintly'),
      shopRow('word', 'eye', 'Word', 'Shows a whole word faintly'),
      shopRow('freeze', 'shield', 'Streak freeze', `Saves your check-in streak for a missed day (max ${CONFIG.maxFreezes})`)  );
  P.themes = themesCard(); P.album = albumCard(); P.badges = badgesCard();
  P.stats = h('div', { class: 'card stats' }, stat('Games', d.stats.games), stat('Wins', d.stats.wins), stat('Best score', d.stats.bestScore), stat('Best streak', d.bestWinStreak)  );
  P.account = accountCard(user);
  P.settings = h('div', { class: 'card' }, h('b', {}, 'Settings'),
      seg('Theme', 'theme', [['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']]),
      seg('Sound', 'sound', [[true, 'On'], [false, 'Off']]),
      seg('Worship music', 'music', [[true, 'On'], [false, 'Off']]),
      seg('Vibration', 'haptics', [[true, 'On'], [false, 'Off']]),
      reminderRow(),
      h('button', { class: 'btn ghost', onclick: () => showHowTo() }, 'How to play'),
      DEBUG ? h('button', { class: 'btn ghost', onclick: () => { d.settings.unlockEvents = !d.settings.unlockEvents; store.save(); render(); } }, 'Unlock all events (testing): ' + (d.settings.unlockEvents ? 'On' : 'Off')) : null,
      h('a', { class: 'link', href: '#/admin' }, 'Admin panel'));
  return { P, ci, lv, d, user };
}

// ---------- Me: a hub of tiles; each opens its own page (#/me/<id>)
const ME_SECTIONS = [
  { id: 'account', icon: '👤', tone: 'mint', title: 'Account', parts: ['account'], sub: ({ user }) => (user ? 'Signed in' : 'Sign in & play online') },
  { id: 'checkin', icon: '🔥', tone: 'ember', title: 'Daily check-in', parts: ['checkin', 'streak'], sub: ({ ci }) => (ci.claimed ? 'Claimed today ✓' : `Claim +${ci.today} coins`), dot: ({ ci }) => !ci.claimed },
  { id: 'shop', icon: '🛍️', tone: 'gold', title: 'Shop', parts: ['shop'], sub: ({ d }) => `${d.inv.hint} hints · ${d.inv.word} words` },
  { id: 'album', icon: '📖', tone: 'parch', title: 'Verse Album', href: '#/album', sub: ({ d }) => `${Object.keys(d.album || {}).length}/${VERSES.length} collected` },
  { id: 'badges', icon: '🏅', tone: 'royal', title: 'Titles & badges', parts: ['badges'], sub: ({ d }) => `${earnedBadges(d).length}/${BADGES.length} earned` },
  { id: 'themes', icon: '🎨', tone: 'rose', title: 'Themes', parts: ['themes'], sub: () => 'Boards & tiles' },
  { id: 'stats', icon: '📊', tone: 'sky', title: 'Stats', parts: ['level', 'stats'], sub: ({ d }) => `${d.stats.wins} wins · best streak ${d.bestWinStreak}` },
  { id: 'settings', icon: '⚙️', tone: 'slate', title: 'Settings', parts: ['settings'], sub: () => 'Sound, theme, help' },
];
function me() {
  const M = meParts(), { P } = M, d = M.d;
  const tile = (t) => h('a', { class: 'hub-tile tone-' + t.tone, href: t.href || '#/me/' + t.id, 'data-sec': t.id },
    h('span', { class: 'ht-ic' }, t.icon, t.dot && t.dot(M) ? h('i', { class: 'ht-dot' }) : null),
    h('b', {}, t.title), h('small', {}, t.sub(M)));
  return h('div', { class: 'screen me' }, topBar(), signinCard(), P.prof,
    h('div', { class: 'card lvl-mini' }, h('div', { class: 'row-between' }, h('b', {}, `Level ${M.lv.level}`), h('small', { class: 'muted' }, `${M.lv.need - M.lv.into} pts to Level ${M.lv.level + 1}`)),
      h('div', { class: 'bar' }, h('i', { style: { width: (M.lv.into / M.lv.need) * 100 + '%' } }))),
    h('div', { class: 'hub-grid' }, ME_SECTIONS.map(tile)), navBar('me'));
}
function meSection(id) {
  const sec = ME_SECTIONS.find((x) => x.id === id && x.parts); if (!sec) { location.hash = '#/me'; return h('div'); }
  const M = meParts();
  return h('div', { class: 'screen me sec tone-' + sec.tone }, h('div', { class: 'top-row' }, h('a', { class: 'back-btn', href: '#/me', 'aria-label': 'Back', html: icon('back', 22) }), h('h2', {}, sec.icon + ' ' + sec.title)),
    ...sec.parts.map((k) => M.P[k]), navBar('me'));
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
// ---------- Together: community goal, weekly league, groups, friend challenges
const soon = (msg) => h('small', { class: 'muted' }, msg);
function together() {
  const user = currentUser(), wk = weekKey(todayStr());
  const goalBox = h('div', { class: 'card', id: 'goal-card' }, h('b', {}, 'Community goal'), soon('Loading…'));
  const leagueBox = h('div', { class: 'card', id: 'league-card' }, h('b', {}, 'Weekly league'), soon('Loading…'));
  const groupBox = h('div', { class: 'card', id: 'group-card' }, h('b', {}, 'Church & small groups'), soon('Loading…'));
  const chalBox = h('div', { class: 'card', id: 'chal-card' }, h('b', {}, 'Challenge a friend'), soon('Loading…'));
  const screen = h('div', { class: 'screen together' }, topBar(), goalBox, leagueBox, groupBox, chalBox, navBar('together'));
  if (!user) {
    [goalBox, leagueBox, groupBox, chalBox].forEach((b) => { b.lastChild.remove(); b.append(soon('Sign in to take part.')); });
    const s = h('button', { class: 'btn', onclick: () => authModal('in') }, 'Sign in / Sign up'); leagueBox.append(s);
    return screen;
  }
  const alive = () => app.contains(screen);
  fillGoal(goalBox, wk, alive); fillLeague(leagueBox, alive); fillGroups(groupBox, wk, alive); fillChallenges(chalBox, alive);
  return screen;
}
async function fillGoal(box, wk, alive) {
  let words = 0; try { words = await A.community(wk); } catch { /* offline */ }
  if (!alive()) return; const d = store.d, goal = CONFIG.communityGoal, mine = d.weekly.key === wk ? d.weekly.words : 0;
  const reached = words >= goal, can = reached && mine >= CONFIG.communityMinWords && d.communityClaimed !== wk;
  box.innerHTML = ''; box.append(h('div', { class: 'row-between' }, h('b', {}, 'Community goal'), h('small', { class: 'muted' }, 'This week')),
    h('div', { class: 'big-line' }, `Together we solved ${words.toLocaleString()} words`), h('div', { class: 'bar' }, h('i', { style: { width: Math.min(100, (words / goal) * 100) + '%' } })),
    soon(`Goal ${goal.toLocaleString()} words · you added ${mine}. Solve ${CONFIG.communityMinWords}+ to share the reward (${CONFIG.communityReward.coins} 🪙 + ${CONFIG.communityReward.hint} hints).`),
    d.communityClaimed === wk ? soon('Reward claimed — thank you! 🙏') : h('button', { class: 'btn', id: 'claim-goal', disabled: !can, onclick: async () => {
      try { await A.claimCommunity(wk); sfx('coin'); confetti(); toast('Community reward claimed!'); render(); } catch (e) { toast(e.message || 'Could not claim'); } } }, reached ? 'Claim reward' : 'Keep solving together'));
}
async function fillLeague(box, alive) {
  let L; try { L = await A.league(); } catch (e) { if (alive()) { box.innerHTML = ''; box.append(h('b', {}, 'Weekly league'), soon('League is unavailable right now.')); } return; }
  if (!alive()) return; box.innerHTML = '';
  const days = Math.max(0, Math.ceil((L.endsAt - Date.now()) / 86400000)), me = L.rows.find((r) => r.me);
  box.append(h('div', { class: 'row-between' }, h('b', {}, `${L.tierName} League`), h('small', { class: 'muted' }, `${days} day${days === 1 ? '' : 's'} left`)),
    L.last ? soon(`Last week: rank ${L.last.rank} → ${L.last.next > L.last.tier ? 'promoted to ' + TIERS[L.last.next - 1] : L.last.next < L.last.tier ? 'moved down to ' + TIERS[L.last.next - 1] : 'stayed in ' + TIERS[L.last.tier - 1]}`) : null,
    soon(`Top 5 move up · bottom 5 move down · ${me ? 'you are ' + me.rank + ' of ' + L.size : ''}`));
  const show = L.rows.filter((r) => r.rank <= 7 || r.me || Math.abs(r.rank - (me?.rank || 0)) <= 1);
  show.forEach((r) => box.append(h('div', { class: 'tg-row' + (r.me ? ' me' : '') }, h('span', { class: 'tg-rank ' + (r.rank <= 5 ? 'tg-zone-up' : r.rank > L.size - 5 ? 'tg-zone-down' : '') }, r.rank),
    h('div', { class: 'tg-main' }, r.name, r.title ? h('em', { class: 'lb-title' }, ' · ' + r.title) : null), h('b', {}, r.xp.toLocaleString() + ' XP'))));
}
async function fillGroups(box, wk, alive) {
  let gs = []; try { gs = await A.myGroups(); } catch { /* offline */ }
  if (!alive()) return; box.innerHTML = ''; box.append(h('b', {}, 'Church & small groups'), soon('A shared leaderboard for your church, youth group or small group.'));
  gs.forEach((g) => box.append(h('button', { class: 'tg-row', 'data-group': g.id, onclick: () => groupModal(g, wk) }, h('div', { class: 'tg-main' }, h('b', {}, g.name), h('small', { class: 'muted' }, ` ${g.members} member${g.members == 1 ? '' : 's'} · code ${g.code}`)), h('span', {}, '›'))));
  box.append(h('div', { class: 'btn-row' }, h('button', { class: 'btn', id: 'create-group', onclick: () => groupForm('create', render) }, 'Create a group'), h('button', { class: 'btn ghost', id: 'join-group', onclick: () => groupForm('join', render) }, 'Join with code')));
}
function groupForm(kind, done) {
  const inp = h('input', { id: 'group-in', placeholder: kind === 'create' ? 'e.g. Grace Chapel Youth' : 'Code, e.g. K7M2QX', maxlength: kind === 'create' ? 30 : 8, autocapitalize: kind === 'join' ? 'characters' : 'words' });
  const msg = h('small', { class: 'err', role: 'alert' });
  const m = modal(h('div', {}, h('h3', {}, kind === 'create' ? 'Create a group' : 'Join a group'), inp, msg,
    h('button', { class: 'btn', id: 'group-go', onclick: async () => { try { msg.textContent = ''; const g = kind === 'create' ? await A.createGroup(inp.value) : await A.joinGroup(inp.value); m.close(); toast(kind === 'create' ? `Group created — share code ${g.code}` : 'Joined ' + g.name, 3500); done(); } catch (e) { msg.textContent = e.message || 'Something went wrong'; } } }, kind === 'create' ? 'Create' : 'Join')), { cls: 'sheet' });
}
async function groupModal(g, wk) {
  const body = h('div', {}, soon('Loading…'));
  const m = modal(h('div', {}, h('h3', {}, g.name), h('div', { class: 'row-between' }, soon('Invite with this code'), h('span', { class: 'code-box', id: 'group-code' }, g.code)),
    h('button', { class: 'btn ghost sm', onclick: () => shareOut(`Join our group "${g.name}" on Faith Words with code ${g.code}`) }, 'Share invite'), body,
    h('button', { class: 'btn ghost', onclick: async () => { await A.leaveGroup(g.id); m.close(); render(); } }, 'Leave group')), { cls: 'sheet' });
  try {
    const rows = await A.groupBoard(g.id, wk); body.innerHTML = ''; body.append(h('div', { class: 'row-between' }, h('b', {}, 'This week'), h('small', { class: 'muted' }, 'XP')));
    rows.forEach((r, i) => body.append(h('div', { class: 'tg-row' + (r.me ? ' me' : '') }, h('span', { class: 'tg-rank' }, i + 1), h('div', { class: 'tg-main' }, r.name, r.title ? h('em', { class: 'lb-title' }, ' · ' + r.title) : null, h('small', { class: 'muted' }, ` Lv ${r.level}`)), h('b', {}, r.week_xp.toLocaleString()))));
  } catch (e) { body.innerHTML = ''; body.append(soon(e.message || 'Could not load the board')); }
}
async function fillChallenges(box, alive) {
  let list = []; try { list = await A.myChallenges(); } catch { /* offline */ }
  if (!alive()) return; box.innerHTML = ''; box.append(h('b', {}, 'Challenge a friend'), soon('Play a puzzle, send the link — your friend plays the same one whenever they like.'),
    h('button', { class: 'btn', id: 'new-challenge', onclick: () => startChallenge() }, 'Start a challenge'));
  list.slice(0, 5).forEach((c) => box.append(h('a', { class: 'tg-row', href: '#/c/' + c.id }, h('div', { class: 'tg-main' }, h('b', {}, c.mine ? 'You vs ' + (c.opp_name || '…waiting') : c.creator_name + ' vs you'),
    h('small', { class: 'muted' }, c.opp_score == null ? ` · waiting for a reply (${c.creator_score})` : ` · ${c.creator_score} – ${c.opp_score}`)), h('span', {}, '›'))));
}
function challengeScreen(id) {
  const body = h('div', { class: 'card' }, soon('Loading…'));
  const screen = h('div', { class: 'screen' }, topBar(), body, navBar('together'));
  (async () => {
    if (!currentUser()) { body.innerHTML = ''; body.append(h('b', {}, 'A friend challenged you!'), soon('Sign in to play and compare scores.'), h('button', { class: 'btn', onclick: () => authModal('in') }, 'Sign in / Sign up')); return; }
    let c; try { c = await A.getChallenge(id); } catch { c = null; }
    body.innerHTML = '';
    if (!c) { body.append(h('b', {}, 'Challenge not found'), soon('The link may be mistyped.'), h('a', { class: 'btn', href: '#/together' }, 'Back')); return; }
    if (c.mine) {
      body.append(h('b', {}, 'Your challenge'), h('div', { class: 'res-score' }, h('b', {}, c.creator_score), ' – ', h('b', {}, c.opp_score ?? '?')),
        soon(c.opp_name ? `${c.opp_name} answered.` : 'Waiting for your friend to play.'), h('button', { class: 'btn', onclick: () => shareOut(`Can you beat my score of ${c.creator_score} on Faith Words? ${challengeLink(c.id)}`) }, 'Send the link again'));
    } else {
      body.append(h('b', {}, `${c.creator_name} challenges you!`), h('div', { class: 'res-score' }, h('b', {}, c.creator_score), h('small', {}, ' to beat')), soon('Same puzzle, your turn whenever you are ready.'),
        h('button', { class: 'btn', id: 'accept-chal', onclick: () => startChallengeReply(c) }, 'Accept the challenge'));
    }
  })();
  return screen;
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

/** A prominent sign-in / sign-up card, shown at the top of Home and Me while the player is a guest. */
function signinCard() {
  if (!cloudEnabled() || currentUser()) return null;
  return h('div', { class: 'card signin-card', 'data-card': 'signin' },
    h('div', { class: 'si-ic', html: crossSvg(26) }),
    h('div', { class: 'si-txt' }, h('b', {}, 'Save your progress'), h('small', {}, 'Sign in to keep your coins and levels, and to play online.')),
    h('div', { class: 'si-btns' },
      h('button', { class: 'btn sm', 'data-act': 'si-in', onclick: () => authModal('in') }, 'Sign in'),
      h('button', { class: 'btn ghost sm', 'data-act': 'si-up', onclick: () => authModal('up') }, 'Sign up')));
}
function accountCard(user) {
  if (!cloudEnabled()) {
    return h('div', { class: 'card' }, h('b', {}, 'Account & online play'), h('small', { class: 'muted' }, 'Cloud save and live matches switch on once Supabase is configured. You are playing as a guest.'));
  }
  if (user) {
    return h('div', { class: 'card' }, h('b', {}, 'Account'),
      h('button', { class: 'btn', onclick: () => startOnline() }, 'Play online'),
      h('button', { class: 'btn ghost', onclick: leaderboardModal }, 'Leaderboard'),
      h('button', { class: 'btn ghost', onclick: async () => { await signOut(); render(); } }, 'Sign out'),
      h('button', { class: 'btn ghost danger', 'data-act': 'delete-account', onclick: deleteAccountModal }, 'Delete my account'),
      h('a', { class: 'privacy-link', href: 'privacy.html', target: '_blank', rel: 'noopener' }, 'Privacy policy'));
  }
  return h('div', { class: 'card' }, h('b', {}, 'Save your progress & play online'), h('small', { class: 'muted' }, 'Sign in to keep points, coins and levels on every device and to play live matches.'),
    h('button', { class: 'btn', onclick: () => authModal('in') }, 'Sign in'),
    h('button', { class: 'btn ghost', onclick: () => authModal('up') }, 'Create account'),
    h('button', { class: 'btn ghost', onclick: leaderboardModal }, 'Leaderboard'),
    h('a', { class: 'privacy-link', href: 'privacy.html', target: '_blank', rel: 'noopener' }, 'Privacy policy'));
}
function deleteAccountModal() {
  const box = h('input', { id: 'del-confirm', type: 'text', placeholder: 'Type DELETE', autocomplete: 'off', autocapitalize: 'characters' });
  const msg = h('small', { class: 'err', role: 'alert' });
  const go = h('button', { class: 'btn danger', disabled: true, 'data-act': 'delete-confirm' }, 'Delete everything');
  box.addEventListener('input', () => { go.disabled = box.value.trim() !== 'DELETE'; });
  const m = modal(h('div', { class: 'auth' }, h('h3', {}, 'Delete your account?'),
    h('p', { class: 'muted' }, 'This permanently removes your account, progress, coins, verse album, groups you own and leaderboard entry from our servers. It cannot be undone.'),
    box, msg, go,
    h('button', { class: 'btn ghost', onclick: () => m.close() }, 'Keep my account')), { cls: 'sheet' });
  go.addEventListener('click', async () => {
    go.disabled = true; go.textContent = 'Deleting…'; msg.textContent = '';
    try { await deleteAccount(); m.close(); toast('Your account was deleted', 3000); location.hash = '#/'; render(); }
    catch (e) { msg.textContent = e.message || 'Something went wrong'; go.disabled = false; go.textContent = 'Delete everything'; }
  });
}
/** Sign in / create account / forgot password in one friendly sheet. */
function authModal(start = 'in') {
  let mode = start;                       // 'in' | 'up' | 'reset'
  const saved = rememberedEmail();
  const body = h('div', { class: 'auth' });
  const m = modal(body, { cls: 'sheet' });
  const field = (id, type, ph, ac, val = '') => { const el = h('input', { id, name: id, type, placeholder: ph, autocomplete: ac, autocapitalize: 'off', spellcheck: 'false' }); el.value = val; return el; };
  const draw = () => {
    body.innerHTML = '';
    const msg = h('small', { class: 'err', role: 'alert' });
    const ok = h('small', { class: 'ok', role: 'status' });
    const email = field('auth-email', 'email', 'Email', 'username', saved);
    email.setAttribute('inputmode', 'email');
    body.append(h('div', { class: 'auth-head' }, h('div', { class: 'logo big', html: crossSvg(40) }), h('h3', {}, mode === 'reset' ? 'Reset your password' : mode === 'up' ? 'Join Faith Words' : 'Welcome back')));
    if (mode !== 'reset') {
      body.append(h('div', { class: 'auth-tabs', role: 'tablist' },
        h('button', { type: 'button', class: mode === 'in' ? 'on' : '', 'data-tab': 'in', role: 'tab', onclick: () => { mode = 'in'; draw(); } }, 'Sign in'),
        h('button', { type: 'button', class: mode === 'up' ? 'on' : '', 'data-tab': 'up', role: 'tab', onclick: () => { mode = 'up'; draw(); } }, 'Create account')));
    }
    const form = h('form', { class: 'auth-form', novalidate: true });
    if (mode === 'reset') {
      form.append(h('p', { class: 'muted' }, 'Enter your email and we’ll send you a link to choose a new password.'), email, msg, ok,
        h('button', { class: 'btn', type: 'submit', 'data-act': 'send-reset' }, 'Send reset link'),
        h('button', { class: 'btn ghost', type: 'button', onclick: () => { mode = 'in'; draw(); } }, 'Back to sign in'));
    } else {
      const name = mode === 'up' ? field('auth-name', 'text', 'Your name (shown to other players)', 'nickname', store.d.name && store.d.name !== 'Believer' ? store.d.name : '') : null;
      if (name) name.maxLength = 20;
      const pass = field('auth-pass', 'password', mode === 'up' ? 'Choose a password (6+ characters)' : 'Password', mode === 'up' ? 'new-password' : 'current-password');
      const eye = h('button', { type: 'button', class: 'eye', 'aria-label': 'Show password', 'data-act': 'toggle-pass', onclick: () => { const on = pass.type === 'password'; pass.type = on ? 'text' : 'password'; eye.textContent = on ? 'Hide' : 'Show'; eye.setAttribute('aria-label', on ? 'Hide password' : 'Show password'); } }, 'Show');
      const keep = h('label', { class: 'keep' }, h('input', { type: 'checkbox', id: 'auth-keep', checked: true }), h('span', {}, 'Remember my email on this device'));
      form.append(...(name ? [name] : []), email, h('div', { class: 'pass-wrap' }, pass, eye),
        mode === 'in' ? h('div', { class: 'auth-row' }, keep, h('button', { type: 'button', class: 'link', 'data-act': 'forgot', onclick: () => { mode = 'reset'; draw(); } }, 'Forgot password?')) : keep,
        msg, h('button', { class: 'btn', type: 'submit', 'data-act': 'auth-go' }, mode === 'up' ? 'Create account' : 'Sign in'),
        h('p', { class: 'auth-fine muted' }, mode === 'up' ? 'Free forever. Your progress is saved on every device.' : 'You’ll stay signed in on this device until you sign out.'));
    }
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); msg.textContent = ''; ok.textContent = '';
      const btn = form.querySelector('button[type=submit]'), label = btn.textContent;
      const em = email.value.trim();
      if (!/^\S+@\S+\.\S+$/.test(em)) { msg.textContent = 'Please enter a valid email address.'; email.focus(); return; }
      try {
        if (mode === 'reset') {
          btn.disabled = true; btn.textContent = 'Sending…';
          await requestReset(em);
          ok.textContent = 'Done! If that email has an account, a reset link is on its way. Check your spam folder too.';
          btn.textContent = 'Sent ✓'; return;
        }
        const pw = form.querySelector('#auth-pass').value;
        if (pw.length < 6) { msg.textContent = 'Your password needs at least 6 characters.'; form.querySelector('#auth-pass').focus(); return; }
        btn.disabled = true; btn.textContent = mode === 'up' ? 'Creating…' : 'Signing in…';
        const r = mode === 'up' ? await signUp(em, pw, (form.querySelector('#auth-name')?.value || '').trim() || store.d.name) : await signIn(em, pw);
        rememberEmail(form.querySelector('#auth-keep')?.checked ? em : '');
        if (r?.confirm) { body.innerHTML = ''; body.append(h('div', { class: 'auth-head' }, h('div', { class: 'res-emoji' }, '📧'), h('h3', {}, 'Check your email'), h('p', { class: 'muted' }, `We sent a confirmation link to ${em}. Tap it, then come back and sign in.`), h('button', { class: 'btn', onclick: () => { mode = 'in'; draw(); } }, 'Go to sign in'))); return; }
        m.close(); toast(mode === 'up' ? 'Welcome to Faith Words! 🙏' : 'Signed in', 1800); render();
      } catch (err) { msg.textContent = friendlyAuthError(err); btn.disabled = false; btn.textContent = label; }
    });
    body.append(form);
    (mode === 'up' ? form.querySelector('#auth-name') : saved && mode === 'in' ? form.querySelector('#auth-pass') : email)?.focus?.();
  };
  draw();
}
/** Opened when the player taps the link in the "reset password" email. */
function newPasswordModal() {
  const pass = h('input', { id: 'new-pass', type: 'password', placeholder: 'New password (6+ characters)', autocomplete: 'new-password' });
  const msg = h('small', { class: 'err', role: 'alert' });
  const form = h('form', { class: 'auth-form' }, pass, msg, h('button', { class: 'btn', type: 'submit', 'data-act': 'save-pass' }, 'Save new password'));
  const m = modal(h('div', { class: 'auth' }, h('div', { class: 'auth-head' }, h('div', { class: 'res-emoji' }, '🔑'), h('h3', {}, 'Choose a new password')), form), { dismiss: false, cls: 'sheet' });
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); msg.textContent = '';
    if (pass.value.length < 6) { msg.textContent = 'Your password needs at least 6 characters.'; return; }
    try { await setNewPassword(pass.value); m.close(); history.replaceState(null, '', location.pathname + '#/'); toast('Password updated — you are signed in', 3000); render(); }
    catch (err) { msg.textContent = friendlyAuthError(err); }
  });
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
  document.querySelectorAll('body > .nav').forEach((n) => n.remove());
  if (route === '/game') { const root = h('div', { class: 'screen gamescreen' }); app.append(root); renderGame(root); return; }
  if (route === '/admin') { mount(renderAdmin()); return; }
  if (route.startsWith('/c/')) { mount(challengeScreen(route.slice(3))); return; }
  mount(route === '/daily' ? daily() : route === '/me' ? me() : route.startsWith('/me/') ? meSection(route.slice(4)) : route === '/album' ? album() : route === '/together' ? together() : home());
}
/** The bottom bar is lifted out of the (animated) screen and pinned to the viewport, so it never scrolls away. */
function mount(screen) {
  const nav = screen.querySelector(':scope > .nav'); if (nav) nav.remove();
  app.append(screen); if (nav) document.body.append(nav);
}
window.addEventListener('hashchange', render);
applyTheme(store.d.settings.theme);
applyCosmetics(); syncMusic();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => applyTheme(store.d.settings.theme));
if (location.search.includes('debug')) window.fwDebug = { game: _debug, store };
render();
applyReminders(store.d.settings.remind || {}); // top up the next 30 days of verse reminders (does nothing on the web)
if (!store.d.onboarded) {
  showHowTo({ first: true, name: store.d.name, onDone: (name) => { if (name) store.d.name = name; store.d.onboarded = true; store.save(); render(); } });
}
onRecovery(newPasswordModal);
initCloud().then(async (ok) => {
  if (!ok) return;
  try { const c = await A.loadContent(); if (c) setRemoteContent(c); } catch { /* offline */ }
  render();
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
