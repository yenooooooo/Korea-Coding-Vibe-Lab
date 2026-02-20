import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Trash2, Filter, User, Gift, Trophy, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const NotificationCenter = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchNotifications();
        }
    }, [isOpen, user, filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (filter !== 'all') {
                query = query.eq('type', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
            fetchNotifications();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id)
                .eq('is_read', false);

            if (error) throw error;
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', notificationId);

            if (error) throw error;
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'friend': return <User size={18} color="#60a5fa" />;
            case 'reward': return <Gift size={18} color="#facc15" />;
            case 'achievement': return <Trophy size={18} color="#f97316" />;
            case 'message': return <MessageSquare size={18} color="#a855f7" />;
            default: return <Bell size={18} color="#94a3b8" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    paddingTop: '80px'
                }}
            >
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                        borderRadius: '16px',
                        width: '500px',
                        maxWidth: '90vw',
                        maxHeight: '600px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Bell size={24} color="#facc15" />
                            <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#fff' }}>
                                알림 센터
                            </h2>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: '#ef4444',
                                    color: '#fff',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                padding: '5px'
                            }}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Filter & Actions */}
                    <div style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {['all', 'friend', 'reward', 'achievement', 'message', 'system'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    style={{
                                        padding: '6px 12px',
                                        background: filter === f ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                        border: filter === f ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: filter === f ? '#fff' : '#94a3b8',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {f === 'all' ? '전체' : f === 'friend' ? '친구' : f === 'reward' ? '보상' : f === 'achievement' ? '업적' : f === 'message' ? '메시지' : '시스템'}
                                </button>
                            ))}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    padding: '6px 12px',
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    border: '1px solid #22c55e',
                                    borderRadius: '8px',
                                    color: '#22c55e',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Check size={16} />
                                모두 읽음
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '10px'
                    }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                로딩 중...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                <Bell size={48} style={{ opacity: 0.3, margin: '0 auto 10px' }} />
                                <p>알림이 없습니다</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        background: notification.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(99, 102, 241, 0.1)',
                                        border: notification.is_read ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(99, 102, 241, 0.3)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        marginBottom: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                >
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flexShrink: 0, marginTop: '4px' }}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{
                                                margin: '0 0 6px 0',
                                                fontSize: '0.95rem',
                                                color: '#e2e8f0',
                                                fontWeight: notification.is_read ? 'normal' : 'bold'
                                            }}>
                                                {notification.title}
                                            </h4>
                                            <p style={{
                                                margin: 0,
                                                fontSize: '0.85rem',
                                                color: '#94a3b8',
                                                lineHeight: '1.4'
                                            }}>
                                                {notification.message}
                                            </p>
                                            <div style={{
                                                marginTop: '8px',
                                                fontSize: '0.75rem',
                                                color: '#64748b'
                                            }}>
                                                {new Date(notification.created_at).toLocaleString('ko-KR')}
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification.id);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: '#64748b',
                                                padding: '4px'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationCenter;
