import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sendNotification } from '../lib/notifications';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Search, Loader, X, Copy, Trash2, Heart, ChevronLeft } from 'lucide-react';
import ProfileSummaryModal from '../components/ProfileSummaryModal';

const DirectMessages = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    // States
    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sendingMessage, setSendingMessage] = useState(false);
    const [otherUserProfiles, setOtherUserProfiles] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [hoveredMessageId, setHoveredMessageId] = useState(null);
    const [messageActions, setMessageActions] = useState({});
    const messagesEndRef = useRef(null);
    const messageInputRef = useRef(null);

    // Conversations 로드
    useEffect(() => {
        if (user) {
            fetchConversations();
            const channel = supabase
                .channel('conversations_changes')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'conversations' }
                )
                .subscribe();

            return () => supabase.removeChannel(channel);
        }
    }, [user]);

    // 메시지 로드
    useEffect(() => {
        if (selectedConvId) {
            fetchMessages(selectedConvId);
            const channel = supabase
                .channel(`messages_${selectedConvId}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'direct_messages',
                        filter: `conversation_id=eq.${selectedConvId}`
                    },
                    (payload) => {
                        setMessages(prev => [...prev, payload.new]);
                        markAsRead(payload.new.id);
                    }
                )
                .subscribe();

            return () => supabase.removeChannel(channel);
        }
    }, [selectedConvId]);

    // 메시지 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const { data, error } = await supabase
                .from('conversations')
                .select('*')
                .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
                .order('last_message_at', { ascending: false });

            if (error) throw error;

            const otherUserIds = data.map(conv =>
                conv.user_id_1 === user.id ? conv.user_id_2 : conv.user_id_1
            );

            if (otherUserIds.length > 0) {
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, total_points, current_streak')
                    .in('id', otherUserIds);

                if (profilesError) throw profilesError;

                const profileMap = {};
                profiles.forEach(p => {
                    profileMap[p.id] = p;
                });
                setOtherUserProfiles(profileMap);
            }

            setConversations(data);
            if (data.length > 0 && !selectedConvId) {
                setSelectedConvId(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
            addToast('대화 목록을 불러오지 못했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (convId) => {
        try {
            const { data, error } = await supabase
                .from('direct_messages')
                .select('*')
                .eq('conversation_id', convId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);

            const unreadMessages = data.filter(m => !m.is_read && m.sender_id !== user.id);
            if (unreadMessages.length > 0) {
                await supabase
                    .from('direct_messages')
                    .update({ is_read: true, read_at: new Date() })
                    .in('id', unreadMessages.map(m => m.id));
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const markAsRead = async (messageId) => {
        try {
            const { data: msg } = await supabase
                .from('direct_messages')
                .select('sender_id')
                .eq('id', messageId)
                .single();

            if (msg && msg.sender_id !== user.id) {
                await supabase
                    .from('direct_messages')
                    .update({ is_read: true, read_at: new Date() })
                    .eq('id', messageId);
            }
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const sendMessage = async () => {
        if (!messageText.trim() || !selectedConvId) return;

        setSendingMessage(true);
        try {
            const { data, error } = await supabase
                .from('direct_messages')
                .insert({
                    conversation_id: selectedConvId,
                    sender_id: user.id,
                    content: messageText.trim()
                })
                .select();

            if (error) throw error;

            if (data && data.length > 0) {
                setMessages(prev => [...prev, data[0]]);
            }

            // 상대방에게 새 메시지 알림
            if (selectedConv) {
                const otherUserId = getOtherUserId(selectedConv);
                const myName = user?.user_metadata?.username || '유저';
                const preview = messageText.trim().length > 30 ? messageText.trim().substring(0, 30) + '...' : messageText.trim();
                sendNotification(
                    otherUserId,
                    'NEW_MESSAGE',
                    `💬 ${myName}: ${preview}`,
                    '/messages'
                );
            }

            setMessageText('');
            messageInputRef.current?.focus();
        } catch (error) {
            console.error('Error sending message:', error);
            addToast('메시지를 보내지 못했습니다.', 'error');
        } finally {
            setSendingMessage(false);
        }
    };

    const deleteMessage = async (messageId) => {
        try {
            const { error } = await supabase
                .from('direct_messages')
                .delete()
                .eq('id', messageId);

            if (error) throw error;
            setMessages(prev => prev.filter(m => m.id !== messageId));
            addToast('메시지가 삭제되었습니다.', 'success');
            setHoveredMessageId(null);
        } catch (error) {
            console.error('Error deleting message:', error);
            addToast('메시지를 삭제할 수 없습니다.', 'error');
        }
    };

    const copyMessage = async (content) => {
        try {
            await navigator.clipboard.writeText(content);
            addToast('메시지가 복사되었습니다.', 'success');
            setHoveredMessageId(null);
        } catch (error) {
            addToast('복사에 실패했습니다.', 'error');
        }
    };

    const getOtherUserId = (conv) => {
        return conv.user_id_1 === user.id ? conv.user_id_2 : conv.user_id_1;
    };

    const getUnreadCount = (convId) => {
        return messages.filter(m =>
            m.conversation_id === convId && !m.is_read && m.sender_id !== user.id
        ).length;
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (d.toDateString() === today.toDateString()) {
            return '오늘';
        } else if (d.toDateString() === yesterday.toDateString()) {
            return '어제';
        } else {
            return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
        }
    };

    const groupMessagesByDate = (msgs) => {
        const grouped = {};
        msgs.forEach(msg => {
            const dateKey = new Date(msg.created_at).toDateString();
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(msg);
        });
        return grouped;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                    <Loader size={48} color="#818cf8" />
                </motion.div>
            </div>
        );
    }

    const selectedConv = conversations.find(c => c.id === selectedConvId);
    const otherUser = selectedConv ? otherUserProfiles[getOtherUserId(selectedConv)] : null;

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 60px)', background: '#0f172a', overflow: 'hidden' }}>
            {/* 대화 목록 (대형 화면) */}
            <div style={{
                width: '360px',
                background: 'rgba(15, 23, 42, 0.8)',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* 헤더 */}
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(30, 41, 59, 0.5)'
                }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', margin: 0 }}>
                        메시지
                    </h1>
                </div>

                {/* 검색 */}
                <div style={{ padding: '12px 12px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '10px 16px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <Search size={16} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>
                </div>

                {/* 대화 목록 */}
                <div style={{ flex: 1, overflowY: 'auto', paddingTop: '8px' }}>
                    {conversations.length > 0 ? (
                        conversations.map(conv => {
                            const otherUserId = getOtherUserId(conv);
                            const profile = otherUserProfiles[otherUserId];
                            const isSelected = selectedConvId === conv.id;

                            if (!profile) return null;

                            return (
                                <motion.button
                                    key={conv.id}
                                    onClick={() => setSelectedConvId(conv.id)}
                                    whileHover={{ backgroundColor: 'rgba(129, 140, 248, 0.1)' }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 8px',
                                        marginBottom: '4px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: isSelected ? 'rgba(129, 140, 248, 0.15)' : 'transparent',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        marginLeft: '8px',
                                        marginRight: '8px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {/* 아바타 */}
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #818cf8, #a855f7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        overflow: 'hidden',
                                        border: isSelected ? '2px solid #818cf8' : '2px solid rgba(129, 140, 248, 0.3)'
                                    }}>
                                        {profile.avatar_url ? (
                                            <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            profile.username?.[0]?.toUpperCase() || '👤'
                                        )}
                                    </div>

                                    {/* 정보 */}
                                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {profile.username}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {new Date(conv.last_message_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })
                    ) : (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
                            <p>아직 메시지가 없어요.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 채팅 영역 */}
            {selectedConv && otherUser ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#0f172a'
                    }}
                >
                    {/* 상단 헤더 */}
                    <div style={{
                        padding: '12px 24px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(30, 41, 59, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        backdropFilter: 'blur(10px)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
                    }}>
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #818cf8, #a855f7)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedUserId(otherUser.id)}
                        >
                            {otherUser.avatar_url ? (
                                <img src={otherUser.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                otherUser.username?.[0]?.toUpperCase() || '👤'
                            )}
                        </div>
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setSelectedUserId(otherUser.id)}>
                            <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>
                                {otherUser.username}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                Lv.{Math.floor(Math.sqrt(otherUser.total_points || 0)) + 1} • 🔥 {otherUser.current_streak || 0}일
                            </div>
                        </div>
                    </div>

                    {/* 메시지 영역 */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <AnimatePresence>
                            {Object.entries(groupMessagesByDate(messages)).map(([dateKey, msgs]) => (
                                <div key={dateKey}>
                                    {/* 날짜 헤더 */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        margin: '16px 0 12px 0'
                                    }}>
                                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                                        <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '500' }}>
                                            {formatDate(new Date(dateKey))}
                                        </div>
                                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                                    </div>

                                    {/* 메시지들 */}
                                    {msgs.map((msg, idx) => {
                                        const isOwn = msg.sender_id === user.id;
                                        const showTime = idx === msgs.length - 1 || new Date(msgs[idx + 1]?.created_at).getMinutes() !== new Date(msg.created_at).getMinutes();

                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                onMouseEnter={() => setHoveredMessageId(msg.id)}
                                                onMouseLeave={() => setHoveredMessageId(null)}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                                                    gap: '12px',
                                                    marginBottom: showTime ? '8px' : '2px',
                                                    alignItems: 'flex-end'
                                                }}
                                            >
                                                {/* 메시지 + 액션 그룹 */}
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '8px',
                                                    alignItems: 'flex-end',
                                                    flexDirection: isOwn ? 'row-reverse' : 'row'
                                                }}>
                                                    <div>
                                                        {/* 메시지 박스 */}
                                                        <div
                                                            onDoubleClick={() => setMessageActions(prev => ({
                                                                ...prev,
                                                                [msg.id]: { liked: !prev[msg.id]?.liked }
                                                            }))}
                                                            style={{
                                                                background: isOwn ? 'linear-gradient(135deg, #818cf8, #a855f7)' : 'rgba(255,255,255,0.08)',
                                                                color: isOwn ? '#fff' : '#e2e8f0',
                                                                padding: '10px 14px',
                                                                borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                                wordWrap: 'break-word',
                                                                fontSize: '0.95rem',
                                                                transition: 'all 0.2s',
                                                                maxWidth: '60%'
                                                            }}
                                                        >
                                                            {msg.content}
                                                        </div>

                                                        {/* 시간 + 읽음 표시 */}
                                                        {showTime && (
                                                            <div style={{
                                                                fontSize: '0.75rem',
                                                                color: '#94a3b8',
                                                                marginTop: '4px',
                                                                textAlign: isOwn ? 'right' : 'left',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                justifyContent: isOwn ? 'flex-end' : 'flex-start'
                                                            }}>
                                                                {formatTime(msg.created_at)}
                                                                {isOwn && msg.is_read && <Heart size={12} fill="#34d399" color="#34d399" />}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* 호버 액션 */}
                                                    <AnimatePresence>
                                                        {hoveredMessageId === msg.id && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                style={{
                                                                    display: 'flex',
                                                                    gap: '2px',
                                                                    flexShrink: 0
                                                                }}
                                                            >
                                                                {/* 하트 버튼 */}
                                                                <motion.button
                                                                    whileHover={{ scale: 1.2 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => setMessageActions(prev => ({
                                                                        ...prev,
                                                                        [msg.id]: { liked: !prev[msg.id]?.liked }
                                                                    }))}
                                                                    style={{
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: messageActions[msg.id]?.liked ? '#ef4444' : '#94a3b8',
                                                                        cursor: 'pointer',
                                                                        padding: '4px 8px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        fontSize: '1rem',
                                                                        transition: 'color 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => !messageActions[msg.id]?.liked && (e.target.style.color = '#f87171')}
                                                                    onMouseLeave={(e) => !messageActions[msg.id]?.liked && (e.target.style.color = '#94a3b8')}
                                                                    title="좋아요"
                                                                >
                                                                    {messageActions[msg.id]?.liked ? '❤️' : '🤍'}
                                                                </motion.button>

                                                                {/* 복사 버튼 */}
                                                                <motion.button
                                                                    whileHover={{ scale: 1.2 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                    onClick={() => copyMessage(msg.content)}
                                                                    style={{
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        color: '#94a3b8',
                                                                        cursor: 'pointer',
                                                                        padding: '4px 8px',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        transition: 'color 0.2s'
                                                                    }}
                                                                    onMouseEnter={(e) => e.target.style.color = '#818cf8'}
                                                                    onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                                                                    title="복사"
                                                                >
                                                                    <Copy size={16} />
                                                                </motion.button>

                                                                {/* 삭제 버튼 (자신의 메시지만) */}
                                                                {isOwn && (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.2 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => deleteMessage(msg.id)}
                                                                        style={{
                                                                            background: 'transparent',
                                                                            border: 'none',
                                                                            color: '#94a3b8',
                                                                            cursor: 'pointer',
                                                                            padding: '4px 8px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            transition: 'color 0.2s'
                                                                        }}
                                                                        onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                                                        onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                                                                        title="삭제"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </motion.button>
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ))}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </div>

                    {/* 입력 영역 */}
                    <div style={{
                        padding: '16px 24px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(30, 41, 59, 0.5)',
                        display: 'flex',
                        gap: '12px',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <input
                            ref={messageInputRef}
                            type="text"
                            placeholder="메시지..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                borderRadius: '24px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                outline: 'none',
                                fontSize: '0.95rem'
                            }}
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={sendMessage}
                            disabled={sendingMessage || !messageText.trim()}
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                border: 'none',
                                background: sendingMessage || !messageText.trim() ? 'rgba(129, 140, 248, 0.3)' : 'linear-gradient(135deg, #818cf8, #a855f7)',
                                color: 'white',
                                cursor: sendingMessage || !messageText.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}
                        >
                            {sendingMessage ? <Loader size={20} /> : <Send size={20} />}
                        </motion.button>
                    </div>
                </motion.div>
            ) : (
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
                        <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>메시지를 선택하세요.</p>
                    </div>
                </div>
            )}

            {/* 프로필 모달 */}
            <ProfileSummaryModal
                userId={selectedUserId}
                isOpen={!!selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </div>
    );
};

export default DirectMessages;
