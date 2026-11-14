import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:390,height:800}})).newPage();
await p.goto('http://localhost:8766/?debug'); await p.evaluate(()=>{fwDebug.store.d.onboarded=true;fwDebug.store.save()}); await p.reload(); await p.waitForTimeout(500);
console.log(await p.$$eval('.home > *',els=>els.map(e=>e.className.split(' ')[0]+':'+Math.round(e.getBoundingClientRect().height))));
await b.close();
