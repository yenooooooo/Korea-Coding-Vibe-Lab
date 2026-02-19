import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const PaymentFail = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [errorInfo, setErrorInfo] = useState({
        code: '',
        message: ''
    });

    useEffect(() => {
        const code = searchParams.get('code');
        const message = searchParams.get('message');

        setErrorInfo({
            code: code || 'UNKNOWN_ERROR',
            message: message || '결제 처리 중 오류가 발생했습니다'
        });
    }, [searchParams]);

    const getErrorDescription = (code) => {
        const descriptions = {
            'INVALID_PARAM': '결제 정보가 올바르지 않습니다',
            'ALREADY_PROCESSED_PAYMENT': '이미 처리된 결제입니다',
            'CART_UNAVAILABLE': '상품이 더 이상 판매되지 않습니다',
            'NOT_FOUND': '요청한 결제 정보를 찾을 수 없습니다',
            'PROVIDER_ERROR': '결제 처리 중 오류가 발생했습니다',
            'INVALID_AMOUNT': '결제 금액이 올바르지 않습니다',
            'UNKNOWN_ERROR': '알 수 없는 오류가 발생했습니다'
        };
        return descriptions[code] || descriptions['UNKNOWN_ERROR'];
    };

    return (
        <div style={{ maxWidth: '700px', margin: '0 auto', color: '#fff', paddingBottom: '60px' }}>
            {/* 실패 헤더 */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    padding: '60px 40px',
                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15))',
                    borderRadius: '24px',
                    border: '2px solid rgba(239, 68, 68, 0.3)',
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
                    <AlertCircle size={64} color="#ef4444" />
                </motion.div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '12px', color: '#fca5a5' }}>
                    결제가 실패했습니다
                </h1>
                <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: 0 }}>
                    다시 시도해주세요
                </p>
            </motion.div>

            {/* 에러 정보 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '24px',
                    padding: '32px',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '24px'
                }}
            >
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '20px', color: '#e2e8f0' }}>
                    ⚠️ 오류 정보
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 8px 0' }}>오류 코드</p>
                        <p style={{ fontSize: '1rem', fontFamily: 'monospace', fontWeight: '700', color: '#fca5a5', margin: 0 }}>
                            {errorInfo.code}
                        </p>
                    </div>

                    <div style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 8px 0' }}>오류 메시지</p>
                        <p style={{ fontSize: '0.95rem', color: '#cbd5e1', margin: 0, lineHeight: '1.5' }}>
                            {errorInfo.message}
                        </p>
                    </div>

                    <div style={{ padding: '16px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px' }}>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 8px 0' }}>설명</p>
                        <p style={{ fontSize: '0.95rem', color: '#cbd5e1', margin: 0 }}>
                            {getErrorDescription(errorInfo.code)}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* 재결제 안내 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
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
                <p style={{ margin: '0 0 12px 0', fontWeight: '500' }}>💡 해결 방법:</p>
                <ul style={{ margin: '0', paddingLeft: '20px' }}>
                    <li>네트워크 연결을 확인하고 다시 시도해주세요</li>
                    <li>결제 수단의 한도를 확인해주세요</li>
                    <li>카드사에 문의하여 거래 차단 여부를 확인해주세요</li>
                    <li>테스트 환경에서는 테스트 카드 번호를 사용해주세요</li>
                    <li>계속 오류가 발생하면 고객 지원팀에 문의해주세요</li>
                </ul>
            </motion.div>

            {/* 버튼 */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(-1)}
                    style={{
                        flex: 1,
                        padding: '16px',
                        background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
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
                    다시 결제하기
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
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <ArrowLeft size={18} />
                    홈으로
                </motion.button>
            </div>
        </div>
    );
};

export default PaymentFail;
