-- coins 테이블의 변경사항이 확실히 전송되도록 설정
ALTER TABLE coins REPLICA IDENTITY FULL;

-- realtime publication에 안전하게 추가 (이미 있어도 에러 안 나게 처리)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE coins;
  EXCEPTION WHEN duplicate_object THEN
    -- 이미 추가되어 있으면 무시함
    NULL;
  END;
END $$;

-- 확인용: 강제로 하나 업데이트 해보기
UPDATE coins SET current_price = current_price WHERE symbol = 'JS';
