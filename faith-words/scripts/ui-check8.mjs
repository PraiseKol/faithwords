// Fixed bottom bar + the Me hub.
import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const errs = []; const fail = (m) => { errs.push(m); console.log('FAIL', m); }; const ok = (m) => console.log('ok  ', m);
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 600 }, hasTouch: true })).newPage(); p.setDefaultTimeout(8000);
p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
await p.goto('http://localhost:8766/?debug', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.fwDebug);
await p.evaluate(() => { fwDebug.store.d.onboarded = true; fwDebug.store.save(); }); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(2300);
for (const h of ['#/', '#/daily', '#/together', '#/me', '#/me/settings', '#/album']) {
  await p.evaluate((x) => { document.querySelectorAll('.modal-back').forEach((e) => e.remove()); location.hash = x; }, h); await p.waitForTimeout(700);
  await p.evaluate(() => scrollTo(0, 99999)); await p.waitForTimeout(150);
  const r = await p.evaluate(() => { const n = document.querySelector('body > .nav'); const b = n?.getBoundingClientRect(); return { has: !!n, bottom: b && Math.round(b.bottom), inApp: !!document.querySelector('#app .nav'), scrolled: scrollY }; });
  r.has && !r.inApp && r.bottom === 600 ? ok(`${h}: bar pinned at the bottom after scrolling ${r.scrolled}px`) : fail(h + ' ' + JSON.stringify(r));
}
await p.evaluate(() => { location.hash = '#/me'; }); await p.waitForTimeout(500);
(await p.$$('.hub-tile')).length === 8 ? ok('Me shows 8 tiles') : fail('tiles');
(await p.$$('.hub-tile >> nth=0')).length && (await p.$('.screen.me .card.shop-card, .screen.me .shop-row')) === null ? ok('details are hidden until a tile is opened') : fail('shop visible on hub');
await p.click('[data-sec=shop]'); await p.waitForTimeout(400);
(await p.$('.shop-row')) && (await p.evaluate(() => location.hash)) === '#/me/shop' ? ok('Shop tile opens its own page') : fail('shop page');
await p.click('.back-btn'); await p.waitForTimeout(400); (await p.evaluate(() => location.hash)) === '#/me' ? ok('back returns to the hub') : fail('back');
await p.click('.nav-i >> nth=0'); await p.waitForTimeout(400); (await p.evaluate(() => location.hash)).length <= 2 ? ok('Play tab goes home') : fail('home tab');
const arrow = await p.evaluate(() => { document.querySelector('.cta').click(); return null; }); await p.waitForSelector('.arr'); const col = await p.$eval('.arr', (e) => getComputedStyle(e).color + ' | ' + getComputedStyle(e).textShadow.slice(0, 40)); console.log('arrow style', col);
await b.close(); console.log(errs.length ? 'FAILED' : 'ALL OK'); process.exit(errs.length ? 1 : 0);
