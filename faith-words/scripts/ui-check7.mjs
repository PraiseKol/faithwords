// Selah: review the finished board from the result screen.
import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const out = '/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/';
const errs = []; const fail = (m) => { errs.push(m); console.log('FAIL', m); }; const ok = (m) => console.log('ok  ', m);
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 800 } })).newPage(); p.setDefaultTimeout(8000);
p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
await p.goto('http://localhost:8766/?debug', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.fwDebug);
await p.evaluate(() => { fwDebug.store.d.onboarded = true; fwDebug.store.d.name = 'Praise'; fwDebug.store.save(); location.hash = '#/'; location.reload(); });
await p.waitForFunction(() => window.fwDebug); await p.click('.cta'); await p.waitForSelector('.grid');
await p.evaluate(() => { const G = fwDebug.game(); let n = 0; G.st.puzzle.cells.forEach((c, k) => { if (c.t === 'l' && !G.st.board[k].ch && n < 8) { G.st.board[k].ch = c.ch; G.st.board[k].by = n % 2 ? 'opp' : 'you'; n++; } }); });
// 1) a LOST level: only Try again + Home
await p.evaluate(() => { window.__lvl = fwDebug.store.d.mainNext; });
await p.click('[aria-label=Menu]'); await p.click('.btn.danger'); await p.waitForSelector('.result .btn-row');
const lbl = await p.$$eval('.result .btn-row .btn', (b) => b.map((x) => x.textContent.trim()));
console.log('lost buttons:', lbl.join(' | '));
(lbl.join('|') === 'Try again|Home') ? ok('loss: Try again, no Next / Selah') : fail('loss buttons ' + lbl);
(await p.evaluate(() => fwDebug.store.d.mainNext === window.__lvl)) ? ok('loss does not unlock the next level') : fail('level advanced on loss');
await p.click('.result .btn-row .btn'); await p.waitForSelector('.grid'); await p.waitForTimeout(300);
(await p.evaluate(() => fwDebug.game().spec.n === window.__lvl)) ? ok('Try again restarts the same level') : fail('wrong level after retry');
// 2) a WON level: Next + Selah
await p.evaluate(() => document.querySelectorAll('.modal-back').forEach((e) => e.remove()));
await p.evaluate(() => { const s = fwDebug.store, o = s.recordResult.bind(s); s.recordResult = (a) => ({ ...o(a), won: true }); });
await p.evaluate(() => { const G = fwDebug.game(); let n = 0; G.st.puzzle.cells.forEach((c, k) => { if (c.t === 'l' && !G.st.board[k].ch && n < 8) { G.st.board[k].ch = c.ch; G.st.board[k].by = n % 2 ? 'opp' : 'you'; n++; } }); });
await p.click('[aria-label=Menu]'); await p.click('.btn.danger'); await p.waitForSelector('#selah-btn');
ok('Selah button on a won result screen');
await p.click('#selah-btn'); await p.waitForSelector('#selah-bar');
(await p.$eval('.modal-back', (e) => getComputedStyle(e).display)) === 'none' ? ok('results hidden') : fail('modal visible');
(await p.$$('.cell.f-you')).length && (await p.$$('.cell.f-opp')).length ? ok('board shows who placed what') : fail('colors');
(await p.$$('.rack-wrap:visible')).length === 0 ? ok('rack hidden') : fail('rack');
await p.screenshot({ path: out + 'selah.png' });
await p.click('#selah-back'); await p.waitForTimeout(100);
(await p.$eval('.modal-back', (e) => getComputedStyle(e).display)) !== 'none' && !(await p.$('#selah-bar')) ? ok('back to results') : fail('back');
await b.close(); console.log(errs.length ? 'FAILED' : 'ALL OK'); process.exit(errs.length ? 1 : 0);
