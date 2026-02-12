import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Heart, ThumbsUp, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Community = () => {
    const [messages, setMessages] = useState([]);
    const [reactions, setReactions] = useState({}); // { postId: [reactionObj, ...] }
    const [input, setInput] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        fetchMessages();
        fetchReactions();

        // Realtime subscription for posts
        const postChannel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, (payload) => {
                setMessages((prev) => [...prev, payload.new]);
                setTimeout(scrollToBottom, 100);
            })
            .subscribe();

        // Realtime subscription for reactions
        const reactionChannel = supabase
            .channel('public:post_reactions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reactions' }, () => {
                fetchReactions(); // Simply refetch all reactions on any change (simple approach)
            })
            .subscribe();

        return () => {
            supabase.removeChannel(postChannel);
            supabase.removeChannel(reactionChannel);
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles (username, message_count, avatar_url)
            `)
            .order('created_at', { ascending: true });

        if (error) console.error('Error fetching messages:', error);
        else setMessages(data || []);
    };

    const fetchReactions = async () => {
        const { data, error } = await supabase
            .from('post_reactions')
            .select('*');

        if (error) console.error('Error fetching reactions:', error);
        else {
            // Group by postId
            const grouped = (data || []).reduce((acc, r) => {
                if (!acc[r.post_id]) acc[r.post_id] = [];
                acc[r.post_id].push(r);
                return acc;
            }, {});
            setReactions(grouped);
        }
    };

    const handleReaction = async (postId, emojiType) => {
        if (!user) {
            alert("로그인이 필요합니다.");
            return;
        }

        // 1. Get current state
        const currentReactions = reactions[postId] || [];
        const alreadyReacted = currentReactions.some(r => r.user_id === user.id && r.emoji_type === emojiType);

        // 2. Optimistic Update: Update UI immediately
        setReactions(prev => {
            const postReactions = prev[postId] || [];
            if (alreadyReacted) {
                // Remove locally
                return {
                    ...prev,
                    [postId]: postReactions.filter(r => !(r.user_id === user.id && r.emoji_type === emojiType))
                };
            } else {
                // Add locally (mocking timestamp and id)
                return {
                    ...prev,
                    [postId]: [...postReactions, {
                        post_id: postId,
                        user_id: user.id,
                        emoji_type: emojiType,
                        created_at: new Date().toISOString()
                    }]
                };
            }
        });

        // 3. Send Request to Supabase
        if (alreadyReacted) {
            // Remove reaction
            const { error } = await supabase
                .from('post_reactions')
                .delete()
                .match({ post_id: postId, user_id: user.id, emoji_type: emojiType });

            if (error) {
                console.error("Error removing reaction:", error);
                fetchReactions(); // Rollback/Refresh on error
            }
        } else {
            // Add reaction
            const { error } = await supabase
                .from('post_reactions')
                .insert([{ post_id: postId, user_id: user.id, emoji_type: emojiType }]);

            if (error) {
                // 409 Conflict check: If it already exists, just ignore (it's what we wanted)
                if (error.code === '23505') {
                    // Already exists, do nothing (state is already consistent with "liked")
                } else {
                    console.error("Error adding reaction:", error);
                    fetchReactions(); // Rollback on error
                }
            }
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (!user) {
            if (confirm("로그인이 필요한 서비스입니다. 로그인 하시겠습니까?")) {
                navigate('/login');
            }
            return;
        }

        const newMessage = {
            content: input,
            user_id: user.id,
            user_email: user.email?.split('@')[0] || 'Anonymous'
        };

        const { error } = await supabase
            .from('posts')
            .insert([newMessage]);

        if (error) {
            console.error('Error sending message:', error);
            alert('메시지 전송 실패: ' + error.message);
        } else {
            setInput('');
            // Immediate refresh for the sender
            fetchMessages();
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ marginBottom: '20px' }}>Vibe Lounge 💬</h1>

            <div style={{
                flex: 1,
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {messages.map((msg) => (
                        <div key={msg.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                borderRadius: '50%',
                                background: '#334155',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                overflow: 'hidden'
                            }}>
                                {msg.profiles?.avatar_url ? (
                                    <img src={msg.profiles.avatar_url} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={20} color="#94a3b8" />
                                )}
                            </div>
                            <div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '4px' }}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: getVibeColor(msg.profiles?.message_count || 0),
                                        textShadow: (msg.profiles?.message_count || 0) >= 50 ? '0 0 10px rgba(234, 179, 8, 0.5)' : 'none'
                                    }}>
                                        {msg.profiles?.username || msg.user_email || 'Unknown'}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {(msg.profiles?.message_count || 0) >= 10 && (
                                        <span style={{
                                            fontSize: '0.7rem',
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: (msg.profiles?.message_count || 0) >= 50 ? '#eab308' : '#3b82f6',
                                            color: 'black',
                                            fontWeight: 'bold'
                                        }}>
                                            LV.{(msg.profiles?.message_count || 0)}
                                        </span>
                                    )}
                                </div>
                                {renderMessage(msg.content)}
                            </div>
                            <ReactionBar
                                postId={msg.id}
                                reactions={reactions[msg.id] || []}
                                onReact={handleReaction}
                                currentUserId={user?.id}
                            />
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSend} style={{
                    padding: '20px',
                    background: 'rgba(30, 41, 59, 0.5)',
                    display: 'flex',
                    gap: '12px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={user ? "메시지를 입력하세요... (코드는 ```로 감싸주세요)" : "로그인 후 메시지를 남겨보세요 ✨"}
                        disabled={!user}
                        style={{
                            flex: 1,
                            background: user ? 'rgba(15, 23, 42, 0.8)' : 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            padding: '12px 20px',
                            color: '#fff',
                            fontSize: '1rem',
                            fontFamily: '"Pretendard", sans-serif',
                            outline: 'none',
                            cursor: user ? 'text' : 'not-allowed'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!user}
                        style={{
                            background: user ? '#6366f1' : '#475569',
                            border: 'none',
                            borderRadius: '12px',
                            width: '50px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: user ? 'pointer' : 'not-allowed',
                            color: '#fff',
                            transition: 'background 0.2s'
                        }}>
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

// Helper function to get color based on activity level
const getVibeColor = (count) => {
    if (count >= 50) return '#facc15'; // Gold (Master)
    if (count >= 10) return '#60a5fa'; // Blue (Cool)
    return '#e2e8f0'; // White (Newbie)
};

// Helper function to render text with code blocks
const renderMessage = (content) => {
    if (!content) return '';

    // Split by triple backticks
    const parts = content.split(/```([\s\S]*?)```/);

    return parts.map((part, index) => {
        // Odd indices are code blocks (because split captures the separator group)
        if (index % 2 === 1) {
            return (
                <div key={index} style={{
                    margin: '8px 0',
                    background: '#1e293b',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #334155',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    color: '#a5b4fc',
                    whiteSpace: 'pre-wrap',
                    overflowX: 'auto'
                }}>
                    {part.trim()}
                </div>
            );
        }
        // Even indices are normal text
        return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
    });
};

const ReactionBar = ({ postId, reactions, onReact, currentUserId }) => {
    const counts = reactions.reduce((acc, r) => {
        acc[r.emoji_type] = (acc[r.emoji_type] || 0) + 1;
        return acc;
    }, {});

    const myReactions = reactions
        .filter(r => r.user_id === currentUserId)
        .map(r => r.emoji_type);

    const types = [
        { type: 'like', icon: <ThumbsUp size={14} /> },
        { type: 'heart', icon: <Heart size={14} /> },
        { type: 'fire', icon: <Flame size={14} /> }
    ];

    return (
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {types.map(({ type, icon }) => {
                const isActive = myReactions.includes(type);
                const count = counts[type] || 0;

                return (
                    <button
                        key={type}
                        onClick={() => onReact(postId, type)}
                        style={{
                            background: isActive ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                            border: isActive ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '12px',
                            padding: '4px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: isActive ? '#818cf8' : '#64748b',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {React.cloneElement(icon, { fill: isActive ? "currentColor" : "none" })}
                        {count > 0 && <span>{count}</span>}
                    </button>
                );
            })}
        </div>
    );
};

export default Community;
