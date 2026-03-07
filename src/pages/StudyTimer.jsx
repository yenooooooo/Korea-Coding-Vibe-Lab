import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Award } from 'lucide-react';
import PomodoroTimer from '../components/PomodoroTimer';

const StudyTimer = () => {
    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '100px', color: '#fff' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '40px' }}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                }}>
                    <Clock size={40} color="#6366f1" />
                    <span style={{
                        background: 'linear-gradient(to right, #6366f1, #8b5cf6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        스터디 타이머
                    </span>
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                    포모도로 기법으로 집중력을 높이고 포인트를 획득하세요
                </p>
            </motion.div>

            {/* Pomodoro Timer */}
            <PomodoroTimer />

            {/* Info Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
                gap: '20px',
                marginTop: '40px'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '16px',
                        padding: '20px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <Clock size={20} color="#6366f1" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e2e8f0' }}>
                            포모도로란?
                        </h3>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        25분 집중 + 5분 휴식을 반복하는 시간 관리 기법입니다.
                        짧은 집중 시간으로 생산성을 극대화합니다.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '16px',
                        padding: '20px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <Award size={20} color="#22c55e" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e2e8f0' }}>
                            보상 시스템
                        </h3>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        세션을 완료할 때마다 5 포인트를 획득합니다.
                        꾸준히 학습하고 레벨업하세요!
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        background: 'rgba(139, 92, 246, 0.1)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '16px',
                        padding: '20px'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <TrendingUp size={20} color="#8b5cf6" />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e2e8f0' }}>
                            학습 기록
                        </h3>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        모든 학습 세션이 자동으로 기록됩니다.
                        프로필에서 학습 통계를 확인하세요.
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default StudyTimer;
