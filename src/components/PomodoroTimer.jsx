import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PomodoroTimer = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [completedSessions, setCompletedSessions] = useState(0);

    const handleSessionComplete = async () => {
        setIsRunning(false);

        if (!isBreak) {
            // 작업 세션 완료
            setCompletedSessions(prev => prev + 1);
            addToast('🎉 포모도로 완료! +5 P', 'success');

            // 포인트 지급
            if (user) {
                await supabase.rpc('add_points', {
                    p_user_id: user.id,
                    p_amount: 5,
                    p_description: '포모도로 세션 완료'
                });

                // 학습 시간 기록
                await supabase.from('study_sessions').insert({
                    user_id: user.id,
                    duration: 25,
                    session_type: 'pomodoro'
                });
            }

            setIsBreak(true);
            setTimeLeft(5 * 60); // 5분 휴식
        } else {
            // 휴식 완료
            addToast('휴식 완료! 다시 집중할 시간입니다', 'success');
            setIsBreak(false);
            setTimeLeft(25 * 60);
        }
    };

    useEffect(() => {
        let interval;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleSessionComplete();
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = isBreak
        ? ((5 * 60 - timeLeft) / (5 * 60)) * 100
        : ((25 * 60 - timeLeft) / (25 * 60)) * 100;

    return (
        <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.6))',
            borderRadius: '24px',
            padding: '40px',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Circle */}
            <div style={{
                position: 'absolute',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: isBreak
                    ? 'radial-gradient(circle, rgba(45, 212, 191, 0.1), transparent)'
                    : 'radial-gradient(circle, rgba(99, 102, 241, 0.1), transparent)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none'
            }} />

            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginBottom: '30px',
                position: 'relative'
            }}>
                {isBreak ? <Coffee size={24} color="#2dd4bf" /> : <Brain size={24} color="#6366f1" />}
                <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#e2e8f0', margin: 0 }}>
                    {isBreak ? '휴식 시간' : '집중 시간'}
                </h3>
            </div>

            {/* Timer Display */}
            <div style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                color: isBreak ? '#2dd4bf' : '#6366f1',
                marginBottom: '30px',
                fontFamily: 'monospace',
                position: 'relative'
            }}>
                {formatTime(timeLeft)}
            </div>

            {/* Progress Bar */}
            <div style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                marginBottom: '30px',
                overflow: 'hidden',
                position: 'relative'
            }}>
                <motion.div
                    animate={{ width: `${progress}%` }}
                    style={{
                        height: '100%',
                        background: isBreak
                            ? 'linear-gradient(90deg, #2dd4bf, #5eead4)'
                            : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                        borderRadius: '4px'
                    }}
                />
            </div>

            {/* Controls */}
            <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                marginBottom: '20px',
                position: 'relative'
            }}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsRunning(!isRunning)}
                    style={{
                        padding: '12px 24px',
                        background: isRunning ? '#ef4444' : '#22c55e',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {isRunning ? <Pause size={20} /> : <Play size={20} />}
                    {isRunning ? '일시정지' : '시작'}
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setIsRunning(false);
                        setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
                    }}
                    style={{
                        padding: '12px 24px',
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <RotateCcw size={20} />
                    리셋
                </motion.button>
            </div>

            {/* Sessions Counter */}
            <div style={{
                padding: '12px',
                background: 'rgba(250, 204, 21, 0.1)',
                border: '1px solid rgba(250, 204, 21, 0.3)',
                borderRadius: '12px',
                fontSize: '0.9rem',
                color: '#facc15',
                fontWeight: 'bold',
                position: 'relative'
            }}>
                오늘 완료한 세션: {completedSessions}개 (총 {completedSessions * 5} P 획득)
            </div>
        </div>
    );
};

export default PomodoroTimer;
