import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, ChevronRight, Zap, Star } from 'lucide-react';
import { LEVEL_TIERS } from '../utils/vibeLevel';

const LevelGuideModal = ({ isOpen, onClose, currentLevel }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 200,
                    padding: '20px'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: 'linear-gradient(165deg, #1e293b 0%, #0f172a 100%)',
                        width: '100%',
                        maxWidth: '600px',
                        borderRadius: '28px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '24px 32px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.02)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: 'rgba(99, 102, 241, 0.15)',
                                borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Award color="#818cf8" size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>바이브 등급 가이드</h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>포인트 성장에 따라 등급이 상승합니다.</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: 'none',
                                color: '#94a3b8',
                                width: '36px', height: '36px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div style={{
                        padding: '24px 32px',
                        maxHeight: '60vh',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {LEVEL_TIERS.map((tier, index) => {
                            const minLevel = index * 10 + 1;
                            const maxLevel = (index + 1) * 10;
                            const isCurrentTier = currentLevel >= minLevel && currentLevel <= maxLevel;
                            const isLocked = currentLevel < minLevel;

                            return (
                                <motion.div
                                    key={tier.name}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        padding: '20px',
                                        borderRadius: '20px',
                                        background: isCurrentTier ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                                        border: isCurrentTier ? `1px solid ${tier.color}60` : '1px solid rgba(255,255,255,0.05)',
                                        position: 'relative',
                                        opacity: isLocked ? 0.6 : 1,
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {/* Current Badge */}
                                    {isCurrentTier && (
                                        <div style={{
                                            position: 'absolute', top: '12px', right: '16px',
                                            background: tier.color,
                                            color: '#000',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.65rem',
                                            fontWeight: 'bold'
                                        }}>
                                            CURRENT
                                        </div>
                                    )}

                                    {/* Icon Box */}
                                    <div style={{
                                        width: '64px', height: '64px',
                                        borderRadius: '18px',
                                        background: isLocked ? 'rgba(0,0,0,0.2)' : `${tier.color}15`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '2rem',
                                        border: `1px solid ${tier.color}30`,
                                        flexShrink: 0,
                                        boxShadow: isCurrentTier ? `0 0 15px ${tier.color}20` : 'none'
                                    }}>
                                        {tier.icon}
                                    </div>

                                    {/* Text Info */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{
                                                fontSize: '1rem', fontWeight: 'bold', color: tier.color
                                            }}>
                                                {tier.name}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                                                Lv.{minLevel} ~ {maxLevel}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 8px 0', lineHeight: '1.4' }}>
                                            {tier.desc}
                                        </p>

                                        {/* Benefits Row */}
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#64748b' }}>
                                                <Zap size={10} color={tier.color} />
                                                <span>포인트 추가 {index * 5}%</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#64748b' }}>
                                                <Star size={10} color={tier.color} />
                                                <span>{index >= 5 ? '프리미엄 샵 해금' : '전용 칭호'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Special Note for 100+ Levels */}
                        <div style={{
                            padding: '20px',
                            background: 'rgba(99, 102, 241, 0.05)',
                            borderRadius: '16px',
                            border: '1px dashed rgba(99, 102, 241, 0.2)',
                            marginTop: '10px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', marginBottom: '6px' }}>
                                <Zap size={16} />
                                <span style={{ fontWeight: 'bold' }}>명예의 전당 (Lv.100+)</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>
                                100레벨 이후부터는 <strong style={{ color: '#fff' }}>하이퍼, 울트라, 코스믹, 갓</strong> 접두사가 붙으며
                                바이브 포인트 획득량과 전용 효과 아이템의 선택 폭이 기하급수적으로 늘어납니다!
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ padding: '24px 32px', background: 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                        <button
                            onClick={onClose}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                background: '#6366f1',
                                color: 'white',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            가이드 닫기
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LevelGuideModal;
