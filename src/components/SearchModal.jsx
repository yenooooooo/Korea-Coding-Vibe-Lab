import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Clock, Command, Home, Swords, Target, ShoppingBag, Users, BookOpen, Image, BarChart, Zap, MessageSquare, Calendar, Award, User, Lightbulb, Settings, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const allPages = [
    { name: '홈', path: '/', icon: <Home size={18} />, keywords: ['home', '메인', '홈'] },
    { name: '바이브 라운지', path: '/community', icon: <MessageSquare size={18} />, keywords: ['community', '커뮤니티', '채팅', '라운지'] },
    { name: '배틀 아레나', path: '/battle', icon: <Swords size={18} />, keywords: ['battle', '배틀', '대결', '아레나'] },
    { name: '랭킹', path: '/ranking', icon: <Trophy size={18} />, keywords: ['ranking', '랭킹', '순위', '리더보드'] },
    { name: '퀘스트', path: '/quest', icon: <Target size={18} />, keywords: ['quest', '퀘스트', '미션'] },
    { name: '상점', path: '/shop', icon: <ShoppingBag size={18} />, keywords: ['shop', '상점', '쇼핑', '포인트'] },
    { name: '시즌 패스', path: '/season-pass', icon: <Award size={18} />, keywords: ['season', '시즌', '패스'] },
    { name: '인벤토리', path: '/inventory', icon: <ShoppingBag size={18} />, keywords: ['inventory', '인벤토리', '아이템'] },
    { name: '마켓', path: '/market', icon: <ShoppingBag size={18} />, keywords: ['market', '마켓', '거래'] },
    { name: '멘토 찾기', path: '/mentor', icon: <Users size={18} />, keywords: ['mentor', '멘토', '도움'] },
    { name: '멘토 예약', path: '/mentor-booking', icon: <Calendar size={18} />, keywords: ['booking', '예약', '멘토'] },
    { name: 'AI 스터디', path: '/ai-study', icon: <Lightbulb size={18} />, keywords: ['ai', 'study', '스터디', 'AI'] },
    { name: '자기진단', path: '/diagnosis', icon: <Target size={18} />, keywords: ['diagnosis', '진단', '테스트'] },
    { name: '주간 챌린지', path: '/challenge', icon: <Award size={18} />, keywords: ['challenge', '챌린지', '주간'] },
    { name: '프로필', path: '/profile', icon: <User size={18} />, keywords: ['profile', '프로필', '내정보'] },
    { name: '친구', path: '/friends', icon: <Users size={18} />, keywords: ['friends', '친구'] },
    { name: 'DM 메시지', path: '/messages', icon: <MessageSquare size={18} />, keywords: ['message', 'dm', '메시지'] },
    { name: '출석', path: '/attendance', icon: <Calendar size={18} />, keywords: ['attendance', '출석', '체크인'] },
    { name: '스터디 그룹', path: '/study', icon: <BookOpen size={18} />, keywords: ['study', '스터디', '그룹'] },
    { name: '따뜻한 순간', path: '/moments', icon: <Users size={18} />, keywords: ['moments', '순간', '따뜻'] },
    { name: '바이브 DNA', path: '/vibe-dna', icon: <Zap size={18} />, keywords: ['dna', 'vibe', '바이브'] },
    { name: '샌드박스', path: '/sandbox', icon: <Zap size={18} />, keywords: ['sandbox', '샌드박스', '실험'] },
    { name: '따라하기', path: '/learn', icon: <Lightbulb size={18} />, keywords: ['learn', '따라하기', '학습'] },
    { name: '데모', path: '/demo', icon: <Zap size={18} />, keywords: ['demo', '데모'] },
    { name: '스타터 가이드', path: '/starter-guide', icon: <BookOpen size={18} />, keywords: ['guide', '가이드', '스타터', 'pdf'] },
    { name: '라이브 갤러리', path: '/gallery', icon: <Image size={18} />, keywords: ['gallery', '갤러리', '이미지'] },
    { name: '프로젝트 쇼케이스', path: '/showcase', icon: <Trophy size={18} />, keywords: ['showcase', '쇼케이스', '프로젝트'] },
    { name: '포인트 내역', path: '/point-history', icon: <BarChart size={18} />, keywords: ['point', '포인트', '내역', '히스토리'] },
    { name: '설정', path: '/settings', icon: <Settings size={18} />, keywords: ['settings', '설정', '알림'] },
    { name: '분석 (Admin)', path: '/admin', icon: <BarChart size={18} />, keywords: ['admin', '관리', '분석'] },
];

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [userResults, setUserResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [recentSearches, setRecentSearches] = useState(() => {
        const saved = localStorage.getItem('kcvl_recent_searches');
        return saved ? JSON.parse(saved) : [];
    });
    const inputRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
        if (!isOpen) { setQuery(''); setResults([]); setUserResults([]); setSelectedIndex(0); }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) { setResults([]); setUserResults([]); return; }
        const q = query.toLowerCase();
        const pageResults = allPages.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.keywords.some(k => k.includes(q))
        );
        setResults(pageResults);
        setSelectedIndex(0);

        // 유저 검색 (디바운스)
        const timer = setTimeout(async () => {
            if (q.length >= 2) {
                try {
                    const { data } = await supabase
                        .from('profiles')
                        .select('id, nickname, username, avatar_url')
                        .or(`nickname.ilike.%${q}%,username.ilike.%${q}%`)
                        .limit(5);
                    setUserResults(data || []);
                } catch { setUserResults([]); }
            } else { setUserResults([]); }
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    const allResults = [...results, ...userResults.map(u => ({
        name: u.nickname || u.username || '유저', path: '/profile', icon: <User size={18} />,
        isUser: true, userId: u.id,
    }))];

    const handleSelect = useCallback((item) => {
        if (!item) return;
        // 최근 검색에 추가
        const newRecent = [query, ...recentSearches.filter(r => r !== query)].slice(0, 5);
        setRecentSearches(newRecent);
        localStorage.setItem('kcvl_recent_searches', JSON.stringify(newRecent));
        navigate(item.path);
        onClose();
    }, [query, recentSearches, navigate, onClose]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && allResults[selectedIndex]) {
            handleSelect(allResults[selectedIndex]);
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                    paddingTop: '15vh',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    onClick={e => e.stopPropagation()}
                    style={{
                        width: '560px', maxWidth: '90vw', maxHeight: '70vh',
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '20px', overflow: 'hidden',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 60px rgba(99,102,241,0.15)',
                    }}
                >
                    {/* 검색 입력 */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        <Search size={20} color="#6366f1" />
                        <input
                            ref={inputRef} value={query}
                            onChange={e => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="페이지, 기능, 유저 검색..."
                            style={{
                                flex: 1, background: 'none', border: 'none',
                                color: '#e2e8f0', fontSize: '1.05rem', outline: 'none',
                            }}
                        />
                        <div style={{
                            padding: '4px 8px', borderRadius: '6px',
                            background: 'rgba(255,255,255,0.08)', color: '#64748b', fontSize: '0.75rem',
                        }}>
                            ESC
                        </div>
                    </div>

                    {/* 결과 목록 */}
                    <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: '8px' }}>
                        {query.trim() === '' ? (
                            <>
                                {recentSearches.length > 0 && (
                                    <div style={{ padding: '8px 12px' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={12} /> 최근 검색
                                        </div>
                                        {recentSearches.map((r, i) => (
                                            <div
                                                key={i}
                                                onClick={() => setQuery(r)}
                                                style={{
                                                    padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                                                    color: '#94a3b8', fontSize: '0.9rem',
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                            >
                                                <Clock size={14} /> {r}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div style={{ padding: '24px', textAlign: 'center', color: '#475569' }}>
                                    <Command size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                    <p style={{ fontSize: '0.85rem' }}>페이지 이름이나 키워드를 입력하세요</p>
                                </div>
                            </>
                        ) : allResults.length === 0 ? (
                            <div style={{ padding: '30px', textAlign: 'center', color: '#475569' }}>
                                <Search size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
                                <p style={{ fontSize: '0.9rem' }}>"{query}"에 대한 결과가 없습니다</p>
                            </div>
                        ) : (
                            <>
                                {results.length > 0 && (
                                    <div style={{ padding: '4px 12px', marginBottom: '4px' }}>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>페이지</div>
                                    </div>
                                )}
                                {results.map((item, idx) => (
                                    <motion.div
                                        key={item.path}
                                        onClick={() => handleSelect(item)}
                                        style={{
                                            padding: '12px 14px', borderRadius: '12px', cursor: 'pointer',
                                            background: selectedIndex === idx ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                            border: selectedIndex === idx ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            marginBottom: '2px', transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                    >
                                        <div style={{ color: '#6366f1' }}>{item.icon}</div>
                                        <span style={{ color: '#e2e8f0', fontWeight: '600', flex: 1, fontSize: '0.95rem' }}>{item.name}</span>
                                        <ArrowRight size={16} color="#475569" />
                                    </motion.div>
                                ))}
                                {userResults.length > 0 && (
                                    <>
                                        <div style={{ padding: '12px 12px 4px', marginTop: '4px' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>유저</div>
                                        </div>
                                        {userResults.map((u, idx) => (
                                            <motion.div
                                                key={u.id}
                                                onClick={() => { navigate('/profile'); onClose(); }}
                                                style={{
                                                    padding: '12px 14px', borderRadius: '12px', cursor: 'pointer',
                                                    background: selectedIndex === results.length + idx ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    marginBottom: '2px', transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={() => setSelectedIndex(results.length + idx)}
                                            >
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    background: u.avatar_url ? `url(${u.avatar_url}) center/cover` : 'linear-gradient(135deg, #6366f1, #a855f7)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontSize: '0.8rem', fontWeight: '700',
                                                }}>
                                                    {!u.avatar_url && (u.nickname?.[0] || u.username?.[0] || '?')}
                                                </div>
                                                <span style={{ color: '#e2e8f0', fontWeight: '600', flex: 1 }}>
                                                    {u.nickname || u.username || '유저'}
                                                </span>
                                                <span style={{ color: '#475569', fontSize: '0.8rem' }}>유저</span>
                                            </motion.div>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* 하단 단축키 안내 */}
                    <div style={{
                        padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex', gap: '16px', color: '#475569', fontSize: '0.75rem',
                    }}>
                        <span>↑↓ 이동</span>
                        <span>↵ 선택</span>
                        <span>ESC 닫기</span>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SearchModal;
