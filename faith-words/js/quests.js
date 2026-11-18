// Daily quests: three small goals a day, picked from the date (so every player and the server agree).
// Finishing all three opens the day's chest. Progress is counted from the verified match replay.
import { hashSeed } from './rng.js';
import { CONFIG } from './config.js';

// kind: what is counted. need: [easy, hard] targets. A pool entry never appears twice in one day.
export const QUEST_POOL = [
  { id: 'words',  icon: '🔤', text: (n) => `Finish ${n} words`,                 need: [8, 14] },
  { id: 'psalm',  icon: '🎶', text: (n) => `Finish ${n} Psalms words`,          need: [2, 4] },
  { id: 'hero',   icon: '🛡️', text: (n) => `Finish ${n} Heroes of Faith words`, need: [2, 4] },
  { id: 'ot',     icon: '📜', text: (n) => `Finish ${n} Old Testament words`,   need: [3, 6] },
  { id: 'nt',     icon: '✝️', text: (n) => `Finish ${n} New Testament words`,   need: [3, 6] },
  { id: 'win',    icon: '🏆', text: (n) => (n === 1 ? 'Win a match' : `Win ${n} matches`), need: [1, 2] },
  { id: 'play',   icon: '🎯', text: (n) => `Finish ${n} puzzles`,               need: [2, 3] },
  { id: 'bonus',  icon: '✋', text: (n) => `Use all 5 tiles in a round${n > 1 ? ` ${n} times` : ''}`, need: [1, 2] },
  { id: 'daily',  icon: '📅', text: () => 'Play the daily puzzle',              need: [1, 1] },
  { id: 'event',  icon: '⭐', text: () => 'Finish an event puzzle',             need: [1, 1] },
];

/** The three quests for a day: [{id, need}]. */
export function questsFor(date) {
  const pool = QUEST_POOL.slice(), out = [];
  let h = hashSeed('quests:' + date);
  for (let i = 0; i < 3; i++) {
    const k = h % pool.length; h = Math.imul(h ^ (h >>> 13), 0x5bd1e995) >>> 0;
    const q = pool.splice(k, 1)[0];
    out.push({ id: q.id, need: q.need[h % 7 < 3 ? 1 : 0] });
    h = Math.imul(h ^ (h >>> 15), 2246822519) >>> 0;
  }
  return out;
}
export const questText = (q) => { const p = QUEST_POOL.find((x) => x.id === q.id); return { icon: p.icon, text: p.text(q.need) }; };

/** How much one finished match adds to a quest. rep = replay output, idx = your seat. */
export function questGain(id, { spec, won, rep, idx }) {
  const tags = rep?.wordTags?.[idx] || {};
  switch (id) {
    case 'words': return rep?.words?.[idx] || 0;
    case 'psalm': case 'hero': case 'ot': case 'nt': return tags[id] || 0;
    case 'win': return won ? 1 : 0;
    case 'play': return 1;
    case 'bonus': return rep?.bonus?.[idx] || 0;
    case 'daily': return spec.kind === 'daily' ? 1 : 0;
    case 'event': return spec.kind === 'event' ? 1 : 0;
    default: return 0;
  }
}

/** Today's quest state for player data `d` (rolls over to a fresh day). */
export function questState(d, today) {
  if (!d.quests || d.quests.date !== today) d.quests = { date: today, prog: {}, done: [], opened: false };
  return d.quests;
}

/** What the chest holds: decided by the date, the same for everyone. */
export function chestReward(date) {
  const h = hashSeed('chest:' + date), [lo, hi] = CONFIG.chestCoins;
  const coins = lo + (h % (hi - lo + 1));
  const kind = ['freeze', 'hint', 'word', 'hint'][(h >>> 8) % 4];
  return { coins, kind, qty: kind === 'hint' ? 2 : 1 };
}
