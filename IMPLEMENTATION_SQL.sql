-- ================================================
-- 13개 기능 구현을 위한 SQL 스크립트
-- 실행 순서대로 작성됨
-- ================================================

-- ==================== PHASE 1: 기반 시스템 ====================

-- 1. 알림 센터 (이미 존재하지만 확인용)
-- notifications 테이블이 이미 존재한다고 가정
-- 없다면 아래 코드 실행:
/*
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'friend', 'reward', 'achievement', 'message', 'system'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
*/

-- 2. 북마크/즐겨찾기 시스템
CREATE TABLE IF NOT EXISTS bookmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL, -- 'post', 'snippet', 'project', 'resource'
    content_id TEXT NOT NULL,
    content_data JSONB, -- { title, description, url, etc }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_type ON bookmarks(content_type);

-- ==================== PHASE 2: 게이미피케이션 ====================

-- 3. 스트릭 복구 시스템 - 유저 아이템 테이블
CREATE TABLE IF NOT EXISTS user_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL, -- 'freeze', 'restore', 'double'
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_items_user_id ON user_items(user_id);
CREATE INDEX idx_user_items_expires ON user_items(expires_at);

-- attendance 테이블에 is_recovery 컬럼 추가 (복구권으로 추가된 출석 표시)
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS is_recovery BOOLEAN DEFAULT false;

-- 4. 업적 시스템 확장
-- 숨겨진 업적을 위한 hidden_achievements 테이블
CREATE TABLE IF NOT EXISTS hidden_achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    achievement_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    condition_type TEXT NOT NULL, -- 'midnight_streak', 'weekend_warrior', 'perfect_month'
    condition_value INTEGER,
    reward_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 숨겨진 업적 초기 데이터
INSERT INTO hidden_achievements (achievement_id, name, description, icon, condition_type, condition_value, reward_points)
VALUES
    ('midnight_learner', '🌙 야간 학습자', '자정 이후 5일 연속 출석', '🌙', 'midnight_streak', 5, 100),
    ('weekend_warrior', '🔥 불타는 주말', '주말 10주 연속 출석', '🔥', 'weekend_streak', 10, 150),
    ('perfectionist', '💯 완벽주의자', '한 달 개근 달성', '💯', 'perfect_month', 1, 200),
    ('early_bird', '🐦 얼리버드', '오전 6시 이전 10일 출석', '🐦', 'early_streak', 10, 120)
ON CONFLICT (achievement_id) DO NOTHING;

-- 5. 일일 코딩 챌린지
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    challenge_id TEXT NOT NULL,
    challenge_date DATE NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, challenge_date)
);

CREATE INDEX idx_daily_challenges_user_date ON daily_challenges(user_id, challenge_date);

-- ==================== PHASE 3: 학습 강화 ====================

-- 6. 스터디 타이머 & 포모도로
CREATE TABLE IF NOT EXISTS study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    duration INTEGER NOT NULL, -- minutes
    session_type TEXT DEFAULT 'pomodoro', -- 'pomodoro', 'custom', 'deep_work'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_date ON study_sessions(started_at);

-- 7. 학습 목표 대시보드
CREATE TABLE IF NOT EXISTS learning_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    target_value INTEGER NOT NULL,
    current_value INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_learning_goals_user_id ON learning_goals(user_id);

-- 8. 코드 스니펫 저장소
CREATE TABLE IF NOT EXISTS code_snippets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language TEXT DEFAULT 'javascript',
    tags TEXT[], -- PostgreSQL 배열
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_code_snippets_user_id ON code_snippets(user_id);
CREATE INDEX idx_code_snippets_tags ON code_snippets USING GIN(tags);

-- ==================== PHASE 4: 데이터 분석 ====================

-- 9. 학습 분석 대시보드 (기존 테이블 활용)
-- study_sessions, attendance, learning_goals 테이블을 집계하여 대시보드 생성
-- 추가 테이블 불필요

-- ==================== PHASE 5: 커뮤니티 강화 ====================

-- 10. 코드 리뷰 요청 게시판
CREATE TABLE IF NOT EXISTS code_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    code TEXT NOT NULL,
    language TEXT DEFAULT 'javascript',
    status TEXT DEFAULT 'open', -- 'open', 'in_review', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS code_review_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID REFERENCES code_reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_best_review BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_code_reviews_status ON code_reviews(status);
CREATE INDEX idx_code_review_comments_review_id ON code_review_comments(review_id);

-- 11. 스터디 모집 개선 (기존 study_groups 테이블 확장)
-- 필터링을 위한 컬럼 추가
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS tech_stack TEXT[];
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS time_zone TEXT;
ALTER TABLE study_groups ADD COLUMN IF NOT EXISTS level TEXT; -- 'beginner', 'intermediate', 'advanced'

-- 12. 페어 프로그래밍 매칭
CREATE TABLE IF NOT EXISTS pair_programming_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES auth.users(id),
    problem_id TEXT,
    status TEXT DEFAULT 'waiting', -- 'waiting', 'matched', 'in_progress', 'completed'
    room_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_pair_sessions_status ON pair_programming_sessions(status);

-- ==================== PHASE 6: UX 개선 ====================

-- 13. 테마 커스터마이징
CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark', -- 'dark', 'light', 'purple', 'ocean', 'forest', 'sunset'
    font_size TEXT DEFAULT 'medium', -- 'small', 'medium', 'large'
    compact_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== 유틸리티 함수 ====================

-- 포인트 추가 함수 (이미 존재할 수 있음)
CREATE OR REPLACE FUNCTION add_points(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT
)
RETURNS void AS $$
BEGIN
    -- 프로필 포인트 업데이트
    UPDATE profiles
    SET total_points = total_points + p_amount
    WHERE id = p_user_id;

    -- 포인트 히스토리 기록
    INSERT INTO point_history (user_id, amount, description, type)
    VALUES (p_user_id, p_amount, p_description, CASE WHEN p_amount > 0 THEN 'earn' ELSE 'spend' END);
END;
$$ LANGUAGE plpgsql;

-- ==================== RLS (Row Level Security) 정책 ====================

-- 각 테이블에 대한 RLS 활성화 및 정책 설정

-- bookmarks
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- user_items
ALTER TABLE user_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own items" ON user_items
    FOR ALL USING (auth.uid() = user_id);

-- daily_challenges
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own challenges" ON daily_challenges
    FOR ALL USING (auth.uid() = user_id);

-- study_sessions
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own sessions" ON study_sessions
    FOR ALL USING (auth.uid() = user_id);

-- learning_goals
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own goals" ON learning_goals
    FOR ALL USING (auth.uid() = user_id);

-- code_snippets
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own snippets" ON code_snippets
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view public snippets" ON code_snippets
    FOR SELECT USING (is_public = true);

-- code_reviews
ALTER TABLE code_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all code reviews" ON code_reviews
    FOR SELECT USING (true);
CREATE POLICY "Users can manage their own reviews" ON code_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- code_review_comments
ALTER TABLE code_review_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all comments" ON code_review_comments
    FOR SELECT USING (true);
CREATE POLICY "Users can add comments" ON code_review_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- pair_programming_sessions
ALTER TABLE pair_programming_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sessions" ON pair_programming_sessions
    FOR ALL USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (auth.uid() = user_id);

-- ==================== 완료 ====================
-- 모든 테이블과 정책이 생성되었습니다.
-- Supabase 대시보드에서 이 SQL을 실행하세요.
