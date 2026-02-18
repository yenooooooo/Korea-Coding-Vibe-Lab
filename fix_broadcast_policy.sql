-- Admin Broadcasts 테이블에 UPDATE 권한이 없어서 종료(active=false)가 DB에 저장되지 않는 문제 수정

-- 기존 정책이 있다면 삭제 (중복 방지)
DROP POLICY IF EXISTS "Admins can update broadcasts" ON admin_broadcasts;

-- 관리자만 UPDATE 가능하도록 정책 추가
CREATE POLICY "Admins can update broadcasts" ON admin_broadcasts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
