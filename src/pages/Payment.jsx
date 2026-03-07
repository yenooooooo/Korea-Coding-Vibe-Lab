import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';

const Payment = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [orderId, setOrderId] = useState('');

    useEffect(() => {
        // location.state에서 세션 데이터 받기
        if (location.state?.sessionId) {
            fetchSessionData();
        } else {
            addToast('유효하지 않은 요청입니다', 'error');
            navigate(-1);
        }
    }, [location.state]);

    const fetchSessionData = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('mentor_sessions')
                .select('*, mentors(*)')
                .eq('id', location.state.sessionId)
                .single();

            if (error) throw error;
            setSessionData(data);

            // 주문 ID 생성 (형식: SESSION_ID_TIMESTAMP)
            setOrderId(`ORDER_${data.id.substring(0, 8)}_${Date.now()}`);
        } catch (error) {
            console.error('Error fetching session:', error);
            addToast('세션 정보를 불러올 수 없습니다', 'error');
            navigate(-1);
        } finally {
            setLoading(false);
        }
    };

    const calculateAmount = () => {
        if (!sessionData) return 0;
        return Math.round(sessionData.mentors.hourly_rate * (sessionData.duration_minutes / 60));
    };

    const handlePayment = async () => {
        if (!sessionData || !orderId) {
            addToast('결제 정보가 없습니다', 'error');
            return;
        }

        try {
            setProcessing(true);

            const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
            if (!clientKey) {
                addToast('결제 설정이 완료되지 않았습니다', 'error');
                return;
            }

            const amount = calculateAmount();

            // Toss Payments SDK 동적 로드
            if (!window.TossPayments) {
                await new Promise((resolve, reject) => {
                    const s = document.createElement('script');
                    s.src = 'https://js.tosspayments.com/v1/payment';
                    s.onload = resolve;
                    s.onerror = reject;
                    document.head.appendChild(s);
                });
            }
            const tossPayments = window.TossPayments(clientKey);

            // 결제 요청
            await tossPayments.requestPayment('카드', {
                amount: amount,
                orderId: orderId,
                orderName: `${sessionData.mentors.name} 멘토링 수업 (${sessionData.duration_minutes}분)`,
                customerName: user.user_metadata?.username || 'GUEST',
                customerEmail: user.email,
                successUrl: `${window.location.origin}/payment-success`,
                failUrl: `${window.location.origin}/payment-fail`,
            });

        } catch (error) {
            console.error('Payment error:', error);
            addToast('결제 처리 중 오류가 발생했습니다', 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div style={{ color: '#fff', textAlign: 'center', padding: '60px 20px' }}>
                <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
                <p style={{ marginTop: '20px' }}>결제 정보 로딩 중...</p>
            </div>
        );
    }

    if (!sessionData) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', color: '#fff', paddingBottom: '60px' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        padding: '40px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '16px',
                        textAlign: 'center'
                    }}
                >
                    <AlertCircle size={48} color="#fca5a5" style={{ marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fca5a5' }}>
                        세션 정보를 찾을 수 없습니다
                    </h2>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            background: '#ef4444',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600'
                        }}
                    >
                        돌아가기
                    </button>
                </motion.div>
            </div>
        );
    }

    const amount = calculateAmount();

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', color: '#fff', paddingBottom: '60px' }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    padding: '40px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                    borderRadius: '24px',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '40px',
                    textAlign: 'center'
                }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '12px', background: 'linear-gradient(135deg, #a78bfa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    💳 결제
                </h1>
                <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: 0 }}>
                    멘토링 수업 결제
                </p>
            </motion.div>

            {/* 결제 정보 카드 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    padding: '40px',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '24px'
                }}
            >
                {/* 멘토 정보 */}
                <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#e2e8f0' }}>
                        👨‍🏫 멘토
                    </h2>
                    <div style={{
                        padding: '16px',
                        background: 'rgba(168, 85, 247, 0.1)',
                        borderRadius: '12px',
                        border: '1px solid rgba(168, 85, 247, 0.2)'
                    }}>
                        <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#c084fc', margin: '0 0 8px 0' }}>
                            {sessionData.mentors.name}
                        </p>
                        <p style={{ color: '#94a3b8', margin: '0', fontSize: '0.95rem' }}>
                            ⭐ {sessionData.mentors.rating?.toFixed(1)} ({sessionData.mentors.reviews_count || 0}개 리뷰)
                        </p>
                    </div>
                </div>

                {/* 수업 정보 */}
                <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#e2e8f0' }}>
                        📅 수업 정보
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ padding: '12px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 6px 0' }}>수업 날짜</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0', margin: 0 }}>
                                {new Date(sessionData.scheduled_at).toLocaleDateString('ko-KR')}
                            </p>
                        </div>
                        <div style={{ padding: '12px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 6px 0' }}>수업 시간</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0', margin: 0 }}>
                                {new Date(sessionData.scheduled_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div style={{ padding: '12px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', gridColumn: '1 / -1' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 6px 0' }}>수업 길이</p>
                            <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0', margin: 0 }}>
                                {sessionData.duration_minutes}분
                            </p>
                        </div>
                    </div>
                </div>

                {/* 가격 정보 */}
                <div style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '16px', color: '#e2e8f0' }}>
                        💰 가격
                    </h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', marginBottom: '12px' }}>
                        <span style={{ color: '#cbd5e1' }}>시간당 요금</span>
                        <span style={{ fontWeight: '700', color: '#e2e8f0' }}>₩{sessionData.mentors.hourly_rate?.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '8px', marginBottom: '12px' }}>
                        <span style={{ color: '#cbd5e1' }}>수업 시간</span>
                        <span style={{ fontWeight: '700', color: '#e2e8f0' }}>{sessionData.duration_minutes / 60}시간</span>
                    </div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '18px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.1))',
                        borderRadius: '8px',
                        border: '2px solid rgba(168, 85, 247, 0.3)'
                    }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: '#c084fc' }}>총 결제 금액</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c084fc' }}>₩{amount.toLocaleString()}</span>
                    </div>
                </div>

                {/* 안내 */}
                <div style={{
                    padding: '16px',
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '8px',
                    color: '#cbd5e1',
                    fontSize: '0.9rem',
                    lineHeight: '1.6'
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#a5b4fc' }}>
                        ℹ️ 결제 안내:
                    </p>
                    <ul style={{ margin: '0', paddingLeft: '20px' }}>
                        <li>결제 후 자동으로 mentor_sessions 상태가 'paid'로 변경됩니다</li>
                        <li>수업 시간 5분 전부터 수업 입장 버튼이 활성화됩니다</li>
                        <li>결제 취소는 수업 24시간 전까지만 가능합니다</li>
                        <li>토스페이먼츠 테스트 카드: 4111 1111 1111 1111</li>
                    </ul>
                </div>
            </motion.div>

            {/* 결제 버튼 */}
            <motion.button
                onClick={handlePayment}
                disabled={processing}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                    width: '100%',
                    padding: '18px',
                    background: processing
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    opacity: processing ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginBottom: '16px'
                }}
            >
                {processing ? (
                    <>
                        <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
                        결제 처리 중...
                    </>
                ) : (
                    <>
                        <CreditCard size={20} />
                        {amount.toLocaleString()}원 결제하기
                    </>
                )}
            </motion.button>

            {/* 취소 버튼 */}
            <button
                onClick={() => navigate(-1)}
                disabled={processing}
                style={{
                    width: '100%',
                    padding: '14px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    color: '#cbd5e1',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    opacity: processing ? 0.5 : 1
                }}
            >
                취소
            </button>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Payment;
