import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getVibeLevel, getStreakCombo } from '../utils/vibeLevel';
import { Trophy, Flame, Zap, Award, TrendingUp, TrendingDown, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchBatchEquippedDetails } from '../utils/vibeItems.jsx';
import ProfileSummaryModal from '../components/ProfileSummaryModal';

const Ranking = () => {
    const { user } = useAuth();
    const [rankings, setRankings] = useState([]);
    const [myRank, setMyRank] = useState(null);
    const [myStats, setMyStats] = useState(null);
    const [category, setCategory] = useState('level'); // level, points, wins
    const [loading, setLoading] = useState(true);
    const [equippedDetails, setEquippedDetails] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [anchorPos, setAnchorPos] = useState(null);
    const openProfile = (e, id) => { setSelectedUserId(id); setAnchorPos({ x: e.clientX, y: e.clientY }); };

    useEffect(() => {
        fetchRankings();
    }, [category]);

    const fetchRankings = async () => {
        setLoading(true);

        try {
            // 전체 사용자 조회 - 필요한 필드만 안전하게 선택
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, username, level, total_points, avatar_url, battle_wins, battle_losses')
                .not('username', 'is', null);

            if (error) {
                console.error('Ranking fetch error:', error);
                setLoading(false);
                return;
            }

            if (profiles) {
                // 계산된 필드 추가 (레벨은 포인트 기반으로 동적 계산)
                const enrichedRankings = profiles
                    .map((p, idx) => {
                        const levelData = getVibeLevel(p.total_points || 0);
                        return {
                            ...p,
                            rank: idx + 1,
                            level: levelData.level, // 포인트에서 계산한 레벨
                            levelTitle: levelData.title,
                            levelIcon: levelData.icon,
                            points: p.total_points || 0, // UI에서 사용할 points 값 매핑
                            battle_wins: p.battle_wins || 0,
                            battle_losses: p.battle_losses || 0,
                            win_rate: (p.battle_wins || 0) + (p.battle_losses || 0) > 0
                                ? Math.round(((p.battle_wins || 0) / ((p.battle_wins || 0) + (p.battle_losses || 0))) * 100)
                                : 0,
                            total_battles: (p.battle_wins || 0) + (p.battle_losses || 0)
                        };
                    })
                    .sort((a, b) => {
                        if (category === 'level') return b.level - a.level;
                        if (category === 'points') return b.total_points - a.total_points;
                        return b.battle_wins - a.battle_wins;
                    })
                    .map((p, idx) => ({ ...p, rank: idx + 1 })); // 정렬 후 순위 재계산

                setRankings(enrichedRankings);

                // Fetch Equipped Details
                if (profiles.length > 0) {
                    const details = await fetchBatchEquippedDetails(supabase, profiles);
                    setEquippedDetails(details);
                }

                // 내 순위 찾기
                if (user) {
                    const myRankData = enrichedRankings.find(r => r.id === user.id);
                    if (myRankData) {
                        setMyRank(myRankData);
                        setMyStats({
                            rank: myRankData.rank,
                            level: myRankData.level,
                            points: myRankData.points,
                            wins: myRankData.battle_wins,
                            losses: myRankData.battle_losses,
                            win_rate: myRankData.win_rate
                        });
                    }
                }
            }
        } catch (err) {
            console.error('Ranking error:', err);
        }
        setLoading(false);
    };

    // 순위 메달
    const getMedal = (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `${rank}`;
    };

    // 순위 색상
    const getRankColor = (rank) => {
        if (rank === 1) return '#fbbf24';
        if (rank === 2) return '#d1d5db';
        if (rank === 3) return '#d97706';
        return '#94a3b8';
    };

    const topThree = rankings.slice(0, 3);

    return (
        <div style={{ padding: '40px', color: '#f8fafc' }}>
            <h1 style={{
                marginBottom: '40px',
                fontSize: '2.5rem',
                fontWeight: '900',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
            }}>
                <Trophy size={40} style={{ color: '#fbbf24' }} />
                글로벌 랭킹
            </h1>

            {/* 상위 3명 메달 표시 */}
            {topThree.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '40px',
                    alignItems: 'flex-end'
                }}>
                    {/* 2위 */}
                    {topThree[1] && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(209, 213, 219, 0.2), rgba(107, 114, 128, 0.1))',
                                borderRadius: '16px',
                                padding: '16px',
                                border: '2px solid #d1d5db',
                                textAlign: 'center',
                                minHeight: '220px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🥈</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>2위</div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px', color: '#d1d5db' }}>
                                {topThree[1].username}
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                fontSize: '0.8rem',
                                color: '#cbd5e1'
                            }}>
                                <div>Lv. <strong style={{ color: '#60a5fa' }}>{topThree[1].level}</strong></div>
                                <div>🎯 <strong style={{ color: '#34d399' }}>{topThree[1].points.toLocaleString()}</strong>P</div>
                                <div>⚔️ <strong style={{ color: '#f472b6' }}>{topThree[1].total_battles}전</strong> ({topThree[1].win_rate}%)</div>
                            </div>
                        </motion.div>
                    )}

                    {/* 1위 */}
                    {topThree[0] && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2))',
                                borderRadius: '16px',
                                padding: '20px',
                                border: '3px solid #fbbf24',
                                textAlign: 'center',
                                minHeight: '260px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                boxShadow: '0 0 30px rgba(251, 191, 36, 0.3)'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: [0, -5, 5, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ fontSize: '3rem', marginBottom: '10px' }}
                            >
                                👑
                            </motion.div>
                            <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 'bold', marginBottom: '6px', letterSpacing: '1px' }}>
                                CHAMPION
                            </div>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: '900', marginBottom: '12px', color: '#fbbf24' }}>
                                {topThree[0].username}
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                fontSize: '0.9rem',
                                color: '#fef3c7'
                            }}>
                                <div>Lv. <strong style={{ color: '#fbbf24', fontSize: '1rem' }}>{topThree[0].level}</strong></div>
                                <div>🎯 <strong style={{ color: '#fbbf24', fontSize: '1rem' }}>{topThree[0].points.toLocaleString()}</strong>P</div>
                                <div>⚔️ <strong style={{ color: '#fbbf24', fontSize: '1rem' }}>{topThree[0].total_battles}전</strong> ({topThree[0].win_rate}%)</div>
                            </div>
                        </motion.div>
                    )}

                    {/* 3위 */}
                    {topThree[2] && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(180, 83, 9, 0.1))',
                                borderRadius: '16px',
                                padding: '16px',
                                border: '2px solid #d97706',
                                textAlign: 'center',
                                minHeight: '220px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🥉</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>3위</div>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px', color: '#d97706' }}>
                                {topThree[2].username}
                            </h3>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                fontSize: '0.8rem',
                                color: '#cbd5e1'
                            }}>
                                <div>Lv. <strong style={{ color: '#fb923c' }}>{topThree[2].level}</strong></div>
                                <div>🎯 <strong style={{ color: '#34d399' }}>{topThree[2].points.toLocaleString()}</strong>P</div>
                                <div>⚔️ <strong style={{ color: '#f472b6' }}>{topThree[2].total_battles}전</strong> ({topThree[2].win_rate}%)</div>
                            </div>
                        </motion.div>
                    )}
                </div>
            )}

            {/* 내 랭킹 카드 */}
            {myStats && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.15), rgba(168, 85, 247, 0.1))',
                        borderRadius: '24px',
                        padding: '32px',
                        border: '2px solid rgba(129, 140, 248, 0.6)',
                        marginBottom: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '32px',
                        backdropFilter: 'blur(10px)',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)'
                    }}
                >
                    {/* Background Glow */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-20%',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(129, 140, 248, 0.2), transparent 60%)',
                        filter: 'blur(60px)',
                        pointerEvents: 'none'
                    }} />

                    {/* Rank Badge */}
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.5), rgba(168, 85, 247, 0.3))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            color: '#818cf8',
                            flexShrink: 0,
                            border: '3px solid rgba(129, 140, 248, 0.8)',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        #{myStats.rank}
                    </motion.div>

                    {/* Stats */}
                    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '8px', fontWeight: '600', letterSpacing: '0.5px' }}>
                            🎯 나의 순위
                        </div>
                        <h3 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '20px', color: '#fff' }}>
                            현재 <span style={{ background: 'linear-gradient(135deg, #818cf8, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                {myStats.rank}위
                            </span>입니다
                        </h3>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                            gap: '20px'
                        }}>
                            <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(96, 165, 250, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(96, 165, 250, 0.3)' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>레벨</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa' }}>Lv.{myStats.level}</div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(52, 211, 153, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>포인트</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#34d399' }}>{myStats.points.toLocaleString()}P</div>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} style={{ background: 'rgba(244, 114, 182, 0.1)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(244, 114, 182, 0.3)' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: '600' }}>승률</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f472b6' }}>{myStats.win_rate}%</div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 필터 탭 */}
            <div style={{
                marginBottom: '40px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
            }}>
                {[
                    { key: 'level', label: '📊 레벨', icon: Award },
                    { key: 'points', label: '🎯 포인트', icon: Zap },
                    { key: 'wins', label: '⚔️ 배틀승수', icon: Flame }
                ].map(cat => (
                    <motion.button
                        key={cat.key}
                        onClick={() => setCategory(cat.key)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '14px',
                            border: category === cat.key ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.2)',
                            background: category === cat.key
                                ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.3), rgba(168, 85, 247, 0.2))'
                                : 'rgba(255,255,255,0.05)',
                            color: category === cat.key ? '#818cf8' : '#94a3b8',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            transition: 'all 0.3s',
                            boxShadow: category === cat.key ? '0 4px 15px rgba(129, 140, 248, 0.2)' : 'none',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        {cat.label}
                    </motion.button>
                ))}
            </div>

            {/* 랭킹 테이블 */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.6)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(129, 140, 248, 0.1)',
                overflowX: 'auto'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.95rem'
                }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid rgba(129, 140, 248, 0.2)' }}>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#818cf8', fontWeight: 'bold' }}>순위</th>
                            <th style={{ padding: '16px', textAlign: 'left', color: '#818cf8', fontWeight: 'bold' }}>유저명</th>
                            <th style={{ padding: '16px', textAlign: 'center', color: '#818cf8', fontWeight: 'bold' }}>레벨</th>
                            <th style={{ padding: '16px', textAlign: 'center', color: '#818cf8', fontWeight: 'bold' }}>포인트</th>
                            <th style={{ padding: '16px', textAlign: 'center', color: '#818cf8', fontWeight: 'bold' }}>전적</th>
                            <th style={{ padding: '16px', textAlign: 'center', color: '#818cf8', fontWeight: 'bold' }}>승률</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankings.map((rank, idx) => (
                            <motion.tr
                                key={rank.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={(e) => openProfile(e, rank.id)}
                                style={{
                                    borderBottom: '1px solid rgba(129, 140, 248, 0.05)',
                                    background: myRank?.id === rank.id
                                        ? 'linear-gradient(90deg, rgba(129, 140, 248, 0.2), rgba(168, 85, 247, 0.1))'
                                        : rank.rank <= 3
                                            ? 'rgba(129, 140, 248, 0.08)'
                                            : 'transparent',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    borderLeft: myRank?.id === rank.id ? '4px solid #818cf8' : '4px solid transparent'
                                }}
                                whileHover={{
                                    backgroundColor: myRank?.id === rank.id
                                        ? 'rgba(129, 140, 248, 0.25)'
                                        : 'rgba(129, 140, 248, 0.12)',
                                    paddingLeft: '12px',
                                    transition: { duration: 0.2 }
                                }}
                            >
                                <td style={{
                                    padding: '16px',
                                    fontWeight: 'bold',
                                    fontSize: '1.1rem',
                                    color: getRankColor(rank.rank)
                                }}>
                                    {getMedal(rank.rank)}
                                </td>
                                <td style={{
                                    padding: '16px',
                                    color: '#e2e8f0',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem',
                                        color: '#fff',
                                        flexShrink: 0
                                    }}>
                                        {rank.username?.[0]?.toUpperCase() || '👤'}
                                    </div>
                                    <span>
                                        {rank.username}
                                        {myRank?.id === rank.id && <span style={{ color: '#818cf8', marginLeft: '8px' }}>(나)</span>}
                                    </span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', color: '#60a5fa', fontWeight: 'bold' }}>
                                    {rank.level}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', color: '#34d399', fontWeight: 'bold' }}>
                                    {rank.points.toLocaleString()}
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center', color: '#cbd5e1' }}>
                                    <span style={{ color: '#34d399', fontWeight: 'bold' }}>{rank.battle_wins}승</span>
                                    <span style={{ color: '#94a3b8', margin: '0 6px' }}>|</span>
                                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{rank.battle_losses}패</span>
                                </td>
                                <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        background: rank.win_rate >= 60 ? 'rgba(52, 211, 153, 0.1)' : rank.win_rate >= 50 ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        padding: '6px 12px',
                                        borderRadius: '12px',
                                        border: `1px solid ${rank.win_rate >= 60 ? 'rgba(52, 211, 153, 0.3)' : rank.win_rate >= 50 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                                        fontWeight: 'bold',
                                        color: rank.win_rate >= 60 ? '#34d399' : rank.win_rate >= 50 ? '#fbbf24' : '#ef4444'
                                    }}>
                                        {rank.total_battles === 0 ? '-' : `${rank.win_rate}%`}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {loading && (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 40px',
                    color: '#64748b',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                        <Loader size={48} color="#818cf8" />
                    </motion.div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>랭킹 데이터를 불러오는 중입니다...</p>
                </div>
            )}

            {!loading && rankings.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '80px 40px',
                    color: '#64748b'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>아직 랭킹 데이터가 없습니다.</p>
                    <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: '8px' }}>첫 출석부터 시작해보세요!</p>
                </div>
            )}

            {/* Profile Modal */}
            <ProfileSummaryModal
                userId={selectedUserId}
                isOpen={!!selectedUserId}
                onClose={() => { setSelectedUserId(null); setAnchorPos(null); }}
                anchorPos={anchorPos}
            />
        </div>
    );
};

export default Ranking;
