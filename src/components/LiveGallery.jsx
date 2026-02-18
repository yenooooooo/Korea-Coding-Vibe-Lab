import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Heart, X, Users, Code, Zap, ArrowUpRight } from 'lucide-react';

/**
 * LiveGallery 컴포넌트
 * 입문자들의 멋진 작품을 전시하고 공유합니다
 * - 카테고리별 작품 필터
 * - 정렬 옵션 (최신, 인기, 좋아요)
 * - 상세 보기 모달
 * - 검색 기능
 */
const LiveGallery = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('recent');
    const [selectedWork, setSelectedWork] = useState(null);
    const [liked, setLiked] = useState(new Set());

    // 샘플 작품 데이터
    const works = [
        {
            id: 1,
            title: '계산기 앱',
            category: 'tool',
            author: '김코더',
            views: 234,
            likes: 56,
            description: 'React와 Tailwind CSS로 만든 세련된 계산기',
            tech: ['React', 'Tailwind CSS'],
            image: '🧮',
            beginnerDaysAgo: 14,
            featured: true
        },
        {
            id: 2,
            title: 'Flappy Bird 게임',
            category: 'game',
            author: '박게임러',
            views: 567,
            likes: 123,
            description: 'Canvas API를 사용한 클래식 게임 재해석',
            tech: ['JavaScript', 'Canvas API'],
            image: '🎮',
            beginnerDaysAgo: 10,
            featured: true
        },
        {
            id: 3,
            title: '날씨 웹사이트',
            category: 'web',
            author: '이웹디',
            views: 345,
            likes: 87,
            description: 'OpenWeather API와 현대적인 UI 디자인',
            tech: ['React', 'API', 'Tailwind CSS'],
            image: '🌤️',
            beginnerDaysAgo: 7,
            featured: false
        },
        {
            id: 4,
            title: '할일 관리 앱',
            category: 'tool',
            author: '최프론트',
            views: 289,
            likes: 64,
            description: 'Local Storage를 활용한 개인용 할일 관리 도구',
            tech: ['React', 'Local Storage'],
            image: '✅',
            beginnerDaysAgo: 5,
            featured: false
        },
        {
            id: 5,
            title: 'SNS 클론',
            category: 'web',
            author: '정개발러',
            views: 456,
            likes: 98,
            description: '인스타그램을 모티브로 한 소셜 미디어 플랫폼',
            tech: ['React', 'Firebase', 'Tailwind CSS'],
            image: '📱',
            beginnerDaysAgo: 12,
            featured: true
        },
        {
            id: 6,
            title: '2048 게임',
            category: 'game',
            author: '강게임',
            views: 612,
            likes: 145,
            description: '인기 있는 퍼즐 게임을 웹 버전으로 구현',
            tech: ['JavaScript', 'CSS Grid'],
            image: '🎯',
            beginnerDaysAgo: 3,
            featured: true
        },
        {
            id: 7,
            title: '포트폴리오 웹사이트',
            category: 'web',
            author: '박포트폴',
            views: 178,
            likes: 45,
            description: '나 자신을 소개하는 개인 포트폴리오 페이지',
            tech: ['HTML', 'CSS', 'JavaScript'],
            image: '💼',
            beginnerDaysAgo: 8,
            featured: false
        },
        {
            id: 8,
            title: '그림판 앱',
            category: 'tool',
            author: '예술가',
            views: 234,
            likes: 72,
            description: 'Canvas를 활용한 간단한 그리기 도구',
            tech: ['Canvas API', 'JavaScript'],
            image: '🎨',
            beginnerDaysAgo: 15,
            featured: false
        }
    ];

    // 필터링 및 정렬
    const filteredAndSorted = useMemo(() => {
        let result = works.filter(work => {
            const matchesSearch = work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 work.author.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'all' || work.category === activeCategory;
            return matchesSearch && matchesCategory;
        });

        // 정렬
        if (sortBy === 'recent') {
            result.sort((a, b) => a.beginnerDaysAgo - b.beginnerDaysAgo);
        } else if (sortBy === 'popular') {
            result.sort((a, b) => b.views - a.views);
        } else if (sortBy === 'likes') {
            result.sort((a, b) => b.likes - a.likes);
        }

        return result;
    }, [searchQuery, activeCategory, sortBy]);

    const categories = [
        { id: 'all', name: '전체', icon: '⭐' },
        { id: 'web', name: '웹사이트', icon: '🌐' },
        { id: 'game', name: '게임', icon: '🎮' },
        { id: 'tool', name: '도구', icon: '🛠️' }
    ];

    const toggleLike = (id) => {
        const newLiked = new Set(liked);
        if (newLiked.has(id)) {
            newLiked.delete(id);
        } else {
            newLiked.add(id);
        }
        setLiked(newLiked);
    };

    const getCategoryName = (categoryId) => {
        return categories.find(c => c.id === categoryId)?.name || categoryId;
    };

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 20px'
        }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: '40px', textAlign: 'center' }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    marginBottom: '16px'
                }}>
                    <div style={{ fontSize: '2.5rem' }}>🖼️</div>
                    <h2 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'white',
                        margin: 0
                    }}>
                        라이브 갤러리
                    </h2>
                </div>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '1rem',
                    margin: 0
                }}>
                    입문자들이 만든 멋진 작품들을 구경하고 응원해보세요! 💪
                </p>
            </motion.div>

            {/* 검색 및 필터 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{ marginBottom: '32px' }}
            >
                {/* 검색창 */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        flex: 1,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Search
                            size={20}
                            color="#818cf8"
                            style={{
                                position: 'absolute',
                                left: '16px',
                                pointerEvents: 'none'
                            }}
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="작품명이나 제작자명으로 검색..."
                            style={{
                                width: '100%',
                                paddingLeft: '48px',
                                paddingRight: '16px',
                                height: '48px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '12px',
                                color: '#e2e8f0',
                                fontSize: '0.95rem',
                                outline: 'none',
                                fontFamily: 'inherit',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => {
                                e.target.style.border = '1px solid rgba(99, 102, 241, 0.4)';
                            }}
                            onBlur={(e) => {
                                e.target.style.border = '1px solid rgba(99, 102, 241, 0.2)';
                            }}
                        />
                    </div>

                    {/* 정렬 옵션 */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '12px',
                            color: '#e2e8f0',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            outline: 'none'
                        }}
                    >
                        <option value="recent">최신순</option>
                        <option value="popular">조회순</option>
                        <option value="likes">좋아요순</option>
                    </select>
                </div>

                {/* 카테고리 필터 */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}>
                    {categories.map(category => (
                        <motion.button
                            key={category.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory(category.id)}
                            style={{
                                padding: '10px 16px',
                                background: activeCategory === category.id
                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                    : 'rgba(99, 102, 241, 0.1)',
                                border: activeCategory === category.id
                                    ? 'none'
                                    : '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '10px',
                                color: activeCategory === category.id ? 'white' : '#818cf8',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.3s'
                            }}
                        >
                            {category.icon}
                            {category.name}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* 결과 수 표시 */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                style={{
                    color: '#94a3b8',
                    fontSize: '0.9rem',
                    margin: '0 0 24px 0'
                }}
            >
                총 <span style={{ fontWeight: '700', color: '#818cf8' }}>{filteredAndSorted.length}</span>개의 작품
            </motion.p>

            {/* 작품 갤러리 */}
            {filteredAndSorted.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '24px'
                    }}
                >
                    {filteredAndSorted.map((work, idx) => (
                        <motion.div
                            key={work.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
                            whileHover={{ y: -8 }}
                            onClick={() => setSelectedWork(work)}
                            style={{
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                cursor: 'pointer',
                                backdropFilter: 'blur(20px)',
                                transition: 'all 0.3s',
                                position: 'relative'
                            }}
                        >
                            {/* Featured 배지 */}
                            {work.featured && (
                                <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'linear-gradient(135deg, #fbbf24, #f97316)',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    zIndex: 10
                                }}>
                                    ⭐ Featured
                                </div>
                            )}

                            {/* 썸네일 */}
                            <div style={{
                                background: 'rgba(0,0,0,0.2)',
                                padding: '40px 20px',
                                textAlign: 'center',
                                fontSize: '3.5rem',
                                borderBottom: '1px solid rgba(99, 102, 241, 0.1)'
                            }}>
                                {work.image}
                            </div>

                            {/* 내용 */}
                            <div style={{ padding: '20px' }}>
                                {/* 배지 */}
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: '#22c55e'
                                    }}>
                                        🌱 {work.beginnerDaysAgo}일 전 입문자
                                    </div>
                                    <div style={{
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: '#818cf8'
                                    }}>
                                        {getCategoryName(work.category)}
                                    </div>
                                </div>

                                {/* 제목 */}
                                <h3 style={{
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: '700',
                                    margin: '0 0 8px 0',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>
                                    {work.title}
                                </h3>

                                {/* 설명 */}
                                <p style={{
                                    color: '#cbd5e1',
                                    fontSize: '0.85rem',
                                    margin: '0 0 12px 0',
                                    lineHeight: '1.4',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical'
                                }}>
                                    {work.description}
                                </p>

                                {/* 제작자 */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '12px',
                                    paddingBottom: '12px',
                                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                                }}>
                                    <Users size={16} color="#94a3b8" />
                                    <span style={{
                                        color: '#94a3b8',
                                        fontSize: '0.85rem'
                                    }}>
                                        by {work.author}
                                    </span>
                                </div>

                                {/* 통계 */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: '#94a3b8',
                                            fontSize: '0.85rem'
                                        }}>
                                            <Eye size={14} />
                                            {work.views}
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            color: '#94a3b8',
                                            fontSize: '0.85rem'
                                        }}>
                                            <Heart size={14} />
                                            {work.likes}
                                        </div>
                                    </div>
                                </div>

                                {/* 액션 버튼 */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLike(work.id);
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: liked.has(work.id) ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        border: liked.has(work.id) ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                                        borderRadius: '8px',
                                        color: liked.has(work.id) ? '#ef4444' : 'white',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <Heart size={16} fill={liked.has(work.id) ? 'currentColor' : 'none'} />
                                    {liked.has(work.id) ? '좋아요 취소' : '좋아요'}
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'rgba(99, 102, 241, 0.05)',
                        borderRadius: '16px',
                        border: '1px solid rgba(99, 102, 241, 0.1)'
                    }}
                >
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '1.1rem',
                        margin: 0
                    }}>
                        검색 결과가 없습니다. 다른 검색어를 시도해보세요!
                    </p>
                </motion.div>
            )}

            {/* 상세 보기 모달 */}
            <AnimatePresence>
                {selectedWork && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={() => setSelectedWork(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 100,
                            padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '20px',
                                padding: '40px',
                                maxWidth: '600px',
                                width: '100%',
                                backdropFilter: 'blur(20px)',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            {/* 닫기 버튼 */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedWork(null)}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    color: '#818cf8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <X size={20} />
                            </motion.button>

                            {/* 썸네일 */}
                            <div style={{
                                background: 'rgba(0,0,0,0.3)',
                                padding: '60px 20px',
                                textAlign: 'center',
                                fontSize: '5rem',
                                borderRadius: '12px',
                                marginBottom: '24px'
                            }}>
                                {selectedWork.image}
                            </div>

                            {/* 정보 */}
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '16px'
                                }}>
                                    <div style={{
                                        background: 'rgba(34, 197, 94, 0.2)',
                                        border: '1px solid rgba(34, 197, 94, 0.3)',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        color: '#22c55e'
                                    }}>
                                        🌱 {selectedWork.beginnerDaysAgo}일 전 입문자
                                    </div>
                                    <div style={{
                                        background: 'rgba(99, 102, 241, 0.2)',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        color: '#818cf8'
                                    }}>
                                        {getCategoryName(selectedWork.category)}
                                    </div>
                                </div>

                                <h2 style={{
                                    color: 'white',
                                    fontSize: '1.8rem',
                                    fontWeight: '700',
                                    margin: '0 0 12px 0'
                                }}>
                                    {selectedWork.title}
                                </h2>

                                <p style={{
                                    color: '#cbd5e1',
                                    fontSize: '1rem',
                                    margin: '0 0 20px 0',
                                    lineHeight: '1.6'
                                }}>
                                    {selectedWork.description}
                                </p>

                                {/* 제작자 */}
                                <div style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                    borderRadius: '12px',
                                    padding: '16px',
                                    marginBottom: '20px'
                                }}>
                                    <p style={{
                                        color: '#94a3b8',
                                        fontSize: '0.85rem',
                                        margin: '0 0 8px 0',
                                        textTransform: 'uppercase',
                                        fontWeight: '600'
                                    }}>
                                        제작자
                                    </p>
                                    <p style={{
                                        color: 'white',
                                        fontSize: '1.1rem',
                                        fontWeight: '700',
                                        margin: 0
                                    }}>
                                        {selectedWork.author}
                                    </p>
                                </div>

                                {/* 기술 스택 */}
                                <div style={{ marginBottom: '20px' }}>
                                    <p style={{
                                        color: '#94a3b8',
                                        fontSize: '0.85rem',
                                        margin: '0 0 12px 0',
                                        textTransform: 'uppercase',
                                        fontWeight: '600'
                                    }}>
                                        사용 기술
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        gap: '8px',
                                        flexWrap: 'wrap'
                                    }}>
                                        {selectedWork.tech.map((t, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    background: 'rgba(168, 85, 247, 0.2)',
                                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    color: '#d8b4fe'
                                                }}
                                            >
                                                {t}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 통계 */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '12px',
                                    marginBottom: '24px'
                                }}>
                                    <div style={{
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{
                                            color: '#94a3b8',
                                            fontSize: '0.8rem',
                                            margin: '0 0 8px 0',
                                            textTransform: 'uppercase'
                                        }}>
                                            조회수
                                        </p>
                                        <p style={{
                                            color: '#818cf8',
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            margin: 0
                                        }}>
                                            {selectedWork.views}
                                        </p>
                                    </div>
                                    <div style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        textAlign: 'center'
                                    }}>
                                        <p style={{
                                            color: '#94a3b8',
                                            fontSize: '0.8rem',
                                            margin: '0 0 8px 0',
                                            textTransform: 'uppercase'
                                        }}>
                                            좋아요
                                        </p>
                                        <p style={{
                                            color: '#ef4444',
                                            fontSize: '1.5rem',
                                            fontWeight: '700',
                                            margin: 0
                                        }}>
                                            {selectedWork.likes + (liked.has(selectedWork.id) ? 1 : 0)}
                                        </p>
                                    </div>
                                </div>

                                {/* 액션 버튼 */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleLike(selectedWork.id)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: liked.has(selectedWork.id) ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        border: liked.has(selectedWork.id) ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                                        borderRadius: '10px',
                                        color: liked.has(selectedWork.id) ? '#ef4444' : 'white',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <Heart size={20} fill={liked.has(selectedWork.id) ? 'currentColor' : 'none'} />
                                    {liked.has(selectedWork.id) ? '좋아요 취소' : '좋아요'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LiveGallery;
