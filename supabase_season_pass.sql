-- Season Pass: 유저별 시즌 진행도 테이블
-- 월간 시즌제 (현재 월 기준, '2026-02' 형식)

CREATE TABLE IF NOT EXISTS user_season_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    season_key TEXT NOT NULL,          -- '2026-02' 형식
    season_xp INT DEFAULT 0,
    current_tier INT DEFAULT 0,        -- 0~30
    claimed_tiers INT[] DEFAULT '{}',  -- 수령한 단계들
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, season_key)
);

-- RLS 정책
ALTER TABLE user_season_progress ENABLE ROW LEVEL SECURITY;

-- SELECT: 모두 가능 (랭킹용)
CREATE POLICY "user_season_progress_select"
ON user_season_progress FOR SELECT
TO authenticated
USING (true);

-- INSERT: 본인만
CREATE POLICY "user_season_progress_insert"
ON user_season_progress FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- UPDATE: 본인만
CREATE POLICY "user_season_progress_update"
ON user_season_progress FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_season_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_season_progress_updated_at
    BEFORE UPDATE ON user_season_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_season_progress_updated_at();
