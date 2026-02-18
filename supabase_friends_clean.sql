-- =============================================
-- Friends System: Clean install (RLS 정책 재설정)
-- 기존 정책이 있으면 삭제하고 다시 생성
-- =============================================

-- 1. 기존 정책 삭제
DROP POLICY IF EXISTS friend_requests_select_requester ON friend_requests;
DROP POLICY IF EXISTS friend_requests_select_receiver ON friend_requests;
DROP POLICY IF EXISTS friend_requests_insert ON friend_requests;
DROP POLICY IF EXISTS friend_requests_update ON friend_requests;
DROP POLICY IF EXISTS friend_requests_delete ON friend_requests;
DROP POLICY IF EXISTS friendships_select ON friendships;
DROP POLICY IF EXISTS friendships_delete ON friendships;

-- 2. 테이블이 없으면 생성
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

CREATE TABLE IF NOT EXISTS friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2)
);

-- 3. 인덱스 재생성 (기존 있으면 무시)
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_requester ON friend_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id_1 ON friendships(user_id_1);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id_2 ON friendships(user_id_2);

-- 4. RLS 활성화
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- 5. friend_requests RLS 정책 생성
CREATE POLICY friend_requests_select_requester ON friend_requests
    FOR SELECT USING (requester_id = auth.uid());

CREATE POLICY friend_requests_select_receiver ON friend_requests
    FOR SELECT USING (receiver_id = auth.uid());

CREATE POLICY friend_requests_insert ON friend_requests
    FOR INSERT WITH CHECK (requester_id = auth.uid());

CREATE POLICY friend_requests_update ON friend_requests
    FOR UPDATE USING (receiver_id = auth.uid())
    WITH CHECK (receiver_id = auth.uid());

CREATE POLICY friend_requests_delete ON friend_requests
    FOR DELETE USING (requester_id = auth.uid() OR receiver_id = auth.uid());

-- 6. friendships RLS 정책 생성
CREATE POLICY friendships_select ON friendships
    FOR SELECT USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

CREATE POLICY friendships_delete ON friendships
    FOR DELETE USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- 7. Trigger 함수 및 Trigger 재생성
DROP TRIGGER IF EXISTS trigger_accept_friend_request ON friend_requests;
DROP TRIGGER IF EXISTS trigger_cleanup_friend_request ON friendships;
DROP FUNCTION IF EXISTS accept_friend_request();
DROP FUNCTION IF EXISTS cleanup_friend_request();

CREATE OR REPLACE FUNCTION accept_friend_request()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
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

CREATE TRIGGER trigger_accept_friend_request
    AFTER UPDATE ON friend_requests
    FOR EACH ROW
    EXECUTE FUNCTION accept_friend_request();

CREATE OR REPLACE FUNCTION cleanup_friend_request()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM friend_requests
    WHERE (requester_id = OLD.user_id_1 AND receiver_id = OLD.user_id_2)
       OR (requester_id = OLD.user_id_2 AND receiver_id = OLD.user_id_1);
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_cleanup_friend_request
    BEFORE DELETE ON friendships
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_friend_request();

-- 완료!
SELECT 'Friends system installed successfully!' as status;
