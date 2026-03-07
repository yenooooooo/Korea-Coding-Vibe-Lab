import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, MapPin, Eye, ChevronUp, X, ExternalLink } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

// 페이지 경로 → 한국어 이름 맵핑
const PAGE_NAMES = {
    '/': '홈',
    '/community': '라운지',
    '/about': '소개',
    '/battle': '배틀 아레나',
    '/ranking': '랭킹',
    '/quest': '퀘스트',
    '/shop': '상점',
    '/season-pass': '시즌 패스',
    '/inventory': '인벤토리',
    '/market': '마켓',
    '/mentor': '멘토',
    '/ai-study': 'AI 스터디',
    '/challenge': '챌린지',
    '/profile': '프로필',
    '/friends': '친구',
    '/messages': 'DM',
    '/attendance': '출석',
    '/study': '스터디',
    '/moments': '따뜻한 순간',
    '/vibe-dna': '바이브 DNA',
    '/sandbox': '샌드박스',
    '/learn': '따라하기',
    '/demo': '데모',
    '/gallery': '갤러리',
    '/showcase': '쇼케이스',
    '/settings': '설정',
    '/admin': '관리자',
    '/starter-guide': '스타터 가이드',
    '/point-history': '포인트 내역',
    '/classroom': '클래스룸',
};

