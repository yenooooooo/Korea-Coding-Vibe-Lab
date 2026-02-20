import React from 'react';
import { motion } from 'framer-motion';
import { Lock, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * 로그인 유도 오버레이
 * 읽기 허용 페이지에서 참여(글쓰기, 투표 등) 시 표시
 * 
 * 사용법:
 * {!user && <LoginPrompt message="출석 체크를 하려면 로그인하세요" />}
 * 
 * 또는 모달로:
 * <LoginPrompt isModal onClose={() => setShowPrompt(false)} />
 */
const LoginPrompt = ({ message = '이 기능을 사용하려면 로그인이 필요합니다', isModal = false, onClose }) => {
    const navigate = useNavigate();

    const content = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.1)',
                textAlign: 'center',
                maxWidth: '420px',
                width: '100%',
                backdropFilter: 'blur(20px)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Glow */}
            <div style={{
                position: 'absolute', top: '-40%', right: '-20%',
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* Lock Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                style={{
                    width: '80px', height: '80px',
                    borderRadius: '20px',
                    background: 'rgba(99, 102, 241, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px', position: 'relative'
                }}
            >
                <Lock size={36} color="#818cf8" />
            </motion.div>

            {/* Text */}
            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '12px', position: 'relative' }}>
                로그인이 필요합니다
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '28px', position: 'relative' }}>
                {message}
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', position: 'relative' }}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
                    }}
                >
                    <LogIn size={18} />
                    로그인
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/signup')}
                    style={{
                        padding: '12px 24px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#e2e8f0',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                    }}
                >
                    <UserPlus size={18} />
                    회원가입
                </motion.button>
            </div>
        </motion.div>
    );

    // 모달 모드
    if (isModal) {
        return (
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10000, padding: '20px'
                }}
            >
                <div onClick={(e) => e.stopPropagation()}>
                    {content}
                </div>
            </div>
        );
    }

    // 인라인 모드
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
            {content}
        </div>
    );
};

export default LoginPrompt;
