-- =============================================
-- Admin Title Fix
-- profiles 테이블에 admin_title 컬럼 추가
-- =============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS admin_title TEXT DEFAULT '운영자';

-- Optional: Update existing admins
UPDATE public.profiles 
SET admin_title = '총괄 관리자' 
WHERE is_admin = true AND admin_title IS NULL;
