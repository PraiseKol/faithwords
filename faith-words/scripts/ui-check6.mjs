// Phase 3 screens with a mocked server: Together (goal, league, groups, challenges), challenge create + reply, reactions.
import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
import { handleOp } from '../js/serverlogic.js';
const out = '/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/';
let game = null; const errs = []; const fail = (m) => { errs.push('FAIL ' + m); console.log('FAIL', m); }; const ok = (m) => console.log('ok  ', m);
const b = await chromium.launch(); const ctxb = await b.newContext({ viewport: { width: 390, height: 800 } }); await ctxb.grantPermissions(['clipboard-read', 'clipboard-write']);
const p = await ctxb.newPage(); p.setDefaultTimeout(8000);
p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.exposeFunction('__nodeOp', async (json) => {
  const body = JSON.parse(json);
  try { const r = await handleOp(game, body, { uid: 'u1', now: Date.now(), loadMatch: async () => null, loadCustom: async () => [], loadCommunity: async () => 6200 }); game = r.game; return JSON.stringify({ game: r.game, summary: r.summary }); }
  catch (e) { return JSON.stringify({ error: e.message, status: e.status || 500 }); }
});
await p.addInitScript(() => {
  const groups = []; const sent = [];
  window.__sent = sent;
  window.__fwMock = {
    user: { id: 'u1', email: 't@example.com' },
    async op(body) {
      // the test dumps a whole board in one turn, which the real server (rightly) rejects: answer challenge results here
      const r = body.op === 'result' && body.challenge ? { ...JSON.parse(await window.__nodeOp(JSON.stringify({ op: 'sync' }))), summary: { score: 44, seed: body.spec.seed } } : JSON.parse(await window.__nodeOp(JSON.stringify(body)));
      if (r.error) { const e = new Error(r.error); e.status = r.status; throw e; }
      if (body.op === 'result' && body.challenge?.create) r.challenge = { id: 'abc12345', seed: body.spec.seed, creator_name: 'Praise', creator_score: r.summary.score, you: r.summary.score, mine: true };
      if (body.op === 'result' && body.challenge?.reply) r.challenge = { id: body.challenge.reply, seed: body.spec.seed, creator_name: 'Grace', creator_score: 30, you: r.summary.score, mine: false };
      return r;
    },
    async leaderboard() { return []; }, async loadContent() { return null; }, async isAdmin() { return false; },
    async league() { const rows = Array.from({ length: 30 }, (_, i) => ({ rank: i + 1, name: i === 11 ? 'Praise' : 'Player ' + (i + 1), title: '', xp: 600 - i * 18, me: i === 11 })); return { week: '2026-11-16', tier: 2, tierName: 'Silver', size: 30, endsAt: Date.now() + 3 * 86400000, last: { week: '2026-11-09', tier: 1, rank: 3, next: 2 }, rows }; },
    async community() { return 6200; }, async claimCommunity() { window.__claimed = true; return { reward: {} }; },
    async myGroups() { return groups.slice(); },
    async createGroup(name) { const g = { id: 'g' + groups.length, code: 'K7M2QX', name, members: 1, owner: true }; groups.push(g); return g; },
    async joinGroup(code) { if (code !== 'K7M2QX') throw new Error('No group with that code'); return { id: 'g9', code, name: 'Grace Chapel' }; },
    async leaveGroup() {}, async groupBoard() { return [{ name: 'Praise', title: '', level: 3, xp: 400, week_xp: 120, me: true }, { name: 'Ada', title: 'Scribe', level: 5, xp: 900, week_xp: 90, me: false }]; },
    async getChallenge(id) { return { id, seed: 'online-5', creator_name: 'Grace', creator_score: 30, opp_name: null, opp_score: null, mine: false }; },
    async myChallenges() { return [{ id: 'abc12345', seed: 'online-5', creator_name: 'Praise', creator_score: 44, opp_name: 'Ada', opp_score: 38, mine: true }]; },
    subscribeMatch() { return { stop() {}, react(k) { sent.push(k); } }; },
  };
  navigator.share = undefined;
});
await p.goto('http://localhost:8766/?debug', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.fwDebug); await p.evaluate(() => { fwDebug.store.d.onboarded = true; fwDebug.store.d.name = 'Praise'; fwDebug.store.save(); }); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(800);

