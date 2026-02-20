import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, UserPlus, CheckCircle, XCircle, CheckCheck, X, MessageSquare, Trophy, Zap, Gift, Star, Users, CalendarCheck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const NOTIFICATION_ICONS = {
    REACTION: { icon: ThumbsUp, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)' },
    JOIN_REQUEST: { icon: UserPlus, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)' },
    JOIN_APPROVED: { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
    JOIN_REJECTED: { icon: XCircle, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' },
    NEW_MESSAGE: { icon: MessageSquare, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
    RANK_UP: { icon: Trophy, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    ACHIEVEMENT: { icon: Star, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    POINTS_EARNED: { icon: Zap, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
    BADGE_EARNED: { icon: Gift, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    FRIEND_REQUEST: { icon: Users, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
    MENTOR_BOOKING: { icon: CalendarCheck, color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' },
    PAYMENT_COMPLETE: { icon: CreditCard, color: '#14b8a6', bg: 'rgba(20, 184, 166, 0.1)' },
};

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
};

const NotificationPanel = ({ isOpen, onClose, style }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const panelRef = useRef(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // 알림 목록 불러오기
    const fetchNotifications = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (!error && data) setNotifications(data);
        setLoading(false);
    };

    // 패널 열릴 때 + 유저 변경 시 fetch
    useEffect(() => {
        if (isOpen && user) fetchNotifications();
    }, [isOpen, user]);

    // Supabase Realtime 구독
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('notifications_panel_' + user.id)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setNotifications((prev) => [payload.new, ...prev].slice(0, 20));
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
                    setNotifications((prev) =>
                        prev.map((n) => (n.id === payload.new.id ? payload.new : n))
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // 패널 바깥 클릭 시 닫기
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                onClose();
            }
        };
        // 약간의 딜레이로 벨 클릭 이벤트와 충돌 방지
        const timer = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
        }, 10);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // 알림 클릭 → 읽음 처리 + 페이지 이동
    const handleClick = async (notification) => {
        if (!notification.is_read) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notification.id);

            setNotifications((prev) =>
                prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
            );
        }
        if (notification.link) {
            navigate(notification.link);
        }
        onClose();
    };

    // 모두 읽음 처리
    const handleMarkAllRead = async () => {
        const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
        if (unreadIds.length === 0) return;

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);

        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={panelRef}
                    initial={{ opacity: 0, x: -10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'fixed',
                        left: '100px',
                        top: '20px',
                        width: '360px',
                        maxHeight: '520px',
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                        zIndex: 50,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        ...style, // Allow overriding styles
                    }}
                >
                    {/* 헤더 */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '16px 20px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>
                                알림
                            </span>
                            {unreadCount > 0 && (
                                <span
                                    style={{
                                        background: '#6366f1',
                                        color: '#fff',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                    }}
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#818cf8',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <CheckCheck size={14} /> 모두 읽음
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#64748b',
                                    cursor: 'pointer',
                                    padding: '4px',
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* 알림 목록 */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
                        {loading && notifications.length === 0 && (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                                불러오는 중...
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                                <p style={{ fontSize: '0.9rem' }}>아직 알림이 없습니다.</p>
                            </div>
                        )}

                        {notifications.map((noti) => {
                            const config = NOTIFICATION_ICONS[noti.type] || NOTIFICATION_ICONS.REACTION;
                            const IconComponent = config.icon;

                            return (
                                <motion.div
                                    key={noti.id}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => handleClick(noti)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '12px',
                                        padding: '12px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        background: noti.is_read
                                            ? 'transparent'
                                            : 'rgba(99, 102, 241, 0.05)',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = noti.is_read
                                            ? 'transparent'
                                            : 'rgba(99, 102, 241, 0.05)';
                                    }}
                                >
                                    {/* 아이콘 */}
                                    <div
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '10px',
                                            background: config.bg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <IconComponent size={18} color={config.color} />
                                    </div>

                                    {/* 내용 */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: '0.85rem',
                                                color: noti.is_read ? '#94a3b8' : '#e2e8f0',
                                                lineHeight: '1.4',
                                                wordBreak: 'break-word',
                                            }}
                                        >
                                            {noti.message}
                                        </p>
                                        <span
                                            style={{
                                                fontSize: '0.75rem',
                                                color: '#64748b',
                                                marginTop: '4px',
                                                display: 'block',
                                            }}
                                        >
                                            {timeAgo(noti.created_at)}
                                        </span>
                                    </div>

                                    {/* 읽지 않은 알림 표시 */}
                                    {!noti.is_read && (
                                        <div
                                            style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: '#6366f1',
                                                flexShrink: 0,
                                                marginTop: '6px',
                                            }}
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
