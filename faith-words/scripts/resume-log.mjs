import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:8766/?debug'); await p.evaluate(()=>{fwDebug.store.d.onboarded=true;fwDebug.store.save()}); await p.reload(); await p.waitForTimeout(500);
await p.click('.cta'); await p.waitForSelector('.tile');
for (let i=0;i<3;i++){
  const kk = await p.evaluate(()=>{const G=fwDebug.game();const l=G.st.racks.you[0];return G.st.puzzle.cells.findIndex((c,i)=>c.t==='l'&&c.ch===l&&!G.st.board[i].ch)});
  if(kk<0)break; await (await p.$('.tile')).click(); await p.click(`[data-k="${kk}"]`); await p.waitForTimeout(80);
}
const n1 = await p.evaluate(()=>fwDebug.game().st.log.length);
await p.reload(); await p.waitForTimeout(600);
const n2 = await p.evaluate(()=>fwDebug.store.d.active?.st.log?.length);
console.log('log entries before reload', n1, 'saved in active game', n2, errs.join('')||'no errors');
await b.close();
