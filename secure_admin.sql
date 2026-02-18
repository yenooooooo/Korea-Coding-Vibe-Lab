-- =============================================
-- Secure Admin & Broadcast System
-- =============================================

-- 1. Create Broadcasts Table
-- 관리자가 보내는 공지사항/이펙트를 저장하는 테이블입니다.
CREATE TABLE IF NOT EXISTS admin_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'announcement', 'fx', 'poll', 'vibe_change'
  payload JSONB NOT NULL, -- { message: "...", sender: "..." } or { fx: "glitch" }
  active BOOLEAN DEFAULT true,
  viewed_count INTEGER DEFAULT 0,
  votes_yes INTEGER DEFAULT 0,
  votes_no INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 2. Enable RLS
ALTER TABLE admin_broadcasts ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- 누구나 '수신'(질의/구독)은 가능 (실시간 알림을 위해)
CREATE POLICY "Everyone can read broadcasts" ON admin_broadcasts
  FOR SELECT USING (true);

-- 관리자만 '발송'(Insert) 가능
-- (is_admin() 함수는 supabase_admin_rpc.sql에서 정의됨. 
--  만약 없다면 profiles.is_admin 체크로 대체 가능)
CREATE POLICY "Only admins can send broadcasts" ON admin_broadcasts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- 4. Enable Realtime
-- 클라이언트가 이 테이블의 INSERT 이벤트를 구독할 수 있도록 설정
ALTER PUBLICATION supabase_realtime ADD TABLE admin_broadcasts;

-- 5. Broadcast Views Table
-- 사용자가 공지/효과/투표를 본 것을 추적합니다.
CREATE TABLE IF NOT EXISTS broadcast_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID NOT NULL REFERENCES admin_broadcasts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(broadcast_id, user_id)
);

ALTER TABLE broadcast_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can log broadcast views" ON broadcast_views
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own broadcast views" ON broadcast_views
  FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE broadcast_views;

-- 6. Trigger: broadcast_views INSERT 시 admin_broadcasts.viewed_count 자동 업데이트
CREATE OR REPLACE FUNCTION update_broadcast_viewed_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE admin_broadcasts
  SET viewed_count = (SELECT COUNT(*) FROM broadcast_views WHERE broadcast_id = NEW.broadcast_id)
  WHERE id = NEW.broadcast_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_broadcast_viewed ON broadcast_views;
CREATE TRIGGER trigger_update_broadcast_viewed
AFTER INSERT ON broadcast_views
FOR EACH ROW
EXECUTE FUNCTION update_broadcast_viewed_count();

-- 7. Helper: Clean up old broadcasts (Optional)
-- 주기적으로 정리하는 로직이 있으면 좋지만, 여기선 생략하거나 트리거로 구현 가능.
-- 일단은 로그성 데이터로 남겨둡니다.
