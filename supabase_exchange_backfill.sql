-- ============================================
-- Exchange Backfill: 페이지 접속 시 자연스러운 히스토리 생성
-- ============================================
-- 문제: market maker가 클라이언트 setInterval이라 페이지를 닫으면 데이터 생성 중단
-- 해결: 페이지 접속 시 최근 2시간치 히스토리를 자연스러운 랜덤워크로 backfill

CREATE OR REPLACE FUNCTION backfill_coin_history()
RETURNS void AS $$
DECLARE
  r RECORD;
  v_latest_time TIMESTAMPTZ;
  v_price NUMERIC;
  v_change NUMERIC;
  v_base NUMERIC;
  v_volatility NUMERIC;
  i INT;
  v_total_points INT := 120; -- 2시간, 1분 간격
BEGIN
  FOR r IN SELECT * FROM coins LOOP
    -- 가장 최근 히스토리 확인
    SELECT MAX(created_at) INTO v_latest_time
    FROM coin_history WHERE coin_id = r.id;

    -- 2분 이상 갭이 있으면 backfill
    IF v_latest_time IS NULL OR v_latest_time < NOW() - INTERVAL '2 minutes' THEN
      -- 오래된 데이터 삭제 (깔끔하게 재생성)
      DELETE FROM coin_history WHERE coin_id = r.id;

      v_base := r.current_price::NUMERIC;

      -- 코인별 변동성
      v_volatility := CASE r.symbol
        WHEN 'JS' THEN 0.015
        WHEN 'PY' THEN 0.010
        WHEN 'RUST' THEN 0.013
        WHEN 'GO' THEN 0.018
        WHEN 'JAVA' THEN 0.008
        ELSE 0.012
      END;

      -- 2시간 전 시작 가격 (현재가의 90~110%)
      v_price := v_base * (0.92 + random()::NUMERIC * 0.16);

      -- 120개 포인트 생성 (2시간, 1분 간격)
      FOR i IN REVERSE v_total_points..1 LOOP
        -- 랜덤 변동 + 현재가 방향으로 드리프트
        v_change := ((random() * 2 - 1)::NUMERIC * v_volatility);
        v_change := v_change + ((v_base - v_price) / v_base * 0.025)::NUMERIC;
        v_price := v_price * (1 + v_change);

        -- 최소 가격 보장
        IF v_price < 5 THEN v_price := 5 + random()::NUMERIC * 10; END IF;

        INSERT INTO coin_history (coin_id, price, created_at)
        VALUES (r.id, ROUND(v_price, 2), NOW() - (i * INTERVAL '1 minute'));
      END LOOP;

      -- 현재 시점 = 현재 가격
      INSERT INTO coin_history (coin_id, price, created_at)
      VALUES (r.id, r.current_price, NOW());
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
