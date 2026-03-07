import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Shield, Zap, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const STREAK_ITEMS = [
    {
        id: 'freeze',
        name: '스트릭 프리즈',
        description: '하루 결석을 무효화합니다 (24시간 유효)',
        icon: <Shield size={24} color="#60a5fa" />,
        cost: 100,
        duration: 86400000, // 24 hours
        color: '#60a5fa'
    },
    {
        id: 'restore',
        name: '스트릭 복구권',
        description: '끊어진 스트릭을 즉시 복구합니다',
        icon: <Flame size={24} color="#f97316" />,
        cost: 200,
        color: '#f97316'
    },
    {
        id: 'double',
        name: '2배 출석 부스터',
        description: '24시간 동안 출석 포인트 2배 획득',
        icon: <Zap size={24} color="#facc15" />,
        cost: 150,
        duration: 86400000,
        color: '#facc15'
    }
];

const StreakRecovery = ({ currentStreak, onSuccess }) => {
    const { user, profile } = useAuth();
    const { addToast } = useToast();
    const [purchasing, setPurchasing] = useState(false);
    const [activeItems, setActiveItems] = useState([]);

    const purchaseItem = async (item) => {
        if (!user) {
            addToast('로그인이 필요합니다', 'error');
            return;
        }

        if (profile.total_points < item.cost) {
            addToast('포인트가 부족합니다', 'error');
            return;
        }

        setPurchasing(true);
        try {
            // 포인트 차감
            const { error: pointError } = await supabase
                .from('profiles')
                .update({ total_points: profile.total_points - item.cost })
                .eq('id', user.id);

            if (pointError) throw pointError;

            // 아이템 효과 적용
            if (item.id === 'restore') {
                // 스트릭 복구 - 어제 날짜로 출석 추가
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                const { error: attendanceError } = await supabase
                    .from('attendance')
                    .insert({
                        user_id: user.id,
                        check_in_date: yesterdayStr,
                        vibe_status: 'BURNING',
                        points: 0, // 복구권은 포인트 없음
                        is_recovery: true
                    });

                if (attendanceError) throw attendanceError;
                addToast('스트릭이 복구되었습니다! 🔥', 'success');
            } else if (item.duration) {
                // 시간제한 아이템 - user_items에 추가
                const expiresAt = new Date(Date.now() + item.duration);

                const { error: itemError } = await supabase
                    .from('user_items')
                    .insert({
                        user_id: user.id,
                        item_type: item.id,
                        expires_at: expiresAt.toISOString()
                    });

                if (itemError) throw itemError;
                addToast(`${item.name} 활성화! ⏰ 24시간 유효`, 'success');
            }

            // 포인트 히스토리 기록
            await supabase.from('point_transactions').insert({
                user_id: user.id,
                amount: -item.cost,
                description: `${item.name} 구매`,
                category: 'shop'
            });

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error purchasing item:', error);
            addToast('구매 중 오류가 발생했습니다', 'error');
        } finally {
            setPurchasing(false);
        }
    };

    return (
        <div style={{ marginTop: '30px' }}>
            <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 'bold',
                color: '#fff',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
            }}>
                <Shield size={24} color="#60a5fa" />
                스트릭 보호 아이템
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: '16px' }}>
                {STREAK_ITEMS.map((item) => (
                    <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02, y: -4 }}
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
                            borderRadius: '16px',
                            padding: '20px',
                            border: `1px solid ${item.color}30`,
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Glow Effect */}
                        <div style={{
                            position: 'absolute',
                            top: '-50%',
                            right: '-50%',
                            width: '200%',
                            height: '200%',
                            background: `radial-gradient(circle, ${item.color}15, transparent 70%)`,
                            pointerEvents: 'none'
                        }} />

                        {/* Icon */}
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            background: `${item.color}20`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                            position: 'relative'
                        }}>
                            {item.icon}
                        </div>

                        {/* Content */}
                        <h4 style={{
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            color: '#e2e8f0',
                            marginBottom: '8px',
                            position: 'relative'
                        }}>
                            {item.name}
                        </h4>

                        <p style={{
                            fontSize: '0.85rem',
                            color: '#94a3b8',
                            lineHeight: '1.5',
                            marginBottom: '16px',
                            position: 'relative'
                        }}>
                            {item.description}
                        </p>

                        {/* Duration Badge */}
                        {item.duration && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 10px',
                                background: 'rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                fontSize: '0.75rem',
                                color: '#cbd5e1',
                                position: 'relative'
                            }}>
                                <Clock size={14} />
                                24시간 유효
                            </div>
                        )}

                        {/* Purchase Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => purchaseItem(item)}
                            disabled={purchasing || profile?.total_points < item.cost}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: profile?.total_points >= item.cost
                                    ? `linear-gradient(135deg, ${item.color}, ${item.color}dd)`
                                    : 'rgba(255,255,255,0.05)',
                                border: 'none',
                                borderRadius: '10px',
                                color: '#fff',
                                fontWeight: 'bold',
                                cursor: profile?.total_points >= item.cost ? 'pointer' : 'not-allowed',
                                opacity: profile?.total_points >= item.cost ? 1 : 0.5,
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            {purchasing ? '구매 중...' : (
                                <>
                                    <span style={{ fontSize: '1.2rem' }}>💎</span>
                                    {item.cost} P 구매
                                </>
                            )}
                        </motion.button>

                        {profile?.total_points < item.cost && (
                            <div style={{
                                marginTop: '8px',
                                fontSize: '0.75rem',
                                color: '#ef4444',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px',
                                position: 'relative'
                            }}>
                                <AlertCircle size={12} />
                                포인트 {item.cost - profile?.total_points} 부족
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Info */}
            <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                fontSize: '0.85rem',
                color: '#93c5fd',
                lineHeight: '1.6'
            }}>
                <strong>💡 팁:</strong> 스트릭을 지키기 어려운 날이 있다면 미리 프리즈 아이템을 사용하세요!
                복구권은 끊어진 후에도 사용할 수 있습니다.
            </div>
        </div>
    );
};

export default StreakRecovery;
