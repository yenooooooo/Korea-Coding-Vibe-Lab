
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Coffee, Code2, ArrowRight, Flame, Trophy, Sparkles, Brain, Users, CalendarCheck, Crown, Medal, Check, Lightbulb, BookOpen, MessageSquare, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProfileSummaryModal from '../components/ProfileSummaryModal';
import DailyInspirationBanner from '../components/DailyInspirationBanner';
import StarterPack from '../components/StarterPack';
import { getVibeLevel, getStreakCombo } from '../utils/vibeLevel';
import { getTodayKST } from '../utils/dateUtils';
import { VibeName, fetchBatchEquippedDetails } from '../utils/vibeItems.jsx';

const Home = () => {
    const navigate = useNavigate();
    const { user, profile: authProfile } = useAuth();
    const [todaysHeat, setTodaysHeat] = useState(0);
    const [activeUsers, setActiveUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [topUsers, setTopUsers] = useState([]);
    const [myStats, setMyStats] = useState(null);
    const [equippedDetails, setEquippedDetails] = useState({});
    const [demoStep, setDemoStep] = useState(0);

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

                const [heatRes, activeRes, topRes, myStatsRes, checkInRes] = await Promise.all([
                    heatPromise, activePromise, topPromise, myStatsPromise, checkInPromise
                ]);

                const totalPoints = heatRes.data ? heatRes.data.reduce((acc, curr) => acc + (curr.points || 0), 0) : 0;
                setTodaysHeat(totalPoints);

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

                if (myStatsRes.data) {
                    setMyStats({
                        ...myStatsRes.data,
                        isCheckedIn: !!checkInRes.data
                    });
                }

                setTopUsers(topRes.data || []);

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

    useEffect(() => {
        if (authProfile && myStats) {
            setMyStats(prev => prev ? { ...prev, total_points: authProfile.total_points, current_streak: authProfile.current_streak } : prev);
        }
    }, [authProfile?.total_points, authProfile?.current_streak]);

    const heatLevel = Math.min((todaysHeat / 1000) * 100, 100);

    // Interactive Demo 스텝 애니메이션
    useEffect(() => {
        const interval = setInterval(() => {
            setDemoStep(prev => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ paddingBottom: '100px', fontFamily: '"Pretendard", sans-serif' }}>
            {/* ==================== HERO SECTION (혁신) ==================== */}
            <section style={{
                textAlign: 'center',
                padding: '60px 20px 40px',
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
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        marginBottom: '16px',
                        lineHeight: '1.2',
                        color: 'white'
                    }}>
                        당신도 할 수 있어,<br />
                        <span style={{
                            background: 'linear-gradient(to right, #818cf8, #c084fc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            바이브 코딩
                        </span>
                    </h1>

                    <p style={{
                        fontSize: '1.2rem',
                        color: '#94a3b8',
                        maxWidth: '700px',
                        margin: '0 auto 50px',
                        lineHeight: '1.7'
                    }}>
                        코딩 경험 없어도, 논리적 사고만 있으면 AI와 함께<br />
                        누구나 소프트웨어를 만들 수 있습니다.
                    </p>
                </motion.div>

                {/* Interactive Demo Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{
                        maxWidth: '600px',
                        margin: '0 auto 50px',
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '24px',
                        padding: '40px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '-30%',
                        right: '-20%',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1), transparent 60%)',
                        pointerEvents: 'none'
                    }} />

                    <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '30px', color: 'white', position: 'relative', zIndex: 1 }}>
                        ✨ 바이브 코딩 실제 흐름
                    </h3>

                    {/* Step 1: 프롬프트 작성 */}
                    <motion.div
                        animate={{ opacity: demoStep === 0 ? 1 : 0.5, scale: demoStep === 0 ? 1 : 0.95 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '20px',
                            borderRadius: '16px',
                            marginBottom: '16px',
                            border: demoStep === 0 ? '2px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: demoStep === 0 ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: demoStep === 0 ? '#c084fc' : '#94a3b8'
                            }}>
                                1️⃣
                            </div>
                            <span style={{ fontWeight: '600', color: demoStep === 0 ? '#c084fc' : '#94a3b8' }}>프롬프트 작성</span>
                        </div>
                        <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.95rem', fontStyle: 'italic' }}>
                            "숫자 맞추는 게임을 만들어줘"
                        </p>
                    </motion.div>

                    {/* Arrow */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <ArrowRight size={24} color="#a855f7" style={{ transform: 'rotate(90deg)' }} />
                        </motion.div>
                    </div>

                    {/* Step 2: AI 처리 */}
                    <motion.div
                        animate={{ opacity: demoStep === 1 ? 1 : 0.5, scale: demoStep === 1 ? 1 : 0.95 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '20px',
                            borderRadius: '16px',
                            marginBottom: '16px',
                            border: demoStep === 1 ? '2px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: demoStep === 1 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: demoStep === 1 ? '#818cf8' : '#94a3b8'
                            }}>
                                2️⃣
                            </div>
                            <span style={{ fontWeight: '600', color: demoStep === 1 ? '#818cf8' : '#94a3b8' }}>AI 자동 코딩</span>
                        </div>
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ color: '#cbd5e1', margin: 0, fontSize: '0.95rem' }}
                        >
                            ✨ 코드 생성 중... (1-5분)
                        </motion.div>
                    </motion.div>

                    {/* Arrow */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <ArrowRight size={24} color="#818cf8" style={{ transform: 'rotate(90deg)' }} />
                        </motion.div>
                    </div>

                    {/* Step 3: 결과물 실행 */}
                    <motion.div
                        animate={{ opacity: demoStep === 2 ? 1 : 0.5, scale: demoStep === 2 ? 1 : 0.95 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '20px',
                            borderRadius: '16px',
                            border: demoStep === 2 ? '2px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: demoStep === 2 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                color: demoStep === 2 ? '#22c55e' : '#94a3b8'
                            }}>
                                3️⃣
                            </div>
                            <span style={{ fontWeight: '600', color: demoStep === 2 ? '#22c55e' : '#94a3b8' }}>완성! 게임 실행</span>
                        </div>
                        <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.95rem' }}>
                            🎮 당신이 만든 게임을 바로 플레이해보세요!
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: demoStep === 2 ? 1 : 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            borderRadius: '12px',
                            border: '1px solid rgba(34, 197, 94, 0.2)',
                            color: '#22c55e'
                        }}
                    >
                        ✨ "이것도 AI로 만들었어?" - 당신도 이 경험을 할 수 있습니다!
                    </motion.div>
                </motion.div>

                {/* 입문자 온보딩 3가지 경로 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        maxWidth: '800px',
                        margin: '0 auto'
                    }}
                >
                    {/* 경로 1: 튜토리얼 (나도 할 수 있을까?) */}
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/diagnosis')}
                        style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05))',
                            border: '2px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '16px',
                            color: '#818cf8',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'all 0.3s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <BookOpen size={28} />
                        📚 튜토리얼<br />
                        <span style={{ fontSize: '0.8rem', fontWeight: '400', color: '#94a3b8' }}>5분에 끝내기</span>
                    </motion.button>

                    {/* 경로 2: 따라하기 (따라하기 튜토리얼) */}
                    <motion.button
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/learn')}
                        style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.05))',
                            border: '2px solid rgba(168, 85, 247, 0.3)',
                            borderRadius: '16px',
                            color: '#c084fc',
                            cursor: 'pointer',
                            textAlign: 'center',
                            fontSize: '1rem',
                            fontWeight: '600',
                            transition: 'all 0.3s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        <Lightbulb size={28} />
                        💡 따라하기<br />
                        <span style={{ fontSize: '0.8rem', fontWeight: '400', color: '#94a3b8' }}>실시간 예시</span>
                    </motion.button>

                    {/* 경로 3: 지금 시작 */}
                    <Link to="/quest" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '20px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                border: 'none',
                                borderRadius: '16px',
                                color: 'white',
                                cursor: 'pointer',
                                textAlign: 'center',
                                fontSize: '1rem',
                                fontWeight: '600',
                                transition: 'all 0.3s',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                                width: '100%'
                            }}
                        >
                            <Zap size={28} />
                            🚀 지금 시작<br />
                            <span style={{ fontSize: '0.8rem', fontWeight: '400', color: 'rgba(255,255,255,0.8)' }}>바로 도전하기</span>
                        </motion.button>
                    </Link>
                </motion.div>
            </section>

            {/* ==================== 당신의 위치는? (입문자 로드맵) ==================== */}
            <section style={{
                maxWidth: '1000px',
                margin: '80px auto',
                padding: '0 20px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                        당신의 바이브 코딩 여정
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                        입문자에서 전문가까지, 단계별로 성장해보세요
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '24px'
                    }}
                >
                    {/* Stage 1: 입문자 */}
                    <JourneyCard
                        stage="Stage 1"
                        emoji="🌱"
                        title="입문자"
                        duration="1-2주"
                        color="#86efac"
                        tasks={[
                            "프롬프트 기초 배우기",
                            "첫 프로젝트 완성하기",
                            "커뮤니티 인사하기"
                        ]}
                        isActive={!user}
                    />

                    {/* Stage 2: 초보 */}
                    <JourneyCard
                        stage="Stage 2"
                        emoji="🔥"
                        title="초보자"
                        duration="2-4주"
                        color="#fca5a5"
                        tasks={[
                            "3-5개 프로젝트 만들기",
                            "심화 프롬프팅 배우기",
                            "첫 멘토 찾기"
                        ]}
                        isActive={user && (myStats?.total_points || 0) < 1000}
                    />

                    {/* Stage 3: 중급자 */}
                    <JourneyCard
                        stage="Stage 3"
                        emoji="⚡"
                        title="중급자"
                        duration="4-8주"
                        color="#60a5fa"
                        tasks={[
                            "실제 아이디어 구현",
                            "멘토링 역할 시작",
                            "포트폴리오 완성"
                        ]}
                        isActive={user && (myStats?.total_points || 0) >= 1000}
                    />
                </motion.div>
            </section>

            {/* ==================== 전통 코딩 vs 바이브 코딩 비교 ==================== */}
            <section style={{
                maxWidth: '1000px',
                margin: '80px auto',
                padding: '40px 20px',
                background: 'rgba(30, 41, 59, 0.2)',
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                        전통 코딩 vs 바이브 코딩
                    </h2>
                    <p style={{ color: '#94a3b8' }}>왜 우리는 다를까요?</p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px'
                    }}
                >
                    <ComparisonCard
                        title="코딩 경험"
                        traditional="✋ 필수 (문법 이해 필요)"
                        vibeStyle="🆗 선택 (논리만 이해하면 OK)"
                        color="#ef4444"
                    />
                    <ComparisonCard
                        title="배우는 속도"
                        traditional="🐢 느림 (몇 개월)"
                        vibeStyle="🚀 빠름 (몇 주)"
                        color="#fbbf24"
                    />
                    <ComparisonCard
                        title="에러 처리"
                        traditional="😭 스트레스"
                        vibeStyle="💭 배움의 기회"
                        color="#10b981"
                    />
                    <ComparisonCard
                        title="커뮤니티"
                        traditional="👨‍💻 경쟁 중심"
                        vibeStyle="🤝 협력 중심"
                        color="#06b6d4"
                    />
                    <ComparisonCard
                        title="최종 목표"
                        traditional="📜 완벽한 코드"
                        vibeStyle="💡 창의적 해결책"
                        color="#a855f7"
                    />
                    <ComparisonCard
                        title="준비물"
                        traditional="📚 많은 공부"
                        vibeStyle="🔥 열정만 있으면!"
                        color="#ec4899"
                    />
                </motion.div>
            </section>

            {/* ==================== 일일 영감 배너 ==================== */}
            <DailyInspirationBanner />

            {/* ==================== 대시보드 (기존 유지 - 위치만 변경) ==================== */}
            <div style={{
                maxWidth: '1000px',
                margin: '80px auto',
                padding: '0 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '20px'
            }}>
                {/* Today's Heat Card */}
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
                            viewport={{ once: true }}
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

                {/* My Vibe Stats Card */}
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

                {/* Hall of Fame Card */}
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
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <p style={{ color: '#64748b', textAlign: 'center', fontSize: '0.85rem' }}>아직 데이터가 없습니다.</p>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ==================== 이번주 도전 (Weekly Challenge) ==================== */}
            <section style={{
                maxWidth: '1000px',
                margin: '80px auto',
                padding: '0 20px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                        🏆 이번주 도전
                    </h2>
                    <p style={{ color: '#94a3b8' }}>함께 도전하고, 함께 성장해요</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        borderRadius: '24px',
                        padding: '40px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '-30%',
                        right: '-20%',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1), transparent 60%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <span style={{ fontSize: '2rem' }}>🎮</span>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: 'white', marginBottom: '4px' }}>
                                    숫자 맞추기 게임 만들기
                                </h3>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                                    컴퓨터가 정한 숫자를 맞춰보세요!
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                            <StatItem label="난이도" value="⭐ (매우 쉬움)" color="#86efac" />
                            <StatItem label="예상 시간" value="1-2시간" color="#60a5fa" />
                            <StatItem label="상품" value="🏅 뱃지 + 스포트라이트" color="#fbbf24" />
                        </div>

                        <p style={{ color: '#cbd5e1', marginBottom: '20px', lineHeight: '1.6' }}>
                            이번 도전을 통해 당신은 AI에게 프롬프트를 작성하는 방법을 배우고,
                            완성된 게임을 커뮤니티에서 자랑할 수 있습니다.
                            <br /><br />
                            <strong>완성 후: 커뮤니티에 공유 → 다른 입문자들의 응원 받기 → "내가 할 수 있다!" 경험</strong>
                        </p>

                        <Link to="/quest" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '14px 32px',
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
                                <Zap size={18} />
                                지금 도전하기
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ==================== 입문자들의 따뜻한 순간 ==================== */}
            <section style={{
                maxWidth: '1000px',
                margin: '80px auto',
                padding: '0 20px'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                        ❤️ 커뮤니티의 따뜻한 순간들
                    </h2>
                    <p style={{ color: '#94a3b8' }}>혼자가 아니라는 것을 느껴보세요</p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '20px'
                    }}
                >
                    <WarmMomentCard
                        author="초보자_A"
                        message="첫 코드 완성했어요!! 감동입니다 😭"
                        reply="멘토_X"
                        replyMessage="와 정말 잘했어! 다음 단계도 할 수 있어! 🎉"
                        hearts={23}
                        comments={5}
                    />
                    <WarmMomentCard
                        author="초보자_B"
                        message="왜 안 돼?? 😭"
                        reply="고수_Y"
                        replyMessage="이 부분 이렇게 바꿔봐! (링크)"
                        hearts={45}
                        comments={8}
                    />
                    <WarmMomentCard
                        author="초보자_C"
                        message="드디어 내 아이디어를 실제로 만들었어!"
                        reply="멘토_Z"
                        replyMessage="정말 멋있어! 이렇게 개선하면 더 좋을 것 같아!"
                        hearts={67}
                        comments={12}
                    />
                </motion.div>
            </section>

            {/* Active Squad */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                    maxWidth: '1000px',
                    margin: '80px auto',
                    padding: '30px 20px',
                    background: 'rgba(30, 41, 59, 0.3)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '24px',
                    marginBottom: '80px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2dd4bf' }}>
                        <Users size={20} />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', letterSpacing: '0.5px' }}>ACTIVE SQUAD ({activeUsers.length}명 온라인)</span>
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

            {/* ==================== 스타터 팩 ==================== */}
            <section style={{
                maxWidth: '1200px',
                margin: '80px auto',
                padding: '0 20px'
            }}>
                <StarterPack />
            </section>

            {/* Philosophy Section (유지 + 약간 개선) */}
            <section style={{ maxWidth: '1200px', margin: '0 auto 120px', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>What is Vibe Coding?</h2>
                    <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                        개발자는 '작성자(Writer)'에서 '관리자(Manager)'로 변모합니다.
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

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

// 재사용 가능한 컴포넌트들
const JourneyCard = ({ stage, emoji, title, duration, color, tasks, isActive }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -8 }}
        style={{
            background: isActive ? `linear-gradient(145deg, rgba(${color === '#86efac' ? '134,239,172' : color === '#fca5a5' ? '252,165,165' : '96,165,250'}, 0.1), transparent)` : 'rgba(30, 41, 59, 0.3)',
            backdropFilter: 'blur(10px)',
            border: isActive ? `2px solid rgba(${color === '#86efac' ? '134,239,172' : color === '#fca5a5' ? '252,165,165' : '96,165,250'}, 0.3)` : '1px solid rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '32px',
            transition: 'all 0.3s',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, rgba(${color === '#86efac' ? '134,239,172' : color === '#fca5a5' ? '252,165,165' : '96,165,250'}, 0.1), transparent 60%)`,
            pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                {stage}
            </div>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emoji}</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 4px', color: 'white' }}>{title}</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, marginBottom: '16px' }}>{duration}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasks.map((task, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                        <Check size={16} color={color} />
                        {task}
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
);

const ComparisonCard = ({ title, traditional, vibeStyle, color }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        style={{
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(10px)',
            border: `1px solid rgba(${color === '#ef4444' ? '239,68,68' : color === '#fbbf24' ? '251,191,36' : color === '#10b981' ? '16,185,129' : color === '#06b6d4' ? '6,182,212' : color === '#a855f7' ? '168,85,247' : '236,72,153'}, 0.2)`,
            borderRadius: '16px',
            padding: '24px',
            transition: 'all 0.3s'
        }}
    >
        <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color, marginBottom: '12px', margin: 0 }}>
            {title}
        </h4>
        <div style={{ marginBottom: '12px' }}>
            <p style={{ color: '#94a3b8', margin: '0 0 8px', fontSize: '0.9rem' }}>전통 코딩</p>
            <p style={{ color: '#ef4444', fontWeight: '600', margin: 0 }}>{traditional}</p>
        </div>
        <div>
            <p style={{ color: '#94a3b8', margin: '0 0 8px', fontSize: '0.9rem' }}>바이브 코딩</p>
            <p style={{ color: '#22c55e', fontWeight: '600', margin: 0 }}>{vibeStyle}</p>
        </div>
    </motion.div>
);

const StatItem = ({ label, value, color }) => (
    <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 4px' }}>{label}</p>
        <p style={{ color, fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>{value}</p>
    </div>
);

const WarmMomentCard = ({ author, message, reply, replyMessage, hearts, comments }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5 }}
        style={{
            background: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '20px',
            transition: 'all 0.3s'
        }}
    >
        <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#818cf8', fontWeight: '600', fontSize: '0.9rem', margin: '0 0 4px' }}>💬 {author}</p>
            <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.95rem' }}>{message}</p>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '12px', marginBottom: '12px', borderLeft: '3px solid #22c55e' }}>
            <p style={{ color: '#22c55e', fontWeight: '600', fontSize: '0.9rem', margin: '0 0 4px' }}>↳ {reply}</p>
            <p style={{ color: '#cbd5e1', margin: 0, fontSize: '0.85rem' }}>{replyMessage}</p>
        </div>

        <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>
            <span>❤️ {hearts}</span>
            <span>💬 {comments}</span>
        </div>
    </motion.div>
);

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
