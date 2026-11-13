-- Faith Words — Supabase schema. Run in the Supabase SQL editor.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default 'Believer',
  xp integer not null default 0,
  level integer not null default 1,
  coins integer not null default 0,
  wins integer not null default 0,
  games integer not null default 0,
  best_streak integer not null default 0,
  save jsonb,
  is_admin boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
-- anyone signed in can read names/levels for the leaderboard
create policy "profiles readable" on public.profiles for select to authenticated using (true);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id and is_admin = (select p.is_admin from public.profiles p where p.id = auth.uid()));

-- Phase 2: live matches (two real players). The game rules in js/engine.js are deterministic from
-- the puzzle seed, so a match only needs to store the seed and the move list.
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  seed text not null,
  spec jsonb not null,
  p1 uuid references auth.users,
  p2 uuid references auth.users,
  turn smallint not null default 1,
  moves jsonb not null default '[]',
  status text not null default 'waiting',   -- waiting | playing | done
  created_at timestamptz not null default now()
);
alter table public.matches enable row level security;
create policy "players read" on public.matches for select to authenticated using (auth.uid() in (p1, p2) or status = 'waiting');
create policy "create" on public.matches for insert to authenticated with check (auth.uid() = p1);
create policy "players update" on public.matches for update to authenticated using (auth.uid() in (p1, p2) or status = 'waiting');
alter publication supabase_realtime add table public.matches;

-- Content tables for the admin panel (Phase 2): move the word bank to the database.
create table if not exists public.words (
  id bigint generated always as identity primary key,
  answer text not null check (answer ~ '^[A-Z]{3,9}$'),
  clue text not null default '',
  emoji text not null default '',
  tags text[] not null default '{}'
);
alter table public.words enable row level security;
create policy "words readable" on public.words for select using (true);
create policy "admins write words" on public.words for all to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));
