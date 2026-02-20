import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Edit3, MessageCircle, Heart, Eye, Filter, Search, MoreHorizontal, Image as ImageIcon, X, Send, CornerDownRight, Pin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVibeLevel } from '../utils/vibeLevel';
import SkillBadge from './SkillBadge';
import PostDetailModal from './PostDetailModal';
import ScrollToTop from './ScrollToTop';
import LoginPrompt from './LoginPrompt';
import { isAdmin, ADMIN_NAME_STYLE, ADMIN_BADGE_STYLE, ADMIN_AVATAR_GLOW } from '../utils/admin';
import { VibeName, fetchBatchEquippedDetails } from '../utils/vibeItems.jsx';

const VibeSquare = ({ defaultCategory = 'all' }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(defaultCategory); // all, free, qna, tip, project, beginner
    const [searchTerm, setSearchTerm] = useState('');
    const [showWriteModal, setShowWriteModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const { user } = useAuth();
    const containerRef = useRef(null);
    const [equippedDetails, setEquippedDetails] = useState({});

    // Filters
    const categories = [
        { id: 'all', label: '전체', emoji: '🏘️' },
        { id: 'free', label: '자유', emoji: '🗣️' },
        { id: 'qna', label: '질문', emoji: '❓' },
        { id: 'tip', label: '꿀팁', emoji: '🍯' },
        { id: 'project', label: '프로젝트', emoji: '🚀' },
        { id: 'beginner', label: '초보 Q&A', emoji: '🌱' }
    ];

    useEffect(() => {
        fetchPosts();

        // Realtime subscription
        const channel = supabase
            .channel('public:board_posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'board_posts' }, () => {
                fetchPosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [category]);

    // 현재 유저 관리자 여부
    const currentUserIsAdmin = user && isAdmin(user.email);

    const fetchPosts = async () => {
        setLoading(true);
        let query = supabase
            .from('board_posts')
            .select(`
                *,
                profiles!board_posts_user_id_fkey (id, username, total_points, avatar_url, main_skill, is_admin, equipped_items),
                board_comments (count)
            `)
            .order('is_pinned', { ascending: false, nullsFirst: false })
            .order('created_at', { ascending: false });

        if (category !== 'all') {
            query = query.eq('category', category);
        }

        const { data, error } = await query;
        if (error) console.error('Error fetching posts:', error);
        else {
            setPosts(data || []);
            // Resolve equipped details for all post authors
            const profiles = (data || []).map(p => p.profiles).filter(Boolean);
            const details = await fetchBatchEquippedDetails(supabase, profiles);
            setEquippedDetails(details);
        }
        setLoading(false);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const [editingPost, setEditingPost] = useState(null);

    const handleEditPost = (post) => {
        setEditingPost(post);
        setShowWriteModal(true);
        setSelectedPost(null);
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

        const { error } = await supabase.from('board_posts').delete().eq('id', postId);
        if (error) {
            console.error('Error deleting post:', error);
            alert('게시글 삭제 실패');
        } else {
            alert('게시글이 삭제되었습니다.');
            setSelectedPost(null);
            fetchPosts();
        }
    };

    const handleTogglePin = async (postId, currentPinned) => {
        const { error } = await supabase
            .from('board_posts')
            .update({ is_pinned: !currentPinned })
            .eq('id', postId);
        if (!error) fetchPosts();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
            {/* Header ... */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
            }}>
                {/* ... categories ... */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            style={{
                                background: category === cat.id ? 'rgba(99, 102, 241, 0.2)' : 'rgba(30, 41, 59, 0.5)',
                                border: category === cat.id ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                padding: '6px 12px',
                                color: category === cat.id ? '#a5b4fc' : '#94a3b8',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '16px', flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '220px' }}>
                        <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="검색..."
                            value={searchTerm}
                            onChange={handleSearch}
                            style={{
                                width: '100%',
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '10px 12px 10px 40px',
                                color: '#e2e8f0',
                                fontSize: '0.9rem',
                                outline: 'none',
                                transition: 'all 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.5)'}
                            onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                        />
                    </div>

                    <button
                        onClick={() => {
                            if (!user) {
                                setShowLoginPrompt(true);
                                return;
                            }
                            setEditingPost(null);
                            setShowWriteModal(true);
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '10px 18px',
                            color: 'white',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                            whiteSpace: 'nowrap',
                            zIndex: 10
                        }}
                    >
                        <Edit3 size={18} /> <span>글쓰기</span>
                    </button>
                </div>
            </div>

            {/* Post List */}
            <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', position: 'relative' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {loading ? (
                        <div style={{ color: '#94a3b8', textAlign: 'center', gridColumn: '1/-1', padding: '40px' }}>로딩 중...</div>
                    ) : filteredPosts.length === 0 ? (
                        <div style={{ color: '#64748b', textAlign: 'center', gridColumn: '1/-1', padding: '40px' }}>
                            작성된 글이 없습니다. 첫 번째 글을 남겨보세요! ✨
                        </div>
                    ) : (
                        filteredPosts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onClick={() => setSelectedPost(post)}
                                isCurrentAdmin={currentUserIsAdmin}
                                onTogglePin={handleTogglePin}
                                equippedItem={equippedDetails[post.profiles?.id]}
                            />
                        ))
                    )}
                </div>
                <ScrollToTop containerRef={containerRef} />
            </div>

            {/* Write Modal */}
            <AnimatePresence>
                {showWriteModal && (
                    <WriteModal
                        onClose={() => {
                            setShowWriteModal(false);
                            setEditingPost(null);
                        }}
                        user={user}
                        refresh={fetchPosts}
                        postToEdit={editingPost}
                    />
                )}
            </AnimatePresence>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <PostDetailModal
                        post={selectedPost}
                        onClose={() => setSelectedPost(null)}
                        refresh={fetchPosts}
                        onEdit={() => handleEditPost(selectedPost)}
                        onDelete={() => handleDeletePost(selectedPost.id)}
                    />
                )}
            </AnimatePresence>

            {/* 로그인 프롬프트 */}
            {showLoginPrompt && (
                <LoginPrompt
                    isModal
                    message="글을 쓰려면 로그인이 필요합니다"
                    onClose={() => setShowLoginPrompt(false)}
                />
            )}
        </div>
    );
};

