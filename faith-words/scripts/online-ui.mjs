import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/.npm-global/lib/node_modules/')('playwright');
const out='/tmp/claude-0/-home-claude/01cbf9f8-bae8-50ab-a89a-5a15e69bedf1/scratchpad/';
import { handleOp } from '../js/serverlogic.js';
let game = null; const opLog = [];
const b = await chromium.launch(); const p = await (await b.newContext({viewport:{width:390,height:800}})).newPage();
const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|Failed to load resource/.test(m.text()))errs.push('CONSOLE '+m.text())});
await p.exposeFunction('__nodeOp', async (json) => {
  const { body, row } = JSON.parse(json);
  try {
    const r = await handleOp(game, body, { uid: 'u1', now: Date.now(), loadMatch: async () => row, loadCustom: async () => [] });
    game = r.game; opLog.push(body.op); return JSON.stringify({ game: r.game, summary: r.summary });
  } catch (e) { return JSON.stringify({ error: e.message, status: e.status || 500 }); }
});
await p.addInitScript(() => {
  let row = null, polls = 0;
  window.__fwMock = {
    user: { id: 'u1', email: 'tester@example.com' },
    async op(body) {
      const r = JSON.parse(await window.__nodeOp(JSON.stringify({ body, row })));
      if (r.error) { const e = new Error(r.error); e.status = r.status; throw e; }
      return r;
    },
    async leaderboard() { return [{ name: 'Mock Opp', xp: 900, level: 4, wins: 7 }]; },
    async loadContent() { return null; }, async isAdmin() { return false; }, async cancelMatch() {},
    async matchmake(spec, state, name) { row = { id: 'm1', spec, state, p1: 'u1', p2: null, p1_name: name, p2_name: null, turn: 1, status: 'waiting', winner: null, created_at: new Date(Date.now() - 600000).toISOString(), updated_at: new Date().toISOString() }; return JSON.parse(JSON.stringify(row)); },
    async fetchMatch() {
      polls++;
      if (row.status === 'waiting' && polls >= 2) { row.status = 'playing'; row.p2 = 'u2'; row.p2_name = 'Mock Opp'; row.updated_at = new Date().toISOString(); }
      if (row.status === 'playing' && row.state.turn === 'p2') { // the simulated opponent takes its turn
        const E = await import('/js/engine.js'), O = await import('/js/online.js'), P = await import('/js/puzzles.js');
        const st = E.newGame(P.getPuzzle(row.spec)); O.applyRemoteState(st, row.state, 'p2');
        const n = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < n && !st.over; i++) { const l = st.racks.you[0]; if (!l) break; const t = E.targets(st, l); if (!t.length) break; E.place(st, 'you', l, t[0]); }
        if (!st.over) E.endTurn(st);
        row.state = O.toRemote(st, 'p2'); row.turn = st.turn === 'you' ? 2 : 1; row.status = st.over ? 'done' : 'playing'; row.updated_at = new Date().toISOString();
      }
      return JSON.parse(JSON.stringify(row));
    },
    async pushMatch(id, patch) { Object.assign(row, patch); },
  };
});
await p.goto('http://localhost:8766/?debug'); await p.evaluate(()=>{fwDebug.store.d.onboarded=true;fwDebug.store.save()}); await p.reload(); await p.waitForTimeout(500);
await p.click('text=Play online'); await p.waitForTimeout(600);
await p.screenshot({path:out+'finding.png'});
await p.waitForSelector('.g-title .live',{timeout:15000});
console.log('in live match vs', await p.$eval('.side.opp .nm',e=>e.textContent));
let turns=0;
while(!(await p.$('.result')) && turns++<80){
  const mine = await p.evaluate(()=>{const G=fwDebug.game();return G.st.turn==='you'&&!G.busy&&!G.st.over});
  if(!mine){await p.waitForTimeout(500);continue;}
  const k = 1+Math.floor(Math.random()*5);
  for(let i=0;i<k;i++){
    const kk = await p.evaluate(()=>{const G=fwDebug.game();const l=G.st.racks.you[0];if(!l||G.st.over)return null;return G.st.puzzle.cells.findIndex((c,i)=>c.t==='l'&&c.ch===l&&!G.st.board[i].ch)});
    if(kk==null||kk<0)break;
    await (await p.$('.tile')).click(); await p.click(`[data-k="${kk}"]`); await p.waitForTimeout(60);
    if(await p.$('.result'))break;
  }
  if(await p.$('.result'))break;
  await p.waitForTimeout(800);
  if(await p.evaluate(()=>{const G=fwDebug.game();return G.st.turn==='you'&&!G.busy&&!G.st.over})) await p.click('.main-act');
  if(turns===3) await p.screenshot({path:out+'live.png'});
  await p.waitForTimeout(500);
}
await p.waitForSelector('.result',{timeout:15000});
console.log('result:', await p.$eval('.result',e=>e.innerText.replace(/\n+/g,' | ')));
console.log('activeOnline cleared:', await p.evaluate(()=>fwDebug.store.d.activeOnline===null), 'turns', turns);
await p.waitForTimeout(1500);
console.log('server ops:', opLog.join(','), '| server xp', game?.xp, 'coins', game?.coins, 'games', game?.stats.games);
console.log(errs.join('\n')||'no errors');
await b.close();
