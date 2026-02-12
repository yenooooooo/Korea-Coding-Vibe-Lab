-- ================================================
-- 스터디 그룹 멤버 관리 테이블 및 정책
-- Supabase SQL 편집기에서 실행하세요
-- ================================================

-- 0. study_groups.owner_id FK를 profiles(id) 직접 참조로 변경
--    (기존: auth.users(id) → PostgREST가 profiles 조인을 못 찾아 400 오류 발생)
ALTER TABLE study_groups DROP CONSTRAINT IF EXISTS study_groups_owner_id_fkey;
ALTER TABLE study_groups ADD CONSTRAINT study_groups_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 1. study_group_members 테이블 생성
create table if not exists study_group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references study_groups(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  status text not null default 'pending',  -- 'pending', 'approved', 'rejected'
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- 2. RLS 활성화 및 정책 설정
alter table study_group_members enable row level security;

-- 누구나 조회 가능
create policy "Members are public" on study_group_members for select using (true);

-- 인증 사용자가 참여 신청 가능
create policy "Auth users can request join" on study_group_members for insert with check (auth.uid() = user_id);

-- 본인 탈퇴 가능
create policy "Users can leave" on study_group_members for delete using (auth.uid() = user_id);

-- 방장이 멤버 상태 변경(승인/거절) 가능
create policy "Owners can manage members" on study_group_members for update using (
  exists (
    select 1 from study_groups where id = study_group_members.group_id and owner_id = auth.uid()
  )
);

-- 방장이 멤버 삭제(강퇴) 가능
create policy "Owners can kick members" on study_group_members for delete using (
  exists (
    select 1 from study_groups where id = study_group_members.group_id and owner_id = auth.uid()
  )
);

-- 3. current_members 자동 업데이트 트리거
create or replace function update_group_member_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    update study_groups
    set current_members = (
      select count(*) + 1 from study_group_members
      where group_id = NEW.group_id and status = 'approved'
    )
    where id = NEW.group_id;
    return NEW;
  elsif TG_OP = 'DELETE' then
    update study_groups
    set current_members = (
      select count(*) + 1 from study_group_members
      where group_id = OLD.group_id and status = 'approved'
    )
    where id = OLD.group_id;
    return OLD;
  end if;
end;
$$ language plpgsql;

drop trigger if exists on_member_change on study_group_members;
create trigger on_member_change
  after insert or update or delete on study_group_members
  for each row execute procedure update_group_member_count();
