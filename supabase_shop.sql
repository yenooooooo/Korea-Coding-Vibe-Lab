-- =============================================
-- Vibe Shop Tables
-- =============================================

-- 상점 아이템 테이블
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'avatar', 'name_effect', 'badge', 'banner'
  price INT NOT NULL,
  item_data JSONB NOT NULL, -- { imageUrl, effect, cssClass, etc }
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 사용자 인벤토리 테이블
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT false,
  UNIQUE(user_id, item_id)
);

-- profiles 테이블에 장착 아이템 컬럼 추가
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equipped_items JSONB DEFAULT '{}';

-- RLS 정책
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- 모든 유저가 상점 아이템 조회 가능
CREATE POLICY "Anyone can view shop items" ON shop_items FOR SELECT USING (is_active = true);

-- 본인 인벤토리만 조회/수정 가능
CREATE POLICY "Users can view own inventory" ON user_inventory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert to own inventory" ON user_inventory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inventory" ON user_inventory FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 초기 상점 아이템 데이터
-- =============================================

-- 아바타 (300P ~ 800P)
INSERT INTO shop_items (name, description, category, price, item_data) VALUES
  ('네온 고양이', '빛나는 네온 색상의 귀여운 고양이 아바타 ⭐', 'avatar', 300, '{"imageUrl": "/avatars/neon_cat.png", "style": "neon", "emoji": "🐱"}'),
  ('골드 로봇', '황금빛으로 빛나는 프리미엄 로봇', 'avatar', 500, '{"imageUrl": "/avatars/gold_robot.png", "style": "gold", "emoji": "🤖"}'),
  ('사이버펑크 해커', '미래적인 감성의 사이버펑크 스타일', 'avatar', 800, '{"imageUrl": "/avatars/cyberpunk.png", "style": "cyberpunk", "emoji": "👾"}');

-- 닉네임 효과 (600P ~ 1,500P)
INSERT INTO shop_items (name, description, category, price, item_data) VALUES
  ('네온 글로우', '닉네임 주위에 은은한 네온 빛 효과', 'name_effect', 600, '{"effect": "neon-glow", "color": "#a5b4fc", "emoji": "✨"}'),
  ('레인보우', '무지개색으로 반짝이는 그라데이션 효과', 'name_effect', 1000, '{"effect": "rainbow", "animation": "gradient-shift", "emoji": "🌈"}'),
  ('타이핑 효과', '타자기처럼 글자가 나타나는 애니메이션', 'name_effect', 1500, '{"effect": "typing", "speed": "medium", "emoji": "⚡"}');

-- 명예 배지 (800P ~ 2,000P)
INSERT INTO shop_items (name, description, category, price, item_data) VALUES
  ('🔥 성실의 신', '끊임없는 출석으로 얻는 영광의 배지', 'badge', 800, '{"emoji": "🔥", "label": "성실의 신", "color": "#ef4444"}'),
  ('💻 코드 마스터', '코딩 실력을 인정받은 개발자의 증표', 'badge', 1200, '{"emoji": "💻", "label": "코드 마스터", "color": "#3b82f6"}'),
  ('👑 바이브 킹', '커뮤니티의 왕! 최고의 활동가', 'badge', 2000, '{"emoji": "👑", "label": "바이브 킹", "color": "#eab308"}');

-- 프로필 배너 (1,000P ~ 2,500P)
INSERT INTO shop_items (name, description, category, price, item_data) VALUES
  ('우주 그라데이션', '신비로운 우주 색감의 배경', 'banner', 1000, '{"gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", "emoji": "🌌"}'),
  ('매트릭스 스타일', '해커 감성 매트릭스 코드 배경', 'banner', 1500, '{"gradient": "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", "effect": "matrix", "emoji": "💚"}'),
  ('파티클 효과', '떠다니는 파티클이 있는 프리미엄 배경', 'banner', 2500, '{"gradient": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", "effect": "particles", "emoji": "🎆"}');

NOTIFY pgrst, 'reload config';
