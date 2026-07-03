-- StaffSync permanent live message repair.
-- Run once in Supabase SQL Editor if leave chat, approvals, or shift chat say "sent"
-- but do not appear on the other device.

alter table activity_logs enable row level security;
alter table leave_requests enable row level security;
alter table daily_rosters enable row level security;

drop policy if exists "staffsync live read activity logs" on activity_logs;
create policy "staffsync live read activity logs"
on activity_logs for select
to anon, authenticated
using (event_type in ('Leave', 'Attendance', 'Shift'));

drop policy if exists "staffsync live write activity logs" on activity_logs;
create policy "staffsync live write activity logs"
on activity_logs for insert
to anon, authenticated
with check (event_type in ('Leave', 'Attendance', 'Shift'));

drop policy if exists "staffsync live read leave requests" on leave_requests;
create policy "staffsync live read leave requests"
on leave_requests for select
to anon, authenticated
using (true);

drop policy if exists "staffsync live write leave requests" on leave_requests;
create policy "staffsync live write leave requests"
on leave_requests for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "staffsync live read daily rosters" on daily_rosters;
create policy "staffsync live read daily rosters"
on daily_rosters for select
to anon, authenticated
using (true);

do $$
begin
  alter publication supabase_realtime add table activity_logs;
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
  alter publication supabase_realtime add table daily_rosters;
exception
  when duplicate_object then null;
end $$;
