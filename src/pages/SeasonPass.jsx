import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, ChevronLeft, ChevronRight, Lock, Gift, Star, Crown, CheckCircle, Gem, Zap, Shield, Sparkles, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import {
    getCurrentSeason,
    FREE_REWARDS,
    PREMIUM_REWARDS,
    calculateSeasonXP,
    XP_PER_TIER,
    MAX_TIER,
} from '../utils/seasonPass';

// 보상 티어 카드
const TierCard = ({ reward, isUnlocked, isClaimed, isCurrent, onClaim, isPremiumTrack, isPremiumLocked }) => {
    const isSpecial = reward.special;
    const locked = isPremiumLocked || !isUnlocked;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={!locked ? { scale: 1.05 } : {}}
            style={{
                minWidth: '120px',
                padding: isSpecial ? '24px 12px 16px' : '16px 12px',
                borderRadius: '16px',
                background: isPremiumLocked
                    ? 'rgba(30, 41, 59, 0.2)'
                    : isCurrent
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25))'
                        : isUnlocked
                            ? isPremiumTrack ? 'rgba(250, 204, 21, 0.08)' : 'rgba(30, 41, 59, 0.6)'
                            : 'rgba(30, 41, 59, 0.3)',
                border: isPremiumLocked
                    ? '1px dashed rgba(250, 204, 21, 0.2)'
                    : isCurrent
                        ? '2px solid rgba(99, 102, 241, 0.5)'
                        : isSpecial
                            ? `1px solid ${isPremiumTrack ? 'rgba(250, 204, 21, 0.3)' : 'rgba(250, 204, 21, 0.3)'}`
                            : `1px solid ${isPremiumTrack ? 'rgba(250, 204, 21, 0.1)' : 'rgba(255,255,255,0.08)'}`,
                textAlign: 'center',
                position: 'relative',
                cursor: !locked && !isClaimed ? 'pointer' : 'default',
                opacity: locked ? 0.4 : isUnlocked ? 1 : 0.5,
                flexShrink: 0,
                transition: 'all 0.2s',
                overflow: 'visible',
            }}
            onClick={() => !locked && isUnlocked && !isClaimed && onClaim(reward.tier)}
        >
            {/* 특별 단계 표시 - 카드 내부에 배치하여 잘림 방지 */}
            {isSpecial && (
                <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    background: isPremiumTrack
                        ? 'linear-gradient(135deg, #facc15, #f59e0b)'
                        : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: isPremiumTrack ? '#000' : '#fff',
                    fontSize: '0.55rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    zIndex: 2,
                    letterSpacing: '0.5px',
                }}>
                    SPECIAL
                </div>
            )}

            {/* 단계 번호 */}
            <div style={{
                fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold',
                marginBottom: '8px',
            }}>
                Tier {reward.tier}
            </div>

            {/* 보상 아이콘 */}
            <div style={{
                fontSize: '1.8rem', marginBottom: '8px',
                filter: locked ? 'grayscale(1) brightness(0.5)' : isUnlocked ? 'none' : 'grayscale(1)',
            }}>
                {isPremiumLocked ? '🔒' : isClaimed ? '✅' : isUnlocked ? reward.icon : '🔒'}
            </div>

            {/* 보상 설명 */}
            <div style={{
                fontSize: '0.75rem',
                color: locked ? '#374151' : isUnlocked ? '#cbd5e1' : '#475569',
                fontWeight: isSpecial ? 'bold' : 'normal',
                lineHeight: '1.3',
            }}>
                {reward.label}
            </div>

            {/* 수령 버튼 (무료 트랙 해금된 경우만) */}
            {!isPremiumLocked && isUnlocked && !isClaimed && (
                <div style={{
                    marginTop: '8px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: isPremiumTrack
                        ? 'linear-gradient(135deg, #facc15, #f59e0b)'
                        : 'linear-gradient(135deg, #6366f1, #a855f7)',
                    color: isPremiumTrack ? '#000' : '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                }}>
                    수령
                </div>
            )}

            {/* 수령 완료 표시 */}
            {!isPremiumLocked && isClaimed && (
                <div style={{
                    marginTop: '8px',
                    color: '#34d399',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                }}>
                    수령 완료
                </div>
            )}
        </motion.div>
    );
};

