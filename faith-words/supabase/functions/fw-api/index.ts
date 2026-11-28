// Faith Words server: the only place XP, coins, streaks, progress, leagues and challenges are decided.
// The game rules are the same files the app uses (faith-words/js/*.js). Deployed version imports them pinned
// to a commit; to update, change the SHA in the four import lines below and redeploy.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleOp, HttpError, publicColumns } from 'https://raw.githubusercontent.com/PraiseKol/faithwords/43490693ac8c49a5c208955ffc569c64f0e80686/faith-words/js/serverlogic.js';
import { weekKey } from 'https://raw.githubusercontent.com/PraiseKol/faithwords/43490693ac8c49a5c208955ffc569c64f0e80686/faith-words/js/progress.js';
import { standings, lastWeekResult, pickBucket, weekProgress, weekEnd, TIERS, SIZE } from 'https://raw.githubusercontent.com/PraiseKol/faithwords/43490693ac8c49a5c208955ffc569c64f0e80686/faith-words/js/leagues.js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const CODE = 'abcdefghjkmnpqrstuvwxyz23456789';
const newId = () => Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => CODE[b % CODE.length]).join('');

// ---- weekly league: lazily joins you to this week's group and settles last week's result
async function realPlayers(admin: any, week: string, tier: number, bucket: number) {
  const { data: ents } = await admin.from('league_entries').select('user_id, xp').eq('week', week).eq('tier', tier).eq('bucket', bucket);
  const ids = (ents || []).map((e: any) => e.user_id);
  const { data: profs } = ids.length ? await admin.from('profiles').select('id, name, title').in('id', ids) : { data: [] };
  const by = new Map((profs || []).map((p: any) => [p.id, p]));
  return (ents || []).map((e: any) => ({ id: e.user_id, name: (by.get(e.user_id) as any)?.name || 'Believer', title: (by.get(e.user_id) as any)?.title || '', xp: e.xp }));
}
async function leagueOp(admin: any, uid: string, now: number) {
  const week = weekKey(isoDay(now));
  const { data: prof } = await admin.from('profiles').select('game, league').eq('id', uid).maybeSingle();
  if (!prof) throw new HttpError(404, 'no profile');
  let L = prof.league || {};
  const myXp = prof.game?.weekly?.key === week ? prof.game.weekly.xp : 0;
  if (L.week !== week) {
    let tier = L.tier || 1, last = L.last || null;
    if (L.week) {
      const real = await realPlayers(admin, L.week, L.tier, L.bucket);
      last = lastWeekResult({ week: L.week, tier: L.tier, bucket: L.bucket, real, uid });
      tier = last.next;
    }
    const { data: rows } = await admin.from('league_entries').select('bucket').eq('week', week).eq('tier', tier);
    const counts: Record<number, number> = {};
    (rows || []).forEach((r: any) => { counts[r.bucket] = (counts[r.bucket] || 0) + 1; });
    const bucket = pickBucket(counts);
    await admin.from('league_entries').upsert({ week, user_id: uid, tier, bucket, xp: myXp });
    L = { week, tier, bucket, last };
    await admin.from('profiles').update({ league: L }).eq('id', uid);
  }
  const real = await realPlayers(admin, week, L.tier, L.bucket);
  const rows = standings({ week, tier: L.tier, bucket: L.bucket, real, frac: weekProgress(week, now) });
  return { week, tier: L.tier, tierName: TIERS[L.tier - 1], size: SIZE, endsAt: weekEnd(week), last: L.last || null,
    rows: rows.map((r: any) => ({ rank: r.rank, name: r.name, title: r.title || '', xp: r.xp, me: r.id === uid })) };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: auth } = await admin.auth.getUser(token);
    const user = auth?.user;
    if (!user) return json({ error: 'sign in required' }, 401);
    const op = await req.json();
    const now = Date.now();
    if (op.op === 'league') return json(await leagueOp(admin, user.id, now));
    if (op.op === 'delete_account') {
      // Store rule: players can delete their account and data inside the app. Rows tied to the user
      // (profile, groups they own, memberships, league entries, challenges they created, matches they started)
      // are removed by ON DELETE CASCADE; names left behind in other people's rows are blanked first.
      if (op.confirm !== 'DELETE') return json({ error: 'confirmation required' }, 400);
      await admin.from('matches').update({ p2_name: null, p2_title: '' }).eq('p2', user.id);
      await admin.from('challenges').update({ opp_name: null }).eq('opp', user.id);
      const { error } = await admin.auth.admin.deleteUser(user.id);
      if (error) { console.error('delete failed', error); return json({ error: 'could not delete account' }, 500); }
      return json({ deleted: true });
    }

    const ctx = {
      uid: user.id,
      now,
      loadMatch: async (id: string) => (await admin.from('matches').select('*').eq('id', id).maybeSingle()).data,
      loadContent: async () => (await admin.from('app_content').select('data').eq('id', 1).maybeSingle()).data?.data || {},
      loadCustom: async () => (await admin.from('app_content').select('data').eq('id', 1).maybeSingle()).data?.data?.customBank || [],
      loadCommunity: async (week: string) => Number((await admin.from('community').select('words').eq('week', week).maybeSingle()).data?.words || 0),
    };

    for (let attempt = 0; attempt < 4; attempt++) {
      const { data: prof } = await admin.from('profiles').select('name, game, updated_at').eq('id', user.id).maybeSingle();
      if (!prof) return json({ error: 'no profile' }, 404);
      const res = await handleOp(prof.game, op, ctx);
      if (res.repeat || (op.op === 'sync' && prof.game?.v)) return json({ game: res.game });
      const patch = { game: res.game, ...publicColumns(res.game) };
      // compare-and-swap on updated_at so two parallel requests can never overwrite each other
      const { data: saved } = await admin.from('profiles').update(patch).eq('id', user.id).eq('updated_at', prof.updated_at).select('id');
      if (!(saved && saved.length)) continue;

      // ---- things a finished match feeds, after the player's own numbers are safely saved (best effort)
      let challenge: any = null;
      if (op.op === 'result' && res.summary) {
        const wk = res.game.weekly?.key;
        try {
          if (res.summary.words > 0) await admin.rpc('add_community', { p_week: wk, p_n: res.summary.words });
          await admin.from('league_entries').update({ xp: res.game.weekly.xp }).eq('week', wk).eq('user_id', user.id);
          const seed = res.summary.seed;
          if (op.challenge?.create && seed && op.mode !== 'concede') {
            const id = newId();
            await admin.from('challenges').insert({ id, seed, creator: user.id, creator_name: prof.name || 'Believer', creator_score: res.summary.score });
            challenge = { id, seed, creator_name: prof.name || 'Believer', creator_score: res.summary.score, you: res.summary.score, mine: true };
          } else if (typeof op.challenge?.reply === 'string' && op.mode !== 'concede') {
            const { data: row } = await admin.from('challenges').select('*').eq('id', op.challenge.reply).maybeSingle();
            if (row && row.seed === seed && row.creator !== user.id) {
              if (!row.opp) await admin.from('challenges').update({ opp: user.id, opp_name: prof.name || 'Believer', opp_score: res.summary.score, replied_at: new Date().toISOString() }).eq('id', row.id).is('opp', null);
              const mineOpp = row.opp === user.id || !row.opp;
              challenge = { id: row.id, seed, creator_name: row.creator_name, creator_score: row.creator_score, you: res.summary.score, opp_name: mineOpp ? prof.name || 'Believer' : row.opp_name, opp_score: mineOpp ? (row.opp_score ?? res.summary.score) : row.opp_score, mine: false };
            }
          }
        } catch (e) { console.error('side effects failed', e); }
      }
      return json({ game: res.game, summary: res.summary, challenge });
    }
    return json({ error: 'busy, try again' }, 409);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: 'server error' }, 500);
  }
});
