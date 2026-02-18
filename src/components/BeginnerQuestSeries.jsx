import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, ArrowRight, Zap, Award, Code2, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVibeLevel } from '../utils/vibeLevel';

const BeginnerQuestSeries = () => {
    const { user, profile } = useAuth();
    const [completedQuests, setCompletedQuests] = useState([]);

    // 입문자 퀘스트 5단계 시리즈
    const beginnerQuests = [
        {
            id: 'beginner_1',
            number: 1,
            emoji: '🧮',
            title: '계산기 만들기',
            description: 'AI에게 "계산기 만들어"라고 말하고, 완성된 계산기를 사용해보세요.',
            difficulty: '⭐ (매우 쉬움)',
            timeEstimate: '30분',
            reward: '50 XP + 🌱 입문자 배지',
            color: '#86efac',
            steps: [
                '프롬프트: "간단한 계산기를 만들어줘"',
                'AI가 생성한 코드 실행해보기',
                '실제 계산해보기 (예: 10 + 20)',
                '커뮤니티에 스크린샷 공유하기'
            ],
            locked: false
        },
        {
            id: 'beginner_2',
            number: 2,
            emoji: '✅',
            title: '할일 관리 앱 만들기',
            description: '자신의 할일을 관리할 수 있는 앱을 AI와 함께 만들어봅시다.',
            difficulty: '⭐⭐ (쉬움)',
            timeEstimate: '1-2시간',
            reward: '100 XP + 🌿 초보자 배지',
            color: '#fca5a5',
            steps: [
                '프롬프트: "할일 추가, 완료, 삭제 기능이 있는 앱 만들어줘"',
                'AI가 생성한 코드 실행',
                '직접 할일 추가해서 테스트',
                '완성한 앱 커뮤니티 공유'
            ],
            locked: false
        },
        {
            id: 'beginner_3',
            number: 3,
            emoji: '🎮',
            title: '숫자 맞추기 게임',
            description: '이번주 도전과제! 컴퓨터가 정한 숫자를 맞춰보세요.',
            difficulty: '⭐⭐ (쉬움)',
            timeEstimate: '1-2시간',
            reward: '150 XP + 🔥 이번주 도전 배지',
            color: '#60a5fa',
            steps: [
                '프롬프트: "숫자 맞추기 게임 만들어줘. 1-100 사이의 숫자를 맞춰야 해"',
                '생성된 게임 실행',
                '게임 플레이 해보기 (여러 번)',
                '스크린샷과 함께 "완료했습니다!" 공유'
            ],
            locked: false
        },
        {
            id: 'beginner_4',
            number: 4,
            emoji: '🌐',
            title: '간단한 웹페이지',
            description: '내 소개 페이지를 만들어 보세요. HTML도 AI가 도와줄 거예요.',
            difficulty: '⭐⭐⭐ (중간)',
            timeEstimate: '2-3시간',
            reward: '200 XP + ⚡ 발전자 배지',
            color: '#c084fc',
            steps: [
                '프롬프트: "내 소개 페이지를 만들어줘. 이름, 관심사, 좋아하는 것들을 표시해"',
                'AI가 생성한 HTML 코드 실행',
                '페이지 커스터마이징 (색상, 내용 수정)',
                '완성한 페이지 링크 공유'
            ],
            locked: false
        },
        {
            id: 'beginner_5',
            number: 5,
            emoji: '💡',
            title: '당신의 첫 아이디어',
            description: '지금까지 배운 것으로 "진짜 내가 만들고 싶던 것"을 만들어보세요!',
            difficulty: '⭐⭐⭐⭐ (자유)',
            timeEstimate: '3-7시간',
            reward: '300 XP + 👑 혁신가 배지 + 포트폴리오 스포트라이트',
            color: '#fbbf24',
            steps: [
                '당신이 정말 만들고 싶었던 것 생각하기',
                '프롬프트로 AI에게 요청하기',
                '완성되지 않은 부분 멘토와 함께 해결',
                '완성한 프로젝트 대대적으로 커뮤니티에 공유! 🎉'
            ],
            locked: false
        }
    ];

    // 현재 사용자의 레벨 계산
    const levelInfo = getVibeLevel(profile?.total_points || 0);
    const isBeginnerLevel = levelInfo.level <= 2;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {/* 헤더 */}
            <div style={{ marginBottom: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '2rem' }}>🎓</div>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0, marginBottom: '4px' }}>
                            Beginner Quest Series
                        </h2>
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                            5단계 도전으로 입문자에서 초보자까지! 각 단계마다 뱃지를 획득하세요.
                        </p>
                    </div>
                </div>

                {!user && (
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        color: '#818cf8'
                    }}>
                        로그인하면 진행 상황을 저장할 수 있습니다.
                    </div>
                )}
            </div>

            {/* 진행 바 */}
            {user && isBeginnerLevel && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'rgba(30, 41, 59, 0.3)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginBottom: '40px'
                    }}
                >
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '12px', margin: 0 }}>
                        당신의 입문자 여정 진행도
                    </p>
                    <div style={{
                        display: 'flex',
                        height: '8px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(completedQuests.length / 5) * 100}%` }}
                            transition={{ duration: 0.8 }}
                            style={{
                                background: 'linear-gradient(90deg, #86efac, #fbbf24)',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '12px 0 0', textAlign: 'right' }}>
                        {completedQuests.length} / 5 완료
                    </p>
                </motion.div>
            )}

            {/* 퀘스트 시리즈 */}
            <div style={{ display: 'grid', gap: '24px' }}>
                {beginnerQuests.map((quest, index) => (
                    <BeginnerQuestCard
                        key={quest.id}
                        quest={quest}
                        index={index}
                        isCompleted={completedQuests.includes(quest.id)}
                        totalQuests={beginnerQuests.length}
                    />
                ))}
            </div>

            {/* 완료 축하 섹션 */}
            {completedQuests.length === 5 && user && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(251, 191, 36, 0.1))',
                        border: '2px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '24px',
                        padding: '40px',
                        textAlign: 'center',
                        marginTop: '50px'
                    }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎉</div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                        축하합니다! 입문자 과정 완료!
                    </h3>
                    <p style={{ color: '#cbd5e1', fontSize: '1.05rem', marginBottom: '24px' }}>
                        당신은 이제 "바이브 코딩이 뭔지 아는 사람"에서<br />
                        "실제로 만들 수 있는 개발자"로 변모했습니다! 🚀
                    </p>
                    <Link to="/quest" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                padding: '14px 32px',
                                background: 'linear-gradient(135deg, #22c55e 0%, #84cc16 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
                            }}
                        >
                            다음 단계: 일반 퀘스트 도전하기
                        </motion.button>
                    </Link>
                </motion.div>
            )}
        </div>
    );
};

