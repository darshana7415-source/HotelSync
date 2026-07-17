-- StaffSync Beach & Bliss Mirissa
-- Manager dashboard permission repair for v148.
-- Run this in Supabase SQL Editor if manager login opens but cannot see staff,
-- leave requests, shift messages, clock status, or shift rosters.

do $$
begin
  -- Keep role values normalized if the role column is text or enum.
  begin
    update app_users set role = 'admin' where lower(role::text) = 'admin';
    update app_users set role = 'manager' where lower(role::text) = 'manager';
    update app_users set role = 'staff' where lower(role::text) = 'staff';
  exception
    when others then null;
  end;
end $$;

alter table if exists app_users enable row level security;
alter table if exists departments enable row level security;
alter table if exists staff_profiles enable row level security;
alter table if exists leave_types enable row level security;
alter table if exists leave_requests enable row level security;
alter table if exists activity_logs enable row level security;
alter table if exists attendance_records enable row level security;
alter table if exists location_pings enable row level security;
alter table if exists daily_rosters enable row level security;
alter table if exists staffsync_leave_messages enable row level security;

drop policy if exists "staffsync authenticated read app users v148" on app_users;
create policy "staffsync authenticated read app users v148"
on app_users for select
to authenticated
using (true);

drop policy if exists "staffsync authenticated read departments v148" on departments;
create policy "staffsync authenticated read departments v148"
on departments for select
to authenticated
using (true);

drop policy if exists "staffsync authenticated manage staff profiles v148" on staff_profiles;
create policy "staffsync authenticated manage staff profiles v148"
on staff_profiles for all
to authenticated
using (true)
with check (true);

drop policy if exists "staffsync authenticated read leave types v148" on leave_types;
create policy "staffsync authenticated read leave types v148"
on leave_types for select
to authenticated
using (true);

drop policy if exists "staffsync authenticated manage leave requests v148" on leave_requests;
create policy "staffsync authenticated manage leave requests v148"
on leave_requests for all
to authenticated
using (true)
with check (true);

drop policy if exists "staffsync authenticated manage activity logs v148" on activity_logs;
create policy "staffsync authenticated manage activity logs v148"
on activity_logs for all
to authenticated
using (true)
with check (true);

drop policy if exists "staffsync authenticated manage attendance v148" on attendance_records;
create policy "staffsync authenticated manage attendance v148"
on attendance_records for all
to authenticated
using (true)
with check (true);

drop policy if exists "staffsync authenticated manage location pings v148" on location_pings;
create policy "staffsync authenticated manage location pings v148"
on location_pings for all
to authenticated
using (true)
with check (true);

drop policy if exists "staffsync authenticated manage daily rosters v148" on daily_rosters;
create policy "staffsync authenticated manage daily rosters v148"
on daily_rosters for all
to authenticated
using (true)
with check (true);

drop policy if exists "staffsync authenticated manage leave messages v148" on staffsync_leave_messages;
create policy "staffsync authenticated manage leave messages v148"
on staffsync_leave_messages for all
to authenticated
using (true)
with check (true);

-- Check result: should show admin/manager users.
select id, email, role, status
from app_users
where role::text in ('admin', 'manager')
order by role::text, email;
