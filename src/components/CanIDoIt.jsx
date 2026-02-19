import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw, Zap, Heart, Brain, Target } from 'lucide-react';

/**
 * CanIDoIt 컴포넌트
 * 사용자의 바이브 코딩 준비도를 진단하는 성향 테스트
 * - 5개 질문으로 코딩 경험, 논리력, 실패 대처 등 평가
 * - 맞춤형 결과와 격려 메시지
 * - 성공 확률 게이지
 */
const CanIDoIt = () => {
    const navigate = useNavigate();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [scores, setScores] = useState({});
    const [isComplete, setIsComplete] = useState(false);

    // 5개의 질문 데이터
    const questions = [
        {
            id: 'coding',
            question: '코딩 경험이 있으신가요?',
            description: '당신의 현재 코딩 수준을 선택해주세요',
            options: [
                { label: '전혀 없어요 (아직도 OK!)', score: 1, emoji: '🌱' },
                { label: 'HTML/CSS 정도 만 경험 있어요', score: 2, emoji: '🌿' },
                { label: '기본적인 JavaScript 정도는 알아요', score: 3, emoji: '🌳' },
                { label: '이미 여러 프로젝트를 만들었어요', score: 4, emoji: '🌲' },
                { label: '프로 개발자예요', score: 5, emoji: '🏔️' }
            ]
        },
        {
            id: 'logic',
            question: '논리적 사고는 어떤가요?',
            description: '문제를 단계별로 해결하는 능력',
            options: [
                { label: '어렵고 낯설어요', score: 1, emoji: '🤔' },
                { label: '가끔 헷갈려요', score: 2, emoji: '😕' },
                { label: '보통 수준이에요', score: 3, emoji: '😐' },
                { label: '꽤 잘 하는 편이에요', score: 4, emoji: '😊' },
                { label: '매우 명확하게 생각해요', score: 5, emoji: '🧠' }
            ]
        },
        {
            id: 'failure',
            question: '오류나 실패에 어떻게 대처하나요?',
            description: '문제가 생겼을 때의 대응 방식',
            options: [
                { label: '쉽게 포기해버려요', score: 1, emoji: '😢' },
                { label: '답답하지만 무언가 시도해봐요', score: 2, emoji: '😤' },
                { label: '차근차근 디버깅해봐요', score: 3, emoji: '🔍' },
                { label: '에러 메시지를 읽고 해결해요', score: 4, emoji: '🛠️' },
                { label: '오류는 배움의 기회라고 생각해요', score: 5, emoji: '💪' }
            ]
        },
        {
            id: 'time',
            question: '학습 시간을 확보할 수 있나요?',
            description: '주당 학습 투자 시간',
            options: [
                { label: '거의 없어요 (3시간 이하)', score: 1, emoji: '⏰' },
                { label: '조금 있어요 (3-5시간)', score: 2, emoji: '⏱️' },
                { label: '적당해요 (5-10시간)', score: 3, emoji: '⏲️' },
                { label: '충분해요 (10시간 이상)', score: 4, emoji: '📅' },
                { label: '풍부해요 (매일 공부할 수 있어요)', score: 5, emoji: '📆' }
            ]
        },
        {
            id: 'learning',
            question: '새로운 도구/기술 학습에 얼마나 열려있나요?',
            description: '새것을 배우려는 의욕',
            options: [
                { label: '두려워요, 복잡할 것 같아요', score: 1, emoji: '😰' },
                { label: '필요하면 배워야겠죠', score: 2, emoji: '😐' },
                { label: '괜찮아요, 천천히 배울 수 있으면', score: 3, emoji: '😌' },
                { label: '즐거워요, 새것 배우는 걸 좋아해요', score: 4, emoji: '😄' },
                { label: '매우 즐거워요, 매일 뭔가 배우고 싶어요', score: 5, emoji: '🚀' }
            ]
        }
    ];

    const handleSelectOption = (optionScore) => {
        const questionId = questions[currentQuestion].id;
        const newScores = { ...scores, [questionId]: optionScore };
        setScores(newScores);

        // 마지막 질문이면 결과 표시
        if (currentQuestion === questions.length - 1) {
            setIsComplete(true);
        } else {
            // 다음 질문으로
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handleReset = () => {
        setCurrentQuestion(0);
        setScores({});
        setIsComplete(false);
    };

    // 총점 계산
    const totalScore = Object.values(scores).reduce((acc, curr) => acc + curr, 0);
    const maxScore = questions.length * 5;
    const scorePercentage = Math.round((totalScore / maxScore) * 100);

    // 진단 결과
    const getResult = () => {
        if (scorePercentage >= 80) {
            return {
                level: '완벽 준비 🚀',
                color: '#10b981',
                colorRgb: '16, 185, 129',
                title: '당신은 충분히 준비되어 있어요!',
                message: '높은 학습 의욕과 논리력을 갖고 있네요. 바이브 코딩으로 멋진 결과를 만들 준비가 완벽합니다!',
                tips: [
                    '✓ 지금 바로 시작해도 완벽합니다',
                    '✓ 복잡한 프로젝트에도 도전할 수 있어요',
                    '✓ 팀에 도움이 되는 개발자가 될 거예요'
                ],
                emoji: '⭐'
            };
        } else if (scorePercentage >= 60) {
            return {
                level: '좋은 준비 😊',
                color: '#3b82f6',
                colorRgb: '59, 130, 246',
                title: '당신은 충분히 할 수 있어요!',
                message: '기본적인 학습 능력과 긍정적인 태도를 갖고 있습니다. 단계적으로 접근하면 성공할 수 있습니다!',
                tips: [
                    '✓ 간단한 프로젝트부터 시작하세요',
                    '✓ 튜토리얼을 따라하며 학습하면 좋아요',
                    '✓ 커뮤니티 지원으로 더 빨리 배울 수 있어요'
                ],
                emoji: '😊'
            };
        } else if (scorePercentage >= 40) {
            return {
                level: '충분한 가능성 💪',
                color: '#f59e0b',
                colorRgb: '245, 158, 11',
                title: '당신도 분명히 할 수 있어요!',
                message: '지금은 경험이 많지 않지만, 배움의 의욕이 있으면 충분히 성장할 수 있습니다. 우리가 함께합니다!',
                tips: [
                    '✓ 가장 기초부터 천천히 배우세요',
                    '✓ 멘토링을 신청해보세요',
                    '✓ 작은 성공 하나하나를 축하하세요'
                ],
                emoji: '💪'
            };
        } else {
            return {
                level: '시작할 준비 🌱',
                color: '#8b5cf6',
                colorRgb: '139, 92, 246',
                title: '모두 처음부터 시작했어요!',
                message: '경험이 없다고 걱정하지 마세요. AI와 함께라면 누구나 개발자가 될 수 있습니다. 작은 것부터 시작해보세요!',
                tips: [
                    '✓ 입문자 튜토리얼부터 시작하세요',
                    '✓ 에러를 두려워하지 마세요',
                    '✓ 한 번에 한 가지씩 배우세요'
                ],
                emoji: '🌱'
            };
        }
    };

    const result = getResult();
    const progress = ((currentQuestion) / questions.length) * 100;

    return (
        <div style={{
            maxWidth: '700px',
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
                    나도 할 수 있을까? 🤔
                </h2>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '1rem',
                    margin: 0
                }}>
                    5가지 질문으로 바이브 코딩 준비도를 진단받아보세요
                </p>
            </motion.div>

            <AnimatePresence mode="wait">
                {/* 진단 중 */}
                {!isComplete && (
                    <motion.div
                        key="questions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* 진행도 표시 */}
                        <div style={{ marginBottom: '32px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '12px'
                            }}>
                                <span style={{
                                    color: '#94a3b8',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    {currentQuestion + 1} / {questions.length}
                                </span>
                                <span style={{
                                    color: '#818cf8',
                                    fontSize: '0.9rem',
                                    fontWeight: '600'
                                }}>
                                    {progress}%
                                </span>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '8px',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '4px',
                                overflow: 'hidden'
                            }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    style={{
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #818cf8, #c084fc)',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        </div>

                        {/* 질문 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '20px',
                                padding: '32px',
                                backdropFilter: 'blur(20px)',
                                marginBottom: '32px'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                                marginBottom: '24px'
                            }}>
                                <div style={{
                                    fontSize: '2.5rem',
                                    lineHeight: 1
                                }}>
                                    {questions[currentQuestion].description.includes('코딩') ? '💻' :
                                     questions[currentQuestion].description.includes('논리') ? '🧠' :
                                     questions[currentQuestion].description.includes('오류') ? '🛠️' :
                                     questions[currentQuestion].description.includes('시간') ? '⏰' :
                                     '📚'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: '1.3rem',
                                        fontWeight: '700',
                                        color: 'white',
                                        margin: '0 0 8px 0'
                                    }}>
                                        {questions[currentQuestion].question}
                                    </h3>
                                    <p style={{
                                        color: '#94a3b8',
                                        fontSize: '0.9rem',
                                        margin: 0
                                    }}>
                                        {questions[currentQuestion].description}
                                    </p>
                                </div>
                            </div>

                            {/* 선택지들 */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                {questions[currentQuestion].options.map((option, idx) => (
                                    <motion.button
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                                        whileHover={{ scale: 1.02, x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelectOption(option.score)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '16px',
                                            background: 'rgba(0,0,0,0.2)',
                                            border: '1px solid rgba(99, 102, 241, 0.2)',
                                            borderRadius: '12px',
                                            color: '#cbd5e1',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            fontWeight: '500',
                                            transition: 'all 0.3s',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <span style={{ fontSize: '1.5rem' }}>{option.emoji}</span>
                                        <span>{option.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* 결과 페이지 */}
                {isComplete && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* 점수 카드 */}
                        <motion.div
                            style={{
                                background: `linear-gradient(145deg, rgba(${result.colorRgb}, 0.15), transparent)`,
                                border: `2px solid ${result.color}60`,
                                borderRadius: '24px',
                                padding: '40px',
                                marginBottom: '32px',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '-30%',
                                right: '-20%',
                                width: '300px',
                                height: '300px',
                                background: `radial-gradient(circle, ${result.color}20, transparent 60%)`,
                                pointerEvents: 'none'
                            }} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    style={{
                                        fontSize: '4rem',
                                        marginBottom: '16px'
                                    }}
                                >
                                    {result.emoji}
                                </motion.div>

                                <h3 style={{
                                    fontSize: '1.8rem',
                                    fontWeight: '700',
                                    color: result.color,
                                    margin: '0 0 8px 0'
                                }}>
                                    {result.level}
                                </h3>

                                <h2 style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    color: 'white',
                                    margin: '0 0 24px 0'
                                }}>
                                    {result.title}
                                </h2>

                                {/* 점수 게이지 */}
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '12px'
                                    }}>
                                        <span style={{
                                            color: '#94a3b8',
                                            fontSize: '0.9rem'
                                        }}>
                                            준비도
                                        </span>
                                        <span style={{
                                            color: result.color,
                                            fontWeight: '700',
                                            fontSize: '1.2rem'
                                        }}>
                                            {scorePercentage}%
                                        </span>
                                    </div>
                                    <div style={{
                                        width: '100%',
                                        height: '12px',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '6px',
                                        overflow: 'hidden'
                                    }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${scorePercentage}%` }}
                                            transition={{ duration: 1.5, ease: 'easeOut' }}
                                            style={{
                                                height: '100%',
                                                background: `linear-gradient(90deg, ${result.color}, ${result.color}80)`,
                                                borderRadius: '6px',
                                                boxShadow: `0 0 12px ${result.color}80`
                                            }}
                                        />
                                    </div>
                                </div>

                                <p style={{
                                    color: '#cbd5e1',
                                    fontSize: '1rem',
                                    margin: '0 0 32px 0',
                                    lineHeight: '1.6'
                                }}>
                                    {result.message}
                                </p>
                            </div>
                        </motion.div>

                        {/* 추천 팁 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '16px',
                                padding: '24px',
                                marginBottom: '32px'
                            }}
                        >
                            <h4 style={{
                                color: '#818cf8',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                margin: '0 0 16px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <Target size={20} />
                                추천 경로
                            </h4>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px'
                            }}>
                                {result.tips.map((tip, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.4 + idx * 0.1 }}
                                        style={{
                                            color: '#cbd5e1',
                                            fontSize: '0.95rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px'
                                        }}
                                    >
                                        <span>{tip}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* 액션 버튼 */}
                        <div style={{
                            display: 'flex',
                            gap: '12px'
                        }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleReset}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '12px',
                                    color: '#818cf8',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <RotateCcw size={18} />
                                다시 진단받기
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/demo')}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                                }}
                            >
                                <Zap size={18} />
                                시작하기
                            </motion.button>
                        </div>

                        {/* 마지막 격려 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.6 }}
                            style={{
                                marginTop: '32px',
                                padding: '20px',
                                background: 'rgba(168, 85, 247, 0.1)',
                                borderRadius: '12px',
                                border: '1px solid rgba(168, 85, 247, 0.2)',
                                textAlign: 'center'
                            }}
                        >
                            <p style={{
                                color: '#cbd5e1',
                                fontSize: '0.95rem',
                                margin: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <Heart size={18} />
                                <span>
                                    기억하세요: 모든 전문가도 초보자로 시작했어요. AI와 함께면 당신도 충분합니다!
                                </span>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CanIDoIt;
