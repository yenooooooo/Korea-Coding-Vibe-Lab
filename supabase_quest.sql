-- ============================================
-- Quest System Schema
-- ============================================

-- 1. quests: 퀘스트 정의 마스터 테이블
CREATE TABLE IF NOT EXISTS quests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  quest_type TEXT NOT NULL CHECK (quest_type IN ('daily', 'weekly', 'season')),
  condition_type TEXT NOT NULL CHECK (condition_type IN (
    'attendance', 'board_post', 'board_comment', 'vs_vote',
    'sos_solution', 'forest_post', 'badge_earn', 'point_earn'
  )),
  condition_value INT NOT NULL DEFAULT 1,
  reward_points INT NOT NULL DEFAULT 5,
  is_active BOOLEAN DEFAULT true
);

-- 2. user_quests: 유저별 퀘스트 진행 테이블
CREATE TABLE IF NOT EXISTS user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  quest_id TEXT REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  progress INT DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  is_reward_claimed BOOLEAN DEFAULT false,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_quests_user_id ON user_quests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quests_period ON user_quests(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_user_quests_quest_type ON user_quests(user_id, quest_id);

-- ============================================
-- RLS 정책
-- ============================================
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;

-- quests: 모든 사용자 읽기 가능
DROP POLICY IF EXISTS "quests_select_all" ON quests;
CREATE POLICY "quests_select_all" ON quests
  FOR SELECT USING (true);

-- user_quests: 본인 데이터만 조회
DROP POLICY IF EXISTS "user_quests_select_own" ON user_quests;
CREATE POLICY "user_quests_select_own" ON user_quests
  FOR SELECT USING (auth.uid() = user_id);

-- user_quests: 본인 데이터만 수정 (보상 수령 등)
DROP POLICY IF EXISTS "user_quests_update_own" ON user_quests;
CREATE POLICY "user_quests_update_own" ON user_quests
  FOR UPDATE USING (auth.uid() = user_id);

-- user_quests: INSERT는 서버 함수(SECURITY DEFINER)로만 수행
-- 아래 함수들이 SECURITY DEFINER로 INSERT 처리

-- ============================================
-- 시드 데이터: 퀘스트 정의
-- ============================================
INSERT INTO quests (id, title, description, icon, quest_type, condition_type, condition_value, reward_points) VALUES
  -- 일일 퀘스트 풀 (6개 중 3~4개 랜덤 배정)
  ('DAILY_ATTENDANCE', '출석 체크하기', '오늘 출석 체크를 완료하세요', '📋', 'daily', 'attendance', 1, 5),
  ('DAILY_POST', '게시글 1개 작성', '커뮤니티에 게시글을 작성하세요', '✏️', 'daily', 'board_post', 1, 10),
  ('DAILY_VS_VOTE', 'VS 투표 참여', 'VS 토론에 투표하세요', '⚔️', 'daily', 'vs_vote', 1, 5),
  ('DAILY_SOS_ANSWER', 'SOS 답변 달기', 'SOS 질문에 답변을 달아주세요', '🆘', 'daily', 'sos_solution', 1, 15),
  ('DAILY_FOREST', '대나무숲 글 쓰기', '대나무숲에 익명 글을 작성하세요', '🎋', 'daily', 'forest_post', 1, 5),
  ('DAILY_COMMENT', '댓글 2개 작성', '게시글에 댓글을 2개 작성하세요', '💬', 'daily', 'board_comment', 2, 10),
  -- 주간 퀘스트 풀 (3개 배정)
  ('WEEKLY_5DAY', '5일 출석 달성', '이번 주에 5일 이상 출석하세요', '🔥', 'weekly', 'attendance', 5, 50),
  ('WEEKLY_5POST', '게시글 5개 작성', '이번 주에 게시글을 5개 작성하세요', '📝', 'weekly', 'board_post', 5, 40),
  ('WEEKLY_3SOS', 'SOS 3개 해결', '이번 주에 SOS 답변을 3개 작성하세요', '🛟', 'weekly', 'sos_solution', 3, 60),
  -- 시즌 퀘스트 (3개 배정)
  ('SEASON_2BADGE', '뱃지 2개 획득', '이번 시즌에 새로운 뱃지 2개를 획득하세요', '🏅', 'season', 'badge_earn', 2, 200),
  ('SEASON_500P', '총 500P 적립', '이번 시즌 동안 500P를 적립하세요', '💰', 'season', 'point_earn', 500, 100),
  ('SEASON_20DAY', '20일 출석', '이번 시즌 동안 20일 출석하세요', '📅', 'season', 'attendance', 20, 300)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 헬퍼: KST 기준 날짜 계산 함수들
-- ============================================

-- KST 기준 오늘 날짜
CREATE OR REPLACE FUNCTION get_today_kst()
RETURNS DATE AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE 'Asia/Seoul')::DATE;
END;
$$ LANGUAGE plpgsql STABLE;

