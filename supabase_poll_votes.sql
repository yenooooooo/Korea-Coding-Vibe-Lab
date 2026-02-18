-- ============================================
-- Oracle Poll Votes Table
-- Supabase SQL Editor에서 실행
-- ============================================

CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broadcast_id UUID REFERENCES admin_broadcasts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    vote TEXT NOT NULL CHECK (vote IN ('yes', 'no')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(broadcast_id, user_id)
);

ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- 누구나 집계 조회 가능 (선택 사항)
DROP POLICY IF EXISTS "Anyone can read poll votes" ON poll_votes;
CREATE POLICY "Anyone can read poll votes" ON poll_votes
    FOR SELECT USING (true);

-- 로그인 유저만 투표 가능, 본인 투표만
DROP POLICY IF EXISTS "Users can vote once" ON poll_votes;
CREATE POLICY "Users can vote once" ON poll_votes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- Trigger: poll_votes 변경 시 votes_yes/votes_no 자동 동기화
-- =============================================

DROP FUNCTION IF EXISTS sync_poll_vote_counts() CASCADE;

CREATE OR REPLACE FUNCTION sync_poll_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. INSERT: 새 표 추가 (+1)
  IF (TG_OP = 'INSERT') THEN
    UPDATE admin_broadcasts
    SET 
      votes_yes = CASE WHEN NEW.vote = 'yes' THEN votes_yes + 1 ELSE votes_yes END,
      votes_no  = CASE WHEN NEW.vote = 'no'  THEN votes_no + 1  ELSE votes_no END
    WHERE id = NEW.broadcast_id;
    RETURN NEW;

  -- 2. DELETE: 표 삭제 (-1)
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE admin_broadcasts
    SET 
      votes_yes = CASE WHEN OLD.vote = 'yes' THEN votes_yes - 1 ELSE votes_yes END,
      votes_no  = CASE WHEN OLD.vote = 'no'  THEN votes_no - 1  ELSE votes_no END
    WHERE id = OLD.broadcast_id;
    RETURN OLD;

  -- 3. UPDATE: 표 변경 (이전 표 -1, 새 표 +1)
  ELSIF (TG_OP = 'UPDATE') THEN
    -- 투표 내용이 바뀌었을 때만
    IF OLD.vote IS DISTINCT FROM NEW.vote THEN
      UPDATE admin_broadcasts
      SET 
        votes_yes = votes_yes - (CASE WHEN OLD.vote = 'yes' THEN 1 ELSE 0 END) + (CASE WHEN NEW.vote = 'yes' THEN 1 ELSE 0 END),
        votes_no  = votes_no  - (CASE WHEN OLD.vote = 'no'  THEN 1 ELSE 0 END) + (CASE WHEN NEW.vote = 'no'  THEN 1 ELSE 0 END)
      WHERE id = NEW.broadcast_id;
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_poll_vote_counts ON poll_votes;

CREATE TRIGGER trigger_sync_poll_vote_counts
AFTER INSERT OR UPDATE OR DELETE ON poll_votes
FOR EACH ROW
EXECUTE FUNCTION sync_poll_vote_counts();
