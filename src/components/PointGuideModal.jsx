import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, MessageSquare, Trophy, Calendar, Sparkles, ShoppingBag, TrendingUp, CheckCircle } from 'lucide-react';

const PointGuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const earnMethods = [
        { icon: <Calendar color="#facc15" />, title: '매일 출석체크', points: '+10 P', desc: '하루 한 번, 출석만 해도 포인트가 쌓여요.' },
        { icon: <MessageSquare color="#67e8f9" />, title: '게시글 작성', points: '+15 P', desc: '지식을 공유하고 커뮤니티에 기여해보세요.' },
        { icon: <MessageSquare color="#a5b4fc" />, title: '댓글 작성', points: '+5 P', desc: '동료들과 소통하며 함께 성장하세요.' },
        { icon: <CheckCircle color="#86efac" />, title: '퀘스트 완료', points: '+20 P', desc: '시즌 퀘스트를 달성하고 보상을 받으세요.' },
        { icon: <Trophy color="#fca5a5" />, title: '배틀 참여', points: '+25 P', desc: '코딩 배틀에 도전하세요! 승리 시 추가 보상.' },
        { icon: <Trophy color="#ef4444" />, title: '배틀 승리', points: '+15 P', desc: '승리하여 명예와 추가 포인트를 획득하세요.' },
    ];

    const benefits = [
        { icon: <TrendingUp color="#c084fc" />, title: '레벨 업 및 등급 상승', desc: '포인트가 쌓이면 자동으로 레벨이 오르고, 새로운 칭호를 얻습니다.' },
        { icon: <ShoppingBag color="#f472b6" />, title: '바이브 샵 아이템 구매', desc: '모은 포인트로 아바타, 스킨, 이펙트 등 다양한 아이템을 구매하세요.' },
        { icon: <Sparkles color="#fbbf24" />, title: '시즌 랭킹 경쟁', desc: '높은 포인트를 기록하여 시즌 랭킹 명예의 전당에 이름을 올리세요.' },
    ];

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
                        maxWidth: '550px',
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
                                background: 'rgba(250, 204, 21, 0.15)',
                                borderRadius: '12px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Zap color="#facc15" size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>바이브 포인트 가이드</h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>활동하며 포인트를 모으고 성장하세요!</p>
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
                    }}>
                        {/* How to Earn */}
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 16px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#818cf8' }}>📥</span> 포인트 획득 방법
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                            {earnMethods.map((item, index) => (
                                <div key={index} style={{
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '10px',
                                            background: 'rgba(255,255,255,0.05)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {item.icon}
                                        </div>
                                        <span style={{
                                            fontSize: '0.85rem', fontWeight: 'bold', color: '#facc15',
                                            background: 'rgba(250, 204, 21, 0.1)',
                                            padding: '2px 8px', borderRadius: '6px'
                                        }}>
                                            {item.points}
                                        </span>
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '2px' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.3' }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Benefits */}
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: '0 0 16px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#f472b6' }}>🎁</span> 포인트 사용 & 혜택
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {benefits.map((item, index) => (
                                <div key={index} style={{
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: 'rgba(99, 102, 241, 0.05)',
                                    border: '1px solid rgba(99, 102, 241, 0.15)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px'
                                }}>
                                    <div style={{ fontSize: '1.5rem' }}>{item.icon}</div>
                                    <div>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#e2e8f0' }}>{item.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.desc}</div>
                                    </div>
                                </div>
                            ))}
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
                                cursor: 'pointer'
                            }}
                        >
                            확인
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PointGuideModal;
