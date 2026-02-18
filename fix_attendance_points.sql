-- =============================================
-- Fix Attendance Points Logic
-- =============================================

-- 1. Ensure 'points' column exists in profiles
-- (balance for shopping)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='points'
    ) THEN
        ALTER TABLE profiles ADD COLUMN points INT DEFAULT 0;
    END IF;
END $$;

-- 2. Update handle_new_attendance function to increment points
CREATE OR REPLACE FUNCTION handle_new_attendance()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  new_streak INT;
  earned_points INT;
BEGIN
  -- Get user's last check-in date from profiles
  SELECT last_check_in INTO last_date FROM profiles WHERE id = new.user_id;

  -- Calculate streak
  IF last_date = (new.check_in_date - INTERVAL '1 day') THEN
    -- Consecutive day: increment streak
    new_streak := COALESCE((SELECT current_streak FROM profiles WHERE id = new.user_id), 0) + 1;
  ELSE
    -- Missed day or first time: reset to 1
    new_streak := 1;
  END IF;

  -- Base points from new record (default 10)
  earned_points := new.points;

  -- Update profiles
  -- Increase BOTH total_points (Lifetime/Level) AND points (Spendable Balance)
  UPDATE profiles
  SET 
    current_streak = new_streak,
    max_streak = GREATEST(max_streak, new_streak),
    last_check_in = new.check_in_date,
    total_points = total_points + earned_points,
    points = COALESCE(points, 0) + earned_points
  WHERE id = new.user_id;

  RETURN new;
END;
$$ LANGUAGE plpgsql;
