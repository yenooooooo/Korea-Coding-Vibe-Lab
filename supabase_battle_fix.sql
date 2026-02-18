-- ============================================
-- Battle Arena FK Fix: profiles 직접 참조 추가
-- battle_rooms, battle_submissions -> profiles(id) FK 추가
-- (기존 auth.users FK와 별도로 PostgREST 조인용)
-- ============================================

-- battle_rooms.host_id -> profiles(id)
ALTER TABLE battle_rooms
  DROP CONSTRAINT IF EXISTS battle_rooms_host_profiles_fkey;
ALTER TABLE battle_rooms
  ADD CONSTRAINT battle_rooms_host_profiles_fkey
  FOREIGN KEY (host_id) REFERENCES profiles(id);

-- battle_rooms.guest_id -> profiles(id)
ALTER TABLE battle_rooms
  DROP CONSTRAINT IF EXISTS battle_rooms_guest_profiles_fkey;
ALTER TABLE battle_rooms
  ADD CONSTRAINT battle_rooms_guest_profiles_fkey
  FOREIGN KEY (guest_id) REFERENCES profiles(id);

-- battle_submissions.user_id -> profiles(id)
ALTER TABLE battle_submissions
  DROP CONSTRAINT IF EXISTS battle_submissions_user_profiles_fkey;
ALTER TABLE battle_submissions
  ADD CONSTRAINT battle_submissions_user_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id);
