// Supabase connection: accounts, cloud save, leaderboard, live matches, shared content.
// Without keys (or offline) the app still works as a guest — nothing here is required to play.
import { store } from './store.js';
import { ENV } from './env.js';
import { SERVER_KEYS } from './progress.js';

let client = null, user = null;
const mock = () => (typeof window !== 'undefined' ? window.__fwMock : null); // test hook
export const cloudEnabled = () => !!mock() || !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
export const currentUser = () => (mock() ? mock().user : user);
export const online = () => !!client || !!mock();

export async function initCloud() {
  store.hook = { active: () => !!currentUser(), flush };
  store.inGame = () => location.hash.startsWith('#/game');
  window.addEventListener('hashchange', () => { if (!store.inGame() && deferred) { store.applyServer(deferred); deferred = null; } });
  window.addEventListener('online', () => flush());
  if (mock()) return true;
  if (!cloudEnabled()) return false;
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
    client = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
    const { data } = await client.auth.getSession();
    user = data.session?.user || null;
    client.auth.onAuthStateChange((_e, session) => { user = session?.user || null; });
    if (user) { await pull(); await syncProgress(); }
    let t; store.onChange(() => { clearTimeout(t); t = setTimeout(push, 2500); });
    return true;
  } catch (e) { console.warn('Supabase unavailable', e); client = null; return false; }
}

export async function signUp(email, password, name) {
  const { data, error } = await client.auth.signUp({ email, password, options: { data: { name } } });
  if (error) throw error;
  user = data.user;
  if (!data.session) { user = null; return { confirm: true }; } // project requires email confirmation
  if (name) store.d.name = name;
  store.save(); await push(); await syncProgress(); return { user };
}
export async function signIn(email, password) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  user = data.user; await pull(); await syncProgress(); return user;
}
export async function signOut() { await client?.auth.signOut(); user = null; store.d.pendingOps = []; store.save(); }

// Cosmetic profile data (name, settings, admin edits) is saved by the app. Everything that counts
// (XP, coins, streaks, progress) is written only by the server — see supabase/functions/fw-api.
export async function push() {
  if (!client || !user) return;
  const d = store.d;
  const save = { ...d };
  [...SERVER_KEYS, 'active', 'activeOnline', 'pendingOps', 'dirty'].forEach((k) => delete save[k]);
  await client.from('profiles').update({ name: d.name, save }).eq('id', user.id);
}
export async function pull() {
  if (!client || !user) return;
  const { data } = await client.from('profiles').select('save').eq('id', user.id).maybeSingle();
  if (data?.save && Object.keys(data.save).length) {
    const keep = { ...store.serverState(), active: store.d.active, activeOnline: store.d.activeOnline, pendingOps: store.d.pendingOps };
    store.replace({ ...data.save, ...keep });
  }
}

// ---- server-confirmed progress
let flushing = false, deferred = null, retryTimer = null;
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
async function callOp(body) {
  const m = mock(); if (m?.op) return m.op(body);
  const { data, error } = await client.functions.invoke('fw-api', { body });
  if (error) { const e = new Error(error.message); e.status = error.context?.status || 0; throw e; }
  return data;
}
const settle = (game, force) => {
  if (!game) return;
  if (!force && store.inGame?.()) { deferred = game; return; } // never change coins in the middle of a match
  deferred = null; store.applyServer(game);
};
/** Send queued actions (check-in, shop, match results) to the server, oldest first. */
export async function flush(force = false) {
  if (flushing || !currentUser()) return;
  flushing = true;
  try {
    while (store.d.pendingOps.length) {
      const op = store.d.pendingOps[0];
      if (!op.id) { op.id = uid(); store.save(); }
      try {
        const res = await callOp(op);
        store.d.pendingOps.shift();
        if (op.op === 'result' && res.summary) store.lastServerSummary = res.summary;
        if (!store.d.pendingOps.length) settle(res.game, force);
        else store.save();
      } catch (e) {
        if (e.status >= 400 && e.status < 500 && e.status !== 408 && e.status !== 425 && e.status !== 429) {
          store.d.pendingOps.shift(); store.save(); // rejected: the server's numbers win
          console.warn('server rejected', op.op, e.message);
          await syncProgress(true);
        } else break; // offline — keep it queued and try again later
      }
    }
  } finally {
    flushing = false;
    clearTimeout(retryTimer);
    if (store.d.pendingOps.length) retryTimer = setTimeout(() => flush(force), 4000); // offline or too early: try again
  }
}
/** Pull the server's authoritative numbers (first sign-in also offers the guest progress once, capped). */
export async function syncProgress(force = false) {
  if (!currentUser()) return;
  try {
    await flush(force);
    if (store.d.pendingOps.length) return;
    const res = await callOp({ op: 'sync', local: store.serverState() });
    settle(res.game, force);
  } catch (e) { console.warn('sync failed', e); }
}

// ---- data API used by the game (replaceable in tests via window.__fwMock)
export const api = {
  async leaderboard() { if (!client) return []; const { data } = await client.rpc('get_leaderboard'); return data || []; },
  async matchmake(spec, state, name) {
    const { data, error } = await client.rpc('matchmake', { p_spec: spec, p_state: state, p_name: name });
    if (error) throw error; return data;
  },
  async fetchMatch(id) {
    const { data, error } = await client.from('matches').select('*').eq('id', id).maybeSingle();
    if (error) throw error; return data;
  },
  async pushMatch(id, patch) {
    const { error } = await client.from('matches').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
  /** Live updates of a match row. Returns {stop}. onStatus gets true when the realtime channel is connected. */
  subscribeMatch(id, onRow, onStatus) {
    if (!client) return { stop() {} };
    const ch = client.channel('match-' + id)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${id}` }, (p) => onRow(p.new))
      .subscribe((status) => onStatus?.(status === 'SUBSCRIBED'));
    return { stop() { client.removeChannel(ch); } };
  },
  async cancelMatch(id) { await client.from('matches').update({ status: 'cancelled' }).eq('id', id).eq('status', 'waiting'); },
  async loadContent() {
    if (!client) return null;
    const { data } = await client.from('app_content').select('data').eq('id', 1).maybeSingle();
    return data?.data || null;
  },
  async publishContent(content) {
    const { error } = await client.from('app_content').update({ data: content, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) throw error;
  },
  async isAdmin() {
    if (!client || !user) return false;
    const { data } = await client.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
    return !!data?.is_admin;
  },
};
export const A = new Proxy(api, { get: (t, k) => (mock() && mock()[k]) || t[k] });
export const leaderboard = () => A.leaderboard();
