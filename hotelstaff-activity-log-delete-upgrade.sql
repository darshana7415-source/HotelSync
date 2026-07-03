-- StaffSync upgrade: allow deleted chat/history/clock logs to stay deleted after relog.
-- Run once in Supabase SQL Editor if deleted messages return after logging in again.

alter table activity_logs enable row level security;

drop policy if exists "anon delete activity logs for staffsync app" on activity_logs;
create policy "anon delete activity logs for staffsync app"
on activity_logs for delete
to anon
using (true);

drop policy if exists "authenticated delete activity logs for staffsync app" on activity_logs;
create policy "authenticated delete activity logs for staffsync app"
on activity_logs for delete
to authenticated
using (true);
