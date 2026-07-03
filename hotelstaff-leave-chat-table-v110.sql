-- StaffSync v110: dedicated leave chat table.
-- Run once in Supabase SQL Editor before testing v110.
-- This separates leave chat from activity/clock logs so messages do not disappear.

create extension if not exists pgcrypto;

create table if not exists staffsync_leave_messages (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  leave_request_id text not null,
  staff_profile_id uuid references staff_profiles(id) on delete set null,
  sender_role text not null default 'staff',
  label text not null default 'Message',
  class_name text not null default '',
  message text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists staffsync_leave_messages_hotel_idx
on staffsync_leave_messages (hotel_id, created_at desc);

create index if not exists staffsync_leave_messages_thread_idx
on staffsync_leave_messages (leave_request_id, created_at);

alter table staffsync_leave_messages enable row level security;

drop policy if exists "staffsync leave messages read" on staffsync_leave_messages;
create policy "staffsync leave messages read"
on staffsync_leave_messages for select
to anon, authenticated
using (true);

drop policy if exists "staffsync leave messages write" on staffsync_leave_messages;
create policy "staffsync leave messages write"
on staffsync_leave_messages for insert
to anon, authenticated
with check (true);

drop policy if exists "staffsync leave messages delete" on staffsync_leave_messages;
create policy "staffsync leave messages delete"
on staffsync_leave_messages for delete
to anon, authenticated
using (true);

do $$
begin
  alter publication supabase_realtime add table staffsync_leave_messages;
exception
  when duplicate_object then null;
end $$;
