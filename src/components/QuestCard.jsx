import React from 'react';
import { motion } from 'framer-motion';
import { Check, Gift, Loader2 } from 'lucide-react';

const QuestCard = ({ quest, userQuest, onClaimReward, claiming }) => {
    const progress = userQuest?.progress || 0;
    const target = quest?.condition_value || 1;
    const percent = Math.min((progress / target) * 100, 100);
    const isCompleted = userQuest?.is_completed;
    const isClaimed = userQuest?.is_reward_claimed;

    // 상태 결정
    let status = 'in_progress'; // 진행중
    if (isClaimed) status = 'claimed';
    else if (isCompleted) status = 'claimable';

    const statusStyles = {
        in_progress: {
            border: '1px solid rgba(255, 255, 255, 0.08)',
            bg: 'rgba(30, 41, 59, 0.5)',
            barColor: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            barGlow: 'rgba(99, 102, 241, 0.4)',
        },
        claimable: {
            border: '1px solid rgba(34, 197, 94, 0.3)',
            bg: 'rgba(30, 41, 59, 0.5)',
            barColor: 'linear-gradient(90deg, #22c55e, #4ade80)',
            barGlow: 'rgba(34, 197, 94, 0.4)',
        },
        claimed: {
            border: '1px solid rgba(255, 255, 255, 0.05)',
            bg: 'rgba(30, 41, 59, 0.3)',
            barColor: 'linear-gradient(90deg, #475569, #64748b)',
            barGlow: 'none',
        },
    };

    const s = statusStyles[status];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
                background: s.bg,
                border: s.border,
                borderRadius: '16px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden',
                opacity: status === 'claimed' ? 0.6 : 1,
            }}
        >
            {/* 완료 글로우 */}
            {status === 'claimable' && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(ellipse at top right, rgba(34, 197, 94, 0.08), transparent 60%)',
                    pointerEvents: 'none',
                }} />
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', position: 'relative', zIndex: 1 }}>
                {/* 아이콘 */}
                <div style={{
                    width: '44px', height: '44px',
                    borderRadius: '12px',
                    background: status === 'claimed' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.05)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem',
                    flexShrink: 0,
                }}>
                    {status === 'claimed' ? <Check size={20} color="#64748b" /> : (quest?.icon || '📋')}
                </div>

                {/* 콘텐츠 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <h4 style={{
                            margin: 0,
                            fontSize: '0.95rem',
                            fontWeight: 'bold',
                            color: status === 'claimed' ? '#64748b' : '#f1f5f9',
                            textDecoration: status === 'claimed' ? 'line-through' : 'none',
                        }}>
                            {quest?.title}
                        </h4>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            padding: '2px 8px', borderRadius: '8px',
                            background: status === 'claimed' ? 'rgba(100,116,139,0.1)' : 'rgba(250, 204, 21, 0.1)',
                            border: status === 'claimed' ? '1px solid rgba(100,116,139,0.15)' : '1px solid rgba(250, 204, 21, 0.2)',
                        }}>
                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                color: status === 'claimed' ? '#64748b' : '#facc15',
                            }}>
                                +{quest?.reward_points}P
                            </span>
                        </div>
                    </div>

                    <p style={{
                        margin: '0 0 10px 0',
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                    }}>
                        {quest?.description}
                    </p>

                    {/* 진행 바 */}
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>PROGRESS</span>
                            <span style={{ fontSize: '0.7rem', color: status === 'claimed' ? '#64748b' : '#94a3b8' }}>
                                {progress} / {target}
                            </span>
                        </div>
                        <div style={{
                            width: '100%', height: '6px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                        }}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                style={{
                                    height: '100%',
                                    background: s.barColor,
                                    borderRadius: '3px',
                                    boxShadow: s.barGlow !== 'none' ? `0 0 8px ${s.barGlow}` : 'none',
                                }}
                            />
                        </div>
                    </div>

                    {/* 보상 받기 버튼 */}
                    {status === 'claimable' && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onClaimReward(userQuest.id)}
                            disabled={claiming}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                color: 'white',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                cursor: claiming ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                                opacity: claiming ? 0.7 : 1,
                            }}
                        >
                            {claiming ? (
                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <Gift size={16} />
                            )}
                            {claiming ? '수령 중...' : '보상 받기'}
                        </motion.button>
                    )}

                    {status === 'claimed' && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 0',
                            fontSize: '0.8rem',
                            color: '#64748b',
                        }}>
                            <Check size={14} />
                            수령 완료
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default QuestCard;
