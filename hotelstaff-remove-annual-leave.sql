-- StaffSync Hotel: remove Annual leave from available leave types.
-- Run once in Supabase SQL Editor if Annual leave already exists in your project.

delete from leave_types
where lower(name) = 'annual leave';
