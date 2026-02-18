
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Coffee, Code2, ArrowRight, Flame, Trophy, Sparkles, Brain, Users, CalendarCheck, Crown, Medal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProfileSummaryModal from '../components/ProfileSummaryModal';
import { getVibeLevel, getStreakCombo } from '../utils/vibeLevel';
import { getTodayKST } from '../utils/dateUtils';
import { VibeName, fetchBatchEquippedDetails } from '../utils/vibeItems.jsx';

const Home = () => {
    const { user, profile: authProfile } = useAuth();
    const [todaysHeat, setTodaysHeat] = useState(0);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [topUsers, setTopUsers] = useState([]);

    // 개인 통계 (로그인 시)
    const [myStats, setMyStats] = useState(null);
    const [equippedDetails, setEquippedDetails] = useState({});

    // 시간대별 인사말
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Good Morning, Vibe Coder! ☀️";
        if (hour >= 12 && hour < 18) return "Keep the Vibe Alive! ☕";
        if (hour >= 18 && hour < 22) return "Coding Night Begins 🌙";
        return "Neon City Never Sleeps 💜";
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const today = getTodayKST();

            try {
                // Prepare Promises
                const heatPromise = supabase
                    .from('attendance')
                    .select('points')
                    .eq('check_in_date', today);

                const activePromise = supabase
                    .from('attendance')
                    .select('user_id, profiles(id, username, avatar_url, email)')
                    .eq('check_in_date', today)
                    .order('created_at', { ascending: false })
                    .limit(10);

                const topPromise = supabase
                    .from('profiles')
                    .select('id, username, avatar_url, current_streak, total_points')
                    .order('total_points', { ascending: false })
                    .limit(3);

                const myStatsPromise = user
                    ? supabase.from('profiles').select('current_streak, total_points').eq('id', user.id).maybeSingle()
                    : Promise.resolve({ data: null });

                const checkInPromise = user
                    ? supabase.from('attendance').select('id').eq('user_id', user.id).eq('check_in_date', today).maybeSingle()
                    : Promise.resolve({ data: null });

                // Execute in Parallel
                const [heatRes, activeRes, topRes, myStatsRes, checkInRes] = await Promise.all([
                    heatPromise, activePromise, topPromise, myStatsPromise, checkInPromise
                ]);

                // 1. Process Heat
                const totalPoints = heatRes.data ? heatRes.data.reduce((acc, curr) => acc + (curr.points || 0), 0) : 0;
                setTodaysHeat(totalPoints);

                // 2. Process Active Users
                const activeData = activeRes.data;
                if (activeData) {
                    const uniqueUsers = [];
                    const seenIds = new Set();
                    for (const item of activeData) {
                        if (item.profiles && !seenIds.has(item.profiles.id)) {
                            uniqueUsers.push(item.profiles);
                            seenIds.add(item.profiles.id);
                        }
                    }
                    setActiveUsers(uniqueUsers.slice(0, 5));
                }

                // 3. Process My Stats
                if (myStatsRes.data) {
                    setMyStats({
                        ...myStatsRes.data,
                        isCheckedIn: !!checkInRes.data
                    });
                }

                // 4. Process Top Users
                setTopUsers(topRes.data || []);

                // 5. Fetch Equipped Details (Dependent on Active & Top users)
                const allProfiles = [];
                if (activeData) {
                    const seenIds = new Set();
                    activeData.forEach(item => {
                        if (item.profiles && !seenIds.has(item.profiles.id)) {
                            allProfiles.push(item.profiles);
                            seenIds.add(item.profiles.id);
                        }
                    });
                }
                const topData = topRes.data;
                if (topData) allProfiles.push(...topData);

                if (allProfiles.length > 0) {
                    const details = await fetchBatchEquippedDetails(supabase, allProfiles);
                    setEquippedDetails(prev => ({ ...prev, ...details }));
                }

            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const handleFocus = () => {
            fetchData();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [user]);

    // AuthContext Realtime 동기화: 관리자 포인트 지급 등 외부 변경 즉시 반영
    useEffect(() => {
        if (authProfile && myStats) {
            setMyStats(prev => prev ? { ...prev, total_points: authProfile.total_points, current_streak: authProfile.current_streak } : prev);
        }
    }, [authProfile?.total_points, authProfile?.current_streak]);

    // 히트맵 레벨 계산 (0~100%)
    const heatLevel = Math.min((todaysHeat / 1000) * 100, 100); // 목표 1000포인트

    return (
        <div style={{ paddingBottom: '100px', fontFamily: '"Pretendard", sans-serif' }}>
            {/* Hero Section */}
            <section style={{
                textAlign: 'center',
                padding: '80px 20px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Decor */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
                    zIndex: -1,
                    filter: 'blur(80px)',
                    animation: 'pulse 6s infinite ease-in-out'
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 20px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '30px',
                        marginBottom: '20px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.9rem',
                        color: '#94a3b8',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <Sparkles size={16} color="#fbbf24" />
                        <span style={{ letterSpacing: '0.5px' }}>{getGreeting()}</span>
                    </div>

                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        marginBottom: '16px',
                        lineHeight: '1.2',
                        color: 'white'
                    }}>
                        Welcome back,<br />
                        <span style={{
                            background: 'linear-gradient(to right, #818cf8, #c084fc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            {user?.user_metadata?.nickname || 'Vibe Initiator'}
                        </span>
                    </h1>

                    <p style={{
                        fontSize: '1.1rem',
                        color: '#94a3b8',
                        maxWidth: '600px',
                        margin: '0 auto 40px',
                        lineHeight: '1.6'
                    }}>
                        오늘의 코딩은 어제보다 더 빛날 거예요.<br />
                        나만의 리듬으로 세상을 코딩하세요.
                    </p>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/attendance" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '14px 28px',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                                }}
                            >
                                <CalendarCheck size={18} />
                                {myStats?.isCheckedIn ? '출석 완료 ✅' : '출석체크 하러가기'}
                            </motion.button>
                        </Link>
                        <Link to="/community" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '14px 28px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <Users size={18} />
                                라운지 입장
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Dashboard Grid */}
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto 100px',
                padding: '0 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
            }}>
                {/* 1. Today's Heat Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '30px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fb923c', marginBottom: '8px' }}>
                                <Flame size={20} fill="#fb923c" />
                                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.5px' }}>TODAY'S HEAT</span>
                            </div>
                            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0, color: 'white', lineHeight: '1' }}>
                                {todaysHeat.toLocaleString()} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 'normal' }}>points</span>
                            </h2>
                        </div>
                        <div style={{
                            width: '40px', height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(251, 146, 60, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Activity size={20} color="#fb923c" />
                        </div>
                    </div>

                    <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${heatLevel}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            style={{
                                height: '100%',
                                background: 'linear-gradient(90deg, #facc15 0%, #f97316 100%)',
                                borderRadius: '6px',
                                boxShadow: '0 0 10px rgba(249, 115, 22, 0.5)'
                            }}
                        />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                        {heatLevel >= 100 ? "🔥🔥 이미 목표 달성! 폭발적인 열기입니다!" : `목표까지 ${Math.max(0, 1000 - todaysHeat)}포인트 남았습니다.`}
                    </p>
                </motion.div>

                {/* 2. My Vibe Dashboard Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: 'rgba(30, 41, 59, 0.3)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '24px',
                        padding: '30px',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', marginBottom: '20px' }}>
                        <Crown size={20} />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.5px' }}>MY VIBE STATS</span>
                    </div>

                    {user ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px' }}>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Current Streak</p>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                                    {myStats?.current_streak || 0}<span style={{ fontSize: '0.9rem' }}> days</span>
                                </div>
                            </div>
                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '16px' }}>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>Total Points</p>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
                                    {myStats?.total_points || 0}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>
                            <p style={{ marginBottom: '16px' }}>로그인하고 나의 기록을 확인하세요.</p>
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                <button style={{
                                    padding: '8px 20px',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}>로그인</button>
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* 2.5 Hall of Fame Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(250, 204, 21, 0.15)',
                        borderRadius: '24px',
                        padding: '30px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Gold ambient glow */}
                    <div style={{
                        position: 'absolute', top: '-30%', right: '-20%',
                        width: '200px', height: '200px',
                        background: 'radial-gradient(circle, rgba(250, 204, 21, 0.08), transparent 60%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#facc15', marginBottom: '20px', position: 'relative', zIndex: 1 }}>
                        <Trophy size={20} fill="#facc15" />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.5px' }}>HALL OF FAME</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', zIndex: 1 }}>
                        {topUsers.length > 0 ? topUsers.map((u, index) => {
                            const levelInfo = getVibeLevel(u.total_points || 0);
                            const combo = getStreakCombo(u.current_streak || 0);
                            const medals = ['🥇', '🥈', '🥉'];
                            const bgColors = [
                                'rgba(250, 204, 21, 0.08)',
                                'rgba(192, 192, 192, 0.06)',
                                'rgba(205, 127, 50, 0.06)'
                            ];
                            const borderColors = [
                                'rgba(250, 204, 21, 0.25)',
                                'rgba(192, 192, 192, 0.15)',
                                'rgba(205, 127, 50, 0.15)'
                            ];
                            return (
                                <motion.div
                                    key={u.id}
                                    whileHover={{ scale: 1.02, translateX: 4 }}
                                    onClick={() => setSelectedUserId(u.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 14px', borderRadius: '14px',
                                        background: bgColors[index],
                                        border: `1px solid ${borderColors[index]}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{medals[index]}</span>
                                        {equippedDetails[u.id]?.avatar ? (
                                            <img src={equippedDetails[u.id].avatar.icon_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : u.avatar_url ? (
                                            <img src={u.avatar_url} alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#94a3b8' }}>?</div>
                                        )}
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <VibeName name={u.username || 'Anonymous'} effectItem={equippedDetails[u.id]?.name_effect} />
                                                {index === 0 && <Crown size={14} color="#facc15" />}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: levelInfo.color, fontWeight: 'bold' }}>
                                                {levelInfo.icon} Lv.{levelInfo.level} {levelInfo.title}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#facc15' }}>{u.total_points || 0}P</div>
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{combo.flames} {u.current_streak || 0}일</div>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.85rem' }}>아직 데이터가 없습니다.</p>
                        )}
                    </div>
                </motion.div>

                {/* 3. Active Squad (Users) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: 'rgba(30, 41, 59, 0.3)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '24px',
                        padding: '30px',
                        gridColumn: '1 / -1' // Full width on mobile/tablet if needed
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2dd4bf' }}>
                            <Users size={20} />
                            <span style={{ fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.5px' }}>ACTIVE SQUAD</span>
                        </div>
                        <Link to="/attendance" style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'none' }}>View All</Link>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        {activeUsers.length > 0 ? (
                            activeUsers.map((profile) => (
                                <div
                                    key={profile.id}
                                    onClick={() => setSelectedUserId(profile.id)}
                                    style={{ textAlign: 'center', cursor: 'pointer' }}
                                >
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%', background: '#1e293b', overflow: 'hidden',
                                            border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.2s',
                                            boxShadow: equippedDetails[profile.id]?.avatar ? '0 0 10px rgba(99, 102, 241, 0.4)' : 'none'
                                        }}>
                                            {equippedDetails[profile.id]?.avatar ? (
                                                <img src={equippedDetails[profile.id].avatar.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <img
                                                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`}
                                                    alt={profile.username}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            )}
                                        </div>
                                        <div style={{
                                            position: 'absolute', bottom: 0, right: 0,
                                            width: '12px', height: '12px',
                                            background: '#22c55e', borderRadius: '50%', border: '2px solid #1e293b'
                                        }} />
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        <VibeName name={profile.username || 'User'} effectItem={equippedDetails[profile.id]?.name_effect} />
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#64748b', fontSize: '0.9rem', padding: '10px 0' }}>아직 출석한 멤버가 없습니다. 첫 번째 주인공이 되어보세요!</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Philosophy Section */}
            <section style={{ maxWidth: '1200px', margin: '0 auto 120px', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>What is Vibe Coding?</h2>
                    <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                        이제 개발자는 '작성자(Writer)'에서 '관리자(Manager)'로 변모합니다.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '30px'
                }}>
                    <PhilosophyCard
                        icon={<Brain size={32} color="#a855f7" />}
                        title="Focus on Logic"
                        desc="코드의 세부 구현보다는 논리, 구조, 그리고 창의적인 아이디어에 집중하세요."
                    />
                    <PhilosophyCard
                        icon={<Sparkles size={32} color="#2dd4bf" />}
                        title="AI Collaboration"
                        desc="개발자가 문법 하나하나를 타이핑하는 것이 아니라, AI에게 자연어로 의도를 전달합니다."
                    />
                    <PhilosophyCard
                        icon={<Code2 size={32} color="#f472b6" />}
                        title="Accessibility"
                        desc="복잡한 코딩 문법을 몰라도, 논리적 사고만 있다면 누구나 소프트웨어를 만들 수 있습니다."
                    />
                </div>
            </section>

            {/* Profile Modal */}
            <ProfileSummaryModal
                userId={selectedUserId}
                isOpen={!!selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </div>
    );
};

const PhilosophyCard = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ y: -10, borderColor: 'rgba(255,255,255,0.2)' }}
        style={{
            background: 'rgba(30, 41, 59, 0.3)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '40px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'all 0.3s ease'
        }}
    >
        <div style={{
            width: '60px', height: '60px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#f8fafc' }}>{title}</h3>
        <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '1.05rem' }}>{desc}</p>
    </motion.div>
);

export default Home;
