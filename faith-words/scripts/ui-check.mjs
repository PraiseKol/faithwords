import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const out='/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/';
const b = await chromium.launch();
const errs=[];
async function run(theme){
  const ctx = await b.newContext({ viewport:{width:390,height:800}, deviceScaleFactor:1.5, colorScheme: theme });
  const p = await ctx.newPage();
  p.on('pageerror',e=>errs.push(theme+' PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|Failed to load resource/.test(m.text()))errs.push(theme+' CONSOLE '+m.text())});
  await p.goto('http://localhost:8766/?debug'); await p.waitForTimeout(700);
  await p.screenshot({path:out+`ob-${theme}.png`});
  await p.fill('#welcome-name','Praise'); await p.click('text=Show me how to play');
  await p.screenshot({path:out+`ht-${theme}.png`});
  for(let i=0;i<4;i++){ await p.click('.howto .btn:not(.ghost)'); await p.waitForTimeout(150);} 
  await p.waitForTimeout(300);
  await p.screenshot({path:out+`home-${theme}.png`});
  await p.click('.banner.gold'); await p.waitForTimeout(500);
  await p.click('.banner.today'); await p.waitForTimeout(800);
  // drag a tile to a matching cell
  const info = await p.evaluate(()=>{const G=fwDebug.game();const l=G.st.racks.you[0];const k=G.st.puzzle.cells.findIndex((c,i)=>c.t==='l'&&c.ch===l&&!G.st.board[i].ch);return {l,k}});
  const tb = await (await p.$('.tile')).boundingBox(); const cb = await (await p.$(`[data-k="${info.k}"]`)).boundingBox();
  await p.mouse.move(tb.x+tb.width/2,tb.y+tb.height/2); await p.mouse.down(); await p.mouse.move(cb.x+cb.width/2,cb.y+cb.height/2+36,{steps:8});
  await p.screenshot({path:out+`drag-${theme}.png`});
  await p.mouse.up(); await p.waitForTimeout(300);
  console.log(theme,'after drag score', await p.$$eval('.sc',e=>e.map(x=>x.textContent)));
  await p.screenshot({path:out+`game-${theme}.png`});
  await p.goto('http://localhost:8766/#/me'); await p.waitForTimeout(400); await p.screenshot({path:out+`me-${theme}.png`,fullPage:true});
  await ctx.close();
}
await run('light'); await run('dark');
console.log(errs.join('\n')||'no errors');
await b.close();
