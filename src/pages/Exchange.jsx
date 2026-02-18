import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Wallet, ArrowRightLeft, History, Loader2 } from 'lucide-react';
import CoinList from '../components/exchange/CoinList';
import TradingView from '../components/exchange/TradingView';
import OrderForm from '../components/exchange/OrderForm';
import UserAssets from '../components/exchange/UserAssets';
import UserPortfolio from '../components/exchange/UserPortfolio';

const Exchange = () => {
    const { user, refetchProfile } = useAuth();
    const [coins, setCoins] = useState([]);
    const [selectedCoinId, setSelectedCoinId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tradeVersion, setTradeVersion] = useState(0); // 거래 발생시 증가하여 하위 컴포넌트 갱신

    // selectedCoin 객체는 coins 배열에서 실시간으로 파생됨 (항상 최신 상태 유지)
    const selectedCoin = coins.find(c => c.id === selectedCoinId) || null;

    // 마운트 시 히스토리 backfill (갭이 있으면 2시간치 자동 생성)
    useEffect(() => {
        const init = async () => {
            await supabase.rpc('backfill_coin_history');
        };
        init();
    }, []);

    // Market Maker Loop: 3초마다 시장 가격 업데이트 + coins 직접 갱신
    useEffect(() => {
        // 첫 1초 후 즉시 1회 실행 (로딩 직후 바로 가격 변동 시작)
        const initialTimer = setTimeout(async () => {
            await supabase.rpc('update_market_prices');
            const { data } = await supabase.from('coins').select('*').order('symbol', { ascending: true });
            if (data) setCoins(data);
        }, 1000);

        const marketInterval = setInterval(async () => {
            const { error } = await supabase.rpc('update_market_prices');
            if (error) {
                console.error('Market update error:', error);
                return;
            }
            const { data } = await supabase
                .from('coins')
                .select('*')
                .order('symbol', { ascending: true });
            if (data) setCoins(data);
        }, 3000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(marketInterval);
        };
    }, []);

    // 초기 데이터 로드 및 Realtime 구독
    useEffect(() => {
        fetchCoins();

        // 실시간 가격 변동 구독
        const channel = supabase
            .channel('public:coins')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'coins' }, (payload) => {
                // console.log('Coin update received:', payload.new); // 디버깅용
                setCoins(prevCoins => prevCoins.map(coin =>
                    coin.id === payload.new.id ? { ...coin, ...payload.new } : coin
                ));
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []); // 의존성 빈 배열: 마운트 시 한 번만 구독 설정 (재연결 방지)

    const fetchCoins = async () => {
        try {
            const { data, error } = await supabase
                .from('coins')
                .select('*')
                .order('symbol', { ascending: true });

            if (error) throw error;
            setCoins(data);
            // 초기 선택 코인 설정
            if (data.length > 0 && !selectedCoinId) {
                setSelectedCoinId(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching coins:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', color: '#fff' }}>
                <Loader2 className="spin" size={48} />
                <style>{`
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', color: '#fff', paddingBottom: '40px' }}>
            {/* 헤더 */}
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'linear-gradient(to right, #22c55e, #3b82f6)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        <TrendingUp color="#22c55e" /> Vibe Coin Exchange (VCX)
                    </h1>
                    <p style={{ color: '#94a3b8' }}>Real-time Crypto Trading Simulation</p>
                </div>
                <UserAssets coins={coins} />
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '300px 1fr 350px',
                gridTemplateRows: '500px auto',
                gap: '20px',
                minHeight: '600px'
            }}>
                {/* 좌측: 코인 목록 (Row 1 & 2 Span) */}
                <div style={{
                    gridRow: '1 / span 2',
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <CoinList
                        coins={coins}
                        selectedCoin={selectedCoin}
                        onSelect={(coin) => setSelectedCoinId(coin.id)}
                    />
                </div>

                {/* 중앙: 차트 (Row 1) */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <TradingView coin={selectedCoin} />
                </div>

                {/* 우측: 주문창 (Row 1) */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '20px'
                }}>
                    <OrderForm coin={selectedCoin} onTradeComplete={() => { setTradeVersion(v => v + 1); refetchProfile(); }} />
                </div>

                {/* 하단: 내 포트폴리오 (Row 2, Span 2 columns) */}
                <div style={{
                    gridColumn: '2 / span 2',
                    background: 'rgba(30, 41, 59, 0.4)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '300px'
                }}>
                    <UserPortfolio coins={coins} />
                </div>
            </div>
        </div>
    );
};

export default Exchange;
