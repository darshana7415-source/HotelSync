-- StaffSync v171: Store Keeper role + given/received-by + per-entry units for Supplies
-- Already applied directly to the live Supabase project; kept here for the record,
-- matching this repo's convention of one file per upgrade.

-- 1. New role. Must be committed before the value is usable elsewhere (run this
--    statement on its own first if replaying manually).
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'store_keeper';

-- 2. Promote Nipuni (employee code 24, already job-titled "Store Keeper") to the
--    new role. Her app_users.id -- look it up again if replaying on another project.
UPDATE public.app_users SET role = 'store_keeper'
WHERE id = (
  SELECT user_id FROM public.staff_profiles WHERE employee_code = '24'
);

-- 3. supply_distributions: the column that used to mean "who took it" (self-logged
--    by staff) now means "who received it" (logged by the Store Keeper on their
--    behalf). Renamed for clarity, plus a new "given by" column and a per-entry
--    unit (the same item might be handed out as "2 bottles" one time and "300ml"
--    another).
ALTER TABLE public.supply_distributions RENAME COLUMN staff_profile_id TO received_by_staff_profile_id;
ALTER TABLE public.supply_distributions ADD COLUMN given_by_staff_profile_id uuid REFERENCES public.staff_profiles(id);
ALTER TABLE public.supply_distributions ADD COLUMN unit text;
