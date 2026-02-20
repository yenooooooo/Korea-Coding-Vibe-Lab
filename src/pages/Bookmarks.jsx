import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Trash2, ExternalLink, Filter, FolderOpen, FileText, Code, Link as LinkIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Bookmarks = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [bookmarks, setBookmarks] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchBookmarks();
        }
    }, [user, filter]);

    const fetchBookmarks = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('content_type', filter);
            }

            const { data, error } = await query;
            if (error) throw error;
            setBookmarks(data || []);
        } catch (error) {
            console.error('Error fetching bookmarks:', error);
            addToast('북마크를 불러오는 중 오류가 발생했습니다', 'error');
        } finally {
            setLoading(false);
        }
    };

    const deleteBookmark = async (id) => {
        try {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('id', id);

            if (error) throw error;
            addToast('북마크가 삭제되었습니다', 'success');
            fetchBookmarks();
        } catch (error) {
            console.error('Error deleting bookmark:', error);
            addToast('삭제 중 오류가 발생했습니다', 'error');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'post': return <FileText size={20} color="#60a5fa" />;
            case 'snippet': return <Code size={20} color="#a855f7" />;
            case 'project': return <FolderOpen size={20} color="#f97316" />;
            case 'resource': return <LinkIcon size={20} color="#22c55e" />;
            default: return <Bookmark size={20} color="#94a3b8" />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'post': return '게시글';
            case 'snippet': return '코드 스니펫';
            case 'project': return '프로젝트';
            case 'resource': return '리소스';
            default: return '기타';
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px', color: '#fff' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '40px' }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <Bookmark size={40} color="#facc15" />
                    <span style={{ background: 'linear-gradient(to right, #facc15, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        나의 북마크
                    </span>
                </h1>
                <p style={{ color: '#94a3b8' }}>저장한 콘텐츠를 한눈에 확인하세요</p>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '30px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}
            >
                {['all', 'post', 'snippet', 'project', 'resource'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        style={{
                            padding: '10px 20px',
                            background: filter === f ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)',
                            border: filter === f ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: filter === f ? '#fff' : '#94a3b8',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            fontWeight: filter === f ? 'bold' : 'normal',
                            transition: 'all 0.2s',
                            boxShadow: filter === f ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
                        }}
                    >
                        {f === 'all' ? '전체' : getTypeLabel(f)}
                    </button>
                ))}
            </motion.div>

            {/* Bookmarks Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                    로딩 중...
                </div>
            ) : bookmarks.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        background: 'rgba(255,255,255,0.03)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <Bookmark size={64} color="#64748b" style={{ opacity: 0.3, margin: '0 auto 20px' }} />
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
                        {filter === 'all' ? '저장된 북마크가 없습니다' : `${getTypeLabel(filter)} 북마크가 없습니다`}
                    </p>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {bookmarks.map((bookmark, index) => (
                        <motion.div
                            key={bookmark.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            style={{
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
                                borderRadius: '16px',
                                padding: '24px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                position: 'relative',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {/* Icon */}
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {getIcon(bookmark.content_type)}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            background: 'rgba(99, 102, 241, 0.2)',
                                            border: '1px solid rgba(99, 102, 241, 0.3)',
                                            borderRadius: '6px',
                                            fontSize: '0.75rem',
                                            color: '#818cf8',
                                            fontWeight: 'bold'
                                        }}>
                                            {getTypeLabel(bookmark.content_type)}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                            {new Date(bookmark.created_at).toLocaleDateString('ko-KR')}
                                        </span>
                                    </div>

                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        color: '#e2e8f0',
                                        marginBottom: '8px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {bookmark.content_data?.title || '제목 없음'}
                                    </h3>

                                    {bookmark.content_data?.description && (
                                        <p style={{
                                            fontSize: '0.9rem',
                                            color: '#94a3b8',
                                            lineHeight: '1.5',
                                            marginBottom: '12px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical'
                                        }}>
                                            {bookmark.content_data.description}
                                        </p>
                                    )}

                                    {bookmark.content_data?.url && (
                                        <a
                                            href={bookmark.content_data.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '6px 12px',
                                                background: 'rgba(34, 197, 94, 0.1)',
                                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                                borderRadius: '8px',
                                                color: '#22c55e',
                                                fontSize: '0.85rem',
                                                textDecoration: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)';
                                            }}
                                        >
                                            <ExternalLink size={14} />
                                            바로가기
                                        </a>
                                    )}
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => {
                                        if (window.confirm('이 북마크를 삭제하시겠습니까?')) {
                                            deleteBookmark(bookmark.id);
                                        }
                                    }}
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        cursor: 'pointer',
                                        color: '#ef4444',
                                        height: 'fit-content',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Bookmarks;