-- KST 기준 이번 주 월요일
CREATE OR REPLACE FUNCTION get_week_start_kst()
RETURNS DATE AS $$
DECLARE
  today DATE;
  dow INT;
BEGIN
  today := get_today_kst();
  dow := EXTRACT(ISODOW FROM today)::INT;  -- 1=월 ~ 7=일
  RETURN today - (dow - 1);
END;
$$ LANGUAGE plpgsql STABLE;

-- KST 기준 이번 달 1일
CREATE OR REPLACE FUNCTION get_season_start_kst()
RETURNS DATE AS $$
BEGIN
  RETURN DATE_TRUNC('month', get_today_kst())::DATE;
END;
$$ LANGUAGE plpgsql STABLE;

-- KST 기준 이번 달 마지막 날
CREATE OR REPLACE FUNCTION get_season_end_kst()
RETURNS DATE AS $$
BEGIN
  RETURN (DATE_TRUNC('month', get_today_kst()) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- 퀘스트 배정 함수들 (SECURITY DEFINER)
-- ============================================

-- 일일 퀘스트 배정: daily 풀에서 4개 랜덤
CREATE OR REPLACE FUNCTION assign_daily_quests(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  today DATE;
  existing INT;
BEGIN
  today := get_today_kst();

  -- 이미 오늘 배정된 일일 퀘스트가 있는지 확인
  SELECT COUNT(*) INTO existing
  FROM user_quests uq
  JOIN quests q ON q.id = uq.quest_id
  WHERE uq.user_id = p_user_id
    AND q.quest_type = 'daily'
    AND uq.period_start = today;

  IF existing > 0 THEN
    RETURN; -- 이미 배정됨
  END IF;

  -- daily 풀에서 4개 랜덤 선택하여 INSERT
  INSERT INTO user_quests (user_id, quest_id, period_start, period_end)
  SELECT p_user_id, q.id, today, today
  FROM quests q
  WHERE q.quest_type = 'daily' AND q.is_active = true
  ORDER BY RANDOM()
  LIMIT 4;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 주간 퀘스트 배정: weekly 풀에서 3개
CREATE OR REPLACE FUNCTION assign_weekly_quests(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  week_start DATE;
  week_end DATE;
  existing INT;
BEGIN
  week_start := get_week_start_kst();
  week_end := week_start + 6;

  SELECT COUNT(*) INTO existing
  FROM user_quests uq
  JOIN quests q ON q.id = uq.quest_id
  WHERE uq.user_id = p_user_id
    AND q.quest_type = 'weekly'
    AND uq.period_start = week_start;

  IF existing > 0 THEN
    RETURN;
  END IF;

  INSERT INTO user_quests (user_id, quest_id, period_start, period_end)
  SELECT p_user_id, q.id, week_start, week_end
  FROM quests q
  WHERE q.quest_type = 'weekly' AND q.is_active = true
  ORDER BY RANDOM()
  LIMIT 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 시즌 퀘스트 배정: season 풀에서 3개
CREATE OR REPLACE FUNCTION assign_season_quests(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  s_start DATE;
  s_end DATE;
  existing INT;
BEGIN
  s_start := get_season_start_kst();
  s_end := get_season_end_kst();

  SELECT COUNT(*) INTO existing
  FROM user_quests uq
  JOIN quests q ON q.id = uq.quest_id
  WHERE uq.user_id = p_user_id
    AND q.quest_type = 'season'
    AND uq.period_start = s_start;

  IF existing > 0 THEN
    RETURN;
  END IF;

  INSERT INTO user_quests (user_id, quest_id, period_start, period_end)
  SELECT p_user_id, q.id, s_start, s_end
  FROM quests q
  WHERE q.quest_type = 'season' AND q.is_active = true
  ORDER BY RANDOM()
  LIMIT 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 퀘스트 보상 수령 함수
-- ============================================
CREATE OR REPLACE FUNCTION claim_quest_reward(p_user_quest_id UUID)
RETURNS JSON AS $$
DECLARE
  uq RECORD;
  q RECORD;
  bonus INT := 0;
  total_reward INT;
  daily_all_done BOOLEAN := false;
  weekly_all_done BOOLEAN := false;
  season_all_done BOOLEAN := false;
BEGIN
  -- user_quest 조회
  SELECT * INTO uq FROM user_quests WHERE id = p_user_quest_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Quest not found');
  END IF;

  IF NOT uq.is_completed THEN
    RETURN json_build_object('success', false, 'error', 'Quest not completed');
  END IF;

  IF uq.is_reward_claimed THEN
    RETURN json_build_object('success', false, 'error', 'Reward already claimed');
  END IF;

  -- quest 정보 조회
  SELECT * INTO q FROM quests WHERE id = uq.quest_id;

  -- 보상 수령 처리
  UPDATE user_quests SET is_reward_claimed = true WHERE id = p_user_quest_id;

  -- 포인트 지급
  total_reward := q.reward_points;
  UPDATE profiles SET total_points = COALESCE(total_points, 0) + total_reward, points = COALESCE(points, 0) + total_reward WHERE id = auth.uid();

  -- 올클리어 체크: 같은 기간, 같은 타입 퀘스트가 모두 완료+수령됐는지
  IF q.quest_type = 'daily' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM user_quests uq2
      JOIN quests q2 ON q2.id = uq2.quest_id
      WHERE uq2.user_id = auth.uid()
        AND q2.quest_type = 'daily'
        AND uq2.period_start = uq.period_start
        AND (uq2.is_completed = false OR uq2.is_reward_claimed = false)
    ) INTO daily_all_done;

    IF daily_all_done THEN
      bonus := 20;
      UPDATE profiles SET total_points = COALESCE(total_points, 0) + bonus, points = COALESCE(points, 0) + bonus WHERE id = auth.uid();
    END IF;
  ELSIF q.quest_type = 'weekly' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM user_quests uq2
      JOIN quests q2 ON q2.id = uq2.quest_id
      WHERE uq2.user_id = auth.uid()
        AND q2.quest_type = 'weekly'
        AND uq2.period_start = uq.period_start
        AND (uq2.is_completed = false OR uq2.is_reward_claimed = false)
    ) INTO weekly_all_done;

    IF weekly_all_done THEN
      bonus := 100;
      UPDATE profiles SET total_points = COALESCE(total_points, 0) + bonus, points = COALESCE(points, 0) + bonus WHERE id = auth.uid();
    END IF;
  ELSIF q.quest_type = 'season' THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM user_quests uq2
      JOIN quests q2 ON q2.id = uq2.quest_id
      WHERE uq2.user_id = auth.uid()
        AND q2.quest_type = 'season'
        AND uq2.period_start = uq.period_start
        AND (uq2.is_completed = false OR uq2.is_reward_claimed = false)
    ) INTO season_all_done;

    IF season_all_done THEN
      bonus := 300;
      UPDATE profiles SET total_points = COALESCE(total_points, 0) + bonus, points = COALESCE(points, 0) + bonus WHERE id = auth.uid();
    END IF;
  END IF;

  RETURN json_build_object(
    'success', true,
    'reward', total_reward,
    'bonus', bonus,
    'all_clear', (daily_all_done OR weekly_all_done OR season_all_done)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 퀘스트 진행도 업데이트 함수 (트리거용)
-- ============================================
CREATE OR REPLACE FUNCTION update_quest_progress(p_user_id UUID, p_condition_type TEXT)
RETURNS VOID AS $$
DECLARE
  today DATE;
BEGIN
  today := get_today_kst();

  -- 해당 condition_type의 미완료 퀘스트 progress +1
  UPDATE user_quests uq
  SET
    progress = progress + 1,
    is_completed = CASE
      WHEN progress + 1 >= (SELECT condition_value FROM quests WHERE id = uq.quest_id)
      THEN true ELSE false
    END,
    completed_at = CASE
      WHEN progress + 1 >= (SELECT condition_value FROM quests WHERE id = uq.quest_id)
      THEN NOW() ELSE NULL
    END
  FROM quests q
  WHERE uq.quest_id = q.id
    AND uq.user_id = p_user_id
    AND q.condition_type = p_condition_type
    AND uq.is_completed = false
    AND today BETWEEN uq.period_start AND uq.period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 트리거 함수들
-- ============================================

-- attendance INSERT 트리거
CREATE OR REPLACE FUNCTION trigger_quest_attendance()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_quest_progress(NEW.user_id, 'attendance');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_quest_attendance ON attendance;
CREATE TRIGGER trg_quest_attendance
  AFTER INSERT ON attendance
  FOR EACH ROW EXECUTE FUNCTION trigger_quest_attendance();

-- board_posts INSERT 트리거
CREATE OR REPLACE FUNCTION trigger_quest_board_post()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_quest_progress(NEW.user_id, 'board_post');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_quest_board_post ON board_posts;
CREATE TRIGGER trg_quest_board_post
  AFTER INSERT ON board_posts
  FOR EACH ROW EXECUTE FUNCTION trigger_quest_board_post();

-- board_comments INSERT 트리거
CREATE OR REPLACE FUNCTION trigger_quest_board_comment()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_quest_progress(NEW.user_id, 'board_comment');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_quest_board_comment ON board_comments;
CREATE TRIGGER trg_quest_board_comment
  AFTER INSERT ON board_comments
  FOR EACH ROW EXECUTE FUNCTION trigger_quest_board_comment();

-- vs_votes INSERT 트리거
CREATE OR REPLACE FUNCTION trigger_quest_vs_vote()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_quest_progress(NEW.user_id, 'vs_vote');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_quest_vs_vote ON vs_votes;
CREATE TRIGGER trg_quest_vs_vote
  AFTER INSERT ON vs_votes
  FOR EACH ROW EXECUTE FUNCTION trigger_quest_vs_vote();

-- sos_solutions INSERT 트리거
CREATE OR REPLACE FUNCTION trigger_quest_sos_solution()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_quest_progress(NEW.user_id, 'sos_solution');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_quest_sos_solution ON sos_solutions;
CREATE TRIGGER trg_quest_sos_solution
  AFTER INSERT ON sos_solutions
  FOR EACH ROW EXECUTE FUNCTION trigger_quest_sos_solution();

-- forest_posts INSERT 트리거
CREATE OR REPLACE FUNCTION trigger_quest_forest_post()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_quest_progress(NEW.user_id, 'forest_post');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_quest_forest_post ON forest_posts;
CREATE TRIGGER trg_quest_forest_post
  AFTER INSERT ON forest_posts
  FOR EACH ROW EXECUTE FUNCTION trigger_quest_forest_post();

-- ============================================
-- Realtime 활성화
-- ============================================
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_quests;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
