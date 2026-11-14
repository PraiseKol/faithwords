-- Faith Words — Supabase schema (already applied to your project via migration `faith_words_profiles`).
-- Keep this file as the record / to recreate the database elsewhere.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default 'Believer',
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  coins integer not null default 0 check (coins >= 0),
  wins integer not null default 0,
  games integer not null default 0,
  best_streak integer not null default 0,
  save jsonb,
  is_admin boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "own profile update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- players can never grant themselves admin: only these columns are writable from the app
revoke insert, update on public.profiles from authenticated, anon;
grant insert (id, name, xp, level, coins, wins, games, best_streak, save, updated_at) on public.profiles to authenticated;
grant update (name, xp, level, coins, wins, games, best_streak, save, updated_at) on public.profiles to authenticated;

-- create the profile automatically when someone signs up
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'name', ''), 'Believer'))
  on conflict (id) do nothing;
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- leaderboard shows only name, level, points and wins (never coins or save data)
create function public.get_leaderboard() returns table (name text, xp integer, level integer, wins integer)
language sql security definer stable set search_path = '' as $$
  select p.name, p.xp, p.level, p.wins from public.profiles p order by p.xp desc limit 25;
$$;
revoke execute on function public.get_leaderboard() from public, anon;
grant execute on function public.get_leaderboard() to authenticated;


-- ===== Part 2 (applied as migration "faith_words_online_and_content") =====
-- Live matches: the player whose turn it is saves the full board in `state`; the other app polls.
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  spec jsonb not null,
  state jsonb not null,
  p1 uuid references auth.users on delete set null,
  p2 uuid references auth.users on delete set null,
  p1_name text, p2_name text,
  turn smallint not null default 1,
  status text not null default 'waiting',   -- waiting | playing | done | cancelled
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.matches enable row level security;
create policy "players read own matches" on public.matches for select to authenticated
  using ((select auth.uid()) = p1 or (select auth.uid()) = p2);
create policy "players update own matches" on public.matches for update to authenticated
  using ((select auth.uid()) = p1 or (select auth.uid()) = p2)
  with check ((select auth.uid()) = p1 or (select auth.uid()) = p2);

-- Pair with a waiting player (within 45s) or open a new queue entry.
create or replace function public.matchmake(p_spec jsonb, p_state jsonb, p_name text)
returns public.matches language plpgsql security definer set search_path = '' as $$
declare me uuid := (select auth.uid()); m public.matches;
begin
  if me is null then raise exception 'sign in required'; end if;
  update public.matches set status = 'cancelled' where p1 = me and status = 'waiting';
  select * into m from public.matches
   where status = 'waiting' and p2 is null and p1 <> me and created_at > now() - interval '45 seconds'
   order by created_at limit 1 for update skip locked;
  if found then
    update public.matches set p2 = me, p2_name = left(coalesce(nullif(p_name, ''), 'Believer'), 16), status = 'playing', updated_at = now()
     where id = m.id returning * into m;
    return m;
  end if;
  insert into public.matches (spec, state, p1, p1_name)
  values (p_spec, p_state, me, left(coalesce(nullif(p_name, ''), 'Believer'), 16)) returning * into m;
  return m;
end $$;

-- Shared content the admin panel publishes to every player.
create table if not exists public.app_content (
  id int primary key check (id = 1),
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
insert into public.app_content (id) values (1) on conflict do nothing;
alter table public.app_content enable row level security;
create policy "content readable by everyone" on public.app_content for select using (true);
create policy "admins update content" on public.app_content for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin));

-- ===== Part 3: server-owned progress, guarded live matches, realtime =====
-- Only the `fw-api` Edge Function (service role) may change XP, coins, streaks and progress.
alter table public.profiles add column if not exists game jsonb not null default '{}';

revoke insert, update on public.profiles from authenticated, anon;
grant update (name, save) on public.profiles to authenticated;

drop trigger if exists clamp_profile_growth on public.profiles;
drop function if exists public.clamp_profile_growth();
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
create trigger touch_profiles before update on public.profiles for each row execute function public.touch_updated_at();

-- Live matches: players may only do what the rules allow.
create or replace function public.guard_match_update() returns trigger language plpgsql set search_path = '' as $$
declare
  me uuid := (select auth.uid());
  holder uuid; mover int; old_log jsonb; new_log jsonb; n_old int; n_new int;
begin
  if current_user not in ('authenticated', 'anon') then return new; end if; -- matchmake() and the server
  if me is null or me not in (old.p1, old.p2) then
    -- joining a waiting match is done by matchmake() only
    raise exception 'not your match';
  end if;
  -- fixed facts
  new.spec := old.spec; new.p1 := old.p1; new.p2 := old.p2; new.p1_name := old.p1_name; new.p2_name := old.p2_name; new.created_at := old.created_at;
  if old.status in ('done', 'cancelled') then
    new.state := old.state; new.status := old.status; new.winner := old.winner; new.turn := old.turn; return new;
  end if;
  if old.status = 'waiting' then
    if new.status not in ('waiting', 'cancelled') then new.status := old.status; end if;
    new.state := old.state; new.turn := old.turn; new.winner := old.winner; return new;
  end if;
  -- playing
  if new.winner is distinct from old.winner then
    -- concede (winner = the other player) or claim after 80 s of silence (winner = me)
    if new.winner = (case when me = old.p1 then 2 else 1 end) then null;
    elsif new.winner = (case when me = old.p1 then 1 else 2 end)
          and old.turn = (case when me = old.p1 then 2 else 1 end)
          and old.updated_at < now() - interval '80 seconds' then null;
    else raise exception 'invalid result'; end if;
    new.status := 'done'; new.state := old.state; new.turn := old.turn; return new;
  end if;
  if new.state is distinct from old.state then
    holder := case old.turn when 1 then old.p1 else old.p2 end;
    if me <> holder then raise exception 'not your turn'; end if;
    mover := case when me = old.p1 then 0 else 1 end;
    old_log := coalesce(old.state->'log', '[]'); new_log := coalesce(new.state->'log', '[]');
    n_old := jsonb_array_length(old_log); n_new := jsonb_array_length(new_log);
    if n_new < n_old or n_new - n_old > 40 or n_new > 600 then raise exception 'bad log'; end if;
    if n_old > 0 and (select jsonb_agg(e order by i) from jsonb_array_elements(new_log) with ordinality t(e, i) where i <= n_old) is distinct from old_log then
      raise exception 'log rewritten';
    end if;
    if exists (select 1 from jsonb_array_elements(new_log) with ordinality t(e, i) where i > n_old and (e->>0)::int <> mover) then
      raise exception 'moves for the other player';
    end if;
  else
    new.turn := old.turn; -- nothing but a state write may change whose turn it is
  end if;
  if new.status not in ('playing', 'done') then new.status := old.status; end if;
  if new.status = 'playing' then new.turn := case new.state->>'turn' when 'p1' then 1 else 2 end; end if;
  return new;
end $$;
drop trigger if exists guard_match on public.matches;
create trigger guard_match before update on public.matches for each row execute function public.guard_match_update();

revoke execute on function public.matchmake(jsonb, jsonb, text) from anon, public;
grant execute on function public.matchmake(jsonb, jsonb, text) to authenticated;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'matches') then
    alter publication supabase_realtime add table public.matches;
  end if;
end $$;
