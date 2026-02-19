-- 멘토 테이블 스키마 업데이트 및 RLS 설정
-- MentorFinding.jsx에서 사용하는 컬럼들이 존재하는지 확인하고 추가합니다.

-- 1. 컬럼 추가 (존재하지 않을 경우에만)
DO $$
BEGIN
    -- title 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'title') THEN
        ALTER TABLE public.mentors ADD COLUMN title text;
    END IF;

    -- introduction 컬럼 추가 (MentorFinding.jsx에서 사용)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'introduction') THEN
        ALTER TABLE public.mentors ADD COLUMN introduction text;
    END IF;

    -- experience 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'experience') THEN
        ALTER TABLE public.mentors ADD COLUMN experience text;
    END IF;

    -- level 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'level') THEN
        ALTER TABLE public.mentors ADD COLUMN level text DEFAULT 'intermediate';
    END IF;

    -- avatar 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'avatar') THEN
        ALTER TABLE public.mentors ADD COLUMN avatar text DEFAULT '🧑‍🏫';
    END IF;

    -- students 컬럼 추가 (학생 수)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'students') THEN
        ALTER TABLE public.mentors ADD COLUMN students integer DEFAULT 0;
    END IF;

    -- response_time 컬럼 추가 (응답 시간)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentors' AND column_name = 'response_time') THEN
        ALTER TABLE public.mentors ADD COLUMN response_time text DEFAULT '1시간 이내';
    END IF;
END $$;

-- 2. 기존 데이터 보정 (NULL 값 채우기)
UPDATE public.mentors SET title = '멘토' WHERE title IS NULL;
UPDATE public.mentors SET introduction = '자기소개가 없습니다.' WHERE introduction IS NULL;
UPDATE public.mentors SET experience = '1년' WHERE experience IS NULL;
UPDATE public.mentors SET level = 'intermediate' WHERE level IS NULL;
UPDATE public.mentors SET avatar = '🧑‍🏫' WHERE avatar IS NULL;
UPDATE public.mentors SET response_time = '1시간 이내' WHERE response_time IS NULL;

-- 3. RLS 활성화 및 정책 설정
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (충돌 방지)
DROP POLICY IF EXISTS "Anyone can view mentors" ON public.mentors;
DROP POLICY IF EXISTS "Mentors can update own profile" ON public.mentors;
DROP POLICY IF EXISTS "Authenticated users can insert" ON public.mentors;

-- 새 정책 생성
-- 1) 누구나 멘토 목록 조회 가능 (비로그인 포함)
CREATE POLICY "Anyone can view mentors" 
ON public.mentors FOR SELECT 
USING (true);

-- 2) 멘토 본인은 자신의 프로필 수정 가능
CREATE POLICY "Mentors can update own profile" 
ON public.mentors FOR UPDATE 
USING (auth.uid() = user_id);

-- 3) 인증된 사용자는 insert 가능 (Trigger 등으로 제어 안 할 경우)
CREATE POLICY "Authenticated users can insert" 
ON public.mentors FOR INSERT 
TO authenticated 
WITH CHECK (true);
