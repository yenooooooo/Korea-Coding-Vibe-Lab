-- 1. Profile Enhancements
alter table profiles 
add column if not exists bio text,
add column if not exists github_url text,
add column if not exists blog_url text,
add column if not exists tech_stack text[], -- e.g. ['React', 'Python']
add column if not exists vibe_color text default '#6366f1'; -- Default Indigo

-- 2. Vibe Mate (Study Groups)
create table if not exists study_groups (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  tech_tags text[],
  open_chat_url text,
  owner_id uuid references auth.users(id) on delete cascade not null,
  is_active boolean default true,
  current_members int default 1,
  max_members int default 4,
  created_at timestamptz default now()
);

-- Policy for Study Groups
alter table study_groups enable row level security;
create policy "Study Groups are public" on study_groups for select using (true);
create policy "Auth users can create groups" on study_groups for insert with check (auth.uid() = owner_id);
create policy "Owners can update their groups" on study_groups for update using (auth.uid() = owner_id);

-- 3. Gamification (Badges)
create table if not exists badges (
  id text primary key, -- e.g. 'STREAK_7'
  name text not null,
  icon text not null, -- Emoji
  description text not null,
  condition_type text not null, -- 'STREAK', 'POST_COUNT', 'VIBE_POINT'
  condition_value int not null,
  created_at timestamptz default now()
);

-- Seed Initial Badges
insert into badges (id, name, icon, description, condition_type, condition_value) values
('STREAK_3', '작심삼일 탈출', '🐣', '3일 연속 출석 달성', 'STREAK', 3),
('STREAK_7', '버닝 위크', '🔥', '7일 연속 출석 달성', 'STREAK', 7),
('STREAK_30', '성실의 아이콘', '💎', '30일 연속 출석 달성', 'STREAK', 30),
('POST_1', '첫 목소리', '📣', '커뮤니티 첫 글 작성', 'POST_COUNT', 1),
('POST_10', '수다쟁이', '💬', '커뮤니티 글 10개 작성', 'POST_COUNT', 10),
('POINT_100', '레벨업 준비', '⚡', '바이브 포인트 100점 달성', 'VIBE_POINT', 100)
on conflict (id) do nothing;

create table if not exists user_badges (
  user_id uuid references profiles(id) on delete cascade not null,
  badge_id text references badges(id) on delete cascade not null,
  awarded_at timestamptz default now(),
  primary key (user_id, badge_id)
);

-- Policy for User Badges
alter table user_badges enable row level security;
create policy "Badges are public" on user_badges for select using (true);

-- 4. Auto-Award Trigger Logic (Example: Streak)
create or replace function check_badge_award()
returns trigger as $$
declare
  target_user_id uuid;
  user_streak int;
  user_posts int;
  user_points int;
  badge record;
begin
  -- Determine user_id based on table
  if TG_TABLE_NAME = 'profiles' then
    target_user_id := new.id;
    user_streak := new.current_streak;
    user_points := new.total_points;
    -- Count posts (expensive query, maybe optimize later)
    select count(*) into user_posts from posts where user_id = target_user_id;
  end if;

  -- Loop through badges and check conditions
  for badge in select * from badges loop
    -- Check Streak
    if badge.condition_type = 'STREAK' and user_streak >= badge.condition_value then
      insert into user_badges (user_id, badge_id) values (target_user_id, badge.id) on conflict do nothing;
    end if;
    
    -- Check Points
    if badge.condition_type = 'VIBE_POINT' and user_points >= badge.condition_value then
      insert into user_badges (user_id, badge_id) values (target_user_id, badge.id) on conflict do nothing;
    end if;
  end loop;

  return new;
end;
$$ language plpgsql;

-- Trigger on Profile Update (Streak/Points change)
drop trigger if exists on_profile_update_for_badges on profiles;
create trigger on_profile_update_for_badges
  after update on profiles
  for each row execute procedure check_badge_award();
