-- NOT applied yet. Live two-player matches and a database-backed word bank (next phase).
-- Needs the profiles table from schema.sql first.

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
create policy "players update" on public.matches for update to authenticated using (auth.uid() in (p1, p2) or status = 'waiting') with check (auth.uid() in (p1, p2));
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
