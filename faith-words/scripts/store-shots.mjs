// Generates store screenshots (Play 1080x1920, App Store 1290x2796) from the local build.
import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
import fs from 'fs';
const OUT = process.argv[2] || 'store/shots'; fs.mkdirSync(OUT, { recursive: true });
const SETS = { play: { w: 360, h: 640, dsf: 3 }, ios: { w: 430, h: 932, dsf: 3 } };
const b = await chromium.launch();
for (const [name, v] of Object.entries(SETS)) {
  const ctx = await b.newContext({ viewport: { width: v.w, height: v.h }, deviceScaleFactor: v.dsf, hasTouch: true, isMobile: true });
  const p = await ctx.newPage(); p.setDefaultTimeout(8000);
  const snap = async (n, label) => { await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/${name}-${n}-${label}.png` }); console.log('shot', name, n, label); };
  await p.goto('http://localhost:8766/?debug', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.fwDebug);
  await p.evaluate(async () => {
    const { VERSES } = await import('/js/verses.js');
    const d = fwDebug.store.d; d.onboarded = true; d.name = 'Grace'; d.coins = 640; d.xp = 1850; d.level = 7; d.mainNext = 12;
    d.inv = { ...(d.inv || {}), hint: 5, word: 3, swap: 3, freeze: 2 };
    const refs = VERSES.slice(0, 40).map((v) => v.ref).filter((_, i) => i % 3 !== 2).slice(0, 18);
    d.album = {}; refs.forEach((r, i) => { d.album[r] = { n: 1 + (i % 3), t: Date.now() - i * 86400000 }; });
    d.streak = 9; d.bestWinStreak = 6; d.stats = { ...(d.stats || {}), wins: 41, games: 52 };
    fwDebug.store.save();
  });
  await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForTimeout(2600);
  await snap(1, 'home');
  // play a level and reveal a good part of the board
  await p.evaluate(() => document.querySelector('.cta')?.click()); await p.waitForSelector('.arr, .cell');
  await p.waitForTimeout(900);
  for (let i = 0; i < 4; i++) { await p.evaluate(() => document.querySelector('.act.hint')?.click()); await p.waitForTimeout(350); }
  await p.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove())); await p.waitForTimeout(3600); await p.evaluate(() => document.querySelectorAll('.toast').forEach((t) => t.remove())); await snap(2, 'game');
  await p.evaluate(() => { document.querySelectorAll('.toast').forEach((t) => t.remove()); location.hash = '#/album'; }); await snap(3, 'album');
  await p.evaluate(() => { location.hash = '#/me'; }); await snap(4, 'me');
  await p.evaluate(() => { location.hash = '#/me/badges'; }); await snap(5, 'badges');
  await p.evaluate(() => { location.hash = '#/me/themes'; }); await snap(6, 'themes');
  await ctx.close();
}
await b.close();
