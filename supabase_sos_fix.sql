-- ============================================
-- CodeSOS FK Fix: sos_posts / sos_solutions → profiles
-- Supabase SQL Editor에서 실행
-- ============================================

-- 기존 auth.users FK 제거 후 profiles FK로 교체
-- (PostgREST가 profiles 조인을 인식하려면 profiles를 참조해야 함)

ALTER TABLE sos_posts
  DROP CONSTRAINT IF EXISTS sos_posts_user_id_fkey;

ALTER TABLE sos_posts
  ADD CONSTRAINT sos_posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE sos_solutions
  DROP CONSTRAINT IF EXISTS sos_solutions_user_id_fkey;

ALTER TABLE sos_solutions
  ADD CONSTRAINT sos_solutions_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
