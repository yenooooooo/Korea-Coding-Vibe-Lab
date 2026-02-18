-- ============================================
-- 3. update_market_prices: 시세 변동 시뮬레이션 (랜덤) - 변동폭 수정본
-- ============================================
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
        price_change_24h = ROUND(v_change_percent, 2),
        updated_at = NOW()
    WHERE id = r.id;

    -- 히스토리 기록
    INSERT INTO coin_history (coin_id, price)
    VALUES (r.id, ROUND(v_new_price, 2));
    
  END LOOP;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
