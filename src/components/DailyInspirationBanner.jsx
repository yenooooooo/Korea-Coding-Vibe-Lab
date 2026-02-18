import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2 } from 'lucide-react';

/**
 * DailyInspirationBanner 컴포넌트
 * 매일 바뀌는 영감 메시지를 보여줍니다
 * - 일일 따옴표
 * - 공유 기능
 * - 로컬스토리지 캐싱
 */
const DailyInspirationBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    const inspirations = [
        {
            quote: '코딩은 마라톤이지, 스프린트가 아닙니다. 천천히, 꾸준히 나아가세요.',
            author: '바이브 커뮤니티'
        },
        {
            quote: '첫 번째 프로그램은 다른 모든 프로그램 중 가장 어렵습니다. 하지만 당신은 할 수 있어요!',
            author: '프로그래머의 지혜'
        },
        {
            quote: '오류는 배움의 기회입니다. 모든 전문가도 초보자였습니다.',
            author: '개발자들의 말'
        },
        {
            quote: '작은 프로젝트 완성 하나가 백 개의 계획보다 낫습니다.',
            author: '바이브 코딩 철학'
        },
        {
            quote: 'AI와 함께라면 당신의 아이디어는 현실이 될 수 있습니다.',
            author: '바이브 코딩'
        },
        {
            quote: '매일 새로운 것을 배웠다면, 그것으로 충분합니다.',
            author: '학습자의 관점'
        },
        {
            quote: '당신의 코드가 완벽하지 않아도 괜찮습니다. 동작하면 성공입니다!',
            author: '실용적인 개발'
        },
        {
            quote: '커뮤니티가 있으면 혼자가 아닙니다. 우리는 함께 성장합니다.',
            author: '바이브 커뮤니티'
        }
    ];

    // 오늘의 영감 선택
    const getTodayInspiration = () => {
        const today = new Date().toDateString();
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        return inspirations[dayOfYear % inspirations.length];
    };

    // 로컬스토리지 확인
    useEffect(() => {
        const today = new Date().toDateString();
        const lastShown = localStorage.getItem('inspirationBannerDate');

        if (lastShown === today) {
            setIsVisible(false);
        }
    }, []);

    const handleClose = () => {
        const today = new Date().toDateString();
        localStorage.setItem('inspirationBannerDate', today);
        setIsVisible(false);
    };

    const handleShare = () => {
        const inspiration = getTodayInspiration();
        const text = `"${inspiration.quote}" - ${inspiration.author} #바이브코딩`;

        if (navigator.share) {
            navigator.share({
                title: '바이브 코딩 일일 영감',
                text: text
            });
        } else {
            navigator.clipboard.writeText(text);
            alert('클립보드에 복사되었습니다!');
        }
    };

    const inspiration = getTodayInspiration();

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.15))',
                        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
                        padding: '24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    {/* 배경 이펙트 */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.1), transparent 50%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '20px',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {/* 영감 메시지 */}
                        <div style={{ flex: 1 }}>
                            <p style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: 'white',
                                margin: '0 0 8px 0',
                                lineHeight: '1.6'
                            }}>
                                ✨ {inspiration.quote}
                            </p>
                            <p style={{
                                fontSize: '0.85rem',
                                color: '#d8b4fe',
                                margin: 0,
                                fontStyle: 'italic'
                            }}>
                                — {inspiration.author}
                            </p>
                        </div>

                        {/* 버튼 */}
                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center'
                        }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleShare}
                                style={{
                                    background: 'rgba(168, 85, 247, 0.2)',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    color: '#d8b4fe',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    transition: 'all 0.3s',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                <Share2 size={14} />
                                공유
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#d8b4fe',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={18} />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DailyInspirationBanner;
