import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TradingView = ({ coin }) => {
    const [history, setHistory] = useState([]);
    const [prevPrice, setPrevPrice] = useState(null);
    const [priceFlash, setPriceFlash] = useState(null); // 'up' | 'down' | null
    const prevCoinIdRef = useRef(null);

    // 코인 변경 또는 마운트 시 히스토리 로드 + 구독
    useEffect(() => {
        if (!coin) return;

        // 코인이 변경되면 가격 플래시만 리셋 (히스토리는 fetch로 교체)
        if (prevCoinIdRef.current !== coin.id) {
            setPrevPrice(null);
            prevCoinIdRef.current = coin.id;
        }

        const fetchHistory = async () => {
            // 최근 2시간 데이터만 조회 (오래된 끊긴 데이터 제외)
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
            const { data } = await supabase
                .from('coin_history')
                .select('*')
                .eq('coin_id', coin.id)
                .gte('created_at', twoHoursAgo)
                .order('created_at', { ascending: true })
                .limit(200);

            if (data && data.length > 0) {
                setHistory(data.map(d => ({
                    ...d,
                    time: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    price: Number(d.price),
                })));
            } else {
                setHistory([]);
            }
        };

        fetchHistory();

        // Realtime 구독
        const channel = supabase
            .channel(`coin_history_live_${coin.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'coin_history',
                filter: `coin_id=eq.${coin.id}`
            }, (payload) => {
                const newPoint = {
                    ...payload.new,
                    time: new Date(payload.new.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    price: Number(payload.new.price),
                };
                setHistory(prev => [...prev.slice(-199), newPoint]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [coin?.id]);

    // 가격 변동 플래시 효과
    useEffect(() => {
        if (!coin) return;
        if (prevPrice !== null && prevPrice !== coin.current_price) {
            setPriceFlash(coin.current_price > prevPrice ? 'up' : 'down');
            const timer = setTimeout(() => setPriceFlash(null), 600);
            return () => clearTimeout(timer);
        }
        setPrevPrice(coin.current_price);
    }, [coin?.current_price]);

    if (!coin) {
        return (
            <div style={{ color: '#94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                코인을 선택해주세요
            </div>
        );
    }

    const isPriceUp = coin.price_change_24h >= 0;
    const color = isPriceUp ? '#ef4444' : '#3b82f6';
    const gradientId = `gradient_${coin.id}`;

    // 24h 고/저 (history에서 계산하거나 coin 객체에서)
    const high24h = coin.high_24h || (history.length > 0 ? Math.max(...history.map(h => h.price)) : coin.current_price);
    const low24h = coin.low_24h || (history.length > 0 ? Math.min(...history.map(h => h.price)) : coin.current_price);

    // Y축 범위
    const prices = history.map(h => h.price);
    const yMin = prices.length > 0 ? Math.floor(Math.min(...prices) * 0.998) : 0;
    const yMax = prices.length > 0 ? Math.ceil(Math.max(...prices) * 1.002) : 100;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 상단: 코인 정보 + 현재가 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '2.2rem' }}>{coin.icon}</span>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: '#f1f5f9' }}>{coin.name}</h2>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{coin.symbol}/VP</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '2rem', fontWeight: '800', fontFamily: 'monospace',
                        color: priceFlash === 'up' ? '#ef4444' : priceFlash === 'down' ? '#3b82f6' : '#f1f5f9',
                        transition: 'color 0.3s ease',
                        textShadow: priceFlash ? `0 0 20px ${priceFlash === 'up' ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)'}` : 'none',
                    }}>
                        {Number(coin.current_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: '#64748b', marginLeft: '4px' }}>P</span>
                    </div>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '2px 8px', borderRadius: '6px',
                        background: isPriceUp ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)',
                        color: color, fontSize: '0.95rem', fontWeight: 'bold',
                    }}>
                        {isPriceUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {isPriceUp ? '+' : ''}{Number(coin.price_change_24h).toFixed(2)}%
                    </div>
                </div>
            </div>

            {/* 24h 통계 바 */}
            <div style={{
                display: 'flex', gap: '20px', marginBottom: '12px',
                padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.03)',
            }}>
                <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>24H 고가</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ef4444', fontFamily: 'monospace' }}>
                        {Number(high24h).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>24H 저가</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#3b82f6', fontFamily: 'monospace' }}>
                        {Number(low24h).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>24H 거래대금</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {coin.volume_24h ? Number(coin.volume_24h).toLocaleString(undefined, { maximumFractionDigits: 0 }) + ' P' : '-'}
                    </div>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '2px' }}>데이터</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {history.length}개
                    </div>
                </div>
            </div>

            {/* 차트 */}
            <div style={{ flex: 1, minHeight: '250px' }}>
                {history.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={history} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis
                                dataKey="time"
                                stroke="#475569"
                                tick={{ fill: '#475569', fontSize: 11 }}
                                tickLine={false}
                                axisLine={{ stroke: 'rgba(255,255,255,0.05)' }}
                                interval="preserveStartEnd"
                                minTickGap={60}
                            />
                            <YAxis
                                domain={[yMin, yMax]}
                                stroke="#475569"
                                tick={{ fill: '#475569', fontSize: 11 }}
                                tickLine={false}
                                axisLine={false}
                                width={55}
                                tickFormatter={(v) => v.toLocaleString()}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                                }}
                                itemStyle={{ color: color, fontWeight: 'bold' }}
                                labelStyle={{ color: '#94a3b8', fontSize: '0.8rem' }}
                                formatter={(value) => [`${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })} P`, '가격']}
                            />
                            <Area
                                type="monotone"
                                dataKey="price"
                                stroke={color}
                                strokeWidth={2}
                                fillOpacity={1}
                                fill={`url(#${gradientId})`}
                                dot={false}
                                activeDot={{ r: 4, stroke: color, strokeWidth: 2, fill: '#0f172a' }}
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{
                        height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        color: '#475569', flexDirection: 'column', gap: '8px',
                    }}>
                        <div style={{ fontSize: '2rem', opacity: 0.3 }}>{coin.icon}</div>
                        <p style={{ margin: 0 }}>차트 데이터 수집 중...</p>
                        <p style={{ margin: 0, fontSize: '0.8rem' }}>가격이 업데이트되면 자동으로 표시됩니다.</p>
                    </div>
                )}
            </div>

            {/* 코인 설명 */}
            <div style={{
                marginTop: '12px', padding: '12px 16px',
                background: 'rgba(0,0,0,0.15)', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.03)',
            }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5' }}>{coin.description}</p>
            </div>
        </div>
    );
};

export default TradingView;
