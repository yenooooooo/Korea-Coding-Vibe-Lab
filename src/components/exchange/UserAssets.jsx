import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Wallet, PieChart } from 'lucide-react';

const UserAssets = ({ coins }) => {
    const { user, profile } = useAuth();
    const [wallets, setWallets] = useState([]);

    useEffect(() => {
        if (user) {
            fetchWallet();
        }
    }, [user, coins]); // coins가 업데이트(가격 변동)될 때마다 자산 가치 재계산 필요

    const fetchWallet = async () => {
        const { data } = await supabase
            .from('user_wallets')
            .select('*, coin:coins(*)')
            .eq('user_id', user.id);

        if (data) setWallets(data);
    };

    // 총 추정 자산 계산 (보유 포인트 + 코인 평가금액)
    const totalAssetValue = (profile?.total_points || 0) + wallets.reduce((acc, w) => {
        const currentPrice = coins.find(c => c.id === w.coin_id)?.current_price || w.coin.current_price;
        return acc + (w.amount * currentPrice);
    }, 0);

    const totalProfit = wallets.reduce((acc, w) => {
        const currentPrice = coins.find(c => c.id === w.coin_id)?.current_price || w.coin.current_price;
        return acc + ((currentPrice - w.average_buy_price) * w.amount);
    }, 0);

    return (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>총 추정 자산</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff' }}>
                    {Math.round(totalAssetValue).toLocaleString()} P
                </div>
            </div>

            <div style={{
                height: '40px',
                width: '1px',
                background: 'rgba(255,255,255,0.1)'
            }}></div>

            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>총 평가 손익</div>
                <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    color: totalProfit >= 0 ? '#ef4444' : '#3b82f6'
                }}>
                    {totalProfit > 0 ? '+' : ''}{Math.round(totalProfit).toLocaleString()} P
                </div>
            </div>
        </div>
    );
};

export default UserAssets;
