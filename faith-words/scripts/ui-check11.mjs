// Easier sign-in: card at the top of Home + Me, tabs, show/hide, forgot password, reset link, remembered email.
import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const errs = []; const fail = (m) => { errs.push(m); console.log('FAIL', m); }; const ok = (m) => console.log('ok  ', m);
const b = await chromium.launch();
async function page(recovery) {
  const p = await (await b.newContext({ viewport: { width: 390, height: 800 }, hasTouch: true })).newPage(); p.setDefaultTimeout(8000);
  p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  await p.addInitScript((rec) => { window.__resets = []; window.__newpw = []; window.__fwMock = { user: null, recovery: rec, async op() { return { game: {} }; }, async leaderboard() { return []; }, async loadContent() { return null; }, async isAdmin() { return false; },
    async requestReset(e) { window.__resets.push(e); }, async setNewPassword(pw) { window.__newpw.push(pw); window.__fwMock.user = { id: 'u1' }; } }; }, !!recovery);
  await p.goto('http://localhost:8766/?debug', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.fwDebug);
  await p.evaluate(() => { fwDebug.store.d.onboarded = true; fwDebug.store.save(); }); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(2400);
  return p;
}
let p = await page();
// 1. card is among the first things on Home, above the profile card and above the fold
let top = await p.evaluate(() => { const c = document.querySelector('[data-card=signin]'); const hello = document.querySelector('.hello'); return c && hello ? { y: c.getBoundingClientRect().top, bottom: c.getBoundingClientRect().bottom, before: !!(c.compareDocumentPosition(hello) & Node.DOCUMENT_POSITION_FOLLOWING) } : null; });
top && top.before && top.bottom < 400 ? ok(`Home: sign-in card at the top (y=${Math.round(top.y)})`) : fail('home card position ' + JSON.stringify(top));
await p.evaluate(() => { location.hash = '#/me'; }); await p.waitForTimeout(600);
top = await p.evaluate(() => { const c = document.querySelector('[data-card=signin]'); const g = document.querySelector('.hub-grid'); return c && g ? { bottom: c.getBoundingClientRect().bottom, before: !!(c.compareDocumentPosition(g) & Node.DOCUMENT_POSITION_FOLLOWING), first: document.querySelector('.hub-tile')?.dataset.sec } : null; });
top && top.before && top.bottom < 400 ? ok('Me: sign-in card at the top') : fail('me card ' + JSON.stringify(top));
top?.first === 'account' ? ok('Account is the first tile in the Me hub') : fail('first tile ' + top?.first);
// 2. open modal from the card
await p.click('[data-act=si-in]'); await p.waitForSelector('#auth-email');
(await p.$('[data-act=forgot]')) ? ok('"Forgot password?" is on the sign-in sheet') : fail('no forgot link');
const t0 = await p.$eval('#auth-pass', (e) => e.type); await p.click('[data-act=toggle-pass]'); const t1 = await p.$eval('#auth-pass', (e) => e.type);
t0 === 'password' && t1 === 'text' ? ok('Show/Hide password works') : fail('toggle ' + t0 + t1);
await p.fill('#auth-email', 'nope'); await p.click('[data-act=auth-go]');
/valid email/i.test(await p.textContent('.auth .err')) ? ok('bad email gets a friendly message') : fail('no email message');
await p.fill('#auth-email', 'a@b.co'); await p.fill('#auth-pass', '123'); await p.click('[data-act=auth-go]');
/6 characters/.test(await p.textContent('.auth .err')) ? ok('short password gets a friendly message') : fail('no pw message');
// 3. create-account tab shows name field
await p.click('[data-tab=up]'); (await p.$('#auth-name')) ? ok('Create account tab has a name field') : fail('no name field');
await p.click('[data-tab=in]');
// 4. forgot password flow
await p.click('[data-act=forgot]'); await p.fill('#auth-email', 'pilgrim@example.com'); await p.click('[data-act=send-reset]'); await p.waitForTimeout(500);
(await p.evaluate(() => window.__resets)).join() === 'pilgrim@example.com' ? ok('reset email requested for the typed address') : fail('reset not requested');
/reset link is on its way/i.test(await p.textContent('.auth .ok')) ? ok('confirmation shown (without revealing whether the email exists)') : fail('no confirmation');
await p.screenshot({ path: '/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/auth-reset.png' });
await p.context().close();
// 5. opened from the reset link
p = await page(true); await p.waitForSelector('#new-pass');
await p.fill('#new-pass', 'abc'); await p.click('[data-act=save-pass]'); /6 characters/.test(await p.textContent('.auth .err')) ? ok('new password must be 6+') : fail('no check');
await p.fill('#new-pass', 'a-good-password'); await p.click('[data-act=save-pass]'); await p.waitForTimeout(600);
(await p.evaluate(() => window.__newpw)).join() === 'a-good-password' && !(await p.$('#new-pass')) ? ok('reset link: new password saved, sheet closed') : fail('new password flow');
await p.context().close();
// 6. names
const names = await (await b.newPage()).evaluate(async () => (await import('http://localhost:8766/js/config.js')).BOT_NAMES).catch(() => null);
await b.close(); console.log(errs.length ? 'FAILED' : 'ALL OK'); process.exit(errs.length ? 1 : 0);
