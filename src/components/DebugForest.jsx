import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart, HandHeart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ScrollToTop from './ScrollToTop';

// 랜덤 익명 닉네임 생성기
const ADJECTIVES = [
    '졸린', '배고픈', '신난', '우울한', '용감한', '수줍은', '당당한', '피곤한',
    '귀여운', '멋진', '조용한', '열정적인', '느긋한', '바쁜', '행복한', '몽롱한'
];
const ANIMALS = [
    '파이썬', '자바', '리액트', '고양이', '판다', '코알라', '여우', '토끼',
    '해달', '펭귄', '고래', '수달', '부엉이', '나비', '다람쥐', '강아지'
];

const generateAnonymousName = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    return `${adj} ${animal}`;
};

const DebugForest = () => {
    const [posts, setPosts] = useState([]);
    const [input, setInput] = useState('');
    const [myName, setMyName] = useState('');
    const [reactions, setReactions] = useState({});
    const { user } = useAuth();
    const { addToast } = useToast();
    const postsEndRef = useRef(null);
    const containerRef = useRef(null);

    // 세션별 고유 익명 닉네임 (새로고침 시 변경)
    useEffect(() => {
        setMyName(generateAnonymousName());
    }, []);

    useEffect(() => {
        fetchPosts();
        fetchReactions();

        const postChannel = supabase
            .channel('forest_posts_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'forest_posts' }, () => {
                fetchPosts();
            })
            .subscribe();

        const reactionChannel = supabase
            .channel('forest_reactions_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'forest_reactions' }, () => {
                fetchReactions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(postChannel);
            supabase.removeChannel(reactionChannel);
        };
    }, []);

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('forest_posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) console.error('Error fetching forest posts:', error);
        else setPosts(data || []);
    };

    const fetchReactions = async () => {
        const { data, error } = await supabase
            .from('forest_reactions')
            .select('*');

        if (error) console.error('Error fetching forest reactions:', error);
        else {
            const grouped = (data || []).reduce((acc, r) => {
                if (!acc[r.post_id]) acc[r.post_id] = [];
                acc[r.post_id].push(r);
                return acc;
            }, {});
            setReactions(grouped);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || !user) return;

        const { error } = await supabase
            .from('forest_posts')
            .insert([{
                user_id: user.id,
                content: input.trim(),
                anonymous_name: myName
            }]);

        if (error) {
            console.error('Error posting:', error);
            addToast('글 작성에 실패했습니다.', 'error');
        } else {
            setInput('');
            fetchPosts();
            addToast('속마음이 숲에 전해졌습니다 🎋', 'success');
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('이 글을 삭제하시겠습니까?')) return;
        const { error } = await supabase.from('forest_posts').delete().eq('id', postId);
        if (error) addToast('삭제 실패', 'error');
        else {
            fetchPosts();
            addToast('글이 삭제되었습니다.', 'info');
        }
    };

    const handleReaction = async (postId, emojiType) => {
        if (!user) {
            addToast('로그인이 필요합니다.', 'warning');
            return;
        }

        const postReactions = reactions[postId] || [];
        const alreadyReacted = postReactions.some(r => r.user_id === user.id);

        if (alreadyReacted) {
            const { error } = await supabase
                .from('forest_reactions')
                .delete()
                .match({ post_id: postId, user_id: user.id });

            if (error) console.error('Error removing reaction:', error);
        } else {
            const { error } = await supabase
                .from('forest_reactions')
                .insert([{ post_id: postId, user_id: user.id, emoji_type: emojiType }]);

            if (error && error.code !== '23505') {
                console.error('Error adding reaction:', error);
            }
        }
        fetchReactions();
    };

    const getTimeAgo = (dateStr) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return '방금 전';
        if (mins < 60) return `${mins}분 전`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}시간 전`;
        const days = Math.floor(hrs / 24);
        return `${days}일 전`;
    };

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            position: 'relative'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(16, 40, 20, 0.8), rgba(10, 25, 15, 0.9))',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(74, 222, 128, 0.15)',
                textAlign: 'center'
            }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#86efac' }}>
                    🎋 Debug Forest
                </h2>
                <p style={{ margin: 0, color: '#6b8a6b', fontSize: '0.9rem' }}>
                    여기선 모두 익명입니다. 속마음을 말해보세요.
                </p>
                {user && (
                    <p style={{
                        margin: '8px 0 0 0',
                        color: '#4ade80',
                        fontSize: '0.85rem',
                        fontStyle: 'italic'
                    }}>
                        오늘의 당신은 "{myName}" 입니다 🌿
                    </p>
                )}
            </div>

            {/* Post Input */}
            {user ? (
                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    gap: '12px',
                    background: 'rgba(16, 40, 20, 0.5)',
                    padding: '16px',
                    borderRadius: '16px',
                    border: '1px solid rgba(74, 222, 128, 0.1)'
                }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="바람에 실어 보내는 속마음..."
                        maxLength={200}
                        style={{
                            flex: 1,
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(74, 222, 128, 0.2)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            color: '#d1fae5',
                            fontSize: '0.95rem',
                            outline: 'none',
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        style={{
                            background: input.trim() ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(74, 222, 128, 0.3)',
                            borderRadius: '12px',
                            padding: '0 20px',
                            color: '#86efac',
                            cursor: input.trim() ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Send size={16} /> 날리기
                    </button>
                </form>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    color: '#6b8a6b',
                    background: 'rgba(16, 40, 20, 0.3)',
                    borderRadius: '16px',
                    border: '1px solid rgba(74, 222, 128, 0.1)'
                }}>
                    로그인 후 익명으로 글을 남겨보세요 🌿
                </div>
            )}

            {/* Posts List */}
            <div ref={containerRef} style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                paddingBottom: '20px'
            }}>
                <AnimatePresence>
                    {posts.map((post) => {
                        const postReactions = reactions[post.id] || [];
                        const reactionCount = postReactions.length;
                        const myReaction = postReactions.some(r => r.user_id === user?.id);

                        return (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    background: 'linear-gradient(135deg, rgba(16, 40, 20, 0.6), rgba(20, 30, 20, 0.4))',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    border: '1px solid rgba(74, 222, 128, 0.1)',
                                    position: 'relative'
                                }}
                            >
                                {/* Anonymous Name */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '10px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            color: '#4ade80',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                            🌿 {post.anonymous_name}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ color: '#4a6a4a', fontSize: '0.75rem' }}>
                                            {getTimeAgo(post.created_at)}
                                        </span>
                                        {user && user.id === post.user_id && (
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
                                                style={{ background: 'none', border: 'none', color: '#4a6a4a', cursor: 'pointer', padding: 0 }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <p style={{
                                    margin: '0 0 14px 0',
                                    color: '#d1fae5',
                                    fontSize: '1rem',
                                    lineHeight: 1.6,
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {post.content}
                                </p>

                                {/* Reaction Buttons */}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => handleReaction(post.id, 'heart')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            background: myReaction ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255,255,255,0.03)',
                                            border: myReaction ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                                            color: myReaction ? '#fca5a5' : '#6b8a6b',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Heart size={14} fill={myReaction ? '#fca5a5' : 'none'} />
                                        공감 {reactionCount > 0 && reactionCount}
                                    </button>
                                    <button
                                        onClick={() => handleReaction(post.id, 'hug')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '6px 14px',
                                            borderRadius: '20px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.08)',
                                            color: '#6b8a6b',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        👋 토닥토닥
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {posts.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#4a6a4a',
                        fontSize: '1rem'
                    }}>
                        🌲 아직 아무도 말하지 않았습니다.<br />
                        첫 번째로 속마음을 남겨보세요.
                    </div>
                )}
                <div ref={postsEndRef} />
            </div>
            <ScrollToTop containerRef={containerRef} />
        </div>
    );
};

export default DebugForest;
