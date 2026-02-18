-- Fix broken placeholder images in profiles and shop_items
-- Replaces 'via.placeholder.com' with 'placehold.co' which is a reliable alternative

-- 1. Fix Profiles (Avatar URLs)
UPDATE profiles
SET avatar_url = REPLACE(avatar_url, 'via.placeholder.com', 'placehold.co')
WHERE avatar_url LIKE '%via.placeholder.com%';

-- 2. Fix Shop Items (Image URLs in JSONB)
-- This requires a slightly more complex query depending on JSON structure, 
-- but a simple text replace on the JSONB column cast to text is often the easiest way for bulk fixes.
UPDATE shop_items
SET item_data = REPLACE(item_data::text, 'via.placeholder.com', 'placehold.co')::jsonb
WHERE item_data::text LIKE '%via.placeholder.com%';

-- 3. Fix any custom image columns if they exist (e.g., in other tables)
-- Add more queries here if needed.

-- 4. Check results
SELECT id, username, avatar_url FROM profiles WHERE avatar_url LIKE '%placehold.co%';
