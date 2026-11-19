// Browser checks for: Word power-up pick mode, moving placed tiles, the pause before the bot, Next level, sounds.
import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const out = '/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/';
const b = await chromium.launch(); const errs = []; const fail = (m) => { errs.push('FAIL ' + m); console.log('FAIL', m); }; const ok = (m) => console.log('ok  ', m);
const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 1.5 });
const p = await ctx.newPage();
p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/fonts|ERR_|Failed to load resource/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
await p.addInitScript(() => { // count audio nodes per sound so we know every sound actually makes noise
  window.__osc = 0; const O = window.AudioContext.prototype.createOscillator; window.AudioContext.prototype.createOscillator = function () { window.__osc++; return O.call(this); };
  const S = window.AudioContext.prototype.createBufferSource; window.AudioContext.prototype.createBufferSource = function () { window.__osc++; return S.call(this); };
});
await p.goto('http://localhost:8766/?debug'); await p.waitForTimeout(700);
await p.fill('#welcome-name', 'Praise'); await p.click('text=Show me how to play');
for (let i = 0; i < 4; i++) { await p.click('.howto .btn:not(.ghost)'); await p.waitForTimeout(150); }
await p.waitForTimeout(300);
await p.evaluate(() => { fwDebug.store && 0; });
await p.click('.banner.gold'); await p.waitForTimeout(500);   // check-in coins
await p.click('.banner.today'); await p.waitForTimeout(800);  // today's daily puzzle
const G = (f, a) => p.evaluate(f, a);

// ---- 1. Word power-up
const filled0 = await G(() => fwDebug.game().st.board.filter((x) => x.ch).length);
const coins0 = await G(() => JSON.stringify([fwDebug.store?.d?.coins, fwDebug.store?.d?.inv?.word]));
await p.click('.act.word'); await p.waitForTimeout(250);
const glow = await p.$$eval('.cl.pick', (e) => e.length), totalClues = await p.$$eval('.cl', (e) => e.length);
glow > 0 && glow === totalClues ? ok(`Word: ${glow}/${totalClues} clues glow`) : fail(`glow ${glow}/${totalClues}`);
await p.screenshot({ path: out + 'wordmode.png' });
const dimmed = await p.$$eval('.rack .tile', (e) => e.every((t) => t.classList.contains('dim')));
dimmed ? ok('rack tiles locked while picking') : fail('rack not locked');
await p.locator('.rack .tile').nth(0).click({ force: true }); await p.click('.cell.letter >> nth=0', { force: true });
const pendWhile = await G(() => fwDebug.game().pend.size + (fwDebug.game().sel.tile != null ? 1 : 0));
pendWhile === 0 ? ok('tapping tiles/squares does nothing in pick mode') : fail('tile action leaked into pick mode');
const disabled = await p.$$eval('.act.swap,.act.hint', (e) => e.every((x) => x.disabled)); disabled ? ok('Swap/Hint disabled while picking') : fail('swap/hint enabled');
const hints0 = await G(() => fwDebug.game().st.hints.length);
await p.locator('.cl.pick').nth(0).click(); await p.waitForTimeout(500);
const filled1 = await G(() => fwDebug.game().st.board.filter((x) => x.ch).length), mode = await G(() => fwDebug.game().wordMode);
const hints1 = await G(() => fwDebug.game().st.hints.length), ghosts = await p.$$eval('.cell.ghost-hint', (e) => e.map((x) => x.textContent));
filled1 === filled0 ? ok(`Word did NOT fill any square (${filled0} filled before and after)`) : fail(`Word filled squares ${filled0}→${filled1}`);
hints1 > hints0 && ghosts.length === hints1 && ghosts.every((t) => /^[A-Z]$/.test(t)) ? ok(`Word showed the whole word faintly: ${hints1 - hints0} new hint squares (${ghosts.join('')})`) : fail(`hints ${hints0}→${hints1}, ghosts ${ghosts}`);
mode === false ? ok('pick mode off after choosing') : fail('still in pick mode');
await p.screenshot({ path: out + 'wordhint.png' });
// the squares stay playable: a tile can still be placed on a hinted square
const hintedCell = await G(() => fwDebug.game().st.hints[0]);
await p.locator('.rack .tile').nth(0).click(); await p.click(`[data-k="${hintedCell}"]`);
(await G((k) => fwDebug.game().pend.has(k), hintedCell)) ? ok('a hinted square can still be played on') : fail('hinted square not playable');
await p.click('.recall');
console.log('   power-up stock before/after:', coins0, await G(() => JSON.stringify([fwDebug.store?.d?.coins, fwDebug.store?.d?.inv?.word])));
await p.click('.act.word'); await p.waitForTimeout(150); await p.click('.act.word'); await p.waitForTimeout(150);
(await G(() => fwDebug.game().wordMode)) === false ? ok('Word button toggles pick mode off (Cancel)') : fail('cancel failed');
// clue tap outside pick mode is still just a view
await p.locator('.cl').nth(0).click(); await p.waitForTimeout(250);
(await p.$('.clue-pop')) ? ok('normal clue tap still opens the zoom view') : fail('clue zoom missing'); await p.mouse.click(10, 10); await p.waitForTimeout(250);

