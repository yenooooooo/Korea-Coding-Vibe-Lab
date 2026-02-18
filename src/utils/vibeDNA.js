// Vibe DNA - 개발자 성향 분석 시스템
// 6가지 축: 꾸준함, 열정, 소통력, 문제해결, 도전정신, 성장

const DNA_AXES = ['consistency', 'passion', 'social', 'problemSolving', 'challenge', 'growth'];

const AXIS_LABELS = {
    consistency: '꾸준함',
    passion: '열정',
    social: '소통력',
    problemSolving: '문제해결',
    challenge: '도전정신',
    growth: '성장',
};

const AXIS_ICONS = {
    consistency: '📅',
    passion: '🔥',
    social: '💬',
    problemSolving: '🔧',
    challenge: '⚔️',
    growth: '🌱',
};

const AXIS_COLORS = {
    consistency: '#6366f1',
    passion: '#ef4444',
    social: '#22d3ee',
    problemSolving: '#f59e0b',
    challenge: '#ec4899',
    growth: '#10b981',
};

// 16종 개발자 유형 (상위 2개 축 조합)
const TYPE_MAP = {
    'consistency-passion': { name: '불꽃 마라토너', emoji: '🔥🏃', desc: '꾸준하면서도 뜨거운 열정을 가진 개발자. 매일 코딩하며 누구보다 열심히 불태웁니다.' },
    'consistency-social': { name: '데일리 커넥터', emoji: '📅💬', desc: '매일 꾸준히 출석하며 커뮤니티의 분위기를 이끄는 소통왕입니다.' },
    'consistency-problemSolving': { name: '성실한 해결사', emoji: '📅🔧', desc: '매일 꾸준히 문제를 풀어나가는 안정적인 개발자입니다.' },
    'consistency-challenge': { name: '꾸준한 도전자', emoji: '📅⚔️', desc: '도전을 멈추지 않으면서도 꾸준함을 잃지 않는 워리어입니다.' },
    'consistency-growth': { name: '성장 습관러', emoji: '📅🌱', desc: '매일의 작은 성장이 큰 변화를 만든다고 믿는 개발자입니다.' },
    'passion-social': { name: '에너자이저', emoji: '🔥💬', desc: '뜨거운 열정으로 커뮤니티를 활기차게 만드는 에너지 넘치는 개발자입니다.' },
    'passion-problemSolving': { name: '열혈 엔지니어', emoji: '🔥🔧', desc: '문제를 만나면 불꽃처럼 달려드는 열정적인 문제해결사입니다.' },
    'passion-challenge': { name: '버닝 파이터', emoji: '🔥⚔️', desc: '도전과 열정이 만나 폭발적인 에너지를 발산하는 전사입니다.' },
    'passion-growth': { name: '성장의 불꽃', emoji: '🔥🌱', desc: '성장에 대한 열정이 불타오르는, 멈추지 않는 개발자입니다.' },
    'social-problemSolving': { name: '커뮤니티 해결사', emoji: '💬🔧', desc: '소통을 통해 문제를 해결하고, 다른 사람의 문제도 함께 풀어주는 히어로입니다.' },
    'social-challenge': { name: '소셜 워리어', emoji: '💬⚔️', desc: '커뮤니티에서 활발히 소통하며 도전을 즐기는 사교적 전사입니다.' },
    'social-growth': { name: '함께 성장러', emoji: '💬🌱', desc: '다른 사람과 함께 성장하는 것을 즐기는 협력형 개발자입니다.' },
    'problemSolving-challenge': { name: '전략적 파이터', emoji: '🔧⚔️', desc: '전략적으로 문제를 분석하고 도전을 즐기는 스마트한 전사입니다.' },
    'problemSolving-growth': { name: '진화하는 해결사', emoji: '🔧🌱', desc: '문제를 풀수록 성장하는, 경험에서 배우는 개발자입니다.' },
    'challenge-growth': { name: '성장형 파이터', emoji: '⚔️🌱', desc: '도전을 통해 끊임없이 성장하는 개발자. 실패도 성장의 양분입니다.' },
};

/**
 * 모든 DNA 관련 데이터 수집
 */
export async function collectDNAData(userId, supabase) {
    const [
        profileRes,
        attendanceRes,
        postsRes,
        commentsRes,
        questRes,
        battleRes,
        badgeRes,
    ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('attendance').select('*').eq('user_id', userId),
        supabase.from('board_posts').select('id').eq('user_id', userId),
        supabase.from('board_comments').select('id').eq('user_id', userId),
        supabase.from('user_quests').select('*').eq('user_id', userId).eq('is_completed', true),
        supabase.from('battle_participants').select('*, battle_rooms(*)').eq('user_id', userId),
        supabase.from('user_badges').select('*').eq('user_id', userId),
    ]);

    const profile = profileRes.data;
    const attendance = attendanceRes.data || [];
    const posts = postsRes.data || [];
    const comments = commentsRes.data || [];
    const quests = questRes.data || [];
    const battles = battleRes.data || [];
    const badges = badgeRes.data || [];

    // 가입 후 경과 일수
    const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
    const daysSinceJoin = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)));

    // BURNING 출석 비율
    const burningCount = attendance.filter(a => a.status === 'BURNING').length;

    // 배틀 승리 수
    const battleWins = battles.filter(b => b.is_winner === true).length;

    return {
        profile,
        attendance,
        posts,
        comments,
        quests,
        battles,
        badges,
        daysSinceJoin,
        burningCount,
        battleWins,
    };
}

