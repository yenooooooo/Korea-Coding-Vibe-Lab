-- =============================================
-- Vibe VS (밸런스 게임) Tables
-- =============================================

-- VS 배틀 테이블
CREATE TABLE IF NOT EXISTS vs_battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VS 투표 테이블
CREATE TABLE IF NOT EXISTS vs_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES vs_battles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  choice TEXT CHECK (choice IN ('A', 'B')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(battle_id, user_id)
);

-- RLS 정책
ALTER TABLE vs_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vs_votes ENABLE ROW LEVEL SECURITY;

-- 모든 유저 읽기 가능
CREATE POLICY "Anyone can read vs battles" ON vs_battles FOR SELECT USING (true);
CREATE POLICY "Anyone can read vs votes" ON vs_votes FOR SELECT USING (true);

-- 로그인 유저만 투표 가능
CREATE POLICY "Authenticated users can vote" ON vs_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vote" ON vs_votes
  FOR UPDATE USING (auth.uid() = user_id);

-- 초기 배틀 데이터 삽입 (예시)
INSERT INTO vs_battles (option_a, option_b, active) VALUES
  ('평생 마우스 없이 코딩', '평생 모니터 1개로 코딩', true),
  ('탭으로 들여쓰기', '스페이스로 들여쓰기', false),
  ('주석 100줄 vs 변수명 길게', '주석 0줄 vs 변수명 짧게', false),
  ('야근해서 빨리 끝내기', '정시퇴근하고 주말에 하기', false),
  ('AI가 짠 코드 디버깅', '처음부터 내가 짜기', false)
ON CONFLICT DO NOTHING;

NOTIFY pgrst, 'reload config';
