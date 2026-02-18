-- ============================================
-- Vibe Market Stabilization & Performance
-- ============================================

-- 1. Profile Nickname Fix
-- 닉네임 컬럼이 없으면 추가하고, 기존 username 값을 복사합니다.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='profiles' AND column_name='nickname'
    ) THEN
        ALTER TABLE profiles ADD COLUMN nickname TEXT;
        
        -- 기존 데이터 마이그레이션
        UPDATE profiles SET nickname = username WHERE nickname IS NULL;
    END IF;
END $$;

-- 2. Performance Index
-- 마켓 검색 성능 향상을 위한 인덱스 추가 (제목 검색)
CREATE INDEX IF NOT EXISTS idx_market_assets_title ON market_assets(title);

-- 3. Created At Index (정렬 성능)
CREATE INDEX IF NOT EXISTS idx_market_assets_created_at ON market_assets(created_at DESC);
