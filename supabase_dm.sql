-- =============================================
-- Direct Messages System: 1:1 DM 기능
-- Supabase SQL Editor에서 실행
-- =============================================

-- 1. conversations 테이블 (대화방)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2)
);

-- 2. direct_messages 테이블 (메시지)
CREATE TABLE IF NOT EXISTS direct_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_1 ON conversations(user_id_1);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_2 ON conversations(user_id_2);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_conversation_id ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_is_read ON direct_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_direct_messages_created_at ON direct_messages(created_at DESC);

-- 4. RLS (Row Level Security) 정책

-- conversations 테이블 RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 자신의 대화방만 조회
CREATE POLICY conversations_select ON conversations
    FOR SELECT USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- 대화방 생성 (자동으로 생성되도록 trigger 사용)
CREATE POLICY conversations_insert ON conversations
    FOR INSERT WITH CHECK (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- 대화방 업데이트 (updated_at 자동 갱신)
CREATE POLICY conversations_update ON conversations
    FOR UPDATE USING (user_id_1 = auth.uid() OR user_id_2 = auth.uid())
    WITH CHECK (user_id_1 = auth.uid() OR user_id_2 = auth.uid());

-- direct_messages 테이블 RLS
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

-- 메시지 조회 (해당 대화방의 참여자만)
CREATE POLICY direct_messages_select ON direct_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE user_id_1 = auth.uid() OR user_id_2 = auth.uid()
        )
    );

-- 메시지 생성 (본인만 보낼 수 있음)
CREATE POLICY direct_messages_insert ON direct_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT id FROM conversations
            WHERE user_id_1 = auth.uid() OR user_id_2 = auth.uid()
        )
    );

-- 메시지 업데이트 (is_read 상태만 변경 가능)
CREATE POLICY direct_messages_update ON direct_messages
    FOR UPDATE USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE user_id_1 = auth.uid() OR user_id_2 = auth.uid()
        )
    )
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE user_id_1 = auth.uid() OR user_id_2 = auth.uid()
        )
    );

-- 5. Trigger: 새 메시지 시 conversations의 updated_at, last_message_at 갱신
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET updated_at = NOW(),
        last_message_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON direct_messages;
CREATE TRIGGER trigger_update_conversation_timestamp
    AFTER INSERT ON direct_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_timestamp();

-- 6. 함수: 대화방 찾기 또는 생성
CREATE OR REPLACE FUNCTION get_or_create_conversation(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
    conv_id UUID;
    user1 UUID;
    user2 UUID;
BEGIN
    -- 두 user ID를 정렬 (항상 작은 ID가 user_id_1)
    IF auth.uid() < other_user_id THEN
        user1 := auth.uid();
        user2 := other_user_id;
    ELSE
        user1 := other_user_id;
        user2 := auth.uid();
    END IF;

    -- 기존 대화방 찾기
    SELECT id INTO conv_id FROM conversations
    WHERE user_id_1 = user1 AND user_id_2 = user2;

    -- 없으면 생성
    IF conv_id IS NULL THEN
        INSERT INTO conversations (user_id_1, user_id_2)
        VALUES (user1, user2)
        RETURNING id INTO conv_id;
    END IF;

    RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 완료!
SELECT 'Direct Messages system installed successfully!' as status;
