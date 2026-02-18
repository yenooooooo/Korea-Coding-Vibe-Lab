import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, TrendingUp, Flame, Coffee, Bug, Brain, Trophy, Crown, Sparkles, Quote, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import ProfileSummaryModal from '../components/ProfileSummaryModal';
import { getVibeLevel, getStreakCombo, getStreakMilestone } from '../utils/vibeLevel';
import { getTodayKST, formatDateKST } from '../utils/dateUtils';
import { isAdmin } from '../utils/admin';
import { VibeName, fetchBatchEquippedDetails } from '../utils/vibeItems.jsx';

import { useToast } from '../context/ToastContext';

const Attendance = () => {
    const { user, profile: authProfile } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [checkedIn, setCheckedIn] = useState(false);
    const [streak, setStreak] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [selectedVibe, setSelectedVibe] = useState('BURNING');
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showQuote, setShowQuote] = useState(false);
    const [todayQuote, setTodayQuote] = useState('');
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [leaderboardDetails, setLeaderboardDetails] = useState({});

    const vibes = [
        { id: 'BURNING', icon: <Flame color="#f97316" />, label: 'Burning 🔥', color: '#f97316', desc: '오늘 하루 불태운다!' },
        { id: 'CHILL', icon: <Coffee color="#2dd4bf" />, label: 'Chill ☕', color: '#2dd4bf', desc: '여유롭게 코딩 한잔' },
        { id: 'DEBUGGING', icon: <Bug color="#ef4444" />, label: 'Debugging 🐛', color: '#ef4444', desc: '버그와의 사투' },
        { id: 'LEARNING', icon: <Brain color="#a855f7" />, label: 'Learning 📚', color: '#a855f7', desc: '새로운 지식 흡수' }
    ];

    const quotes = [
        "문제 해결이 먼저입니다. 코드는 그 다음입니다. - John Johnson",
        "경험이란 모두가 자신의 실수에 붙이는 이름입니다. - Oscar Wilde",
        "자바와 자바스크립트는 햄과 햄스터의 관계와 같습니다. - Chris Heilmann",
        "지식은 힘이다. - Francis Bacon",
        "단순함은 효율성의 핵심이다. - Austin Freeman",
        "코드는 거짓말하지 않지만, 주석은 가끔 거짓말한다. - Ron Jeffries"
    ];

    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchAttendanceHistory();
            fetchLeaderboard();
        }
    }, [user]);

    // AuthContext Realtime 동기화: 관리자 포인트 지급 등 외부 변경 즉시 반영
    useEffect(() => {
        if (authProfile) {
            setStreak(authProfile.current_streak || 0);
            setTotalPoints(authProfile.total_points || 0);
        }
    }, [authProfile?.total_points, authProfile?.current_streak]);

    const fetchUserData = async () => {
        try {
            const today = getTodayKST();

            // Parallel Fetching
            const [attendanceRes, profileRes] = await Promise.all([
                supabase.from('attendance').select('*').eq('user_id', user.id).eq('check_in_date', today).maybeSingle(),
                supabase.from('profiles').select('current_streak, total_points').eq('id', user.id).maybeSingle()
            ]);

            if (attendanceRes.data) {
                setCheckedIn(true);
            }

            if (profileRes.data) {
                setStreak(profileRes.data.current_streak || 0);
                setTotalPoints(profileRes.data.total_points || 0);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceHistory = async () => {
        const { data } = await supabase
            .from('attendance')
            .select('check_in_date, vibe_status')
            .eq('user_id', user.id)
            .gte('check_in_date', new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString()); // Last 1 year

        setAttendanceHistory(data || []);
    };

    const fetchLeaderboard = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, current_streak, total_points, equipped_items')
            .order('current_streak', { ascending: false })
            .limit(5);

        if (data) {
            setLeaderboard(data);

            // Resolve equipped details for all leaderboard users
            const details = await fetchBatchEquippedDetails(supabase, data);
            setLeaderboardDetails(details);
        }
    };

    const handleCheckIn = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Insert Attendance Record with KST Date
            const today = getTodayKST();
            const { error: insertError } = await supabase
                .from('attendance')
                .insert([
                    { user_id: user.id, vibe_status: selectedVibe, points: 10, check_in_date: today }
                ]);

            if (insertError) throw insertError;

            // 2. 관리자 출석 시 전체 알림 broadcast
            if (isAdmin(user.email)) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id)
                    .maybeSingle();

                await supabase.channel('admin_entry_broadcast').send({
                    type: 'broadcast',
                    event: 'admin_checkin',
                    payload: { userId: user.id, username: profile?.username || '운영자' },
                });
            }

            // 3. Refetch to update UI
            await fetchUserData();
            await fetchAttendanceHistory();
            await fetchLeaderboard();

            // 4. Show Quote
            setTodayQuote(quotes[Math.floor(Math.random() * quotes.length)]);
            setShowQuote(true);
            addToast('🔥 출석 체크 완료! 10 XP 획득', 'success');

        } catch (error) {
            console.error('Error checking in:', error);
            addToast('출석 체크 중 오류가 발생했습니다 😭', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Prepare Heatmap Data (Simple Grid)
    const heatmapData = React.useMemo(() => {
        const yearDays = [];
        const today = new Date();
        const startDate = new Date();
        startDate.setFullYear(today.getFullYear() - 1);

        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDateKST(d);
            const record = attendanceHistory.find(r => r.check_in_date === dateStr);
            yearDays.push({ date: dateStr, record });
        }
        return yearDays;
    }, [attendanceHistory]);

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px', color: '#fff' }}>
            {/* Header Area */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                    <span style={{ background: 'linear-gradient(to right, #facc15, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>매일의 바이브 체크</span> 📅
                </h1>
                <p style={{ color: '#94a3b8' }}>매일의 코딩 리듬을 기록하고 성장하세요.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                {/* 1. Check-In Card */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                    {/* Combo Glow Background */}
                    {(() => {
                        const combo = getStreakCombo(streak);
                        return combo.tier !== 'NONE' && (
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                background: `radial-gradient(ellipse at top right, ${combo.glowColor}, transparent 60%)`,
                                pointerEvents: 'none', zIndex: 0
                            }} />
                        );
                    })()}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15', fontWeight: 'bold' }}>
                                <Flame size={20} />
                                <span>현재 연속 출석</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <h2 style={{ fontSize: '3rem', fontWeight: '800', margin: 0 }}>{streak}<span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}> 일</span></h2>
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{ fontSize: '1.2rem' }}
                                >
                                    {getStreakCombo(streak).flames}
                                </motion.span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontWeight: 'bold' }}>
                                <Sparkles size={20} />
                                <span>바이브 포인트</span>
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalPoints} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>P</span></h2>
                        </div>
                    </div>

                    {/* Streak Combo Badge */}
                    {(() => {
                        const combo = getStreakCombo(streak);
                        const levelInfo = getVibeLevel(totalPoints);
                        return combo.tier !== 'NONE' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 14px', borderRadius: '12px', marginBottom: '16px',
                                    background: `${combo.color}15`, border: `1px solid ${combo.color}30`,
                                    position: 'relative', zIndex: 1
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '0.9rem' }}>{combo.flames}</span>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: combo.color }}>{combo.label}</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>보너스 x{combo.bonusMultiplier}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '8px', background: `${levelInfo.color}15` }}>
                                    <span style={{ fontSize: '0.85rem' }}>{levelInfo.icon}</span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: levelInfo.color }}>Lv.{levelInfo.level}</span>
                                </div>
                            </motion.div>
                        );
                    })()}

                    {!checkedIn ? (
                        <>
                            <p style={{ marginBottom: '16px', fontWeight: 'bold', color: '#cbd5e1' }}>오늘의 바이브는 어떤가요?</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                                {vibes.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVibe(v.id)}
                                        style={{
                                            background: selectedVibe === v.id ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.2)',
                                            border: selectedVibe === v.id ? `2px solid ${v.color}` : '1px solid transparent',
                                            borderRadius: '12px',
                                            padding: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {v.icon}
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{v.label}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckIn}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                                }}
                            >
                                {loading ? '출석 확인 중...' : '출석 체크하기'} 🚀
                            </motion.button>
                        </>
                    ) : (
                        <div style={{
                            background: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid #22c55e',
                            borderRadius: '16px',
                            padding: '24px',
                            textAlign: 'center'
                        }}>
                            <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 16px' }} />
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px' }}>오늘 출석 완료!</h3>
                            <p style={{ color: '#bbf7d0', marginBottom: '8px' }}>내일도 코딩 리듬 잃지 마세요!</p>
                            {(() => {
                                const milestone = getStreakMilestone(streak);
                                return milestone && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        style={{
                                            marginTop: '12px', padding: '10px 16px', borderRadius: '12px',
                                            background: 'rgba(250, 204, 21, 0.1)', border: '1px solid rgba(250, 204, 21, 0.3)',
                                            fontSize: '0.9rem', color: '#facc15', fontWeight: 'bold'
                                        }}
                                    >
                                        {milestone}
                                    </motion.div>
                                );
                            })()}
                        </div>
                    )}
                </div>

                {/* 2. Hall of Fame */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                        <Trophy size={24} color="#facc15" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>명예의 전당 (Top 5)</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {leaderboard.map((user, index) => (
                            <div key={user.id}
                                onClick={() => setSelectedUserId(user.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    background: index === 0 ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: index === 0 ? '1px solid rgba(250, 204, 21, 0.3)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        background: index === 0 ? '#facc15' : '#475569',
                                        color: index === 0 ? 'black' : 'white',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 'bold', fontSize: '0.8rem'
                                    }}>
                                        {index + 1}
                                    </div>
                                    {leaderboardDetails[user.id]?.avatar ? (
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden' }}>
                                            <img src={leaderboardDetails[user.id].avatar.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : user.avatar_url ? (
                                        <img src={user.avatar_url} alt="Profile" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                            <User size={12} />
                                        </div>
                                    )}
                                    <span style={{ fontWeight: 'bold' }}>
                                        <VibeName
                                            name={user.username || 'Anonymous'}
                                            effectItem={leaderboardDetails[user.id]?.name_effect}
                                        />
                                    </span>
                                    {index === 0 && <Crown size={16} color="#facc15" />}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                                    <span style={{ color: '#facc15', fontWeight: 'bold' }}>{user.current_streak}</span> 일 연속
                                </div>
                            </div>
                        ))}
                        {leaderboard.length === 0 && <p style={{ color: '#64748b', textAlign: 'center' }}>아직 랭커가 없습니다!</p>}
                    </div>
                </div>
            </div>

            {/* 3. Heatmap - 3D Glassmorphism Vibe Log */}
            <div style={{ marginTop: '30px', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
                {/* Ambient Glow Background */}
                <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '24px', color: '#f1f5f9', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.6rem' }}>📅</span>
                    나의 바이브 히스토리 (최근 1년)
                </h3>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '5px',
                    justifyContent: 'flex-start',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {heatmapData.map((day, i) => {
                        let bg = 'rgba(255,255,255,0.05)';
                        let glow = 'none';
                        let vibeLabel = '기록 없음';

                        if (day.record) {
                            switch (day.record.vibe_status) {
                                case 'BURNING':
                                    bg = 'linear-gradient(135deg, #f97316, #fb923c)';
                                    glow = '0 0 12px rgba(249, 115, 22, 0.6)';
                                    vibeLabel = '🔥 Burning';
                                    break;
                                case 'CHILL':
                                    bg = 'linear-gradient(135deg, #2dd4bf, #5eead4)';
                                    glow = '0 0 12px rgba(45, 212, 191, 0.6)';
                                    vibeLabel = '☕ Chill';
                                    break;
                                case 'DEBUGGING':
                                    bg = 'linear-gradient(135deg, #ef4444, #f87171)';
                                    glow = '0 0 12px rgba(239, 68, 68, 0.6)';
                                    vibeLabel = '🐛 Debugging';
                                    break;
                                case 'LEARNING':
                                    bg = 'linear-gradient(135deg, #a855f7, #c084fc)';
                                    glow = '0 0 12px rgba(168, 85, 247, 0.6)';
                                    vibeLabel = '📚 Learning';
                                    break;
                                default:
                                    bg = 'linear-gradient(135deg, #6366f1, #818cf8)';
                                    glow = '0 0 12px rgba(99, 102, 241, 0.6)';
                                    vibeLabel = '✨ Vibe';
                            }
                        }

                        return (
                            <motion.div
                                key={day.date}
                                whileHover={{
                                    scale: day.record ? 1.4 : 1.1,
                                    zIndex: 10,
                                    transition: { duration: 0.2 }
                                }}
                                title={`${day.date}\n${vibeLabel}\n${day.record ? '+10 Points' : ''}`}
                                style={{
                                    width: '14px',
                                    height: '14px',
                                    borderRadius: '4px',
                                    background: bg,
                                    opacity: day.record ? 1 : 0.3,
                                    boxShadow: day.record ? glow : 'none',
                                    border: day.record ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    backdropFilter: 'blur(4px)',
                                    transition: 'all 0.2s ease'
                                }}
                            />
                        );
                    })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '20px', marginTop: '24px', fontSize: '0.85rem', color: '#cbd5e1', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px', height: '14px', background: 'linear-gradient(135deg, #f97316, #fb923c)', borderRadius: '4px', boxShadow: '0 0 8px rgba(249, 115, 22, 0.4)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                        <span>🔥 Burning</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px', height: '14px', background: 'linear-gradient(135deg, #2dd4bf, #5eead4)', borderRadius: '4px', boxShadow: '0 0 8px rgba(45, 212, 191, 0.4)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                        <span>☕ Chill</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px', height: '14px', background: 'linear-gradient(135deg, #ef4444, #f87171)', borderRadius: '4px', boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                        <span>🐛 Debugging</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '14px', height: '14px', background: 'linear-gradient(135deg, #a855f7, #c084fc)', borderRadius: '4px', boxShadow: '0 0 8px rgba(168, 85, 247, 0.4)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                        <span>📚 Learning</span>
                    </div>
                </div>
            </div>

            {/* Quote Modal */}
            {showQuote && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            background: '#1e293b',
                            padding: '40px',
                            borderRadius: '24px',
                            maxWidth: '500px',
                            textAlign: 'center',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                        }}
                    >
                        <Quote size={40} color="#facc15" style={{ marginBottom: '20px', display: 'inline-block' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'white' }}>{streak}일 연속 출석 완료!</h3>
                        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', fontStyle: 'italic', marginBottom: '30px', lineHeight: '1.5' }}>
                            "{todayQuote}"
                        </p>
                        <button
                            onClick={() => setShowQuote(false)}
                            style={{
                                padding: '12px 32px',
                                background: '#facc15',
                                color: 'black',
                                fontWeight: 'bold',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            코딩하러 가자! 🚀
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Profile Summary Modal */}
            <ProfileSummaryModal
                userId={selectedUserId}
                isOpen={!!selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </div>
    );
};

export default Attendance;