// 퀘스트 카드 컴포넌트
const BeginnerQuestCard = ({ quest, index, isCompleted, totalQuests }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
                background: isCompleted
                    ? 'linear-gradient(145deg, rgba(34, 197, 94, 0.1), transparent)'
                    : 'linear-gradient(145deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
                backdropFilter: 'blur(20px)',
                border: isCompleted
                    ? '2px solid rgba(34, 197, 94, 0.3)'
                    : `2px solid ${quest.color}40`,
                borderRadius: '20px',
                padding: '28px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* 배경 그래디언트 */}
            <div style={{
                position: 'absolute',
                top: '-30%',
                right: '-20%',
                width: '300px',
                height: '300px',
                background: `radial-gradient(circle, rgba(${quest.color === '#86efac' ? '134,239,172' : quest.color === '#fca5a5' ? '252,165,165' : quest.color === '#60a5fa' ? '96,165,250' : quest.color === '#c084fc' ? '192,132,252' : '251,191,36'}, 0.1), transparent 60%)`,
                pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* 헤더 */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '2.5rem' }}>{quest.emoji}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'white', margin: 0 }}>
                                    #{quest.number} {quest.title}
                                </h3>
                                {isCompleted && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{
                                            background: 'rgba(34, 197, 94, 0.2)',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                    >
                                        <CheckCircle size={16} color="#22c55e" />
                                        <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: '600' }}>
                                            완료
                                        </span>
                                    </motion.div>
                                )}
                            </div>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                                {quest.description}
                            </p>
                        </div>
                    </div>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: `${quest.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                        <ArrowRight size={20} color={quest.color} style={{ transform: 'rotate(-90deg)' }} />
                    </div>
                </div>

                {/* 정보 카드 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    <InfoBadge label="난이도" value={quest.difficulty} icon="📊" />
                    <InfoBadge label="예상 시간" value={quest.timeEstimate} icon="⏱️" />
                    <InfoBadge label="보상" value={quest.reward} icon="🏆" />
                </div>

                {/* 상세 단계 (확장시 보임) */}
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{
                            background: 'rgba(0,0,0,0.2)',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '20px'
                        }}
                    >
                        <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: '600', marginBottom: '12px', margin: 0 }}>
                            📋 단계별 가이드
                        </h4>
                        <ol style={{ color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                            {quest.steps.map((step, i) => (
                                <li key={i} style={{ marginBottom: '8px' }}>
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </motion.div>
                )}

                {/* 액션 버튼 */}
                {!isCompleted && (
                    <Link to="/quest" style={{ textDecoration: 'none' }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: `${quest.color}20`,
                                border: `2px solid ${quest.color}40`,
                                borderRadius: '10px',
                                color: quest.color,
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Zap size={16} />
                            시작하기
                        </motion.button>
                    </Link>
                )}
            </div>
        </motion.div>
    );
};

// 정보 배지 컴포넌트
const InfoBadge = ({ label, value, icon }) => (
    <div style={{
        background: 'rgba(0,0,0,0.2)',
        padding: '12px',
        borderRadius: '10px',
        textAlign: 'center'
    }}>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 4px' }}>
            {icon} {label}
        </p>
        <p style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: '600', margin: 0 }}>
            {value}
        </p>
    </div>
);

export default BeginnerQuestSeries;
