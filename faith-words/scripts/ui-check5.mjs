// Phase 2 screens: combos on a real submit, themes, music switch, share card.
import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const out = '/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/';
const b = await chromium.launch(); const errs = []; const fail = (m) => { errs.push('FAIL ' + m); console.log('FAIL', m); }; const ok = (m) => console.log('ok  ', m);
const ctx = await b.newContext({ viewport: { width: 390, height: 800 } }); await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
const p = await ctx.newPage(); p.setDefaultTimeout(8000);
p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.goto('http://localhost:8766/?debug', { waitUntil: 'domcontentloaded' }); await p.waitForTimeout(700);
await p.fill('#welcome-name', 'Praise'); await p.click('text=Show me how to play');
for (let i = 0; i < 4; i++) { await p.click('.howto .btn:not(.ghost)'); await p.waitForTimeout(150); }
await p.waitForTimeout(300);

// 1. play one turn of 5 right tiles through the real Submit button: combo labels + score 16-ish
await p.click('.cta >> nth=0'); await p.waitForTimeout(800);
const plan = await p.evaluate(async () => { const E = await import('/js/engine.js'); const st = fwDebug.game().st, used = new Set(); return st.racks.you.map((l, i) => { const t = E.targets(st, l).find((k) => !used.has(k)); if (t != null) used.add(t); return t == null ? null : { i, t }; }).filter(Boolean); });
plan.length === 5 ? ok('5 right tiles planned') : fail('plan ' + plan.length);
for (const { i, t } of plan) { await p.locator('.rack .tile').nth(i).click(); await p.locator(`.cell[data-k="${t}"]`).click(); await p.waitForTimeout(80); }
await p.evaluate(() => { window.__fl = []; setInterval(() => document.querySelectorAll('.float').forEach((n) => { if (!window.__fl.includes(n.textContent)) window.__fl.push(n.textContent); }), 40); });
await p.click('.main-act'); await p.waitForTimeout(4200);
const floats = await p.evaluate(() => window.__fl); console.log('   floats:', floats.join(' | '));
floats.some((t) => t.startsWith('COMBO')) ? ok('combo shown on a streak') : fail('no combo float');
(await p.evaluate(() => fwDebug.game().st.scores.you)) >= 10 ? ok('round scored with combos: ' + await p.evaluate(() => fwDebug.game().st.scores.you)) : fail('score too low');
await p.screenshot({ path: out + 'p2-combo.png' });
await p.waitForTimeout(5500);

// 2. themes + music in Me
await p.evaluate(() => { const s = fwDebug.store; s.d.coins = 900; s.d.stats.totalWords = 150; s.save(); location.hash = '#/me'; }); await p.waitForTimeout(500);
await p.click('[data-cos="b-parch"]'); await p.waitForTimeout(300);
(await p.evaluate(() => fwDebug.store.d.cosmetics.own.includes('b-parch'))) ? ok('bought Parchment') : fail('not bought');
(await p.evaluate(() => document.body.dataset.board)) === 'b-parch' ? ok('board theme applied') : fail('theme not applied');
await p.click('[data-cos="t-stone"]'); await p.waitForTimeout(300);
(await p.evaluate(() => document.body.dataset.tile)) === 't-stone' ? ok('badge-unlocked Stone tablet equipped') : fail('stone tile');
await p.click('[data-cos="b-glass"]'); await p.waitForTimeout(300);
await p.screenshot({ path: out + 'p2-themes.png', fullPage: true });
await p.locator('.seg-row:has-text("Worship music") button:has-text("On")').click(); await p.waitForTimeout(300);
(await p.evaluate(() => fwDebug.store.d.settings.music)) === true ? ok('music setting on (starts after first tap)') : fail('music setting');
await p.click('body'); await p.waitForTimeout(400);
await p.locator('.seg-row:has-text("Worship music") button:has-text("Off")').click();

// 3. themed game board + win celebration + share
await p.evaluate(() => { location.hash = '#/'; }); await p.waitForTimeout(400);
await p.click('.cta >> nth=0'); await p.waitForTimeout(800);
await p.screenshot({ path: out + 'p2-board-glass.png' });
await p.evaluate(async () => { const E = await import('/js/engine.js'); const st = fwDebug.game().st; st.puzzle.cells.forEach((c, k) => { if (c.t === 'l' && !st.board[k].ch) { st.racks.you.push(c.ch); E.place(st, 'you', c.ch, k); } }); });
await p.click('button:has-text("Pass")'); await p.waitForTimeout(1500);
(await p.$('#share-btn')) ? ok('result has Share') : fail('no share button');
await p.click('#share-btn'); await p.waitForTimeout(400);
const clip = await p.evaluate(() => navigator.clipboard.readText().catch(() => '')); console.log('   shared text:', JSON.stringify(clip).slice(0, 200));
(clip.includes('Faith Words') && clip.includes('📖')) || (await p.$('.share-ta')) ? ok('result card copied/shown') : fail('share output');
await p.screenshot({ path: out + 'p2-result.png' });
console.log(errs.length ? errs.join('\n') : 'no page errors'); await b.close(); process.exit(errs.length ? 1 : 0);
