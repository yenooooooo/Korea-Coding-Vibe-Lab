-- ============================================
-- Battle Arena System Schema
-- ============================================

-- 1. battle_problems: 배틀 문제 마스터 테이블
CREATE TABLE IF NOT EXISTS battle_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT NOT NULL CHECK (category IN ('algorithm', 'optimization', 'bugfix', 'creative')),
  language_hint TEXT DEFAULT 'javascript',
  starter_code TEXT DEFAULT '',
  time_limit_seconds INT NOT NULL DEFAULT 300,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. battle_rooms: 배틀 방
CREATE TABLE IF NOT EXISTS battle_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  problem_id UUID REFERENCES battle_problems(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'countdown', 'playing', 'reviewing', 'finished', 'cancelled')),
  time_limit INT NOT NULL DEFAULT 300,
  host_ready BOOLEAN DEFAULT false,
  guest_ready BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  winner_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. battle_submissions: 코드 제출
CREATE TABLE IF NOT EXISTS battle_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES battle_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ,
  is_winner BOOLEAN DEFAULT false,
  UNIQUE(room_id, user_id)
);

-- 4. battle_votes: 투표
CREATE TABLE IF NOT EXISTS battle_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES battle_rooms(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  voted_for_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, voter_id)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_battle_rooms_status ON battle_rooms(status);
CREATE INDEX IF NOT EXISTS idx_battle_rooms_host ON battle_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_battle_submissions_room ON battle_submissions(room_id);
CREATE INDEX IF NOT EXISTS idx_battle_votes_room ON battle_votes(room_id);

-- ============================================
-- RLS 정책
-- ============================================
ALTER TABLE battle_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_votes ENABLE ROW LEVEL SECURITY;

-- battle_problems: 모든 사용자 읽기 가능
CREATE POLICY "battle_problems_select_all" ON battle_problems
  FOR SELECT USING (true);

-- battle_rooms: 모든 사용자 읽기 가능 (로비/관전)
CREATE POLICY "battle_rooms_select_all" ON battle_rooms
  FOR SELECT USING (true);

-- battle_rooms: 호스트만 생성
CREATE POLICY "battle_rooms_insert_host" ON battle_rooms
  FOR INSERT WITH CHECK (auth.uid() = host_id);

-- battle_rooms: 참가자만 수정
CREATE POLICY "battle_rooms_update_participant" ON battle_rooms
  FOR UPDATE USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- battle_submissions: 모든 사용자 읽기 가능 (관전/리뷰)
CREATE POLICY "battle_submissions_select_all" ON battle_submissions
  FOR SELECT USING (true);

-- battle_submissions: 본인만 INSERT/UPDATE
CREATE POLICY "battle_submissions_insert_own" ON battle_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "battle_submissions_update_own" ON battle_submissions
  FOR UPDATE USING (auth.uid() = user_id);

-- battle_votes: 모든 사용자 읽기 가능
CREATE POLICY "battle_votes_select_all" ON battle_votes
  FOR SELECT USING (true);

-- battle_votes: 본인만 투표
CREATE POLICY "battle_votes_insert_own" ON battle_votes
  FOR INSERT WITH CHECK (auth.uid() = voter_id);

-- ============================================
-- SECURITY DEFINER 함수들
-- ============================================

-- 1. join_battle_room: 게스트 참가
CREATE OR REPLACE FUNCTION join_battle_room(p_room_id UUID)
RETURNS JSON AS $$
DECLARE
  room RECORD;
BEGIN
  SELECT * INTO room FROM battle_rooms WHERE id = p_room_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Room not found');
  END IF;

  IF room.status != 'waiting' THEN
    RETURN json_build_object('success', false, 'error', 'Room is not waiting');
  END IF;

  IF room.host_id = auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'Cannot join own room');
  END IF;

  IF room.guest_id IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Room is full');
  END IF;

  UPDATE battle_rooms
  SET guest_id = auth.uid(), status = 'ready'
  WHERE id = p_room_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. toggle_battle_ready: 레디 토글
CREATE OR REPLACE FUNCTION toggle_battle_ready(p_room_id UUID)
RETURNS JSON AS $$
DECLARE
  room RECORD;
