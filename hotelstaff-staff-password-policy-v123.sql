-- StaffSync Beach & Bliss Mirissa staff password policy repair.
-- Run this in Supabase SQL Editor if staff password change/login says cloud password check failed.

create table if not exists staff_login_passwords (
  staff_profile_id uuid primary key references staff_profiles(id) on delete cascade,
  password_hash text not null,
  reset_required boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table staff_login_passwords enable row level security;

drop policy if exists "staff password read" on staff_login_passwords;
drop policy if exists "staff password upsert" on staff_login_passwords;

create policy "staff password read"
on staff_login_passwords
for select
using (true);

create policy "staff password upsert"
on staff_login_passwords
for all
using (true)
with check (true);

update staff_login_passwords
set reset_required = true,
    updated_at = now();
