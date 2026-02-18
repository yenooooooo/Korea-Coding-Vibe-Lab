-- =============================================
-- Code SOS (코드 구조대) Tables
-- =============================================

-- SOS 질문 테이블
CREATE TABLE IF NOT EXISTS sos_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  code_snippet TEXT,
  language TEXT DEFAULT 'javascript',
  is_solved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SOS 솔루션 테이블
CREATE TABLE IF NOT EXISTS sos_solutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES sos_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책
ALTER TABLE sos_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sos_solutions ENABLE ROW LEVEL SECURITY;

-- 모든 유저 읽기 가능
CREATE POLICY "Anyone can read sos posts" ON sos_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can read sos solutions" ON sos_solutions FOR SELECT USING (true);

-- 로그인 유저만 작성 가능
CREATE POLICY "Authenticated users can create sos posts" ON sos_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create solutions" ON sos_solutions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 본인만 수정 가능
CREATE POLICY "Users can update own sos posts" ON sos_posts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Post owner can update solutions" ON sos_solutions
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM sos_posts WHERE id = sos_solutions.post_id
    )
  );

NOTIFY pgrst, 'reload config';
