-- point_transactions 테이블 생성
-- Supabase Dashboard → SQL Editor에서 실행하세요

CREATE TABLE IF NOT EXISTS point_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL, -- 양수 = 적립, 음수 = 사용
    description TEXT,
    category TEXT DEFAULT 'other', -- attendance, quest, battle, shop, friend, challenge, admin, bonus, mentor, season_pass, other
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 (빠른 조회용)
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_category ON point_transactions(category);

-- RLS 활성화
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있다면 삭제하고 재생성 (중복 오류 방지)
DROP POLICY IF EXISTS "point_transactions_read" ON point_transactions;
CREATE POLICY "point_transactions_read" ON point_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "point_transactions_insert" ON point_transactions;
CREATE POLICY "point_transactions_insert" ON point_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);
