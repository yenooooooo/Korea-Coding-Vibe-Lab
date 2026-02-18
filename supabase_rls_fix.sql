-- =============================================
-- RLS Fix for Delete Operations
-- =============================================

-- 1. Code SOS: Allow users to delete their own posts and solutions
CREATE POLICY "Users can delete own sos posts" ON sos_posts
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sos solutions" ON sos_solutions
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Debug Forest: Allow users to delete their own anonymous posts
CREATE POLICY "Users can delete own forest posts" ON forest_posts
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Vibe Lounge: Allow users to delete their own messages
CREATE POLICY "Users can delete own messages" ON posts
  FOR DELETE USING (auth.uid() = user_id);


-- Reload schema cache to apply changes immediately
NOTIFY pgrst, 'reload config';
