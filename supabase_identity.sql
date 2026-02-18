-- Developer Identity System
-- Add columns to store user skills

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS main_skill TEXT,
ADD COLUMN IF NOT EXISTS learning_skill TEXT;

-- Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload config';
