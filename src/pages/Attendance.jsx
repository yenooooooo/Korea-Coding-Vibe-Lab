import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { Calendar, CheckCircle, TrendingUp, Flame, Coffee, Bug, Brain, Trophy, Crown, Sparkles, Quote, User, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileSummaryModal from '../components/ProfileSummaryModal';
import StreakRecovery from '../components/StreakRecovery';
import { getVibeLevel, getStreakCombo, getStreakMilestone } from '../utils/vibeLevel';
import { getTodayKST, formatDateKST } from '../utils/dateUtils';
import { isAdmin } from '../utils/admin';
import { VibeName, fetchBatchEquippedDetails } from '../utils/vibeItems.jsx';

import { useToast } from '../context/ToastContext';

// Particle Component for Check-in Animation
const Particle = memo(({ color, delay }) => (
    <motion.div
        initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
        animate={{
            scale: [0, 1, 0],
            x: [0, Math.random() * 200 - 100],
            y: [0, Math.random() * 200 - 100],
            opacity: [1, 1, 0]
        }}
        transition={{ duration: 1.2, delay, ease: 'easeOut' }}
        style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: color,
            pointerEvents: 'none',
            left: '50%',
            top: '50%'
        }}
    />
));

Particle.displayName = 'Particle';

// Stats Card Component
const StatsCard = memo(({ icon, label, value, color, gradient }) => (
    <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        style={{
            background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: `0 4px 20px ${color}30`
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', opacity: 0.9 }}>
            {icon}
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{label}</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
            {value}
        </div>
    </motion.div>
));

StatsCard.displayName = 'StatsCard';

// Quotes 상수만 외부에 (순수 데이터)
const quotes = [
    "문제 해결이 먼저입니다. 코드는 그 다음입니다. - John Johnson",
    "경험이란 모두가 자신의 실수에 붙이는 이름입니다. - Oscar Wilde",
    "자바와 자바스크립트는 햄과 햄스터의 관계와 같습니다. - Chris Heilmann",
    "지식은 힘이다. - Francis Bacon",
    "단순함은 효율성의 핵심이다. - Austin Freeman",
    "코드는 거짓말하지 않지만, 주석은 가끔 거짓말한다. - Ron Jeffries"
];

const Attendance = () => {
    // vibes 정의 (컴포넌트 내부에서만 정의 - 초기화 문제 완전 해결)
    const vibes = useMemo(() => [
        { id: 'BURNING', icon: Flame, label: 'Burning 🔥', color: '#f97316', desc: '오늘 하루 불태운다!' },
        { id: 'CHILL', icon: Coffee, label: 'Chill ☕', color: '#2dd4bf', desc: '여유롭게 코딩 한잔' },
        { id: 'DEBUGGING', icon: Bug, label: 'Debugging 🐛', color: '#ef4444', desc: '버그와의 사투' },
        { id: 'LEARNING', icon: Brain, label: 'Learning 📚', color: '#a855f7', desc: '새로운 지식 흡수' }
    ], []);
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
    const [showParticles, setShowParticles] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showAllHistory, setShowAllHistory] = useState(false);

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
        // 최근 3개월만 기본 조회 (성능 개선)
        const monthsToFetch = showAllHistory ? 12 : 3;
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - monthsToFetch);

        const { data } = await supabase
            .from('attendance')
            .select('check_in_date, vibe_status')
            .eq('user_id', user.id)
            .gte('check_in_date', startDate.toISOString());

        setAttendanceHistory(data || []);
    };

    const fetchLeaderboard = useCallback(async () => {
        const { data } = await supabase
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
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserData();
            fetchAttendanceHistory();
            fetchLeaderboard();
        }
    }, [user, showAllHistory, fetchLeaderboard]);

    // AuthContext Realtime 동기화: 관리자 포인트 지급 등 외부 변경 즉시 반영
    useEffect(() => {
        if (authProfile) {
            setStreak(authProfile.current_streak || 0);
            setTotalPoints(authProfile.total_points || 0);
        }
    }, [authProfile?.total_points, authProfile?.current_streak]);

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

            // 2. Show particles animation
            setShowParticles(true);
            setTimeout(() => setShowParticles(false), 1500);

            // 3. 관리자 출석 시 전체 알림 broadcast
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

            // 4. Refetch to update UI
            await fetchUserData();
            await fetchAttendanceHistory();
            await fetchLeaderboard();

            // 5. Show Quote
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

    // 월별 캘린더 데이터 생성 (최적화)
    const calendarData = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // 이전 달 빈 칸
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // 현재 달 날짜
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const dateStr = formatDateKST(date);
            const record = attendanceHistory.find(r => r.check_in_date === dateStr);
            days.push({ date: dateStr, dateObj: date, record });
        }

        return days;
    }, [currentMonth, attendanceHistory]);

    // 주간/월간 통계 계산
    const stats = useMemo(() => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const weeklyCount = attendanceHistory.filter(record => {
            const recordDate = new Date(record.check_in_date);
            return recordDate >= weekAgo;
        }).length;

        const monthlyCount = attendanceHistory.filter(record => {
            const recordDate = new Date(record.check_in_date);
            return recordDate >= monthAgo;
        }).length;

        const vibeCounts = attendanceHistory.reduce((acc, record) => {
            acc[record.vibe_status] = (acc[record.vibe_status] || 0) + 1;
            return acc;
        }, {});

        const favoriteVibe = Object.keys(vibeCounts).reduce((a, b) =>
            vibeCounts[a] > vibeCounts[b] ? a : b, 'BURNING'
        );

        return {
            weeklyCount,
            monthlyCount,
            totalDays: attendanceHistory.length,
            favoriteVibe,
            weeklyRate: Math.round((weeklyCount / 7) * 100),
            monthlyRate: Math.round((monthlyCount / 30) * 100)
        };
    }, [attendanceHistory]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px', color: '#fff' }}>
            {/* Header Area */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '40px' }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                    <span style={{ background: 'linear-gradient(to right, #facc15, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>매일의 바이브 체크</span> 📅
                </h1>
                <p style={{ color: '#94a3b8' }}>매일의 코딩 리듬을 기록하고 성장하세요.</p>
            </motion.div>

            {/* 통계 카드 섹션 추가 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '30px' }}
            >
                <StatsCard
                    icon={<Calendar size={18} />}
                    label="이번 주"
                    value={`${stats.weeklyCount}/7`}
                    color="#6366f1"
                    gradient={['rgba(99, 102, 241, 0.2)', 'rgba(99, 102, 241, 0.05)']}
                />
                <StatsCard
                    icon={<TrendingUp size={18} />}
                    label="이번 달"
                    value={`${stats.monthlyCount}일`}
                    color="#8b5cf6"
                    gradient={['rgba(139, 92, 246, 0.2)', 'rgba(139, 92, 246, 0.05)']}
                />
                <StatsCard
                    icon={<BarChart3 size={18} />}
                    label="총 출석"
                    value={`${stats.totalDays}일`}
                    color="#06b6d4"
                    gradient={['rgba(6, 182, 212, 0.2)', 'rgba(6, 182, 212, 0.05)']}
                />
                {(() => {
                    const favoriteVibe = vibes.find(v => v.id === stats.favoriteVibe);
                    const IconComponent = favoriteVibe?.icon || Flame;
                    return (
                        <StatsCard
                            icon={<IconComponent size={18} color={favoriteVibe?.color} />}
                            label="선호 바이브"
                            value={favoriteVibe?.label.split(' ')[0] || '🔥'}
                            color={favoriteVibe?.color || '#f97316'}
                            gradient={[`${favoriteVibe?.color || '#f97316'}20`, `${favoriteVibe?.color || '#f97316'}05`]}
                        />
                    );
                })()}
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>

                {/* 1. Check-In Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}
                >
                    {/* Particles Animation */}
                    <AnimatePresence>
                        {showParticles && (
                            <>
                                {Array.from({ length: 20 }).map((_, i) => (
                                    <Particle
                                        key={i}
                                        color={vibes.find(v => v.id === selectedVibe)?.color || '#f97316'}
                                        delay={i * 0.03}
                                    />
                                ))}
                            </>
                        )}
                    </AnimatePresence>

                    {/* Combo Glow Background */}
                    {(() => {
                        const combo = getStreakCombo(streak);
                        return combo.tier !== 'NONE' && (
                            <motion.div
                                animate={{
                                    opacity: [0.3, 0.5, 0.3]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                                style={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    background: `radial-gradient(ellipse at top right, ${combo.glowColor}, transparent 60%)`,
                                    pointerEvents: 'none', zIndex: 0
                                }}
                            />
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

                    {/* Streak Recovery Component */}
                    <StreakRecovery currentStreak={streak} onSuccess={() => {
                        addToast('스트릭이 복구되었습니다!', 'success');
                        fetchUserData();
                        fetchAttendanceHistory();
                        fetchLeaderboard();
                    }} />

                    {!checkedIn ? (
                        <>
                            <p style={{ marginBottom: '16px', fontWeight: 'bold', color: '#cbd5e1', position: 'relative', zIndex: 1 }}>오늘의 바이브는 어떤가요?</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
                                {vibes.map(v => (
                                    <motion.button
                                        key={v.id}
                                        whileHover={{ scale: 1.05, y: -3 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedVibe(v.id)}
                                        style={{
                                            background: selectedVibe === v.id ? `${v.color}20` : 'rgba(0,0,0,0.2)',
                                            border: selectedVibe === v.id ? `2px solid ${v.color}` : '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '12px',
                                            padding: '14px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s',
                                            boxShadow: selectedVibe === v.id ? `0 4px 20px ${v.color}40` : 'none',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {selectedVibe === v.id && (
                                            <motion.div
                                                layoutId="selectedVibe"
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: `linear-gradient(135deg, ${v.color}15, transparent)`,
                                                    zIndex: 0
                                                }}
                                            />
                                        )}
                                        <div style={{ position: 'relative', zIndex: 1 }}>
                                            <v.icon color={v.color} />
                                        </div>
                                        <div style={{ textAlign: 'left', position: 'relative', zIndex: 1 }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{v.label}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{v.desc}</div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(99, 102, 241, 0.6)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCheckIn}
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '18px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: loading ? '#475569' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                                    position: 'relative',
                                    zIndex: 1,
                                    transition: 'all 0.3s'
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
                </motion.div>

                {/* 2. Hall of Fame */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' }}
                >
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
                </motion.div>
            </div>

            {/* 3. 월별 캘린더 뷰 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ marginTop: '30px', background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}
            >
                {/* Ambient Glow Background */}
                <motion.div
                    animate={{
                        opacity: [0.1, 0.2, 0.1],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    style={{ position: 'absolute', top: '-40%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }}
                />

                {/* 헤더 및 월 네비게이션 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                        <span style={{ fontSize: '1.6rem' }}>📅</span>
                        출석 캘린더
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: '#fff'
                            }}
                        >
                            <ChevronLeft size={20} />
                        </motion.button>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', minWidth: '140px', textAlign: 'center' }}>
                            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                        </span>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '8px',
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                color: '#fff'
                            }}
                        >
                            <ChevronRight size={20} />
                        </motion.button>
                    </div>
                </div>

                {/* 요일 헤더 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px', position: 'relative', zIndex: 1 }}>
                    {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                        <div key={day} style={{
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: i === 0 ? '#f87171' : i === 6 ? '#60a5fa' : '#94a3b8',
                            padding: '8px 0'
                        }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* 캘린더 그리드 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', position: 'relative', zIndex: 1 }}>
                    {calendarData.map((day, i) => {
                        if (!day) {
                            return <div key={`empty-${i}`} style={{ aspectRatio: '1', minHeight: '36px' }} />;
                        }

                        let bg = 'rgba(255,255,255,0.03)';
                        let glow = 'none';
                        let vibeIcon = '';
                        let vibeLabel = '기록 없음';

                        if (day.record) {
                            switch (day.record.vibe_status) {
                                case 'BURNING':
                                    bg = 'linear-gradient(135deg, rgba(249, 115, 22, 0.3), rgba(251, 146, 60, 0.2))';
                                    glow = '0 4px 16px rgba(249, 115, 22, 0.4)';
                                    vibeIcon = '🔥';
                                    vibeLabel = 'Burning';
                                    break;
                                case 'CHILL':
                                    bg = 'linear-gradient(135deg, rgba(45, 212, 191, 0.3), rgba(94, 234, 212, 0.2))';
                                    glow = '0 4px 16px rgba(45, 212, 191, 0.4)';
                                    vibeIcon = '☕';
                                    vibeLabel = 'Chill';
                                    break;
                                case 'DEBUGGING':
                                    bg = 'linear-gradient(135deg, rgba(239, 68, 68, 0.3), rgba(248, 113, 113, 0.2))';
                                    glow = '0 4px 16px rgba(239, 68, 68, 0.4)';
                                    vibeIcon = '🐛';
                                    vibeLabel = 'Debugging';
                                    break;
                                case 'LEARNING':
                                    bg = 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(192, 132, 252, 0.2))';
                                    glow = '0 4px 16px rgba(168, 85, 247, 0.4)';
                                    vibeIcon = '📚';
                                    vibeLabel = 'Learning';
                                    break;
                            }
                        }

                        const isToday = formatDateKST(new Date()) === day.date;

                        return (
                            <motion.div
                                key={day.date}
                                whileHover={{ scale: 1.05, zIndex: 10 }}
                                title={`${day.date}\n${vibeLabel}${day.record ? '\n+10 Points' : ''}`}
                                style={{
                                    aspectRatio: '1',
                                    minHeight: '36px',
                                    borderRadius: '12px',
                                    background: bg,
                                    border: isToday ? '2px solid #facc15' : '1px solid rgba(255, 255, 255, 0.1)',
                                    boxShadow: day.record ? glow : 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {isToday && (
                                    <motion.div
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'radial-gradient(circle, rgba(250, 204, 21, 0.2), transparent)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                )}
                                <span style={{ fontSize: '0.7rem', fontWeight: isToday ? 'bold' : 'normal', color: isToday ? '#facc15' : '#cbd5e1', position: 'relative', zIndex: 1 }}>
                                    {day.dateObj.getDate()}
                                </span>
                                {day.record && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{ fontSize: '1rem', position: 'relative', zIndex: 1 }}
                                    >
                                        {vibeIcon}
                                    </motion.span>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Legend 및 더보기 버튼 */}
                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: '#cbd5e1', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.5), rgba(251, 146, 60, 0.3))', borderRadius: '4px', border: '1px solid rgba(249, 115, 22, 0.5)' }} />
                            <span>🔥 Burning</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, rgba(45, 212, 191, 0.5), rgba(94, 234, 212, 0.3))', borderRadius: '4px', border: '1px solid rgba(45, 212, 191, 0.5)' }} />
                            <span>☕ Chill</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.5), rgba(248, 113, 113, 0.3))', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.5)' }} />
                            <span>🐛 Debugging</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.5), rgba(192, 132, 252, 0.3))', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.5)' }} />
                            <span>📚 Learning</span>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAllHistory(!showAllHistory)}
                        style={{
                            padding: '8px 16px',
                            background: showAllHistory ? '#6366f1' : 'rgba(99, 102, 241, 0.2)',
                            border: '1px solid #6366f1',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {showAllHistory ? '최근 3개월만 보기' : '전체 기록 보기 (1년)'}
                    </motion.button>
                </div>
            </motion.div>

            {/* Quote Modal */}
            <AnimatePresence>
                {showQuote && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowQuote(false)}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 100,
                            backdropFilter: 'blur(8px)'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0, y: 50 }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                                padding: '48px',
                                borderRadius: '24px',
                                maxWidth: '550px',
                                textAlign: 'center',
                                border: '1px solid rgba(250, 204, 21, 0.3)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(250, 204, 21, 0.2)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* 배경 파티클 효과 */}
                            {Array.from({ length: 5 }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [0, -100],
                                        opacity: [0.5, 0],
                                        scale: [0, 1]
                                    }}
                                    transition={{
                                        duration: 2,
                                        delay: i * 0.2,
                                        repeat: Infinity,
                                        ease: 'easeOut'
                                    }}
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: `${20 + i * 20}%`,
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: '#facc15',
                                        pointerEvents: 'none'
                                    }}
                                />
                            ))}

                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <Quote size={48} color="#facc15" style={{ marginBottom: '24px', display: 'inline-block' }} />
                            </motion.div>

                            <motion.h3
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                style={{ fontSize: '1.8rem', marginBottom: '20px', color: 'white', fontWeight: 'bold' }}
                            >
                                🎉 {streak}일 연속 출석 완료!
                            </motion.h3>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                style={{ fontSize: '1.1rem', color: '#cbd5e1', fontStyle: 'italic', marginBottom: '32px', lineHeight: '1.6', padding: '0 20px' }}
                            >
                                "{todayQuote}"
                            </motion.p>

                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(250, 204, 21, 0.4)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowQuote(false)}
                                style={{
                                    padding: '14px 40px',
                                    background: 'linear-gradient(135deg, #facc15, #f97316)',
                                    color: 'black',
                                    fontWeight: 'bold',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '1.05rem',
                                    boxShadow: '0 4px 16px rgba(250, 204, 21, 0.3)'
                                }}
                            >
                                코딩하러 가자! 🚀
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Profile Summary Modal */}
            {selectedUserId && (
                <ProfileSummaryModal
                    userId={selectedUserId}
                    isOpen={!!selectedUserId}
                    onClose={() => setSelectedUserId(null)}
                />
            )}
        </div>
    );
};

export default Attendance;
