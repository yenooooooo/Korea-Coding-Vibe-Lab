-- =============================================
-- Vibe Feedback System
-- 사용자 피드백(버그, 문의 등) 테이블 및 권한 설정
-- =============================================

-- 1. Create Feedback Table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('BUG_REPORT', 'INQUIRY', 'SUGGESTION', 'OTHER')),
    content TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'READ', 'RESOLVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('kst', now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('kst', now())
);

-- 2. Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 3. Policies

-- 3.1 Insert: Authenticated users can create feedback
CREATE POLICY "Users can create feedback"
ON public.feedback FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3.2 Select: Users can view their own feedback, Admins can view all
CREATE POLICY "Users view own, Admins view all"
ON public.feedback FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 3.3 Update: Only Admins can update feedback (e.g., changing status)
CREATE POLICY "Admins can update feedback status"
ON public.feedback FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 4. Realtime subscription (Optional, for admin panel live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedback;
