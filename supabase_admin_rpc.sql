-- ============================================
-- Admin Secret RPC Functions
-- ============================================

-- 관리자 권한 확인 함수 (보안용)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT email FROM auth.users WHERE id = auth.uid()) = 'yaya01234@naver.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. admin_update_points: 유저 포인트 직접 수정
CREATE OR REPLACE FUNCTION admin_update_points(p_user_id UUID, p_points INT)
RETURNS JSON AS $$
BEGIN
  IF NOT is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  UPDATE profiles
  SET total_points = p_points
  WHERE id = p_user_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. admin_get_economy_stats: 경제 지표 요약
CREATE OR REPLACE FUNCTION admin_get_economy_stats()
RETURNS JSON AS $$
DECLARE
  total_points BIGINT;
  avg_points NUMERIC;
  max_points INT;
BEGIN
  IF NOT is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  SELECT SUM(total_points), AVG(total_points), MAX(total_points)
  INTO total_points, avg_points, max_points
  FROM profiles;

  RETURN json_build_object(
    'success', true,
    'total_points_in_circulation', COALESCE(total_points, 0),
    'average_points', ROUND(COALESCE(avg_points, 0), 2),
    'richest_user_points', COALESCE(max_points, 0)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
