import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, X, Lightbulb } from 'lucide-react';

/**
 * CommunityWarmMoments 컴포넌트
 * 커뮤니티의 따뜻한 순간들을 큐레이션합니다
 * - 질문-답변 카드
 * - 카테고리 필터
 * - 상세보기 모달
 */
const CommunityWarmMoments = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [sortBy, setSortBy] = useState('latest');
    const [selectedMoment, setSelectedMoment] = useState(null);
    const [liked, setLiked] = useState(new Set());

    // 샘플 커뮤니티 순간들
    const moments = [
        {
            id: 1,
            category: 'beginner',
            question: '코딩이 너무 어려워요... 포기할까봐요',
            asker: { name: '초보자A', level: '1주' },
            answer: '저도 그런 적 많아요! 하지만 계속하다 보면 실력이 늘어요. 하나씩 천천히 배우세요 💪',
            answerer: { name: '멘토김개발', level: '5년 경력' },
            likes: 234,
            comments: 45,
            warmth: 5
        },
        {
            id: 2,
            category: 'mentor',
            question: 'React 프로젝트를 처음 완성했어요!',
            asker: { name: '초보자B', level: '3주' },
            answer: '축하합니다!! 첫 완성이 제일 아름다워요. 다음 프로젝트도 화이팅! 🎉',
            answerer: { name: '박파이썬', level: '멘토' },
            likes: 567,
            comments: 89,
            warmth: 5
        },
        {
            id: 3,
            category: 'success',
            question: '드디어 첫 인턴십 면접을 봤습니다!',
            asker: { name: '성장자C', level: '2개월' },
            answer: '우와! 정말 멋이에요! 이 여정을 우리가 함께 해서 자랑스럽습니다. 화이팅!!',
            answerer: { name: '이디자인', level: '멘토' },
            likes: 789,
            comments: 123,
            warmth: 5
        },
        {
            id: 4,
            category: 'help',
            question: 'async/await가 이해가 안 돼요... 누구 도와줄 사람?',
            asker: { name: '초보자D', level: '2주' },
            answer: 'async/await는 비동기 처리를 쉽게 하는 방식입니다. 예제로 설명해드릴게요! 함께 배워봐요.',
            answerer: { name: '최풀스택', level: '멘토' },
            likes: 234,
            comments: 56,
            warmth: 4
        },
        {
            id: 5,
            category: 'beginner',
            question: '반복문을 몇 번을 봐도 이해가 안 돼요',
            asker: { name: '초보자E', level: '4일' },
            answer: '반복문은 같은 작업을 여러 번 하는 거예요! 실전 예제를 보면 금방 이해돼요. 함께 해봐요! 🙌',
            answerer: { name: '정초보친화', level: '입문자 멘토' },
            likes: 145,
            comments: 28,
            warmth: 4
        },
        {
            id: 6,
            category: 'success',
            question: '3개월 만에 포트폴리오 완성했습니다!',
            asker: { name: '성장자F', level: '3개월' },
            answer: '정말 멋져요! 당신의 성장 과정이 너무 아름다워요. 앞으로 더 큰 꿈을 향해 함께 가요!',
            answerer: { name: '김개발', level: '5년 경력' },
            likes: 912,
            comments: 178,
            warmth: 5
        }
    ];

    const categories = [
        { id: 'all', name: '전체' },
        { id: 'beginner', name: '🌱 초보 질문' },
        { id: 'mentor', name: '🎓 멘토 답변' },
        { id: 'success', name: '🎉 성공 스토리' },
        { id: 'help', name: '🆘 도움 요청' }
    ];

    // 필터링 및 정렬
    const filteredAndSorted = useMemo(() => {
        let result = moments.filter(moment => {
            return activeCategory === 'all' || moment.category === activeCategory;
        });

        if (sortBy === 'latest') {
            // 최신순 (그냥 유지)
        } else if (sortBy === 'likes') {
            result.sort((a, b) => b.likes - a.likes);
        }

        return result;
    }, [activeCategory, sortBy]);

    const toggleLike = (id) => {
        const newLiked = new Set(liked);
        if (newLiked.has(id)) {
            newLiked.delete(id);
        } else {
            newLiked.add(id);
        }
        setLiked(newLiked);
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'beginner':
                return { bg: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', text: '#22c55e' };
            case 'mentor':
                return { bg: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', text: '#818cf8' };
            case 'success':
                return { bg: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', text: '#d8b4fe' };
            case 'help':
                return { bg: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', text: '#f59e0b' };
            default:
                return { bg: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', text: '#818cf8' };
        }
    };

    return (
        <div style={{
            maxWidth: '1000px',
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
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: '0 0 12px 0'
                }}>
                    💛 커뮤니티의 따뜻한 순간들
                </h2>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '1rem',
                    margin: 0
                }}>
                    우리 커뮤니티에서 벌어지는 따뜻한 도움과 성공의 순간들
                </p>
            </motion.div>

            {/* 필터 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{ marginBottom: '32px' }}
            >
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    marginBottom: '20px'
                }}>
                    {categories.map(cat => (
                        <motion.button
                            key={cat.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveCategory(cat.id)}
                            style={{
                                padding: '8px 16px',
                                background: activeCategory === cat.id
                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                    : 'rgba(99, 102, 241, 0.1)',
                                border: activeCategory === cat.id
                                    ? 'none'
                                    : '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '10px',
                                color: activeCategory === cat.id ? 'white' : '#818cf8',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            {cat.name}
                        </motion.button>
                    ))}
                </div>

                {/* 정렬 */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <label style={{
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                    }}>
                        정렬:
                    </label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                            outline: 'none'
                        }}
                    >
                        <option value="latest">최신순</option>
                        <option value="likes">공감순</option>
                    </select>
                </div>
            </motion.div>

            {/* 따뜻한 순간들 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}
            >
                {filteredAndSorted.map((moment, idx) => {
                    const categoryColor = getCategoryColor(moment.category);
                    return (
                        <motion.div
                            key={moment.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedMoment(moment)}
                            style={{
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '16px',
                                padding: '24px',
                                cursor: 'pointer',
                                backdropFilter: 'blur(20px)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {/* 카테고리 배지 */}
                            <div style={{
                                ...categoryColor,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                width: 'fit-content',
                                marginBottom: '12px'
                            }}>
                                {categories.find(c => c.id === moment.category)?.name}
                            </div>

                            {/* 질문 */}
                            <h3 style={{
                                color: 'white',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                margin: '0 0 16px 0'
                            }}>
                                {moment.question}
                            </h3>

                            {/* 질문자 정보 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '16px',
                                paddingBottom: '16px',
                                borderBottom: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{
                                    fontSize: '1.2rem'
                                }}>
                                    🙋
                                </div>
                                <div>
                                    <p style={{
                                        color: '#cbd5e1',
                                        fontSize: '0.85rem',
                                        margin: 0,
                                        fontWeight: '600'
                                    }}>
                                        {moment.asker.name}
                                    </p>
                                    <p style={{
                                        color: '#94a3b8',
                                        fontSize: '0.75rem',
                                        margin: '2px 0 0 0'
                                    }}>
                                        {moment.asker.level}
                                    </p>
                                </div>
                            </div>

                            {/* 답변 미리보기 */}
                            <div style={{
                                background: 'rgba(34, 197, 94, 0.05)',
                                borderLeft: '3px solid #22c55e',
                                padding: '12px',
                                borderRadius: '8px',
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                    marginBottom: '8px'
                                }}>
                                    <div style={{
                                        fontSize: '1.2rem'
                                    }}>
                                        💬
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            color: '#cbd5e1',
                                            fontSize: '0.85rem',
                                            margin: 0,
                                            fontWeight: '600'
                                        }}>
                                            {moment.answerer.name}
                                        </p>
                                        <p style={{
                                            color: '#94a3b8',
                                            fontSize: '0.75rem',
                                            margin: '2px 0 0 0'
                                        }}>
                                            {moment.answerer.level}
                                        </p>
                                    </div>
                                </div>
                                <p style={{
                                    color: '#cbd5e1',
                                    fontSize: '0.9rem',
                                    margin: '8px 0 0 0',
                                    lineHeight: '1.5'
                                }}>
                                    {moment.answer}
                                </p>
                            </div>

                            {/* 따뜻함 게이지 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                marginBottom: '16px'
                            }}>
                                <span style={{
                                    color: '#94a3b8',
                                    fontSize: '0.8rem',
                                    fontWeight: '600'
                                }}>
                                    따뜨미:
                                </span>
                                <div style={{
                                    display: 'flex',
                                    gap: '2px'
                                }}>
                                    {Array(moment.warmth).fill(0).map((_, i) => (
                                        <span key={i} style={{ color: '#f59e0b', fontSize: '0.9rem' }}>❤️</span>
                                    ))}
                                </div>
                            </div>

                            {/* 통계 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px'
                            }}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleLike(moment.id);
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: liked.has(moment.id) ? '#ef4444' : '#94a3b8',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <Heart size={16} fill={liked.has(moment.id) ? 'currentColor' : 'none'} />
                                    {moment.likes + (liked.has(moment.id) ? 1 : 0)}
                                </motion.button>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    color: '#94a3b8',
                                    fontSize: '0.85rem',
                                    fontWeight: '600'
                                }}>
                                    <MessageCircle size={16} />
                                    {moment.comments}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* 상세 보기 모달 */}
            <AnimatePresence>
                {selectedMoment && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedMoment(null)}
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
                                maxWidth: '700px',
                                width: '100%',
                                backdropFilter: 'blur(20px)',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedMoment(null)}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    color: '#818cf8',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </motion.button>

                            {/* 질문 */}
                            <h2 style={{
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                margin: '0 0 20px 0'
                            }}>
                                {selectedMoment.question}
                            </h2>

                            {/* 질문자 정보 */}
                            <div style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}>
                                    <div style={{ fontSize: '1.5rem' }}>🙋</div>
                                    <div>
                                        <p style={{
                                            color: '#e2e8f0',
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            margin: 0
                                        }}>
                                            {selectedMoment.asker.name}
                                        </p>
                                        <p style={{
                                            color: '#94a3b8',
                                            fontSize: '0.85rem',
                                            margin: '4px 0 0 0'
                                        }}>
                                            {selectedMoment.asker.level}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 답변 */}
                            <div style={{
                                background: 'rgba(34, 197, 94, 0.1)',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                borderRadius: '12px',
                                padding: '20px',
                                marginBottom: '20px'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{ fontSize: '1.5rem' }}>💬</div>
                                    <div>
                                        <p style={{
                                            color: '#e2e8f0',
                                            fontSize: '0.95rem',
                                            fontWeight: '600',
                                            margin: 0
                                        }}>
                                            {selectedMoment.answerer.name}
                                        </p>
                                        <p style={{
                                            color: '#94a3b8',
                                            fontSize: '0.85rem',
                                            margin: '4px 0 0 0'
                                        }}>
                                            {selectedMoment.answerer.level}
                                        </p>
                                    </div>
                                </div>
                                <p style={{
                                    color: '#cbd5e1',
                                    fontSize: '1rem',
                                    margin: 0,
                                    lineHeight: '1.7'
                                }}>
                                    {selectedMoment.answer}
                                </p>
                            </div>

                            {/* 좋아요 버튼 */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleLike(selectedMoment.id)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: liked.has(selectedMoment.id) ? 'rgba(239, 68, 68, 0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    border: liked.has(selectedMoment.id) ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                                    borderRadius: '10px',
                                    color: liked.has(selectedMoment.id) ? '#ef4444' : 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Heart size={18} fill={liked.has(selectedMoment.id) ? 'currentColor' : 'none'} />
                                {liked.has(selectedMoment.id) ? '공감했어요' : '이 순간 공감해요'}
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CommunityWarmMoments;
