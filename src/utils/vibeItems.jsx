import React from 'react';

/**
 * Vibe Shop Items Utility
 * Handles visual rendering of equipped items.
 */

export const getNameEffectStyle = (item) => {
    if (!item) return {};

    switch (item.name) {
        case '네온 글로우':
            return {
                color: '#c4b5fd',
                textShadow: '0 0 10px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.5)',
                fontWeight: 'bold'
            };
        case '레인보우':
            return {
                background: 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #4169e1, #ff0080)',
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 'bold',
                animation: 'vibe-rainbow 3s linear infinite'
            };
        case '골드 닉네임':
            return {
                color: '#fbbf24',
                textShadow: '0 0 8px rgba(234, 179, 8, 0.4)',
                fontWeight: '800'
            };
        default:
            return { color: '#a78bfa', fontWeight: 'bold' };
    }
};

export const getBannerStyle = (item) => {
    if (!item) return 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)';

    switch (item.name) {
        case '우주 그라데이션':
            return 'linear-gradient(90deg, #1e1b4b, #312e81, #4c1d95, #312e81, #1e1b4b)';
        case '매트릭스 스타일':
            return 'linear-gradient(90deg, #022c22, #064e3b, #065f46, #064e3b, #022c22)';
        case '파랑새':
            return 'linear-gradient(135deg, #0ea5e9, #38bdf8)';
        case '파티클 효과':
        case '딥 퍼플':
        default:
            return 'linear-gradient(90deg, #4c1d95, #6b21a8, #7c3aed, #6b21a8, #4c1d95)';
    }
};

/**
 * 헬퍼 함수: equipped_items JSON에서 아이템 상세 정보를 가져오는 질의 생성
 */
export const fetchEquippedDetails = async (supabase, equippedItems) => {
    if (!equippedItems || Object.keys(equippedItems).length === 0) return {};

    const itemIds = Object.values(equippedItems).filter(v => v !== null);
    if (itemIds.length === 0) return {};

    const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .in('id', itemIds);

    if (error) {
        console.error('Error fetching item details:', error);
        return {};
    }

    // 카테고리별로 리빌딩
    return data.reduce((acc, item) => {
        acc[item.category] = item;
        return acc;
    }, {});
};

/**
 * 대량의 유저들에 대해 장착 상세 정보를 한 번에 가져오는 함수 (성능 최적화용)
 * @returns {Promise<Object>} { userId: { category: itemDetail } }
 */
export const fetchBatchEquippedDetails = async (supabase, profiles) => {
    if (!profiles || profiles.length === 0) return {};

    // 모든 장착 아이템 ID 추출
    const allItemIds = new Set();
    profiles.forEach(p => {
        if (p.equipped_items) {
            Object.values(p.equipped_items).forEach(id => {
                if (id) allItemIds.add(id);
            });
        }
    });

    if (allItemIds.size === 0) return {};

    const { data: items, error } = await supabase
        .from('shop_items')
        .select('*')
        .in('id', Array.from(allItemIds));

    if (error) {
        console.error('Error batch fetching item details:', error);
        return {};
    }

    // 아이템 ID -> 상세 정보 맵 생성
    const itemMap = items.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
    }, {});

    // 유저 ID -> (카테고리 -> 상세 정보) 맵 생성
    return profiles.reduce((acc, p) => {
        if (p.equipped_items) {
            const userDetails = {};
            Object.entries(p.equipped_items).forEach(([category, id]) => {
                if (id && itemMap[id]) {
                    userDetails[category] = itemMap[id];
                }
            });
            acc[p.id] = userDetails;
        } else {
            acc[p.id] = {};
        }
        return acc;
    }, {});
};

/**
 * 렌더링용 컴포넌트 래퍼
 */
export const VibeName = ({ name, effectItem, style = {} }) => {
    const effectStyle = getNameEffectStyle(effectItem);

    return (
        <>
            <style>{`
                @keyframes vibe-rainbow {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 200% 50%; }
                }
                @keyframes vibe-neon-pulse {
                    0%, 100% { opacity: 0.8; text-shadow: 0 0 10px rgba(168, 85, 247, 0.8); }
                    50% { opacity: 1; text-shadow: 0 0 20px rgba(168, 85, 247, 1), 0 0 30px rgba(168, 85, 247, 0.8); }
                }
            `}</style>
            <span style={{
                ...style,
                ...effectStyle,
                ...(effectItem?.name === '네온 글로우' ? { animation: 'vibe-neon-pulse 2s infinite ease-in-out' } : {})
            }}>
                {name}
            </span>
        </>
    );
};
