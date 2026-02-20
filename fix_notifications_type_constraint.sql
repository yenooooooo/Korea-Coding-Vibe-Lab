-- ============================================
-- notifications 테이블 TYPE CHECK 제약 조건 확장
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 기존 CHECK 제약 조건 제거 (4개 타입만 허용하던 것)
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- 모든 알림 타입을 허용하는 새 CHECK 제약 조건 추가
ALTER TABLE notifications
ADD CONSTRAINT notifications_type_check
CHECK (type IN (
    'REACTION',
    'JOIN_REQUEST',
    'JOIN_APPROVED',
    'JOIN_REJECTED',
    'NEW_MESSAGE',
    'FRIEND_REQUEST',
    'MENTOR_BOOKING',
    'PAYMENT_COMPLETE',
    'BADGE_EARNED',
    'POINTS_EARNED',
    'RANK_UP',
    'ACHIEVEMENT'
));

-- Realtime 활성화 확인 (이미 설정된 경우 무시됨)
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================
-- 결과 확인 쿼리
-- ============================================
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'notifications_type_check';