// 프리미엄 구매 모달
const PremiumPurchaseModal = ({ isOpen, onClose, season, userPoints, user }) => {
    const [toast, setToast] = useState(null);
    const [processing, setProcessing] = useState(false);
    const PREMIUM_PRICE = 2000;

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const handlePayment = async () => {
        if (!user) {
            showToast('로그인이 필요합니다');
            return;
        }

        try {
            setProcessing(true);

            const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
            if (!clientKey) {
                showToast('결제 설정이 완료되지 않았습니다');
                return;
            }

            // 고유 주문 번호 생성
            const orderId = `PREMIUMPASS_${user.id.substring(0, 8)}_${Date.now()}`;

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
                amount: PREMIUM_PRICE,
                orderId: orderId,
                orderName: `시즌 패스 프리미엄 업그레이드 (${season.name})`,
                customerName: user.user_metadata?.username || 'GUEST',
                customerEmail: user.email,
                successUrl: `${window.location.origin}/season-pass-success`,
                failUrl: `${window.location.origin}/payment-fail`,
            });
        } catch (error) {
            console.error('Payment error:', error);
            // 에러 메시지에 '취소'나 'USER_CANCEL'이 포함되어 있으면 조용히 무시
            if (error.message?.includes('취소') || error.code === 'USER_CANCEL') {
                showToast('결제를 취소했습니다');
            } else {
                showToast('결제 처리 중 오류가 발생했습니다');
            }
        } finally {
            setProcessing(false);
        }
    };

    const premiumPerks = [
        { icon: '💎', title: '2배 포인트 보상', desc: '모든 단계에서 무료 트랙 대비 2배 포인트 지급' },
        { icon: '✨', title: '한정 이펙트 5종', desc: '네온 글로우, 플레임 오라, 라이트닝 등 프로필 효과' },
        { icon: '🌈', title: '전용 스킨 2종', desc: '홀로그램 카드, 갤럭시 프레임 프로필 스킨' },
        { icon: '🐲', title: '시즌 레전드 칭호', desc: '30단계 달성 시 전용 칭호 + 아우라 이펙트' },
        { icon: '⚡', title: 'XP 부스트 1.5배', desc: '프리미엄 기간 동안 모든 XP 획득량 50% 증가' },
        { icon: '👑', title: '랭킹 전용 프레임', desc: '시즌 랭킹에서 프리미엄 전용 골드 프레임 표시' },
    ];

    const exclusivePreview = [
        { tier: 5, icon: '✨', name: '네온 글로우 효과', rarity: 'RARE' },
        { tier: 10, icon: '🌈', name: '홀로그램 카드 스킨', rarity: 'EPIC' },
        { tier: 15, icon: '🔥', name: '플레임 오라 효과', rarity: 'EPIC' },
        { tier: 20, icon: '🌌', name: '갤럭시 프레임', rarity: 'LEGENDARY' },
        { tier: 25, icon: '⚡', name: '라이트닝 이펙트', rarity: 'LEGENDARY' },
        { tier: 30, icon: '🐲', name: '시즌 레전드 칭호 + 아우라', rarity: 'MYTHIC' },
    ];

    const rarityColors = {
        RARE: { bg: 'rgba(99, 102, 241, 0.15)', border: 'rgba(99, 102, 241, 0.3)', text: '#818cf8' },
        EPIC: { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', text: '#c084fc' },
        LEGENDARY: { bg: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.3)', text: '#facc15' },
        MYTHIC: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171' },
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px',
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            width: '100%', maxWidth: '580px', maxHeight: '90vh',
                            overflowY: 'auto',
                            borderRadius: '28px',
                            position: 'relative',
                            background: 'linear-gradient(165deg, rgba(30,20,50,0.97) 0%, rgba(15,10,35,0.98) 100%)',
                            border: '1px solid rgba(250, 204, 21, 0.2)',
                            boxShadow: '0 0 80px rgba(250, 204, 21, 0.08), 0 0 40px rgba(168, 85, 247, 0.1), 0 25px 50px rgba(0,0,0,0.5)',
                        }}
                    >
                        {/* 배경 장식 파티클 */}
                        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: '28px', pointerEvents: 'none' }}>
                            <div style={{
                                position: 'absolute', top: '-60px', right: '-60px',
                                width: '250px', height: '250px',
                                background: 'radial-gradient(circle, rgba(250,204,21,0.12) 0%, transparent 65%)',
                            }} />
                            <div style={{
                                position: 'absolute', bottom: '-40px', left: '-40px',
                                width: '200px', height: '200px',
                                background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 65%)',
                            }} />
                            <div style={{
                                position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
                                width: '300px', height: '300px',
                                background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
                            }} />
                            {/* 떠다니는 파티클 */}
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [0, -20, 0],
                                        opacity: [0.3, 0.7, 0.3],
                                    }}
                                    transition={{
                                        duration: 3 + i * 0.5,
                                        repeat: Infinity,
                                        delay: i * 0.4,
                                    }}
                                    style={{
                                        position: 'absolute',
                                        width: '4px', height: '4px',
                                        borderRadius: '50%',
                                        background: i % 2 === 0 ? '#facc15' : '#a855f7',
                                        top: `${15 + i * 14}%`,
                                        left: `${10 + i * 15}%`,
                                        boxShadow: `0 0 8px ${i % 2 === 0 ? 'rgba(250,204,21,0.5)' : 'rgba(168,85,247,0.5)'}`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* 닫기 버튼 */}
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute', top: '16px', right: '16px', zIndex: 10,
                                width: '36px', height: '36px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#94a3b8', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <X size={18} />
                        </button>

                        <div style={{ position: 'relative', zIndex: 1, padding: '36px 32px 32px' }}>
                            {/* 헤더 */}
                            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                                <motion.div
                                    animate={{ rotateY: [0, 360] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                    style={{ display: 'inline-block', fontSize: '3rem', marginBottom: '12px' }}
                                >
                                    💎
                                </motion.div>
                                <h2 style={{
                                    margin: '0 0 4px', fontSize: '1.6rem', fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #facc15, #f59e0b, #facc15)',
                                    backgroundSize: '200% 100%',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    animation: 'shimmer 3s ease-in-out infinite',
                                }}>
                                    PREMIUM PASS
                                </h2>
                                <style>{`
                                    @keyframes shimmer {
                                        0%, 100% { background-position: 0% 50%; }
                                        50% { background-position: 100% 50%; }
                                    }
                                `}</style>
                                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
                                    시즌 {season.month}: {season.name} {season.emoji}
                                </p>
                            </div>

                            {/* 혜택 그리드 */}
                            <div style={{
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
                                marginBottom: '24px',
                            }}>
                                {premiumPerks.map((perk, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 + i * 0.06 }}
                                        style={{
                                            padding: '14px',
                                            borderRadius: '14px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(250, 204, 21, 0.08)',
                                            transition: 'all 0.2s',
                                        }}
                                        whileHover={{
                                            background: 'rgba(250,204,21,0.05)',
                                            borderColor: 'rgba(250, 204, 21, 0.2)',
                                        }}
                                    >
                                        <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{perk.icon}</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '4px' }}>
                                            {perk.title}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.72rem', lineHeight: '1.4' }}>
                                            {perk.desc}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* 독점 보상 미리보기 */}
                            <div style={{ marginBottom: '28px' }}>
                                <h3 style={{
                                    color: '#facc15', margin: '0 0 14px', fontSize: '0.9rem',
                                    fontWeight: 'bold', letterSpacing: '0.5px',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                }}>
                                    <Sparkles size={16} />
                                    독점 보상 미리보기
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {exclusivePreview.map((item, i) => {
                                        const rarity = rarityColors[item.rarity];
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + i * 0.06 }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '12px',
                                                    padding: '10px 14px', borderRadius: '12px',
                                                    background: rarity.bg,
                                                    border: `1px solid ${rarity.border}`,
                                                }}
                                            >
                                                <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{item.icon}</span>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 'bold' }}>
                                                        {item.name}
                                                    </div>
                                                    <div style={{ color: '#64748b', fontSize: '0.7rem' }}>
                                                        Tier {item.tier} 보상
                                                    </div>
                                                </div>
                                                <span style={{
                                                    padding: '2px 8px', borderRadius: '6px',
                                                    background: `${rarity.text}15`,
                                                    color: rarity.text,
                                                    fontSize: '0.6rem', fontWeight: 'bold',
                                                    letterSpacing: '0.5px',
                                                }}>
                                                    {item.rarity}
                                                </span>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 무료 vs 프리미엄 비교 */}
                            <div style={{
                                marginBottom: '28px', borderRadius: '16px', overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <div style={{
                                    display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr',
                                    background: 'rgba(255,255,255,0.03)',
                                }}>
                                    <div style={{ padding: '10px 14px', color: '#64748b', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                        비교 항목
                                    </div>
                                    <div style={{ padding: '10px 14px', color: '#818cf8', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>
                                        FREE
                                    </div>
                                    <div style={{ padding: '10px 14px', color: '#facc15', fontSize: '0.75rem', fontWeight: 'bold', textAlign: 'center' }}>
                                        PREMIUM
                                    </div>
                                </div>
                                {[
                                    { label: '포인트 보상', free: '기본', premium: '2배' },
                                    { label: '시즌 뱃지', free: '5종', premium: '5종 + 6종' },
                                    { label: '프로필 이펙트', free: '-', premium: '5종' },
                                    { label: '전용 스킨', free: '-', premium: '2종' },
                                    { label: 'XP 부스트', free: '-', premium: '1.5배' },
                                    { label: '랭킹 프레임', free: '기본', premium: '골드' },
                                ].map((row, i) => (
                                    <div key={i} style={{
                                        display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr',
                                        borderTop: '1px solid rgba(255,255,255,0.04)',
                                    }}>
                                        <div style={{ padding: '9px 14px', color: '#94a3b8', fontSize: '0.78rem' }}>
                                            {row.label}
                                        </div>
                                        <div style={{ padding: '9px 14px', color: '#64748b', fontSize: '0.78rem', textAlign: 'center' }}>
                                            {row.free}
                                        </div>
                                        <div style={{
                                            padding: '9px 14px', fontSize: '0.78rem', textAlign: 'center',
                                            color: '#facc15', fontWeight: 'bold',
                                            background: 'rgba(250,204,21,0.03)',
                                        }}>
                                            {row.premium}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 가격 + 구매 버튼 */}
                            <div style={{
                                padding: '24px',
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, rgba(250,204,21,0.08), rgba(245,158,11,0.08))',
                                border: '1px solid rgba(250, 204, 21, 0.15)',
                                textAlign: 'center',
                            }}>
                                {/* 가격 표시 */}
                                <div style={{ marginBottom: '6px' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'line-through', marginRight: '8px' }}>
                                        5,000 P
                                    </span>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '6px',
                                        background: 'rgba(239, 68, 68, 0.2)',
                                        color: '#f87171', fontSize: '0.7rem', fontWeight: 'bold',
                                    }}>
                                        -60%
                                    </span>
                                </div>
                                <div style={{
                                    fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '4px',
                                    background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>
                                    {PREMIUM_PRICE.toLocaleString()} P
                                </div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '18px' }}>
                                    보유 포인트: <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>{(userPoints || 0).toLocaleString()} P</span>
                                </div>

                                {/* 구매 버튼 */}
                                <motion.button
                                    whileHover={!processing ? { scale: 1.03 } : {}}
                                    whileTap={!processing ? { scale: 0.97 } : {}}
                                    onClick={handlePayment}
                                    disabled={processing}
                                    style={{
                                        width: '100%', padding: '16px',
                                        borderRadius: '14px', border: 'none',
                                        background: processing ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #facc15, #f59e0b, #f97316)',
                                        backgroundSize: '200% 100%',
                                        color: processing ? '#cbd5e1' : '#000', fontWeight: 'bold', fontSize: '1rem',
                                        cursor: processing ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        boxShadow: processing ? 'none' : '0 4px 20px rgba(250, 204, 21, 0.3), 0 0 40px rgba(250, 204, 21, 0.1)',
                                        animation: processing ? 'none' : 'shimmer 3s ease-in-out infinite',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    {processing ? (
                                        <>
                                            <div style={{ animation: 'spin 1s linear infinite' }}>⏳</div>
                                            결제 창 준비 중...
                                        </>
                                    ) : (
                                        <>
                                            <Gem size={20} />
                                            프리미엄 패스 구매하기
                                        </>
                                    )}
                                </motion.button>

                                <p style={{ color: '#475569', fontSize: '0.7rem', margin: '12px 0 0', lineHeight: '1.4' }}>
                                    시즌 종료 시까지 유효 | 환불 불가 | 다음 시즌 자동 갱신 없음
                                </p>
                            </div>
                        </div>

                        {/* 토스트 */}
                        <AnimatePresence>
                            {toast && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    style={{
                                        position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
                                        padding: '14px 28px', borderRadius: '14px',
                                        background: 'rgba(30, 41, 59, 0.95)',
                                        backdropFilter: 'blur(12px)',
                                        border: '1px solid rgba(250, 204, 21, 0.3)',
                                        color: '#facc15', fontSize: '0.9rem', fontWeight: 'bold',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                                        zIndex: 1100,
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Zap size={18} />
                                    {toast}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const SeasonPass = () => {
    const { user, profile } = useAuth();
    const [season] = useState(getCurrentSeason());
    const [xp, setXp] = useState(0);
    const [currentTier, setCurrentTier] = useState(0);
    const [claimedTiers, setClaimedTiers] = useState([]);
    const [premiumClaimedTiers, setPremiumClaimedTiers] = useState([]);
    const [isPremium, setIsPremium] = useState(false);
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const trackRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);

        if (user) {
            // XP 계산
            const { xp: calculatedXP, currentTier: tier } = await calculateSeasonXP(user.id, supabase);
            setXp(calculatedXP);
            setCurrentTier(tier);

            // 기존 진행도 조회/생성
            const { data: progress } = await supabase
                .from('user_season_progress')
                .select('*')
                .eq('user_id', user.id)
                .eq('season_key', season.key)
                .maybeSingle();

            if (progress) {
                setClaimedTiers(progress.claimed_tiers || []);
                setPremiumClaimedTiers(progress.premium_claimed_tiers || []);
                setIsPremium(progress.is_premium || false);
                // XP/tier 동기화 업데이트
                if (progress.season_xp !== calculatedXP || progress.current_tier !== tier) {
                    await supabase
                        .from('user_season_progress')
                        .update({ season_xp: calculatedXP, current_tier: tier })
                        .eq('id', progress.id);
                }
            } else {
                // 첫 접속 시 레코드 생성
                await supabase
                    .from('user_season_progress')
                    .insert({
                        user_id: user.id,
                        season_key: season.key,
                        season_xp: calculatedXP,
                        current_tier: tier,
                        is_premium: false,
                        claimed_tiers: [],
                        premium_claimed_tiers: []
                    });
            }
        }

        // 시즌 랭킹 (상위 10명)
        const { data: rankData } = await supabase
            .from('user_season_progress')
            .select('user_id, season_xp, current_tier, profiles!user_season_progress_user_id_fkey(username, avatar_url)')
            .eq('season_key', season.key)
            .order('season_xp', { ascending: false })
            .limit(10);

        setRanking(rankData || []);
        setLoading(false);
    };

    const handleClaim = async (tier, isPremiumReward = false) => {
        if (!user || tier > currentTier) return;

        let updateData = {};

        // 1. Get the reward details to know how many points to give
        const rewardList = isPremiumReward ? PREMIUM_REWARDS : FREE_REWARDS;
        const rewardItem = rewardList.find(r => r.tier === tier);
        const rewardPoints = rewardItem ? rewardItem.amount : 0;

        // 2. Prevent duplicate claims
        if (isPremiumReward) {
            if (!isPremium || premiumClaimedTiers.includes(tier)) return;
            const newPremiumClaimed = [...premiumClaimedTiers, tier];
            setPremiumClaimedTiers(newPremiumClaimed);
            updateData = { premium_claimed_tiers: newPremiumClaimed };
        } else {
            if (claimedTiers.includes(tier)) return;
            const newClaimed = [...claimedTiers, tier];
            setClaimedTiers(newClaimed);
            updateData = { claimed_tiers: newClaimed };
        }

        // 3. Mark the tier as claimed in user_season_progress
        const { error } = await supabase
            .from('user_season_progress')
            .update(updateData)
            .eq('user_id', user.id)
            .eq('season_key', season.key);

        if (error) {
            console.error("보상 수령 오류:", error);
            return;
        }

        // 4. Actually grant the points to the user's profile via RPC or direct update
        if (rewardPoints > 0) {
            try {
                // Fetch current points safely
                const { data: profileData } = await supabase.from('profiles').select('total_points').eq('id', user.id).single();
                const currentPoints = profileData ? (profileData.total_points || 0) : 0;

                await supabase
                    .from('profiles')
                    .update({ total_points: currentPoints + rewardPoints })
                    .eq('id', user.id);
            } catch (err) {
                console.error("포인트 지급 오류:", err);
            }
        }
    };

    const scrollTrack = (direction) => {
        if (trackRef.current) {
            trackRef.current.scrollBy({ left: direction * 300, behavior: 'smooth' });
        }
    };

    // 비로그인
    if (!user) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        maxWidth: '400px', margin: '0 auto',
                        background: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px', padding: '48px 32px',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <Lock size={48} style={{ color: '#6366f1', marginBottom: '16px' }} />
                    <h2 style={{ color: '#fff', margin: '0 0 12px', fontSize: '1.3rem' }}>로그인이 필요합니다</h2>
                    <p style={{ color: '#94a3b8', margin: '0 0 24px', fontSize: '0.9rem' }}>
                        시즌 패스에 참여하고 보상을 받아보세요!
                    </p>
                    <Link to="/login" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '12px 24px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: '#fff', textDecoration: 'none', fontWeight: 'bold',
                    }}>
                        로그인하기 <ChevronRight size={16} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    style={{ display: 'inline-block', marginBottom: '16px' }}
                >
                    <Trophy size={48} style={{ color: '#facc15' }} />
                </motion.div>
                <p style={{ color: '#94a3b8' }}>시즌 데이터 로딩 중...</p>
            </div>
        );
    }

    const progressPercent = Math.min((xp % XP_PER_TIER) / XP_PER_TIER * 100, 100);
    const totalProgressPercent = Math.min((xp / (MAX_TIER * XP_PER_TIER)) * 100, 100);

    return (
        <div style={{ padding: '32px 20px', maxWidth: '900px', margin: '0 auto' }}>
            {/* 시즌 배너 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '24px',
                    padding: '32px',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    marginBottom: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* 배경 장식 */}
                <div style={{
                    position: 'absolute', top: '-30px', right: '-30px',
                    width: '150px', height: '150px',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '2rem' }}>{season.emoji}</span>
                                <h1 style={{
                                    margin: 0, fontSize: '1.6rem', fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #fff, #c4b5fd)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                }}>
                                    시즌 {season.month}: {season.name}
                                </h1>
                            </div>
                            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                                {season.year}년 {season.month}월 시즌
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            {/* D-day */}
                            <div style={{
                                textAlign: 'center', padding: '12px 20px',
                                background: 'rgba(0,0,0,0.3)', borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <Clock size={14} style={{ color: '#f59e0b' }} />
                                    <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 'bold' }}>남은 시간</span>
                                </div>
                                <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    D-{season.daysLeft}
                                </span>
                            </div>

                            {/* 현재 단계 */}
                            <div style={{
                                textAlign: 'center', padding: '12px 20px',
                                background: 'rgba(0,0,0,0.3)', borderRadius: '16px',
                                border: '1px solid rgba(99,102,241,0.2)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                    <Star size={14} style={{ color: '#818cf8' }} />
                                    <span style={{ color: '#818cf8', fontSize: '0.75rem', fontWeight: 'bold' }}>현재 단계</span>
                                </div>
                                <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>
                                    {currentTier}/{MAX_TIER}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* XP 프로그레스 바 */}
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                시즌 XP: <span style={{ color: '#fff', fontWeight: 'bold' }}>{xp}</span> / {MAX_TIER * XP_PER_TIER}
                            </span>
                            <span style={{ color: '#818cf8', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {Math.round(totalProgressPercent)}%
                            </span>
                        </div>
                        <div style={{
                            width: '100%', height: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '4px', overflow: 'hidden',
                        }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${totalProgressPercent}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                                    borderRadius: '4px',
                                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 프리미엄 업그레이드 CTA 배너 */}
            {!isPremium && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => setShowPremiumModal(true)}
                    style={{
                        background: 'linear-gradient(135deg, rgba(250,204,21,0.06) 0%, rgba(168,85,247,0.08) 50%, rgba(99,102,241,0.06) 100%)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '20px',
                        padding: '20px 28px',
                        border: '1px solid rgba(250, 204, 21, 0.15)',
                        marginBottom: '24px',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* 배경 반짝임 */}
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                        style={{
                            position: 'absolute', top: 0, left: 0,
                            width: '50%', height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(250,204,21,0.06), transparent)',
                            pointerEvents: 'none',
                        }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1, flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    width: '48px', height: '48px', borderRadius: '14px',
                                    background: 'linear-gradient(135deg, rgba(250,204,21,0.2), rgba(245,158,11,0.2))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', flexShrink: 0,
                                    boxShadow: '0 0 20px rgba(250,204,21,0.15)',
                                }}
                            >
                                💎
                            </motion.div>
                            <div>
                                <div style={{
                                    fontSize: '1rem', fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                    marginBottom: '2px',
                                }}>
                                    프리미엄 패스로 업그레이드
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                    2배 보상 + 한정 이펙트 + 전용 스킨까지
                                </div>
                            </div>
                        </div>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #facc15, #f59e0b)',
                            color: '#000', fontWeight: 'bold', fontSize: '0.85rem',
                            boxShadow: '0 4px 16px rgba(250, 204, 21, 0.25)',
                            flexShrink: 0,
                        }}>
                            <Gem size={16} />
                            자세히 보기
                        </div>
                    </div>
                </motion.div>
            )}

            {/* 프리미엄 구매 모달 */}
            <PremiumPurchaseModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                season={season}
                userPoints={profile?.total_points}
                user={user}
            />

            {/* 보상 트랙 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '24px',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ color: '#fff', margin: 0, fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Gift size={20} style={{ color: '#a855f7' }} />
                        보상 트랙
                    </h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => scrollTrack(-1)}
                            style={{
                                width: '32px', height: '32px', borderRadius: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#94a3b8', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => scrollTrack(1)}
                            style={{
                                width: '32px', height: '32px', borderRadius: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#94a3b8', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <style>{`
                    .season-track-scroll::-webkit-scrollbar { height: 4px; }
                    .season-track-scroll::-webkit-scrollbar-track { background: transparent; }
                    .season-track-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
                `}</style>

                {/* 프리미엄 트랙 (상단) */}
                <div style={{ marginBottom: '6px' }}>
                    <div
                        onClick={() => !isPremium && setShowPremiumModal(true)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '4px 12px', borderRadius: '8px',
                            background: isPremium ? 'linear-gradient(135deg, rgba(250,204,21,0.2), rgba(245,158,11,0.2))' : 'linear-gradient(135deg, rgba(250,204,21,0.15), rgba(245,158,11,0.15))',
                            border: isPremium ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid rgba(250, 204, 21, 0.2)',
                            marginBottom: '10px',
                            cursor: isPremium ? 'default' : 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <span style={{ fontSize: '0.85rem' }}>💎</span>
                        <span style={{ color: '#facc15', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                            PREMIUM
                        </span>
                        {!isPremium ? (
                            <span style={{
                                padding: '1px 6px', borderRadius: '4px',
                                background: 'rgba(250, 204, 21, 0.2)',
                                color: '#fbbf24', fontSize: '0.6rem', fontWeight: 'bold',
                            }}>
                                구매하기
                            </span>
                        ) : (
                            <span style={{
                                padding: '1px 6px', borderRadius: '4px',
                                background: 'rgba(74, 222, 128, 0.2)',
                                color: '#4ade80', fontSize: '0.6rem', fontWeight: 'bold',
                            }}>
                                이용 중
                            </span>
                        )}
                    </div>
                    <div
                        className="season-track-scroll"
                        ref={trackRef}
                        style={{
                            display: 'flex',
                            gap: '12px',
                            overflowX: 'auto',
                            paddingBottom: '8px',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                        }}
                    >
                        {PREMIUM_REWARDS.map((reward) => (
                            <TierCard
                                key={`premium-${reward.tier}`}
                                reward={reward}
                                isUnlocked={reward.tier <= currentTier}
                                isClaimed={premiumClaimedTiers.includes(reward.tier)}
                                isCurrent={reward.tier === currentTier + 1}
                                onClaim={(t) => handleClaim(t, true)}
                                isPremiumTrack={true}
                                isPremiumLocked={!isPremium}
                            />
                        ))}
                    </div>
                </div>

                {/* 단계 번호 연결 라인 */}
                <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)',
                    margin: '4px 0 10px',
                }} />

                {/* 무료 트랙 (하단) */}
                <div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '4px 12px', borderRadius: '8px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        marginBottom: '10px',
                    }}>
                        <span style={{ fontSize: '0.85rem' }}>🎫</span>
                        <span style={{ color: '#818cf8', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                            FREE
                        </span>
                    </div>
                    <div
                        className="season-track-scroll"
                        style={{
                            display: 'flex',
                            gap: '12px',
                            overflowX: 'auto',
                            paddingBottom: '12px',
                            scrollbarWidth: 'thin',
                            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
                        }}
                        onScroll={(e) => {
                            // 프리미엄 트랙과 스크롤 동기화
                            if (trackRef.current) {
                                trackRef.current.scrollLeft = e.target.scrollLeft;
                            }
                        }}
                    >
                        {FREE_REWARDS.map((reward) => (
                            <TierCard
                                key={`free-${reward.tier}`}
                                reward={reward}
                                isUnlocked={reward.tier <= currentTier}
                                isClaimed={claimedTiers.includes(reward.tier)}
                                isCurrent={reward.tier === currentTier + 1}
                                onClaim={handleClaim}
                                isPremiumTrack={false}
                                isPremiumLocked={false}
                            />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* XP 획득 가이드 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginBottom: '24px',
                }}
            >
                <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    XP 획득 방법
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                    {[
                        { label: '출석 체크', xp: 10, icon: '📅' },
                        { label: '게시글 작성', xp: 15, icon: '📝' },
                        { label: '댓글 작성', xp: 5, icon: '💬' },
                        { label: '퀘스트 완료', xp: 20, icon: '📜' },
                        { label: '배틀 참여', xp: 25, icon: '⚔️' },
                        { label: '배틀 승리', xp: '+15', icon: '🏆' },
                    ].map((item) => (
                        <div key={item.label} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 14px', borderRadius: '12px',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                            <div>
                                <div style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{item.label}</div>
                                <div style={{ color: '#818cf8', fontSize: '0.75rem', fontWeight: 'bold' }}>+{item.xp} XP</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    marginTop: '16px',
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.15)',
                    display: 'flex', gap: '12px', alignItems: 'start'
                }}>
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                        <Shield size={18} color="#38bdf8" />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
                            클린 Vibe 캠페인 (일일 획득 제한)
                        </h4>
                        <ul style={{
                            margin: 0, padding: 0, listStyle: 'none',
                            fontSize: '0.78rem', color: '#cbd5e1',
                            display: 'flex', flexDirection: 'column', gap: '4px'
                        }}>
                            <li>• <strong>게시글/댓글:</strong> 20자 이상 작성 시 인정 <span style={{ color: '#64748b' }}>(각 일일 최대 5회)</span></li>
                            <li>• <strong>배틀:</strong> 30초 이상 진행된 경기만 인정 <span style={{ color: '#64748b' }}>(일일 최대 10회)</span></li>
                            <li>• 무의미한 도배나 어뷰징 적발 시 XP가 회수될 수 있습니다.</li>
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* 시즌 랭킹 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}
            >
                <h2 style={{ color: '#fff', margin: '0 0 20px', fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Crown size={20} style={{ color: '#facc15' }} />
                    시즌 랭킹
                </h2>

                {ranking.length === 0 ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '24px 0' }}>
                        아직 시즌 참가자가 없습니다.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ranking.map((entry, i) => {
                            const rankIcons = ['🥇', '🥈', '🥉'];
                            const profileData = entry.profiles;
                            const isMe = user && entry.user_id === user.id;

                            return (
                                <motion.div
                                    key={entry.user_id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * i }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 16px', borderRadius: '12px',
                                        background: isMe ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                                        border: isMe ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                                    }}
                                >
                                    <span style={{ fontSize: '1.2rem', width: '30px', textAlign: 'center' }}>
                                        {i < 3 ? rankIcons[i] : <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>{i + 1}</span>}
                                    </span>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', flexShrink: 0,
                                    }}>
                                        {profileData?.avatar_url ? (
                                            <img src={profileData.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {(profileData?.username || '?')[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            color: isMe ? '#c4b5fd' : '#cbd5e1',
                                            fontSize: '0.9rem', fontWeight: isMe ? 'bold' : 'normal',
                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                        }}>
                                            {profileData?.username || '익명'}
                                            {isMe && <span style={{ color: '#818cf8', marginLeft: '6px', fontSize: '0.75rem' }}>(나)</span>}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                            Tier {entry.current_tier}
                                        </div>
                                        <div style={{ color: '#818cf8', fontSize: '0.75rem' }}>
                                            {entry.season_xp} XP
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SeasonPass;
