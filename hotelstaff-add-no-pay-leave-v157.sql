-- StaffSync Beach & Bliss Mirissa
-- Add NO PAY leave type to Supabase.

insert into leave_types (hotel_id, name)
select h.id, 'NO PAY leave'
from hotels h
where not exists (
  select 1
  from leave_types lt
  where lt.hotel_id = h.id
    and lower(lt.name) = lower('NO PAY leave')
);

select hotel_id, name
from leave_types
where lower(name) = lower('NO PAY leave')
order by name;
