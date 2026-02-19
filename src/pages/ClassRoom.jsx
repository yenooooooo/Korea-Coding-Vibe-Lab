import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AgoraCall from '../components/AgoraCall';
import { AlertCircle, Clock, Users, ChevronLeft, MessageSquare } from 'lucide-react';

const ClassRoom = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [agoraToken, setAgoraToken] = useState(null);
    const [canEnter, setCanEnter] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [inCall, setInCall] = useState(false);

    useEffect(() => {
        const sessionId = searchParams.get('sessionId');
        if (sessionId) {
            fetchSessionData(sessionId);
            fetchChatMessages(sessionId);
            subscribeToChatMessages(sessionId);
        } else {
            addToast('세션 정보가 없습니다', 'error');
            navigate(-1);
        }

        return () => {
            // Realtime 구독 정리
            if (sessionData?.id) {
                supabase
                    .channel(`chat_${sessionData.id}`)
                    .unsubscribe();
            }
        };
    }, [searchParams]);

    const fetchSessionData = async (sessionId) => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from('mentor_sessions')
                .select('*, mentors(*)')
                .eq('id', sessionId)
                .single();

            if (error) throw error;

            // 사용자 권한 확인 (학생 또는 멘토만 입장 가능)
            if (data.student_id !== user.id && data.mentors.user_id !== user.id) {
                addToast('이 수업에 접근할 권한이 없습니다', 'error');
                navigate(-1);
                return;
            }

            setSessionData(data);

            // 수업 시간 확인
            checkAccessTime(data.scheduled_at);
        } catch (error) {
            console.error('Error fetching session:', error);
            addToast('세션을 불러올 수 없습니다', 'error');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const checkAccessTime = (scheduledTime) => {
        const now = new Date();
        const classTime = new Date(scheduledTime);
        const fiveMinBefore = new Date(classTime.getTime() - 5 * 60000);
        const classEnd = new Date(classTime.getTime() + 120 * 60000); // 2시간 후

        if (now >= fiveMinBefore && now <= classEnd) {
            setCanEnter(true);
            generateAgoraToken();
        } else {
            const msRemaining = fiveMinBefore - now;
            setTimeRemaining(Math.max(0, Math.ceil(msRemaining / 1000)));

            const interval = setInterval(() => {
                const updatedMs = fiveMinBefore - new Date();
                const remaining = Math.max(0, Math.ceil(updatedMs / 1000));
                setTimeRemaining(remaining);

                if (remaining <= 0) {
                    setCanEnter(true);
                    generateAgoraToken();
                    clearInterval(interval);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    };

    const generateAgoraToken = async () => {
        try {
            const { data, error } = await supabase.functions.invoke('agora-token', {
                body: {
                    channelName: sessionData.id,
                    uid: user.id
                }
            });

            if (error) throw error;

            if (data?.token) {
                setAgoraToken(data.token);
            } else {
                throw new Error('토큰 생성 실패');
            }
        } catch (error) {
            console.error('Error generating Agora token:', error);
            addToast('통화 토큰 생성 실패', 'error');
        }
    };

    const fetchChatMessages = async (sessionId) => {
        try {
            const { data, error } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const formattedMessages = data.map(msg => ({
                id: msg.id,
                sender: msg.sender_name,
                text: msg.message,
                timestamp: new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
            }));

            setChatMessages(formattedMessages);
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        }
    };

    const subscribeToChatMessages = (sessionId) => {
        const channel = supabase
            .channel(`chat_${sessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `session_id=eq.${sessionId}`
                },
                (payload) => {
                    const newMessage = {
                        id: payload.new.id,
                        sender: payload.new.sender_name,
                        text: payload.new.message,
                        timestamp: new Date(payload.new.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    };
                    setChatMessages(prev => [...prev, newMessage]);
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || !sessionData) return;

        try {
            const { error } = await supabase
                .from('chat_messages')
                .insert({
                    session_id: sessionData.id,
                    sender_id: user.id,
                    sender_name: user.user_metadata?.username || user.email,
                    message: chatInput
                });

            if (error) throw error;

            setChatInput('');
        } catch (error) {
            console.error('Error sending message:', error);
            addToast('메시지 전송 실패', 'error');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div style={{ color: '#fff', textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', marginBottom: '20px' }}>
                    ⏳
                </div>
                <p>수업 정보 로딩 중...</p>
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div style={{ color: '#fff', textAlign: 'center', padding: '60px 20px' }}>
                <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto' }} />
                <p>세션을 찾을 수 없습니다</p>
            </div>
        );
    }

    if (inCall && agoraToken) {
        return (
            <div style={{ width: '100%', height: '100vh', display: 'flex', position: 'relative' }}>
                {/* 화상통화 영역 */}
                <div style={{ flex: 1 }}>
                    <AgoraCall
                        channelName={sessionData.id}
                        token={agoraToken}
                        uid={user.id}
                        onError={(error) => {
                            addToast(`화상통화 오류: ${error}`, 'error');
                        }}
                        onExit={() => {
                            setInCall(false);
                        }}
                    />
                </div>

                {/* 채팅 패널 */}
                {showChat && (
                    <motion.div
                        initial={{ x: 400 }}
                        animate={{ x: 0 }}
                        exit={{ x: 400 }}
                        style={{
                            width: '320px',
                            background: 'rgba(30, 41, 59, 0.95)',
                            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            flexDirection: 'column',
                            color: '#fff'
                        }}
                    >
                        {/* 채팅 헤더 */}
                        <div style={{
                            padding: '16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            fontWeight: '700'
                        }}>
                            💬 실시간 채팅
                        </div>

                        {/* 메시지 목록 */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {chatMessages.length === 0 ? (
                                <div style={{ color: '#64748b', textAlign: 'center', paddingTop: '40px', fontSize: '0.9rem' }}>
                                    메시지가 없습니다
                                </div>
                            ) : (
                                chatMessages.map((msg) => (
                                    <div key={msg.id} style={{ fontSize: '0.85rem' }}>
                                        <div style={{ color: '#a5b4fc', fontWeight: '600', marginBottom: '4px' }}>
                                            {msg.sender} <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{msg.timestamp}</span>
                                        </div>
                                        <div style={{ color: '#cbd5e1', wordWrap: 'break-word' }}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* 채팅 입력 */}
                        <div style={{
                            padding: '12px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            gap: '8px'
                        }}>
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="메시지..."
                                style={{
                                    flex: 1,
                                    padding: '8px 12px',
                                    background: 'rgba(0, 0, 0, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '0.85rem',
                                    outline: 'none'
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                style={{
                                    padding: '8px 12px',
                                    background: '#a855f7',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.8rem'
                                }}
                            >
                                전송
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* 채팅 토글 버튼 */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowChat(!showChat)}
                    style={{
                        position: 'absolute',
                        bottom: '20px',
                        right: '20px',
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: '#a855f7',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)',
                        zIndex: 10
                    }}
                    title="채팅 열기/닫기"
                >
                    <MessageSquare size={24} />
                </motion.button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', color: '#fff', paddingBottom: '60px' }}>
            {/* 뒤로가기 버튼 */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate(-1)}
                style={{
                    padding: '10px 16px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '20px',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                }}
            >
                <ChevronLeft size={18} />
                뒤로가기
            </motion.button>

            {/* 수업 정보 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    padding: '40px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.15))',
                    borderRadius: '24px',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '40px',
                    textAlign: 'center'
                }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '12px', background: 'linear-gradient(135deg, #a78bfa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    🎥 수업 대기 중
                </h1>
                <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: '0 0 24px 0' }}>
                    {sessionData.mentors.name} 멘토와의 1:1 수업
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 8px 0' }}>수업 시간</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#c084fc', margin: 0 }}>
                            {new Date(sessionData.scheduled_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 8px 0' }}>수업 길이</p>
                        <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#c084fc', margin: 0 }}>
                            {sessionData.duration_minutes}분
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* 입장 상태 */}
            {!canEnter ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        padding: '40px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '2px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '20px',
                        textAlign: 'center'
                    }}
                >
                    <Clock size={48} color="#fbbf24" style={{ marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '12px' }}>
                        수업 시간까지 대기 중입니다
                    </h2>
                    <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>
                        수업 시간 5분 전부터 입장할 수 있습니다
                    </p>
                    <div style={{
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        color: '#fbbf24',
                        fontFamily: 'monospace'
                    }}>
                        {formatTime(timeRemaining)}
                    </div>
                </motion.div>
            ) : (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setInCall(true)}
                    style={{
                        width: '100%',
                        padding: '20px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px'
                    }}
                >
                    <Users size={24} />
                    수업 입장하기
                </motion.button>
            )}

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ClassRoom;
