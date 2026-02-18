// 관리자 식별 및 스타일 유틸리티

const ADMIN_EMAIL = 'yaya01234@naver.com';

/**
 * 관리자 여부 확인
 * @param {object|string} profileOrEmail - profiles 객체 또는 이메일/이메일 prefix
 */
export const isAdmin = (profileOrEmail) => {
    if (!profileOrEmail) return false;
    if (typeof profileOrEmail === 'object') {
        return profileOrEmail.is_admin === true || profileOrEmail.email === ADMIN_EMAIL;
    }
    if (typeof profileOrEmail === 'string') {
        return profileOrEmail === ADMIN_EMAIL || profileOrEmail === 'yaya01234';
    }
    return false;
};

// 관리자 닉네임 스타일 (보라색 그라데이션 + 글로우)
export const ADMIN_NAME_STYLE = {
    background: 'linear-gradient(135deg, #c084fc, #818cf8, #f472b6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 'bold',
    filter: 'drop-shadow(0 0 6px rgba(168, 85, 247, 0.4))',
};

// 관리자 뱃지 스타일
export const ADMIN_BADGE_STYLE = {
    fontSize: '0.65rem',
    padding: '2px 7px',
    borderRadius: '4px',
    background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    flexShrink: 0,
};

// 관리자 아바타 글로우 (boxShadow로 적용)
export const ADMIN_AVATAR_GLOW = '0 0 0 2px #a855f7, 0 0 12px rgba(168, 85, 247, 0.4)';

// ==============================
// 10가지 관리자 기능 추가 스타일
// ==============================

// 1. 관리자 메시지 특수 배경
export const ADMIN_MSG_BG_STYLE = {
    background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.08), rgba(99, 102, 241, 0.05))',
    borderLeft: '3px solid #a855f7',
    borderRadius: '0 12px 12px 0',
    padding: '12px 16px',
    marginLeft: '-16px',
    marginRight: '-8px',
};

// 5. 관리자 전용 특수 반응 (일반 유저는 사용 불가)
export const ADMIN_REACTIONS = [
    { type: 'crown', emoji: '👑', label: '운영자 왕관' },
    { type: 'star', emoji: '⭐', label: '운영자 별' },
    { type: 'medal', emoji: '🏅', label: '운영자 메달' },
];

// 8. 관리자 전용 프로필 카드 테마 (그라데이션 헤더)
export const ADMIN_PROFILE_HEADER = {
    background: 'linear-gradient(135deg, #7c3aed, #6366f1, #a855f7)',
    padding: '16px 12px',
    borderRadius: '8px 8px 0 0',
    position: 'relative',
    overflow: 'hidden',
};

// 10. 관리자 칭호 기본값
export const ADMIN_TITLE_DEFAULT = 'Vibe Master';

// 관리자 칭호 스타일
export const ADMIN_TITLE_STYLE = {
    fontSize: '0.6rem',
    padding: '1px 6px',
    borderRadius: '3px',
    background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(234, 179, 8, 0.15))',
    color: '#fbbf24',
    fontWeight: 'bold',
    border: '1px solid rgba(250, 204, 21, 0.3)',
    letterSpacing: '0.5px',
};
