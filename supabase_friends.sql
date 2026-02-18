-- =============================================
-- Friends System: Tables for friend requests and friendships
-- Supabase SQL Editor에서 실행
-- =============================================

-- 1. friend_requests 테이블 (친구 신청)
CREATE TABLE IF NOT EXISTS friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(requester_id, receiver_id),
    CHECK (requester_id != receiver_id)
);

-- 2. friendships 테이블 (친구 관계)
CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2)
);

-- 3. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_requester ON friend_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id_1 ON friendships(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id_2 ON friendships(user_id_2);

-- 4. RLS (Row Level Security) 정책

-- friend_requests 테이블 RLS
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- 자신의 신청 조회 (requester)
CREATE POLICY friend_requests_select_requester ON friend_requests
    FOR SELECT USING (requester_id = auth.uid());

-- 자신에게 온 신청 조회 (receiver)
CREATE POLICY friend_requests_select_receiver ON friend_requests
    FOR SELECT USING (receiver_id = auth.uid());

-- 신청 생성
CREATE POLICY friend_requests_insert ON friend_requests
    FOR INSERT WITH CHECK (requester_id = auth.uid());

-- 신청 업데이트 (receiver만 상태 변경 가능)
CREATE POLICY friend_requests_update ON friend_requests
    FOR UPDATE USING (receiver_id = auth.uid())
    WITH CHECK (receiver_id = auth.uid());

-- 신청 삭제 (requester만 삭제 가능)
CREATE POLICY friend_requests_delete ON friend_requests
    FOR DELETE USING (requester_id = auth.uid() OR receiver_id = auth.uid());

-- friendships 테이블 RLS
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- 친구 목록 조회
CREATE POLICY friendships_select ON friendships
    FOR SELECT USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- 친구 추가 (admin만 가능하도록 하거나, trigger로 자동화)
-- 친구 삭제
CREATE POLICY friendships_delete ON friendships
    FOR DELETE USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- 5. Trigger: friend_request 수락 시 friendships에 자동 추가
CREATE OR REPLACE FUNCTION accept_friend_request()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        -- friendships 테이블에 추가 (user_id_1 < user_id_2 규칙 준수)
        INSERT INTO friendships (user_id_1, user_id_2)
        VALUES (
            CASE WHEN NEW.requester_id < NEW.receiver_id
                THEN NEW.requester_id
                ELSE NEW.receiver_id
            END,
            CASE WHEN NEW.requester_id > NEW.receiver_id
                THEN NEW.requester_id
                ELSE NEW.receiver_id
            END
        )
        ON CONFLICT DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger 생성
DROP TRIGGER IF EXISTS trigger_accept_friend_request ON friend_requests;
CREATE TRIGGER trigger_accept_friend_request
    AFTER UPDATE ON friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION accept_friend_request();

-- 6. Trigger: friendships 삭제 시 friend_requests도 정리
CREATE OR REPLACE FUNCTION cleanup_friend_request()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM friend_requests
    WHERE (requester_id = OLD.user_id_1 AND receiver_id = OLD.user_id_2)
       OR (requester_id = OLD.user_id_2 AND receiver_id = OLD.user_id_1);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger 생성
DROP TRIGGER IF EXISTS trigger_cleanup_friend_request ON friendships;
CREATE TRIGGER trigger_cleanup_friend_request
    BEFORE DELETE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_friend_request();
