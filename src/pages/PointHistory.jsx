import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, Filter, Calendar, Coins, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const PointHistory = () => {
    const { user, profile } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, earned, spent
    const [page, setPage] = useState(0);
    const pageSize = 20;

    useEffect(() => {
        if (user) fetchTransactions();
    }, [user, filter, page]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            let query = supabase.from('point_transactions')
                .select('*', { count: 'exact' })
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .range(page * pageSize, (page + 1) * pageSize - 1);

            if (filter === 'earned') query = query.gt('amount', 0);
            else if (filter === 'spent') query = query.lt('amount', 0);

            const { data, error, count } = await query;
            if (error) throw error;
            setTransactions(data || []);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const totalEarned = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalSpent = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const categoryIcons = {
        attendance: '📅', quest: '🎯', battle: '⚔️', shop: '🛍️',
        friend: '👥', challenge: '🏆', admin: '👑', bonus: '🎁',
        mentor: '👨‍🏫', season_pass: '🎫', other: '✨',
    };

    const categoryColors = {
        attendance: '#10b981', quest: '#ec4899', battle: '#f59e0b', shop: '#ef4444',
        friend: '#6366f1', challenge: '#8b5cf6', admin: '#a855f7', bonus: '#22c55e',
        mentor: '#3b82f6', season_pass: '#f97316', other: '#94a3b8',
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px', color: '#94a3b8' }}>
                <Coins size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>로그인 후 포인트 내역을 확인할 수 있습니다.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', paddingBottom: '100px' }}>
            {/* 헤더 */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '28px' }}>
                <h1 style={{
                    fontSize: '2rem', fontWeight: '900',
                    background: 'linear-gradient(135deg, #f59e0b, #6366f1)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: '8px',
                }}>
                    📊 포인트 내역
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>포인트 적립 및 사용 내역을 확인하세요.</p>
            </motion.div>

            {/* 요약 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {[
                    { label: '현재 보유', value: profile?.total_points || 0, icon: <Coins size={24} />, color: '#f59e0b', suffix: 'P' },
                    { label: '이 페이지 적립', value: totalEarned, icon: <TrendingUp size={24} />, color: '#10b981', suffix: 'P', prefix: '+' },
                    { label: '이 페이지 사용', value: totalSpent, icon: <TrendingDown size={24} />, color: '#ef4444', suffix: 'P', prefix: '-' },
                ].map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '16px', padding: '20px', textAlign: 'center',
                        }}
                    >
                        <div style={{ color: card.color, marginBottom: '8px' }}>{card.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>
                            {card.prefix}{card.value.toLocaleString()}{card.suffix}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>{card.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* 필터 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                {[
                    { id: 'all', label: '전체' },
                    { id: 'earned', label: '적립', icon: <ArrowUpCircle size={14} /> },
                    { id: 'spent', label: '사용', icon: <ArrowDownCircle size={14} /> },
                ].map(f => (
                    <motion.button
                        key={f.id} whileTap={{ scale: 0.95 }}
                        onClick={() => { setFilter(f.id); setPage(0); }}
                        style={{
                            padding: '10px 18px', borderRadius: '12px',
                            background: filter === f.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.03)',
                            border: filter === f.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                            color: filter === f.id ? '#6366f1' : '#94a3b8',
                            fontWeight: '600', cursor: 'pointer', fontSize: '0.88rem',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                    >
                        {f.icon} {f.label}
                    </motion.button>
                ))}
            </div>

            {/* 거래 목록 */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>로딩 중...</div>
            ) : transactions.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}
                >
                    <BarChart3 size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <p>포인트 거래 내역이 없습니다.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>퀘스트를 완료하거나 출석하면 포인트가 적립됩니다!</p>
                </motion.div>
            ) : (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', overflow: 'hidden',
                }}>
                    {transactions.map((tx, idx) => {
                        const isEarned = tx.amount > 0;
                        const cat = tx.category || 'other';
                        return (
                            <motion.div
                                key={tx.id || idx}
                                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '16px 20px',
                                    borderBottom: idx < transactions.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                                }}
                            >
                                {/* 카테고리 아이콘 */}
                                <div style={{
                                    width: '42px', height: '42px', borderRadius: '12px',
                                    background: `${categoryColors[cat] || '#6366f1'}15`,
                                    border: `1px solid ${categoryColors[cat] || '#6366f1'}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.2rem', flexShrink: 0,
                                }}>
                                    {categoryIcons[cat] || '✨'}
                                </div>

                                {/* 설명 */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: '#e2e8f0', fontWeight: '600', fontSize: '0.93rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {tx.description || '포인트 거래'}
                                    </div>
                                    <div style={{ color: '#475569', fontSize: '0.78rem', marginTop: '2px' }}>
                                        {new Date(tx.created_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                {/* 금액 */}
                                <div style={{
                                    fontWeight: '800', fontSize: '1rem',
                                    color: isEarned ? '#10b981' : '#ef4444',
                                    flexShrink: 0,
                                }}>
                                    {isEarned ? '+' : ''}{tx.amount.toLocaleString()}P
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* 페이지네이션 */}
            {transactions.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{
                            padding: '10px 16px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: page === 0 ? '#334155' : '#94a3b8', cursor: page === 0 ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600',
                        }}
                    >
                        <ChevronLeft size={18} /> 이전
                    </motion.button>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' }}>
                        {page + 1} 페이지
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setPage(p => p + 1)}
                        disabled={transactions.length < pageSize}
                        style={{
                            padding: '10px 16px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: transactions.length < pageSize ? '#334155' : '#94a3b8',
                            cursor: transactions.length < pageSize ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600',
                        }}
                    >
                        다음 <ChevronRight size={18} />
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default PointHistory;
