// Titles and badges. Earned automatically from your progress (nothing to store but the title you wear),
// so the phone and the server always agree on what you have earned.
import { levelFromXp } from './progress.js';

const lv = (d) => levelFromXp(d.xp).level;
export const BADGES = [
  { id: 'seeker',    icon: '🌱', name: 'Seeker',      desc: 'Finish your first puzzle',            test: (d) => d.stats.games >= 1 },
  { id: 'scribe',    icon: '✒️', name: 'Scribe',      desc: 'Complete 100 words',                  test: (d) => d.stats.totalWords >= 100 },
  { id: 'scholar',   icon: '📖', name: 'Scholar',     desc: 'Complete 500 words',                  test: (d) => d.stats.totalWords >= 500 },
  { id: 'shepherd',  icon: '🐑', name: 'Shepherd',    desc: 'Collect 25 verses in your album',     test: (d) => Object.keys(d.album || {}).length >= 25 },
  { id: 'keeper',    icon: '🕮', name: 'Keeper of the Word', desc: 'Collect 75 verses in your album', test: (d) => Object.keys(d.album || {}).length >= 75 },
  { id: 'pilgrim',   icon: '🥾', name: 'Pilgrim',     desc: 'Reach puzzle 50',                     test: (d) => d.mainNext >= 50 },
  { id: 'wayfarer',  icon: '🧭', name: 'Wayfarer',    desc: 'Reach puzzle 200',                    test: (d) => d.mainNext >= 200 },
  { id: 'overcomer', icon: '🔥', name: 'Overcomer',   desc: 'Win 5 matches in a row',              test: (d) => d.bestWinStreak >= 5 },
  { id: 'champion',  icon: '🏆', name: 'Champion',    desc: 'Win 50 matches',                      test: (d) => d.stats.wins >= 50 },
  { id: 'faithful',  icon: '🕯️', name: 'Faithful',    desc: 'Check in 7 days in a row',            test: (d) => (d.checkin.best || d.checkin.streak) >= 7 },
  { id: 'steadfast', icon: '⚓', name: 'Steadfast',   desc: 'Check in 30 days in a row',           test: (d) => (d.checkin.best || d.checkin.streak) >= 30 },
  { id: 'servant',   icon: '🤲', name: 'Servant',     desc: 'Finish 20 daily quests',              test: (d) => d.stats.quests >= 20 },
  { id: 'psalmist',  icon: '🎶', name: 'Psalmist',    desc: 'Finish all Psalms & Praise puzzles',  test: (d) => (d.events.psalm || 0) >= 6 },
  { id: 'hero',      icon: '🛡️', name: 'Hero of Faith', desc: 'Finish all Heroes of Faith puzzles', test: (d) => (d.events.hero || 0) >= 6 },
  { id: 'disciple',  icon: '🙏', name: 'Disciple',    desc: 'Reach level 5',                       test: (d) => lv(d) >= 5 },
  { id: 'elder',     icon: '👑', name: 'Elder',       desc: 'Reach level 20',                      test: (d) => lv(d) >= 20 },
];
export const earnedBadges = (d) => BADGES.filter((b) => b.test(d)).map((b) => b.id);
export const badgeById = (id) => BADGES.find((b) => b.id === id) || null;
/** The title worn next to your name ('' = none). Only an earned one counts. */
export const wornTitle = (d) => { const b = badgeById(d.title); return b && b.test(d) ? b.name : ''; };