const PostCard = ({ post, onClick, isCurrentAdmin, onTogglePin, equippedItem }) => {
    const levelInfo = getVibeLevel(post.profiles?.total_points || 0);

    return (
        <motion.div
            layoutId={`post-${post.id}`}
            onClick={onClick}
            whileHover={{ translateY: -4 }}
            style={{
                background: post.is_pinned
                    ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(30, 41, 59, 0.6))'
                    : 'rgba(30, 41, 59, 0.6)',
                borderRadius: '16px',
                border: post.is_pinned ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Category Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {post.is_pinned && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: '#fbbf24' }}>
                            <Pin size={10} /> 고정
                        </span>
                    )}
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        background: getCategoryColor(post.category),
                        color: '#fff',
                        fontWeight: 'bold'
                    }}>
                        {getCategoryLabel(post.category)}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {isCurrentAdmin && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onTogglePin(post.id, post.is_pinned); }}
                            title={post.is_pinned ? '핀 해제' : '핀 고정'}
                            style={{ background: 'none', border: 'none', color: post.is_pinned ? '#fbbf24' : '#475569', cursor: 'pointer', padding: 0 }}
                        >
                            <Pin size={14} />
                        </button>
                    )}
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(post.created_at).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Content Preview */}
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#f1f5f9', lineHeight: 1.4 }}>
                    {post.title}
                </h3>
                <p style={{
                    margin: 0,
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {post.content}
                </p>
                {post.image_url && (
                    <div style={{ marginTop: '12px', height: '150px', borderRadius: '8px', overflow: 'hidden' }}>
                        <img src={post.image_url} alt="Post" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                        className={isAdmin(post.profiles) ? 'admin-avatar-animated' : ''}
                        style={{
                            width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden',
                            background: '#1e293b',
                            border: isAdmin(post.profiles) ? '2px solid #a855f7' : `1px solid ${levelInfo.color}`,
                            position: 'relative',
                            boxShadow: equippedItem?.avatar ? '0 0 10px rgba(168, 85, 247, 0.4)' : 'none'
                        }}>
                        {equippedItem?.avatar ? (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={equippedItem.avatar.icon_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                        ) : post.profiles?.avatar_url
                            ? <img src={post.profiles.avatar_url} style={{ width: '100%', height: '100%' }} />
                            : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '0.7rem' }}>👤</div>
                        }
                    </div>
                    <VibeName
                        name={post.profiles?.username || 'Unknown'}
                        effectItem={equippedItem?.name_effect}
                        style={{ fontSize: '0.85rem', ...(isAdmin(post.profiles) ? ADMIN_NAME_STYLE : {}) }}
                    />
                    {isAdmin(post.profiles) && <span style={{ ...ADMIN_BADGE_STYLE, fontSize: '0.6rem' }}>운영자</span>}
                </div>

                <div style={{ display: 'flex', gap: '12px', color: '#64748b', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Heart size={14} /> {post.likes || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageCircle size={14} /> {post.board_comments && post.board_comments[0]?.count || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Eye size={14} /> {post.views || 0}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

const WriteModal = ({ onClose, user, refresh, postToEdit }) => {
    const [title, setTitle] = useState(postToEdit?.title || '');
    const [content, setContent] = useState(postToEdit?.content || '');
    const [category, setCategory] = useState(postToEdit?.category || 'free');
    const [imageUrl, setImageUrl] = useState(postToEdit?.image_url || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            alert('제목과 내용을 입력해주세요.');
            return;
        }

        setIsSubmitting(true);
        try {
            const postData = {
                title,
                content,
                category,
                image_url: imageUrl || null
            };

            if (postToEdit) {
                const { error } = await supabase
                    .from('board_posts')
                    .update(postData)
                    .eq('id', postToEdit.id);
                if (error) throw error;
                alert('게시글이 수정되었습니다.');
            } else {
                const { error } = await supabase
                    .from('board_posts')
                    .insert([{ ...postData, user_id: user.id }]);
                if (error) throw error;
            }

            refresh();
            onClose();
        } catch (error) {
            console.error('Error saving post:', error);
            alert('오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    background: '#1e293b', borderRadius: '24px', width: '100%', maxWidth: '600px',
                    padding: '24px', position: 'relative', border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {postToEdit ? '✏️ 글 수정' : '📝 글쓰기'}
                        {!postToEdit && <span style={{ fontSize: '0.9rem', color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '2px 8px', borderRadius: '8px' }}>+50 XP</span>}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            style={{
                                padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155',
                                color: '#e2e8f0', fontSize: '1rem', outline: 'none', width: '120px'
                            }}
                        >
                            <option value="free">🗣️ 자유</option>
                            <option value="qna">❓ 질문</option>
                            <option value="tip">🍯 꿀팁</option>
                            <option value="project">🚀 프로젝트</option>
                            <option value="beginner">🌱 초보질문</option>
                        </select>

                        <input
                            type="text"
                            placeholder="제목을 입력하세요"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '12px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155',
                                color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 'bold', outline: 'none'
                            }}
                        />
                    </div>

                    <textarea
                        placeholder="내용을 자유롭게 작성해보세요..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{
                            padding: '16px', borderRadius: '12px', background: '#0f172a', border: '1px solid #334155',
                            color: '#e2e8f0', fontSize: '1rem', minHeight: '200px', resize: 'none', outline: 'none',
                            fontFamily: 'inherit', lineHeight: 1.6
                        }}
                    />

                    {/* Image Input Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <ImageIcon size={18} color="#64748b" style={{ position: 'absolute', left: '12px', zIndex: 1 }} />
                                <input
                                    type="text"
                                    placeholder="이미지 URL 입력"
                                    value={imageUrl}
                                    onChange={(e) => setImageUrl(e.target.value)}
                                    style={{
                                        width: '100%', padding: '14px 14px 14px 40px', borderRadius: '12px',
                                        background: '#0f172a', border: '1px solid #334155', color: '#94a3b8', fontSize: '0.95rem',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        height: '100%'
                                    }}
                                />
                            </div>
                            <label style={{
                                padding: '0 20px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.3)', color: '#a5b4fc', cursor: 'pointer',
                                fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px',
                                whiteSpace: 'nowrap', flexShrink: 0, fontWeight: '500',
                                transition: 'all 0.2s'
                            }}>
                                <ImageIcon size={18} /> 이미지 불러오기
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setImageUrl(reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        {/* Image Preview */}
                        {imageUrl && (
                            <div style={{
                                width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden',
                                background: '#0f172a', border: '1px solid #334155', position: 'relative'
                            }}>
                                <img src={imageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                <button
                                    type="button"
                                    onClick={() => setImageUrl('')}
                                    style={{
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                                        width: '28px', height: '28px', color: 'white', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '12px 20px', borderRadius: '12px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', cursor: 'pointer' }}>
                            취소
                        </button>
                        <button type="submit" disabled={isSubmitting} style={{
                            padding: '12px 24px', borderRadius: '12px', background: '#6366f1', color: 'white',
                            border: 'none', fontWeight: 'bold', cursor: isSubmitting ? 'wait' : 'pointer',
                            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                        }}>
                            {isSubmitting ? '저장 중...' : (postToEdit ? '수정 완료' : '작성 완료')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const getCategoryLabel = (cat) => {
    switch (cat) {
        case 'free': return '자유';
        case 'qna': return '질문';
        case 'tip': return '꿀팁';
        case 'project': return '프로젝트';
        case 'beginner': return '초보 Q&A';
        default: return '기타';
    }
};

const getCategoryColor = (cat) => {
    switch (cat) {
        case 'free': return 'rgba(168, 85, 247, 0.5)';
        case 'qna': return 'rgba(239, 68, 68, 0.5)';
        case 'tip': return 'rgba(234, 179, 8, 0.5)';
        case 'project': return 'rgba(59, 130, 246, 0.5)';
        case 'beginner': return 'rgba(16, 185, 129, 0.5)';
        default: return 'rgba(148, 163, 184, 0.5)';
    }
};


export default VibeSquare;
