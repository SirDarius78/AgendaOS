-- Extensions
create extension if not exists pgcrypto;

-- Types
create type public.task_status as enum ('todo', 'inprogress', 'done');
create type public.task_priority as enum ('low', 'medium', 'high');

-- User profiles (optional but recommended)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tasks table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  due_date date,
  due_time time,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  color text not null default '#6366f1',
  tags text[] not null default '{}',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_idx on public.tasks(user_id);
create index if not exists tasks_user_status_idx on public.tasks(user_id, status);
create index if not exists tasks_user_due_date_idx on public.tasks(user_id, due_date);

-- Optional activity table for audit/history
create table if not exists public.task_activity (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists task_activity_task_idx on public.task_activity(task_id);
create index if not exists task_activity_user_idx on public.task_activity(user_id);

-- Updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

-- Auto-create profile row after sign up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_activity enable row level security;

-- Profiles policies
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Tasks policies
create policy "tasks_select_own"
on public.tasks
for select
to authenticated
using (auth.uid() = user_id);

create policy "tasks_insert_own"
on public.tasks
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "tasks_update_own"
on public.tasks
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "tasks_delete_own"
on public.tasks
for delete
to authenticated
using (auth.uid() = user_id);

-- Activity policies
create policy "task_activity_select_own"
on public.task_activity
for select
to authenticated
using (auth.uid() = user_id);

create policy "task_activity_insert_own"
on public.task_activity
for insert
to authenticated
with check (auth.uid() = user_id);

-- ------------------------------------------------------------
-- Shared boards model (required by current frontend)
-- ------------------------------------------------------------

create table if not exists public.shared_boards (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists shared_boards_owner_idx
  on public.shared_boards(owner_user_id);

drop trigger if exists trg_shared_boards_updated_at on public.shared_boards;
create trigger trg_shared_boards_updated_at
before update on public.shared_boards
for each row execute function public.set_updated_at();

create table if not exists public.shared_members (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.shared_boards(id) on delete cascade,
  invited_by_user_id uuid not null references auth.users(id) on delete cascade,
  invited_email text not null,
  invited_user_id uuid references auth.users(id) on delete set null,
  role text not null default 'viewer' check (role in ('viewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists shared_members_board_email_uniq
  on public.shared_members(board_id, lower(invited_email));

create index if not exists shared_members_invited_user_idx
  on public.shared_members(invited_user_id);

create index if not exists shared_members_board_idx
  on public.shared_members(board_id);

drop trigger if exists trg_shared_members_updated_at on public.shared_members;
create trigger trg_shared_members_updated_at
before update on public.shared_members
for each row execute function public.set_updated_at();

alter table public.tasks add column if not exists board_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tasks_board_id_fkey'
      and conrelid = 'public.tasks'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_board_id_fkey
      foreign key (board_id) references public.shared_boards(id) on delete cascade;
  end if;
end
$$;

-- Ensure each existing owner has a board, then backfill tasks.board_id
insert into public.shared_boards (owner_user_id, title)
select distinct t.user_id, 'Mi tablero'
from public.tasks t
left join public.shared_boards b on b.owner_user_id = t.user_id
where b.id is null;

insert into public.shared_boards (owner_user_id, title)
select p.id, 'Mi tablero'
from public.profiles p
left join public.shared_boards b on b.owner_user_id = p.id
where b.id is null;

update public.tasks t
set board_id = b.id
from public.shared_boards b
where t.board_id is null
  and b.owner_user_id = t.user_id;

alter table public.tasks alter column board_id set not null;

create index if not exists tasks_board_idx on public.tasks(board_id);
create index if not exists tasks_board_status_idx on public.tasks(board_id, status);

-- Recreate auth trigger so new users get both profile and default board
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;

  insert into public.shared_boards (owner_user_id, title)
  values (new.id, 'Mi tablero')
  on conflict do nothing;

  return new;
end;
$$;

alter table public.shared_boards enable row level security;
alter table public.shared_members enable row level security;

drop policy if exists "shared_boards_select_readable" on public.shared_boards;
create policy "shared_boards_select_readable"
on public.shared_boards
for select
to authenticated
using (
  owner_user_id = auth.uid()
  or exists (
    select 1
    from public.shared_members sm
    where sm.board_id = shared_boards.id
      and sm.invited_user_id = auth.uid()
      and sm.status = 'accepted'
  )
);

drop policy if exists "shared_boards_insert_owner" on public.shared_boards;
create policy "shared_boards_insert_owner"
on public.shared_boards
for insert
to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "shared_boards_update_owner" on public.shared_boards;
create policy "shared_boards_update_owner"
on public.shared_boards
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists "shared_boards_delete_owner" on public.shared_boards;
create policy "shared_boards_delete_owner"
on public.shared_boards
for delete
to authenticated
using (owner_user_id = auth.uid());

drop policy if exists "shared_members_select_related" on public.shared_members;
create policy "shared_members_select_related"
on public.shared_members
for select
to authenticated
using (
  invited_user_id = auth.uid()
  or exists (
    select 1
    from public.shared_boards b
    where b.id = shared_members.board_id
      and b.owner_user_id = auth.uid()
  )
);

drop policy if exists "shared_members_insert_owner" on public.shared_members;
create policy "shared_members_insert_owner"
on public.shared_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.shared_boards b
    where b.id = shared_members.board_id
      and b.owner_user_id = auth.uid()
  )
);

drop policy if exists "shared_members_update_owner_or_invited" on public.shared_members;
create policy "shared_members_update_owner_or_invited"
on public.shared_members
for update
to authenticated
using (
  invited_user_id = auth.uid()
  or exists (
    select 1
    from public.shared_boards b
    where b.id = shared_members.board_id
      and b.owner_user_id = auth.uid()
  )
)
with check (
  invited_user_id = auth.uid()
  or exists (
    select 1
    from public.shared_boards b
    where b.id = shared_members.board_id
      and b.owner_user_id = auth.uid()
  )
);

drop policy if exists "tasks_select_readable_board" on public.tasks;
create policy "tasks_select_readable_board"
on public.tasks
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.shared_members sm
    where sm.board_id = tasks.board_id
      and sm.invited_user_id = auth.uid()
      and sm.status = 'accepted'
  )
);

drop policy if exists "tasks_insert_owner_on_owned_board" on public.tasks;
create policy "tasks_insert_owner_on_owned_board"
on public.tasks
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.shared_boards b
    where b.id = tasks.board_id
      and b.owner_user_id = auth.uid()
  )
);

drop policy if exists "tasks_update_owner_on_owned_board" on public.tasks;
create policy "tasks_update_owner_on_owned_board"
on public.tasks
for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.shared_boards b
    where b.id = tasks.board_id
      and b.owner_user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.shared_boards b
    where b.id = tasks.board_id
      and b.owner_user_id = auth.uid()
  )
);

drop policy if exists "tasks_delete_owner_on_owned_board" on public.tasks;
create policy "tasks_delete_owner_on_owned_board"
on public.tasks
for delete
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.shared_boards b
    where b.id = tasks.board_id
      and b.owner_user_id = auth.uid()
  )
);

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;