BEGIN
  SELECT * INTO room FROM battle_rooms WHERE id = p_room_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Room not found');
  END IF;

  IF room.status NOT IN ('ready') THEN
    RETURN json_build_object('success', false, 'error', 'Cannot toggle ready in current status');
  END IF;

  IF auth.uid() = room.host_id THEN
    UPDATE battle_rooms SET host_ready = NOT host_ready WHERE id = p_room_id;
  ELSIF auth.uid() = room.guest_id THEN
    UPDATE battle_rooms SET guest_ready = NOT guest_ready WHERE id = p_room_id;
  ELSE
    RETURN json_build_object('success', false, 'error', 'Not a participant');
  END IF;

  -- 양쪽 모두 레디시 countdown 전환
  SELECT * INTO room FROM battle_rooms WHERE id = p_room_id;
  IF room.host_ready AND room.guest_ready THEN
    UPDATE battle_rooms SET status = 'countdown' WHERE id = p_room_id;
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. start_battle: 호스트가 호출, playing 전환 + 빈 submission 생성
CREATE OR REPLACE FUNCTION start_battle(p_room_id UUID)
RETURNS JSON AS $$
DECLARE
  room RECORD;
BEGIN
  SELECT * INTO room FROM battle_rooms WHERE id = p_room_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Room not found');
  END IF;

  IF room.status != 'countdown' THEN
    RETURN json_build_object('success', false, 'error', 'Not in countdown');
  END IF;

  IF auth.uid() != room.host_id THEN
    RETURN json_build_object('success', false, 'error', 'Only host can start');
  END IF;

  -- playing 전환
  UPDATE battle_rooms
  SET status = 'playing', started_at = NOW()
  WHERE id = p_room_id;

  -- 양쪽 빈 submission 생성
  INSERT INTO battle_submissions (room_id, user_id, code)
  VALUES (p_room_id, room.host_id, '')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  INSERT INTO battle_submissions (room_id, user_id, code)
  VALUES (p_room_id, room.guest_id, '')
  ON CONFLICT (room_id, user_id) DO NOTHING;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. submit_battle_code: 코드 제출
CREATE OR REPLACE FUNCTION submit_battle_code(p_room_id UUID, p_code TEXT)
RETURNS JSON AS $$
DECLARE
  room RECORD;
  both_submitted BOOLEAN;
BEGIN
  SELECT * INTO room FROM battle_rooms WHERE id = p_room_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Room not found');
  END IF;

  IF room.status != 'playing' THEN
    RETURN json_build_object('success', false, 'error', 'Not in playing state');
  END IF;

  IF auth.uid() != room.host_id AND auth.uid() != room.guest_id THEN
    RETURN json_build_object('success', false, 'error', 'Not a participant');
  END IF;

  -- 코드 제출
  UPDATE battle_submissions
  SET code = p_code, submitted_at = NOW()
  WHERE room_id = p_room_id AND user_id = auth.uid();

  -- 양쪽 모두 제출했는지 확인
  SELECT NOT EXISTS (
    SELECT 1 FROM battle_submissions
    WHERE room_id = p_room_id AND submitted_at IS NULL
  ) INTO both_submitted;

  IF both_submitted THEN
    UPDATE battle_rooms SET status = 'reviewing' WHERE id = p_room_id;
  END IF;

  RETURN json_build_object('success', true, 'both_submitted', both_submitted);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. timeout_battle: 타이머 만료시 강제 reviewing 전환
CREATE OR REPLACE FUNCTION timeout_battle(p_room_id UUID)
RETURNS JSON AS $$
DECLARE
  room RECORD;
BEGIN
  SELECT * INTO room FROM battle_rooms WHERE id = p_room_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Room not found');
  END IF;

  IF room.status != 'playing' THEN
    RETURN json_build_object('success', false, 'error', 'Not in playing state');
  END IF;

  -- 미제출자도 현재 코드 그대로 제출 처리 (submitted_at이 null인 것만)
  UPDATE battle_submissions
  SET submitted_at = NOW()
  WHERE room_id = p_room_id AND submitted_at IS NULL;

  UPDATE battle_rooms SET status = 'reviewing' WHERE id = p_room_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. cast_battle_vote: 투표 (자기 투표 불가) + 투표자 포인트 지급
CREATE OR REPLACE FUNCTION cast_battle_vote(p_room_id UUID, p_voted_for UUID)
RETURNS JSON AS $$
DECLARE
  room RECORD;
  existing_vote UUID;
