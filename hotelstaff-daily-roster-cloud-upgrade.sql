create table if not exists daily_rosters (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references hotels(id) on delete cascade,
  staff_profile_id uuid not null references staff_profiles(id) on delete cascade,
  roster_date date not null,
  shift_name text not null default 'Varied 10h',
  in_time time not null default '00:00',
  out_time time not null default '00:00',
  day_status text not null default 'Working',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (staff_profile_id, roster_date)
);

create index if not exists daily_rosters_hotel_date_idx
on daily_rosters(hotel_id, roster_date);

alter table daily_rosters enable row level security;

drop policy if exists "authenticated read daily rosters" on daily_rosters;
drop policy if exists "authenticated write daily rosters" on daily_rosters;

create policy "authenticated read daily rosters"
on daily_rosters for select to authenticated
using (true);

create policy "authenticated write daily rosters"
on daily_rosters for all to authenticated
using (true)
with check (true);
