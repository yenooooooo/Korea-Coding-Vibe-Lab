-- =============================================
-- User Ban System
-- =============================================

-- 1. Add is_banned column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;

-- 2. RPC: Toggle Ban Status
-- 관리자만 실행 가능하도록 설계를 권장하지만, 
-- 여기서는 내부적으로 is_admin() 체크를 포함하여 보안을 강화합니다.
CREATE OR REPLACE FUNCTION admin_toggle_ban(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  current_status BOOLEAN;
  new_status BOOLEAN;
  v_is_admin BOOLEAN;
BEGIN
  -- Check Admin Permission
  -- (supabase_admin_rpc.sql의 is_admin 함수 사용, 없으면 직접 체크)
  SELECT is_admin INTO v_is_admin FROM profiles WHERE id = auth.uid();
  
  IF v_is_admin IS NOT TRUE THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Get current status
  SELECT is_banned INTO current_status FROM profiles WHERE id = p_user_id;
  
  -- Toggle
  new_status := NOT COALESCE(current_status, false);
  
  UPDATE profiles 
  SET is_banned = new_status 
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true, 
    'user_id', p_user_id, 
    'new_status', new_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
