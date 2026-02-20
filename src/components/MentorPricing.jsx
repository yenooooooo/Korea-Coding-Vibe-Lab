import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Package, TrendingDown, Star, Coins } from 'lucide-react';

// 가격 패키지 정의
export const PRICING_PACKAGES = [
    { id: 'single', sessions: 1, discount: 0, label: '단건' },
    { id: '3pack', sessions: 3, discount: 10, label: '3회 패키지', badge: '10% 할인' },
    { id: '5pack', sessions: 5, discount: 15, label: '5회 패키지', badge: '15% 할인', popular: true },
    { id: '10pack', sessions: 10, discount: 20, label: '10회 패키지', badge: '20% 할인' }
];

// 세션 타입 정의
export const SESSION_TYPES = [
    { id: '30min', duration: 30, name: '입문 상담', basePrice: 15000, description: '빠른 질문 & 답변' },
    { id: '60min', duration: 60, name: '정규 세션', basePrice: 35000, description: '심층 코드 리뷰' },
    { id: '90min', duration: 90, name: '프리미엄', basePrice: 60000, description: '페어 프로그래밍' }
];

// 가격 계산 함수
export const calculatePrice = (basePrice, packageType, pointsToUse = 0) => {
    const pkg = PRICING_PACKAGES.find(p => p.id === packageType) || PRICING_PACKAGES[0];
    const totalBeforeDiscount = basePrice * pkg.sessions;
    const discountAmount = totalBeforeDiscount * (pkg.discount / 100);
    const afterPackageDiscount = totalBeforeDiscount - discountAmount;
    const finalPrice = Math.max(0, afterPackageDiscount - pointsToUse);

    return {
        original: totalBeforeDiscount,
        discountAmount,
        afterDiscount: afterPackageDiscount,
        final: finalPrice,
        pricePerSession: pkg.sessions > 1 ? Math.floor(finalPrice / pkg.sessions) : finalPrice
    };
};

// 멘토 수익 계산 (수수료 12%)
export const calculateMentorEarnings = (totalPrice) => {
    const commission = 0.12;
    const mentorEarning = Math.floor(totalPrice * (1 - commission));
    const platformFee = totalPrice - mentorEarning;

    return { mentorEarning, platformFee, commission: commission * 100 };
};

const MentorPricing = ({ basePrice = 35000, showCalculator = false }) => {
    return (
        <div style={{ color: '#fff' }}>
            {/* 세션 타입 */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={20} color="#6366f1" />
                    세션 타입
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    {SESSION_TYPES.map(type => (
                        <motion.div
                            key={type.id}
                            whileHover={{ scale: 1.03 }}
                            style={{
                                padding: '16px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                borderRadius: '12px'
                            }}
                        >
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>{type.duration}분</div>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '4px' }}>{type.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>{type.description}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#facc15' }}>
                                {type.basePrice.toLocaleString()}원
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* 패키지 할인 */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={20} color="#22c55e" />
                    패키지 할인
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                    {PRICING_PACKAGES.map(pkg => {
                        const price = calculatePrice(basePrice, pkg.id);
                        return (
                            <motion.div
                                key={pkg.id}
                                whileHover={{ scale: 1.05 }}
                                style={{
                                    padding: '16px',
                                    background: pkg.popular ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    border: pkg.popular ? '2px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    position: 'relative'
                                }}
                            >
                                {pkg.popular && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-10px',
                                        right: '8px',
                                        background: '#22c55e',
                                        color: '#000',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.7rem',
                                        fontWeight: 'bold'
                                    }}>
                                        인기
                                    </div>
                                )}
                                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px' }}>
                                    {pkg.label}
                                </div>
                                {pkg.discount > 0 && (
                                    <div style={{ fontSize: '0.75rem', color: '#22c55e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <TrendingDown size={14} />
                                        {pkg.badge}
                                    </div>
                                )}
                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#facc15' }}>
                                    {price.pricePerSession.toLocaleString()}원
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/회</span>
                                </div>
                                {pkg.sessions > 1 && (
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>
                                        총 {price.final.toLocaleString()}원
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 포인트 할인 안내 */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    padding: '16px',
                    background: 'rgba(250, 204, 21, 0.1)',
                    border: '1px solid rgba(250, 204, 21, 0.3)',
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Coins size={20} color="#facc15" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#facc15' }}>포인트 할인</h4>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
                    출석, 챌린지, 활동으로 적립한 포인트를 사용하면 최대 20% 추가 할인!
                </p>
            </motion.div>

            {/* 멘토 수익 계산기 (선택적) */}
            {showCalculator && (
                <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Star size={20} color="#a855f7" />
                        멘토 수익 예상
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>
                        <div style={{ marginBottom: '8px' }}>
                            • 시간당 {basePrice.toLocaleString()}원 기준
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            • 플랫폼 수수료: <span style={{ color: '#a855f7', fontWeight: 'bold' }}>12%</span>
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            • 멘토 수령액: <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                                {calculateMentorEarnings(basePrice).mentorEarning.toLocaleString()}원/시간
                            </span>
                        </div>
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>월 20회 진행 시</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#22c55e' }}>
                                약 {(calculateMentorEarnings(basePrice).mentorEarning * 20).toLocaleString()}원
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorPricing;
