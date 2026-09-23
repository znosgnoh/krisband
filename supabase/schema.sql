-- Run this in the Supabase SQL editor for your project.
-- Enables shared song storage across devices for one band board.

create table if not exists public.songs (
  id uuid primary key,
  board_id text not null,
  title text not null,
  singer text not null,
  added_by text not null,
  status text not null check (status in ('to_practice', 'practicing', 'done')),
  youtube_url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists songs_board_status_order_idx
  on public.songs (board_id, status, order_index);

alter table public.songs enable row level security;

drop policy if exists "songs_anon_select" on public.songs;
drop policy if exists "songs_anon_insert" on public.songs;
drop policy if exists "songs_anon_update" on public.songs;
drop policy if exists "songs_anon_delete" on public.songs;

create policy "songs_anon_select"
  on public.songs for select
  to anon, authenticated
  using (true);

create policy "songs_anon_insert"
  on public.songs for insert
  to anon, authenticated
  with check (true);

create policy "songs_anon_update"
  on public.songs for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "songs_anon_delete"
  on public.songs for delete
  to anon, authenticated
  using (true);

alter publication supabase_realtime add table public.songs;

-- One shared rehearsal plan per band board
create table if not exists public.rehearsal_plans (
  board_id text primary key,
  scheduled_at timestamptz not null,
  song_ids text[] not null default '{}',
  weekly boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.rehearsal_plans enable row level security;

drop policy if exists "rehearsal_plans_anon_select" on public.rehearsal_plans;
drop policy if exists "rehearsal_plans_anon_insert" on public.rehearsal_plans;
drop policy if exists "rehearsal_plans_anon_update" on public.rehearsal_plans;
drop policy if exists "rehearsal_plans_anon_delete" on public.rehearsal_plans;

create policy "rehearsal_plans_anon_select"
  on public.rehearsal_plans for select
  to anon, authenticated
  using (true);

create policy "rehearsal_plans_anon_insert"
  on public.rehearsal_plans for insert
  to anon, authenticated
  with check (true);

create policy "rehearsal_plans_anon_update"
  on public.rehearsal_plans for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "rehearsal_plans_anon_delete"
  on public.rehearsal_plans for delete
  to anon, authenticated
  using (true);

alter publication supabase_realtime add table public.rehearsal_plans;
