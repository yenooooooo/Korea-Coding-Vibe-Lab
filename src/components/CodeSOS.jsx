import React, { useState, useEffect } from 'react';
import { Plus, X, Check, AlertCircle, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ScrollToTop from './ScrollToTop';
import { isAdmin, ADMIN_NAME_STYLE, ADMIN_BADGE_STYLE, ADMIN_TITLE_STYLE, ADMIN_TITLE_DEFAULT } from '../utils/admin';

const CodeSOS = () => {
    const [posts, setPosts] = useState([]);
    const [solutions, setSolutions] = useState({});
    const [selectedPost, setSelectedPost] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        code_snippet: '',
        language: 'javascript'
    });
    const [newSolution, setNewSolution] = useState('');
    const { user } = useAuth();
    const containerRef = React.useRef(null);
    const [editingPostId, setEditingPostId] = useState(null);
    const currentUserIsAdmin = user && isAdmin(user.email);

    useEffect(() => {
        fetchPosts();
        fetchSolutions();

        const postChannel = supabase
            .channel('sos_posts_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_posts' }, () => {
                fetchPosts();
            })
            .subscribe();

        const solutionChannel = supabase
            .channel('sos_solutions_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'sos_solutions' }, () => {
                fetchSolutions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(postChannel);
            supabase.removeChannel(solutionChannel);
        };
    }, []);

    const fetchPosts = async () => {
        const { data, error } = await supabase
            .from('sos_posts')
            .select(`
                *,
                profiles!sos_posts_user_id_fkey (username, avatar_url, is_admin, admin_title)
            `)
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching posts:', error);
        else setPosts(data || []);
    };

    const fetchSolutions = async () => {
        const { data, error } = await supabase
            .from('sos_solutions')
            .select(`
                *,
                profiles!sos_solutions_user_id_fkey (username, avatar_url, is_admin, admin_title)
            `);

        if (error) console.error('Error fetching solutions:', error);
        else {
            const grouped = (data || []).reduce((acc, s) => {
                if (!acc[s.post_id]) acc[s.post_id] = [];
                acc[s.post_id].push(s);
                return acc;
            }, {});
            setSolutions(grouped);
        }
    };

    const handleCreatePost = async () => {
        if (!user || !newPost.title.trim() || !newPost.content.trim()) return;

        if (editingPostId) {
            const { error } = await supabase
                .from('sos_posts')
                .update({ ...newPost })
                .eq('id', editingPostId);

            if (error) {
                console.error('Error updating post:', error);
                alert('질문 수정 실패');
            } else {
                setShowCreateModal(false);
                setEditingPostId(null);
                setNewPost({ title: '', content: '', code_snippet: '', language: 'javascript' });
                fetchPosts();
            }
        } else {
            const { error } = await supabase
                .from('sos_posts')
                .insert([{ ...newPost, user_id: user.id }]);

            if (error) {
                console.error('Error creating post:', error);
                alert('질문 작성 실패');
            } else {
                setShowCreateModal(false);
                setNewPost({ title: '', content: '', code_snippet: '', language: 'javascript' });
                fetchPosts();
            }
        }
    };

    const handleEditPostClick = (post) => {
        setEditingPostId(post.id);
        setNewPost({
            title: post.title,
            content: post.content,
            code_snippet: post.code_snippet || '',
            language: post.language || 'javascript'
        });
        setSelectedPost(null);
        setShowCreateModal(true);
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('정말 이 질문을 삭제하시겠습니까?')) return;
        const { error } = await supabase.from('sos_posts').delete().eq('id', postId);
        if (error) alert('삭제 실패');
        else {
            setSelectedPost(null);
            fetchPosts();
        }
    };

    const handleUpdateSolution = async (id, content) => {
        const { error } = await supabase.from('sos_solutions').update({ content }).eq('id', id);
        if (error) alert('수정 실패');
        else fetchSolutions();
    };

    const handleDeleteSolution = async (id) => {
        if (!window.confirm('삭제하시겠습니까?')) return;
        const { error } = await supabase.from('sos_solutions').delete().eq('id', id);
        if (error) alert('삭제 실패');
        else fetchSolutions();
    };

    const handleSubmitSolution = async () => {
        if (!user || !selectedPost || !newSolution.trim()) return;

        const { error } = await supabase
            .from('sos_solutions')
            .insert([{
                post_id: selectedPost.id,
                user_id: user.id,
                content: newSolution.trim()
            }]);

        if (error) {
            console.error('Error submitting solution:', error);
            alert('해결책 제출 실패');
        } else {
            setNewSolution('');
            fetchSolutions();
        }
    };

    const handleMarkSolved = async (postId) => {
        const { error } = await supabase
            .from('sos_posts')
            .update({ is_solved: true })
            .eq('id', postId);

        if (error) console.error('Error marking solved:', error);
        else fetchPosts();
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
        <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(202, 138, 4, 0.1))',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#fbbf24' }}>
                            🆘 Code SOS
                        </h2>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                            막힌 코드, 같이 해결해요!
                        </p>
                    </div>
                    {user && (
                        <button
                            onClick={() => {
                                setNewPost({ title: '', content: '', code_snippet: '', language: 'javascript' });
                                setEditingPostId(null);
                                setShowCreateModal(true);
                            }}
                            style={{
                                background: 'rgba(234, 179, 8, 0.2)',
                                border: '1px solid rgba(234, 179, 8, 0.4)',
                                borderRadius: '12px',
                                padding: '10px 20px',
                                color: '#fbbf24',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                            }}
                        >
                            <Plus size={18} /> SOS 요청
                        </button>
                    )}
                </div>

                {/* Posts List */}
                <div ref={containerRef} style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {posts.map((post) => {
                        const postSolutions = solutions[post.id] || [];
                        return (
                            <div
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                style={{
                                    background: post.is_solved
                                        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05))'
                                        : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.6))',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    border: post.is_solved ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{
                                            margin: '0 0 8px 0',
                                            fontSize: '1.1rem',
                                            color: post.is_solved ? '#86efac' : '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}>
                                            {post.is_solved && <Check size={20} color="#22c55e" />}
                                            {!post.is_solved && <AlertCircle size={20} color="#fbbf24" />}
                                            {post.title}
                                        </h3>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '0.85rem',
                                            color: '#64748b',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span style={isAdmin(post.profiles) ? ADMIN_NAME_STYLE : {}}>{post.profiles?.username || 'Unknown'}</span>
                                            {isAdmin(post.profiles) && <span style={{ ...ADMIN_BADGE_STYLE, fontSize: '0.6rem' }}>운영자</span>}
                                            <span>•</span>
                                            <span>{getTimeAgo(post.created_at)}</span>
                                            {post.language && (
                                                <>
                                                    <span>•</span>
                                                    <span style={{
                                                        background: 'rgba(99, 102, 241, 0.2)',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        color: '#a5b4fc'
                                                    }}>{post.language}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        color: '#94a3b8',
                                        fontSize: '0.85rem'
                                    }}>
                                        💬 {postSolutions.length}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {posts.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: '#64748b'
                        }}>
                            아직 SOS 요청이 없습니다.<br />
                            첫 번째로 도움을 요청해보세요! 🆘
                        </div>
                    )}
                </div>

                <ScrollToTop containerRef={containerRef} />
            </div>

            {/* Create Post Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }} onClick={() => setShowCreateModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#1e293b',
                                borderRadius: '24px',
                                padding: '30px',
                                width: '600px',
                                maxHeight: '80vh',
                                overflowY: 'auto',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{editingPostId ? '🆘 SOS 요청 수정' : '🆘 SOS 요청하기'}</h2>
                                <button onClick={() => setShowCreateModal(false)} style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer'
                                }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input
                                    type="text"
                                    placeholder="제목 (예: useEffect 무한 루프 에러)"
                                    value={newPost.title}
                                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                    style={{
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        color: '#e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                />

                                <textarea
                                    placeholder="무엇이 문제인가요?"
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    rows={4}
                                    style={{
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        color: '#e2e8f0',
                                        fontSize: '1rem',
                                        resize: 'vertical'
                                    }}
                                />

                                <select
                                    value={newPost.language}
                                    onChange={(e) => setNewPost({ ...newPost, language: e.target.value })}
                                    style={{
                                        background: 'rgba(0, 0, 0, 0.3)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        color: '#e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                >
                                    <option value="javascript">JavaScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="cpp">C++</option>
                                    <option value="html">HTML</option>
                                    <option value="css">CSS</option>
                                </select>

                                <textarea
                                    placeholder="코드 스니펫 (선택사항)"
                                    value={newPost.code_snippet}
                                    onChange={(e) => setNewPost({ ...newPost, code_snippet: e.target.value })}
                                    rows={6}
                                    style={{
                                        background: 'rgba(0, 0, 0, 0.5)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        padding: '12px 16px',
                                        color: '#a5b4fc',
                                        fontSize: '0.9rem',
                                        fontFamily: 'monospace',
                                        resize: 'vertical'
                                    }}
                                />

                                <button
                                    onClick={handleCreatePost}
                                    disabled={!newPost.title.trim() || !newPost.content.trim()}
                                    style={{
                                        background: newPost.title.trim() && newPost.content.trim()
                                            ? 'rgba(234, 179, 8, 0.2)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid rgba(234, 179, 8, 0.4)',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        color: '#fbbf24',
                                        cursor: newPost.title.trim() && newPost.content.trim() ? 'pointer' : 'not-allowed',
                                        fontSize: '1rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {editingPostId ? '수정 완료' : 'SOS 요청하기'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Post Detail Modal */}
            <AnimatePresence>
                {selectedPost && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }} onClick={() => setSelectedPost(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#1e293b',
                                borderRadius: '24px',
                                padding: '30px',
                                width: '700px',
                                maxHeight: '85vh',
                                overflowY: 'auto',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{ flex: 1 }}>
                                    <h2 style={{
                                        margin: '0 0 10px 0',
                                        fontSize: '1.4rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}>
                                        {selectedPost.is_solved ? <Check size={24} color="#22c55e" /> : <AlertCircle size={24} color="#fbbf24" />}
                                        {selectedPost.title}
                                    </h2>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={isAdmin(selectedPost.profiles) ? { ...ADMIN_NAME_STYLE, fontSize: '0.85rem' } : {}}>{selectedPost.profiles?.username}</span>
                                        {isAdmin(selectedPost.profiles) && <span style={{ ...ADMIN_BADGE_STYLE, fontSize: '0.55rem' }}>운영자</span>}
                                        {isAdmin(selectedPost.profiles) && <span style={{ ...ADMIN_TITLE_STYLE, fontSize: '0.5rem' }}>{selectedPost.profiles?.admin_title || ADMIN_TITLE_DEFAULT}</span>}
                                        <span>•</span> {getTimeAgo(selectedPost.created_at)}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    {user && (user.id === selectedPost.user_id || currentUserIsAdmin) && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setNewPost({
                                                        title: selectedPost.title,
                                                        content: selectedPost.content,
                                                        code_snippet: selectedPost.code_snippet,
                                                        language: selectedPost.language
                                                    });
                                                    handleEditPostClick(selectedPost);
                                                }}
                                                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(selectedPost.id)}
                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}
                                            >
                                                삭제
                                            </button>
                                            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
                                        </>
                                    )}
                                    <button onClick={() => setSelectedPost(null)} style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#94a3b8',
                                        cursor: 'pointer'
                                    }}>
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div style={{ marginBottom: '20px' }}>
                                <p style={{ color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                    {selectedPost.content}
                                </p>
                            </div>

                            {/* Code Snippet */}
                            {selectedPost.code_snippet && (
                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        marginBottom: '8px',
                                        fontSize: '0.85rem',
                                        color: '#94a3b8'
                                    }}>
                                        <Code size={16} />
                                        <span>{selectedPost.language}</span>
                                    </div>
                                    <SyntaxHighlighter
                                        language={selectedPost.language}
                                        style={vscDarkPlus}
                                        customStyle={{
                                            borderRadius: '12px',
                                            padding: '16px',
                                            fontSize: '0.9rem'
                                        }}
                                    >
                                        {selectedPost.code_snippet}
                                    </SyntaxHighlighter>
                                </div>
                            )}

                            {/* Mark Solved Button */}
                            {/* ... */}
                            {user && user.id === selectedPost.user_id && !selectedPost.is_solved && (
                                <button
                                    onClick={() => handleMarkSolved(selectedPost.id)}
                                    style={{
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        border: '1px solid rgba(34, 197, 94, 0.4)',
                                        borderRadius: '12px',
                                        padding: '10px 20px',
                                        color: '#86efac',
                                        cursor: 'pointer',
                                        marginBottom: '20px',
                                        width: '100%',
                                        fontSize: '0.95rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    ✅ 해결됨으로 표시
                                </button>
                            )}

                            {/* Solutions */}
                            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#94a3b8' }}>
                                    💬 해결책 ({(solutions[selectedPost.id] || []).length})
                                </h3>

                                {(solutions[selectedPost.id] || []).map((sol) => (
                                    <ViewSolutionItem
                                        key={sol.id}
                                        solution={sol}
                                        user={user}
                                        onUpdate={handleUpdateSolution}
                                        onDelete={handleDeleteSolution}
                                        getTimeAgo={getTimeAgo}
                                        isCurrentAdmin={currentUserIsAdmin}
                                    />
                                ))}

                                {user && (
                                    <div style={{ marginTop: '16px' }}>
                                        <textarea
                                            placeholder="해결책을 제안해주세요..."
                                            value={newSolution}
                                            onChange={(e) => setNewSolution(e.target.value)}
                                            rows={3}
                                            style={{
                                                width: '100%',
                                                background: 'rgba(0, 0, 0, 0.3)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                padding: '12px 16px',
                                                color: '#e2e8f0',
                                                fontSize: '0.9rem',
                                                resize: 'vertical',
                                                marginBottom: '10px'
                                            }}
                                        />
                                        <button
                                            onClick={handleSubmitSolution}
                                            disabled={!newSolution.trim()}
                                            style={{
                                                background: newSolution.trim() ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(99, 102, 241, 0.4)',
                                                borderRadius: '12px',
                                                padding: '10px 20px',
                                                color: '#a5b4fc',
                                                cursor: newSolution.trim() ? 'pointer' : 'not-allowed',
                                                fontSize: '0.9rem',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            해결책 제출
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

const ViewSolutionItem = ({ solution, user, onUpdate, onDelete, getTimeAgo, isCurrentAdmin }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(solution.content);
    const solIsAdmin = isAdmin(solution.profiles);

    const handleSave = () => {
        if (!editContent.trim()) return;
        onUpdate(solution.id, editContent);
        setIsEditing(false);
    };

    return (
        <div style={{
            background: solIsAdmin ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(0, 0, 0, 0.3))' : 'rgba(0, 0, 0, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            ...(solIsAdmin ? { borderLeft: '3px solid #a855f7' } : {}),
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={solIsAdmin ? { ...ADMIN_NAME_STYLE, fontSize: '0.8rem' } : {}}>{solution.profiles?.username}</span>
                    {solIsAdmin && <span style={{ ...ADMIN_BADGE_STYLE, fontSize: '0.55rem' }}>운영자</span>}
                    {solIsAdmin && <span style={{ ...ADMIN_TITLE_STYLE, fontSize: '0.5rem' }}>{solution.profiles?.admin_title || ADMIN_TITLE_DEFAULT}</span>}
                    <span>•</span> {getTimeAgo(solution.created_at)}
                </p>
                {user && (user.id === solution.user_id || isCurrentAdmin) && !isEditing && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {user.id === solution.user_id && (
                            <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}>수정</button>
                        )}
                        <button onClick={() => onDelete(solution.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}>삭제</button>
                    </div>
                )}
            </div>

            {isEditing ? (
                <div>
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.5)', border: '1px solid #334155', color: '#e2e8f0', padding: '8px', borderRadius: '8px', marginBottom: '8px' }}
                    />
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>취소</button>
                        <button onClick={handleSave} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer' }}>저장</button>
                    </div>
                </div>
            ) : (
                <p style={{ margin: 0, color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {solution.content}
                </p>
            )}
        </div>
    );
};

export default CodeSOS;
