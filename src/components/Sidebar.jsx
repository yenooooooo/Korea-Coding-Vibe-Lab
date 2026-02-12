import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Info, CalendarCheck, MessageSquare, Users, Code2, LogIn, LogOut, BarChart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const navItems = [
        { name: '홈 (Home)', path: '/', icon: <Home size={20} /> },
        { name: '바이브 소개 (About)', path: '/about', icon: <Info size={20} /> },
        { name: '출석 체크 (Attendance)', path: '/attendance', icon: <CalendarCheck size={20} /> },
        { name: '커뮤니티 (Lounge)', path: '/community', icon: <MessageSquare size={20} /> },
        { name: '바이브 메이트 (Study)', path: '/study', icon: <Users size={20} /> },
    ];

    return (
        <aside style={{
            width: '260px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            boxSizing: 'border-box',
            zIndex: 10
        }}>
            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    width: '40px', height: '40px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <Code2 color="white" size={24} />
                </div>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Korea Coding<br />Vibe Lab
                </h1>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            color: isActive ? '#fff' : '#94a3b8',
                            backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                            border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                            transition: 'all 0.2s ease',
                            fontWeight: isActive ? 600 : 400
                        })}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {user ? (
                    <>
                        <NavLink
                            to="/profile"
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: isActive ? '#fff' : '#cbd5e1',
                                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                                transition: 'all 0.2s ease'
                            })}
                        >
                            <User size={20} />
                            <span>내 프로필 (Profile)</span>
                        </NavLink>
                        {user.email === 'yaya01234@naver.com' && (
                            <NavLink
                                to="/admin"
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    color: isActive ? '#fff' : '#cbd5e1',
                                    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                                    transition: 'all 0.2s ease'
                                })}
                            >
                                <BarChart size={20} />
                                <span>관리자 (Admin)</span>
                            </NavLink>
                        )}
                        <button
                            onClick={handleLogout}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                color: '#fca5a5',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                width: '100%',
                                textAlign: 'left'
                            }}
                        >
                            <LogOut size={20} />
                            <span>로그아웃 (Logout)</span>
                        </button>
                    </>
                ) : (
                    <NavLink
                        to="/login"
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            textDecoration: 'none',
                            color: isActive ? '#fff' : '#cbd5e1',
                            backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            transition: 'all 0.2s ease'
                        })}
                    >
                        <LogIn size={20} />
                        <span>로그인 (Login)</span>
                    </NavLink>
                )}

                <div style={{ padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Avatar in footer */}
                        {user && (
                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#1e293b', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* We need to fetch profile here or rely on AuthContext. Let's use AuthContext's profile */}
                            </div>
                        )}
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                            {user ? `Welcome, ${user.email?.split('@')[0]}!` : 'Join the Vibe.'}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
