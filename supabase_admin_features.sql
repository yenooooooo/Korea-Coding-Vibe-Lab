-- ============================================
-- 관리자 전용 기능 (Admin Features)
-- Supabase SQL Editor에서 실행
-- ============================================

-- 1. 게시글 핀 고정 컬럼
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
ALTER TABLE board_posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- 2. 관리자 칭호 컬럼
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_title TEXT;

-- 기본 칭호 설정
UPDATE profiles
SET admin_title = 'Vibe Master'
WHERE is_admin = true AND admin_title IS NULL;

-- 3. 사이트 공지사항 테이블
CREATE TABLE IF NOT EXISTS site_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "공지사항 모두 조회" ON site_announcements
    FOR SELECT USING (true);

CREATE POLICY "관리자만 공지 생성" ON site_announcements
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "관리자만 공지 수정" ON site_announcements
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "관리자만 공지 삭제" ON site_announcements
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 4. 관리자 삭제/수정 권한 (기존 정책에 추가)
-- 관리자는 모든 채팅 메시지 삭제 가능
CREATE POLICY "관리자 채팅 삭제" ON posts
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 관리자는 모든 게시글 삭제 가능
CREATE POLICY "관리자 게시글 삭제" ON board_posts
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 관리자는 모든 댓글 삭제 가능
CREATE POLICY "관리자 댓글 삭제" ON board_comments
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 관리자는 모든 SOS 글 삭제 가능
CREATE POLICY "관리자 SOS 삭제" ON sos_posts
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 관리자는 모든 SOS 솔루션 삭제 가능
CREATE POLICY "관리자 솔루션 삭제" ON sos_solutions
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 관리자는 게시글 핀 고정 가능
CREATE POLICY "관리자 채팅 핀" ON posts
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY "관리자 게시글 핀" ON board_posts
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 5. Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE site_announcements;
