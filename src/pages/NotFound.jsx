import React from 'react';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '80vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            padding: '40px 20px', position: 'relative', overflow: 'hidden',
        }}>
            {/* 배경 별 파티클 */}
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                    style={{
                        position: 'absolute',
                        width: `${2 + Math.random() * 3}px`, height: `${2 + Math.random() * 3}px`,
                        background: '#fff', borderRadius: '50%',
                        top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                        pointerEvents: 'none',
                    }}
                />
            ))}

            {/* 떠다니는 우주선 */}
            <motion.div
                animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: '80px', marginBottom: '32px' }}
            >
                🚀
            </motion.div>

            {/* 404 숫자 */}
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
                style={{
                    fontSize: '120px', fontWeight: '900',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    lineHeight: '1', marginBottom: '16px',
                    textShadow: '0 0 80px rgba(99, 102, 241, 0.3)',
                }}
            >
                404
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff', marginBottom: '12px' }}
            >
                페이지를 찾을 수 없습니다
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '480px', lineHeight: '1.6', marginBottom: '40px' }}
            >
                이 페이지는 우주 어딘가로 사라졌어요... 🌌<br />
                주소를 확인하거나 홈으로 돌아가주세요!
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}
            >
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    style={{
                        padding: '14px 32px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        border: 'none', borderRadius: '14px', color: '#fff',
                        fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                >
                    <Home size={20} /> 홈으로 돌아가기
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '14px 32px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                        color: '#cbd5e1', fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                    }}
                >
                    <ArrowLeft size={20} /> 이전 페이지
                </motion.button>
            </motion.div>

            {/* 하단 팁 */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                style={{
                    marginTop: '60px', padding: '16px 24px',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    borderRadius: '12px', color: '#94a3b8', fontSize: '0.9rem',
                    display: 'flex', alignItems: 'center', gap: '10px',
                }}
            >
                <Rocket size={18} color="#6366f1" />
                <span>Tip: <strong style={{ color: '#a78bfa' }}>Ctrl+K</strong>를 눌러 빠르게 원하는 페이지를 검색해보세요!</span>
            </motion.div>
        </div>
    );
};

export default NotFound;
