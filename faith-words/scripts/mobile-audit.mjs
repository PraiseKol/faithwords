import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const out = '/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/m/'; import fs from 'fs'; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const issues = [];
for (const [w, h] of [[320, 568], [360, 740], [390, 844], [430, 932], [667, 375]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: w < 600 })).newPage(); p.setDefaultTimeout(6000);
  await p.goto('http://localhost:8766/?debug', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.fwDebug);
  await p.evaluate(() => { const s = fwDebug.store; s.d.onboarded = true; s.d.name = 'Praise'; s.d.coins = 500; s.save(); });
  const check = async (name) => {
    await p.waitForTimeout(350);
    const r = await p.evaluate(() => { const W = innerWidth, bad = []; document.querySelectorAll('body *').forEach((e) => { const b = e.getBoundingClientRect(); if (b.width && (b.right > W + 1 || b.left < -1) && getComputedStyle(e).position !== 'fixed' && !e.closest('.confetti,.grid-wrap,[class*=scroll]')) bad.push(e.className + '|' + (e.textContent || '').slice(0, 20)); });
      const small = [...document.querySelectorAll('button,a.nav-i,.nav a,.icon-btn')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && (b.height < 40 || b.width < 40) && getComputedStyle(e).visibility !== 'hidden'; }).map((e) => (e.getAttribute('aria-label') || e.textContent || e.className).slice(0, 20) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height));
      return { sw: document.documentElement.scrollWidth - W, bad: bad.slice(0, 4), small: small.slice(0, 6) }; });
    if (r.sw > 0 || r.bad.length || (r.small.length && w === 360)) issues.push(`${w}x${h} ${name}: ${JSON.stringify(r)}`);
    await p.screenshot({ path: `${out}${w}-${name}.png` });
  };
  for (const [n, hash] of [['home', '#/'], ['daily', '#/daily'], ['together', '#/together'], ['me', '#/me'], ['album', '#/album'], ['admin', '#/admin']]) { await p.evaluate((x) => { location.hash = x; }, hash); await check(n); }
  await p.evaluate(() => { location.hash = '#/'; }); await p.waitForTimeout(300); await p.evaluate(() => document.querySelectorAll('.modal-back').forEach((e) => e.remove())); await p.click('.cta'); await p.waitForSelector('.grid'); await check('welcome'); await p.evaluate(() => document.querySelectorAll('.modal-back').forEach((e) => e.remove())); await check('game');
  await p.click('[aria-label="How to play"]'); await check('howto'); await p.keyboard.press('Escape'); await p.evaluate(() => document.querySelectorAll('.modal-back').forEach((e) => e.remove()));
  await p.click('[aria-label=Menu]'); await check('menu'); await p.click('.btn.danger'); await p.waitForSelector('.result .btn-row'); await check('result');

  await p.close();
}
console.log(issues.join('\n') || 'no issues'); await b.close();
