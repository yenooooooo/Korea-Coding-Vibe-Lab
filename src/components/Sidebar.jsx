import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Info, CalendarCheck, MessageSquare, Users, Code2, LogIn, LogOut, BarChart, User, Swords, Trophy, Target, ShoppingBag, Ticket, Backpack, Store, MessageCircle, BookOpen, Fingerprint, Box, Bell, Lightbulb, Users2, Zap, Microscope, Award, Image, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getVibeLevel } from '../utils/vibeLevel';

const Sidebar = ({ isNavOpen = false, onToggle = () => { }, notificationCount = 0, onNotificationClick = () => { } }) => {
    // CSS 애니메이션 스타일 추가
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% {
                    box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
                }
                50% {
                    box-shadow: 0 0 12px rgba(16, 185, 129, 0.9);
                }
            }
            @keyframes shimmer {
                0% {
                    transform: translateX(-100%);
                    opacity: 0;
                }
                50% {
                    opacity: 1;
                }
                100% {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();
    const [notificationPulse, setNotificationPulse] = React.useState(false);
    const [targetCategory, setTargetCategory] = React.useState(null);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    // 새 알림이 들어올 때 애니메이션 트리거
    React.useEffect(() => {
        if (notificationCount > 0) {
            setNotificationPulse(true);
            const timer = setTimeout(() => setNotificationPulse(false), 600);
            return () => clearTimeout(timer);
        }
    }, [notificationCount]);

    // 카테고리 자동 스크롤
    React.useEffect(() => {
        if (isNavOpen && targetCategory) {
            const timer = setTimeout(() => {
                const element = document.getElementById(`category-${targetCategory}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                setTargetCategory(null);
            }, 300); // 패널이 열리는 애니메이션 시간과 맞춤
            return () => clearTimeout(timer);
        }
    }, [isNavOpen, targetCategory]);

    const handleCategoryClick = (categoryId) => {
        if (!isNavOpen) {
            setTargetCategory(categoryId);
            onToggle();
        } else {
            const element = document.getElementById(`category-${categoryId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const navCategories = [
        {
            id: 'main',
            title: 'Main',
            icon: <Home size={24} />,
            color: '#6366f1',
            bgColor: 'rgba(99, 102, 241, 0.1)',
            borderColor: '#6366f1',
            items: [
                { name: '홈 (Home)', path: '/', icon: <Home size={18} /> },
                { name: '바이브 라운지 (Lounge)', path: '/community', icon: <MessageSquare size={18} /> },
                { name: '바이브 소개 (About)', path: '/about', icon: <Info size={18} /> },
            ]
        },
        {
            id: 'battle',
            title: 'Battle',
            icon: <Swords size={24} />,
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: '#f59e0b',
            items: [
                { name: '배틀 아레나 (Arena)', path: '/battle', icon: <Swords size={18} /> },
                { name: '랭킹 (Ranking)', path: '/ranking', icon: <Trophy size={18} /> },
            ]
        },
        {
            id: 'growth',
            title: 'Growth',
            icon: <Target size={24} />,
            color: '#ec4899',
            bgColor: 'rgba(236, 72, 153, 0.1)',
            borderColor: '#ec4899',
            items: [
                { name: '퀘스트 (Quest)', path: '/quest', icon: <Target size={18} /> },
                { name: '상점 (Shop)', path: '/shop', icon: <ShoppingBag size={18} /> },
                { name: '시즌 패스 (Pass)', path: '/season-pass', icon: <Ticket size={18} /> },
                { name: '인벤토리 (Inventory)', path: '/inventory', icon: <Backpack size={18} /> },
                { name: '마켓 (Market)', path: '/market', icon: <Store size={18} /> },
                { name: '멘토 찾기 (Mentor)', path: '/mentor', icon: <Users2 size={18} /> },
                { name: '자기진단 (Diagnosis)', path: '/diagnosis', icon: <Microscope size={18} /> },
                { name: '주간 챌린지 (Challenge)', path: '/challenge', icon: <Award size={18} /> },
            ]
        },
        {
            id: 'social',
            title: 'Social',
            icon: <Users size={24} />,
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)',
            borderColor: '#10b981',
            items: [
                { name: '프로필 (Profile)', path: '/profile', icon: <User size={18} /> },
                { name: '친구 (Friends)', path: '/friends', icon: <Users size={18} /> },
                { name: 'DM (Messages)', path: '/messages', icon: <MessageCircle size={18} /> },
                { name: '출석 (Attendance)', path: '/attendance', icon: <CalendarCheck size={18} /> },
                { name: '스터디 (Study)', path: '/study', icon: <BookOpen size={18} /> },
                { name: '따뜻한 순간 (Moments)', path: '/moments', icon: <Heart size={18} /> },
            ]
        },
        {
            id: 'utility',
            title: 'Utility',
            icon: <Fingerprint size={24} />,
            color: '#8b5cf6',
            bgColor: 'rgba(139, 92, 246, 0.1)',
            borderColor: '#8b5cf6',
            items: [
                { name: '바이브 DNA', path: '/vibe-dna', icon: <Fingerprint size={18} /> },
                { name: '샌드박스 (Sandbox)', path: '/sandbox', icon: <Box size={18} /> },
            ]
        },
        {
            id: 'learn',
            title: 'Learn',
            icon: <Lightbulb size={24} />,
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: '#f59e0b',
            items: [
                { name: '따라하기 (Learn)', path: '/learn', icon: <Lightbulb size={18} /> },
                { name: '데모 (Demo)', path: '/demo', icon: <Zap size={18} /> },
            ]
        },
        {
            id: 'creative',
            title: 'Creative',
            icon: <Image size={24} />,
            color: '#ec4899',
            bgColor: 'rgba(236, 72, 153, 0.1)',
            borderColor: '#ec4899',
            items: [
                { name: '라이브 갤러리 (Gallery)', path: '/gallery', icon: <Image size={18} /> },
            ]
        }
    ];

    // 정확한 레벨 및 XP 계산 (Safety Check)
    const levelInfo = React.useMemo(() => {
        try {
            if (typeof getVibeLevel === 'function') {
                return getVibeLevel(profile?.total_points || 0);
            }
        } catch (e) {
            console.error("Level calc error:", e);
        }
        return { level: 1, title: '비기너', xpCurrent: 0, xpRequired: 100, progress: 0, color: '#94a3b8' };
    }, [profile?.total_points]);

    return (
        <>
            {/* 기본 상태: 아이콘 전용 (60px) */}
            <aside style={{
                width: '60px',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
                backdropFilter: 'blur(24px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.03)',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 8px',
                boxSizing: 'border-box',
                zIndex: 50,
                boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
                gap: '8px'
            }}>
                {/* 로고 */}
                <div style={{
                    width: '44px', height: '44px',
                    margin: '0 auto 12px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                    <Code2 color="white" size={24} />
                </div>

                {/* 네비게이션 탭 (아이콘만) */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                    {navCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            style={{
                                width: '44px', height: '44px',
                                border: 'none',
                                background: targetCategory === category.id ? category.bgColor : 'transparent',
                                borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: category.color,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                position: 'relative'
                            }}
                            title={category.title}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = category.bgColor;
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = targetCategory === category.id ? category.bgColor : 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            {category.icon}
                        </button>
                    ))}
                </nav>

                {/* 알림 아이콘 */}
                <button
                    onClick={onNotificationClick}
                    style={{
                        width: '44px', height: '44px',
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: notificationCount > 0 ? '#f59e0b' : '#64748b',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                    }} title={`알림 (${notificationCount})`}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
                        e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    <Bell size={24} />
                    {notificationCount > 0 && (
                        <motion.div
                            animate={notificationPulse ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                            transition={{ duration: 0.6 }}
                            style={{
                                position: 'absolute', top: '2px', right: '2px',
                                minWidth: '18px', height: '18px', borderRadius: '50%',
                                background: '#ef4444', boxShadow: '0 0 6px #ef4444',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.65rem', fontWeight: 'bold', color: '#fff',
                                border: '2px solid rgba(15, 23, 42, 0.95)'
                            }}
                        >
                            {notificationCount > 9 ? '9+' : notificationCount}
                        </motion.div>
                    )}
                </button>

                {/* 미니 프로필 (아바타 + 레벨 배지) */}
                <div style={{ marginTop: 'auto', position: 'relative' }}>
                    {user ? (
                        <NavLink to="/profile" style={{ position: 'relative', cursor: 'pointer', display: 'inline-block' }}>
                            <div style={{
                                width: '44px', height: '44px',
                                borderRadius: '50%',
                                background: levelInfo.color + '30',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `2px solid ${levelInfo.color}60`,
                                overflow: 'hidden',
                                transition: 'all 0.3s',
                                boxShadow: `0 0 12px ${levelInfo.color}40`
                            }} onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'scale(1.15)';
                                e.currentTarget.style.boxShadow = `0 0 16px ${levelInfo.color}80, inset 0 0 8px ${levelInfo.color}40`;
                            }} onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = `0 0 12px ${levelInfo.color}40`;
                            }}>
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={24} color="#1e293b" />
                                )}
                            </div>
                            {/* 온라인 상태 배지 */}
                            <div style={{
                                position: 'absolute', bottom: 0, right: 0,
                                width: '12px', height: '12px',
                                borderRadius: '50%',
                                background: '#10b981',
                                border: '2px solid #0f172a',
                                boxShadow: '0 0 4px rgba(16, 185, 129, 0.5)'
                            }} />
                            {/* 레벨 뱃지 */}
                            <div style={{
                                position: 'absolute', top: -6, right: -6,
                                width: '24px', height: '24px',
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}cc)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem',
                                boxShadow: `0 4px 8px rgba(0,0,0,0.3), 0 0 8px ${levelInfo.color}80`,
                                border: '2px solid #0f172a'
                            }}>
                                {levelInfo.icon}
                            </div>
                        </NavLink>
                    ) : (
                        <NavLink to="/login" style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '44px', height: '44px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            color: '#fff', textDecoration: 'none',
                            transition: 'transform 0.2s'
                        }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <LogIn size={20} />
                        </NavLink>
                    )}
                </div>
            </aside>

            {/* 펼침 상태 오버레이 */}
            <AnimatePresence>
                {isNavOpen && (
                    <>
                        {/* 백드롭 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={onToggle}
                            style={{
                                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                backdropFilter: 'blur(4px)',
                                zIndex: 49
                            }}
                        />

                        {/* 슬라이드 오버레이 */}
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            style={{
                                width: '280px',
                                height: '100vh',
                                position: 'fixed',
                                left: 0,
                                top: 0,
                                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)',
                                backdropFilter: 'blur(24px)',
                                borderRight: '1px solid rgba(255, 255, 255, 0.03)',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '24px 16px',
                                boxSizing: 'border-box',
                                zIndex: 51,
                                boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
                                overflowY: 'auto'
                            }}
                        >
                            {/* 로고 + 알림 + 닫기 */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '36px', paddingLeft: '8px' }}>
                                <div style={{
                                    minWidth: '42px', height: '42px',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                    borderRadius: '12px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <Code2 color="white" size={24} />
                                </div>
                                <h1 style={{
                                    fontSize: '1.2rem', fontWeight: '900', margin: 0, flex: 1,
                                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    lineHeight: '1', letterSpacing: '-0.5px'
                                }}>
                                    KOREA<br />CODING VIBE
                                </h1>
                                <button
                                    onClick={onNotificationClick}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: notificationCount > 0 ? '#f59e0b' : '#64748b',
                                        cursor: 'pointer',
                                        padding: '6px',
                                        fontSize: '1.2rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative',
                                        transition: 'color 0.2s'
                                    }}
                                    title={`알림 (${notificationCount})`}
                                >
                                    <Bell size={20} />
                                    {notificationCount > 0 && (
                                        <motion.div
                                            animate={notificationPulse ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                                            transition={{ duration: 0.6 }}
                                            style={{
                                                position: 'absolute', top: '-2px', right: '-2px',
                                                minWidth: '16px', height: '16px', borderRadius: '50%',
                                                background: '#ef4444', boxShadow: '0 0 6px #ef4444',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.6rem', fontWeight: 'bold', color: '#fff',
                                                border: '1px solid rgba(15, 23, 42, 0.95)'
                                            }}
                                        >
                                            {notificationCount > 9 ? '9+' : notificationCount}
                                        </motion.div>
                                    )}
                                </button>
                                <button
                                    onClick={onToggle}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        padding: '6px',
                                        fontSize: '1.5rem',
                                        lineHeight: '1'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <nav style={{ display: 'flex', flexDirection: 'column', gap: '28px', flex: 1 }}>
                                {navCategories.map((category) => (
                                    <div key={category.id} id={`category-${category.id}`}>
                                        <div style={{
                                            fontSize: '0.7rem',
                                            color: '#475569',
                                            fontWeight: '800',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1.2px',
                                            marginBottom: '10px',
                                            paddingLeft: '14px',
                                            display: 'flex', alignItems: 'center', gap: '8px'
                                        }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                width: '20px', height: '20px', borderRadius: '6px',
                                                background: category.bgColor, color: category.color
                                            }}>
                                                {React.cloneElement(category.icon, { size: 14 })}
                                            </span>
                                            {category.title}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {category.items.map((item) => (
                                                <NavLink
                                                    key={item.path}
                                                    to={item.path}
                                                    onClick={onToggle}
                                                    style={({ isActive }) => ({
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '14px',
                                                        padding: '12px 14px',
                                                        borderRadius: '12px',
                                                        textDecoration: 'none',
                                                        color: isActive ? '#fff' : '#94a3b8',
                                                        background: isActive ? `${category.bgColor}` : 'transparent',
                                                        borderLeft: isActive ? `3px solid ${category.color}` : '3px solid transparent',
                                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        fontWeight: isActive ? 600 : 500,
                                                        fontSize: '0.92rem',
                                                        position: 'relative'
                                                    })}
                                                >
                                                    {({ isActive }) => (
                                                        <>
                                                            <span style={{
                                                                opacity: isActive ? 1 : 0.6,
                                                                filter: isActive ? `drop-shadow(0 0 8px ${category.color}80)` : 'none',
                                                                transition: 'all 0.2s',
                                                                color: isActive ? category.color : 'inherit'
                                                            }}>
                                                                {item.icon}
                                                            </span>
                                                            <span>{item.name}</span>
                                                            {isActive && (
                                                                <div style={{
                                                                    position: 'absolute', right: '12px', width: '6px', height: '6px',
                                                                    borderRadius: '50%', background: category.color,
                                                                    boxShadow: `0 0 8px ${category.color}`
                                                                }} />
                                                            )}
                                                        </>
                                                    )}
                                                </NavLink>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </nav>

                            {/* 하단 프로필 카드 */}
                            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {user ? (
                                    <>
                                        {user.email === 'yaya01234@naver.com' && (
                                            <NavLink
                                                to="/admin"
                                                onClick={onToggle}
                                                style={({ isActive }) => ({
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                                    padding: '12px', borderRadius: '12px',
                                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))',
                                                    border: '1px solid rgba(245, 158, 11, 0.3)',
                                                    color: '#fbbf24', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem',
                                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)',
                                                    marginBottom: '10px'
                                                })}
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        <BarChart size={18} />
                                                        <span>관리자 (MASTER)</span>
                                                    </>
                                                )}
                                            </NavLink>
                                        )}

                                        <div style={{
                                            background: `linear-gradient(135deg, ${levelInfo.color}15, ${levelInfo.color}05)`,
                                            borderRadius: '14px',
                                            padding: '14px',
                                            border: `1.5px solid ${levelInfo.color}40`,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '10px',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: `0 8px 32px rgba(0,0,0,0.2), inset 0 0 12px ${levelInfo.color}15`
                                        }}>
                                            {/* 상단: 아바타 + 닉네임/레벨 + 로그아웃 */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                {/* 아바타 */}
                                                <NavLink to="/profile" onClick={onToggle} style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
                                                    <div style={{
                                                        width: '44px', height: '44px',
                                                        borderRadius: '50%',
                                                        background: `linear-gradient(135deg, ${levelInfo.color}40, ${levelInfo.color}20)`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        border: `2.5px solid ${levelInfo.color}80`,
                                                        overflow: 'hidden',
                                                        boxShadow: `0 0 12px ${levelInfo.color}50, inset 0 0 6px ${levelInfo.color}30`,
                                                        transition: 'all 0.3s'
                                                    }} onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.1)';
                                                        e.currentTarget.style.boxShadow = `0 0 16px ${levelInfo.color}80, inset 0 0 8px ${levelInfo.color}40`;
                                                    }} onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.style.boxShadow = `0 0 12px ${levelInfo.color}50, inset 0 0 6px ${levelInfo.color}30`;
                                                    }}>
                                                        {profile?.avatar_url ? (
                                                            <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <User size={24} color="#1e293b" />
                                                        )}
                                                    </div>
                                                    {/* 온라인 상태 배지 */}
                                                    <div style={{
                                                        position: 'absolute', bottom: 0, right: 0,
                                                        width: '12px', height: '12px',
                                                        borderRadius: '50%',
                                                        background: '#10b981',
                                                        border: '2px solid #0f172a',
                                                        boxShadow: '0 0 6px rgba(16, 185, 129, 0.6)',
                                                        animation: 'pulse 2s infinite'
                                                    }} />
                                                    {/* 레벨 배지 */}
                                                    <div style={{
                                                        position: 'absolute', top: -4, right: -4,
                                                        width: '22px', height: '22px',
                                                        borderRadius: '50%',
                                                        background: `linear-gradient(135deg, ${levelInfo.color}, ${levelInfo.color}cc)`,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.85rem',
                                                        boxShadow: `0 3px 6px rgba(0,0,0,0.3), 0 0 8px ${levelInfo.color}80`,
                                                        border: '2px solid #0f172a'
                                                    }}>
                                                        {levelInfo.icon}
                                                    </div>
                                                </NavLink>

                                                {/* 중앙: 닉네임 + 레벨 정보 */}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        color: '#fff', fontWeight: '800', fontSize: '0.95rem',
                                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                        marginBottom: '3px'
                                                    }}>
                                                        {profile?.nickname || user.email?.split('@')[0]}
                                                    </div>
                                                    <div style={{
                                                        display: 'flex', alignItems: 'center', gap: '5px',
                                                        flexWrap: 'wrap'
                                                    }}>
                                                        <span style={{
                                                            background: `${levelInfo.color}35`, color: levelInfo.color,
                                                            padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '800',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            Lv.{levelInfo.level}
                                                        </span>
                                                        <span style={{
                                                            color: levelInfo.color, fontSize: '0.75rem', fontWeight: '600',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {levelInfo.title}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* 우측: 로그아웃 버튼 */}
                                                <button
                                                    onClick={handleLogout}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.15)',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        padding: '6px 8px',
                                                        borderRadius: '8px',
                                                        transition: 'all 0.2s',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}
                                                    title="로그아웃"
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                                                        e.currentTarget.style.transform = 'scale(1.15)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                    }}
                                                >
                                                    <LogOut size={16} />
                                                </button>
                                            </div>

                                            {/* 하단: XP 프로그레스 바 */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                                                        다음 레벨
                                                    </span>
                                                    <span style={{ fontSize: '0.68rem', fontWeight: '600', color: levelInfo.color }}>
                                                        {levelInfo.xpCurrent}/{levelInfo.xpRequired}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)',
                                                    borderRadius: '3px', overflow: 'hidden',
                                                    border: `1px solid ${levelInfo.color}30`
                                                }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${levelInfo.progress}%` }}
                                                        transition={{ duration: 0.6, ease: 'easeOut' }}
                                                        style={{
                                                            height: '100%',
                                                            background: `linear-gradient(90deg, ${levelInfo.color}, ${levelInfo.color}dd)`,
                                                            borderRadius: '3px',
                                                            boxShadow: `0 0 10px ${levelInfo.color}70`,
                                                            position: 'relative'
                                                        }}
                                                    >
                                                        <div style={{
                                                            position: 'absolute', right: 0, top: 0, bottom: 0,
                                                            width: '2px',
                                                            background: 'rgba(255,255,255,0.4)',
                                                            animation: 'shimmer 2s infinite'
                                                        }} />
                                                    </motion.div>
                                                </div>
                                                <div style={{
                                                    fontSize: '0.65rem', color: '#64748b', textAlign: 'right',
                                                    fontWeight: '500'
                                                }}>
                                                    {Math.round(levelInfo.progress)}%
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <NavLink
                                        to="/login"
                                        onClick={onToggle}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                            padding: '14px', borderRadius: '14px',
                                            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                                            color: '#fff', textDecoration: 'none', fontWeight: 'bold',
                                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
                                            border: '1px solid rgba(255,255,255,0.1)'
                                        }}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <LogIn size={20} />
                                                <span>로그인하고 시작하기</span>
                                            </>
                                        )}
                                    </NavLink>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
