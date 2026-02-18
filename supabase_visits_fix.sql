-- Fix Admin Panel 400 Error
-- The 'visits' table references 'auth.users', but the client query tries to join 'profiles'.
-- We need a direct Foreign Key from 'visits.user_id' to 'profiles.id'.

-- 1. Add Foreign Key constraint to visits table targeting profiles table
-- Use ON DELETE SET NULL to keep logs even if user profile is deleted (user_id becomes null)
ALTER TABLE visits
ADD CONSTRAINT fk_visits_profiles
FOREIGN KEY (user_id)
REFERENCES profiles (id)
ON DELETE SET NULL;

-- 2. Force schema cache reload
NOTIFY pgrst, 'reload config';
