create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Search',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  saved_apartments jsonb not null default '[]'::jsonb,
  tours jsonb not null default '[]'::jsonb,
  applications jsonb not null default '[]'::jsonb,
  workflow_tab text not null default 'dashboard',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists chat_sessions_set_updated_at on public.chat_sessions;
create trigger chat_sessions_set_updated_at
before update on public.chat_sessions
for each row
execute function public.set_updated_at();

drop trigger if exists user_workspaces_set_updated_at on public.user_workspaces;
create trigger user_workspaces_set_updated_at
before update on public.user_workspaces
for each row
execute function public.set_updated_at();

alter table public.chat_sessions enable row level security;
alter table public.user_workspaces enable row level security;

drop policy if exists "Users can read their chat sessions" on public.chat_sessions;
create policy "Users can read their chat sessions"
on public.chat_sessions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their chat sessions" on public.chat_sessions;
create policy "Users can insert their chat sessions"
on public.chat_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their chat sessions" on public.chat_sessions;
create policy "Users can update their chat sessions"
on public.chat_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their chat sessions" on public.chat_sessions;
create policy "Users can delete their chat sessions"
on public.chat_sessions
for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can read their workspace" on public.user_workspaces;
create policy "Users can read their workspace"
on public.user_workspaces
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their workspace" on public.user_workspaces;
create policy "Users can insert their workspace"
on public.user_workspaces
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their workspace" on public.user_workspaces;
create policy "Users can update their workspace"
on public.user_workspaces
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
