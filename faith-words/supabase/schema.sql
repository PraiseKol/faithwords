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
