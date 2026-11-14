// Live matches. The player whose turn it is runs the game rules locally and saves the board to the
// `matches` row; the other player's app polls the row and shows the moves as they arrive.
import { A, currentUser } from './cloud.js';
import { newGame } from './engine.js';
import { getPuzzle } from './puzzles.js';

const other = (r) => (r === 'p1' ? 'p2' : 'p1');
const side = (who, role) => (who === 'you' ? role : who === 'opp' ? other(role) : who); // given/rev stay as is
const back = (by, role) => (by === role ? 'you' : by === other(role) ? 'opp' : by);

/** Local (you/opp) state -> shared (p1/p2) state saved in the database. */
export function toRemote(st, role) {
  return {
    board: st.board.map((b) => ({ ch: b.ch, by: b.by ? side(b.by, role) : null })),
    scores: { [role]: st.scores.you, [other(role)]: st.scores.opp },
    racks: { [role]: st.racks.you, [other(role)]: st.racks.opp },
    turn: st.turn === 'you' ? role : other(role),
    placed: st.placed, rackAtStart: st.rackAtStart, passes: st.passes, over: st.over,
  };
}
/** Shared state -> local state for the given player. */
export function applyRemoteState(st, remote, role) {
  st.board = remote.board.map((b) => ({ ch: b.ch, by: b.by ? back(b.by, role) : null }));
  st.scores = { you: remote.scores[role], opp: remote.scores[other(role)] };
  st.racks = { you: remote.racks[role], opp: remote.racks[other(role)] };
  st.turn = remote.turn === role ? 'you' : 'opp';
  st.placed = remote.placed; st.rackAtStart = remote.rackAtStart; st.passes = remote.passes; st.over = !!remote.over;
  return st;
}

export function onlineSpec() {
  return { kind: 'online', seed: 'online-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), label: 'Online match' };
}

/** Enter the queue. Returns {row, role, st, spec} (row.status may be 'waiting' when you are first in). */
export async function findMatch(name, botLevel) {
  const spec = onlineSpec();
  const st = newGame(getPuzzle(spec), { botLevel });
  const row = await A.matchmake(spec, toRemote(st, 'p1'), name);
  const me = currentUser()?.id;
  if (row.p1 === me) return { row, role: 'p1', st, spec };
  // joined someone else's match: use their puzzle and board
  const theirSpec = row.spec;
  const st2 = newGame(getPuzzle(theirSpec), { botLevel });
  applyRemoteState(st2, row.state, 'p2');
  return { row, role: 'p2', st: st2, spec: theirSpec };
}

export async function waitForOpponent(id, { timeoutMs = 14000, every = 1500, cancelled = () => false } = {}) {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs && !cancelled()) {
    await new Promise((r) => setTimeout(r, every));
    const row = await A.fetchMatch(id);
    if (row?.status === 'playing') return row;
  }
  return null;
}

/** Serialised writes so moves never arrive out of order. */
export function makeWriter(id, role) {
  let chain = Promise.resolve();
  return (st, extra = {}) => {
    const patch = {
      state: toRemote(st, role), turn: st.turn === 'you' ? (role === 'p1' ? 1 : 2) : (role === 'p1' ? 2 : 1),
      status: st.over ? 'done' : 'playing', ...extra,
    };
    chain = chain.then(() => A.pushMatch(id, patch)).catch((e) => console.warn('match sync failed', e));
    return chain;
  };
}
