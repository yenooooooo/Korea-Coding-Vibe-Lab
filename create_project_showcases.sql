-- project_showcases 테이블 생성
-- Supabase Dashboard → SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS project_showcases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    url TEXT,
    github_url TEXT,
    screenshot_url TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE project_showcases ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있다면 삭제하고 재생성 (중복 오류 방지)
DROP POLICY IF EXISTS "project_showcases_read" ON project_showcases;
CREATE POLICY "project_showcases_read" ON project_showcases
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "project_showcases_insert" ON project_showcases;
CREATE POLICY "project_showcases_insert" ON project_showcases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "project_showcases_update" ON project_showcases;
CREATE POLICY "project_showcases_update" ON project_showcases
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "project_showcases_delete" ON project_showcases;
CREATE POLICY "project_showcases_delete" ON project_showcases
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "project_showcases_like" ON project_showcases;
CREATE POLICY "project_showcases_like" ON project_showcases
    FOR UPDATE USING (true)
    WITH CHECK (true);
