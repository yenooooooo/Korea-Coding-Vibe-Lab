import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle, Trophy, Flame, Star, Calendar, Code, Bug, Brain, Coffee } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// 일일 챌린지 풀 (매일 랜덤)
const CHALLENGE_POOL = [
    {
        id: 'code_review',
        title: '코드 리뷰어',
        description: '다른 사람의 코드를 1개 리뷰하세요',
        icon: <Code size={24} color="#60a5fa" />,
        reward: 30,
        type: 'community'
    },
    {
        id: 'debug_session',
        title: '버그 헌터',
        description: '디버깅 포럼에 1개 답변하세요',
        icon: <Bug size={24} color="#ef4444" />,
        reward: 25,
        type: 'community'
    },
    {
        id: 'learn_new',
        title: '지식 탐험가',
        description: '새로운 학습 자료를 1개 북마크하세요',
        icon: <Brain size={24} color="#a855f7" />,
        reward: 20,
        type: 'learning'
    },
    {
        id: 'streak_maintain',
        title: '꾸준함의 힘',
        description: '오늘도 출석 체크!',
        icon: <Flame size={24} color="#f97316" />,
        reward: 15,
        type: 'attendance'
    },
    {
        id: 'help_others',
        title: '멘토 되기',
        description: '질문 게시판에 1개 답변하세요',
        icon: <Coffee size={24} color="#2dd4bf" />,
        reward: 35,
        type: 'community'
    }
];

const DailyChallenge = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [todayChallenge, setTodayChallenge] = useState(null);
    const [completed, setCompleted] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadDailyChallenge();
        }
    }, [user]);

    const loadDailyChallenge = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];

            // 오늘의 챌린지 확인
            const { data: existingChallenge } = await supabase
                .from('daily_challenges')
                .select('*')
                .eq('user_id', user.id)
                .eq('challenge_date', today)
                .maybeSingle();

            if (existingChallenge) {
                const challengeData = CHALLENGE_POOL.find(c => c.id === existingChallenge.challenge_id);
                setTodayChallenge({ ...challengeData, ...existingChallenge });
                setCompleted(existingChallenge.completed);
            } else {
                // 새로운 챌린지 생성
                const randomIndex = Math.floor(Math.random() * CHALLENGE_POOL.length);
                const selectedChallenge = CHALLENGE_POOL[randomIndex];

                const { data: newChallenge, error } = await supabase
                    .from('daily_challenges')
                    .insert({
                        user_id: user.id,
                        challenge_id: selectedChallenge.id,
                        challenge_date: today,
                        completed: false
                    })
                    .select()
                    .single();

                if (error) throw error;
                setTodayChallenge({ ...selectedChallenge, ...newChallenge });
                setCompleted(false);
            }
        } catch (error) {
            console.error('Error loading daily challenge:', error);
        } finally {
            setLoading(false);
        }
    };

    const completeChallenge = async () => {
        if (!todayChallenge || completed) return;

        try {
            // 챌린지 완료 처리
            const { error: updateError } = await supabase
                .from('daily_challenges')
                .update({ completed: true })
                .eq('id', todayChallenge.id);

            if (updateError) throw updateError;

            // 포인트 지급
            const { error: pointError } = await supabase.rpc('add_points', {
                p_user_id: user.id,
                p_amount: todayChallenge.reward,
                p_description: `일일 챌린지 완료: ${todayChallenge.title}`
            });

            if (pointError) throw pointError;

            setCompleted(true);
            addToast(`🎉 챌린지 완료! +${todayChallenge.reward} P`, 'success');
        } catch (error) {
            console.error('Error completing challenge:', error);
            addToast('오류가 발생했습니다', 'error');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                로딩 중...
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px', color: '#fff' }}>
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
                    <Target size={40} color="#facc15" />
                    <span style={{
                        background: 'linear-gradient(to right, #facc15, #f97316)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        오늘의 챌린지
                    </span>
                </h1>
                <p style={{ color: '#94a3b8' }}>매일 새로운 도전으로 성장하세요</p>
            </motion.div>

            {/* Today's Challenge Card */}
            {todayChallenge && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.6))',
                        borderRadius: '24px',
                        padding: '40px',
                        border: completed ? '2px solid #22c55e' : '2px solid rgba(250, 204, 21, 0.3)',
                        boxShadow: completed ? '0 0 40px rgba(34, 197, 94, 0.3)' : '0 0 40px rgba(250, 204, 21, 0.2)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* Background Glow */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-30%',
                        width: '200%',
                        height: '200%',
                        background: completed
                            ? 'radial-gradient(circle, rgba(34, 197, 94, 0.15), transparent 70%)'
                            : 'radial-gradient(circle, rgba(250, 204, 21, 0.15), transparent 70%)',
                        pointerEvents: 'none'
                    }} />

                    {/* Icon */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: completed ? 'rgba(34, 197, 94, 0.2)' : 'rgba(250, 204, 21, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px',
                        position: 'relative'
                    }}>
                        {completed ? <CheckCircle size={40} color="#22c55e" /> : todayChallenge.icon}
                    </div>

                    {/* Content */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '12px'
                        }}>
                            <span style={{
                                padding: '6px 12px',
                                background: 'rgba(99, 102, 241, 0.2)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                color: '#818cf8',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                {todayChallenge.type}
                            </span>
                            <span style={{
                                padding: '6px 12px',
                                background: 'rgba(250, 204, 21, 0.2)',
                                border: '1px solid rgba(250, 204, 21, 0.3)',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                color: '#facc15',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <Star size={12} fill="#facc15" />
                                +{todayChallenge.reward} P
                            </span>
                        </div>

                        <h2 style={{
                            fontSize: '1.8rem',
                            fontWeight: 'bold',
                            color: '#e2e8f0',
                            marginBottom: '12px'
                        }}>
                            {todayChallenge.title}
                        </h2>

                        <p style={{
                            fontSize: '1.1rem',
                            color: '#94a3b8',
                            lineHeight: '1.6',
                            marginBottom: '32px'
                        }}>
                            {todayChallenge.description}
                        </p>

                        {!completed ? (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={completeChallenge}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    background: 'linear-gradient(135deg, #facc15, #f97316)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: '#000',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(250, 204, 21, 0.4)'
                                }}
                            >
                                챌린지 완료하기 🎯
                            </motion.button>
                        ) : (
                            <div style={{
                                padding: '20px',
                                background: 'rgba(34, 197, 94, 0.2)',
                                border: '1px solid #22c55e',
                                borderRadius: '12px',
                                textAlign: 'center'
                            }}>
                                <CheckCircle size={48} color="#22c55e" style={{ margin: '0 auto 12px' }} />
                                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#22c55e', marginBottom: '6px' }}>
                                    완료! 🎉
                                </h3>
                                <p style={{ color: '#86efac', fontSize: '0.9rem' }}>
                                    내일도 새로운 챌린지가 기다립니다!
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Info */}
            <div style={{
                marginTop: '30px',
                padding: '20px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '16px',
                fontSize: '0.9rem',
                color: '#93c5fd',
                lineHeight: '1.6'
            }}>
                <strong style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Trophy size={16} />
                    챌린지 안내
                </strong>
                • 매일 자정에 새로운 챌린지가 생성됩니다<br />
                • 완료 시 보너스 포인트를 획득합니다<br />
                • 연속으로 완료하면 추가 보상이 있습니다
            </div>
        </div>
    );
};

export default DailyChallenge;
