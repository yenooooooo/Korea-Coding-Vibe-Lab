-- ============================================
-- Vibe Coin Exchange (VCX) Schema
-- ============================================

-- 1. coins: 코인 정보 마스터 테이블
CREATE TABLE IF NOT EXISTS coins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL UNIQUE, -- JS, PYTHON, RUST
  name TEXT NOT NULL,
  current_price DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  price_change_24h DECIMAL(5, 2) DEFAULT 0.00,
  icon TEXT, -- 이모지 또는 이미지 URL
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. coin_history: 가격 변동 기록 (차트용)
CREATE TABLE IF NOT EXISTS coin_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_id UUID REFERENCES coins(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. user_wallets: 사용자 지갑 (코인 보유량)
CREATE TABLE IF NOT EXISTS user_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coin_id UUID REFERENCES coins(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 4) NOT NULL DEFAULT 0, -- 소수점 거래 지원
  average_buy_price DECIMAL(10, 2) NOT NULL DEFAULT 0, -- 평단가
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, coin_id)
);

-- 4. market_transactions: 거래 내역
CREATE TABLE IF NOT EXISTS market_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coin_id UUID REFERENCES coins(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
  amount DECIMAL(10, 4) NOT NULL,
  price_per_coin DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL, -- amount * price_per_coin
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 설정
CREATE INDEX IF NOT EXISTS idx_coin_history_coin_id ON coin_history(coin_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_market_transactions_user_id ON market_transactions(user_id);

-- ============================================
-- RLS 정책
-- ============================================
ALTER TABLE coins ENABLE ROW LEVEL SECURITY;
ALTER TABLE coin_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_transactions ENABLE ROW LEVEL SECURITY;

-- coins, coin_history: 누구나 읽기 가능
CREATE POLICY "coins_select_all" ON coins FOR SELECT USING (true);
CREATE POLICY "coin_history_select_all" ON coin_history FOR SELECT USING (true);

-- user_wallets: 본인만 조회
CREATE POLICY "user_wallets_select_own" ON user_wallets 
  FOR SELECT USING (auth.uid() = user_id);

-- market_transactions: 본인만 조회
CREATE POLICY "market_transactions_select_own" ON market_transactions 
  FOR SELECT USING (auth.uid() = user_id);


-- ============================================
-- 초기 데이터 (Seed Data)
-- ============================================
INSERT INTO coins (symbol, name, current_price, icon, description) VALUES
  ('JS', 'JavaScript', 150.00, '🟨', '웹 개발의 제왕. 변동성이 크지만 인기가 많습니다.'),
  ('PY', 'Python', 200.00, '🐍', 'AI 시대의 대장주. 꾸준한 우상향을 보여줍니다.'),
  ('RUST', 'Rust', 300.00, '🦀', '안정성과 성능을 보장하는 차세대 우량주.'),
  ('GO', 'Go', 120.00, '🐹', '백엔드 개발자들의 숨은 보석.'),
  ('JAVA', 'Java', 180.00, '☕', '엔터프라이즈의 근본. 절대 망하지 않는 안전자산.')
ON CONFLICT (symbol) DO NOTHING;


-- ============================================
-- Functions (RPC)
-- ============================================

-- 1. buy_coin: 코인 매수
CREATE OR REPLACE FUNCTION buy_coin(p_coin_id UUID, p_amount DECIMAL)
RETURNS JSON AS $$
DECLARE
  v_details RECORD; -- total_points
  v_coin_price DECIMAL;
  v_total_cost DECIMAL;
  v_current_wallet RECORD;
  v_new_avg_price DECIMAL;
BEGIN
  -- 코인 가격 조회
  SELECT current_price INTO v_coin_price FROM coins WHERE id = p_coin_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Coin not found');
  END IF;

  v_total_cost := v_coin_price * p_amount;

  -- 사용자 포인트 확인
  SELECT total_points INTO v_details FROM profiles WHERE id = auth.uid();
  IF v_details.total_points < v_total_cost THEN
    RETURN json_build_object('success', false, 'error', 'Not enough points');
  END IF;

  -- 포인트 차감
  UPDATE profiles 
  SET total_points = total_points - v_total_cost 
  WHERE id = auth.uid();

  -- 지갑 업데이트 (평단가 계산)
  SELECT * INTO v_current_wallet FROM user_wallets 
  WHERE user_id = auth.uid() AND coin_id = p_coin_id;

  IF FOUND THEN
    -- 기존 보유량 존재: 평단가 재계산
    -- (기존총액 + 신규매수액) / (기존수량 + 신규수량)
    v_new_avg_price := ((v_current_wallet.amount * v_current_wallet.average_buy_price) + v_total_cost) / (v_current_wallet.amount + p_amount);
    
    UPDATE user_wallets
    SET amount = amount + p_amount,
        average_buy_price = v_new_avg_price,
        updated_at = NOW()
    WHERE id = v_current_wallet.id;
  ELSE
    -- 신규 매수
    INSERT INTO user_wallets (user_id, coin_id, amount, average_buy_price)
    VALUES (auth.uid(), p_coin_id, p_amount, v_coin_price);
  END IF;

  -- 거래 기록
  INSERT INTO market_transactions (user_id, coin_id, type, amount, price_per_coin, total_price)
  VALUES (auth.uid(), p_coin_id, 'BUY', p_amount, v_coin_price, v_total_cost);

  RETURN json_build_object('success', true, 'price', v_coin_price, 'total_cost', v_total_cost);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. sell_coin: 코인 매도
CREATE OR REPLACE FUNCTION sell_coin(p_coin_id UUID, p_amount DECIMAL)
RETURNS JSON AS $$
DECLARE
  v_coin_price DECIMAL;
  v_total_value DECIMAL;
  v_current_wallet RECORD;
BEGIN
  -- 코인 가격 조회
  SELECT current_price INTO v_coin_price FROM coins WHERE id = p_coin_id;
  
  -- 지갑 확인
  SELECT * INTO v_current_wallet FROM user_wallets 
  WHERE user_id = auth.uid() AND coin_id = p_coin_id;

  IF NOT FOUND OR v_current_wallet.amount < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Not enough coins');
  END IF;

  v_total_value := v_coin_price * p_amount;

  -- 코인 차감
  UPDATE user_wallets
  SET amount = amount - p_amount,
      updated_at = NOW()
  WHERE id = v_current_wallet.id;

  -- 포인트 지급
  UPDATE profiles 
  SET total_points = total_points + v_total_value 
  WHERE id = auth.uid();

  -- 거래 기록
  INSERT INTO market_transactions (user_id, coin_id, type, amount, price_per_coin, total_price)
  VALUES (auth.uid(), p_coin_id, 'SELL', p_amount, v_coin_price, v_total_value);

  RETURN json_build_object('success', true, 'price', v_coin_price, 'total_value', v_total_value);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. update_market_prices: 시세 변동 시뮬레이션 (랜덤)
-- 이 함수는 외부 스케줄러(pg_cron 등)나 Edge Function에서 주기적으로 호출해야 함
CREATE OR REPLACE FUNCTION update_market_prices()
RETURNS JSON AS $$
DECLARE
  r RECORD;
  v_old_price DECIMAL;
  v_new_price DECIMAL;
  v_change_percent DECIMAL;
  v_random_factor DECIMAL;
BEGIN
  FOR r IN SELECT * FROM coins LOOP
    v_old_price := r.current_price;
    
    -- -0.5% ~ +0.5% 랜덤 변동 (변동폭 감소로 현실감 부여)
    v_random_factor := (random() * 0.01) - 0.005; 
    v_new_price := v_old_price * (1 + v_random_factor);
    
    -- 최소 가격 방어 (10포인트 이하로 안 떨어지게)
    IF v_new_price < 10 THEN v_new_price := 10; END IF;

    -- 24시간 변동률 (여기서는 간단히 직전 가격 대비 변동률로 저장)
    v_change_percent := ((v_new_price - v_old_price) / v_old_price) * 100;

    -- 가격 업데이트
    UPDATE coins
    SET current_price = ROUND(v_new_price, 2),
        price_change_24h = ROUND(v_change_percent, 2), -- 실제로는 24시간 전 데이터와 비교해야 정확함
        updated_at = NOW()
    WHERE id = r.id;

    -- 히스토리 기록
    INSERT INTO coin_history (coin_id, price)
    VALUES (r.id, ROUND(v_new_price, 2));
    
  END LOOP;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================
-- Realtime 설정
-- ============================================
-- coins 테이블 변경사항 실시간 전송
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE coins;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE coin_history;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
