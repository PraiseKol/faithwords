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
await p.click('[data-react="amen"]'); await p.waitForTimeout(200); console.log('reaction bubble shown:', !!(await p.$('.react-bubble.you')), '| buttons:', (await p.$$('.react-btn')).length);
const clock = await p.$eval('#turn-clock', (e) => e.textContent); console.log('clock shows', clock);
await p.waitForFunction(() => { const G = fwDebug.game(); return G.st.turn === 'you' && !G.busy; }, null, { timeout: 15000 });
const before = await p.evaluate(() => fwDebug.game().st.log.length);
// put one tile on the board, then let the 30 s run out without pressing Submit
const kk = await p.evaluate(() => { const G = fwDebug.game(); const l = G.st.racks.you[0]; return G.st.puzzle.cells.findIndex((c, i) => c.t === 'l' && c.ch === l && !G.st.board[i].ch); });
await p.locator('.rack .tile').first().click(); await p.click(`[data-k="${kk}"]`);
await p.evaluate(() => { fwDebug.game().online.lastActive = Date.now() - 31000; });
await p.waitForFunction((n) => fwDebug.game().st.log.length > n, before, { timeout: 8000 }); console.log('auto-submitted: log', before, '→', await p.evaluate(() => fwDebug.game().st.log.length));
await p.waitForFunction(() => fwDebug.game().st.turn === 'opp' || fwDebug.game().busy, null, { timeout: 5000 }); console.log('turn moved on');
// and a pass when nothing is placed
await p.waitForFunction(() => { const G = fwDebug.game(); return G.st.turn === 'you' && !G.busy && !G.st.over; }, null, { timeout: 20000 });
const b2 = await p.evaluate(() => fwDebug.game().st.log.length);
await p.evaluate(() => { fwDebug.game().online.lastActive = Date.now() - 31000; });
await p.waitForFunction((n) => fwDebug.game().st.log.length > n, b2, { timeout: 8000 }); console.log('auto-pass logged');
console.log(errs.length ? 'ERRORS ' + errs : 'no errors'); await b.close();
