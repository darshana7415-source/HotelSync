-- StaffSync v113: clear testing leave requests and communication logs.
-- Keeps staff_profiles, app_users, departments, staff passwords, and shift rosters intact.

delete from staffsync_leave_messages;

delete from activity_logs
where event_type in ('Leave', 'Shift', 'Attendance', 'Clock', 'Break', 'System');

delete from leave_requests;

-- Optional check: staff list remains, shown by employee code order.
select id, employee_code, full_name
from staff_profiles
where lower(employee_code) not like '%-removed-%'
order by
  nullif(regexp_replace(employee_code, '\D', '', 'g'), '')::int nulls last,
  employee_code,
  full_name;
