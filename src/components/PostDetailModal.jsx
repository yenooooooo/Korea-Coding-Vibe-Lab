import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { X, Send, Heart, MessageCircle, MoreHorizontal, User, CornerDownRight, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVibeLevel } from '../utils/vibeLevel';
import { isAdmin, ADMIN_NAME_STYLE, ADMIN_BADGE_STYLE, ADMIN_AVATAR_GLOW, ADMIN_TITLE_STYLE, ADMIN_TITLE_DEFAULT } from '../utils/admin';
import { VibeName, fetchEquippedDetails, fetchBatchEquippedDetails, getBannerStyle } from '../utils/vibeItems.jsx';

const PostDetailModal = ({ post, onClose, refresh, onEdit, onDelete }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null); // { id, username }
    const [isLiked, setIsLiked] = useState(false);
    const [showPostMenu, setShowPostMenu] = useState(false);
    const [authorEquipped, setAuthorEquipped] = useState({});
    const [commentEquipped, setCommentEquipped] = useState({});
    const { user } = useAuth();

    useEffect(() => {
        fetchComments();
        checkLikeStatus();
        incrementView();
        fetchAuthorEquipped();

        const channel = supabase
            .channel(`post_detail:${post.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'board_comments', filter: `post_id=eq.${post.id}` }, () => {
                fetchComments();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [post.id]);

    const incrementView = async () => {
        await supabase.rpc('increment_post_view', { post_id: post.id });
        // Assuming simple increment via update if RPC not exists (fallback)
        await supabase.from('board_posts').update({ views: (post.views || 0) + 1 }).eq('id', post.id);
    };

    const currentUserIsAdmin = user && isAdmin(user.email);

    const fetchAuthorEquipped = async () => {
        if (post.profiles?.equipped_items) {
            const details = await fetchEquippedDetails(supabase, post.profiles.equipped_items);
            setAuthorEquipped(details);
        }
    };

    const fetchComments = async () => {
        const { data, error } = await supabase
            .from('board_comments')
            .select(`
                *,
                profiles!board_comments_user_id_fkey (username, avatar_url, total_points, main_skill, is_admin, admin_title)
            `)
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });

        if (error) console.error('Error fetching comments:', error);
        else {
            setComments(data || []);
            // Resolve equipped details for all comment authors
            const profiles = (data || []).map(p => p.profiles).filter(Boolean);
            const details = await fetchBatchEquippedDetails(supabase, profiles);
            setCommentEquipped(details);
        }
    };

    const checkLikeStatus = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('board_likes')
            .select('*')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();
        setIsLiked(!!data);
    };

    const handleLike = async () => {
        if (!user) { alert('로그인이 필요합니다.'); return; }

        if (isLiked) {
            await supabase.from('board_likes').delete().match({ post_id: post.id, user_id: user.id });
            setIsLiked(false);
        } else {
            await supabase.from('board_likes').insert([{ post_id: post.id, user_id: user.id }]);
            setIsLiked(true);
        }
        refresh(); // Update post card likes count
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) { alert('로그인이 필요합니다.'); return; }

        const commentData = {
            post_id: post.id,
            user_id: user.id,
            content: newComment,
            parent_id: replyTo?.id || null
        };

        const { error } = await supabase.from('board_comments').insert([commentData]);

        if (error) {
            console.error('Error adding comment:', error);
            alert('댓글 작성 실패');
        } else {
            setNewComment('');
            setReplyTo(null);
            fetchComments(); // 즉시 댓글 목록 갱신
            refresh(); // Update post card comments count
        }
    };

    const handleUpdateComment = async (commentId, newContent) => {
        const { error } = await supabase.from('board_comments').update({ content: newContent }).eq('id', commentId);
        if (error) {
            console.error('Error updating comment:', error);
            alert('댓글 수정 실패');
        } else {
            fetchComments();
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
        const { error } = await supabase.from('board_comments').delete().eq('id', commentId);
        if (error) {
            console.error('Error deleting comment:', error);
            alert('댓글 삭제 실패');
        } else {
            fetchComments();
            refresh();
        }
    };

    // Organize comments into hierarchy
    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId) => comments.filter(c => c.parent_id === parentId);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                onClick={(e) => { e.stopPropagation(); setShowPostMenu(false); }}
                style={{
                    width: '90%', maxWidth: '1000px', height: '90vh',
                    background: '#0f172a', borderRadius: '24px',
                    display: 'flex', overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
            >
                {/* Left: Content */}
                <div style={{ flex: 1, padding: '30px', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '24px', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <span style={{
                                fontSize: '0.8rem', color: '#a5b4fc', background: 'rgba(99,102,241,0.1)',
                                padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold'
                            }}>
                                {post.category.toUpperCase()}
                            </span>

                            {/* Edit/Delete Menu for Post Author */}
                            {(user?.id === post.user_id || currentUserIsAdmin) && (
                                <div style={{ position: 'relative' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowPostMenu(!showPostMenu); }}
                                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>
                                    {showPostMenu && (
                                        <div style={{
                                            position: 'absolute', top: '100%', right: 0, width: '100px',
                                            background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px', overflow: 'hidden', zIndex: 100,
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)'
                                        }}>
                                            <button
                                                onClick={() => { onEdit(); setShowPostMenu(false); }}
                                                style={{ width: '100%', padding: '10px', textAlign: 'left', background: 'none', border: 'none', color: '#e2e8f0', cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => { onDelete(); setShowPostMenu(false); }}
                                                style={{ width: '100%', padding: '10px', textAlign: 'left', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <h1 style={{ fontSize: '2rem', margin: '16px 0', color: '#f8fafc', lineHeight: 1.3 }}>{post.title}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                                <div
                                    className={isAdmin(post.profiles) ? 'admin-avatar-animated' : ''}
                                    style={{
                                        width: '40px', height: '40px', borderRadius: '50%', background: '#334155', overflow: 'hidden',
                                        ...(isAdmin(post.profiles) ? { border: '2px solid #a855f7' } : {}),
                                    }}
                                >
                                    {authorEquipped?.avatar ? (
                                        <img src={authorEquipped.avatar.icon_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : post.profiles?.avatar_url
                                        ? <img src={post.profiles.avatar_url} style={{ width: '100%', height: '100%' }} />
                                        : <User size={24} color="#94a3b8" style={{ margin: '8px' }} />}
                                </div>
                                {isAdmin(post.profiles) && (
                                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', fontSize: '0.75rem' }}>👑</span>
                                )}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <VibeName
                                        name={post.profiles?.username || 'Unknown'}
                                        effectItem={authorEquipped?.name_effect}
                                        style={{ fontWeight: 'bold', ...(isAdmin(post.profiles) ? ADMIN_NAME_STYLE : {}) }}
                                    />
                                    {isAdmin(post.profiles) && <span style={ADMIN_BADGE_STYLE}>운영자</span>}
                                    {isAdmin(post.profiles) && <span style={ADMIN_TITLE_STYLE}>{post.profiles?.admin_title || ADMIN_TITLE_DEFAULT}</span>}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    {new Date(post.created_at).toLocaleString()} · 조회 {post.views || 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    {post.image_url && (
                        <div style={{ marginBottom: '24px', borderRadius: '16px', overflow: 'hidden' }}>
                            <img src={post.image_url} alt="Post" style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', background: '#000' }} />
                        </div>
                    )}

                    {/* Body */}
                    <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#e2e8f0', whiteSpace: 'pre-wrap', minHeight: '150px' }}>
                        {post.content}
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: '40px', display: 'flex', gap: '12px' }}>
                        <button
                            onClick={handleLike}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 20px', borderRadius: '12px',
                                background: isLiked ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                                border: 'none', color: isLiked ? '#ef4444' : '#94a3b8',
                                cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            <Heart size={20} fill={isLiked ? "currentColor" : "none"} /> 좋아요 {post.likes + (isLiked ? 0 : 0)}
                        </button>
                    </div>
                </div>

                {/* Right: Comments */}
                <div style={{ width: '400px', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            댓글 <span style={{ color: '#94a3b8', fontSize: '1rem' }}>{comments.length}</span>
                        </h3>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                        {rootComments.length === 0 ? (
                            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '40px' }}>첫 댓글을 남겨주세요! 👇</div>
                        ) : (
                            rootComments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    replies={getReplies(comment.id)}
                                    onReply={(user) => setReplyTo({ id: comment.id, username: user })}
                                    currentUser={user}
                                    onUpdate={handleUpdateComment}
                                    onDelete={handleDeleteComment}
                                    isCurrentAdmin={currentUserIsAdmin}
                                    equippedMap={commentEquipped}
                                />
                            ))
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleCommentSubmit} style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#1e293b' }}>
                        {replyTo && (
                            <div style={{ fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>Replying to <b>@{replyTo.username}</b></span>
                                <button type="button" onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={14} /></button>
                            </div>
                        )}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="댓글을 입력하세요..."
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '12px',
                                    background: '#0f172a', border: '1px solid #334155',
                                    color: 'white', outline: 'none'
                                }}
                            />
                            <button type="submit" style={{
                                width: '46px', borderRadius: '12px', background: '#6366f1',
                                border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                            }}>
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

const CommentItem = ({ comment, replies, onReply, currentUser, onUpdate, onDelete, isCurrentAdmin, equippedMap }) => {
    const equippedItem = equippedMap[comment.profiles?.id];
    const levelInfo = getVibeLevel(comment.profiles?.total_points || 0);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const commentIsAdmin = isAdmin(comment.profiles);

    const handleUpdate = () => {
        if (!editContent.trim()) return;
        onUpdate(comment.id, editContent);
        setIsEditing(false);
    };

    return (
        <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                        className={commentIsAdmin ? 'admin-avatar-animated' : ''}
                        style={{
                            width: '32px', height: '32px', borderRadius: '50%', background: '#334155', overflow: 'hidden',
                            ...(commentIsAdmin ? { border: '2px solid #a855f7' } : {}),
                        }}
                    >
                        {equippedItem?.avatar ? (
                            <img src={equippedItem.avatar.icon_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : comment.profiles?.avatar_url
                            ? <img src={comment.profiles.avatar_url} style={{ width: '100%', height: '100%' }} />
                            : <User size={18} color="#94a3b8" style={{ margin: '7px' }} />}
                    </div>
                    {commentIsAdmin && (
                        <span style={{ position: 'absolute', top: '-5px', right: '-5px', fontSize: '0.6rem' }}>👑</span>
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <VibeName
                                name={comment.profiles?.username || 'Unknown'}
                                effectItem={equippedItem?.name_effect}
                                style={{ fontWeight: 'bold', fontSize: '0.9rem', ...(commentIsAdmin ? ADMIN_NAME_STYLE : {}) }}
                            />
                            {commentIsAdmin && <span style={{ ...ADMIN_BADGE_STYLE, fontSize: '0.6rem' }}>운영자</span>}
                            {commentIsAdmin && <span style={{ ...ADMIN_TITLE_STYLE, fontSize: '0.55rem' }}>{comment.profiles?.admin_title || ADMIN_TITLE_DEFAULT}</span>}
                            <span style={{ fontSize: '0.7rem', color: levelInfo.color, fontWeight: 'bold' }}>Lv.{levelInfo.level}</span>
                            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {(currentUser?.id === comment.user_id || isCurrentAdmin) && !isEditing && (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {currentUser?.id === comment.user_id && (
                                    <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.7rem', cursor: 'pointer' }}>수정</button>
                                )}
                                <button onClick={() => onDelete(comment.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer' }}>삭제</button>
                            </div>
                        )}
                    </div>

                    {isEditing ? (
                        <div style={{ marginBottom: '6px' }}>
                            <input
                                type="text"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px', borderRadius: '8px',
                                    background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', marginBottom: '4px'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                <button onClick={() => setIsEditing(false)} style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>취소</button>
                                <button onClick={handleUpdate} style={{ fontSize: '0.75rem', background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' }}>저장</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '6px' }}>{comment.content}</div>
                    )}

                    <button
                        onClick={() => onReply(comment.profiles?.username)}
                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
                    >
                        답글 달기
                    </button>
                </div>
            </div>

            {/* Replies */}
            {replies.length > 0 && (
                <div style={{ marginLeft: '42px', marginTop: '12px', paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.05)' }}>
                    {replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            replies={[]}
                            onReply={onReply}
                            currentUser={currentUser}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            isCurrentAdmin={isCurrentAdmin}
                            equippedMap={equippedMap}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PostDetailModal;
