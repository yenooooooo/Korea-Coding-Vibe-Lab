-- ============================================
-- 관리자 역할 컬럼 추가
-- Supabase SQL Editor에서 실행
-- ============================================

-- 1. is_admin 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. 관리자 지정 (yaya01234@naver.com)
UPDATE profiles
SET is_admin = true
WHERE id = (SELECT id FROM auth.users WHERE email = 'yaya01234@naver.com');
