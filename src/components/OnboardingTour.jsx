import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles, Home, Calendar, Target, Users, Rocket } from 'lucide-react';

const steps = [
    {
        title: '환영합니다! 🎉',
        description: 'Korea Coding Vibe Lab에 오신 것을 환영합니다!\nAI와 함께 코딩을 배우는 가장 재밌는 방법이에요.',
        icon: <Sparkles size={40} />,
        color: '#6366f1',
        tip: '이 투어는 1분이면 끝나요!',
    },
    {
        title: '사이드바 탐색하기 📋',
        description: '왼쪽 사이드바에서 다양한 기능을 찾아볼 수 있어요.\n배틀, 퀘스트, 상점, 스터디 등 30개 이상의 기능이 준비되어 있습니다.',
        icon: <Home size={40} />,
        color: '#10b981',
        tip: 'Ctrl+K로 원하는 페이지를 빠르게 검색해보세요!',
    },
    {
        title: '매일 출석 체크인 📅',
        description: '출석 페이지에서 매일 체크인하면 포인트와 스트릭 보너스를 받을 수 있어요.\n연속 출석할수록 보상이 커집니다!',
        icon: <Calendar size={40} />,
        color: '#f59e0b',
        tip: '7일 연속 출석하면 특별 보너스!',
    },
    {
        title: '퀘스트를 완료하세요 🎯',
        description: '다양한 퀘스트를 완료하고 포인트를 모으세요.\n포인트로 상점에서 아이템을 구매할 수 있어요.',
        icon: <Target size={40} />,
        color: '#ec4899',
        tip: '매주 새로운 챌린지가 추가됩니다!',
    },
    {
        title: '커뮤니티와 함께 성장 🚀',
        description: '친구를 추가하고, 스터디 그룹에 참여하고,\n배틀 아레나에서 실력을 겨뤄보세요!\n\n준비되셨나요? 함께 시작해볼까요!',
        icon: <Rocket size={40} />,
        color: '#8b5cf6',
        tip: '멘토에게 질문하면 더 빠르게 성장해요!',
    },
];

const OnboardingTour = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('kcvl_onboarding_done');
        if (!hasSeenTour) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('kcvl_onboarding_done', 'true');
    };

    if (!isVisible) return null;

    const step = steps[currentStep];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 10000,
                    background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
            >
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    transition={{ type: 'spring', bounce: 0.3 }}
                    style={{
                        width: '480px', maxWidth: '90vw',
                        background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                        border: `2px solid ${step.color}40`,
                        borderRadius: '24px', padding: '40px',
                        boxShadow: `0 25px 60px rgba(0,0,0,0.5), 0 0 80px ${step.color}15`,
                        textAlign: 'center', position: 'relative',
                    }}
                >
                    {/* 닫기 버튼 */}
                    <button
                        onClick={handleClose}
                        style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: 'rgba(255,255,255,0.05)', border: 'none',
                            borderRadius: '10px', padding: '8px', cursor: 'pointer',
                            color: '#64748b', display: 'flex',
                        }}
                    >
                        <X size={18} />
                    </button>

                    {/* 프로그레스 */}
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '28px' }}>
                        {steps.map((_, i) => (
                            <div key={i} style={{
                                width: i === currentStep ? '28px' : '8px', height: '8px',
                                borderRadius: '4px', transition: 'all 0.3s',
                                background: i <= currentStep ? step.color : 'rgba(255,255,255,0.1)',
                            }} />
                        ))}
                    </div>

                    {/* 아이콘 */}
                    <motion.div
                        animate={{ y: [-4, 4, -4] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            width: '80px', height: '80px', borderRadius: '24px',
                            background: `${step.color}15`, border: `2px solid ${step.color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px', color: step.color,
                        }}
                    >
                        {step.icon}
                    </motion.div>

                    {/* 제목 */}
                    <h2 style={{
                        fontSize: '1.5rem', fontWeight: '800', color: '#fff',
                        marginBottom: '16px',
                    }}>
                        {step.title}
                    </h2>

                    {/* 설명 */}
                    <p style={{
                        color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.7',
                        marginBottom: '20px', whiteSpace: 'pre-line',
                    }}>
                        {step.description}
                    </p>

                    {/* 팁 */}
                    <div style={{
                        padding: '12px 16px', borderRadius: '12px',
                        background: `${step.color}10`, border: `1px solid ${step.color}20`,
                        color: step.color, fontSize: '0.85rem', fontWeight: '600',
                        marginBottom: '28px',
                    }}>
                        💡 {step.tip}
                    </div>

                    {/* 버튼 */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                            onClick={handleClose}
                            style={{
                                padding: '12px 24px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: '#94a3b8', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem',
                            }}
                        >
                            건너뛰기
                        </button>
                        <motion.button
                            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                            onClick={handleNext}
                            style={{
                                padding: '12px 32px', borderRadius: '12px',
                                background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`,
                                border: 'none', color: '#fff', fontWeight: '700', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem',
                            }}
                        >
                            {currentStep < steps.length - 1 ? (<>다음 <ArrowRight size={18} /></>) : '시작하기! 🚀'}
                        </motion.button>
                    </div>

                    {/* 단계 표시 */}
                    <div style={{ marginTop: '16px', color: '#475569', fontSize: '0.8rem' }}>
                        {currentStep + 1} / {steps.length}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OnboardingTour;
