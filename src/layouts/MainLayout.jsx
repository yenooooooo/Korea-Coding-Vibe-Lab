import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, Vote, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import GlobalBanner from '../components/GlobalBanner';
import AdminEntryToast from '../components/AdminEntryToast';
import ScrollToTop from '../components/ScrollToTop';
import NotificationPanel from '../components/NotificationPanel';
import SearchModal from '../components/SearchModal';
import OnboardingTour from '../components/OnboardingTour';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const MainLayout = () => {
    const { user } = useAuth();
    const { themeColors } = useTheme();
    const location = useLocation();
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
    const [activeVibe, setActiveVibe] = useState('default');
    const [announcement, setAnnouncement] = useState(null);
    const [isGlitching, setIsGlitching] = useState(false);
    const [activePoll, setActivePoll] = useState(null);
    const [voted, setVoted] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Ctrl+K 검색 단축키
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleVote = async (choice) => {
        if (!activePoll?._broadcastId || !user) return;

        // Optimistic UI Update (즉시 반응)
        setVoted(true);

        try {
            // upsert: 기존 투표가 있으면 수정, 없으면 삽입
            const { error } = await supabase.from('poll_votes').upsert({
                broadcast_id: activePoll._broadcastId,
                user_id: user.id,
                vote: choice,
                created_at: new Date() // created_at 갱신 (선택사항)
            }, { onConflict: 'broadcast_id, user_id' });

            if (error) throw error;

            console.log('투표 완료:', choice);
        } catch (err) {
            console.error('투표 실패:', err);
            alert('투표 처리에 실패했습니다. 다시 시도해주세요.');
            setVoted(false);
        }
    };

    const fireConfetti = () => {
        if (window.confetti) {
            window.confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#a855f7', '#10b981', '#ef4444']
            });
        } else {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.js';
            script.onload = () => {
                window.confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#3b82f6', '#a855f7', '#10b981', '#ef4444']
                });
            };
            document.head.appendChild(script);
        }
    };

    // 공지/효과/투표 수신 기록
    const recordBroadcastView = async (broadcastId) => {
        if (!user?.id) return;
        await supabase.from('broadcast_views').insert({
            broadcast_id: broadcastId,
            user_id: user.id
        }).catch(err => console.log('View already recorded or error:', err));
    };

    // 읽지 않은 알림 개수 구독 + 실시간 팝업 토스트
    const [popupNotification, setPopupNotification] = useState(null);

    useEffect(() => {
        if (!user) return;

        const fetchUnreadCount = async () => {
            const { count } = await supabase
                .from('notifications')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', user.id)
                .eq('is_read', false);
            setUnreadNotificationCount(count || 0);
        };

        fetchUnreadCount();

        // Realtime subscription for unread count + popup
        const channel = supabase
            .channel('unread_notifications_' + user.id)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setUnreadNotificationCount(prev => prev + 1);
                    // 실시간 팝업 토스트 표시
                    setPopupNotification(payload.new);
                    setTimeout(() => setPopupNotification(null), 5000);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.new.is_read && !payload.old.is_read) {
                        // 미읽음 → 읽음으로 변경: 카운트 -1
                        setUnreadNotificationCount(prev => Math.max(0, prev - 1));
                    } else if (!payload.new.is_read && payload.old.is_read) {
                        // 읽음 → 미읽음으로 변경: 카운트 +1
                        setUnreadNotificationCount(prev => prev + 1);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    useEffect(() => {
        // Secure Broadcast Listener (Listen to Table Changes)
        const channel = supabase
            .channel('secure_broadcasts')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'admin_broadcasts'
                },
                (payload) => {
                    const { type, payload: data, id: broadcastId } = payload.new;

                    // 수신 기록
                    recordBroadcastView(broadcastId);

                    if (type === 'vibe_change') {
                        setActiveVibe(data.vibe);
                    } else if (type === 'announcement') {
                        setAnnouncement(data);
                    } else if (type === 'fx') {
                        if (data.fx === 'confetti') {
                            fireConfetti();
                        } else if (data.fx === 'glitch') {
                            setIsGlitching(true);
                            setTimeout(() => setIsGlitching(false), 2000);
                        }
                    } else if (type === 'poll') {
                        setActivePoll({ ...data, _broadcastId: broadcastId });
                        setVoted(false);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'admin_broadcasts'
                },
                (payload) => {
                    const { type, active } = payload.new;
                    if (!active) {
                        if (type === 'announcement') setAnnouncement(null);
                        if (type === 'poll') setActivePoll(null);
                    }
                }
            )
            .subscribe();

        // Admin Presence Tracking (Oracle Eye)
        const presenceChannel = supabase.channel('online-users', {
            config: { presence: { key: user?.id || 'guest-' + Math.random().toString(36).substr(2, 5) } }
        });

        presenceChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await presenceChannel.track({
                    user_id: user?.id,
                    username: user?.user_metadata?.username || 'Guest',
                    currentPath: location.pathname,
                    lastActive: new Date().toISOString()
                });
            }
        });

        const localVibeHandler = (e) => setActiveVibe(e.detail);
        window.addEventListener('local_vibe_change', localVibeHandler);

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(presenceChannel);
            window.removeEventListener('local_vibe_change', localVibeHandler);
        };
    }, [user, location.pathname]);

    // Vibe Configurations
    const vibeStyles = {
        default: { background: themeColors.bg },
        hyper_blue: { background: 'radial-gradient(circle at top right, #1e3a8a, #020617)', filter: 'hue-rotate(-10deg) saturate(1.2)' },
        purple_glow: { background: 'radial-gradient(circle at top right, #4c1d95, #0f172a)', filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))' },
        emerald_chill: { background: 'radial-gradient(circle at top right, #064e3b, #020617)', filter: 'contrast(1.1) brightness(0.9)' },
        blood_moon: { background: 'radial-gradient(circle at top right, #7f1d1d, #0f172a)', filter: 'sepia(0.2) saturate(1.5)' },
    };

    return (
        <>
            {/* CSS Keyframes */}
            <style>{`
                @keyframes adminAvatarBorder {
                    0% { border-color: #a855f7; box-shadow: 0 0 0 2px #a855f7, 0 0 12px rgba(168,85,247,0.4); }
                    33% { border-color: #6366f1; box-shadow: 0 0 0 2px #6366f1, 0 0 12px rgba(99,102,241,0.4); }
                    66% { border-color: #f472b6; box-shadow: 0 0 0 2px #f472b6, 0 0 12px rgba(244,114,182,0.4); }
                    100% { border-color: #a855f7; box-shadow: 0 0 0 2px #a855f7, 0 0 12px rgba(168,85,247,0.4); }
                }
                .admin-avatar-animated {
                    animation: adminAvatarBorder 3s ease-in-out infinite;
                }
                @keyframes announcementPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
                @keyframes glitchEffect {
                    0% { transform: translate(0); filter: hue-rotate(0deg); }
                    20% { transform: translate(-5px, 5px); filter: hue-rotate(90deg); }
                    40% { transform: translate(5px, -5px); filter: hue-rotate(180deg); }
                    60% { transform: translate(-5px, -5px); filter: hue-rotate(270deg); }
                    80% { transform: translate(5px, 5px); filter: hue-rotate(360deg); }
                    100% { transform: translate(0); }
                }
                .glitch-active {
                    animation: glitchEffect 0.2s infinite;
                    pointer-events: none;
                }
            `}</style>

            <div
                className={isGlitching ? 'glitch-active' : ''}
                style={{
                    display: 'flex',
                    minHeight: '100vh',
                    transition: 'all 1s ease',
                    ...vibeStyles[activeVibe] || vibeStyles.default,
                    filter: vibeStyles[activeVibe]?.filter || 'none',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {isGlitching && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255,0,0,0.1)', zIndex: 99999,
                        mixBlendMode: 'overlay'
                    }} />
                )}
                <Sidebar
                    isNavOpen={isNavOpen}
                    onToggle={() => setIsNavOpen(!isNavOpen)}
                    notificationCount={unreadNotificationCount}
                    onNotificationClick={() => setIsNotificationOpen(!isNotificationOpen)}
                />
                <div style={{
                    marginLeft: '60px',
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: 'auto', // Fix horizontal scroll issue
                    transition: 'margin-left 0.3s ease',
                }}>
                    <GlobalBanner />
                    <main style={{
                        flex: 1,
                        padding: '40px',
                        width: '100%',
                        maxWidth: '1280px', // Global max width constraint
                        margin: '0 auto'    // Center content
                    }}>
                        <Outlet />
                    </main>
                </div>
            </div>

            {/* Global Announcement Overlay */}
            <AnimatePresence>
                {announcement && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 10000, padding: '40px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            style={{
                                maxWidth: '600px', width: '100%', textAlign: 'center',
                                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                                padding: '40px', borderRadius: '32px',
                                border: '2px solid rgba(245, 158, 11, 0.5)',
                                boxShadow: '0 20px 80px rgba(245, 158, 11, 0.2)'
                            }}
                        >
                            <Megaphone size={64} color="#f59e0b" style={{ marginBottom: '24px', animation: 'announcementPulse 2s infinite' }} />
                            <div style={{ color: '#f59e0b', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '12px' }}>
                                SYSTEM NOTIFICATION
                            </div>
                            <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '24px', lineHeight: '1.4' }}>
                                {announcement.message}
                            </h2>
                            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '32px' }}>
                                From: <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>{announcement.sender}</span>
                            </div>
                            <button
                                onClick={() => setAnnouncement(null)}
                                style={{
                                    padding: '12px 32px', borderRadius: '16px', border: 'none',
                                    background: 'rgba(255,255,255,0.05)', color: '#fff',
                                    fontWeight: 'bold', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'
                                }}
                            >
                                <X size={18} /> 닫기
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Oracle Poll Overlay */}
            <AnimatePresence>
                {activePoll && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        style={{
                            position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
                            zIndex: 9999, width: '90%', maxWidth: '400px'
                        }}
                    >
                        <div style={{
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '24px',
                            padding: '24px',
                            border: '1px solid rgba(129, 140, 248, 0.3)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            textAlign: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                                <Vote size={20} color="#818cf8" />
                                <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 'bold', letterSpacing: '1px' }}>ORACLE POLL</span>
                            </div>
                            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '20px' }}>{activePoll.question}</h3>

                            {!voted ? (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => handleVote('yes')}
                                        style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        👍 찬성
                                    </button>
                                    <button
                                        onClick={() => handleVote('no')}
                                        style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        👎 반대
                                    </button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    style={{ color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1rem', fontWeight: 'bold' }}
                                >
                                    <CheckCircle2 size={24} /> 투표 완료! (참여 감사합니다)
                                </motion.div>
                            )}

                            <button
                                onClick={() => setActivePoll(null)}
                                style={{ marginTop: '16px', color: '#64748b', background: 'none', border: 'none', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                닫기 (다음에 참여)
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <NotificationPanel
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                style={{
                    left: isNavOpen ? '300px' : '100px',
                    top: '20px',
                    transition: 'left 0.3s ease'
                }}
            />

            <ScrollToTop />
            <AdminEntryToast />
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
            <OnboardingTour />

            {/* 실시간 알림 팝업 토스트 */}
            <AnimatePresence>
                {popupNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: -30, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        onClick={() => {
                            setPopupNotification(null);
                            setIsNotificationOpen(true);
                        }}
                        style={{
                            position: 'fixed',
                            top: '24px',
                            right: '24px',
                            zIndex: 10001,
                            background: 'rgba(15, 23, 42, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '16px',
                            padding: '16px 20px',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.15)',
                            maxWidth: '360px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '12px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            flexShrink: 0,
                        }}>
                            🔔
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                                margin: 0,
                                fontSize: '0.85rem',
                                color: '#e2e8f0',
                                lineHeight: '1.4',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                            }}>
                                {popupNotification.message}
                            </p>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                                방금 전 · 클릭하여 확인
                            </span>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setPopupNotification(null); }}
                            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
                        >
                            ✕
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MainLayout;
