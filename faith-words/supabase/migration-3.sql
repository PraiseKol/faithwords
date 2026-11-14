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
