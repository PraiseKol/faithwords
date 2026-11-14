// Faith Words server: the only place XP, coins, streaks and progress are decided.
// The game rules are the same files the app uses (faith-words/js/serverlogic.js). Deployed version imports
// them pinned to a commit; to update, change the SHA below to the new commit and redeploy.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { handleOp, HttpError, publicColumns } from 'https://raw.githubusercontent.com/PraiseKol/faithwords/a038f653e7d111873edf1282ebfd900477697961/faith-words/js/serverlogic.js';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
    const token = (req.headers.get('Authorization') || '').replace('Bearer ', '');
    const { data: auth } = await admin.auth.getUser(token);
    const user = auth?.user;
    if (!user) return json({ error: 'sign in required' }, 401);
    const op = await req.json();

    const ctx = {
      uid: user.id,
      now: Date.now(),
      loadMatch: async (id: string) => (await admin.from('matches').select('*').eq('id', id).maybeSingle()).data,
      loadCustom: async () => (await admin.from('app_content').select('data').eq('id', 1).maybeSingle()).data?.data?.customBank || [],
    };

    for (let attempt = 0; attempt < 4; attempt++) {
      const { data: prof } = await admin.from('profiles').select('game, updated_at').eq('id', user.id).maybeSingle();
      if (!prof) return json({ error: 'no profile' }, 404);
      const res = await handleOp(prof.game, op, ctx);
      if (res.repeat || (op.op === 'sync' && prof.game?.v)) return json({ game: res.game });
      const patch = { game: res.game, ...publicColumns(res.game) };
      // compare-and-swap on updated_at so two parallel requests can never overwrite each other
      const { data: saved } = await admin.from('profiles').update(patch).eq('id', user.id).eq('updated_at', prof.updated_at).select('id');
      if (saved && saved.length) return json({ game: res.game, summary: res.summary });
    }
    return json({ error: 'busy, try again' }, 409);
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message }, e.status);
    console.error(e);
    return json({ error: 'server error' }, 500);
  }
});
