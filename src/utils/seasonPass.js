// Season Pass - 시즌제 보상 트랙 시스템
// 월간 시즌 (현재 월 기준), 30단계, 매 단계 50 XP

const XP_PER_TIER = 50;
const MAX_TIER = 30;

/**
 * 현재 시즌 정보
 */
export function getCurrentSeason() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, '0')}`;

    // 시즌 종료일 (월말)
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = new Date(year, month - 1, lastDay, 23, 59, 59);
    const daysLeft = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

    // 시즌명
    const seasonNames = {
        1: '겨울의 코더', 2: '봄을 여는 코더', 3: '봄바람 코더',
        4: '벚꽃 코더', 5: '초여름 코더', 6: '여름의 코더',
        7: '불꽃 코더', 8: '한여름 코더', 9: '가을의 코더',
        10: '단풍 코더', 11: '초겨울 코더', 12: '눈꽃 코더',
    };

    const seasonEmojis = {
        1: '❄️', 2: '🌸', 3: '🌿', 4: '🌺', 5: '☀️', 6: '🌊',
        7: '🔥', 8: '⛱️', 9: '🍂', 10: '🍁', 11: '🌬️', 12: '⛄',
    };

    return {
        key,
        year,
        month,
        name: seasonNames[month],
        emoji: seasonEmojis[month],
        daysLeft,
        endDate,
        totalDays: lastDay,
    };
}

/**
 * 30단계 무료 트랙 보상
 */
export const FREE_REWARDS = [
    { tier: 1, type: 'points', value: 50, label: '50 포인트', icon: '💰' },
    { tier: 2, type: 'points', value: 50, label: '50 포인트', icon: '💰' },
    { tier: 3, type: 'points', value: 100, label: '100 포인트', icon: '💰' },
    { tier: 4, type: 'points', value: 100, label: '100 포인트', icon: '💰' },
    { tier: 5, type: 'badge', value: 'season_5', label: '시즌 탐험가 뱃지', icon: '🏅', special: true },
    { tier: 6, type: 'points', value: 150, label: '150 포인트', icon: '💰' },
    { tier: 7, type: 'points', value: 150, label: '150 포인트', icon: '💰' },
    { tier: 8, type: 'points', value: 150, label: '150 포인트', icon: '💰' },
    { tier: 9, type: 'points', value: 200, label: '200 포인트', icon: '💰' },
    { tier: 10, type: 'badge', value: 'season_10', label: '시즌 모험가 뱃지', icon: '🎖️', special: true },
    { tier: 11, type: 'points', value: 200, label: '200 포인트', icon: '💰' },
    { tier: 12, type: 'points', value: 200, label: '200 포인트', icon: '💰' },
    { tier: 13, type: 'points', value: 250, label: '250 포인트', icon: '💰' },
    { tier: 14, type: 'points', value: 250, label: '250 포인트', icon: '💰' },
    { tier: 15, type: 'badge', value: 'season_15', label: '시즌 전사 뱃지', icon: '⚔️', special: true },
    { tier: 16, type: 'points', value: 300, label: '300 포인트', icon: '💰' },
    { tier: 17, type: 'points', value: 300, label: '300 포인트', icon: '💰' },
    { tier: 18, type: 'points', value: 300, label: '300 포인트', icon: '💰' },
    { tier: 19, type: 'points', value: 350, label: '350 포인트', icon: '💰' },
    { tier: 20, type: 'badge', value: 'season_20', label: '시즌 챔피언 뱃지', icon: '🏆', special: true },
    { tier: 21, type: 'points', value: 350, label: '350 포인트', icon: '💰' },
    { tier: 22, type: 'points', value: 400, label: '400 포인트', icon: '💰' },
    { tier: 23, type: 'points', value: 400, label: '400 포인트', icon: '💰' },
    { tier: 24, type: 'points', value: 450, label: '450 포인트', icon: '💰' },
    { tier: 25, type: 'badge', value: 'season_25', label: '시즌 레전드 뱃지', icon: '👑', special: true },
    { tier: 26, type: 'points', value: 500, label: '500 포인트', icon: '💰' },
    { tier: 27, type: 'points', value: 500, label: '500 포인트', icon: '💰' },
    { tier: 28, type: 'points', value: 500, label: '500 포인트', icon: '💰' },
    { tier: 29, type: 'points', value: 600, label: '600 포인트', icon: '💰' },
    { tier: 30, type: 'title', value: 'season_master', label: '시즌 마스터 칭호', icon: '🐉', special: true },
];

/**
 * 30단계 프리미엄 트랙 보상 (추후 해금 예정)
 * 무료 트랙 대비 추가 보상 (포인트 2배 + 한정 스킨/이펙트)
 */
export const PREMIUM_REWARDS = [
    { tier: 1, type: 'points', value: 100, label: '100 포인트', icon: '💎' },
    { tier: 2, type: 'points', value: 100, label: '100 포인트', icon: '💎' },
    { tier: 3, type: 'points', value: 200, label: '200 포인트', icon: '💎' },
    { tier: 4, type: 'points', value: 200, label: '200 포인트', icon: '💎' },
    { tier: 5, type: 'effect', value: 'neon_glow', label: '네온 글로우 효과', icon: '✨', special: true },
    { tier: 6, type: 'points', value: 300, label: '300 포인트', icon: '💎' },
    { tier: 7, type: 'points', value: 300, label: '300 포인트', icon: '💎' },
    { tier: 8, type: 'points', value: 300, label: '300 포인트', icon: '💎' },
    { tier: 9, type: 'points', value: 400, label: '400 포인트', icon: '💎' },
    { tier: 10, type: 'skin', value: 'hologram_card', label: '홀로그램 카드 스킨', icon: '🌈', special: true },
    { tier: 11, type: 'points', value: 400, label: '400 포인트', icon: '💎' },
    { tier: 12, type: 'points', value: 400, label: '400 포인트', icon: '💎' },
    { tier: 13, type: 'points', value: 500, label: '500 포인트', icon: '💎' },
    { tier: 14, type: 'points', value: 500, label: '500 포인트', icon: '💎' },
    { tier: 15, type: 'effect', value: 'flame_aura', label: '플레임 오라 효과', icon: '🔥', special: true },
    { tier: 16, type: 'points', value: 600, label: '600 포인트', icon: '💎' },
    { tier: 17, type: 'points', value: 600, label: '600 포인트', icon: '💎' },
    { tier: 18, type: 'points', value: 600, label: '600 포인트', icon: '💎' },
    { tier: 19, type: 'points', value: 700, label: '700 포인트', icon: '💎' },
    { tier: 20, type: 'skin', value: 'galaxy_frame', label: '갤럭시 프레임', icon: '🌌', special: true },
    { tier: 21, type: 'points', value: 700, label: '700 포인트', icon: '💎' },
    { tier: 22, type: 'points', value: 800, label: '800 포인트', icon: '💎' },
    { tier: 23, type: 'points', value: 800, label: '800 포인트', icon: '💎' },
    { tier: 24, type: 'points', value: 900, label: '900 포인트', icon: '💎' },
    { tier: 25, type: 'effect', value: 'lightning', label: '라이트닝 이펙트', icon: '⚡', special: true },
    { tier: 26, type: 'points', value: 1000, label: '1000 포인트', icon: '💎' },
    { tier: 27, type: 'points', value: 1000, label: '1000 포인트', icon: '💎' },
    { tier: 28, type: 'points', value: 1000, label: '1000 포인트', icon: '💎' },
    { tier: 29, type: 'points', value: 1200, label: '1200 포인트', icon: '💎' },
    { tier: 30, type: 'title', value: 'season_legend', label: '시즌 레전드 칭호 + 전용 아우라', icon: '🐲', special: true },
];

/**
 * 활동 기반 시즌 XP 계산
 * 현재 시즌(월) 내의 활동만 집계
 */
export async function calculateSeasonXP(userId, supabase) {
    const season = getCurrentSeason();
    const startDate = `${season.key}-01`;
    const endDate = `${season.key}-${String(season.totalDays).padStart(2, '0')}`;

    const [attendanceRes, postsRes, commentsRes, questRes, battleRes] = await Promise.all([
        supabase.from('attendance').select('id')
            .eq('user_id', userId)
            .gte('check_in_date', startDate)
            .lte('check_in_date', endDate),
        supabase.from('board_posts').select('id, content, created_at')
            .eq('user_id', userId)
            .gte('created_at', `${startDate}T00:00:00`)
            .lte('created_at', `${endDate}T23:59:59`),
        supabase.from('board_comments').select('id, content, created_at')
            .eq('user_id', userId)
            .gte('created_at', `${startDate}T00:00:00`)
            .lte('created_at', `${endDate}T23:59:59`),
        supabase.from('user_quests').select('id')
            .eq('user_id', userId)
            .eq('is_completed', true)
            .gte('assigned_at', `${startDate}T00:00:00`)
            .lte('assigned_at', `${endDate}T23:59:59`),
        supabase.from('battle_rooms').select('id, winner_id, started_at, ended_at')
            .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
            .eq('status', 'finished')
            .gte('created_at', `${startDate}T00:00:00`)
            .lte('created_at', `${endDate}T23:59:59`),
    ]);

    const attendance = attendanceRes.data || [];
    const posts = postsRes.data || [];
    const comments = commentsRes.data || [];
    const quests = questRes.data || [];
    const battles = battleRes.data || [];

    // --- Anti-Abuse & Validations ---

    // 1. 게시글: 20자 이상만 인정, 하루 최대 5개
    const validPosts = posts.filter(p => p.content.length >= 20);
    const postsByDate = {};
    validPosts.forEach(p => {
        const date = p.created_at.split('T')[0];
        postsByDate[date] = (postsByDate[date] || 0) + 1;
    });
    let countedPosts = 0;
    Object.values(postsByDate).forEach(count => {
        countedPosts += Math.min(count, 5); // 일일 최대 5개
    });

    // 2. 댓글: 20자 이상만 인정, 하루 최대 5개
    const validComments = comments.filter(c => c.content.length >= 20);
    const commentsByDate = {};
    validComments.forEach(c => {
        const date = c.created_at.split('T')[0];
        commentsByDate[date] = (commentsByDate[date] || 0) + 1;
    });
    let countedComments = 0;
    Object.values(commentsByDate).forEach(count => {
        countedComments += Math.min(count, 5); // 일일 최대 5개
    });

    // 3. 배틀: 30초 이상 진행된 배틀만 인정, 하루 최대 10판
    const validBattles = battles.filter(b => {
        if (!b.started_at || !b.ended_at) return false;
        const duration = (new Date(b.ended_at) - new Date(b.started_at)) / 1000;
        return duration >= 30; // 30초 이상
    });

    // 배틀은 날짜별 제한보다는 전체 제한이 낫지만, 일관성을 위해 날짜별 제한 적용 (필요하다면)
    // 여기서는 일단 단순하게 전체 갯수 제한 혹은 날짜별 제한 적용
    // 배틀은 피로도가 높으므로 하루 10판 제한
    const battlesByDate = {};
    validBattles.forEach(b => {
        const date = b.started_at.split('T')[0]; // started_at 기준
        battlesByDate[date] = (battlesByDate[date] || []);
        battlesByDate[date].push(b);
    });

    let countedBattles = 0;
    let countedWins = 0;

    Object.values(battlesByDate).forEach(dailyBattles => {
        const limitedBattles = dailyBattles.slice(0, 10); // 하루 최대 10판
        countedBattles += limitedBattles.length;
        countedWins += limitedBattles.filter(b => b.winner_id === userId).length;
    });

    const xp =
        attendance.length * 10 +    // 출석 (일 1회 이미 DB에서 보장됨 - composite key)
        countedPosts * 15 +         // 게시글 (보정됨)
        countedComments * 5 +       // 댓글 (보정됨)
        quests.length * 20 +        // 퀘스트
        countedBattles * 25 +       // 배틀 참여 (보정됨)
        countedWins * 15;           // 배틀 승리 (보정됨)

    const currentTier = Math.min(Math.floor(xp / XP_PER_TIER), MAX_TIER);

    return { xp, currentTier };
}

export { XP_PER_TIER, MAX_TIER };
