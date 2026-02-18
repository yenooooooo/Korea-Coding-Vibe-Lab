import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

const CoinList = ({ coins, selectedCoin, onSelect }) => {
    const [search, setSearch] = useState('');
    const [flashStates, setFlashStates] = useState({});
    const prevPricesRef = useRef({});

    // 가격 변동 플래시 감지
    useEffect(() => {
        const newFlash = {};
        coins.forEach(coin => {
            const prev = prevPricesRef.current[coin.id];
            if (prev !== undefined && prev !== Number(coin.current_price)) {
                newFlash[coin.id] = Number(coin.current_price) > prev ? 'up' : 'down';
            }
        });

        if (Object.keys(newFlash).length > 0) {
            setFlashStates(prev => ({ ...prev, ...newFlash }));
            const timer = setTimeout(() => {
                setFlashStates(prev => {
                    const cleared = { ...prev };
                    Object.keys(newFlash).forEach(k => { cleared[k] = null; });
                    return cleared;
                });
            }, 500);
        }

        const prices = {};
        coins.forEach(c => { prices[c.id] = Number(c.current_price); });
        prevPricesRef.current = prices;
    }, [coins]);

    const filtered = search
        ? coins.filter(c =>
            c.symbol.toLowerCase().includes(search.toLowerCase()) ||
            c.name.toLowerCase().includes(search.toLowerCase()))
        : coins;

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* 검색 */}
            <div style={{
                padding: '12px 12px 8px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 10px', borderRadius: '8px',
                    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
                }}>
                    <Search size={14} color="#475569" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="코인 검색..."
                        style={{
                            flex: 1, background: 'none', border: 'none', outline: 'none',
                            color: '#f1f5f9', fontSize: '0.85rem',
                        }}
                    />
                </div>
            </div>

            {/* 헤더 */}
            <div style={{
                padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.75rem', color: '#475569', fontWeight: 'bold',
            }}>
                <span>코인명</span>
                <span>현재가 / 변동률</span>
            </div>

            {/* 코인 목록 */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {filtered.map((coin) => {
                    const isUp = coin.price_change_24h >= 0;
                    const isSelected = selectedCoin && selectedCoin.id === coin.id;
                    const flash = flashStates[coin.id];

                    const flashBg = flash === 'up'
                        ? 'rgba(239, 68, 68, 0.12)'
                        : flash === 'down'
                            ? 'rgba(59, 130, 246, 0.12)'
                            : null;

                    return (
                        <div
                            key={coin.id}
                            onClick={() => onSelect(coin)}
                            style={{
                                padding: '14px 16px',
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                cursor: 'pointer',
                                background: flashBg || (isSelected ? 'rgba(255,255,255,0.05)' : 'transparent'),
                                borderLeft: isSelected ? '3px solid #6366f1' : '3px solid transparent',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                transition: 'background 0.3s ease, border-left 0.2s ease',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.3rem' }}>{coin.icon || '🪙'}</span>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#f1f5f9' }}>{coin.symbol}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569' }}>{coin.name}</div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{
                                    fontWeight: 'bold', fontSize: '0.95rem', fontFamily: 'monospace',
                                    color: flash === 'up' ? '#ef4444' : flash === 'down' ? '#3b82f6' : '#f1f5f9',
                                    transition: 'color 0.3s ease',
                                }}>
                                    {Number(coin.current_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <div style={{
                                    fontSize: '0.8rem',
                                    color: isUp ? '#ef4444' : '#3b82f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '2px',
                                    fontWeight: 'bold',
                                }}>
                                    {isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {isUp ? '+' : ''}{Number(coin.price_change_24h).toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                .coin-list-scroll::-webkit-scrollbar { width: 3px; }
                .coin-list-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
            `}</style>
        </div>
    );
};

export default CoinList;
