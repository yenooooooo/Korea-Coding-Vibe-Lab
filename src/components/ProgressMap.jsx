import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, Star, Zap, Trophy } from 'lucide-react';
import { getVibeLevel } from '../utils/vibeLevel';

/**
 * ProgressMap 컴포넌트
 * 사용자의 바이브 코딩 여정을 시각화합니다
 * - 입문자 단계
 * - 초보자 단계
 * - 중급자 단계
 * - 고급자 단계 (선택사항)
 */
const ProgressMap = ({ userPoints = 0, userStreak = 0 }) => {
    const levelInfo = getVibeLevel(userPoints);

    // 단계별 진행도 정의
    const stages = [
        {
            name: '입문자',
            emoji: '🌱',
            minPoints: 0,
            maxPoints: 100,
            color: '#86efac',
            icon: '🌱',
            achievements: [
                { id: 'join', name: '가입 완료', emoji: '👋', unlocked: userPoints >= 0 },
                { id: 'first_quest', name: '첫 퀘스트 완료', emoji: '✅', unlocked: userPoints >= 10 },
                { id: 'beginner_series', name: 'Beginner 시리즈', emoji: '🎓', unlocked: userPoints >= 50 },
                { id: 'community_join', name: '커뮤니티 참여', emoji: '👥', unlocked: userPoints >= 75 }
            ],
            description: '바이브 코딩의 첫 걸음을 시작했어요!'
        },
        {
            name: '초보자',
            emoji: '🔥',
            minPoints: 101,
            maxPoints: 500,
            color: '#fca5a5',
            icon: '🔥',
            achievements: [
                { id: 'first_project', name: '첫 프로젝트 완성', emoji: '🎯', unlocked: userPoints >= 150 },
                { id: 'weekly_challenge', name: '주간 도전 완료', emoji: '🏆', unlocked: userPoints >= 250 },
                { id: 'streak_7', name: '7일 연속', emoji: '🔥', unlocked: userStreak >= 7 },
                { id: 'mentor_connect', name: '멘토 연결', emoji: '🎓', unlocked: userPoints >= 400 }
            ],
            description: '이제 실제로 무언가를 만들 수 있어요!'
        },
        {
            name: '중급자',
            emoji: '⚡',
            minPoints: 501,
            maxPoints: 1500,
            color: '#60a5fa',
            icon: '⚡',
            achievements: [
                { id: 'advanced_project', name: '심화 프로젝트', emoji: '🚀', unlocked: userPoints >= 700 },
                { id: 'mentor_others', name: '다른 사람 멘토링', emoji: '👨‍🏫', unlocked: userPoints >= 1000 },
                { id: 'streak_30', name: '30일 연속', emoji: '💪', unlocked: userStreak >= 30 },
                { id: 'portfolio', name: '포트폴리오 완성', emoji: '📁', unlocked: userPoints >= 1200 }
            ],
            description: '이제 당신은 진정한 개발자예요!'
        },
        {
            name: '전문가',
            emoji: '👑',
            minPoints: 1501,
            maxPoints: 5000,
            color: '#fbbf24',
            icon: '👑',
            achievements: [
                { id: 'expert_project', name: '전문 프로젝트', emoji: '💎', unlocked: userPoints >= 2000 },
                { id: 'mentor_master', name: '멘토 마스터', emoji: '🧑‍🎓', unlocked: userPoints >= 2500 },
                { id: 'streak_100', name: '100일 연속', emoji: '🌟', unlocked: userStreak >= 100 },
                { id: 'legend', name: '바이브 레전드', emoji: '🏅', unlocked: userPoints >= 4000 }
            ],
            description: '당신은 바이브 코딩 커뮤니티의 전설이 되었어요!'
        }
    ];

    // 현재 단계 찾기
    const currentStageIndex = stages.findIndex(
        stage => userPoints >= stage.minPoints && userPoints <= stage.maxPoints
    );
    const currentStage = stages[currentStageIndex] || stages[0];

    // 다음 단계까지의 진행도
    const progressPercent = Math.min(
        ((userPoints - currentStage.minPoints) / (currentStage.maxPoints - currentStage.minPoints)) * 100,
        100
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {/* 헤더 */}
            <div style={{ marginBottom: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '2.5rem' }}>🗺️</div>
                    <div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', margin: 0, marginBottom: '4px' }}>
                            당신의 바이브 코딩 여정
                        </h2>
                        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                            입문자에서 전문가까지, 단계별 성장을 확인하세요
                        </p>
                    </div>
                </div>
            </div>

            {/* 현재 단계 강조 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: `linear-gradient(145deg, rgba(${currentStage.color === '#86efac' ? '134,239,172' : currentStage.color === '#fca5a5' ? '252,165,165' : currentStage.color === '#60a5fa' ? '96,165,250' : '251,191,36'}, 0.15), transparent)`,
                    border: `2px solid ${currentStage.color}60`,
                    borderRadius: '24px',
                    padding: '32px',
                    marginBottom: '50px',
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
                    background: `radial-gradient(circle, ${currentStage.color}20, transparent 60%)`,
                    pointerEvents: 'none'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                        <div style={{ fontSize: '4rem' }}>{currentStage.emoji}</div>
                        <div>
                            <h3 style={{
                                fontSize: '1.8rem',
                                fontWeight: '700',
                                color: 'white',
                                margin: 0,
                                marginBottom: '4px'
                            }}>
                                {currentStage.name}
                            </h3>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
                                {currentStage.description}
                            </p>
                        </div>
                    </div>

                    {/* 진행도 바 */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>
                                {currentStage.minPoints}pt → {currentStage.maxPoints}pt
                            </p>
                            <p style={{ color: currentStage.color, fontWeight: '600', fontSize: '0.9rem', margin: 0 }}>
                                {Math.round(progressPercent)}%
                            </p>
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
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                style={{
                                    height: '100%',
                                    background: `linear-gradient(90deg, ${currentStage.color}, ${currentStage.color}80)`,
                                    borderRadius: '6px',
                                    boxShadow: `0 0 12px ${currentStage.color}80`
                                }}
                            />
                        </div>
                    </div>

                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                        {currentStage.maxPoints - userPoints}pt 남았어요! 계속 도전해보세요! 💪
                    </p>
                </div>
            </motion.div>

            {/* 전체 여정 타임라인 */}
            <div style={{ marginBottom: '50px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'white', marginBottom: '24px' }}>
                    🎯 전체 여정
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '20px'
                }}>
                    {stages.map((stage, index) => (
                        <motion.div
                            key={stage.name}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={index === currentStageIndex ? { scale: 1.05 } : {}}
                            style={{
                                background: index === currentStageIndex
                                    ? `linear-gradient(145deg, rgba(${stage.color === '#86efac' ? '134,239,172' : stage.color === '#fca5a5' ? '252,165,165' : stage.color === '#60a5fa' ? '96,165,250' : '251,191,36'}, 0.2), transparent)`
                                    : 'rgba(30, 41, 59, 0.3)',
                                border: index === currentStageIndex
                                    ? `2px solid ${stage.color}60`
                                    : '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                padding: '20px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                position: 'relative'
                            }}
                        >
                            {/* 현재 단계 표시 */}
                            {index === currentStageIndex && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    style={{
                                        position: 'absolute',
                                        top: '-12px',
                                        right: '12px',
                                        background: stage.color,
                                        color: '#000',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    현재 위치
                                </motion.div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '2rem' }}>{stage.emoji}</div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'white', margin: 0 }}>
                                    {stage.name}
                                </h4>
                            </div>

                            <p style={{
                                color: '#94a3b8',
                                fontSize: '0.8rem',
                                marginBottom: '12px',
                                margin: 0
                            }}>
                                {stage.minPoints}pt - {stage.maxPoints}pt
                            </p>

                            {/* 상태 표시 */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: index <= currentStageIndex ? stage.color : '#64748b'
                            }}>
                                {index <= currentStageIndex ? (
                                    <>
                                        <CheckCircle size={16} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                                            {index === currentStageIndex ? '진행 중' : '완료'}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={16} />
                                        <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                                            잠김
                                        </span>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 업적 섹션 */}
            <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'white', marginBottom: '24px' }}>
                    🏆 업적
                </h3>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
                    gap: '16px'
                }}>
                    {currentStage.achievements.map((achievement, i) => (
                        <motion.div
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                            style={{
                                background: achievement.unlocked
                                    ? `linear-gradient(145deg, rgba(${currentStage.color === '#86efac' ? '134,239,172' : currentStage.color === '#fca5a5' ? '252,165,165' : currentStage.color === '#60a5fa' ? '96,165,250' : '251,191,36'}, 0.1), transparent)`
                                    : 'rgba(30, 41, 59, 0.3)',
                                border: achievement.unlocked
                                    ? `1px solid ${currentStage.color}40`
                                    : '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '12px',
                                padding: '16px',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden',
                                opacity: achievement.unlocked ? 1 : 0.6
                            }}
                        >
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>
                                {achievement.emoji}
                            </div>
                            <p style={{
                                color: achievement.unlocked ? '#cbd5e1' : '#64748b',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                margin: 0
                            }}>
                                {achievement.name}
                            </p>
                            {!achievement.unlocked && (
                                <p style={{
                                    color: '#64748b',
                                    fontSize: '0.75rem',
                                    marginTop: '8px',
                                    margin: 0
                                }}>
                                    🔒 잠금
                                </p>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProgressMap;
