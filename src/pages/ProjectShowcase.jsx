import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, ExternalLink, Heart, MessageSquare, X, Send, Code2, Globe, Github, Filter, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import LoginPrompt from '../components/LoginPrompt';

const ProjectShowcase = () => {
    const { user, profile } = useAuth();
    const { addToast } = useToast();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [sortBy, setSortBy] = useState('latest');
    const [form, setForm] = useState({ title: '', description: '', url: '', github_url: '', tech_stack: '', screenshot_url: '' });
    const [submitting, setSubmitting] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => { fetchProjects(); }, [sortBy]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            let query = supabase.from('project_showcases').select('*, profiles(nickname, username, avatar_url)');
            if (sortBy === 'popular') query = query.order('likes', { ascending: false });
            else query = query.order('created_at', { ascending: false });
            const { data, error } = await query.limit(50);
            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
            // 테이블이 없으면 빈 배열
            setProjects([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.description.trim()) {
            addToast('제목과 설명은 필수입니다.', 'error'); return;
        }
        setSubmitting(true);
        try {
            const { error } = await supabase.from('project_showcases').insert({
                user_id: user.id,
                title: form.title,
                description: form.description,
                url: form.url,
                github_url: form.github_url,
                tech_stack: form.tech_stack.split(',').map(t => t.trim()).filter(Boolean),
                screenshot_url: form.screenshot_url,
                likes: 0,
            });
            if (error) throw error;
            addToast('프로젝트가 등록되었습니다! 🎉', 'success');
            setForm({ title: '', description: '', url: '', github_url: '', tech_stack: '', screenshot_url: '' });
            setShowForm(false);
            fetchProjects();
        } catch (error) {
            addToast(`등록 실패: ${error.message}`, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (projectId) => {
        if (!user) { setShowLoginPrompt(true); return; }
        try {
            const project = projects.find(p => p.id === projectId);
            await supabase.from('project_showcases').update({ likes: (project?.likes || 0) + 1 }).eq('id', projectId);
            setProjects(prev => prev.map(p => p.id === projectId ? { ...p, likes: (p.likes || 0) + 1 } : p));
        } catch (error) {
            console.error(error);
        }
    };

    const techColors = {
        'react': '#61dafb', 'next.js': '#fff', 'vue': '#42b883', 'angular': '#dd1b16',
        'node.js': '#68a063', 'python': '#3776ab', 'supabase': '#3ecf8e', 'tailwind': '#38bdf8',
        'typescript': '#3178c6', 'javascript': '#f7df1e', 'html': '#e34f26', 'css': '#1572b6',
    };

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', paddingBottom: '100px' }}>
            {/* 헤더 */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{
                            fontSize: '2rem', fontWeight: '900',
                            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            marginBottom: '8px',
                        }}>
                            🏆 프로젝트 쇼케이스
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>멤버들이 만든 멋진 프로젝트를 구경하고 영감을 받으세요!</p>
                    </div>
                    {user ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setShowForm(true)}
                            style={{
                                padding: '12px 24px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                                border: 'none', color: '#fff', fontWeight: '700', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}
                        >
                            <Plus size={20} /> 프로젝트 등록
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setShowLoginPrompt(true)}
                            style={{
                                padding: '12px 24px', borderRadius: '14px',
                                background: 'rgba(245, 158, 11, 0.15)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                color: '#f59e0b', fontWeight: '700', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                            }}
                        >
                            <Plus size={20} /> 프로젝트 등록
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* 필터 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                    { id: 'latest', label: '최신순', icon: <Clock size={16} /> },
                    { id: 'popular', label: '인기순', icon: <TrendingUp size={16} /> },
                ].map(f => (
                    <motion.button
                        key={f.id} whileTap={{ scale: 0.95 }}
                        onClick={() => setSortBy(f.id)}
                        style={{
                            padding: '10px 18px', borderRadius: '12px',
                            background: sortBy === f.id ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
                            border: sortBy === f.id ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                            color: sortBy === f.id ? '#f59e0b' : '#94a3b8',
                            fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem',
                        }}
                    >
                        {f.icon} {f.label}
                    </motion.button>
                ))}
            </div>

            {/* 프로젝트 카드 그리드 */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
                    로딩 중...
                </div>
            ) : projects.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}
                >
                    <Trophy size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                    <p style={{ fontSize: '1.1rem', marginBottom: '8px' }}>아직 등록된 프로젝트가 없습니다</p>
                    <p style={{ fontSize: '0.9rem' }}>첫 번째 프로젝트를 등록해보세요! 🚀</p>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                    {projects.map((project, idx) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '20px', overflow: 'hidden', transition: 'all 0.3s',
                            }}
                        >
                            {/* 스크린샷 */}
                            {project.screenshot_url && (
                                <div style={{ height: '180px', background: `url(${project.screenshot_url}) center/cover`, borderBottom: '1px solid rgba(255,255,255,0.05)' }} />
                            )}
                            <div style={{ padding: '20px' }}>
                                {/* 작성자 */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: project.profiles?.avatar_url ? `url(${project.profiles.avatar_url}) center/cover` : 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        flexShrink: 0,
                                    }} />
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>
                                        {project.profiles?.nickname || project.profiles?.username || '익명'}
                                    </span>
                                    <span style={{ color: '#475569', fontSize: '0.75rem', marginLeft: 'auto' }}>
                                        {new Date(project.created_at).toLocaleDateString('ko-KR')}
                                    </span>
                                </div>
                                <h3 style={{ color: '#fff', fontWeight: '800', fontSize: '1.15rem', marginBottom: '8px' }}>{project.title}</h3>
                                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {project.description}
                                </p>
                                {/* 기술 태그 */}
                                {project.tech_stack?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                                        {project.tech_stack.map((tech, i) => (
                                            <span key={i} style={{
                                                padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600',
                                                background: `${techColors[tech.toLowerCase()] || '#6366f1'}15`,
                                                color: techColors[tech.toLowerCase()] || '#a78bfa',
                                                border: `1px solid ${techColors[tech.toLowerCase()] || '#6366f1'}30`,
                                            }}>
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {/* 액션 */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleLike(project.id)}
                                        style={{
                                            padding: '8px 14px', borderRadius: '10px',
                                            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.15)',
                                            color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                            fontWeight: '600', fontSize: '0.85rem',
                                        }}
                                    >
                                        <Heart size={16} /> {project.likes || 0}
                                    </motion.button>
                                    <div style={{ flex: 1 }} />
                                    {project.github_url && (
                                        <a href={project.github_url} target="_blank" rel="noreferrer" style={{
                                            padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', display: 'flex',
                                        }}>
                                            <Github size={18} />
                                        </a>
                                    )}
                                    {project.url && (
                                        <a href={project.url} target="_blank" rel="noreferrer" style={{
                                            padding: '8px 14px', borderRadius: '10px',
                                            background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
                                            color: '#6366f1', display: 'flex', alignItems: 'center', gap: '6px',
                                            textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem',
                                        }}>
                                            <Globe size={16} /> 방문
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* 등록 모달 */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setShowForm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '520px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto',
                                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '24px', padding: '32px',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>🏆 프로젝트 등록</h2>
                                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            {[
                                { key: 'title', label: '프로젝트 이름 *', placeholder: '예: 나의 포트폴리오 사이트' },
                                { key: 'description', label: '설명 *', placeholder: '어떤 프로젝트인지 설명해주세요', multiline: true },
                                { key: 'url', label: '라이브 URL', placeholder: 'https://my-project.vercel.app' },
                                { key: 'github_url', label: 'GitHub URL', placeholder: 'https://github.com/username/repo' },
                                { key: 'tech_stack', label: '사용 기술 (쉼표 구분)', placeholder: 'React, Supabase, Tailwind' },
                                { key: 'screenshot_url', label: '스크린샷 URL', placeholder: '이미지 URL을 입력하세요' },
                            ].map(field => (
                                <div key={field.key} style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>{field.label}</label>
                                    {field.multiline ? (
                                        <textarea
                                            value={form[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                            placeholder={field.placeholder} rows={3}
                                            style={{
                                                width: '100%', padding: '12px 14px', borderRadius: '12px', resize: 'vertical',
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                                            }}
                                        />
                                    ) : (
                                        <input
                                            value={form[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                                            placeholder={field.placeholder}
                                            style={{
                                                width: '100%', padding: '12px 14px', borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#e2e8f0', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={handleSubmit} disabled={submitting}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                                    border: 'none', color: '#fff', fontWeight: '800', cursor: 'pointer',
                                    fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                }}
                            >
                                <Send size={18} /> {submitting ? '등록 중...' : '프로젝트 등록하기'}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 로그인 프롬프트 모달 */}
            {showLoginPrompt && (
                <LoginPrompt
                    isModal
                    message="프로젝트를 등록하거나 좋아요를 누르려면 로그인하세요"
                    onClose={() => setShowLoginPrompt(false)}
                />
            )}
        </div>
    );
};

export default ProjectShowcase;
