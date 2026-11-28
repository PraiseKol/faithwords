// Tunable game economy & rules — edit freely.
export const CONFIG = {
  tilesPerRack: 5,
  allTilesBonus: 5,
  comboFrom: 3, comboMax: 2,     // combo: from the 3rd right tile in a row (no wrong tile between) +1, then +2 (capped)              // +5 when all 5 tiles are used in one round
  givenLetters: 4,
  startCoins: 50, startHints: 3, startWords: 1,
  price: { hint: 20, word: 40, swap: 15, freeze: 60 },
  maxFreezes: 2,                 // streak freezes you can hold at once
  questCoins: 10,                // paid for each finished daily quest
  chestCoins: [40, 80],          // chest coin range (the day picks the amount)
  // Daily check-in: coins = base * (1 + step*(day-1)), day capped at maxDay
  checkin: { base: 10, step: 0.5, maxDay: 7 },
  // Win streak coins: coins = base * (1 + step*(streak-1)), multiplier capped
  win: { base: 20, step: 0.5, maxMult: 5 },
  winXpBonus: 25,
  dailyXpBonus: 15,
  eventCoinReward: 30,
  // XP needed to go from level L to L+1
  xpForLevel: (L) => 100 + 50 * (L - 1),
  communityGoal: 5000, communityMinWords: 10, communityReward: { coins: 60, hint: 2 }, // together-goal: words solved by everyone in a week
  adminPin: 'faith',
};
export const BOT_NAMES = ['Grace K.', 'Michael_T', 'Sarah Mitchell', 'Chinedu O.', 'Hannah_R', 'Pastor John', 'Emily W.', 'Tunde B.', 'Jacob_L', 'Adaeze N.', 'Sister Ruth', 'Daniel K.', 'Olivia P.', 'Samuel_A', 'Naomi B.', 'Kwame A.', 'Rebecca J.', 'Lucas Silva', 'Abigail_H', 'Emeka U.', 'Joshua_21', 'Charlotte H.', 'Elder Matthew', 'Ama Boateng', 'Caleb R.', 'Esther J.', 'Thabo M.', 'Lydia P.', 'Ethan_G', 'Ngozi E.', 'Maria Santos', 'Benjamin_C', 'Faith_O', 'Jessica T.', 'Peter K.', 'Wanjiru M.', 'Joseph_D', 'Anna Becker', 'Mercy A.', 'Tyler J.', 'Priscilla N.', 'Andrew_F', 'Folake A.', 'Bro. Caleb', 'Isabella R.', 'Kofi M.', 'Ruth N.', 'Nathan_B', 'Sofia Herrera', 'Timothy O.', 'Chioma D.', 'Jonathan_W', 'Rachel S.', 'Pastor Dami', 'Liam O\'Connor', 'Deborah A.', 'Philip_V', 'Grace Kim', 'Obinna C.', 'Mary-Anne P.', 'Stephen_L', 'Lerato D.', 'Matthew J.', 'Priya Thomas', 'Tabitha_M', 'Daniel Park', 'Zoe Williams', 'Kelechi N.', 'Hope_B', 'Marcus H.', 'Eliana Costa', 'Elijah_S', 'Joy Nakato', 'Mark A.', 'Temitope S.', 'Gabriel_M', 'Amelia Clarke', 'Titus K.', 'Brittany L.', 'Moses O.', 'Rosa Mendoza', 'Isaac_N', 'Yetunde F.', 'Ryan D.', 'Beatriz L.', 'Josiah_P', 'Anita Joseph', 'Sister Joy', 'Paul E.', 'Camila R.', 'Kamau N.', 'Evelyn_G', 'Ifeanyi A.', 'Jordan B.', 'Miriam T.', 'Lukas Meyer', 'Phoebe_C', 'Chris A.', 'Njeri W.', 'Gideon_H', 'Angelica Reyes', 'Noah S.', 'Bisi O.', 'Sophie Laurent', 'Reuben_J', 'Tamika J.', 'Elder Samuel', 'Hannah O.', 'Oliver_E', 'Nkechi U.', 'Jemima K.', 'Diego Alvarez', 'Silas_T', 'Megan R.', 'Uche P.', 'Joanna_V', 'Thomas Reid', 'Lily Chen', 'Barnabas O.', 'Amanda F.', 'Emmanuel_T', 'Stella M.', 'Vincent_J', 'Katie B.', 'Pieter V.', 'Dorcas A.', 'Aaron_K', 'Natalie W.', 'Segun A.', 'Charity L.', 'Joel_R', 'Erin Murphy', 'David_M', 'Ebuka N.', 'Tessa H.', 'Jared P.', 'Sandra O.', 'Mateus Lima', 'Eunice_B', 'Patrick N.'];
export const EVENTS = [
  { id: 'hero',  tag: 'hero',  name: 'Heroes of Faith',  emoji: '🛡️', colors: ['#1fa35a', '#0b7a3b'], window: null },
  { id: 'psalm', tag: 'psalm', name: 'Psalms & Praise',  emoji: '🎶', colors: ['#7b5bd6', '#4a2fa0'], window: null },
  { id: 'xmas',  tag: 'xmas',  name: 'Christmas Star',   emoji: '⭐', colors: ['#d63b4a', '#8e1626'], window: ['12-01', '01-06'] },
  { id: 'east',  tag: 'east',  name: 'Easter Dawn',      emoji: '🌅', colors: ['#f2a93b', '#c9741a'], window: ['03-15', '04-30'] },
  { id: 'pent',  tag: 'pent',  name: 'Pentecost Fire',   emoji: '🔥', colors: ['#ef6a3a', '#b5301a'], window: ['05-10', '06-15'] },
];
export const EVENT_PUZZLES = 6;
