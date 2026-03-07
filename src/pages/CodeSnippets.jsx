import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Plus, Search, Tag, Trash2, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const CodeSnippets = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [snippets, setSnippets] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('all');
    const [copiedId, setCopiedId] = useState(null);
    const [newSnippet, setNewSnippet] = useState({
        title: '',
        code: '',
        language: 'javascript',
        tags: '',
        description: ''
    });

    const fetchSnippets = async () => {
        let query = supabase
            .from('code_snippets')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (selectedTag !== 'all') {
            query = query.contains('tags', [selectedTag]);
        }

        const { data } = await query;
        setSnippets(data || []);
    };

    useEffect(() => {
        if (user) fetchSnippets();
    }, [user, selectedTag]);

    const saveSnippet = async () => {
        const { error } = await supabase.from('code_snippets').insert({
            user_id: user.id,
            ...newSnippet,
            tags: newSnippet.tags.split(',').map(t => t.trim()).filter(Boolean)
        });

        if (!error) {
            addToast('스니펫이 저장되었습니다', 'success');
            setShowAddModal(false);
            setNewSnippet({ title: '', code: '', language: 'javascript', tags: '', description: '' });
            fetchSnippets();
        }
    };

    const copyCode = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        addToast('코드가 복사되었습니다', 'success');
    };

    const allTags = [...new Set(snippets.flatMap(s => s.tags || []))];
    const filteredSnippets = snippets.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '100px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Code size={32} color="#facc15" />
                    코드 스니펫 저장소
                </h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Plus size={20} />
                    새 스니펫
                </motion.button>
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                        type="text"
                        placeholder="스니펫 검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 44px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '0.9rem'
                        }}
                    />
                </div>
                <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    style={{
                        padding: '12px 16px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    <option value="all">전체 태그</option>
                    {allTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            {/* Snippets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(350px, 100%), 1fr))', gap: '20px' }}>
                {filteredSnippets.map(snippet => (
                    <motion.div
                        key={snippet.id}
                        whileHover={{ y: -4 }}
                        style={{
                            background: 'rgba(30, 41, 59, 0.6)',
                            borderRadius: '16px',
                            padding: '20px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e2e8f0' }}>{snippet.title}</h3>
                            <button
                                onClick={() => copyCode(snippet.code, snippet.id)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedId === snippet.id ? '#22c55e' : '#94a3b8' }}
                            >
                                {copiedId === snippet.id ? <Check size={20} /> : <Copy size={20} />}
                            </button>
                        </div>

                        {snippet.tags && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                {snippet.tags.map(tag => (
                                    <span key={tag} style={{
                                        padding: '4px 8px',
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        color: '#818cf8'
                                    }}>
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        <pre style={{
                            background: '#0f172a',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            overflowX: 'auto',
                            color: '#e2e8f0',
                            maxHeight: '200px'
                        }}>
                            <code>{snippet.code}</code>
                        </pre>
                    </motion.div>
                ))}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
                    onClick={() => setShowAddModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: '#1e293b',
                            padding: '30px',
                            borderRadius: '16px',
                            width: '600px',
                            maxWidth: '90vw'
                        }}
                    >
                        <h2 style={{ marginBottom: '20px' }}>새 스니펫 추가</h2>
                        <input
                            placeholder="제목"
                            value={newSnippet.title}
                            onChange={(e) => setNewSnippet({ ...newSnippet, title: e.target.value })}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                        />
                        <textarea
                            placeholder="코드"
                            value={newSnippet.code}
                            onChange={(e) => setNewSnippet({ ...newSnippet, code: e.target.value })}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', minHeight: '200px', fontFamily: 'monospace' }}
                        />
                        <input
                            placeholder="태그 (쉼표로 구분)"
                            value={newSnippet.tags}
                            onChange={(e) => setNewSnippet({ ...newSnippet, tags: e.target.value })}
                            style={{ width: '100%', padding: '10px', marginBottom: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                        />
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowAddModal(false)} style={{ padding: '10px 20px', background: '#334155', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>취소</button>
                            <button onClick={saveSnippet} style={{ padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}>저장</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CodeSnippets;
