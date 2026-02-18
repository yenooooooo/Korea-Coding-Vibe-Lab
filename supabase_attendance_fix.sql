-- Fix 400 Error: Relationship check
-- The error occurs because Supabase properly detects the relationship between 'attendance' and 'profiles' 
-- only if there is a direct Foreign Key constraint.

-- 1. Add Foreign Key constraint to attendance table targeting profiles table
ALTER TABLE attendance
DROP CONSTRAINT IF EXISTS attendance_user_id_fkey; -- Drop existing FK to auth.users if needed (optional, but cleaner to have one)

ALTER TABLE attendance
ADD CONSTRAINT fk_attendance_profiles
FOREIGN KEY (user_id)
REFERENCES profiles (id)
ON DELETE CASCADE;

-- 2. Force schema cache reload (usually automatic, but good to trigger just in case)
NOTIFY pgrst, 'reload config';
