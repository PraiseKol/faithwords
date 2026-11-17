// Events: Next puzzle really shows the next puzzle; the main game stays reachable while an event is in progress.
import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const out = '/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/';
const b = await chromium.launch(); const errs = []; const fail = (m) => { errs.push('FAIL ' + m); console.log('FAIL', m); }; const ok = (m) => console.log('ok  ', m);
const p = await (await b.newContext({ viewport: { width: 390, height: 800 } })).newPage();
p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.goto('http://localhost:8766/?debug'); await p.waitForTimeout(700);
await p.fill('#welcome-name', 'Praise'); await p.click('text=Show me how to play');
for (let i = 0; i < 4; i++) { await p.click('.howto .btn:not(.ghost)'); await p.waitForTimeout(150); }
await p.evaluate(() => { fwDebug.store.d.settings.unlockEvents = true; fwDebug.store.save(); }); await p.reload(); await p.waitForTimeout(800);
const title = () => p.$eval('.g-title', (e) => e.firstChild.textContent.trim());
const home = async () => { await p.evaluate(() => { location.hash = '#/'; }); await p.waitForTimeout(400); };
const ctas = () => p.$$eval('.cta-stack .cta, .cta-stack .parked .link:not(.x)', (e) => e.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
const giveUp = async () => { await p.click('.g-tools .icon-btn >> nth=1'); await p.waitForTimeout(250); await p.click('text=Give up this match'); await p.waitForTimeout(600); };

// 1. Next puzzle inside an event shows the NEXT puzzle (screen redrawn, not the old board)
await p.locator('.ev-play').first().click(); await p.waitForTimeout(700);
(await title()).startsWith('Heroes of Faith 1/6') ? ok('event puzzle 1 open') : fail('start ' + await title());
const board1 = await p.$eval('.grid', (e) => e.innerHTML);
await giveUp(); await p.click('.result .btn >> text=Next puzzle'); await p.waitForTimeout(800);
const t2 = await title(), board2 = await p.$eval('.grid', (e) => e.innerHTML);
t2.startsWith('Heroes of Faith 2/6') ? ok('Next puzzle shows ' + t2) : fail('Next puzzle showed ' + t2);
board1 !== board2 ? ok('the board on screen changed to the new puzzle') : fail('board did not change');
(await p.evaluate(() => fwDebug.game().spec.label)) === t2 ? ok('screen matches the game being played') : fail('screen/game mismatch');
await giveUp(); await p.click('.result .btn >> text=Next puzzle'); await p.waitForTimeout(800);
(await title()).startsWith('Heroes of Faith 3/6') ? ok('and again → 3/6') : fail('third ' + await title());

// 2. main game stays reachable while an event is in progress
await home();
let c = await ctas(); console.log('   home while event active:', c);
c[0].startsWith('Continue') && c[0].includes('Heroes of Faith 3/6') && c.some((x) => x.startsWith('Main game')) ? ok('home offers Continue (event) AND Main game') : fail('home buttons ' + c);
await p.screenshot({ path: out + 'home-two.png' });
await p.click('.cta >> text=Main game'); await p.waitForTimeout(700);
(await title()).startsWith('Puzzle') || /Level|Puzzle/.test(await title()) ? ok('Main game started: ' + await title()) : fail('main title ' + await title());
await home(); c = await ctas(); console.log('   home after starting main:', c);
c[0].startsWith('Continue') && c.some((x) => x.includes('Resume: Heroes of Faith 3/6')) && !c.some((x) => x.startsWith('Main game')) ? ok('event is kept as "Resume: Heroes of Faith 3/6"; main is the active game') : fail('home buttons ' + c);
await p.click('.parked .link:not(.x)'); await p.waitForTimeout(700);
(await title()).startsWith('Heroes of Faith 3/6') ? ok('Resume brings the event back exactly where it was') : fail('resume ' + await title());
await home(); c = await ctas();
c[0].includes('Heroes of Faith 3/6') && c.some((x) => x.startsWith('Main game')) && c.some((x) => x.startsWith('Resume: ')) ? ok('after resuming: event active, main game still saved') : fail('home buttons ' + c);
// 3. discarding a parked game
await p.click('.parked .link.x'); await p.waitForTimeout(300);
(await ctas()).some((x) => x.startsWith('Resume:')) ? fail('discard failed') : ok('✕ discards a parked game');
// 4. Next level from a main puzzle redraws too
await p.click('.cta >> text=Main game'); await p.waitForTimeout(600);
const m1 = await title(); await giveUp(); await p.click('.result .btn >> text=Next level'); await p.waitForTimeout(800);
const m2 = await title(); m1 !== m2 ? ok(`main: Next level ${m1} → ${m2}`) : fail('main next level stayed on ' + m1);
console.log(errs.join('\n') || 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0);
