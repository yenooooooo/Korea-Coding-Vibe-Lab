import React, { useState, useEffect } from 'react';
import { ShoppingBag, Sparkles, Award, Image as ImageIcon, Check, Lock, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import UserInventory from '../components/UserInventory';
import { getVibeLevel } from '../utils/vibeLevel';

const VibeShop = () => {
    const [items, setItems] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [profile, setProfile] = useState(null);
    const [activeCategory, setActiveCategory] = useState('avatar');
    const [selectedItem, setSelectedItem] = useState(null);
    const [showInventory, setShowInventory] = useState(false);
    const { user, profile: authProfile } = useAuth();

    const categories = [
        { id: 'avatar', label: '아바타', icon: <ImageIcon size={18} />, emoji: '🎨' },
        { id: 'name_effect', label: '닉네임 효과', icon: <Sparkles size={18} />, emoji: '✨' },
        { id: 'badge', label: '명예 배지', icon: <Award size={18} />, emoji: '🏆' },
        { id: 'banner', label: '프로필스 배너', icon: <ImageIcon size={18} />, emoji: '🎆' }
    ];

    useEffect(() => {
        if (user) {
            fetchAllData();
        }
    }, [user]);

    // AuthContext Realtime 동기화: 관리자 포인트 지급 등 외부 변경 즉시 반영
    useEffect(() => {
        if (authProfile) {
            setProfile(prev => prev ? { ...prev, points: authProfile.points, total_points: authProfile.total_points } : authProfile);
        }
    }, [authProfile?.points, authProfile?.total_points]);

    const fetchAllData = async () => {
        try {
            const [itemsRes, inventoryRes, profileRes] = await Promise.all([
                supabase.from('shop_items').select('*').eq('is_active', true).order('price', { ascending: true }),
                supabase.from('user_inventory').select('*').eq('user_id', user.id),
                supabase.from('profiles').select('*').eq('id', user.id).single()
            ]);

            if (itemsRes.error) console.error('Error fetching shop items:', itemsRes.error);
            else setItems(itemsRes.data || []);

            if (inventoryRes.error) console.error('Error fetching inventory:', inventoryRes.error);
            else setInventory(inventoryRes.data || []);

            if (profileRes.error) console.error('Error fetching profile:', profileRes.error);
            else setProfile(profileRes.data);

        } catch (error) {
            console.error('Error fetching shop data:', error);
        }
    };

    const { addToast } = useToast();
    const [purchasing, setPurchasing] = useState(false);

    // 구매 로직
    const handlePurchase = async (item) => {
        if (!user || !profile || purchasing) return;

        // Check if already owned (Client-side fast check)
        if (inventory.some(inv => inv.item_id === item.id)) {
            addToast('이미 구매한 아이템입니다!', 'error');
            return;
        }

        // Check points (Client-side fast check)
        if ((profile.points || 0) < item.price) {
            addToast(`포인트가 부족합니다! (필요: ${item.price}P, 보유: ${profile.points || 0}P)`, 'error');
            return;
        }

        // Check level (Client-side fast check)
        const currentLevel = getVibeLevel(profile.total_points || 0).level;
        if (currentLevel < (item.min_level || 1)) {
            addToast(`레벨이 부족합니다! (필요: Lv.${item.min_level || 1}, 현재: Lv.${currentLevel})`, 'error');
            return;
        }

        try {
            setPurchasing(true);
            // Call Secure RPC Function
            const { data, error } = await supabase.rpc('buy_shop_item', {
                p_item_id: item.id
            });

            if (error) throw error;

            if (data.success) {
                addToast(`🎉 ${item.name}을(를) 구매했습니다!`, 'success');
                setSelectedItem(null);

                // Refresh data immediately
                await fetchAllData();

                // Update global auth context if available
                // (Assuming useAuth has a refetch or we can rely on realtime subscription)
            } else {
                addToast(`구매 실패: ${data.message}`, 'error');
            }
        } catch (err) {
            console.error('Purchase error:', err);
            addToast('구매 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
        } finally {
            setPurchasing(false);
        }
    };

    const filteredItems = items.filter(item => item.category === activeCategory);
    const isOwned = (itemId) => inventory.some(inv => inv.item_id === itemId);

    if (!user) {
        return (
            <div style={{ height: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <ShoppingBag size={64} color="#64748b" style={{ marginBottom: '20px' }} />
                    <h2 style={{ color: '#94a3b8', marginBottom: '10px' }}>로그인이 필요합니다</h2>
                    <p style={{ color: '#64748b' }}>바이브 샵을 이용하려면 로그인해주세요!</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    marginBottom: '16px',
                    border: '1px solid rgba(168, 85, 247, 0.15)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '1.5rem' }}>🛍️</span>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '1.3rem' }}>Vibe Shop</h1>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.78rem' }}>포인트로 캐릭터를 꾸며보세요</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={() => setShowInventory(true)}
                            style={{
                                background: 'rgba(99, 102, 241, 0.12)',
                                border: '1px solid rgba(99, 102, 241, 0.25)',
                                borderRadius: '10px',
                                padding: '8px 14px',
                                color: '#a5b4fc',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                            }}
                        >
                            <Package size={15} /> 인벤토리
                        </button>
                        <div style={{
                            background: 'rgba(168, 85, 247, 0.12)',
                            borderRadius: '10px',
                            padding: '8px 16px',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>보유</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#a78bfa' }}>
                                {(profile?.points || 0).toLocaleString()} P
                            </span>
                        </div>
                    </div>
                </div>

                {/* Category Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    marginBottom: '14px',
                    padding: '5px',
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    overflowX: 'auto',
                    scrollbarWidth: 'none'
                }}>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            style={{
                                flex: '0 0 auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 14px',
                                background: activeCategory === cat.id ? 'rgba(168, 85, 247, 0.18)' : 'transparent',
                                border: activeCategory === cat.id ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
                                borderRadius: '9px',
                                color: activeCategory === cat.id ? '#c4b5fd' : '#64748b',
                                cursor: 'pointer',
                                fontSize: '0.82rem',
                                fontWeight: activeCategory === cat.id ? '700' : '500',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            <span style={{ fontSize: '1rem' }}>{cat.emoji}</span>
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>

                {/* Items Grid — 컴팩트 카드 */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(min(180px, 100%), 1fr))',
                    gap: '12px',
                    paddingBottom: '20px',
                    alignContent: 'start'
                }}>
                    {filteredItems.map((item) => {
                        const owned = isOwned(item.id);
                        const canAfford = (profile?.points || 0) >= item.price;
                        const isPremium = item.price >= 1500;
                        const isLegendary = item.price >= 2000;
                        const currentLevel = getVibeLevel(profile?.total_points || 0).level;
                        const isLocked = currentLevel < (item.min_level || 1);

                        const accentColor = owned ? '#22c55e' : isLegendary ? '#eab308' : isPremium ? '#a855f7' : '#6366f1';

                        return (
                            <div
                                key={item.id}
                                onClick={() => !isLocked && setSelectedItem(item)}
                                style={{
                                    background: 'rgba(30, 41, 59, 0.6)',
                                    borderRadius: '16px',
                                    padding: '16px',
                                    border: `1px solid ${accentColor}${owned || isLegendary ? '50' : '20'}`,
                                    cursor: isLocked ? 'not-allowed' : 'pointer',
                                    filter: isLocked ? 'grayscale(0.7) brightness(0.6)' : 'none',
                                    transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '10px',
                                    position: 'relative'
                                }}
                                onMouseOver={(e) => {
                                    if (!isLocked) {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.borderColor = accentColor + '80';
                                        e.currentTarget.style.boxShadow = `0 8px 24px ${accentColor}15`;
                                    }
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.borderColor = `${accentColor}${owned || isLegendary ? '50' : '20'}`;
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* 상태 뱃지 */}
                                {owned && (
                                    <div style={{
                                        position: 'absolute', top: '8px', right: '8px',
                                        background: 'rgba(34, 197, 94, 0.15)',
                                        borderRadius: '6px', padding: '2px 6px',
                                        fontSize: '0.6rem', fontWeight: '800', color: '#4ade80',
                                        letterSpacing: '0.5px'
                                    }}>보유</div>
                                )}
                                {isLegendary && !owned && (
                                    <div style={{
                                        position: 'absolute', top: '8px', left: '8px',
                                        background: 'rgba(234, 179, 8, 0.15)',
                                        borderRadius: '6px', padding: '2px 6px',
                                        fontSize: '0.6rem', fontWeight: '800', color: '#fbbf24',
                                        letterSpacing: '0.5px'
                                    }}>LEGENDARY</div>
                                )}
                                {isLocked && (
                                    <div style={{
                                        position: 'absolute', top: '8px', right: '8px',
                                        display: 'flex', alignItems: 'center', gap: '3px',
                                        fontSize: '0.6rem', color: '#64748b'
                                    }}>
                                        <Lock size={10} /> Lv.{item.min_level}
                                    </div>
                                )}

                                {/* 이모지 */}
                                <div style={{
                                    fontSize: '2.2rem',
                                    lineHeight: 1,
                                    marginTop: owned || (isLegendary && !owned) || isLocked ? '8px' : '0'
                                }}>
                                    {item.item_data?.emoji || getCategoryEmoji(item.category)}
                                </div>

                                {/* 이름 */}
                                <div style={{
                                    fontSize: '0.85rem',
                                    fontWeight: '700',
                                    color: owned ? '#86efac' : '#e2e8f0',
                                    textAlign: 'center',
                                    lineHeight: 1.3,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '100%'
                                }}>
                                    {item.name}
                                </div>

                                {/* 가격 */}
                                <div style={{
                                    fontSize: '0.8rem',
                                    fontWeight: '800',
                                    color: owned ? '#4ade80' : canAfford ? accentColor : '#475569',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    {owned ? '✓ 보유중' : `${item.price.toLocaleString()} P`}
                                </div>
                            </div>
                        );
                    })}

                    {filteredItems.length === 0 && (
                        <div style={{
                            gridColumn: '1 / -1',
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#64748b',
                            fontSize: '0.9rem'
                        }}>
                            이 카테고리에는 아이템이 없습니다.
                        </div>
                    )}
                </div>
            </div>

            {/* Purchase Modal */}
            <AnimatePresence>
                {selectedItem && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px'
                    }} onClick={() => setSelectedItem(null)}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#1e293b',
                                borderRadius: '32px',
                                padding: '40px',
                                width: '550px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                overflow: 'hidden',
                                position: 'relative'
                            }}
                        >
                            {/* Decoration Background */}
                            <div style={{
                                position: 'absolute',
                                top: '-100px',
                                right: '-100px',
                                width: '300px',
                                height: '300px',
                                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
                                zIndex: 0
                            }} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{
                                    fontSize: '5rem',
                                    marginBottom: '20px',
                                    filter: selectedItem.price >= 2000
                                        ? 'drop-shadow(0 0 15px rgba(234, 179, 8, 0.6))'
                                        : selectedItem.price >= 1500
                                            ? 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.5))'
                                            : 'none'
                                }}>
                                    {selectedItem.item_data?.emoji || getCategoryEmoji(selectedItem.category)}
                                </div>

                                <h2 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 'bold', color: '#f8fafc' }}>
                                    {selectedItem.name}
                                </h2>

                                <p style={{ margin: '0 0 24px 0', color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>
                                    {selectedItem.description}
                                </p>

                                {/* Preview Section */}
                                <div style={{
                                    background: 'rgba(15, 23, 42, 0.6)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    marginBottom: '24px',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    textAlign: 'left',
                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                }}>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        👀 미리보기 (Preview)
                                    </div>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
                                        borderRadius: '16px',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        {/* Background ambient glow */}
                                        <motion.div
                                            animate={{
                                                opacity: [0.1, 0.2, 0.1],
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: selectedItem.category === 'name_effect'
                                                    ? 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.15), transparent 70%)'
                                                    : 'radial-gradient(circle at 30% 50%, rgba(99, 102, 241, 0.1), transparent 60%)',
                                                pointerEvents: 'none',
                                                zIndex: 0
                                            }}
                                        />

                                        {/* Avatar with 3D effect */}
                                        <motion.div
                                            animate={{
                                                rotateY: selectedItem.category === 'avatar' ? [0, 5, 0, -5, 0] : 0,
                                                scale: selectedItem.category === 'avatar' ? [1, 1.05, 1] : 1
                                            }}
                                            transition={{
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                background: selectedItem.category === 'avatar'
                                                    ? 'linear-gradient(135deg, #4c1d95, #6b21a8)'
                                                    : '#334155',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.4rem',
                                                border: selectedItem.category === 'avatar' ? '3px solid #a78bfa' : '2px solid rgba(255,255,255,0.1)',
                                                boxShadow: selectedItem.category === 'avatar'
                                                    ? '0 0 20px rgba(168, 85, 247, 0.6), inset 0 2px 4px rgba(255,255,255,0.1)'
                                                    : '0 4px 8px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.05)',
                                                position: 'relative',
                                                zIndex: 1,
                                                transformStyle: 'preserve-3d'
                                            }}
                                        >
                                            {selectedItem.category === 'avatar' ? selectedItem.item_data?.emoji : '👤'}
                                        </motion.div>

                                        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                                            {/* Nickname with dynamic effects */}
                                            <div style={{ position: 'relative', display: 'inline-block' }}>
                                                {selectedItem.category === 'name_effect' && selectedItem.name === '네온 글로우' ? (
                                                    <motion.div
                                                        animate={{
                                                            textShadow: [
                                                                '0 0 10px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.5)',
                                                                '0 0 20px rgba(168, 85, 247, 1), 0 0 30px rgba(168, 85, 247, 0.7)',
                                                                '0 0 10px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.5)',
                                                            ]
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut"
                                                        }}
                                                        style={{
                                                            fontSize: '1.1rem',
                                                            fontWeight: 'bold',
                                                            color: '#c4b5fd',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        VibeDeveloper
                                                    </motion.div>
                                                ) : selectedItem.category === 'name_effect' && selectedItem.name === '레인보우' ? (
                                                    <motion.div
                                                        animate={{
                                                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                                        }}
                                                        transition={{
                                                            duration: 3,
                                                            repeat: Infinity,
                                                            ease: "linear"
                                                        }}
                                                        style={{
                                                            fontSize: '1.1rem',
                                                            fontWeight: 'bold',
                                                            background: 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #4169e1, #ff0080)',
                                                            backgroundSize: '200% 100%',
                                                            WebkitBackgroundClip: 'text',
                                                            WebkitTextFillColor: 'transparent',
                                                            backgroundClip: 'text',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        VibeDeveloper
                                                    </motion.div>
                                                ) : selectedItem.category === 'name_effect' && selectedItem.name === '타이핑 효과' ? (
                                                    <TypingEffect text="VibeDeveloper" />
                                                ) : (
                                                    <div style={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: 'bold',
                                                        color: selectedItem.category === 'name_effect' ? '#a78bfa' : '#f1f5f9',
                                                        textShadow: selectedItem.category === 'name_effect' ? '0 0 8px rgba(168, 85, 247, 0.6)' : 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        VibeDeveloper
                                                        {selectedItem.category === 'badge' && (
                                                            <motion.span
                                                                animate={{
                                                                    scale: [1, 1.2, 1],
                                                                    rotate: [0, 10, -10, 0]
                                                                }}
                                                                transition={{
                                                                    duration: 2,
                                                                    repeat: Infinity,
                                                                    ease: "easeInOut"
                                                                }}
                                                            >
                                                                {selectedItem.item_data?.emoji}
                                                            </motion.span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Junior Fullstack Developer</div>
                                        </div>
                                    </div>
                                    {selectedItem.category === 'banner' && (
                                        <motion.div
                                            animate={{
                                                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                                            }}
                                            transition={{
                                                duration: 8,
                                                repeat: Infinity,
                                                ease: "linear"
                                            }}
                                            style={{
                                                marginTop: '12px',
                                                height: '50px',
                                                borderRadius: '12px',
                                                background: selectedItem.name === '우주 그라데이션'
                                                    ? 'linear-gradient(90deg, #1e1b4b, #312e81, #4c1d95, #312e81, #1e1b4b)'
                                                    : selectedItem.name === '매트릭스 스타일'
                                                        ? 'linear-gradient(90deg, #022c22, #064e3b, #065f46, #064e3b, #022c22)'
                                                        : 'linear-gradient(90deg, #4c1d95, #6b21a8, #7c3aed, #6b21a8, #4c1d95)',
                                                backgroundSize: '200% 100%',
                                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: 'rgba(255,255,255,0.4)',
                                                fontSize: '0.75rem',
                                                fontWeight: 'bold',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.1)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            {selectedItem.name === '파티클 효과' && (
                                                <>
                                                    {[...Array(5)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            animate={{
                                                                y: [0, -30, 0],
                                                                opacity: [0, 1, 0],
                                                                scale: [0, 1, 0]
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                delay: i * 0.4,
                                                                ease: "easeOut"
                                                            }}
                                                            style={{
                                                                position: 'absolute',
                                                                left: `${20 + i * 15}%`,
                                                                bottom: '10%',
                                                                width: '4px',
                                                                height: '4px',
                                                                borderRadius: '50%',
                                                                background: '#fbbf24'
                                                            }}
                                                        />
                                                    ))}
                                                </>
                                            )}
                                            Your Profile Banner
                                        </motion.div>
                                    )}
                                </div>

                                {/* Implementation Info */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'start',
                                    gap: '12px',
                                    marginBottom: '24px',
                                    textAlign: 'left',
                                    padding: '0 8px'
                                }}>
                                    <div style={{
                                        background: 'rgba(168, 85, 247, 0.2)',
                                        borderRadius: '8px',
                                        padding: '6px',
                                        color: '#a78bfa'
                                    }}>
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 'bold', marginBottom: '4px' }}>구현 상세</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                                            {selectedItem.item_data?.impl_desc || "기본 시스템 효과가 적용됩니다."}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'rgba(168, 85, 247, 0.1)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    marginBottom: '30px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#c4b5fd', marginBottom: '2px' }}>가격</div>
                                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#a78bfa' }}>
                                            {selectedItem.price} P
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '2px' }}>보유</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f1f5f9' }}>
                                            {profile?.points || 0} P
                                        </div>
                                    </div>
                                </div>

                                {isOwned(selectedItem.id) ? (
                                    <div style={{
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        border: '2px solid rgba(34, 197, 94, 0.3)',
                                        borderRadius: '16px',
                                        padding: '16px',
                                        color: '#86efac',
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}>
                                        <Check size={20} /> 이미 보유한 아이템입니다
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handlePurchase(selectedItem)}
                                        disabled={
                                            purchasing ||
                                            (profile?.points || 0) < selectedItem.price ||
                                            getVibeLevel(profile?.total_points || 0).level < (selectedItem.min_level || 1)
                                        }
                                        style={{
                                            width: '100%',
                                            background: (profile?.points || 0) >= selectedItem.price && getVibeLevel(profile?.total_points || 0).level >= (selectedItem.min_level || 1) && !purchasing
                                                ? 'linear-gradient(135deg, #6366f1, #a855f7)'
                                                : 'rgba(255, 255, 255, 0.05)',
                                            border: 'none',
                                            borderRadius: '16px',
                                            padding: '18px',
                                            color: (profile?.points || 0) >= selectedItem.price && getVibeLevel(profile?.total_points || 0).level >= (selectedItem.min_level || 1) && !purchasing ? 'white' : '#64748b',
                                            cursor: (profile?.points || 0) >= selectedItem.price && getVibeLevel(profile?.total_points || 0).level >= (selectedItem.min_level || 1) && !purchasing ? 'pointer' : 'not-allowed',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            transition: 'all 0.3s',
                                            boxShadow: (profile?.points || 0) >= selectedItem.price && getVibeLevel(profile?.total_points || 0).level >= (selectedItem.min_level || 1) && !purchasing ? '0 10px 20px -5px rgba(168, 85, 247, 0.4)' : 'none',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        {purchasing ? (
                                            <>
                                                <div style={{
                                                    width: '20px', height: '20px',
                                                    border: '2px solid rgba(255,255,255,0.3)',
                                                    borderTop: '2px solid #fff',
                                                    borderRadius: '50%',
                                                    animation: 'spin 1s linear infinite'
                                                }} />
                                                <span>구매 처리 중...</span>
                                                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                            </>
                                        ) : getVibeLevel(profile?.total_points || 0).level < (selectedItem.min_level || 1)
                                            ? `🔒 Lv.${selectedItem.min_level} 달성이 필요해요`
                                            : (profile?.points || 0) >= selectedItem.price
                                                ? '구매 확정하기'
                                                : '포인트가 부족합니다'}
                                    </button>
                                )}

                                <button
                                    onClick={() => setSelectedItem(null)}
                                    style={{
                                        marginTop: '16px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    다음에 할게요
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Inventory Modal */}
            <AnimatePresence>
                {showInventory && <UserInventory onClose={() => setShowInventory(false)} />}
            </AnimatePresence>
        </>
    );
};

// Typing Effect Component
const TypingEffect = ({ text }) => {
    const [displayText, setDisplayText] = React.useState('');
    const [isDeleting, setIsDeleting] = React.useState(false);

    React.useEffect(() => {
        let timeout;

        if (!isDeleting && displayText.length < text.length) {
            timeout = setTimeout(() => {
                setDisplayText(text.slice(0, displayText.length + 1));
            }, 150);
        } else if (!isDeleting && displayText.length === text.length) {
            timeout = setTimeout(() => {
                setIsDeleting(true);
            }, 2000);
        } else if (isDeleting && displayText.length > 0) {
            timeout = setTimeout(() => {
                setDisplayText(text.slice(0, displayText.length - 1));
            }, 100);
        } else if (isDeleting && displayText.length === 0) {
            setIsDeleting(false);
        }

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, text]);

    return (
        <div style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#a78bfa',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px'
        }}>
            {displayText}
            <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                style={{
                    width: '2px',
                    height: '1.1rem',
                    background: '#a78bfa',
                    display: 'inline-block'
                }}
            />
        </div>
    );
};

const getCategoryEmoji = (category) => {
    const emojiMap = {
        avatar: '🎨',
        name_effect: '✨',
        badge: '🏆',
        banner: '🎆'
    };
    return emojiMap[category] || '🛍️';
};

export default VibeShop;
