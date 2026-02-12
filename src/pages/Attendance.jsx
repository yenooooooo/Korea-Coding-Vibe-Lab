import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, TrendingUp, Flame, Coffee, Bug, Brain, Trophy, Crown, Sparkles, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Attendance = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [checkedIn, setCheckedIn] = useState(false);
    const [streak, setStreak] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [selectedVibe, setSelectedVibe] = useState('BURNING');
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [showQuote, setShowQuote] = useState(false);
    const [todayQuote, setTodayQuote] = useState('');

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

    const fetchUserData = async () => {
        try {
            // Check if checked in today
            const today = new Date().toISOString().split('T')[0];
            const { data: attendance } = await supabase
                .from('attendance')
                .select('*')
                .eq('user_id', user.id)
                .eq('check_in_date', today)
                .maybeSingle();

            if (attendance) {
                setCheckedIn(true);
            }

            // Get profile stats
            const { data: profile } = await supabase
                .from('profiles')
                .select('current_streak, total_points')
                .eq('id', user.id)
                .maybeSingle();

            if (profile) {
                setStreak(profile.current_streak || 0);
                setTotalPoints(profile.total_points || 0);
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
        const { data } = await supabase
            .from('profiles')
            .select('username, current_streak, total_points')
            .order('current_streak', { ascending: false })
            .limit(5);

        setLeaderboard(data || []);
    };

    const handleCheckIn = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // 1. Insert Attendance Record
            const { error: insertError } = await supabase
                .from('attendance')
                .insert([
                    { user_id: user.id, vibe_status: selectedVibe, points: 10 }
                ]);

            if (insertError) throw insertError;

            // 2. Refetch to update UI
            await fetchUserData();
            await fetchAttendanceHistory();
            await fetchLeaderboard();

            // 3. Show Quote
            setTodayQuote(quotes[Math.floor(Math.random() * quotes.length)]);
            setShowQuote(true);

        } catch (error) {
            console.error('Error checking in:', error);
            alert('출석 체크 중 오류가 발생했습니다 😭');
        } finally {
            setLoading(false);
        }
    };

    // Prepare Heatmap Data (Simple Grid)
    const getHeatmapData = () => {
        const yearDays = [];
        const today = new Date();
        const startDate = new Date();
        startDate.setFullYear(today.getFullYear() - 1);

        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const record = attendanceHistory.find(r => r.check_in_date === dateStr);
            yearDays.push({ date: dateStr, record });
        }
        return yearDays;
    };

    const heatmapData = getHeatmapData();

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
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15', fontWeight: 'bold' }}>
                                <Flame size={20} />
                                <span>현재 연속 출석</span>
                            </div>
                            <h2 style={{ fontSize: '3rem', fontWeight: '800', margin: 0 }}>{streak}<span style={{ fontSize: '1.2rem', fontWeight: 'normal' }}> 일</span></h2>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontWeight: 'bold' }}>
                                <Sparkles size={20} />
                                <span>바이브 포인트</span>
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{totalPoints} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>P</span></h2>
                        </div>
                    </div>

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
                            <p style={{ color: '#bbf7d0' }}>내일도 코딩 리듬 잃지 마세요!</p>
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
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: index === 0 ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: index === 0 ? '1px solid rgba(250, 204, 21, 0.3)' : 'none'
                            }}>
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
                                    <span style={{ fontWeight: 'bold' }}>{user.username || 'Anonymous'}</span>
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

            {/* 3. Heatmap */}
            <div style={{ marginTop: '30px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', padding: '32px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: '#cbd5e1' }}>나의 바이브 히스토리 (최근 1년)</h3>

                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '4px',
                    justifyContent: 'flex-start'
                }}>
                    {heatmapData.map((day, i) => {
                        let bg = 'rgba(255,255,255,0.05)';
                        if (day.record) {
                            switch (day.record.vibe_status) {
                                case 'BURNING': bg = '#f97316'; break;
                                case 'CHILL': bg = '#2dd4bf'; break;
                                case 'DEBUGGING': bg = '#ef4444'; break;
                                case 'LEARNING': bg = '#a855f7'; break;
                                default: bg = '#6366f1';
                            }
                        }
                        return (
                            <div
                                key={i}
                                title={`${day.date}: ${day.record ? day.record.vibe_status : 'No Check-in'}`}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '2px',
                                    background: bg,
                                    opacity: day.record ? 1 : 0.3
                                }}
                            />
                        );
                    })}
                </div>
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '0.8rem', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#f97316', borderRadius: '2px' }} /> Burning</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#2dd4bf', borderRadius: '2px' }} /> Chill</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#ef4444', borderRadius: '2px' }} /> Debugging</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: '10px', height: '10px', background: '#a855f7', borderRadius: '2px' }} /> Learning</div>
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
        </div>
    );
};

export default Attendance;