BEGIN
  SELECT * INTO room FROM battle_rooms WHERE id = p_room_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Room not found');
  END IF;

  IF room.status != 'reviewing' THEN
    RETURN json_build_object('success', false, 'error', 'Not in reviewing state');
  END IF;

  -- 자기 자신에게 투표 불가
  IF auth.uid() = p_voted_for THEN
    RETURN json_build_object('success', false, 'error', 'Cannot vote for yourself');
  END IF;

  -- 투표 대상이 참가자인지 확인
  IF p_voted_for != room.host_id AND p_voted_for != room.guest_id THEN
    RETURN json_build_object('success', false, 'error', 'Invalid vote target');
  END IF;

  -- 중복 투표 확인
  SELECT id INTO existing_vote FROM battle_votes
  WHERE room_id = p_room_id AND voter_id = auth.uid();

  IF existing_vote IS NOT NULL THEN
    RETURN json_build_object('success', false, 'error', 'Already voted');
  END IF;

  -- 투표 INSERT
  INSERT INTO battle_votes (room_id, voter_id, voted_for_user_id)
  VALUES (p_room_id, auth.uid(), p_voted_for);

  -- 투표 참여 보상 2P
  UPDATE profiles SET total_points = COALESCE(total_points, 0) + 2 WHERE id = auth.uid();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. finalize_battle: 투표 집계 -> 승자 결정 -> 포인트 정산 -> 퀘스트 연동
CREATE OR REPLACE FUNCTION finalize_battle(p_room_id UUID)
RETURNS JSON AS $$
DECLARE
  room RECORD;
  host_votes INT;
  guest_votes INT;
  winner UUID;
  first_submitter UUID;
  total_votes INT;
  host_sub RECORD;
  guest_sub RECORD;
