// Two simulated clients play a whole match through the shared-state format.
globalThis.window = { __fwMock: { user: { id: 'u1' } } };
const { buildPuzzle, specMain } = await import('../js/spec.js');
const E = await import('../js/engine.js');
const { toRemote, applyRemoteState } = await import('../js/online.js');
import { isDeepStrictEqual } from 'node:util';
let mismatches = 0, games = 0;
for (let g = 0; g < 15; g++) {
  const puzzle = buildPuzzle(specMain(g + 1));
  const A = E.newGame(puzzle, { botLevel: 2 });          // p1 creates
  let row = JSON.parse(JSON.stringify(toRemote(A, 'p1')));
  const B = E.newGame(puzzle, { botLevel: 2 });          // p2 joins
  applyRemoteState(B, row, 'p2');
  const clients = { p1: A, p2: B };
  let guard = 0;
  while (!row.over && guard++ < 300) {
    const role = row.turn;
    const me = clients[role];
    applyRemoteState(me, row, role);                      // receive
    if (me.turn !== 'you') throw new Error('not my turn');
    // play: place a random number of tiles, then end turn
    const k = 1 + Math.floor(Math.random() * 5), used = new Set(), items = [];
    for (const l of me.racks.you) { if (items.length >= k) break; const t = E.targets(me, l).find((c) => !used.has(c)); if (t != null) { used.add(t); items.push({ letter: l, cell: t }); } }
    if (items.length && Math.random() < 0.3) items.push({ letter: items[0].letter, cell: me.puzzle.cells.findIndex((c, x) => c.t === 'l' && !me.board[x].ch && !used.has(x) && c.ch !== items[0].letter) });
    if (items.length > 5) items.length = 5;
    E.submit(me, 'you', items);
    E.endTurn(me);
    row = JSON.parse(JSON.stringify(toRemote(me, role))); // send
    // the other client receives and must agree on everything
    const o = role === 'p1' ? 'p2' : 'p1';
    applyRemoteState(clients[o], row, o);
    if (!isDeepStrictEqual(JSON.parse(JSON.stringify(toRemote(clients[o], o))), row)) mismatches++;
    if (clients[o].scores.opp !== me.scores.you || clients[o].scores.you !== me.scores.opp) mismatches++;
  }
  games++;
  if (g < 3) console.log('match', g, 'p1', row.scores.p1, 'p2', row.scores.p2, 'turns', guard);
}
console.log({ games, mismatches });
process.exit(mismatches ? 1 : 0);
