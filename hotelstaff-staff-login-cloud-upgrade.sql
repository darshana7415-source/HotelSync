-- StaffSync upgrade: cloud staff code/password login.
-- Run this once in Supabase SQL editor before using staff login from many phones.

create table if not exists staff_login_passwords (
  staff_profile_id uuid primary key references staff_profiles(id) on delete cascade,
  password_hash text not null,
  reset_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table staff_login_passwords enable row level security;

drop policy if exists "anon read staff profiles for login" on staff_profiles;
create policy "anon read staff profiles for login"
on staff_profiles for select
to anon
using (true);

drop policy if exists "anon read departments for login" on departments;
create policy "anon read departments for login"
on departments for select
to anon
using (true);

drop policy if exists "anon read users for login" on app_users;
create policy "anon read users for login"
on app_users for select
to anon
using (true);

drop policy if exists "anon read staff login passwords" on staff_login_passwords;
create policy "anon read staff login passwords"
on staff_login_passwords for select
to anon
using (true);

drop policy if exists "anon write staff login passwords" on staff_login_passwords;
create policy "anon write staff login passwords"
on staff_login_passwords for all
to anon
using (true)
with check (true);

drop policy if exists "authenticated manage staff login passwords" on staff_login_passwords;
create policy "authenticated manage staff login passwords"
on staff_login_passwords for all
to authenticated
using (true)
with check (true);

drop policy if exists "anon read leave types for staff login" on leave_types;
create policy "anon read leave types for staff login"
on leave_types for select
to anon
using (true);

drop policy if exists "anon read leave requests for staff login" on leave_requests;
create policy "anon read leave requests for staff login"
on leave_requests for select
to anon
using (true);

drop policy if exists "anon write leave requests for staff login" on leave_requests;
create policy "anon write leave requests for staff login"
on leave_requests for all
to anon
using (true)
with check (true);

drop policy if exists "anon read leave answers for staff login" on activity_logs;
create policy "anon read leave answers for staff login"
on activity_logs for select
to anon
using (event_type = 'Leave');

drop policy if exists "anon write leave activity for staff login" on activity_logs;
create policy "anon write leave activity for staff login"
on activity_logs for insert
to anon
with check (event_type = 'Leave');

drop policy if exists "anon read attendance for staff login" on attendance_records;
create policy "anon read attendance for staff login"
on attendance_records for select
to anon
using (true);

drop policy if exists "anon write attendance for staff login" on attendance_records;
create policy "anon write attendance for staff login"
on attendance_records for all
to anon
using (true)
with check (true);

drop policy if exists "anon read location pings for staff login" on location_pings;
create policy "anon read location pings for staff login"
on location_pings for select
to anon
using (true);

drop policy if exists "anon write location pings for staff login" on location_pings;
create policy "anon write location pings for staff login"
on location_pings for all
to anon
using (true)
with check (true);
