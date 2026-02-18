import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Heart, Share2, Clock, Trophy, Zap, Users, X, Send } from 'lucide-react';

/**
 * WeeklyChallengeBoard 컴포넌트
 * 주간 도전 과제와 참여자 갤러리를 관리합니다
 * - 현재 도전 정보 표시
 * - 참여자 갤러리 (실시간 완성 작품)
 * - 제출 폼
 * - 도전 타이머
 */
const WeeklyChallengeBoard = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 3,
        hours: 12,
        minutes: 45,
        seconds: 30
    });
    const [submissions, setSubmissions] = useState([
        {
            id: 1,
            username: '코딩청년',
            avatar: '👨‍💻',
            title: '계산기 앱',
            description: 'React로 만든 멋진 계산기',
            likes: 24,
            timeAgo: '2시간 전',
            difficulty: '쉬움'
        },
        {
            id: 2,
            username: '바이브마스터',
            avatar: '🚀',
            title: '할일 관리 웹앱',
            description: 'Tailwind CSS 스타일링 적용',
            likes: 18,
            timeAgo: '5시간 전',
            difficulty: '중간'
        },
        {
            id: 3,
            username: '개발자꿈',
            avatar: '✨',
            title: '날씨 앱',
            description: 'Open Weather API 연동',
            likes: 31,
            timeAgo: '8시간 전',
            difficulty: '어려움'
        },
        {
            id: 4,
            username: '코딩레벨업',
            avatar: '💪',
            title: '게임 만들기',
            description: 'Canvas 기반 슛팅 게임',
            likes: 42,
            timeAgo: '1일 전',
            difficulty: '어려움'
        }
    ]);
    const [mySubmission, setMySubmission] = useState(null);
    const [submissionInput, setSubmissionInput] = useState('');
    const [liked, setLiked] = useState(new Set());
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);

    // 타이머 카운트다운
    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                let { days, hours, minutes, seconds } = prev;

                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                } else if (days > 0) {
                    days--;
                    hours = 23;
                    minutes = 59;
                    seconds = 59;
                } else {
                    clearInterval(interval);
                }

                return { days, hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = () => {
        if (submissionInput.trim()) {
            setMySubmission({
                id: Date.now(),
                username: '나',
                avatar: '😊',
                title: submissionInput.split('\n')[0],
                description: submissionInput.split('\n').slice(1).join('\n'),
                likes: 0,
                timeAgo: '방금',
                difficulty: '중간'
            });
            setSubmissionInput('');
            setShowSubmissionForm(false);
        }
    };

    const toggleLike = (id) => {
        const newLiked = new Set(liked);
        if (newLiked.has(id)) {
            newLiked.delete(id);
        } else {
            newLiked.add(id);
        }
        setLiked(newLiked);
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case '쉬움':
                return { bg: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', text: '#22c55e' };
            case '중간':
                return { bg: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', text: '#f59e0b' };
            case '어려움':
                return { bg: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', text: '#ef4444' };
            default:
                return { bg: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', text: '#818cf8' };
        }
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
                style={{ marginBottom: '40px' }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px'
                }}>
                    <div style={{ fontSize: '2.5rem' }}>🏆</div>
                    <div>
                        <h2 style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: 'white',
                            margin: 0
                        }}>
                            주간 도전
                        </h2>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.95rem',
                            margin: 0
                        }}>
                            함께 도전하고 서로의 작품을 응원해보세요!
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* 주요 정보 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '40px'
            }}>
                {/* 도전 제목 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.15), transparent)',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        borderRadius: '16px',
                        padding: '24px',
                        gridColumn: 'span 1'
                    }}
                >
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        margin: '0 0 8px 0',
                        textTransform: 'uppercase',
                        fontWeight: '600'
                    }}>
                        이번 주 도전
                    </p>
                    <h3 style={{
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        margin: 0
                    }}>
                        💡 AI로 앱 만들기
                    </h3>
                    <p style={{
                        color: '#cbd5e1',
                        fontSize: '0.9rem',
                        margin: '12px 0 0 0'
                    }}>
                        프롬프트를 활용해 당신만의 앱을 만들어보세요
                    </p>
                </motion.div>

                {/* 참여자 수 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.15), transparent)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{
                        fontSize: '2rem'
                    }}>
                        <Users size={24} color="#818cf8" />
                    </div>
                    <div>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            margin: '0 0 4px 0',
                            textTransform: 'uppercase',
                            fontWeight: '600'
                        }}>
                            참여자
                        </p>
                        <p style={{
                            color: '#818cf8',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            margin: 0
                        }}>
                            {submissions.length}명
                        </p>
                    </div>
                </motion.div>

                {/* 보상 포인트 */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(34, 197, 94, 0.15), transparent)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div style={{
                        fontSize: '2rem'
                    }}>
                        <Zap size={24} color="#22c55e" />
                    </div>
                    <div>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            margin: '0 0 4px 0',
                            textTransform: 'uppercase',
                            fontWeight: '600'
                        }}>
                            보상
                        </p>
                        <p style={{
                            color: '#22c55e',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            margin: 0
                        }}>
                            100점
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* 타이머 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                style={{
                    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: '20px',
                    padding: '32px',
                    marginBottom: '40px',
                    backdropFilter: 'blur(20px)',
                    textAlign: 'center'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '20px'
                }}>
                    <Clock size={20} color="#f59e0b" />
                    <h3 style={{
                        color: '#f59e0b',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        margin: 0
                    }}>
                        도전 마감까지
                    </h3>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                    maxWidth: '500px',
                    margin: '0 auto'
                }}>
                    {['days', 'hours', 'minutes', 'seconds'].map((unit, idx) => (
                        <motion.div
                            key={unit}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '12px',
                                padding: '16px'
                            }}
                        >
                            <motion.p
                                key={`${unit}-${timeLeft[unit]}`}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    color: '#f59e0b',
                                    fontSize: '2rem',
                                    fontWeight: 'bold',
                                    margin: '0 0 8px 0'
                                }}
                            >
                                {String(timeLeft[unit]).padStart(2, '0')}
                            </motion.p>
                            <p style={{
                                color: '#94a3b8',
                                fontSize: '0.8rem',
                                margin: 0,
                                textTransform: 'uppercase',
                                fontWeight: '600'
                            }}>
                                {unit === 'days' ? '일' : unit === 'hours' ? '시간' : unit === 'minutes' ? '분' : '초'}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* 내 제출 섹션 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                    background: 'linear-gradient(145deg, rgba(99, 102, 241, 0.1), transparent)',
                    border: '2px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '40px'
                }}
            >
                {!mySubmission ? (
                    <>
                        <h4 style={{
                            color: '#818cf8',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            margin: '0 0 16px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Upload size={20} />
                            나의 도전 작품
                        </h4>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '0.9rem',
                            margin: '0 0 16px 0'
                        }}>
                            당신의 멋진 작품을 공유해보세요! 모든 참여자를 응원합니다 🎉
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSubmissionForm(!showSubmissionForm)}
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Upload size={18} />
                            작품 제출하기
                        </motion.button>
                    </>
                ) : (
                    <>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '16px'
                        }}>
                            <h4 style={{
                                color: '#22c55e',
                                fontSize: '1rem',
                                fontWeight: '700',
                                margin: 0
                            }}>
                                ✅ 제출되었습니다!
                            </h4>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setMySubmission(null)}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    color: '#ef4444',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={18} />
                            </motion.button>
                        </div>
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '12px',
                            padding: '16px'
                        }}>
                            <p style={{
                                color: '#cbd5e1',
                                fontSize: '1rem',
                                fontWeight: '600',
                                margin: '0 0 8px 0'
                            }}>
                                {mySubmission.title}
                            </p>
                            <p style={{
                                color: '#94a3b8',
                                fontSize: '0.9rem',
                                margin: 0,
                                whiteSpace: 'pre-wrap'
                            }}>
                                {mySubmission.description}
                            </p>
                        </div>
                    </>
                )}

                {/* 제출 폼 */}
                {showSubmissionForm && !mySubmission && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            marginTop: '16px',
                            padding: '16px',
                            background: 'rgba(0,0,0,0.3)',
                            borderRadius: '12px'
                        }}
                    >
                        <textarea
                            value={submissionInput}
                            onChange={(e) => setSubmissionInput(e.target.value)}
                            placeholder="작품 제목과 설명을 입력하세요..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '8px',
                                color: '#e2e8f0',
                                fontSize: '0.9rem',
                                fontFamily: 'inherit',
                                minHeight: '100px',
                                marginBottom: '12px',
                                resize: 'none'
                            }}
                        />
                        <div style={{
                            display: 'flex',
                            gap: '8px'
                        }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSubmit}
                                disabled={!submissionInput.trim()}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: submissionInput.trim() ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(99, 102, 241, 0.3)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: submissionInput.trim() ? 'pointer' : 'not-allowed',
                                    fontWeight: '600',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Send size={16} />
                                제출
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setShowSubmissionForm(false);
                                    setSubmissionInput('');
                                }}
                                style={{
                                    padding: '10px 16px',
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '8px',
                                    color: '#818cf8',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.9rem'
                                }}
                            >
                                취소
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* 참여자 갤러리 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
            >
                <h3 style={{
                    color: 'white',
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    margin: '0 0 24px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Trophy size={24} />
                    참여자 작품 갤러리
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px'
                }}>
                    {submissions.map((submission, idx) => (
                        <motion.div
                            key={submission.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.4 + idx * 0.05 }}
                            whileHover={{ y: -8 }}
                            style={{
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '16px',
                                padding: '20px',
                                backdropFilter: 'blur(20px)',
                                transition: 'all 0.3s',
                                position: 'relative'
                            }}
                        >
                            {/* 어려움 배지 */}
                            <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                ...getDifficultyColor(submission.difficulty),
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}>
                                {submission.difficulty}
                            </div>

                            {/* 헤더 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '16px'
                            }}>
                                <div style={{
                                    fontSize: '2rem'
                                }}>
                                    {submission.avatar}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        color: '#e2e8f0',
                                        fontSize: '0.95rem',
                                        fontWeight: '600',
                                        margin: 0
                                    }}>
                                        {submission.username}
                                    </p>
                                    <p style={{
                                        color: '#94a3b8',
                                        fontSize: '0.8rem',
                                        margin: 0
                                    }}>
                                        {submission.timeAgo}
                                    </p>
                                </div>
                            </div>

                            {/* 내용 */}
                            <h4 style={{
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '700',
                                margin: '0 0 8px 0'
                            }}>
                                {submission.title}
                            </h4>
                            <p style={{
                                color: '#cbd5e1',
                                fontSize: '0.9rem',
                                margin: '0 0 16px 0',
                                lineHeight: '1.5'
                            }}>
                                {submission.description}
                            </p>

                            {/* 액션 버튼 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => toggleLike(submission.id)}
                                    style={{
                                        background: liked.has(submission.id) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                                        border: liked.has(submission.id) ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        color: liked.has(submission.id) ? '#ef4444' : '#818cf8',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <Heart size={16} fill={liked.has(submission.id) ? 'currentColor' : 'none'} />
                                    {submission.likes + (liked.has(submission.id) ? 1 : 0)}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        color: '#818cf8',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}
                                >
                                    <Share2 size={16} />
                                    공유
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 더 보기 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    style={{
                        textAlign: 'center',
                        marginTop: '32px'
                    }}
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '12px 32px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '10px',
                            color: '#818cf8',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem'
                        }}
                    >
                        더 많은 작품 보기
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default WeeklyChallengeBoard;
