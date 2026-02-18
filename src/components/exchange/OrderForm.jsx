import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const OrderForm = ({ coin, onTradeComplete }) => {
    const { user, profile, refetchProfile } = useAuth();
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('BUY');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [myHolding, setMyHolding] = useState(null); // 보유량

    // 선택 코인 보유량 조회
    useEffect(() => {
        if (!user || !coin) { setMyHolding(null); return; }
        const fetchHolding = async () => {
            const { data } = await supabase
                .from('user_wallets')
                .select('amount, average_buy_price')
                .eq('user_id', user.id)
                .eq('coin_id', coin.id)
                .maybeSingle();
            setMyHolding(data || null);
        };
        fetchHolding();

        // 실시간 구독
        const channel = supabase
            .channel(`wallet_${coin.id}_${user.id}`)
            .on('postgres_changes', {
                event: '*', schema: 'public', table: 'user_wallets',
                filter: `user_id=eq.${user.id}`
            }, () => { fetchHolding(); })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [user, coin?.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
                throw new Error('올바른 수량을 입력해주세요.');
            }

            const rpcName = type === 'BUY' ? 'buy_coin' : 'sell_coin';
            const { data, error } = await supabase.rpc(rpcName, {
                p_coin_id: coin.id,
                p_amount: parseFloat(amount)
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            const priceStr = Number(data.price).toLocaleString();
            const totalStr = type === 'BUY'
                ? Number(data.total_cost).toLocaleString()
                : Number(data.total_value).toLocaleString();

            setMessage({
                type: 'success',
                text: type === 'BUY'
                    ? `매수 체결! ${priceStr}P x ${amount} = ${totalStr}P`
                    : `매도 체결! ${priceStr}P x ${amount} = ${totalStr}P`
            });
            setAmount('');
            refetchProfile();
            if (onTradeComplete) onTradeComplete();
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    // 퀵 퍼센트 버튼
    const handleQuickPercent = (percent) => {
        if (!coin) return;
        if (type === 'BUY') {
            const available = profile?.total_points || 0;
            const maxAmount = available / Number(coin.current_price);
            setAmount((maxAmount * percent / 100).toFixed(4));
        } else {
            const available = myHolding?.amount || 0;
            setAmount((Number(available) * percent / 100).toFixed(4));
        }
    };

    if (!coin) return <div style={{ color: '#475569', padding: '20px', textAlign: 'center' }}>코인을 선택해주세요.</div>;

    if (!user) return (
        <div style={{ color: '#475569', padding: '40px 20px', textAlign: 'center' }}>
            <p>로그인 후 거래할 수 있습니다.</p>
        </div>
    );

    const total = amount ? (parseFloat(amount) * Number(coin.current_price)) : 0;
    const isPriceUp = coin.price_change_24h >= 0;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 매수/매도 탭 */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                <button
                    onClick={() => { setType('BUY'); setAmount(''); setMessage(null); }}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                        background: type === 'BUY' ? '#ef4444' : 'rgba(255,255,255,0.04)',
                        color: type === 'BUY' ? '#fff' : '#64748b',
                        fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    매수
                </button>
                <button
                    onClick={() => { setType('SELL'); setAmount(''); setMessage(null); }}
                    style={{
                        flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                        background: type === 'SELL' ? '#3b82f6' : 'rgba(255,255,255,0.04)',
                        color: type === 'SELL' ? '#fff' : '#64748b',
                        fontWeight: 'bold', fontSize: '0.95rem', cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                >
                    매도
                </button>
            </div>

            {/* 잔고 정보 */}
            <div style={{
                padding: '12px 14px', marginBottom: '14px',
                background: 'rgba(0,0,0,0.2)', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.04)',
            }}>
                {type === 'BUY' ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span style={{ color: '#475569' }}>주문 가능</span>
                        <span style={{ color: '#f1f5f9', fontWeight: 'bold', fontFamily: 'monospace' }}>
                            {(profile?.total_points || 0).toLocaleString()} P
                        </span>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                            <span style={{ color: '#475569' }}>보유 {coin.symbol}</span>
                            <span style={{ color: '#f1f5f9', fontWeight: 'bold', fontFamily: 'monospace' }}>
                                {myHolding ? Number(myHolding.amount).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0'}
                            </span>
                        </div>
                        {myHolding && Number(myHolding.amount) > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                <span style={{ color: '#475569' }}>평균 매수가</span>
                                <span style={{ color: '#64748b', fontFamily: 'monospace' }}>
                                    {Number(myHolding.average_buy_price).toLocaleString(undefined, { minimumFractionDigits: 2 })} P
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {/* 주문 가격 (현재 시장가) */}
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>
                        주문 가격 (시장가)
                    </label>
                    <div style={{
                        background: 'rgba(255,255,255,0.03)', padding: '12px 14px',
                        borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <span style={{ fontSize: '0.8rem', color: '#475569' }}>시장가</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                                fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace',
                                color: isPriceUp ? '#ef4444' : '#3b82f6',
                            }}>
                                {Number(coin.current_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                            <span style={{ color: '#475569', fontSize: '0.85rem' }}>P</span>
                        </div>
                    </div>
                </div>

                {/* 주문 수량 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>
                        주문 수량
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="number"
                            step="0.0001"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.0000"
                            style={{
                                width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)', padding: '12px 14px',
                                borderRadius: '10px', color: '#f1f5f9', fontSize: '1.1rem',
                                textAlign: 'right', outline: 'none', fontFamily: 'monospace',
                                paddingLeft: '60px',
                            }}
                        />
                        <span style={{
                            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                            color: '#475569', fontWeight: 'bold', fontSize: '0.85rem',
                        }}>
                            {coin.symbol}
                        </span>
                    </div>

                    {/* 퀵 퍼센트 버튼 */}
                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        {[25, 50, 75, 100].map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => handleQuickPercent(p)}
                                style={{
                                    flex: 1, padding: '6px', borderRadius: '6px',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    background: 'rgba(255,255,255,0.02)', color: '#64748b',
                                    fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.target.style.background = type === 'BUY' ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)'; e.target.style.color = type === 'BUY' ? '#ef4444' : '#3b82f6'; }}
                                onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.02)'; e.target.style.color = '#64748b'; }}
                            >
                                {p}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* 주문 총액 */}
                <div style={{
                    marginTop: 'auto', paddingTop: '14px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                }}>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', marginBottom: '14px',
                        alignItems: 'baseline',
                    }}>
                        <span style={{ fontWeight: 'bold', color: '#94a3b8', fontSize: '0.9rem' }}>주문 총액</span>
                        <span style={{ fontSize: '1.3rem', fontWeight: '800', fontFamily: 'monospace', color: '#f1f5f9' }}>
                            {total > 0 ? total.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0'} P
                        </span>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !amount || parseFloat(amount) <= 0}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                            background: type === 'BUY'
                                ? (amount && parseFloat(amount) > 0 ? '#ef4444' : 'rgba(239,68,68,0.2)')
                                : (amount && parseFloat(amount) > 0 ? '#3b82f6' : 'rgba(59,130,246,0.2)'),
                            color: amount && parseFloat(amount) > 0 ? '#fff' : '#64748b',
                            fontSize: '1.05rem', fontWeight: 'bold',
                            cursor: loading || !amount || parseFloat(amount) <= 0 ? 'not-allowed' : 'pointer',
                            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                            boxShadow: amount && parseFloat(amount) > 0
                                ? (type === 'BUY' ? '0 4px 12px rgba(239,68,68,0.25)' : '0 4px 12px rgba(59,130,246,0.25)')
                                : 'none',
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading && <Loader2 className="spin" size={20} />}
                        {type === 'BUY' ? '매수하기' : '매도하기'}
                    </button>

                    {message && (
                        <div style={{
                            marginTop: '10px', padding: '10px 12px', borderRadius: '8px',
                            background: message.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`,
                            color: message.type === 'success' ? '#4ade80' : '#f87171',
                            textAlign: 'center', fontSize: '0.85rem',
                        }}>
                            {message.text}
                        </div>
                    )}
                </div>
            </form>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                input[type=number]::-webkit-outer-spin-button,
                input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                input[type=number] { -moz-appearance: textfield; }
            `}</style>
        </div>
    );
};

export default OrderForm;
