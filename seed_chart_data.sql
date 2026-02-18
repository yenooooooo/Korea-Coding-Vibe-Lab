-- coin_history 초기 데이터 생성 (최근 24시간치 더미 데이터)
DO $$
DECLARE
  r RECORD;
  v_price DECIMAL;
  i INT;
BEGIN
  FOR r IN SELECT * FROM coins LOOP
    v_price := r.current_price;
    
    -- 24시간 전부터 1시간 간격으로 데이터 생성
    FOR i IN 1..24 LOOP
        -- 가격을 약간씩 변동시키며 과거 데이터 생성
        v_price := v_price * (1 + ((random() * 0.1) - 0.05));
        
        INSERT INTO coin_history (coin_id, price, created_at)
        VALUES (r.id, v_price, NOW() - (INTERVAL '1 hour' * (25 - i)));
    END LOOP;
    
    -- 현재 가격으로 마지막 기록
    INSERT INTO coin_history (coin_id, price, created_at)
    VALUES (r.id, r.current_price, NOW());
  END LOOP;
END $$;
