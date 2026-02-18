import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [equippedItems, setEquippedItems] = useState({});
    const [activeCategory, setActiveCategory] = useState('avatar');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const categories = [
        { id: 'avatar', label: '🎨 아바타', icon: '🎨' },
        { id: 'name_effect', label: '✨ 효과', icon: '✨' },
        { id: 'badge', label: '🏆 배지', icon: '🏆' },
        { id: 'banner', label: '🎆 배너', icon: '🎆' },
    ];

    useEffect(() => {
        if (user) {
            fetchInventory();
            fetchEquippedItems();
        }
    }, [user]);

    const fetchInventory = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('user_inventory')
            .select('*, shop_items(*)')
            .eq('user_id', user.id);

        if (error) console.error('Error fetching inventory:', error);
        else {
            // 클라이언트에서 최신순 정렬
            const sorted = (data || []).sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );
            setInventory(sorted);
        }
        setLoading(false);
    };

    const fetchEquippedItems = async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('equipped_items')
            .eq('id', user.id)
            .maybeSingle();

        if (error) console.error('Error fetching equipped items:', error);
        else setEquippedItems(data?.equipped_items || {});
    };

    const handleEquip = async (item) => {
        const category = item.shop_items.category;
        const newEquipped = { ...equippedItems, [category]: item.item_id };

        const { error: profileError } = await supabase
            .from('profiles')
            .update({ equipped_items: newEquipped })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error equipping item:', profileError);
            return;
        }

        await supabase
            .from('user_inventory')
            .update({ is_equipped: false })
            .eq('user_id', user.id)
            .in('item_id', inventory
                .filter(inv => inv.shop_items.category === category)
                .map(inv => inv.item_id)
            );

        await supabase
            .from('user_inventory')
            .update({ is_equipped: true })
            .eq('id', item.id);

        setEquippedItems(newEquipped);
        fetchInventory();
    };

    const handleUnequip = async (item) => {
        const category = item.shop_items.category;
        const newEquipped = { ...equippedItems };
        delete newEquipped[category];

        const { error: profileError } = await supabase
            .from('profiles')
            .update({ equipped_items: newEquipped })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error unequipping item:', profileError);
            return;
        }

        await supabase
            .from('user_inventory')
            .update({ is_equipped: false })
            .eq('id', item.id);

        setEquippedItems(newEquipped);
        fetchInventory();
    };

    // 카테고리별 그룹핑
    const groupedInventory = inventory.reduce((acc, item) => {
        const category = item.shop_items.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    // 통계 계산
    const totalCount = inventory.length;
    const equippedCount = Object.keys(equippedItems).length;
    const unacquiredCount = Object.values(equippedItems).filter(id => !id).length;

    // 현재 카테고리의 아이템
    const currentItems = groupedInventory[activeCategory] || [];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff', paddingTop: '40px', paddingBottom: '60px' }}>
            {/* 헤더 배너 */}
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
                    🎒 인벤토리
                </h1>
                <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: 0 }}>
                    보유 중인 아이템을 체계적으로 관리하고 장착하세요
                </p>
            </motion.div>

            {/* 통계 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {[
                    { title: '총 보유', count: totalCount, icon: '📦', color: '#6366f1' },
                    { title: '장착 중', count: equippedCount, icon: '⭐', color: '#a855f7' },
                    { title: '미입수', count: unacquiredCount, icon: '🔒', color: '#f59e0b' }
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        style={{
                            padding: '24px',
                            background: `rgba(${stat.color === '#6366f1' ? '99,102,241' : stat.color === '#a855f7' ? '168,85,247' : '245,158,11'}, 0.1)`,
                            borderRadius: '16px',
                            border: `1px solid rgba(${stat.color === '#6366f1' ? '99,102,241' : stat.color === '#a855f7' ? '168,85,247' : '245,158,11'}, 0.2)`,
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '4px' }}>{stat.count}</div>
                        <div style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>{stat.title}</div>
                    </motion.div>
                ))}
            </div>

            {/* 카테고리 탭 */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '40px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '20px', overflowX: 'auto' }}>
                {categories.map((cat) => (
                    <motion.button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: activeCategory === cat.id ? '#a78bfa' : '#64748b',
                            fontSize: '1rem',
                            fontWeight: activeCategory === cat.id ? '600' : '500',
                            cursor: 'pointer',
                            padding: '8px 0',
                            position: 'relative',
                            whiteSpace: 'nowrap',
                            transition: 'color 0.3s ease'
                        }}
                        whileHover={{ color: '#c084fc' }}
                    >
                        {cat.label}
                        {activeCategory === cat.id && (
                            <motion.div
                                layoutId="tab-underline"
                                style={{
                                    position: 'absolute',
                                    bottom: '-20px',
                                    left: 0,
                                    right: 0,
                                    height: '2px',
                                    background: 'linear-gradient(90deg, #a78bfa, #c084fc)'
                                }}
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* 아이템 그리드 */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
                    </div>
                ) : currentItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ textAlign: 'center', padding: '80px 20px' }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📭</div>
                        <h3 style={{ fontSize: '1.3rem', color: '#cbd5e1', marginBottom: '8px' }}>아직 아이템이 없습니다</h3>
                        <p style={{ color: '#64748b' }}>이 카테고리에서 구매할 수 있는 아이템이 없습니다.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '24px'
                        }}
                    >
                        {currentItems.map((item, idx) => {
                            const isEquipped = equippedItems[activeCategory] === item.item_id;
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.05, y: -8 }}
                                    style={{
                                        background: isEquipped
                                            ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.1))'
                                            : 'rgba(30, 41, 59, 0.5)',
                                        border: isEquipped ? '2px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        backdropFilter: 'blur(10px)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {/* 장착 체크마크 */}
                                    {isEquipped && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: 'rgba(168, 85, 247, 0.3)',
                                                borderRadius: '50%',
                                                padding: '4px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <Check size={16} color="#c084fc" />
                                        </motion.div>
                                    )}

                                    {/* 이모지 */}
                                    <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>
                                        {item.shop_items?.emoji || '📦'}
                                    </div>

                                    {/* 텍스트 */}
                                    <h3 style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        color: '#e2e8f0'
                                    }}>
                                        {item.shop_items?.name}
                                    </h3>
                                    <p style={{
                                        margin: '0 0 16px 0',
                                        fontSize: '0.8rem',
                                        color: '#64748b',
                                        minHeight: '36px'
                                    }}>
                                        {item.shop_items?.description}
                                    </p>

                                    {/* 버튼 */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => isEquipped ? handleUnequip(item) : handleEquip(item)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            background: isEquipped
                                                ? 'rgba(239, 68, 68, 0.2)'
                                                : 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(139, 92, 246, 0.2))',
                                            border: isEquipped ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(168, 85, 247, 0.3)',
                                            borderRadius: '10px',
                                            color: isEquipped ? '#fca5a5' : '#c4b5fd',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {isEquipped ? '🗑️ 해제' : '✨ 장착'}
                                    </motion.button>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Inventory;
