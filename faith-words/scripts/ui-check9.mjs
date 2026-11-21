// Phase 4 in the browser: a published pack shows on Home and plays; verse of the day; reminders (web vs. mocked native app).
import { createRequire } from 'module'; import fs from 'node:fs'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const errs = []; const fail = (m) => { errs.push(m); console.log('FAIL', m); }; const ok = (m) => console.log('ok  ', m);
const drop = JSON.parse(fs.readFileSync(new URL('./fixtures/sample-drop.json', import.meta.url), 'utf8')); drop.from = ''; drop.to = '';
const b = await chromium.launch();
async function open(native) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 } }), p = await ctx.newPage(); p.setDefaultTimeout(8000); p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  if (native) await p.addInitScript(() => { window.__ln = []; window.Capacitor = { isNativePlatform: () => true, Plugins: { LocalNotifications: { getPending: async () => ({ notifications: [{ id: 100 }] }), cancel: async () => window.__ln.push('cancel'), checkPermissions: async () => ({ display: 'granted' }), requestPermissions: async () => ({ display: 'granted' }), schedule: async (x) => window.__ln.push('schedule:' + x.notifications.length) } } }; });
  await p.goto('http://localhost:8766/?debug', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.fwDebug);
  await p.evaluate(() => { fwDebug.store.d.onboarded = true; fwDebug.store.save(); }); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.fwDebug); await p.waitForTimeout(1800);
  return p;
}
let p = await open(false);
await p.evaluate(async (dr) => { const m = await import('./js/puzzles.js'); m.setRemoteContent({ drops: [dr] }); window.dispatchEvent(new Event('hashchange')); }, drop);
await p.waitForTimeout(600);
(await p.$('.ev-card.drop')) ? ok('published pack appears on Home as a card') : fail('no pack card');
(await p.$eval('.ev-card.drop .ev-name', (e) => e.textContent)) === 'Advent Specials' ? ok('card shows the pack title') : fail('title');
(await p.$('.card.vod .vod-r')) ? ok('verse of the day card on Home: ' + (await p.$eval('.vod-r', (e) => e.textContent))) : fail('no verse of the day');
await p.evaluate(() => document.querySelectorAll('.modal-back').forEach((e) => e.remove()));
await p.click('[data-drop="advent-2026"]'); await p.waitForSelector('.grid');
(await p.evaluate(() => fwDebug.game().spec.kind === 'drop' && fwDebug.game().st.puzzle.words.some((w) => w.ans === 'EMMANUEL' || w.ans.length > 1))) ? ok('pack puzzle opens and plays') : fail('drop game');
await p.evaluate(() => document.querySelectorAll('.modal-back').forEach((e) => e.remove()));
await p.click('[aria-label=Menu]'); await p.click('.btn.danger'); await p.waitForSelector('.result .btn-row');
const lbl = await p.$$eval('.result .btn-row .btn', (x) => x.map((y) => y.textContent.trim()).join('|')); lbl === 'Try again|Home' ? ok('lost pack puzzle: Try again | Home') : fail('buttons ' + lbl);
await p.evaluate(() => { document.querySelectorAll('.modal-back').forEach((e) => e.remove()); location.hash = '#/me/settings'; }); await p.waitForTimeout(500);
(await p.$eval('.seg-row:has-text("Daily verse reminder")', (e) => e.textContent)).includes('mobile app') ? ok('web: reminder row says it needs the app') : fail('web reminder row');
await p.context().close();

p = await open(true);
await p.evaluate(() => { location.hash = '#/me/settings'; }); await p.waitForTimeout(500);
(await p.$$('.seg-row.remind')).length ? ok('app: reminder switch is available') : fail('no reminder switch');
await p.evaluate(() => { window.__ln.length = 0; });
await p.locator('.seg-row.remind button:has-text("On")').click(); await p.waitForTimeout(500);
const calls = await p.evaluate(() => window.__ln); calls.includes('schedule:30') ? ok('turning it on schedules 30 daily verses') : fail('calls ' + calls);
await p.selectOption('.seg-row.remind select', '20'); await p.waitForTimeout(400);
(await p.evaluate(() => fwDebug.store.d.settings.remind.h)) === 20 ? ok('reminder time saved (8 pm)') : fail('time');
await p.evaluate(() => { window.__ln.length = 0; }); await p.locator('.seg-row.remind button:has-text("Off")').click(); await p.waitForTimeout(400);
(await p.evaluate(() => window.__ln)).includes('cancel') && !(await p.evaluate(() => window.__ln)).some((x) => x.startsWith('schedule')) ? ok('turning it off cancels them') : fail('off');
await b.close(); console.log(errs.length ? 'FAILED' : 'ALL OK'); process.exit(errs.length ? 1 : 0);
