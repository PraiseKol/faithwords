// Player data: points/XP, levels, coins, check-ins, streaks, progress. Saved on the device;
// cloud.js mirrors it to Supabase when the player is signed in.
import { CONFIG } from './config.js';
import { levelFromXp } from './engine.js';
import * as P from './progress.js';

const KEY = 'fw.v1';
export const todayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const fresh = () => ({
  name: 'Believer', ...P.freshProgress(), active: null,
  settings: { sound: true, haptics: true, theme: 'system', unlockEvents: false },
  onboarded: false, activeOnline: null,
  clueOverrides: {}, customBank: [], dirty: 0, pendingOps: [],
});

let data;
try { data = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { data = fresh(); }
data.inv = { ...fresh().inv, ...data.inv };
data.settings = { ...fresh().settings, ...data.settings };
data.stats = { ...fresh().stats, ...data.stats };

const listeners = new Set();
export const store = {
  get d() { return data; },
  save() {
    data.dirty = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* private mode */ }
    listeners.forEach((f) => f(data));
  },
  onChange(f) { listeners.add(f); },
  replace(obj) { data = { ...fresh(), ...obj }; this.save(); },
  reset() { data = fresh(); this.save(); },
  level() { return levelFromXp(data.xp); },

  // ---- progress rules live in progress.js (shared with the server). Signed-in players: every change
  // is applied here instantly, then confirmed by the server, whose answer wins (see cloud.js).
  hook: null, // set by cloud.js: { op(name, payload) }
  serverState() { const o = {}; P.SERVER_KEYS.forEach((k) => (o[k] = data[k])); return o; },
  applyServer(g) { P.SERVER_KEYS.forEach((k) => { if (g[k] !== undefined) data[k] = g[k]; }); this.save(); },
  queueOp(op) { if (!this.hook?.active()) return; data.pendingOps.push(op); this.save(); this.hook.flush(); },

  checkinInfo() { return P.checkinInfo(data, todayStr()); },
  claimCheckin() {
    const n = P.claimCheckin(data, todayStr());
    if (n) { this.queueOp({ op: 'checkin', today: todayStr() }); this.save(); }
    return n;
  },
  winMultiplier: P.winMultiplier,
  spend(kind) { // power-ups used in a match are charged by the server from the match log; locally it is instant
    const ok = P.spend(data, kind); if (ok) this.save(); return ok;
  },
  buy(kind) {
    const ok = P.buy(data, kind);
    if (ok) { this.queueOp({ op: 'buy', kind }); this.save(); }
    return ok;
  },

  /** Called once when a match ends. log/role/matchId let the server re-check the result. */
  recordResult({ spec, score, oppScore, log = [], role = 0, matchId = null, mode = null }) {
    const r = P.applyResult(data, { spec, score, oppScore });
    data.active = null;
    this.queueOp({ op: 'result', spec, log, role, matchId, mode, today: todayStr() });
    this.save();
    return r;
  },
};
