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

-- Anti-cheat: a profile can only grow at a human pace, whatever the client sends.
create or replace function public.clamp_profile_growth() returns trigger language plpgsql set search_path = '' as $$
declare mins numeric := greatest(extract(epoch from (now() - old.updated_at)) / 60, 0);
begin
  new.xp := least(new.xp, old.xp + 400 + floor(mins * 15));
  new.coins := least(new.coins, old.coins + 600 + floor(mins * 20));
  new.wins := least(new.wins, old.wins + 3 + floor(mins / 2));
  new.games := least(new.games, old.games + 5 + floor(mins / 2));
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists clamp_growth on public.profiles;
create trigger clamp_growth before update on public.profiles for each row execute function public.clamp_profile_growth();
