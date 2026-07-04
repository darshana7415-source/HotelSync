-- StaffSync Beach & Bliss Mirissa password reset.
-- Run this once in Supabase SQL Editor to make every staff member use first-login password 12345,
-- then choose a new personal password on the app login screen.

update staff_login_passwords
set reset_required = true,
    updated_at = now();
