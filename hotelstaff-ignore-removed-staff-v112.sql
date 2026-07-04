-- StaffSync v112: make removed staff inactive.
-- Run once in Supabase SQL Editor if removed staff still appear or can login.

update app_users
set status = 'inactive'
where id in (
  select user_id
  from staff_profiles
  where lower(employee_code) like '%-removed-%'
    and user_id is not null
);
