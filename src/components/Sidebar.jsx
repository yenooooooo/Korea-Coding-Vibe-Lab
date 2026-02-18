import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Info, CalendarCheck, MessageSquare, Users, Code2, LogIn, LogOut, BarChart, User, Swords, Trophy, Target, ShoppingBag, Ticket, Backpack, Store, MessageCircle, BookOpen, Fingerprint, Box } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getVibeLevel } from '../utils/vibeLevel';

const Sidebar = () => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const navCategories = [
        {
            title: '메인 (Main)',
            items: [
                { name: '홈 (Home)', path: '/', icon: <Home size={18} /> },
                { name: '바이브 라운지 (Lounge)', path: '/community', icon: <MessageSquare size={18} /> },
                { name: '바이브 소개 (About)', path: '/about', icon: <Info size={18} /> },
            ]
        },
        {
            title: '배틀 & 경쟁 (Battle)',
            items: [
                { name: '배틀 아레나 (Arena)', path: '/battle', icon: <Swords size={18} /> },
                { name: '랭킹 (Ranking)', path: '/ranking', icon: <Trophy size={18} /> },
            ]
        },
        {
            title: '성장 & 경제 (Growth)',
            items: [
                { name: '퀘스트 (Quest)', path: '/quest', icon: <Target size={18} /> },
                { name: '상점 (Shop)', path: '/shop', icon: <ShoppingBag size={18} /> },
                { name: '시즌 패스 (Pass)', path: '/season-pass', icon: <Ticket size={18} /> },
                { name: '인벤토리 (Inventory)', path: '/inventory', icon: <Backpack size={18} /> },
                { name: '마켓 (Market)', path: '/market', icon: <Store size={18} /> },
            ]
        },
        {
            title: '소셜 & 활동 (Social)',
            items: [
                { name: '프로필 (Profile)', path: '/profile', icon: <User size={18} /> },
                { name: '친구 (Friends)', path: '/friends', icon: <Users size={18} /> },
                { name: 'DM (Messages)', path: '/messages', icon: <MessageCircle size={18} /> },
                { name: '출석 (Attendance)', path: '/attendance', icon: <CalendarCheck size={18} /> },
                { name: '스터디 (Study)', path: '/study', icon: <BookOpen size={18} /> },
            ]
        },
        {
            title: '유틸리티 (Utility)',
            items: [
                { name: '바이브 DNA', path: '/vibe-dna', icon: <Fingerprint size={18} /> },
                { name: '샌드박스 (Sandbox)', path: '/sandbox', icon: <Box size={18} /> },
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
        <aside style={{
            width: '280px', // 너비 약간 증가
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)', // 더 깊은 색감
            backdropFilter: 'blur(24px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 16px',
            boxSizing: 'border-box',
            zIndex: 50,
            boxShadow: '4px 0 24px rgba(0,0,0,0.2)'
        }}>
            {/* 로고 영역 */}
            <div style={{ marginBottom: '36px', display: 'flex', alignItems: 'center', gap: '14px', paddingLeft: '8px' }}>
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
                <div>
                    <h1 style={{
                        fontSize: '1.2rem', fontWeight: '900', margin: 0,
                        background: 'linear-gradient(to right, #fff, #94a3b8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        lineHeight: '1', letterSpacing: '-0.5px'
                    }}>
                        KOREA<br />CODING VIBE
                    </h1>
                </div>
            </div>

            {/* 네비게이션 */}
            <nav style={{
                display: 'flex', flexDirection: 'column', gap: '28px', flex: 1,
                overflowY: 'auto', paddingRight: '4px'
            }}>
                {navCategories.map((category, idx) => (
                    <div key={idx}>
                        <div style={{
                            fontSize: '0.7rem',
                            color: '#475569',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '1.2px',
                            marginBottom: '10px',
                            paddingLeft: '14px'
                        }}>
                            {category.title}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {category.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                    style={({ isActive }) => ({
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '14px',
                                        padding: '12px 14px',
                                        borderRadius: '12px',
                                        textDecoration: 'none',
                                        color: isActive ? '#fff' : '#94a3b8',
                                        background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))' : 'transparent',
                                        borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
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
                                                filter: isActive ? 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' : 'none',
                                                transition: 'all 0.2s'
                                            }}>
                                                {item.icon}
                                            </span>
                                            <span>{item.name}</span>
                                            {isActive && (
                                                <div style={{
                                                    position: 'absolute', right: '12px', width: '6px', height: '6px',
                                                    borderRadius: '50%', background: '#6366f1',
                                                    boxShadow: '0 0 8px #6366f1'
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

            {/* 하단 유저 프로필 및 액션 */}
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {user ? (
                    <>
                        {/* 관리자 버튼 (Admin Only) */}
                        {user.email === 'yaya01234@naver.com' && (
                            <NavLink
                                to="/admin"
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

                        {/* 미니 프로필 카드 */}
                        <div style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            borderRadius: '16px',
                            padding: '16px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <NavLink to="/profile" style={{ position: 'relative', cursor: 'pointer' }}>
                                    <div style={{
                                        width: '42px', height: '42px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: '2px solid rgba(255,255,255,0.1)',
                                        overflow: 'hidden'
                                    }}>
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <User size={24} color="#1e293b" />
                                        )}
                                    </div>
                                    <div style={{
                                        position: 'absolute', bottom: -2, right: -2,
                                        width: '14px', height: '14px',
                                        borderRadius: '50%',
                                        background: '#10b981',
                                        border: '2px solid #0f172a',
                                        boxShadow: '0 0 0 1px rgba(16, 185, 129, 0.2)'
                                    }} />
                                </NavLink>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        color: '#fff', fontWeight: 'bold', fontSize: '0.95rem',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {profile?.nickname || user.email?.split('@')[0]}
                                    </div>
                                    <div style={{
                                        color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px',
                                        display: 'flex', alignItems: 'center', gap: '4px'
                                    }}>
                                        <span style={{
                                            background: `${levelInfo.color}20`, color: levelInfo.color,
                                            padding: '1px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold'
                                        }}>
                                            Lv.{levelInfo.level}
                                        </span>
                                        <span>{levelInfo.title}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '6px',
                                        borderRadius: '8px',
                                        transition: 'background 0.2s'
                                    }}
                                    title="로그아웃"
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>

                            {/* XP Progress Bar */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                                    <span>XP</span>
                                    <span>{levelInfo.xpCurrent} / {levelInfo.xpRequired} ({Math.round(levelInfo.progress)}%)</span>
                                </div>
                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${levelInfo.progress}%`, height: '100%',
                                        background: `linear-gradient(90deg, ${levelInfo.color}, #a855f7)`,
                                        borderRadius: '2px',
                                        transition: 'width 0.5s ease-out'
                                    }} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <NavLink
                        to="/login"
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
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
        </aside>
    );
};

export default Sidebar;
