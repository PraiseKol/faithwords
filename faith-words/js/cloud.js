// Supabase connection (accounts, cloud save, leaderboard). Fill in js/env.js to turn it on.
// Without keys the app works fully offline (guest mode) — nothing here is required to play.
import { store } from './store.js';
import { ENV } from './env.js';

let client = null, user = null;
export const cloudEnabled = () => !!(ENV.SUPABASE_URL && ENV.SUPABASE_ANON_KEY);
export const currentUser = () => user;

export async function initCloud() {
  if (!cloudEnabled()) return false;
  try {
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm');
    client = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
    const { data } = await client.auth.getSession();
    user = data.session?.user || null;
    client.auth.onAuthStateChange((_e, session) => { user = session?.user || null; });
    if (user) await pull();
    // push local changes (debounced) while signed in
    let t; store.onChange(() => { clearTimeout(t); t = setTimeout(push, 2500); });
    return true;
  } catch (e) { console.warn('Supabase unavailable', e); return false; }
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
  const { active, ...save } = d; // do not sync an in-progress match
  await client.from('profiles').upsert({ id: user.id, name: d.name, xp: d.xp, level: lv.level, coins: d.coins, wins: d.stats.wins, games: d.stats.games, best_streak: d.bestWinStreak, save, updated_at: new Date().toISOString() });
}
export async function pull() {
  if (!client || !user) return;
  const { data } = await client.from('profiles').select('save, xp, updated_at').eq('id', user.id).maybeSingle();
  // keep whichever side has more XP (simple, safe merge)
  if (data?.save && data.xp > store.d.xp) store.replace({ ...data.save, active: store.d.active });
  else await push();
}
export async function leaderboard() {
  if (!client) return [];
  const { data } = await client.rpc('get_leaderboard');
  return data || [];
}
