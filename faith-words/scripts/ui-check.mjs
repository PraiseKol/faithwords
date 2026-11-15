import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const out='/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/';
const b = await chromium.launch(); const errs=[];
async function run(theme, n){
  const ctx = await b.newContext({ viewport:{width:390,height:800}, deviceScaleFactor:1.5, colorScheme: theme });
  const p = await ctx.newPage();
  p.on('pageerror',e=>errs.push(theme+' PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|Failed to load resource/.test(m.text()))errs.push(theme+' CONSOLE '+m.text())});
  await p.goto('http://localhost:8766/?debug'); await p.waitForTimeout(700);
  await p.fill('#welcome-name','Praise'); await p.click('text=Show me how to play');
  for(let i=0;i<4;i++){ await p.click('.howto .btn:not(.ghost)'); await p.waitForTimeout(150);} 
  await p.waitForTimeout(300);
  await p.click('.banner.gold'); await p.waitForTimeout(500);
  await p.click('.banner.today'); await p.waitForTimeout(800);
  const size = await p.evaluate(()=>{const G=fwDebug.game();return [G.st.puzzle.W,G.st.puzzle.H]}); console.log(theme,'grid',size);
  await p.screenshot({path:out+'g1-'+theme+'.png'});
  // 1. clue click is view only
  const before = await p.evaluate(()=>fwDebug.game().st.board.filter(b=>b.ch).length);
  await p.click('.cl'); await p.waitForTimeout(300);
  await p.screenshot({path:out+'clue-'+theme+'.png'});
  console.log('highlighted cells after clue:', await p.$$eval('.cell.wsel,.cell.csel,.cell.fits',e=>e.length));
  await p.mouse.click(10,10); await p.waitForTimeout(300);
  // 2. tap tile then a RIGHT cell and a WRONG cell: nothing scores before submit
  const info = await p.evaluate(()=>{const G=fwDebug.game();const r=G.st.racks.you;const cells=G.st.puzzle.cells;
    const good=cells.findIndex((c,i)=>c.t==='l'&&c.ch===r[0]&&!G.st.board[i].ch);
    const bad=cells.findIndex((c,i)=>c.t==='l'&&c.ch!==r[1]&&!G.st.board[i].ch&&i!==good);return {good,bad}});
    await p.locator('.rack .tile').nth(0).click(); await p.click('[data-k="'+info.good+'"]');
  await p.locator('.rack .tile').nth(1).click(); await p.click('[data-k="'+info.bad+'"]');
  console.log('score before submit', await p.$$eval('.sc',e=>e.map(x=>x.textContent)), 'pending', await p.$$eval('.cell.pend',e=>e.length));
  await p.screenshot({path:out+'pend-'+theme+'.png'});
  await p.click('.main-act'); await p.waitForTimeout(250);
  await p.screenshot({path:out+'sub-'+theme+'.png'});
  console.log('score after submit', await p.$$eval('.sc',e=>e.map(x=>x.textContent)), 'rack', await p.$$eval('.rack .tile',e=>e.length));
  await p.waitForTimeout(3500);
  await p.screenshot({path:out+'after-'+theme+'.png'});
  await ctx.close();
}
await run('light'); await run('dark');
console.log(errs.join('\n')||'no errors');
await b.close();
