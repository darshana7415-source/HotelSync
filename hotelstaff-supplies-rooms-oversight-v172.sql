-- StaffSync v172: room dropdown + Store Keeper view trimmed to what she needs
-- Already applied directly to the live Supabase project; kept here for the record.

create table public.supply_rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id),
  room_number text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (hotel_id, room_number)
);

alter table public.supply_rooms enable row level security;
create policy "anon full access" on public.supply_rooms for all to anon using (true) with check (true);
create policy "authenticated full access" on public.supply_rooms for all to authenticated using (true) with check (true);

insert into public.supply_rooms (hotel_id, room_number) values
  ('00000000-0000-0000-0000-000000000001','101'),
  ('00000000-0000-0000-0000-000000000001','102'),
  ('00000000-0000-0000-0000-000000000001','103'),
  ('00000000-0000-0000-0000-000000000001','104'),
  ('00000000-0000-0000-0000-000000000001','201'),
  ('00000000-0000-0000-0000-000000000001','202'),
  ('00000000-0000-0000-0000-000000000001','203'),
  ('00000000-0000-0000-0000-000000000001','206'),
  ('00000000-0000-0000-0000-000000000001','207'),
  ('00000000-0000-0000-0000-000000000001','208'),
  ('00000000-0000-0000-0000-000000000001','209'),
  ('00000000-0000-0000-0000-000000000001','210'),
  ('00000000-0000-0000-0000-000000000001','211'),
  ('00000000-0000-0000-0000-000000000001','301'),
  ('00000000-0000-0000-0000-000000000001','302'),
  ('00000000-0000-0000-0000-000000000001','303'),
  ('00000000-0000-0000-0000-000000000001','304'),
  ('00000000-0000-0000-0000-000000000001','305'),
  ('00000000-0000-0000-0000-000000000001','306'),
  ('00000000-0000-0000-0000-000000000001','401'),
  ('00000000-0000-0000-0000-000000000001','402'),
  ('00000000-0000-0000-0000-000000000001','403'),
  ('00000000-0000-0000-0000-000000000001','404'),
  ('00000000-0000-0000-0000-000000000001','405'),
  ('00000000-0000-0000-0000-000000000001','406');

-- No schema change for the date field: supply_distributions.distributed_at was
-- already a plain writeable timestamptz (previously left to its now() default),
-- the app just started sending an explicit value so entries can be backdated.
