-- =============================================
-- Vibe Shop Level Gating Update
-- =============================================

-- 1. Add min_level column to shop_items table
ALTER TABLE shop_items ADD COLUMN IF NOT EXISTS min_level INT DEFAULT 1;

-- 2. Update min_level for existing items (based on price/tier)

-- Avatar (Default: 1, Premium: 10, Legendary: 50)
UPDATE shop_items SET min_level = 1 WHERE category = 'avatar' AND price < 500;
UPDATE shop_items SET min_level = 10 WHERE category = 'avatar' AND price >= 500 AND price < 800;
UPDATE shop_items SET min_level = 20 WHERE category = 'avatar' AND price >= 800;

-- Name Effect (Default: 5, Premium: 15, Legendary: 30)
UPDATE shop_items SET min_level = 5 WHERE category = 'name_effect' AND price < 1000;
UPDATE shop_items SET min_level = 15 WHERE category = 'name_effect' AND price >= 1000 AND price < 1500;
UPDATE shop_items SET min_level = 30 WHERE category = 'name_effect' AND price >= 1500;

-- Badge (Honor specific levels)
-- 성실의 신 (Lv.10)
UPDATE shop_items SET min_level = 10 WHERE category = 'badge' AND name LIKE '%성실%';
-- 코드 마스터 (Lv.30)
UPDATE shop_items SET min_level = 30 WHERE category = 'badge' AND name LIKE '%코드 마스터%';
-- 바이브 킹 (Lv.50)
UPDATE shop_items SET min_level = 50 WHERE category = 'badge' AND name LIKE '%바이브 킹%';

-- Banner (Premium: 20, High: 40, Legend: 80)
UPDATE shop_items SET min_level = 20 WHERE category = 'banner' AND price < 1500;
UPDATE shop_items SET min_level = 40 WHERE category = 'banner' AND price >= 1500 AND price < 2500;
UPDATE shop_items SET min_level = 80 WHERE category = 'banner' AND price >= 2500;

-- 3. Reload schema cache
NOTIFY pgrst, 'reload config';
