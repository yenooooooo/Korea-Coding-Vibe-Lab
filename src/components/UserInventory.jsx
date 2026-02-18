import React, { useState, useEffect } from 'react';
import { Package, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const UserInventory = ({ onClose }) => {
    const [inventory, setInventory] = useState([]);
    const [equippedItems, setEquippedItems] = useState({});
    const { user, refetchProfile } = useAuth();

    useEffect(() => {
        if (user) {
            fetchInventory();
            fetchEquippedItems();
        }
    }, [user]);

    const fetchInventory = async () => {
        const { data, error } = await supabase
            .from('user_inventory')
            .select(`
                *,
                shop_items (*)
            `)
            .eq('user_id', user.id);

        if (error) console.error('Error fetching inventory:', error);
        else setInventory(data || []);
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

        // Update profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ equipped_items: newEquipped })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error equipping item:', profileError);
            alert('장착 실패');
            return;
        }

        // Update all inventory items of this category to unequipped
        await supabase
            .from('user_inventory')
            .update({ is_equipped: false })
            .eq('user_id', user.id)
            .in('item_id', inventory
                .filter(inv => inv.shop_items.category === category)
                .map(inv => inv.item_id)
            );

        // Set this item to equipped
        const { error: inventoryError } = await supabase
            .from('user_inventory')
            .update({ is_equipped: true })
            .eq('id', item.id);

        if (inventoryError) {
            console.error('Error updating inventory:', inventoryError);
        }

        setEquippedItems(newEquipped);
        fetchInventory();
    };

    const handleUnequip = async (item) => {
        const category = item.shop_items.category;
        const newEquipped = { ...equippedItems };
        delete newEquipped[category];

        // Update profiles table
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ equipped_items: newEquipped })
            .eq('id', user.id);

        if (profileError) {
            console.error('Error unequipping item:', profileError);
            alert('해제 실패');
            return;
        }

        // Set item to unequipped
        const { error: inventoryError } = await supabase
            .from('user_inventory')
            .update({ is_equipped: false })
            .eq('id', item.id);

        if (inventoryError) {
            console.error('Error updating inventory:', inventoryError);
        }

        setEquippedItems(newEquipped);
        fetchInventory();
    };

    const groupedInventory = inventory.reduce((acc, item) => {
        const category = item.shop_items.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(item);
        return acc;
    }, {});

    const categoryLabels = {
        avatar: '아바타',
        name_effect: '닉네임 효과',
        badge: '명예 배지',
        banner: '프로필 배너'
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#1e293b',
                    borderRadius: '24px',
                    padding: '30px',
                    width: '700px',
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Package size={28} />
                        내 인벤토리
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                {inventory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                        <Package size={64} color="#64748b" style={{ marginBottom: '20px' }} />
                        <p>아직 구매한 아이템이 없습니다.</p>
                        <p style={{ fontSize: '0.9rem' }}>바이브 샵에서 멋진 아이템을 구매해보세요!</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {Object.entries(groupedInventory).map(([category, items]) => (
                            <div key={category}>
                                <h3 style={{
                                    margin: '0 0 12px 0',
                                    fontSize: '1.1rem',
                                    color: '#94a3b8',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                    paddingBottom: '8px'
                                }}>
                                    {categoryLabels[category] || category}
                                </h3>
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {items.map((item) => {
                                        const isEquipped = equippedItems[category] === item.item_id;
                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    background: isEquipped
                                                        ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(139, 92, 246, 0.1))'
                                                        : 'rgba(0, 0, 0, 0.3)',
                                                    borderRadius: '16px',
                                                    padding: '16px',
                                                    border: isEquipped ? '2px solid rgba(168, 85, 247, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{
                                                        margin: '0 0 4px 0',
                                                        fontSize: '1rem',
                                                        color: isEquipped ? '#c4b5fd' : '#e2e8f0'
                                                    }}>
                                                        {item.shop_items.name}
                                                        {isEquipped && <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#a78bfa' }}>✓ 장착중</span>}
                                                    </h4>
                                                    <p style={{
                                                        margin: 0,
                                                        fontSize: '0.85rem',
                                                        color: '#64748b'
                                                    }}>
                                                        {item.shop_items.description}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => isEquipped ? handleUnequip(item) : handleEquip(item)}
                                                    style={{
                                                        background: isEquipped ? 'rgba(239, 68, 68, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                                                        border: isEquipped ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(168, 85, 247, 0.4)',
                                                        borderRadius: '10px',
                                                        padding: '8px 16px',
                                                        color: isEquipped ? '#fca5a5' : '#c4b5fd',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 'bold',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    {isEquipped ? '해제' : '장착'}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default UserInventory;
