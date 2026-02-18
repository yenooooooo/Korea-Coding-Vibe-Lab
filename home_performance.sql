-- =============================================
-- Home & Dashboard Performance Optimization
-- =============================================

-- 1. Attendance Date Index
-- 'TODAY'S HEAT' 및 'ACTIVE SQUAD' 쿼리 성능 향상 (날짜 기준 조회)
CREATE INDEX IF NOT EXISTS idx_attendance_check_in_date ON attendance(check_in_date);

-- 2. User Attendance Lookup Index
-- 'My Vibe Stats'에서 특정 유저의 오늘 출석 여부 확인 성능 향상
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance(user_id, check_in_date);

-- 3. Leaderboard Index (Hall of Fame)
-- 'HALL OF FAME' 쿼리 성능 향상 (총 포인트 내림차순 정렬)
CREATE INDEX IF NOT EXISTS idx_profiles_total_points ON profiles(total_points DESC);

-- 4. Shop Items Index (Bonus)
-- Vibe Shop 아이템 정렬 및 필터링 성능 향상
CREATE INDEX IF NOT EXISTS idx_shop_items_price_active ON shop_items(price ASC, is_active);
