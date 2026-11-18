// Phase 1 screens: quests + chest, verse reveal and album, freezes in the shop, badges and titles.
import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const out = '/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/';
const b = await chromium.launch(); const errs = []; const fail = (m) => { errs.push('FAIL ' + m); console.log('FAIL', m); }; const ok = (m) => console.log('ok  ', m);
const p = await (await b.newContext({ viewport: { width: 390, height: 800 } })).newPage(); p.setDefaultTimeout(8000);
p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.goto('http://localhost:8766/?debug', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(700);
await p.fill('#welcome-name', 'Praise'); await p.click('text=Show me how to play');
for (let i = 0; i < 4; i++) { await p.click('.howto .btn:not(.ghost)'); await p.waitForTimeout(150); }
await p.waitForTimeout(300);
const home = async () => { await p.evaluate(() => { location.hash = '#/'; }); await p.waitForTimeout(400); };

// 1. home shows three quests and a locked chest
await home();
(await p.$$('.quests .quest')).length === 3 ? ok('3 daily quests on Home') : fail('quests count');
(await p.$eval('#chest-btn', (e) => e.disabled)) ? ok('chest is locked at the start') : fail('chest unlocked early');
await p.screenshot({ path: out + 'p1-home.png' });

// 2. finish a real puzzle (fill the board through the engine, then end the turn): verse card + quest progress
await p.click('.cta >> nth=0'); await p.waitForTimeout(800);
await p.evaluate(async () => {
  const E = await import('/js/engine.js'); const G = fwDebug.game(); const st = G.st;
  st.puzzle.cells.forEach((c, k) => { if (c.t === 'l' && !st.board[k].ch) { st.racks.you.push(c.ch); E.place(st, 'you', c.ch, k); } });
});
await p.click('button:has-text("Pass")'); await p.waitForTimeout(1500);
(await p.$('.result .vcard')) ? ok('result shows a verse card') : fail('no verse card in result');
(await p.$('.result .vcard.new')) ? ok('flagged NEW CARD') : fail('not flagged new');
const txt = await p.$eval('.result', (e) => e.innerText); console.log('   result text:', txt.replace(/\s+/g, ' ').slice(0, 420));
await p.screenshot({ path: out + 'p1-result.png' });
await p.click('.result .btn.ghost >> text=Home'); await p.waitForTimeout(500);
const prog = await p.$$eval('.quests .q-n', (e) => e.map((x) => x.textContent)); console.log('   quest progress:', prog.join(' '));
// (this test dumps 100+ tiles in one turn, which the replay rightly rejects, so quest counting is covered by scripts/test-phase1.mjs)

// 3. finish all quests -> chest opens once
await p.evaluate(() => { const s = fwDebug.store; s.d.quests.done = s.quests().list.map((q) => q.id); s.d.quests.prog = {}; s.save(); location.hash = '#/me'; location.hash = '#/'; });
await p.waitForTimeout(500);
(await p.$eval('#chest-btn', (e) => !e.disabled)) ? ok('chest unlocks when all 3 are done') : fail('chest stays locked');
const c0 = await p.evaluate(() => fwDebug.store.d.coins);
await p.click('#chest-btn'); await p.waitForTimeout(400);
(await p.$('.result h2:has-text("Chest opened")')) ? ok('chest modal') : fail('no chest modal');
await p.screenshot({ path: out + 'p1-chest.png' });
await p.click('.result .btn'); await p.waitForTimeout(400);
(await p.evaluate(() => fwDebug.store.d.coins)) > c0 ? ok('coins paid') : fail('no coins');
(await p.$('.chest.opened')) ? ok('chest shows opened') : fail('chest not marked opened');

// 4. Me: freeze in shop, album, badges; wear a title
await p.evaluate(() => { const s = fwDebug.store; s.d.coins = 500; s.d.stats.totalWords = 120; s.save(); location.hash = '#/me'; });
await p.waitForTimeout(500);
await p.locator('.shop-row:has-text("Streak freeze") .btn').click(); await p.waitForTimeout(300);
(await p.evaluate(() => fwDebug.store.d.inv.freeze)) >= 1 ? ok('bought a streak freeze') : fail('freeze not bought');
await p.click('[data-badge="scribe"]'); await p.waitForTimeout(300);
(await p.evaluate(() => fwDebug.store.d.title)) === 'scribe' ? ok('Scribe title worn') : fail('title not set');
(await p.$eval('.hello-name, .badge.worn', (e) => !!e)) ? ok('badge shows as worn') : fail('worn');
await p.screenshot({ path: out + 'p1-me.png', fullPage: true });
await p.click('#open-album'); await p.waitForTimeout(500);
const got = await p.$$('.al-card.got'); got.length >= 1 ? ok('album shows ' + got.length + ' collected card(s)') : fail('album empty');
await p.locator('.al-card.got').first().click(); await p.waitForTimeout(300);
(await p.$('.modal .vcard')) ? ok('tapping a card opens its story') : fail('card modal');
await p.screenshot({ path: out + 'p1-album.png' });
await home(); (await p.$eval('.hello-name', (e) => e.textContent)).includes('Scribe') ? ok('title shown on Home') : fail('no title on Home');
console.log(errs.length ? errs.join('\n') : 'no page errors'); await b.close(); process.exit(errs.length ? 1 : 0);
