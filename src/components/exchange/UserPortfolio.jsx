import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Wallet, TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

const UserPortfolio = ({ coins }) => {
    const { user, profile } = useAuth();
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPortfolio = async () => {
        setLoading(true);
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('user_wallets')
                .select('*')
                .eq('user_id', user.id);

            if (error) throw error;
            setWallets(data || []);
        } catch (error) {
            console.error('Error fetching portfolio:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();

        // 지갑 실시간 업데이트 구독 (매수/매도 시 즉시 반영)
        const channel = supabase
            .channel(`public:user_wallets:${user?.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'user_wallets',
                filter: `user_id=eq.${user?.id}`
            }, () => {
                fetchPortfolio();
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [user]);

    // 보유 자산 목록 생성 (보유량이 0보다 큰 것만)
    const myAssets = wallets.filter(w => w.amount > 0).map(wallet => {
        const coin = coins.find(c => c.id === wallet.coin_id);
        if (!coin) return null;

        const currentPrice = coin.current_price;
        const totalValue = wallet.amount * currentPrice;
        const buyValue = wallet.amount * wallet.average_buy_price;
        const profit = totalValue - buyValue;
        const profitPercent = buyValue > 0 ? (profit / buyValue) * 100 : 0;

        return {
            ...wallet,
            coin,
            currentPrice,
            totalValue,
            profit,
            profitPercent
        };
    }).filter(item => item !== null);

    // 총 자산 요약
    const totalAssetValue = (profile?.total_points || 0) + myAssets.reduce((acc, cur) => acc + cur.totalValue, 0);
    const totalInvested = myAssets.reduce((acc, cur) => acc + (cur.amount * cur.average_buy_price), 0);
    const totalProfit = myAssets.reduce((acc, cur) => acc + cur.profit, 0);
    const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                padding: '16px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wallet size={18} /> 내 보유 자산
                </h3>
                <button
                    onClick={fetchPortfolio}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                    <RefreshCcw size={16} className={loading ? 'spin' : ''} />
                </button>
            </div>

            <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', marginBottom: '1px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>총 보유 자산 (포인트 포함)</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{Math.round(totalAssetValue).toLocaleString()} P</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>총 평가 손익</div>
                        <div style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: totalProfit >= 0 ? '#ef4444' : '#3b82f6'
                        }}>
                            {totalProfit > 0 ? '+' : ''}{Math.round(totalProfit).toLocaleString()} P
                            <span style={{ fontSize: '0.9rem', marginLeft: '4px' }}>
                                ({totalProfitPercent.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {myAssets.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        보유 중인 코인이 없습니다.
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead style={{ color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left' }}>코인</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>보유량</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>평가금액</th>
                                <th style={{ padding: '12px', textAlign: 'right' }}>수익률</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myAssets.map((asset) => (
                                <tr key={asset.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span>{asset.coin.icon}</span>
                                            <span style={{ fontWeight: 'bold' }}>{asset.coin.symbol}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        {Number(asset.amount).toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        {Math.round(asset.totalValue).toLocaleString()} P
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                        <div style={{ color: asset.profit >= 0 ? '#ef4444' : '#3b82f6', fontWeight: 'bold' }}>
                                            {asset.profitPercent.toFixed(2)}%
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: asset.profit >= 0 ? '#fca5a5' : '#93c5fd' }}>
                                            {asset.profit > 0 ? '+' : ''}{Math.round(asset.profit).toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <style>{`
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default UserPortfolio;
