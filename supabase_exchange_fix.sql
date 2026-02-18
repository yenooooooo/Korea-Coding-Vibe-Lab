-- ============================================
-- Exchange Fix: 코인별 독립 시세 변동 + 24h 정확 계산
-- ============================================

-- 코인 테이블에 고가/저가/거래량 컬럼 추가
ALTER TABLE coins ADD COLUMN IF NOT EXISTS high_24h DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE coins ADD COLUMN IF NOT EXISTS low_24h DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE coins ADD COLUMN IF NOT EXISTS volume_24h DECIMAL(12, 2) DEFAULT 0;

-- update_market_prices: 완전 리팩토링
CREATE OR REPLACE FUNCTION update_market_prices()
RETURNS JSON AS $$
DECLARE
  r RECORD;
  v_old_price NUMERIC;
  v_new_price NUMERIC;
  v_volatility NUMERIC;
  v_trend_bias NUMERIC;
  v_random_walk NUMERIC;
  v_momentum NUMERIC;
  v_change NUMERIC;
  v_price_24h_ago NUMERIC;
  v_change_24h NUMERIC;
  v_base_price NUMERIC;
  v_deviation NUMERIC;
  v_high NUMERIC;
  v_low NUMERIC;
BEGIN
  FOR r IN SELECT * FROM coins LOOP
    v_old_price := r.current_price::NUMERIC;

    -- ========== 코인별 파라미터 ==========
    v_volatility := CASE r.symbol
      WHEN 'JS' THEN 0.028
      WHEN 'PY' THEN 0.016
      WHEN 'RUST' THEN 0.022
      WHEN 'GO' THEN 0.032
      WHEN 'JAVA' THEN 0.012
      ELSE 0.020
    END;

    v_trend_bias := CASE r.symbol
      WHEN 'JS' THEN -0.0008
      WHEN 'PY' THEN  0.0015
      WHEN 'RUST' THEN 0.0010
      WHEN 'GO' THEN  0.0000
      WHEN 'JAVA' THEN -0.0005
      ELSE 0.0
    END;

    v_base_price := CASE r.symbol
      WHEN 'JS' THEN 150
      WHEN 'PY' THEN 200
      WHEN 'RUST' THEN 300
      WHEN 'GO' THEN 120
      WHEN 'JAVA' THEN 180
      ELSE 100
    END;

    -- ========== 모멘텀: 최근 5틱 방향 ==========
    SELECT COALESCE(
      (SELECT AVG(
        CASE WHEN h2.price > h1.price THEN 1
             WHEN h2.price < h1.price THEN -1
             ELSE 0 END
      )
      FROM (
        SELECT price, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
        FROM coin_history WHERE coin_id = r.id ORDER BY created_at DESC LIMIT 6
      ) h1
      JOIN (
        SELECT price, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
        FROM coin_history WHERE coin_id = r.id ORDER BY created_at DESC LIMIT 6
      ) h2 ON h2.rn = h1.rn - 1
      ), 0
    )::NUMERIC INTO v_momentum;

    -- ========== 가격 변동 계산 ==========
    v_random_walk := ((random() * 2 - 1) * v_volatility)::NUMERIC;
    v_change := v_trend_bias + v_random_walk + (v_momentum * v_volatility * 0.3);

    -- 5% 확률: 뉴스 이벤트
    IF random() < 0.05 THEN
      v_change := v_change * (2.0 + random()::NUMERIC * 3.0);
    END IF;

    -- 평균 회귀
    v_deviation := (v_old_price - v_base_price) / v_base_price;
    IF ABS(v_deviation) > 0.5 THEN
      v_change := v_change - (v_deviation * 0.008);
    END IF;

    -- 새 가격
    v_new_price := v_old_price * (1 + v_change);

    -- 범위 제한
    IF v_new_price < 5 THEN v_new_price := (5 + random()::NUMERIC * 10); END IF;
    IF v_new_price > 50000 THEN v_new_price := (50000 - random()::NUMERIC * 500); END IF;

    -- ========== 24시간 변동률 ==========
    SELECT price::NUMERIC INTO v_price_24h_ago
    FROM coin_history
    WHERE coin_id = r.id AND created_at <= NOW() - INTERVAL '24 hours'
    ORDER BY created_at DESC LIMIT 1;

    IF v_price_24h_ago IS NULL OR v_price_24h_ago <= 0 THEN
      SELECT price::NUMERIC INTO v_price_24h_ago
      FROM coin_history
      WHERE coin_id = r.id
      ORDER BY created_at ASC LIMIT 1;
    END IF;

    IF v_price_24h_ago IS NOT NULL AND v_price_24h_ago > 0 THEN
      v_change_24h := ROUND(((v_new_price - v_price_24h_ago) / v_price_24h_ago * 100)::NUMERIC, 2);
    ELSE
      v_change_24h := ROUND((v_change * 100)::NUMERIC, 2);
    END IF;

    -- ========== 24h 고가/저가 ==========
    SELECT COALESCE(MAX(price), v_new_price)::NUMERIC, COALESCE(MIN(price), v_new_price)::NUMERIC
    INTO v_high, v_low
    FROM coin_history
    WHERE coin_id = r.id AND created_at >= NOW() - INTERVAL '24 hours';

    IF v_new_price > v_high THEN v_high := v_new_price; END IF;
    IF v_new_price < v_low THEN v_low := v_new_price; END IF;

    -- ========== 업데이트 ==========
    UPDATE coins
    SET current_price = ROUND(v_new_price::NUMERIC, 2),
        price_change_24h = v_change_24h,
        high_24h = ROUND(v_high::NUMERIC, 2),
        low_24h = ROUND(v_low::NUMERIC, 2),
        volume_24h = COALESCE(volume_24h, 0) + ROUND((v_new_price * (random()::NUMERIC * 5 + 0.5))::NUMERIC, 2),
        updated_at = NOW()
    WHERE id = r.id;

    -- 히스토리 기록
    INSERT INTO coin_history (coin_id, price)
    VALUES (r.id, ROUND(v_new_price::NUMERIC, 2));

  END LOOP;

  -- 오래된 히스토리 정리
  DELETE FROM coin_history WHERE created_at < NOW() - INTERVAL '3 days';

  -- volume 감쇠
  UPDATE coins SET volume_24h = ROUND((volume_24h * 0.995)::NUMERIC, 2) WHERE id IS NOT NULL;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
