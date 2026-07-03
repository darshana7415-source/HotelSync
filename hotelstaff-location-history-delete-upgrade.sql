-- StaffSync upgrade: allow saved GPS/location history to be deleted from the app.
-- Run once in Supabase SQL Editor if "Delete location history" says cloud delete is blocked.

alter table location_pings enable row level security;

drop policy if exists "anon delete location pings for staff app" on location_pings;
create policy "anon delete location pings for staff app"
on location_pings for delete
to anon
using (true);

drop policy if exists "authenticated delete location pings for managers" on location_pings;
create policy "authenticated delete location pings for managers"
on location_pings for delete
to authenticated
using (true);
