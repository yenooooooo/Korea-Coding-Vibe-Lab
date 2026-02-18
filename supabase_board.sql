-- =============================================
-- Vibe Square (Free Board) Tables
-- =============================================

-- 1. board_posts Table
CREATE TABLE IF NOT EXISTS board_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('free', 'qna', 'tip', 'project')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. board_comments Table
CREATE TABLE IF NOT EXISTS board_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES board_comments(id) ON DELETE CASCADE, -- For nested comments
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. board_likes Table (Prevent duplicate likes)
CREATE TABLE IF NOT EXISTS board_likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES board_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_board_posts_user_id ON board_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_board_posts_created_at ON board_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_board_comments_post_id ON board_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_board_comments_parent_id ON board_comments(parent_id);

-- RLS Policies
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_likes ENABLE ROW LEVEL SECURITY;

-- Public READ
CREATE POLICY "Public can view posts" ON board_posts FOR SELECT USING (true);
CREATE POLICY "Public can view comments" ON board_comments FOR SELECT USING (true);
CREATE POLICY "Public can view likes" ON board_likes FOR SELECT USING (true);

-- Authenticated CREATE
CREATE POLICY "Authenticated users can create posts" ON board_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create comments" ON board_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can like posts" ON board_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Owner UPDATE/DELETE
CREATE POLICY "Users can update own posts" ON board_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON board_posts FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON board_comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can unzip like" ON board_likes FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update likes count in board_posts
CREATE OR REPLACE FUNCTION update_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE board_posts SET likes = likes + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE board_posts SET likes = likes - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes
AFTER INSERT OR DELETE ON board_likes
FOR EACH ROW EXECUTE FUNCTION update_post_likes();

-- Trigger for Gamification (Optional: Giving XP)
-- Note: This requires existing increment_points function or similar logic. 
-- For now, we'll keep it simple and handle XP in frontend or safe edge function.

-- Reload schema cache
NOTIFY pgrst, 'reload config';