const LivePresenceIsland = ({ collapsed = true }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [totalMembers, setTotalMembers] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoveredUser, setHoveredUser] = useState(null);
    const [profiles, setProfiles] = useState({});
    const profilesRef = useRef({});
    const panelRef = useRef(null);

    // 총 회원수 가져오기
    useEffect(() => {
        const fetchTotal = async () => {
            const { count } = await supabase
                .from('profiles')
                .select('id', { count: 'exact', head: true });
            if (count !== null) setTotalMembers(count);
        };
        fetchTotal();
        // 5분마다 갱신
        const interval = setInterval(fetchTotal, 300000);
        return () => clearInterval(interval);
    }, []);

    // Presence 구독
    useEffect(() => {
        const channel = supabase.channel('presence-island-listener');

        channel.on('presence', { event: 'sync' }, () => {
            const state = channel.presenceState();
            const users = Object.values(state).flat().filter(
                (u, i, arr) => arr.findIndex(x => x.user_id === u.user_id) === i
            );
            setOnlineUsers(users);

            // 프로필 데이터 가져오기 (ref로 최신 상태 참조)
            const userIds = users
                .map(u => u.user_id)
                .filter(id => id && !profilesRef.current[id]);
            if (userIds.length > 0) {
                fetchProfiles(userIds);
            }
        }).subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchProfiles = useCallback(async (userIds) => {
        const { data } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, total_points, level')
            .in('id', userIds);
        if (data) {
            setProfiles(prev => {
                const newProfiles = { ...prev };
                data.forEach(p => { newProfiles[p.id] = p; });
                profilesRef.current = newProfiles;
                return newProfiles;
            });
        }
    }, []);

    // 페이지별 접속자 분포
    const pageDistribution = useMemo(() => {
        const dist = {};
        onlineUsers.forEach(u => {
            const path = u.currentPath || '/';
            if (!dist[path]) dist[path] = [];
            dist[path].push(u);
        });
        return Object.entries(dist)
            .sort((a, b) => b[1].length - a[1].length)
            .slice(0, 6);
    }, [onlineUsers]);

    // 같은 페이지에 있는 유저들
    const samePageUsers = useMemo(() => {
        return onlineUsers.filter(u => u.currentPath === location.pathname && u.user_id !== user?.id);
    }, [onlineUsers, location.pathname, user?.id]);

    // 패널 밖 클릭 감지
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                setIsExpanded(false);
            }
        };
        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    const onlineCount = onlineUsers.length;
    const maxBar = Math.max(...pageDistribution.map(([, u]) => u.length), 1);

    // ─── 축소 상태 (60px 사이드바 하단 LED) ───
    if (collapsed) {
        return (
            <div
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '8px 0',
                    position: 'relative',
                }}
                title={`${onlineCount}명 접속 중 / 총 ${totalMembers}명`}
            >
                {/* 숨쉬는 LED */}
                <div style={{ position: 'relative' }}>
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: '#22c55e',
                            willChange: 'transform, opacity'
                        }}
                    />
                </div>
                {/* 접속자 수 */}
                <motion.span
                    key={onlineCount}
                    initial={{ scale: 1.4, color: '#22c55e' }}
                    animate={{ scale: 1, color: '#94a3b8' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    style={{
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        lineHeight: 1,
                    }}
                >
                    {onlineCount}
                </motion.span>
                <span style={{
                    fontSize: '0.5rem',
                    color: '#475569',
                    lineHeight: 1,
                }}>
                    /{totalMembers}
                </span>

                {/* 같은 페이지 표시 */}
                {samePageUsers.length > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                            marginTop: '4px',
                            fontSize: '0.55rem',
                            color: '#818cf8',
                            background: 'rgba(99, 102, 241, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        🤝{samePageUsers.length}
                    </motion.div>
                )}

                {/* 확장 패널 */}
                <AnimatePresence>
                    {isExpanded && (
                        <PresencePanel
                            ref={panelRef}
                            onlineUsers={onlineUsers}
                            totalMembers={totalMembers}
                            profiles={profiles}
                            pageDistribution={pageDistribution}
                            maxBar={maxBar}
                            samePageUsers={samePageUsers}
                            hoveredUser={hoveredUser}
                            setHoveredUser={setHoveredUser}
                            onClose={() => setIsExpanded(false)}
                            onUserClick={(userId) => {
                                navigate(`/profile?view=${userId}`);
                                setIsExpanded(false);
                            }}
                            currentPath={location.pathname}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return null;
};

// ─── 확장 패널 컴포넌트 ───
const PresencePanel = React.forwardRef(({
    onlineUsers, totalMembers, profiles, pageDistribution, maxBar,
    samePageUsers, hoveredUser, setHoveredUser, onClose, onUserClick, currentPath
}, ref) => {

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            style={{
                position: 'absolute',
                bottom: 0,
                left: '56px',
                width: '320px',
                maxHeight: '500px',
                background: 'rgba(13, 20, 38, 0.98)',
                backdropFilter: 'blur(8px)',
                borderRadius: '20px',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(99, 102, 241, 0.1)',
                overflow: 'hidden',
                zIndex: 9999,
                willChange: 'transform',
                transform: 'translateZ(0)',
            }}
        >
            {/* 헤더 */}
            <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(168, 85, 247, 0.05))',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <motion.div
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            width: '8px', height: '8px',
                            borderRadius: '50%',
                            background: '#22c55e',
                            willChange: 'transform, opacity'
                        }}
                    />
                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#e2e8f0' }}>
                            실시간 접속 현황
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{onlineUsers.length}명</span> 온라인
                            <span style={{ margin: '0 6px', color: '#334155' }}>|</span>
                            총 {totalMembers}명
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        width: '28px', height: '28px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                >
                    <X size={14} />
                </button>
            </div>

            {/* 스크롤 콘텐츠 */}
            <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '12px 16px',
            }}>
                {/* 같은 페이지 유저 */}
                {samePageUsers.length > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.05))',
                        borderRadius: '14px',
                        padding: '12px',
                        marginBottom: '12px',
                        border: '1px solid rgba(99, 102, 241, 0.12)',
                    }}>
                        <div style={{
                            fontSize: '0.7rem', color: '#818cf8', fontWeight: 'bold',
                            marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            🤝 지금 같은 페이지에서 함께 코딩 중
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {samePageUsers.map((u, i) => (
                                <UserChip
                                    key={u.user_id || i}
                                    user={u}
                                    profile={profiles[u.user_id]}
                                    onClick={() => onUserClick(u.user_id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* 아바타 스택 */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{
                        fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold',
                        marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px',
                        textTransform: 'uppercase', letterSpacing: '1px',
                    }}>
                        <Eye size={12} /> 접속자
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex' }}>
                            {onlineUsers.slice(0, 8).map((u, i) => (
                                <motion.div
                                    key={u.user_id || i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    style={{
                                        marginLeft: i === 0 ? 0 : '-8px',
                                        position: 'relative',
                                        zIndex: 10 - i,
                                        cursor: 'pointer',
                                    }}
                                    onMouseEnter={() => setHoveredUser(u)}
                                    onMouseLeave={() => setHoveredUser(null)}
                                    onClick={() => onUserClick(u.user_id)}
                                >
                                    <AvatarBubble
                                        user={u}
                                        profile={profiles[u.user_id]}
                                        isHovered={hoveredUser?.user_id === u.user_id}
                                        size={32}
                                    />
                                </motion.div>
                            ))}
                        </div>
                        {onlineUsers.length > 8 && (
                            <div style={{
                                marginLeft: '-8px',
                                width: '32px', height: '32px',
                                borderRadius: '50%',
                                background: 'rgba(99, 102, 241, 0.15)',
                                border: '2px solid rgba(15, 23, 42, 0.95)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.65rem', color: '#818cf8', fontWeight: 'bold',
                                zIndex: 1,
                            }}>
                                +{onlineUsers.length - 8}
                            </div>
                        )}
                    </div>

                    {/* 호버 프로필 카드 */}
                    <AnimatePresence>
                        {hoveredUser && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                style={{
                                    marginTop: '8px',
                                    background: 'rgba(30, 41, 59, 0.8)',
                                    borderRadius: '12px',
                                    padding: '10px 12px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                }}
                            >
                                <AvatarBubble
                                    user={hoveredUser}
                                    profile={profiles[hoveredUser.user_id]}
                                    size={36}
                                    showOnline
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: '#e2e8f0', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                        {profiles[hoveredUser.user_id]?.username || hoveredUser.username || '익명'}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem', color: '#818cf8',
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                    }}>
                                        <MapPin size={10} />
                                        {PAGE_NAMES[hoveredUser.currentPath] || hoveredUser.currentPath}
                                    </div>
                                    {profiles[hoveredUser.user_id]?.total_points !== undefined && (
                                        <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>
                                            Lv.{profiles[hoveredUser.user_id]?.level || 1} · {profiles[hoveredUser.user_id]?.total_points || 0}P
                                        </div>
                                    )}
                                </div>
                                <ExternalLink size={12} color="#475569" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* 페이지별 분포 히트맵 */}
                <div>
                    <div style={{
                        fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold',
                        marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px',
                        textTransform: 'uppercase', letterSpacing: '1px',
                    }}>
                        <MapPin size={12} /> 페이지별 분포
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {pageDistribution.map(([path, users]) => (
                            <div key={path} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '4px 0',
                            }}>
                                <div style={{
                                    fontSize: '0.75rem',
                                    color: path === currentPath ? '#818cf8' : '#94a3b8',
                                    width: '80px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontWeight: path === currentPath ? 'bold' : 'normal',
                                }}>
                                    {path === currentPath && '▸ '}
                                    {PAGE_NAMES[path] || path}
                                </div>
                                <div style={{
                                    flex: 1,
                                    height: '6px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '3px',
                                    overflow: 'hidden',
                                }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(users.length / maxBar) * 100}%` }}
                                        transition={{ duration: 0.5, ease: 'easeOut' }}
                                        style={{
                                            height: '100%',
                                            borderRadius: '3px',
                                            background: path === currentPath
                                                ? 'linear-gradient(90deg, #6366f1, #a855f7)'
                                                : 'linear-gradient(90deg, #334155, #475569)',
                                        }}
                                    />
                                </div>
                                <span style={{
                                    fontSize: '0.7rem',
                                    color: path === currentPath ? '#818cf8' : '#64748b',
                                    fontWeight: 'bold',
                                    minWidth: '24px',
                                    textAlign: 'right',
                                }}>
                                    {users.length}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 접속자 전체 목록 */}
                <div style={{ marginTop: '16px' }}>
                    <div style={{
                        fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold',
                        marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px',
                        textTransform: 'uppercase', letterSpacing: '1px',
                    }}>
                        <Users size={12} /> 전체 접속자 목록
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {onlineUsers.map((u, i) => (
                            <motion.div
                                key={u.user_id || i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                onClick={() => onUserClick(u.user_id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 10px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                    background: u.currentPath === currentPath
                                        ? 'rgba(99, 102, 241, 0.06)'
                                        : 'transparent',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                                onMouseOut={(e) => e.currentTarget.style.background = u.currentPath === currentPath ? 'rgba(99, 102, 241, 0.06)' : 'transparent'}
                            >
                                <AvatarBubble user={u} profile={profiles[u.user_id]} size={28} showOnline />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '0.8rem',
                                        color: '#e2e8f0',
                                        fontWeight: '600',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {profiles[u.user_id]?.username || u.username || '익명'}
                                    </div>
                                    <div style={{
                                        fontSize: '0.65rem',
                                        color: '#64748b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}>
                                        <MapPin size={8} />
                                        {PAGE_NAMES[u.currentPath] || u.currentPath || '홈'}
                                    </div>
                                </div>
                                {u.currentPath === currentPath && (
                                    <span style={{
                                        fontSize: '0.55rem',
                                        color: '#818cf8',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        padding: '2px 6px',
                                        borderRadius: '6px',
                                        fontWeight: 'bold',
                                    }}>
                                        함께
                                    </span>
                                )}
                            </motion.div>
                        ))}
                        {onlineUsers.length === 0 && (
                            <div style={{
                                textAlign: 'center',
                                padding: '24px',
                                color: '#475569',
                                fontSize: '0.8rem',
                            }}>
                                아직 접속 중인 유저가 없어요
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

// ─── 아바타 버블 ───
const AvatarBubble = ({ user, profile, size = 32, isHovered = false, showOnline = false }) => {
    const getInitial = () => {
        const name = profile?.username || user?.username || '?';
        return name.charAt(0).toUpperCase();
    };

    const colors = [
        ['#6366f1', '#a855f7'],
        ['#3b82f6', '#06b6d4'],
        ['#10b981', '#34d399'],
        ['#f59e0b', '#ef4444'],
        ['#ec4899', '#a855f7'],
        ['#8b5cf6', '#6366f1'],
    ];

    const colorIdx = (user?.user_id || '').charCodeAt(0) % colors.length || 0;
    const [c1, c2] = colors[colorIdx];

    return (
        <div style={{ position: 'relative' }}>
            <motion.div
                animate={isHovered ? { scale: 1.2, y: -4 } : { scale: 1, y: 0 }}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    background: profile?.avatar_url
                        ? 'transparent'
                        : `linear-gradient(135deg, ${c1}, ${c2})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: `${size * 0.4}px`,
                    fontWeight: 'bold',
                    color: '#fff',
                    border: `2px solid rgba(15, 23, 42, 0.95)`,
                    overflow: 'hidden',
                    boxShadow: isHovered
                        ? `0 4px 12px ${c1}50`
                        : '0 2px 4px rgba(0,0,0,0.3)',
                    transition: 'box-shadow 0.2s',
                }}
            >
                {profile?.avatar_url ? (
                    <img
                        src={profile.avatar_url}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    getInitial()
                )}
            </motion.div>
            {showOnline && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: `${size * 0.3}px`,
                    height: `${size * 0.3}px`,
                    borderRadius: '50%',
                    background: '#22c55e',
                    border: '2px solid #0f172a',
                    boxShadow: '0 0 4px rgba(34, 197, 94, 0.5)',
                }} />
            )}
        </div>
    );
};

// ─── 유저 칩 (같은 페이지) ───
const UserChip = ({ user, profile, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px 4px 4px',
            borderRadius: '20px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            color: '#c7d2fe',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
        }}
    >
        <AvatarBubble user={user} profile={profile} size={20} />
        {profile?.username || user?.username || '익명'}
    </motion.button>
);

export default LivePresenceIsland;
