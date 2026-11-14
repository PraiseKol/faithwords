// Supabase connection: accounts, cloud save, leaderboard, live matches, shared content.
// Without keys (or offline) the app still works as a guest — nothing here is required to play.
import { store } from './store.js';
import { ENV } from './env.js';

let client = null, user = null;
const mock = () => (typeof window !== 'undefined' ? window.__fwMock : null); // test hook
export const cloudEnabled = () => !!mock() || !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
export const currentUser = () => (mock() ? mock().user : user);
export const online = () => !!client || !!mock();

export async function initCloud() {
  if (mock()) return true;
  if (!cloudEnabled()) return false;
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
    client = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
    const { data } = await client.auth.getSession();
    user = data.session?.user || null;
    client.auth.onAuthStateChange((_e, session) => { user = session?.user || null; });
    if (user) await pull();
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
  store.save(); await push(); return { user };
}
export async function signIn(email, password) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  user = data.user; await pull(); return user;
}
export async function signOut() { await client?.auth.signOut(); user = null; }

export async function push() {
  if (!client || !user) return;
  const d = store.d, lv = store.level();
  const { active, activeOnline, ...save } = d; // never sync an in-progress match
  await client.from('profiles').upsert({ id: user.id, name: d.name, xp: d.xp, level: lv.level, coins: d.coins, wins: d.stats.wins, games: d.stats.games, best_streak: d.bestWinStreak, save, updated_at: new Date().toISOString() });
}
export async function pull() {
  if (!client || !user) return;
  const { data } = await client.from('profiles').select('save, xp').eq('id', user.id).maybeSingle();
  if (data?.save && data.xp > store.d.xp) store.replace({ ...data.save, active: store.d.active, activeOnline: store.d.activeOnline });
  else await push();
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
