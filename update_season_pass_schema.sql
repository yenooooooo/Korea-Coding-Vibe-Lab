-- Season Pass: user_season_progress 테이블에 프리미엄 구매 여부 컬럼 추가

DO $$
BEGIN
    -- is_premium 컬럼 추가 (존재하지 않을 경우에만)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_season_progress' AND column_name = 'is_premium') THEN
        ALTER TABLE public.user_season_progress ADD COLUMN is_premium BOOLEAN DEFAULT false;
    END IF;

    -- premium_claimed_tiers 컬럼 추가 (존재하지 않을 경우에만)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_season_progress' AND column_name = 'premium_claimed_tiers') THEN
        ALTER TABLE public.user_season_progress ADD COLUMN premium_claimed_tiers INT[] DEFAULT '{}';
    END IF;
END $$;
