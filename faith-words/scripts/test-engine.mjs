import { newGame, place, submit, endTurn, botStep, targets, emptyCount } from '../js/engine.js';
import { buildPuzzle, specMain } from '../js/spec.js';
import { CONFIG } from '../js/config.js';
const eq = (a, b, m) => { if (a !== b) { console.error('FAIL', m, a, b); process.exit(1); } };
// full games: a decent player submits what fits, bot plays
let bad = 0;
for (let i = 1; i <= 25; i++) {
  const st = newGame(buildPuzzle(specMain(i)), { botLevel: 3 });
  let guard = 0;
  while (!st.over && guard++ < 600) {
    if (st.turn === 'you') {
      const items = []; const used = new Set();
      for (const l of st.racks.you) { const t = targets(st, l).find((k) => !used.has(k)); if (t != null) { used.add(t); items.push({ letter: l, cell: t }); } }
      submit(st, 'you', items); endTurn(st);
    } else {
      let s; while ((s = botStep(st))) place(st, 'opp', s.letter, s.cell);
      endTurn(st);
    }
  }
  if (!st.over || emptyCount(st)) bad++;
}
eq(bad, 0, 'all games finish');
// submit rules: wrong tiles cost 1 each, floor 0, right ones score, nothing counted before submit
const st = newGame(buildPuzzle(specMain(3)), { botLevel: 1 });
const rack = [...st.racks.you];
const l0 = rack[0], good = targets(st, l0)[0];
const wrongCell = st.puzzle.cells.findIndex((c, k) => c.t === 'l' && !st.board[k].ch && c.ch !== rack[1] && k !== good);
eq(st.scores.you, 0, 'no score before submit');
let r = submit(st, 'you', [{ letter: rack[1], cell: wrongCell }]);
eq(r.wrong.length, 1, '1 wrong'); eq(st.scores.you, 0, 'floor at 0'); eq(st.racks.you.length, 5, 'wrong tile stays in rack');
r = submit(st, 'you', [{ letter: l0, cell: good }]);
eq(r.right.length, 1, 'right placed'); eq(st.scores.you >= 1, true, 'scored');
const before = st.scores.you;
r = submit(st, 'you', [{ letter: st.racks.you[0], cell: st.puzzle.cells.findIndex((c, k) => c.t === 'l' && !st.board[k].ch && c.ch !== st.racks.you[0]) }]);
eq(st.scores.you, before - 1, 'wrong costs 1');
console.log('engine ok');
