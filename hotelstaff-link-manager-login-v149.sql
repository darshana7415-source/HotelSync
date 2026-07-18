-- StaffSync Beach & Bliss Mirissa
-- Link Supabase Auth user manager@staffsync.test to StaffSync manager access.
-- Run this after creating the user in Supabase Authentication.

do $$
declare
  manager_auth_id uuid;
  manager_app_user_id uuid;
  target_hotel_id uuid;
begin
  select id
    into manager_auth_id
  from auth.users
  where lower(email) = 'manager@staffsync.test'
  order by created_at desc
  limit 1;

  if manager_auth_id is null then
    raise exception 'No Supabase Auth user found for manager@staffsync.test. Create that user first in Authentication > Users.';
  end if;

  select hotel_id
    into target_hotel_id
  from app_users
  where hotel_id is not null
  order by created_at nulls last
  limit 1;

  if target_hotel_id is null then
    select id
      into target_hotel_id
    from hotels
    order by created_at nulls last
    limit 1;
  end if;

  if target_hotel_id is null then
    raise exception 'No hotel found. StaffSync needs one hotel row before linking manager login.';
  end if;

  select id
    into manager_app_user_id
  from app_users
  where auth_user_id = manager_auth_id
     or lower(coalesce(email, '')) = 'manager@staffsync.test'
     or lower(role::text) = 'manager'
  order by
    case
      when auth_user_id = manager_auth_id then 1
      when lower(coalesce(email, '')) = 'manager@staffsync.test' then 2
      else 3
    end
  limit 1;

  if manager_app_user_id is null then
    insert into app_users (hotel_id, auth_user_id, email, role, status)
    values (target_hotel_id, manager_auth_id, 'manager@staffsync.test', 'manager', 'active')
    returning id into manager_app_user_id;
  else
    update app_users
       set hotel_id = target_hotel_id,
           auth_user_id = manager_auth_id,
           email = 'manager@staffsync.test',
           role = 'manager',
           status = 'active'
     where id = manager_app_user_id;
  end if;
end $$;

select id, email, auth_user_id, role, status
from app_users
where lower(email) = 'manager@staffsync.test'
   or lower(role::text) = 'manager'
order by email;