// ---- 2. moving placed tiles
const spots = await G(() => { const g = fwDebug.game(); return g.st.puzzle.cells.map((c, i) => (c.t === 'l' && !g.st.board[i].ch ? i : -1)).filter((i) => i >= 0).slice(0, 4); });
const [A, B, C2] = spots;
await p.locator('.rack .tile').nth(0).click(); await p.click(`[data-k="${A}"]`);
const pend1 = await G(() => [...fwDebug.game().pend]); pend1.length === 1 && pend1[0][0] === A ? ok('tile placed on first square') : fail('placement ' + JSON.stringify(pend1));
// (a) tap the placed tile, tap another empty square
await p.click(`[data-k="${A}"]`); await p.waitForTimeout(100);
(await p.$$eval('.cell.sel-cell', (e) => e.length)) === 1 ? ok('tapping a placed tile selects it') : fail('no selection');
await p.click(`[data-k="${B}"]`); await p.waitForTimeout(100);
const pend2 = await G(() => [...fwDebug.game().pend]); pend2.length === 1 && pend2[0][0] === B ? ok('tap-to-move: tile jumped straight to another square') : fail('tap move ' + JSON.stringify(pend2));
// (b) drag from placed square to another empty square
const rA = await (await p.$(`[data-k="${B}"]`)).boundingBox(), rC = await (await p.$(`[data-k="${C2}"]`)).boundingBox();
await p.mouse.move(rA.x + rA.width / 2, rA.y + rA.height / 2); await p.mouse.down();
await p.mouse.move(rA.x + 30, rA.y + 20, { steps: 4 }); await p.mouse.move(rC.x + rC.width / 2, rC.y + rC.height / 2 + 36, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(150);
const pend3 = await G(() => [...fwDebug.game().pend]); pend3.length === 1 && pend3[0][0] === C2 ? ok('drag-to-move: tile dragged from one square to another') : fail('drag move ' + JSON.stringify(pend3));
// (c) swap two placed tiles by dropping one on the other
await p.locator('.rack .tile').nth(1).click(); await p.click(`[data-k="${A}"]`);
const before = await G(() => JSON.stringify([...fwDebug.game().pend].sort()));
const rP = await (await p.$(`[data-k="${A}"]`)).boundingBox(), rQ = await (await p.$(`[data-k="${C2}"]`)).boundingBox();
await p.mouse.move(rP.x + rP.width / 2, rP.y + rP.height / 2); await p.mouse.down(); await p.mouse.move(rP.x + 25, rP.y + 25, { steps: 3 });
await p.mouse.move(rQ.x + rQ.width / 2, rQ.y + rQ.height / 2 + 36, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(150);
const after = await G(() => JSON.stringify([...fwDebug.game().pend].sort()));
const bm = new Map(JSON.parse(before)), am = new Map(JSON.parse(after));
bm.get(A) === am.get(C2) && bm.get(C2) === am.get(A) ? ok('dropping on another placed tile swaps them') : fail(`swap ${before} → ${after}`);
// (d) drag a placed tile onto the rack returns it
const rr = await (await p.$('.rack')).boundingBox(), rS = await (await p.$(`[data-k="${A}"]`)).boundingBox();
await p.mouse.move(rS.x + rS.width / 2, rS.y + rS.height / 2); await p.mouse.down(); await p.mouse.move(rS.x + 20, rS.y + 40, { steps: 3 });
await p.mouse.move(rr.x + rr.width / 2, rr.y + rr.height / 2 + 36, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(150);
(await G(() => fwDebug.game().pend.size)) === 1 ? ok('dragging a placed tile onto the rack takes it back') : fail('return to rack failed');
// (e) tapping a dimmed rack tile also returns it
const outIdx = await G(() => [...fwDebug.game().pend.values()][0]); await p.locator('.rack .tile').nth(outIdx).click(); await p.waitForTimeout(120);
(await G(() => fwDebug.game().pend.size)) === 0 ? ok('tapping the dimmed rack tile returns it') : fail('rack-tap return failed');
await p.locator('.rack .tile').nth(0).click(); await p.click(`[data-k="${A}"]`);
await p.screenshot({ path: out + 'placed.png' });

// ---- 2b. score counts up one point at a time, for you and for the bot
const right = await G(() => { const g = fwDebug.game(), r = g.st.racks.you, used = new Set(), picks = [];
  g.st.puzzle.cells.forEach((c, k) => { if (picks.length >= 3 || c.t !== 'l' || g.st.board[k].ch) return; const i = r.findIndex((l, j) => l === c.ch && !used.has(j)); if (i >= 0) { used.add(i); picks.push([i, k]); } }); return picks; });
for (const [i, k] of right) { await p.locator('.rack .tile').nth(i).click(); await p.click(`[data-k="${k}"]`); }
await G(() => { window.__seq = { you: [], opp: [] }; window.__poll = setInterval(() => { for (const w of ['you', 'opp']) { const t = document.getElementById('sc-' + w)?.textContent; const a = window.__seq[w]; if (t != null && a[a.length - 1] !== t) a.push(t); } }, 15); });
const tSub = Date.now(); await p.click('.main-act');
// ---- 3. pause before the bot
const mark = await G(() => { const g = fwDebug.game(); window.__t0 = performance.now(); window.__botAt = null; const orig = g.st.log.push.bind(g.st.log); g.st.log.push = (...a) => { if (a[0]?.[0] === 'opp' && !window.__botAt) window.__botAt = performance.now(); return orig(...a); }; return true; });
await G(() => { window.__t0 = performance.now(); });
await p.waitForFunction(() => window.__botAt, null, { timeout: 15000 });
const gap = await G(() => window.__botAt - window.__t0);
// the count itself is a single tile here (~0.2 s) so the bot should start no earlier than the pause
gap >= 1800 ? ok(`bot waited ${Math.round(gap)} ms after Submit (count animation + pause)`) : fail(`bot moved after only ${Math.round(gap)} ms`);
await p.waitForFunction(() => fwDebug.game().st.turn === 'you', null, { timeout: 20000 }); await p.waitForTimeout(600);
const seq = await G(() => { clearInterval(window.__poll); return window.__seq; });
const stepped = (a) => a.every((v, i) => i === 0 || Math.abs(+v - +a[i - 1]) <= 1);
console.log('   your score display:', seq.you.join('→'), ' bot:', seq.opp.join('→'), ` (submit → bot done ${Date.now() - tSub} ms)`);
seq.you.length >= 3 && stepped(seq.you) ? ok('your score counted up one point at a time') : fail('your count not stepped: ' + seq.you);
stepped(seq.opp) && seq.opp.length >= 2 ? ok("the bot's score counted up one point at a time") : fail("bot count not stepped: " + seq.opp);

// a level has to be WON to unlock Next, so pretend this one was
await p.evaluate(() => { const s = fwDebug.store; if (!s.__won) { s.__won = 1; const o = s.recordResult.bind(s); s.recordResult = (a) => ({ ...o(a), won: true }); } });
// ---- 4. Next level button after a daily puzzle
await p.click('.g-tools .icon-btn >> nth=1'); await p.waitForTimeout(250);
await p.click('text=Give up this match'); await p.waitForTimeout(600);
const labels = await p.$$eval('.result .btn', (e) => e.map((x) => x.textContent.trim()));
console.log('   result buttons:', labels);
labels.includes('Next level') ? ok('result screen has "Next level"') : fail('no Next level button');
await p.screenshot({ path: out + 'result.png' });
const lbl0 = await G(() => fwDebug.game().spec.label);
await p.click('.result .btn >> text=Next level'); await p.waitForTimeout(800);
const lbl1 = await G(() => fwDebug.game().spec.label), hash = await G(() => location.hash);
hash === '#/game' && lbl1 !== lbl0 ? ok(`Next level started "${lbl1}" directly (was "${lbl0}")`) : fail(`next level ${hash} ${lbl0} → ${lbl1}`);

// ---- 5. sounds
const names = await p.evaluate(async () => { const m = await import('/js/audio.js'); window.__a = m; return m._sounds; });
let silent = [];
for (const n of names) { const before = await G(() => window.__osc); await G((n) => window.__a.sfx(n, 3), n); const d = (await G(() => window.__osc)) - before; if (d < 1) silent.push(n); await p.waitForTimeout(60); }
silent.length ? fail('sounds that made nothing: ' + silent) : ok(`${names.length} sounds all play: ${names.join(', ')}`);

console.log(errs.join('\n') || 'no errors'); await b.close(); process.exit(errs.length ? 1 : 0);
