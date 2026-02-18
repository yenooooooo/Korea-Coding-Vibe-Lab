-- =============================================
-- Ranking System: Add columns to profiles table
-- Supabase SQL Editor에서 실행
-- =============================================

-- 1. profiles 테이블에 필요한 컬럼 추가
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS battle_wins INTEGER DEFAULT 0;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS battle_losses INTEGER DEFAULT 0;

-- 2. 인덱스 추가 (랭킹 조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_profiles_level ON profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_battle_wins ON profiles(battle_wins DESC);

-- 3. 안전성: level은 1~100 사이 제약
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_level_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_level_check
CHECK (level >= 1 AND level <= 100);

-- 4. 포인트는 음수 불가
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_points_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_points_check
CHECK (points >= 0);

-- 5. 배틀 기록은 음수 불가
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_battle_wins_check,
DROP CONSTRAINT IF EXISTS profiles_battle_losses_check;

ALTER TABLE profiles
ADD CONSTRAINT profiles_battle_wins_check
CHECK (battle_wins >= 0);

ALTER TABLE profiles
ADD CONSTRAINT profiles_battle_losses_check
CHECK (battle_losses >= 0);

-- 6. RLS 정책 확인 (profiles 테이블의 SELECT는 모두 가능해야 함)
-- 기존 RLS 정책이 있으면 유지, 없으면 아래 추가
-- (이미 있을 가능성이 높으므로 여기서는 생략)