/**
 * 6축 점수 계산 (0~100)
 */
export function calculateScores(data) {
    const { profile, attendance, posts, comments, quests, battles, badges, daysSinceJoin, burningCount, battleWins } = data;

    // 1. 꾸준함 (Consistency): max_streak 비중 50% + 출석률 50%
    const maxStreak = profile?.max_streak || 0;
    const streakScore = Math.min(maxStreak / 30, 1) * 50; // 30일 기준 만점
    const attendanceRate = Math.min(attendance.length / daysSinceJoin, 1) * 50;
    const consistency = Math.round(streakScore + attendanceRate);

    // 2. 열정 (Passion): 포인트 기반 + BURNING 비율
    const totalPoints = profile?.total_points || 0;
    const pointScore = Math.min(totalPoints / 5000, 1) * 50; // 5000P 기준 만점
    const burningRate = attendance.length > 0 ? (burningCount / attendance.length) * 50 : 0;
    const passion = Math.round(pointScore + burningRate);

    // 3. 소통력 (Social): 게시글 + 댓글 + message_count
    const msgCount = profile?.message_count || 0;
    const postScore = Math.min(posts.length / 20, 1) * 35;
    const commentScore = Math.min(comments.length / 50, 1) * 35;
    const msgScore = Math.min(msgCount / 100, 1) * 30;
    const social = Math.round(postScore + commentScore + msgScore);

    // 4. 문제해결 (Problem Solving): 퀘스트 완료
    const questScore = Math.min(quests.length / 10, 1) * 100;
    const problemSolving = Math.round(questScore);

    // 5. 도전정신 (Challenge): 배틀 참여 + 승률
    const battleCount = battles.length;
    const participationScore = Math.min(battleCount / 10, 1) * 60;
    const winRate = battleCount > 0 ? (battleWins / battleCount) : 0;
    const winScore = winRate * 40;
    const challenge = Math.round(participationScore + winScore);

    // 6. 성장 (Growth): 뱃지 수집률 + 레벨 + tech_stack
    const badgeScore = Math.min(badges.length / 15, 1) * 40;
    const level = Math.floor(Math.sqrt(totalPoints)) + 1;
    const levelScore = Math.min(level / 30, 1) * 30;
    const techStack = profile?.tech_stack || [];
    const techScore = Math.min(techStack.length / 5, 1) * 30;
    const growth = Math.round(badgeScore + levelScore + techScore);

    return {
        consistency: Math.min(consistency, 100),
        passion: Math.min(passion, 100),
        social: Math.min(social, 100),
        problemSolving: Math.min(problemSolving, 100),
        challenge: Math.min(challenge, 100),
        growth: Math.min(growth, 100),
    };
}

/**
 * 상위 2축 기반 유형 분류
 */
export function classifyType(scores) {
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const [first, second] = sorted;

    // 정렬된 키 조합으로 타입 맵 조회
    const key1 = `${first[0]}-${second[0]}`;
    const key2 = `${second[0]}-${first[0]}`;

    const type = TYPE_MAP[key1] || TYPE_MAP[key2];
    if (type) return { ...type, topAxes: [first[0], second[0]] };

    // 기본 폴백
    return {
        name: '바이브 탐험가',
        emoji: '🧭✨',
        desc: '다양한 영역을 고르게 탐험하는 균형 잡힌 개발자입니다.',
        topAxes: [first[0], second[0]],
    };
}

/**
 * 규칙 기반 인사이트 생성
 */
export function generateInsight(type, scores) {
    const insights = [];
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

    // 최고 능력치 칭찬
    if (sorted[0][1] >= 70) {
        insights.push(`${AXIS_LABELS[sorted[0][0]]} 능력치가 ${sorted[0][1]}점으로 매우 뛰어납니다!`);
    }

    // 최저 능력치 조언
    const lowest = sorted[sorted.length - 1];
    if (lowest[1] < 30) {
        insights.push(`${AXIS_LABELS[lowest[0]]} 영역에 도전해보면 더 다재다능한 개발자가 될 수 있어요.`);
    }

    // 균형도 체크
    const max = sorted[0][1];
    const min = lowest[1];
    if (max - min < 20) {
        insights.push('모든 영역이 고르게 발달한 올라운더 타입입니다!');
    }

    // 총점 기반 코멘트
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    if (total >= 400) {
        insights.push('총합 점수가 매우 높습니다. 진정한 바이브 마스터의 자질을 보여주고 있어요!');
    } else if (total < 100) {
        insights.push('아직 시작 단계입니다. 다양한 활동에 참여하며 DNA를 진화시켜 보세요!');
    }

    return insights;
}

export { DNA_AXES, AXIS_LABELS, AXIS_ICONS, AXIS_COLORS };
