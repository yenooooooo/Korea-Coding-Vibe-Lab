-- ================================================
-- 뱃지 자동 수여 트리거 수정
-- Supabase SQL 편집기에서 실행하세요
-- ================================================
-- 변경사항:
--   1. POST_COUNT 조건 체크 추가 (기존엔 STREAK, VIBE_POINT만 체크)
--   2. SECURITY DEFINER 추가 (RLS 우회하여 user_badges INSERT 가능)

create or replace function check_badge_award()
returns trigger as $$
declare
  target_user_id uuid;
  user_streak int;
  user_posts int;
  user_points int;
  badge record;
begin
  target_user_id := new.id;
  user_streak := new.current_streak;
  user_points := new.total_points;

  -- 게시글 수 조회
  select count(*) into user_posts from posts where user_id = target_user_id;

  -- 모든 뱃지를 순회하며 조건 확인
  for badge in select * from badges loop
    -- STREAK 조건
    if badge.condition_type = 'STREAK' and user_streak >= badge.condition_value then
      insert into user_badges (user_id, badge_id) values (target_user_id, badge.id) on conflict do nothing;
    end if;

    -- VIBE_POINT 조건
    if badge.condition_type = 'VIBE_POINT' and user_points >= badge.condition_value then
      insert into user_badges (user_id, badge_id) values (target_user_id, badge.id) on conflict do nothing;
    end if;

    -- POST_COUNT 조건 (신규 추가)
    if badge.condition_type = 'POST_COUNT' and user_posts >= badge.condition_value then
      insert into user_badges (user_id, badge_id) values (target_user_id, badge.id) on conflict do nothing;
    end if;
  end loop;

  return new;
end;
$$ language plpgsql security definer;
