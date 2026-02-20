-- ============================================
-- Vibe Asset Market: Creator Economy 시스템
-- ============================================

-- 기존 테이블 삭제 (주석 처리: 재실행 시 데이터 유지)
-- DROP TABLE IF EXISTS market_purchases;
-- DROP TABLE IF EXISTS market_assets;

-- 1. market_assets: 판매 중인 에셋 테이블
CREATE TABLE IF NOT EXISTS market_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  price INTEGER DEFAULT 0, -- 구매에 필요한 포인트(XP)
  preview_image_url TEXT,
  sales_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. market_purchases: 구매 내역 테이블
CREATE TABLE IF NOT EXISTS market_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_id UUID REFERENCES market_assets(id) ON DELETE CASCADE NOT NULL,
  price_paid INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, asset_id) -- 중복 구매 방지
);

-- RLS 설정
ALTER TABLE market_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_purchases ENABLE ROW LEVEL SECURITY;

-- 에셋 조회: 누구나 가능
DROP POLICY IF EXISTS "market_assets_select_policy" ON market_assets;
CREATE POLICY "market_assets_select_policy" ON market_assets
FOR SELECT USING (true);

-- 에셋 등록: 인증된 사용자만 가능
DROP POLICY IF EXISTS "market_assets_insert_policy" ON market_assets;
CREATE POLICY "market_assets_insert_policy" ON market_assets
FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- 구매 내역 조회: 본인 것만 가능
DROP POLICY IF EXISTS "market_purchases_select_policy" ON market_purchases;
CREATE POLICY "market_purchases_select_policy" ON market_purchases
FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- RPC: 에셋 구매 함수 (Atomic Transaction)
-- ============================================

CREATE OR REPLACE FUNCTION buy_vibe_asset(p_asset_id UUID)
RETURNS JSON AS $$
DECLARE
  v_asset_price INTEGER;
  v_creator_id UUID;
  v_buyer_points INTEGER;
BEGIN
  -- 1. 에셋 정보 조회 (가격 및 제작자 확인)
  SELECT price, creator_id INTO v_asset_price, v_creator_id
  FROM market_assets WHERE id = p_asset_id;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', '에셋을 찾을 수 없습니다.');
  END IF;

  -- 2. 본인의 에셋인지 확인 (자신의 것은 구매 불가)
  IF v_creator_id = auth.uid() THEN
    RETURN json_build_object('success', false, 'message', '자신의 에셋은 구매할 수 없습니다.');
  END IF;

  -- 3. 이미 구매했는지 확인
  IF EXISTS (SELECT 1 FROM market_purchases WHERE user_id = auth.uid() AND asset_id = p_asset_id) THEN
    RETURN json_build_object('success', false, 'message', '이미 구매한 에셋입니다.');
  END IF;

  -- 4. 구매자 포인트 확인
  SELECT points INTO v_buyer_points FROM profiles WHERE id = auth.uid();
  
  IF v_buyer_points < v_asset_price THEN
    RETURN json_build_object('success', false, 'message', '포인트가 부족합니다.');
  END IF;

  -- 5. 포인트 차감 (구매자)
  UPDATE profiles SET points = COALESCE(points, 0) - v_asset_price WHERE id = auth.uid();

  -- 6. 포인트 지급 (판매자)
  UPDATE profiles SET total_points = COALESCE(total_points, 0) + v_asset_price, points = COALESCE(points, 0) + v_asset_price WHERE id = v_creator_id;

  -- 7. 구매 내역 기록
  INSERT INTO market_purchases (user_id, asset_id, price_paid)
  VALUES (auth.uid(), p_asset_id, v_asset_price);

  -- 8. 판매 수 증가
  UPDATE market_assets SET sales_count = sales_count + 1 WHERE id = p_asset_id;

  RETURN json_build_object('success', true, 'message', '구매가 완료되었습니다!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