// Together screen
await p.click('.nav a:has-text("Together")'); await p.waitForTimeout(900);
(await p.$eval('#goal-card', (e) => e.innerText)).includes('6,200') ? ok('community goal shows the shared total') : fail('goal');
(await p.$eval('#league-card', (e) => e.innerText)).includes('Silver League') ? ok('league shows tier') : fail('league');
(await p.$$eval('#league-card .tg-row', (e) => e.length)) >= 8 ? ok('league rows shown') : fail('league rows');
(await p.$eval('#claim-goal', (e) => e.disabled)) ? ok('claim disabled until you solved enough words') : fail('claim enabled early');
await p.evaluate(() => { fwDebug.store.d.weekly = { key: '2026-11-16', xp: 50, words: 30 }; const t = new Date(); }); // not this week's key -> still disabled
// groups: create then join
await p.click('#create-group'); await p.fill('#group-in', 'Grace Chapel Youth'); await p.click('#group-go'); await p.waitForTimeout(700);
(await p.$('#group-card [data-group]')) ? ok('group created and listed') : fail('group not listed');
await p.click('#group-card [data-group]'); await p.waitForTimeout(500);
(await p.$eval('#group-code', (e) => e.textContent)) === 'K7M2QX' ? ok('invite code shown') : fail('code');
(await p.$$eval('.modal .tg-row', (e) => e.length)) === 2 ? ok('group board lists members') : fail('board');
await p.screenshot({ path: out + 'p3-group.png' });
await p.keyboard.press('Escape'); await p.evaluate(() => document.querySelector('.modal-back')?.click()); await p.waitForTimeout(300);
await p.click('#join-group'); await p.fill('#group-in', 'WRONG1'); await p.click('#group-go'); await p.waitForTimeout(300);
(await p.$eval('.err', (e) => e.textContent)).includes('No group') ? ok('bad code explains itself') : fail('join error');
await p.evaluate(() => document.querySelector('.modal-back')?.click());
await p.screenshot({ path: out + 'p3-together.png', fullPage: true });

// challenge: create (play, then link)
await p.click('#new-challenge'); await p.waitForTimeout(900);
(await p.$eval('.g-title', (e) => e.textContent)).includes('Friend challenge') ? ok('challenge puzzle opened') : fail('not challenge');
await p.evaluate(async () => { const E = await import('/js/engine.js'); const st = fwDebug.game().st; st.puzzle.cells.forEach((c, k) => { if (c.t === 'l' && !st.board[k].ch) { st.racks.you.push(c.ch); E.place(st, 'you', c.ch, k); } }); });
await p.click('button:has-text("Pass")'); await p.waitForTimeout(2500);
await p.waitForSelector('#send-chal', { timeout: 9000 }).then(() => ok('send-link button after finishing')).catch(() => fail('no send-link button (server said: ' + game?.weekly?.xp + ')'));
await p.click('#send-chal').catch(() => {}); await p.waitForTimeout(400);
const clip = await p.evaluate(() => navigator.clipboard.readText().catch(() => '')); clip.includes('#/c/abc12345') ? ok('link copied: ' + clip.slice(0, 60)) : fail('link text: ' + clip);
await p.screenshot({ path: out + 'p3-chal-create.png' });
(await p.$eval('.result .btn-row .btn', (e) => e.textContent)).includes('Rematch') ? ok('Rematch offered') : fail('no rematch');
await p.evaluate(() => { document.querySelector('.modal-back')?.remove(); fwDebug.game().finished = true; location.hash = '#/'; });

// challenge: reply via link
await p.evaluate(() => { location.hash = '#/c/zzz99999'; }); await p.waitForTimeout(800);
(await p.$eval('.screen', (e) => e.innerText)).includes('Grace challenges you') ? ok('challenge link page') : fail('link page');
await p.click('#accept-chal'); await p.waitForTimeout(900);
await p.evaluate(async () => { const E = await import('/js/engine.js'); const st = fwDebug.game().st; st.puzzle.cells.forEach((c, k) => { if (c.t === 'l' && !st.board[k].ch) { st.racks.you.push(c.ch); E.place(st, 'you', c.ch, k); } }); });
await p.click('button:has-text("Pass")'); await p.waitForSelector('#chal-box b', { timeout: 9000 }).catch(() => {}); await p.waitForTimeout(800);
const cb = await p.$eval('#chal-box', (e) => e.innerText).catch(() => ''); /You win/.test(cb) ? ok('reply result: ' + cb.replace(/\s+/g, ' ')) : fail('reply result: ' + cb);
await p.screenshot({ path: out + 'p3-chal-reply.png' });
console.log(errs.length ? errs.join('\n') : 'no page errors'); await b.close(); process.exit(errs.length ? 1 : 0);
