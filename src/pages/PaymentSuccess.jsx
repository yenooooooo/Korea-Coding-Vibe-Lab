import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sendNotification } from '../lib/notifications';
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const PaymentSuccess = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [sessionData, setSessionData] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        processPaymentSuccess();
    }, [searchParams]);

    const processPaymentSuccess = async () => {
        try {
            setLoading(true);

            const orderId = searchParams.get('orderId');
            const paymentKey = searchParams.get('paymentKey');
            const amount = searchParams.get('amount');

            if (!orderId || !paymentKey || !amount) {
                throw new Error('결제 정보가 없습니다');
            }

            // orderId에서 session ID 추출 (형식: ORDER_SESSION_ID_8자_TIMESTAMP)
            const sessionId = orderId.split('_')[1]; // 실제로는 더 복잡한 파싱이 필요할 수 있음

            // mentor_sessions 조회
            const { data: sessions, error: sessionError } = await supabase
                .from('mentor_sessions')
                .select('*, mentors(*)')
                .eq('id', sessionId)
                .single();

            if (sessionError) throw sessionError;
            setSessionData(sessions);

            // mentor_payments 생성
            const { data: payment, error: paymentError } = await supabase
                .from('mentor_payments')
                .insert({
                    session_id: sessionId,
                    student_id: user.id,
                    mentor_id: sessions.mentor_id,
                    amount: parseInt(amount),
                    currency: 'KRW',
                    status: 'completed',
                    payment_method: 'card',
                    transaction_id: paymentKey
                })
                .select()
                .single();

            if (paymentError) throw paymentError;
            setPaymentData(payment);

            // mentor_sessions 상태 업데이트
            const { error: updateError } = await supabase
                .from('mentor_sessions')
                .update({ status: 'paid' })
                .eq('id', sessionId);

            if (updateError) throw updateError;

            addToast('결제가 완료되었습니다! 🎉', 'success');

            // 멘토에게 결제 완료 알림
            const studentName = user?.user_metadata?.username || '학생';
            sendNotification(
                sessions.mentor_id,
                'PAYMENT_COMPLETE',
                `💰 ${studentName}님이 수업 결제를 완료했습니다! (₩${parseInt(amount).toLocaleString()})`,
                '/mentor-profile-setup'
            );
        } catch (error) {
            console.error('Payment success processing error:', error);
            addToast(`처리 중 오류: ${error.message}`, 'error');
            // 일부러 fail 페이지로 안 보냄 - 사용자가 결과를 알 수 있도록
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ color: '#fff', textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
                <p style={{ marginTop: '20px' }}>결제 처리 중...</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', color: '#fff', paddingBottom: '60px' }}>
            {/* 성공 헤더 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    padding: '60px 40px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))',
                    borderRadius: '24px',
                    border: '2px solid rgba(16, 185, 129, 0.3)',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '40px',
                    textAlign: 'center'
                }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                    style={{ marginBottom: '24px' }}
                >
                    <CheckCircle2 size={64} color="#10b981" />
                </motion.div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '12px', color: '#6ee7b7' }}>
                    결제가 완료되었습니다!
                </h1>
                <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: 0 }}>
                    수업을 위해 준비해주세요
                </p>
            </motion.div>

            {/* 결제 정보 */}
            {paymentData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '24px',
                        padding: '32px',
                        backdropFilter: 'blur(10px)',
                        marginBottom: '24px'
                    }}
                >
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', color: '#e2e8f0' }}>
                        💳 결제 정보
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <span style={{ color: '#94a3b8' }}>결제 금액</span>
                            <span style={{ fontWeight: '700', color: '#10b981', fontSize: '1.1rem' }}>₩{paymentData.amount?.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <span style={{ color: '#94a3b8' }}>결제 상태</span>
                            <span style={{ fontWeight: '700', color: '#6ee7b7' }}>✅ 완료</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                            <span style={{ color: '#94a3b8' }}>거래 ID</span>
                            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontFamily: 'monospace' }}>
                                {paymentData.transaction_id?.substring(0, 20)}...
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#94a3b8' }}>결제 시간</span>
                            <span style={{ color: '#cbd5e1' }}>
                                {new Date(paymentData.created_at).toLocaleString('ko-KR')}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 수업 정보 */}
            {sessionData && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(99, 102, 241, 0.05))',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        borderRadius: '24px',
                        padding: '32px',
                        backdropFilter: 'blur(10px)',
                        marginBottom: '24px'
                    }}
                >
                    <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', color: '#e2e8f0' }}>
                        📅 수업 정보
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 8px 0' }}>멘토</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#c084fc', margin: 0 }}>
                                {sessionData.mentors.name}
                            </p>
                        </div>
                        <div style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 8px 0' }}>수업 길이</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0', margin: 0 }}>
                                {sessionData.duration_minutes}분
                            </p>
                        </div>
                    </div>

                    <div style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', marginBottom: '20px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 8px 0' }}>수업 시간</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0', margin: 0 }}>
                            {new Date(sessionData.scheduled_at).toLocaleDateString('ko-KR')} {new Date(sessionData.scheduled_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    {/* 수업까지 남은 시간 */}
                    <div style={{
                        padding: '16px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <Clock size={20} color="#a5b4fc" />
                        <div>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 4px 0' }}>수업까지 남은 시간</p>
                            <p style={{ fontWeight: '700', color: '#a5b4fc', margin: 0 }}>
                                {Math.round((new Date(sessionData.scheduled_at) - new Date()) / (1000 * 60 * 60))}시간
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 안내 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    padding: '20px',
                    background: 'rgba(245, 158, 11, 0.05)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px',
                    color: '#fbbf24',
                    fontSize: '0.9rem',
                    marginBottom: '24px',
                    lineHeight: '1.6'
                }}
            >
                <p style={{ margin: '0 0 12px 0', fontWeight: '500' }}>📢 수업 안내:</p>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    <li>수업 시간 5분 전부터 수업 입장이 가능합니다</li>
                    <li>프로필에서 '진행 중인 수업' 탭에서 입장할 수 있습니다</li>
                    <li>화상통화, 채팅, 화이트보드를 사용할 수 있습니다</li>
                    <li>수업 완료 후 리뷰를 남길 수 있습니다</li>
                </ul>
            </motion.div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/profile')}
                    style={{
                        flex: 1,
                        padding: '16px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    프로필 보기
                    <ArrowRight size={18} />
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    style={{
                        flex: 1,
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '1rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                    }}
                >
                    홈으로
                </motion.button>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccess;
