-- StaffSync admin login repair.
-- Run this if admin login says: "This login is not active in StaffSync."

update app_users
set status = 'active'
where lower(email) in ('admin@test.com', 'front@test.com')
   or role in ('admin', 'manager');

select id, email, role, status
from app_users
where lower(email) in ('admin@test.com', 'front@test.com')
   or role in ('admin', 'manager')
order by role, email;
