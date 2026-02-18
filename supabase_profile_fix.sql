-- ============================================
-- Profile Table Fix: Add nickname column
-- ============================================

-- 1. nickname 컬럼 추가 (username의 값을 기본값으로 사용)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='nickname'
    ) THEN
        ALTER TABLE profiles ADD COLUMN nickname TEXT;
        
        -- 기존에 username이 있다면 nickname으로 복사
        UPDATE profiles SET nickname = username WHERE nickname IS NULL;
    END IF;
END $$;

-- 2. total_points 컬럼이 없는 경우를 대비 (이미 attendance.sql에 있지만 안전장치)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='total_points'
    ) THEN
        ALTER TABLE profiles ADD COLUMN total_points INT DEFAULT 0;
    END IF;
END $$;
