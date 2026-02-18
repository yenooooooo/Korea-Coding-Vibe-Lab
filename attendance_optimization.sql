-- ============================================
-- Attendance Performance Optimization
-- ============================================

-- Home Dashboard에서 '오늘의 열기'와 '접속 중인 유저'를 조회할 때 
-- check_in_date 기준으로 필터링하므로 해당 컬럼에 인덱스가 필요합니다.
-- 기존 unique(user_id, check_in_date)는 user_id가 선행되므로 날짜 단독 조회 시 비효율적일 수 있습니다.

CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(check_in_date);

-- (Optional) leaderboard 조회 시 total_points 정렬 성능 향상
CREATE INDEX IF NOT EXISTS idx_profiles_points ON profiles(total_points DESC);
