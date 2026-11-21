// Account deletion flow + privacy page.
import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const errs = []; const fail = (m) => { errs.push(m); console.log('FAIL', m); }; const ok = (m) => console.log('ok  ', m);
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true })).newPage(); p.setDefaultTimeout(8000);
p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
await p.addInitScript(() => {
  window.__deleted = 0;
  window.__fwMock = { user: { id: 'u1', email: 't@example.com' }, async op() { return { game: {} }; }, async leaderboard() { return []; }, async loadContent() { return null; }, async isAdmin() { return false; }, async cancelMatch() {},
    async deleteAccount() { window.__deleted++; window.__fwMock.user = null; } };
});
await p.goto('http://localhost:8766/?debug', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.fwDebug);
await p.evaluate(() => { fwDebug.store.d.onboarded = true; fwDebug.store.save(); }); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(2300);
await p.evaluate(() => { location.hash = '#/me/account'; }); await p.waitForTimeout(600);
(await p.$('[data-act=delete-account]')) ? ok('Delete my account button is on Me → Account') : fail('no button');
(await p.$('.privacy-link')) ? ok('privacy link shown') : fail('no privacy link');
await p.click('[data-act=delete-account]'); await p.waitForSelector('#del-confirm');
(await p.$eval('[data-act=delete-confirm]', (e) => e.disabled)) ? ok('confirm disabled until DELETE is typed') : fail('enabled early');
await p.fill('#del-confirm', 'delete me'); (await p.$eval('[data-act=delete-confirm]', (e) => e.disabled)) ? ok('wrong text keeps it disabled') : fail('wrong text accepted');
await p.fill('#del-confirm', 'DELETE'); (await p.$eval('[data-act=delete-confirm]', (e) => e.disabled)) ? fail('still disabled') : ok('typing DELETE enables it');
await p.screenshot({ path: '/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/del-modal.png' });
await p.click('[data-act=delete-confirm]'); await p.waitForTimeout(900);
(await p.evaluate(() => window.__deleted)) === 1 ? ok('account deleted once') : fail('delete not called');
(await p.$('[data-act=delete-account]')) === null ? ok('signed-out view after deleting') : fail('still shows account');
const q = await p.context().newPage(); await q.goto('http://localhost:8766/privacy.html'); const t = await q.textContent('h1');
t === 'Privacy Policy' ? ok('privacy.html serves') : fail('privacy page'); 
const ov = await q.evaluate(() => document.documentElement.scrollWidth > innerWidth); ov ? fail('privacy overflows') : ok('privacy has no horizontal scroll');
await b.close(); console.log(errs.length ? 'FAILED' : 'ALL OK'); process.exit(errs.length ? 1 : 0);
