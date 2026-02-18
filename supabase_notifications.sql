-- ============================================
-- 알림 시스템 (Notification System)
-- Supabase SQL Editor에서 실행
-- ============================================

-- 1. notifications 테이블 생성
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('REACTION', 'JOIN_REQUEST', 'JOIN_APPROVED', 'JOIN_REJECTED')),
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스: 유저별 최신 알림 조회 최적화
CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications (user_id, created_at DESC);

-- 2. RLS 활성화 + 정책
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 알림만 조회"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "본인 알림만 수정"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "본인 알림만 삭제"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

-- 서비스 역할(트리거)에서 INSERT 허용
CREATE POLICY "트리거에서 알림 생성 허용"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- 3. Realtime 활성화
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- 트리거 함수들 (SECURITY DEFINER)
-- ============================================

-- A. 반응(Reaction) 알림 트리거
CREATE OR REPLACE FUNCTION notify_on_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_owner_id UUID;
    reactor_name TEXT;
    emoji_label TEXT;
BEGIN
    -- 게시글 작성자 조회
    SELECT user_id INTO post_owner_id
    FROM posts
    WHERE id = NEW.post_id;

    -- 본인 반응은 알림 제외
    IF post_owner_id IS NULL OR post_owner_id = NEW.user_id THEN
        RETURN NEW;
    END IF;

    -- 반응한 유저 이름 조회
    SELECT COALESCE(username, '알 수 없는 유저') INTO reactor_name
    FROM profiles
    WHERE id = NEW.user_id;

    -- 이모지 타입 → 한글 라벨
    CASE NEW.emoji_type
        WHEN 'like' THEN emoji_label := '좋아요';
        WHEN 'heart' THEN emoji_label := '하트';
        WHEN 'fire' THEN emoji_label := '불꽃';
        ELSE emoji_label := '반응';
    END CASE;

    INSERT INTO notifications (user_id, type, message, link)
    VALUES (
        post_owner_id,
        'REACTION',
        reactor_name || '님이 회원님의 글에 ' || emoji_label || '를 남겼습니다.',
        '/community'
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_reaction_notify ON post_reactions;
CREATE TRIGGER trg_reaction_notify
    AFTER INSERT ON post_reactions
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_reaction();

-- B. 스터디 그룹 참여 신청 알림 트리거
CREATE OR REPLACE FUNCTION notify_on_join_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    group_owner_id UUID;
    group_title TEXT;
    requester_name TEXT;
BEGIN
    -- pending 상태 INSERT만 처리
    IF NEW.status != 'pending' THEN
        RETURN NEW;
    END IF;

    -- 그룹 정보 조회
    SELECT owner_id, title INTO group_owner_id, group_title
    FROM study_groups
    WHERE id = NEW.group_id;

    IF group_owner_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- 신청자 이름 조회
    SELECT COALESCE(username, '알 수 없는 유저') INTO requester_name
    FROM profiles
    WHERE id = NEW.user_id;

    INSERT INTO notifications (user_id, type, message, link)
    VALUES (
        group_owner_id,
        'JOIN_REQUEST',
        requester_name || '님이 "' || group_title || '" 그룹에 참여를 신청했습니다.',
        '/study'
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_join_request_notify ON study_group_members;
CREATE TRIGGER trg_join_request_notify
    AFTER INSERT ON study_group_members
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_join_request();

-- C. 스터디 그룹 참여 승인/거절 알림 트리거
CREATE OR REPLACE FUNCTION notify_on_join_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    group_title TEXT;
    noti_type TEXT;
    noti_message TEXT;
BEGIN
    -- status가 실제로 변경된 경우만 처리
    IF OLD.status = NEW.status THEN
        RETURN NEW;
    END IF;

    -- approved 또는 rejected로 변경된 경우만
    IF NEW.status NOT IN ('approved', 'rejected') THEN
        RETURN NEW;
    END IF;

    -- 그룹 제목 조회
    SELECT title INTO group_title
    FROM study_groups
    WHERE id = NEW.group_id;

    IF NEW.status = 'approved' THEN
        noti_type := 'JOIN_APPROVED';
        noti_message := '"' || group_title || '" 그룹 참여가 승인되었습니다!';
    ELSE
        noti_type := 'JOIN_REJECTED';
        noti_message := '"' || group_title || '" 그룹 참여가 거절되었습니다.';
    END IF;

    INSERT INTO notifications (user_id, type, message, link)
    VALUES (
        NEW.user_id,
        noti_type,
        noti_message,
        '/study'
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_join_status_notify ON study_group_members;
CREATE TRIGGER trg_join_status_notify
    AFTER UPDATE ON study_group_members
    FOR EACH ROW
    EXECUTE FUNCTION notify_on_join_status_change();
