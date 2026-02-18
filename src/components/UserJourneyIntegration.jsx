import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProgressMap from './ProgressMap';
import BeginnerQuestSeries from './BeginnerQuestSeries';

/**
 * UserJourneyIntegration 컴포넌트
 * 프로필에서 사용자의 입문자 여정과 퀘스트를 통합 표시합니다
 * - 현재 레벨 (ProgressMap)
 * - 입문자 퀘스트 (BeginnerQuestSeries)
 * - 탭으로 섹션 구분
 */
const UserJourneyIntegration = ({ userPoints = 0, userStreak = 0, userId }) => {
    const [activeTab, setActiveTab] = useState('progress');

    const tabs = [
        { id: 'progress', name: '🎯 내 여정', description: '바이브 코딩 성장 경로' },
        { id: 'quests', name: '✅ 입문자 퀘스트', description: '단계별 도전 과제' }
    ];

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 20px'
        }}>
            {/* 섹션 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    marginBottom: '32px',
                    textAlign: 'center'
                }}
            >
                <h2 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: '0 0 8px 0'
                }}>
                    당신의 성장 여정 🚀
                </h2>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '0.95rem',
                    margin: 0
                }}>
                    바이브 코딩 커뮤니티에서의 성장을 한눈에 확인하세요
                </p>
            </motion.div>

            {/* 탭 네비게이션 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '32px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: '16px'
                }}
            >
                {tabs.map(tab => (
                    <motion.button
                        key={tab.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 20px',
                            background: activeTab === tab.id
                                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                : 'transparent',
                            border: activeTab === tab.id
                                ? 'none'
                                : '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '10px',
                            color: activeTab === tab.id ? 'white' : '#818cf8',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: '4px'
                        }}
                    >
                        <span>{tab.name}</span>
                        <span style={{
                            fontSize: '0.75rem',
                            fontWeight: '400',
                            color: activeTab === tab.id ? 'rgba(255,255,255,0.7)' : '#94a3b8'
                        }}>
                            {tab.description}
                        </span>
                    </motion.button>
                ))}
            </motion.div>

            {/* 콘텐츠 */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{
                    marginBottom: '60px'
                }}
            >
                {activeTab === 'progress' && (
                    <ProgressMap userPoints={userPoints} userStreak={userStreak} />
                )}
                {activeTab === 'quests' && (
                    <BeginnerQuestSeries userPoints={userPoints} userId={userId} />
                )}
            </motion.div>

            {/* 격려 메시지 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{
                    background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.05))',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '60px',
                    textAlign: 'center'
                }}
            >
                <p style={{
                    color: '#cbd5e1',
                    fontSize: '1rem',
                    margin: 0,
                    lineHeight: '1.6'
                }}>
                    ✨ 매일 도전하고, 작은 성공들이 모여 큰 성장이 됩니다.<br />
                    당신의 바이브 코딩 여정을 응원합니다! 💪
                </p>
            </motion.div>
        </div>
    );
};

export default UserJourneyIntegration;
