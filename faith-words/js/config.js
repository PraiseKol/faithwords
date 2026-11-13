// Tunable game economy & rules — edit freely.
export const CONFIG = {
  tilesPerRack: 5,
  strikesPerTurn: 3,             // wrong placements allowed per turn; the last one ends the turn
  allTilesBonus: 5,              // +5 when all 5 tiles are used in one round
  givenLetters: 4,
  startCoins: 50, startHints: 3, startWords: 1,
  price: { hint: 20, word: 40, swap: 15 },
  // Daily check-in: coins = base * (1 + step*(day-1)), day capped at maxDay
  checkin: { base: 10, step: 0.5, maxDay: 7 },
  // Win streak coins: coins = base * (1 + step*(streak-1)), multiplier capped
  win: { base: 20, step: 0.5, maxMult: 5 },
  winXpBonus: 25,
  dailyXpBonus: 15,
  eventCoinReward: 30,
  // XP needed to go from level L to L+1
  xpForLevel: (L) => 100 + 50 * (L - 1),
  adminPin: 'faith',
};
export const BOT_NAMES = ['Grace_K', 'Pastor Dami', 'Sister Joy', 'Tunde B.', 'David_M', 'Hannah O.', 'Elder Samuel', 'Faith_O', 'Esther J.', 'Bro. Caleb', 'Mercy A.', 'Joshua_21', 'Ruth N.', 'Daniel K.', 'Lydia P.', 'Emmanuel_T'];
export const EVENTS = [
  { id: 'hero',  tag: 'hero',  name: 'Heroes of Faith',  emoji: '🛡️', colors: ['#1fa35a', '#0b7a3b'], window: null },
  { id: 'psalm', tag: 'psalm', name: 'Psalms & Praise',  emoji: '🎶', colors: ['#7b5bd6', '#4a2fa0'], window: null },
  { id: 'xmas',  tag: 'xmas',  name: 'Christmas Star',   emoji: '⭐', colors: ['#d63b4a', '#8e1626'], window: ['12-01', '01-06'] },
  { id: 'east',  tag: 'east',  name: 'Easter Dawn',      emoji: '🌅', colors: ['#f2a93b', '#c9741a'], window: ['03-15', '04-30'] },
  { id: 'pent',  tag: 'pent',  name: 'Pentecost Fire',   emoji: '🔥', colors: ['#ef6a3a', '#b5301a'], window: ['05-10', '06-15'] },
];
export const EVENT_PUZZLES = 6;
