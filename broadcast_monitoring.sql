-- =============================================
-- Broadcast Monitoring System (추가 설정)
-- 기존 admin_broadcasts 테이블 확장 및 모니터링 기능 추가
-- =============================================

-- 1. admin_broadcasts 컬럼 추가 (IF NOT EXISTS 대체)
-- 이미 있으면 무시됨
ALTER TABLE admin_broadcasts
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

ALTER TABLE admin_broadcasts
ADD COLUMN IF NOT EXISTS viewed_count INTEGER DEFAULT 0;

ALTER TABLE admin_broadcasts
ADD COLUMN IF NOT EXISTS votes_yes INTEGER DEFAULT 0;

ALTER TABLE admin_broadcasts
ADD COLUMN IF NOT EXISTS votes_no INTEGER DEFAULT 0;

-- 2. Broadcast Views Table (수신 기록)
CREATE TABLE IF NOT EXISTS broadcast_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES admin_broadcasts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(broadcast_id, user_id)
);

ALTER TABLE broadcast_views ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (기존이 있으면 무시)
DROP POLICY IF EXISTS "Anyone can log broadcast views" ON broadcast_views;
CREATE POLICY "Anyone can log broadcast views" ON broadcast_views
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their own broadcast views" ON broadcast_views;
CREATE POLICY "Users can view their own broadcast views" ON broadcast_views
  FOR SELECT USING (true);

-- 40: ALTER PUBLICATION supabase_realtime ADD TABLE broadcast_views;
-- (이미 추가되어 있다면 위 라인은 에러가 발생하므로 주석 처리하거나 무시하세요)

-- 3. Trigger: broadcast_views INSERT 시 viewed_count 자동 업데이트
-- 3. Trigger: broadcast_views INSERT 시 viewed_count 자동 업데이트 (최적화: +1 연산)
DROP FUNCTION IF EXISTS update_broadcast_viewed_count() CASCADE;

CREATE FUNCTION update_broadcast_viewed_count()
RETURNS TRIGGER AS $$
BEGIN
  -- INSERT 시에만 +1 (뷰는 삭제/수정될 일이 거의 없음)
  UPDATE admin_broadcasts
  SET viewed_count = viewed_count + 1
  WHERE id = NEW.broadcast_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_broadcast_viewed
AFTER INSERT ON broadcast_views
FOR EACH ROW
EXECUTE FUNCTION update_broadcast_viewed_count();
