// Vibe Level System - 1000 Level Expansion
// 포인트 기반 레벨 계산 및 티어 시스템 (10레벨 단위)

/**
 * 10레벨 단위 티어 정보를 정의합니다.
 */
export const LEVEL_TIERS = [
    { name: '비기너', color: '#94a3b8', icon: '🌱', desc: '코딩 바이브의 첫 걸음! 기본적인 활동을 시작하세요.' },      // 1-10
    { name: '루키', color: '#86efac', icon: '🌿', desc: '이제 막 싹을 틔웠습니다. 커뮤니티에 녹아들고 있어요.' },        // 11-20
    { name: '드리머', color: '#67e8f9', icon: '☁️', desc: '큰 꿈을 꾸는 코더입니다. 다양한 기술을 탐색해보세요.' },       // 21-30
    { name: '챌린저', color: '#fca5a5', icon: '🔥', desc: '열정이 타오르기 시작했습니다! 적극적인 활동이 돋보여요.' },      // 31-40
    { name: '스페셜리스트', color: '#8b5cf6', icon: '🔮', desc: '자신만의 전문 분야를 찾아가는 과정에 있습니다.' }, // 41-50
    { name: '엑스퍼트', color: '#f97316', icon: '⚡', desc: '거침없는 실력자! 커뮤니티의 든든한 조력자입니다.' },    // 51-60
    { name: '마스터', color: '#ef4444', icon: '⚔️', desc: '정점에 도달하기 직전입니다. 당신의 바이브는 강력합니다.' },      // 61-70
    { name: '그랜드마스터', color: '#ec4899', icon: '🏰', desc: '성채의 주인처럼 당당한 실력을 갖춘 최고의 바이버입니다.' }, // 71-80
    { name: '레전드', color: '#facc15', icon: '👑', desc: '전설적인 존재! 당신의 한마디가 트렌드가 됩니다.' },      // 81-90
    { name: '미스틱', color: '#10b981', icon: '🐉', desc: '도달할 수 없는 경지. 신비로운 코딩의 신입니다.' },      // 91-100
];

/**
 * 10레벨 단위 티어 정보를 반환합니다.
 * @param {number} level
 */
const getTierInfo = (level) => {
    const tier = Math.floor((level - 1) / 10);
    const tierIndex = tier % 10; // 0-9 Cycle

    // 100레벨 단위로 접두사 추가 (예: 하이퍼 레전드)
    // 100레벨 단위로 접두사 추가 (예: 하이퍼 레전드)
    const superTier = Math.floor((level - 1) / 100);
    let prefix = '';
    let finalIcon = LEVEL_TIERS[tierIndex]?.icon || LEVEL_TIERS[9].icon;
    let finalColor = LEVEL_TIERS[tierIndex]?.color || LEVEL_TIERS[9].color;

    if (superTier >= 1) {
        if (superTier === 1) prefix = '하이퍼 ';
        else if (superTier === 2) prefix = '울트라 ';
        else if (superTier === 3) prefix = '코스믹 ';
        else if (superTier >= 4) prefix = '갓 ';

        // Prestige Icons (Lv.101+)
        // 기존 새싹(🌱) 대신 더 멋진 아이콘으로 교체
        const prestigeIcons = ['💎', '🏆', '🚀', '🌋', '💍', '⛈️', '👹', '🏯', '🤴', '🦄'];
        finalIcon = prestigeIcons[tierIndex] || '💠';

        // Prestige Colors (More Vibrant)
        if (superTier === 1) finalColor = '#818cf8'; // Indigo for Hyper
        if (superTier === 2) finalColor = '#f472b6'; // Pink for Ultra
        if (superTier >= 3) finalColor = '#fbbf24'; // Amber for Cosmic/God
    }

    const baseTier = LEVEL_TIERS[tierIndex] || LEVEL_TIERS[9];

    return {
        name: `${prefix}${baseTier.name}`,
        color: finalColor,
        icon: finalIcon,
        tierIndex
    };
};

/**
 * 포인트 기반으로 현재 레벨 정보를 반환합니다.
 * 공식: Level = Math.floor(Math.sqrt(totalPoints)) + 1
 * 예: 0P -> Lv.1, 100P -> Lv.11, 10000P -> Lv.101
 * @param {number} totalPoints - 사용자의 총 포인트
 * @returns {{ level, title, icon, color, xpCurrent, xpRequired, progress }}
 */
export const getVibeLevel = (totalPoints = 0) => {
    const level = Math.floor(Math.sqrt(totalPoints)) + 1;
    const tierInfo = getTierInfo(level);

    // XP calculation for next level
    // Points for Level L = (L-1)^2
    // Points for Level L+1 = L^2
    const currentLevelBasePoints = Math.pow(level - 1, 2);
    const nextLevelBasePoints = Math.pow(level, 2);

    const xpCurrent = totalPoints - currentLevelBasePoints;
    const xpRequired = nextLevelBasePoints - currentLevelBasePoints;
    const progress = Math.min((xpCurrent / xpRequired) * 100, 100);

    return {
        level,
        title: tierInfo.name,
        icon: tierInfo.icon,
        color: tierInfo.color,
        xpCurrent,
        xpRequired,
        progress,
        isMaxLevel: level >= 1000,
    };
};

/**
 * 스트릭에 따른 콤보 정보를 반환합니다.
 * @param {number} streak - 연속 출석 일수
 * @returns {{ tier, label, flames, color, bonusMultiplier }}
 */
export const getStreakCombo = (streak = 0) => {
    if (streak >= 30) return { tier: 'LEGENDARY', label: '전설의 불꽃', flames: '💎🔥🔥🔥', color: '#facc15', bonusMultiplier: 3, glowColor: 'rgba(250, 204, 21, 0.4)' };
    if (streak >= 14) return { tier: 'EPIC', label: '맹렬한 화염', flames: '🔥🔥🔥', color: '#f97316', bonusMultiplier: 2.5, glowColor: 'rgba(249, 115, 22, 0.3)' };
    if (streak >= 7) return { tier: 'RARE', label: '타오르는 열정', flames: '🔥🔥', color: '#ef4444', bonusMultiplier: 2, glowColor: 'rgba(239, 68, 68, 0.3)' };
    if (streak >= 3) return { tier: 'COMMON', label: '불씨 점화', flames: '🔥', color: '#fb923c', bonusMultiplier: 1.5, glowColor: 'rgba(251, 146, 60, 0.2)' };
    return { tier: 'NONE', label: '시작하기', flames: '💤', color: '#64748b', bonusMultiplier: 1, glowColor: 'transparent' };
};

/**
 * 스트릭 마일스톤 메시지를 반환합니다.
 * @param {number} streak
 * @returns {string|null}
 */
export const getStreakMilestone = (streak) => {
    const milestones = {
        3: '🎉 3일 연속! 작심삼일을 넘었습니다!',
        7: '🔥 7일 연속! 버닝 위크 달성!',
        14: '⚡ 14일 연속! 2주 마라톤 완주!',
        30: '💎 30일 연속! 전설의 바이버 탄생!',
        50: '👑 50일 연속! 바이브 신의 경지!',
        100: '🌟 100일 연속! 불멸의 코더!',
    };
    return milestones[streak] || null;
};

export default { getVibeLevel, getStreakCombo, getStreakMilestone };
