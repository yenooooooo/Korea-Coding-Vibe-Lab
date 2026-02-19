import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Gem } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { sendNotification } from '../lib/notifications';
import { getCurrentSeason } from '../utils/seasonPass';

const SeasonPassSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [status, setStatus] = useState('처리 중...');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const processPayment = async () => {
            if (!user) return;

            const searchParams = new URLSearchParams(location.search);
            const paymentKey = searchParams.get('paymentKey');
            const orderId = searchParams.get('orderId');
            const amount = searchParams.get('amount');

            if (!paymentKey || !orderId || !amount) {
                setStatus('유효하지 않은 결제 정보입니다.');
                setTimeout(() => navigate('/season-pass'), 3000);
                return;
            }

            try {
                // 1. user_season_progress 테이블 업데이트 (is_premium = true)
                const season = getCurrentSeason();
                const { error: updateError } = await supabase
                    .from('user_season_progress')
                    .update({ is_premium: true })
                    .eq('user_id', user.id)
                    .eq('season_key', season.key);

                if (updateError) throw updateError;

                // 2. 프리미엄 패스 구매 알림 발송 (UUID 인지 확인 후 전송 시도)
                if (user.id && user.id.length === 36) {
                    await sendNotification(
                        user.id,
                        'SYSTEM',
                        `💎 프리미엄 패스 구매가 완료되었습니다! 이제 모든 프리미엄 보상을 받을 수 있습니다.`,
                        '/season-pass'
                    ).catch(err => console.warn('알림 전송 실패 무시:', err));
                }

                setStatus('프리미엄 패스 업그레이드 완료!');
                setIsSuccess(true);

                // 3. 약간 대기 후 시즌 패스 페이지로 이동
                setTimeout(() => {
                    navigate('/season-pass', { replace: true });
                }, 3000);

            } catch (error) {
                console.error('프리미엄 패스 처리 오류:', error);
                setStatus('결제 확인 중 오류가 발생했습니다. 관리자에게 문의해주세요.');
            }
        };

        processPayment();
    }, [user, location, navigate]);

    return (
        <div style={{
            minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', color: '#fff'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(250, 204, 21, 0.2)',
                    borderRadius: '24px',
                    padding: '48px 40px',
                    textAlign: 'center',
                    maxWidth: '480px',
                    width: '100%',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 40px rgba(250, 204, 21, 0.1)'
                }}
            >
                {isSuccess ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                    >
                        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                                style={{
                                    position: 'absolute', inset: '-20px',
                                    background: 'conic-gradient(from 0deg, transparent, rgba(250, 204, 21, 0.4), transparent)',
                                    borderRadius: '50%', zIndex: 0
                                }}
                            />
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                position: 'relative', zIndex: 1,
                                boxShadow: '0 0 30px rgba(250, 204, 21, 0.5)'
                            }}>
                                <Gem size={40} color="#fff" />
                            </div>
                        </div>
                        <h1 style={{
                            margin: '0 0 16px', fontSize: '1.8rem', fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                        }}>
                            결제 성공!
                        </h1>
                    </motion.div>
                ) : (
                    <div style={{ marginBottom: '24px' }}>
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            style={{ display: 'inline-block' }}
                        >
                            <Sparkles size={48} color="#a855f7" />
                        </motion.div>
                    </div>
                )}

                <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: '0 0 32px', lineHeight: '1.6' }}>
                    {status}
                </p>

                {isSuccess && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}
                    >
                        잠시 후 시즌 패스 화면으로 자동 이동합니다...
                    </motion.p>
                )}
            </motion.div>
        </div>
    );
};

export default SeasonPassSuccess;
