-- Add foreign key constraint to feedback table to allow joining with profiles
ALTER TABLE public.feedback
DROP CONSTRAINT IF EXISTS feedback_user_id_fkey;

ALTER TABLE public.feedback
ADD CONSTRAINT feedback_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
