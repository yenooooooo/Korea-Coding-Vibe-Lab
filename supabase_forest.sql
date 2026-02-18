-- =============================================
-- Debug Forest (익명 대나무숲) Tables
-- =============================================

-- 익명 게시물 테이블
CREATE TABLE IF NOT EXISTS forest_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  anonymous_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 익명 게시물 리액션 테이블
CREATE TABLE IF NOT EXISTS forest_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES forest_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- RLS 정책
ALTER TABLE forest_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forest_reactions ENABLE ROW LEVEL SECURITY;

-- 모든 유저 읽기 가능
CREATE POLICY "Anyone can read forest posts" ON forest_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can read forest reactions" ON forest_reactions FOR SELECT USING (true);

-- 로그인 유저만 작성/반응 가능
CREATE POLICY "Authenticated users can insert forest posts" ON forest_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can insert forest reactions" ON forest_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own forest reactions" ON forest_reactions
  FOR DELETE USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload config';
