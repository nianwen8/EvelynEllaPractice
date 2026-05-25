create table if not exists public.practice_progress (
  family_id text not null,
  learner text not null,
  week_key text not null,
  week_label text not null,
  week_theme text not null,
  mode text not null,
  stars integer not null default 0,
  attempts integer not null default 0,
  correct integer not null default 0,
  current_index integer not null default 0,
  completed jsonb not null default '{}'::jsonb,
  recent_answers jsonb not null default '[]'::jsonb,
  saved_to text not null default 'Supabase',
  last_practiced_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (family_id, learner, week_key, mode)
);

alter table public.practice_progress
add column if not exists recent_answers jsonb not null default '[]'::jsonb;

alter table public.practice_progress enable row level security;

create policy "practice_progress_anon_select"
on public.practice_progress
for select
to anon
using (true);

create policy "practice_progress_anon_insert"
on public.practice_progress
for insert
to anon
with check (true);

create policy "practice_progress_anon_update"
on public.practice_progress
for update
to anon
using (true)
with check (true);

create or replace function public.set_practice_progress_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_practice_progress_updated_at on public.practice_progress;

create trigger set_practice_progress_updated_at
before update on public.practice_progress
for each row
execute function public.set_practice_progress_updated_at();