BEGIN
  SELECT * INTO room FROM battle_rooms WHERE id = p_room_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Room not found');
  END IF;

  IF room.status != 'reviewing' THEN
    RETURN json_build_object('success', false, 'error', 'Not in reviewing state');
  END IF;

  -- 투표 집계
  SELECT COUNT(*) INTO host_votes FROM battle_votes
  WHERE room_id = p_room_id AND voted_for_user_id = room.host_id;

  SELECT COUNT(*) INTO guest_votes FROM battle_votes
  WHERE room_id = p_room_id AND voted_for_user_id = room.guest_id;

  total_votes := host_votes + guest_votes;

  -- 승자 결정
  IF host_votes > guest_votes THEN
    winner := room.host_id;
  ELSIF guest_votes > host_votes THEN
    winner := room.guest_id;
  ELSE
    winner := NULL; -- 동점 = 무승부
  END IF;

  -- 먼저 제출한 사람 확인
  SELECT * INTO host_sub FROM battle_submissions WHERE room_id = p_room_id AND user_id = room.host_id;
  SELECT * INTO guest_sub FROM battle_submissions WHERE room_id = p_room_id AND user_id = room.guest_id;

  IF host_sub.submitted_at IS NOT NULL AND guest_sub.submitted_at IS NOT NULL THEN
    IF host_sub.submitted_at < guest_sub.submitted_at THEN
      first_submitter := room.host_id;
    ELSIF guest_sub.submitted_at < host_sub.submitted_at THEN
      first_submitter := room.guest_id;
    ELSE
      first_submitter := NULL;
    END IF;
  ELSE
    first_submitter := NULL;
  END IF;

  -- 방 상태 업데이트
  UPDATE battle_rooms
  SET status = 'finished', winner_id = winner, ended_at = NOW()
  WHERE id = p_room_id;

  -- 승자 submission 마킹
  IF winner IS NOT NULL THEN
    UPDATE battle_submissions SET is_winner = true
    WHERE room_id = p_room_id AND user_id = winner;
  END IF;

  -- === 포인트 정산 ===

  -- 참가 보상 +10P (양쪽)
  UPDATE profiles SET total_points = COALESCE(total_points, 0) + 10 WHERE id = room.host_id;
  UPDATE profiles SET total_points = COALESCE(total_points, 0) + 10 WHERE id = room.guest_id;

  -- 승리 보너스 +30P
  IF winner IS NOT NULL THEN
    UPDATE profiles SET total_points = COALESCE(total_points, 0) + 30 WHERE id = winner;
  END IF;

  -- 스피드 보너스 +10P (먼저 제출한 사람)
  IF first_submitter IS NOT NULL THEN
    UPDATE profiles SET total_points = COALESCE(total_points, 0) + 10 WHERE id = first_submitter;
  END IF;

  -- 만장일치 보너스 +20P (모든 표를 받은 승자, 2표 이상)
  IF winner IS NOT NULL AND total_votes >= 2 THEN
    IF (winner = room.host_id AND host_votes = total_votes)
    OR (winner = room.guest_id AND guest_votes = total_votes) THEN
      UPDATE profiles SET total_points = COALESCE(total_points, 0) + 20 WHERE id = winner;
    END IF;
  END IF;

  -- === 퀘스트 연동 ===
  -- battle_play (참여)
  PERFORM update_quest_progress(room.host_id, 'battle_play');
  PERFORM update_quest_progress(room.guest_id, 'battle_play');

  -- battle_win (승리)
  IF winner IS NOT NULL THEN
    PERFORM update_quest_progress(winner, 'battle_win');
  END IF;

  RETURN json_build_object(
    'success', true,
    'winner_id', winner,
    'host_votes', host_votes,
    'guest_votes', guest_votes,
    'first_submitter', first_submitter,
    'total_votes', total_votes
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. cancel_battle_room: 호스트만, waiting/ready 상태에서만 취소
CREATE OR REPLACE FUNCTION cancel_battle_room(p_room_id UUID)
RETURNS JSON AS $$
DECLARE
  room RECORD;
BEGIN
  SELECT * INTO room FROM battle_rooms WHERE id = p_room_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Room not found');
  END IF;

  IF auth.uid() != room.host_id THEN
    RETURN json_build_object('success', false, 'error', 'Only host can cancel');
  END IF;

  IF room.status NOT IN ('waiting', 'ready') THEN
    RETURN json_build_object('success', false, 'error', 'Cannot cancel in current status');
  END IF;

  UPDATE battle_rooms SET status = 'cancelled' WHERE id = p_room_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 퀘스트 condition_type 확장
-- ============================================
-- quests 테이블의 condition_type CHECK 제약 업데이트
ALTER TABLE quests DROP CONSTRAINT IF EXISTS quests_condition_type_check;
ALTER TABLE quests ADD CONSTRAINT quests_condition_type_check CHECK (condition_type IN (
  'attendance', 'board_post', 'board_comment', 'vs_vote',
  'sos_solution', 'forest_post', 'badge_earn', 'point_earn',
  'battle_win', 'battle_play'
));

-- 배틀 관련 퀘스트 시드
INSERT INTO quests (id, title, description, icon, quest_type, condition_type, condition_value, reward_points) VALUES
  ('DAILY_BATTLE', '배틀 참여하기', '코딩 배틀에 1회 참여하세요', '⚔️', 'daily', 'battle_play', 1, 15),
  ('WEEKLY_3BATTLE', '배틀 3회 참여', '이번 주에 코딩 배틀에 3회 참여하세요', '🏟️', 'weekly', 'battle_play', 3, 50),
  ('WEEKLY_BATTLE_WIN', '배틀 승리하기', '이번 주에 코딩 배틀에서 1회 승리하세요', '🏆', 'weekly', 'battle_win', 1, 40)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 시드 데이터: 배틀 문제 10개
-- ============================================
INSERT INTO battle_problems (title, description, difficulty, category, language_hint, starter_code, time_limit_seconds) VALUES
-- Easy 3개
(
  'FizzBuzz 변형',
  '1부터 100까지 숫자를 출력하되, 3의 배수는 "Fizz", 5의 배수는 "Buzz", 7의 배수는 "Bang", 15의 배수는 "FizzBuzz", 21의 배수는 "FizzBang", 35의 배수는 "BuzzBang", 105의 배수는 "FizzBuzzBang"을 출력하는 함수를 작성하세요.',
  'easy', 'algorithm', 'javascript',
  'function fizzBuzzBang() {\n  // 여기에 코드를 작성하세요\n}',
  180
),
(
  '배열 중복 제거',
  '정수 배열이 주어졌을 때, 중복을 제거하고 원래 순서를 유지한 채 반환하는 함수를 작성하세요. Set을 사용하지 않고 구현해야 합니다.\n\n예시: [3, 1, 2, 3, 4, 1, 5] → [3, 1, 2, 4, 5]',
  'easy', 'algorithm', 'javascript',
  'function removeDuplicates(arr) {\n  // Set을 사용하지 않고 구현하세요\n}',
  180
),
(
  '팰린드롬 체커',
  '주어진 문자열이 팰린드롬(앞뒤로 읽어도 같은 문자열)인지 확인하는 함수를 작성하세요. 공백과 특수문자는 무시하고, 대소문자도 구분하지 않습니다.\n\n예시: "A man, a plan, a canal: Panama" → true',
  'easy', 'algorithm', 'javascript',
  'function isPalindrome(str) {\n  // 여기에 코드를 작성하세요\n}',
  180
),
-- Medium 3개
(
  '괄호 유효성 검사',
  '주어진 문자열에 포함된 괄호들이 올바르게 짝지어져 있는지 확인하세요. 괄호 종류: (), {}, []\n중첩 괄호도 처리해야 합니다.\n\n예시: "({[]})" → true\n예시: "({[})" → false',
  'medium', 'algorithm', 'javascript',
  'function isValidBrackets(str) {\n  // 여기에 코드를 작성하세요\n}',
  300
),
(
  '최대 연속 부분합',
  '정수 배열이 주어졌을 때, 연속된 부분 배열의 합이 최대가 되는 값을 구하세요. (Kadane''s Algorithm)\n\n예시: [-2, 1, -3, 4, -1, 2, 1, -5, 4] → 6 (부분배열: [4, -1, 2, 1])',
  'medium', 'algorithm', 'javascript',
  'function maxSubarraySum(arr) {\n  // 여기에 코드를 작성하세요\n}',
  300
),
(
  'Two Sum',
  '정수 배열과 목표 합(target)이 주어졌을 때, 합이 target이 되는 두 수의 인덱스를 반환하세요. 같은 요소를 두 번 사용할 수 없습니다. 시간 복잡도 O(n)으로 풀어보세요.\n\n예시: nums=[2,7,11,15], target=9 → [0, 1]',
  'medium', 'algorithm', 'javascript',
  'function twoSum(nums, target) {\n  // O(n) 시간복잡도로 구현하세요\n}',
  300
),
-- Bugfix 2개
(
  '비동기 버그 수정',
  '아래 코드는 API에서 사용자 목록을 가져와 이름을 출력하려고 합니다. 하지만 버그가 있어 항상 빈 배열을 반환합니다. 버그를 찾아 수정하세요.',
  'medium', 'bugfix', 'javascript',
  'async function getUserNames() {\n  const names = [];\n  const userIds = [1, 2, 3, 4, 5];\n  \n  userIds.forEach(async (id) => {\n    const response = await fetch(`/api/users/${id}`);\n    const user = await response.json();\n    names.push(user.name);\n  });\n  \n  return names;\n}\n\n// 위 코드의 버그를 설명하고 수정된 코드를 작성하세요',
  300
),
(
  '클로저 함정',
  '아래 코드는 0, 1, 2, 3, 4를 순서대로 출력하려고 합니다. 하지만 5, 5, 5, 5, 5가 출력됩니다. 이유를 설명하고 3가지 다른 방법으로 수정하세요.',
  'medium', 'bugfix', 'javascript',
  'for (var i = 0; i < 5; i++) {\n  setTimeout(function() {\n    console.log(i);\n  }, i * 1000);\n}\n\n// 왜 5가 5번 출력되는지 설명하고\n// 3가지 다른 해결 방법을 작성하세요',
  300
),
-- Creative/Optimization 2개
(
  '콘솔 아트',
  'console.log만 사용하여 크리스마스 트리를 출력하는 함수를 작성하세요. 높이(n)를 매개변수로 받습니다.\n\n높이 5 예시:\n    *\n   ***\n  *****\n ******* \n*********\n   |||',
  'easy', 'creative', 'javascript',
  'function drawTree(n) {\n  // console.log로 트리를 그려보세요\n}',
  300
),
(
  '최소 코드 챌린지',
  '배열의 모든 요소를 더하는 함수를 가능한 한 짧은 코드로 작성하세요. 코드의 길이(문자 수)가 적을수록 좋습니다!\n\n조건: 함수명은 sum, 매개변수명은 a\n예시: sum([1,2,3]) → 6',
  'easy', 'optimization', 'javascript',
  '// 가능한 한 짧게 작성하세요!\n// 목표: 30자 이하\nconst sum = (a) => {\n  // 여기에 코드\n};',
  180
);

-- ============================================
-- Realtime 활성화
-- ============================================
DO $$
BEGIN
  -- battle_rooms
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE battle_rooms;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  -- battle_submissions
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE battle_submissions;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  -- battle_votes
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE battle_votes;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
