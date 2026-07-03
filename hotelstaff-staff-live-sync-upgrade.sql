-- StaffSync upgrade: allow staff-phone live sync for shifts, leave, and admin messages.
-- Run once in Supabase SQL Editor if staff phones do not receive shift/leave updates automatically.

alter table daily_rosters enable row level security;
alter table leave_requests enable row level security;
alter table activity_logs enable row level security;
alter table leave_types enable row level security;

drop policy if exists "anon read daily rosters for staff live sync" on daily_rosters;
create policy "anon read daily rosters for staff live sync"
on daily_rosters for select
to anon, authenticated
using (true);

drop policy if exists "anon read all leave requests for staff live sync" on leave_requests;
create policy "anon read all leave requests for staff live sync"
on leave_requests for select
to anon, authenticated
using (true);

drop policy if exists "anon read staffsync live messages" on activity_logs;
create policy "anon read staffsync live messages"
on activity_logs for select
to anon, authenticated
using (event_type in ('Leave', 'Attendance'));

drop policy if exists "anon read leave types for staff live sync" on leave_types;
create policy "anon read leave types for staff live sync"
on leave_types for select
to anon, authenticated
using (true);

do $$
begin
  alter publication supabase_realtime add table daily_rosters;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table leave_requests;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table activity_logs;
exception
  when duplicate_object then null;
end $$;
