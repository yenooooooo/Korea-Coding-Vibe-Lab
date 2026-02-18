-- ============================================
-- Vibe Sandbox: 저장된 바이브 관리 테이블
-- ============================================

-- 1. sandbox_items: 사용자가 생성한 멋진 결과물을 저장하는 테이블
CREATE TABLE IF NOT EXISTS sandbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  code TEXT NOT NULL,
  css TEXT, -- 별도의 CSS가 필요한 경우
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 설정
ALTER TABLE sandbox_items ENABLE ROW LEVEL SECURITY;

-- 조회 정책 (공개된 것은 누구나, 비공개는 본인만)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'sandbox_items_select_policy'
    ) THEN
        CREATE POLICY "sandbox_items_select_policy" ON sandbox_items
        FOR SELECT USING (is_public OR auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'sandbox_items_insert_policy'
    ) THEN
        CREATE POLICY "sandbox_items_insert_policy" ON sandbox_items
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
