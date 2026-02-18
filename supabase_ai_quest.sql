-- AI 퀘스트 수락 함수
-- AI가 생성한 퀘스트 정보를 quests 테이블에 등록하고, user_quests에 배정합니다.
CREATE OR REPLACE FUNCTION accept_ai_quest(
  p_title TEXT,
  p_description TEXT,
  p_mission TEXT,
  p_difficulty TEXT,
  p_xp INT,
  p_icon TEXT
)
RETURNS JSON AS $$
DECLARE
  v_quest_id TEXT;
  v_user_quest_id UUID;
BEGIN
  -- 1. Quest ID 생성 (AI_날짜_랜덤)
  v_quest_id := 'AI_' || to_char(now(), 'YYYYMMDD_HH24MISS') || '_' || substring(md5(random()::text) from 1 for 4);

  -- 2. Quests 테이블에 등록 (condition_type은 'manual_check'로 설정)
  INSERT INTO quests (
    id, title, description, icon, quest_type, 
    condition_type, condition_value, reward_points
  ) VALUES (
    v_quest_id,
    p_title,
    p_description || ' [Mission: ' || p_mission || ']',
    p_icon,
    'daily', -- AI 퀘스트는 일일 퀘스트로 취급
    'point_earn', -- 임시 (실제로는 수동 완료)
    1,
    p_xp
  );

  -- 3. User Quests에 배정
  INSERT INTO user_quests (
    user_id, quest_id, period_start, period_end
  ) VALUES (
    auth.uid(),
    v_quest_id,
    CURRENT_DATE,
    CURRENT_DATE + 7 -- 7일간 유효
  ) RETURNING id INTO v_user_quest_id;

  RETURN json_build_object('success', true, 'quest_id', v_quest_id, 'user_quest_id', v_user_quest_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- AI 퀘스트 완료 처리 함수 (수동 완료)
CREATE OR REPLACE FUNCTION complete_ai_quest(p_user_quest_id UUID)
RETURNS JSON AS $$
DECLARE
  v_reward INT;
BEGIN
  -- 1. 유효성 검사 및 보상 조회
  SELECT q.reward_points INTO v_reward
  FROM user_quests uq
  JOIN quests q ON q.id = uq.quest_id
  WHERE uq.id = p_user_quest_id 
    AND uq.user_id = auth.uid()
    AND uq.is_completed = false;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', '퀘스트를 찾을 수 없거나 이미 완료되었습니다.');
  END IF;

  -- 2. 완료 처리 (보상 수령까지 한 번에)
  UPDATE user_quests
  SET 
    is_completed = true,
    completed_at = NOW(),
    progress = 1
  WHERE id = p_user_quest_id;

  -- 3. 보상 지급 (claim_quest_reward 함수 재사용 또는 직접 지급)
  -- 여기서는 직접 지급 후 claim 처리는 별도 버튼으로 하거나, 여기서 한방에 할 수도 있음.
  -- 사용자 편의를 위해 '완료' 누르면 '완료 상태'만 만들고, '보상 받기' 버튼을 활성화하는 흐름이 자연스러움.
  
  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
