import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Search, Loader, X } from 'lucide-react';
import ProfileSummaryModal from '../components/ProfileSummaryModal';

const DirectMessages = () => {
    const { user } = useAuth();
    const { addToast } = useToast();

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
    const messagesEndRef = useRef(null);

    // Conversations 로드
    useEffect(() => {
        if (user) {
            fetchConversations();
            const channel = supabase
                .channel('conversations_changes')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'conversations',
                        filter: `user_id_1=eq.${user.id},user_id_2=eq.${user.id}`
                    },
                    () => fetchConversations()
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

            // 상대방 ID 추출 및 프로필 조회
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

            // 읽지 않은 메시지 모두 읽음 표시
            const unreadMessages = data.filter(m => !m.is_read && m.sender_id !== user.id);
            if (unreadMessages.length > 0) {
                await supabase
                    .from('direct_messages')
                    .update({ is_read: true, read_at: new Date() })
                    .in('id', unreadMessages.map(m => m.id));
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            addToast('메시지를 불러오지 못했습니다.', 'error');
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

            // 로컬 state에 바로 추가
            if (data && data.length > 0) {
                setMessages(prev => [...prev, data[0]]);
            }

            setMessageText('');
        } catch (error) {
            console.error('Error sending message:', error);
            addToast('메시지를 보내지 못했습니다.', 'error');
        } finally {
            setSendingMessage(false);
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

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Loader size={48} color="#818cf8" />
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 60px)', gap: '1px', background: '#0f172a' }}>
            {/* 대화 목록 */}
            <div style={{
                width: '320px',
                background: 'rgba(30, 41, 59, 0.8)',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}>
                {/* 헤더 */}
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={24} />
                        메시지
                    </h1>
                </div>

                {/* 검색 */}
                <div style={{ padding: '12px 16px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        padding: '8px 12px',
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
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.length > 0 ? (
                        conversations.map(conv => {
                            const otherUserId = getOtherUserId(conv);
                            const otherUser = otherUserProfiles[otherUserId];
                            const unreadCount = getUnreadCount(conv.id);
                            const isSelected = selectedConvId === conv.id;

                            if (!otherUser) return null;

                            return (
                                <motion.button
                                    key={conv.id}
                                    onClick={() => setSelectedConvId(conv.id)}
                                    whileHover={{ backgroundColor: 'rgba(129, 140, 248, 0.1)' }}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px',
                                        borderRadius: 0,
                                        border: 'none',
                                        background: isSelected ? 'rgba(129, 140, 248, 0.2)' : 'transparent',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        borderLeft: isSelected ? '4px solid #818cf8' : '4px solid transparent',
                                        transition: 'all 0.2s',
                                        textAlign: 'left'
                                    }}
                                >
                                    {/* 아바타 */}
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #818cf8, #a855f7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        overflow: 'hidden',
                                        border: '2px solid rgba(129, 140, 248, 0.3)'
                                    }}>
                                        {otherUser.avatar_url ? (
                                            <img src={otherUser.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            otherUser.username?.[0]?.toUpperCase() || '👤'
                                        )}
                                    </div>

                                    {/* 정보 */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {otherUser.username}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {new Date(conv.last_message_at).toLocaleDateString('ko-KR', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>

                                    {/* 읽지 않은 배지 */}
                                    {unreadCount > 0 && (
                                        <div style={{
                                            background: '#818cf8',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem',
                                            fontWeight: 'bold',
                                            flexShrink: 0
                                        }}>
                                            {unreadCount}
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })
                    ) : (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
                            <p>아직 메시지가 없어요.</p>
                            <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>친구를 추가하고 메시지를 시작하세요!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 채팅 영역 */}
            {selectedConvId && conversations.length > 0 ? (
                <ChatWindow
                    convId={selectedConvId}
                    messages={messages}
                    otherUser={otherUserProfiles[getOtherUserId(conversations.find(c => c.id === selectedConvId))]}
                    messageText={messageText}
                    setMessageText={setMessageText}
                    onSendMessage={sendMessage}
                    sendingMessage={sendingMessage}
                    currentUserId={user.id}
                    messagesEndRef={messagesEndRef}
                    onViewProfile={(userId) => setSelectedUserId(userId)}
                />
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

// 채팅 창 컴포넌트
const ChatWindow = ({
    convId,
    messages,
    otherUser,
    messageText,
    setMessageText,
    onSendMessage,
    sendingMessage,
    currentUserId,
    messagesEndRef,
    onViewProfile
}) => {
    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#0f172a'
        }}>
            {/* 헤더 */}
            <div style={{
                padding: '16px 24px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                {otherUser && (
                    <>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #818cf8, #a855f7)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            cursor: 'pointer'
                        }} onClick={() => onViewProfile(otherUser.id)}>
                            {otherUser.avatar_url ? (
                                <img src={otherUser.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                otherUser.username?.[0]?.toUpperCase() || '👤'
                            )}
                        </div>
                        <div onClick={() => onViewProfile(otherUser.id)} style={{ cursor: 'pointer', flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '1rem' }}>
                                {otherUser.username}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                                Lv.{Math.floor(Math.sqrt(otherUser.total_points || 0)) + 1}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* 메시지 영역 */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {messages.map((msg, idx) => {
                    const isOwn = msg.sender_id === currentUserId;
                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                display: 'flex',
                                justifyContent: isOwn ? 'flex-end' : 'flex-start'
                            }}
                        >
                            <div style={{
                                maxWidth: '60%',
                                background: isOwn ? '#818cf8' : 'rgba(255,255,255,0.05)',
                                color: isOwn ? '#fff' : '#e2e8f0',
                                padding: '12px 16px',
                                borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                wordWrap: 'break-word',
                                fontSize: '0.95rem'
                            }}>
                                <div>{msg.content}</div>
                                <div style={{
                                    fontSize: '0.75rem',
                                    marginTop: '6px',
                                    opacity: 0.7,
                                    textAlign: isOwn ? 'right' : 'left'
                                }}>
                                    {new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                    {isOwn && msg.is_read && ' ✓'}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* 입력 영역 */}
            <div style={{
                padding: '16px 24px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                gap: '12px'
            }}>
                <input
                    type="text"
                    placeholder="메시지를 입력하세요..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && onSendMessage()}
                    style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '12px',
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
                    onClick={onSendMessage}
                    disabled={sendingMessage || !messageText.trim()}
                    style={{
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        background: sendingMessage || !messageText.trim() ? 'rgba(129, 140, 248, 0.3)' : 'linear-gradient(135deg, #818cf8, #a855f7)',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: sendingMessage || !messageText.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    {sendingMessage ? <Loader size={18} /> : <Send size={18} />}
                </motion.button>
            </div>
        </div>
    );
};

export default DirectMessages;
