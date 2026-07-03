-- STFFSYNC real-data test cleanup.
-- Run this once in Supabase before testing with actual staff.
-- It clears old history, requests, rosters, and chat logs.

delete from activity_logs;
delete from leave_requests;
delete from attendance_records;
delete from daily_rosters;

-- Optional: keep only one staff member.
-- 1. Change 01 below to the employee code you want to keep.
-- 2. Remove the /* and */ lines around this block.
/*
create temp table remove_staff_for_test as
select id, user_id
from staff_profiles
where id not in (
  select id
  from staff_profiles
  where regexp_replace(employee_code, '\D', '', 'g')::int = 1
  limit 1
);

delete from staff_login_passwords
where staff_profile_id in (select id from remove_staff_for_test);

delete from staff_profiles
where id in (select id from remove_staff_for_test);

delete from app_users
where id in (select user_id from remove_staff_for_test)
  and role = 'staff';

drop table remove_staff_for_test;
*/

select
  (select count(*) from staff_profiles) as staff_count,
  (select count(*) from activity_logs) as activity_log_count,
  (select count(*) from leave_requests) as leave_request_count,
  (select count(*) from attendance_records) as attendance_record_count,
  (select count(*) from daily_rosters) as daily_roster_count;
