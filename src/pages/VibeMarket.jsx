import React, { useState, useEffect } from 'react';
import { Store, Search, Filter, ShoppingCart, User as UserIcon, Calendar, Zap, ExternalLink, Code2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as LucideIcons from 'lucide-react';

const VibeMarket = () => {
    const { user, profile, refetchProfile } = useAuth();
    const { addToast } = useToast();
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [purchasedAssetIds, setPurchasedAssetIds] = useState(new Set());

    useEffect(() => {
        fetchMarketData();
    }, [user]);

    const fetchMarketData = async () => {
        setLoading(true);
        try {
            // 1. 에셋 목록 조회
            const { data: assetsData, error: assetsError } = await supabase
                .from('market_assets')
                .select('*, creator:profiles(*)')
                .order('created_at', { ascending: false });

            if (assetsError) throw assetsError;
            setAssets(assetsData);

            // 2. 내 구매 내역 조회
            if (user) {
                const { data: purchaseData } = await supabase
                    .from('market_purchases')
                    .select('asset_id')
                    .eq('user_id', user.id);

                if (purchaseData) {
                    setPurchasedAssetIds(new Set(purchaseData.map(p => p.asset_id)));
                }
            }
        } catch (err) {
            console.error('Market fetch error:', err);
            addToast('마켓 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, asset: null });

    const handleBuy = (asset) => {
        if (!user) {
            addToast('로그인이 필요한 기능입니다.', 'error');
            return;
        }

        if (profile.total_points < asset.price) {
            addToast('포인트가 부족합니다!', 'error');
            return;
        }

        setConfirmModal({ isOpen: true, asset });
    };

    const confirmPurchase = async () => {
        const { asset } = confirmModal;
        if (!asset) return;

        try {
            const { data, error } = await supabase.rpc('buy_vibe_asset', { p_asset_id: asset.id });

            if (error) throw error;

            if (data.success) {
                addToast(data.message, 'success');
                setPurchasedAssetIds(prev => new Set([...prev, asset.id]));
                refetchProfile(); // 포인트 갱신
            } else {
                addToast(data.message, 'error');
            }
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setConfirmModal({ isOpen: false, asset: null });
        }
    };

    const filteredAssets = React.useMemo(() => {
        return assets.filter(a =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.description?.toLowerCase().includes(search.toLowerCase())
        );
    }, [assets, search]);

    const [previewAsset, setPreviewAsset] = useState(null);

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px', color: '#f1f5f9' }}>
            {/* Market Header */}
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '10px',
                    padding: '8px 16px', background: 'rgba(52, 211, 153, 0.1)',
                    borderRadius: '50px', border: '1px solid rgba(52, 211, 153, 0.2)',
                    color: '#34d399', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '16px'
                }}>
                    <Store size={18} />
                    <span>Vibe Creator Economy</span>
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 10px 0', background: 'linear-gradient(to right, #fff, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Vibe Asset Market
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>AI와 협업하여 탄생한 독창적인 에셋들을 거래해보세요.</p>
            </div>

            {/* Toolbar */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                gap: '20px', marginBottom: '30px', background: 'rgba(30, 41, 59, 0.4)',
                padding: '20px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                    <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
                    <input
                        type="text"
                        placeholder="에셋 이름이나 키워드로 검색..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '12px 12px 12px 45px', background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px',
                            color: '#fff', fontSize: '0.95rem', outline: 'none'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>My Balance</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#34d399' }}>{profile?.total_points?.toLocaleString() || 0} XP</div>
                    </div>
                </div>
            </div>


            {/* Assets Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Zap className="spin-fast" size={48} color="#34d399" />
                    <p style={{ marginTop: '20px', color: '#64748b' }}>에셋들을 불러오는 보관소 탐색 중...</p>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '32px' }}>
                    <Store size={64} style={{ opacity: 0.1, marginBottom: '20px' }} />
                    <p style={{ color: '#64748b', fontSize: '1.2rem' }}>검색 결과가 없습니다. 첫 아티스트가 되어보세요!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '30px' }}>
                    {filteredAssets.map(asset => (
                        <AssetCard
                            key={asset.id}
                            asset={asset}
                            isPurchased={purchasedAssetIds.has(asset.id)}
                            isOwner={user?.id === asset.creator_id}
                            onBuy={() => handleBuy(asset)}
                            onPreview={() => setPreviewAsset(asset)}
                        />
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {previewAsset && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px'
                }} onClick={() => setPreviewAsset(null)}>
                    <div style={{
                        background: '#0f172a', width: '100%', maxWidth: '800px', borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: 'white' }}>Live Preview: {previewAsset.title}</h3>
                            <button onClick={() => setPreviewAsset(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>
                        <div style={{ height: '500px', overflow: 'auto', background: '#1e293b', position: 'relative' }}>
                            <MarketPreview code={previewAsset.code} />
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
                    zIndex: 1001, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: '#1e293b', padding: '32px', borderRadius: '24px',
                        maxWidth: '400px', width: '90%', textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}>
                        <Store size={48} color="#34d399" style={{ marginBottom: '16px' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>구매 확인</h3>
                        <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>
                            <span style={{ color: '#34d399', fontWeight: 'bold' }}>"{confirmModal.asset?.title}"</span> 에셋을<br />
                            <span style={{ color: '#facc15', fontWeight: 'bold' }}>{confirmModal.asset?.price} XP</span>에 구매하시겠습니까?
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                onClick={() => setConfirmModal({ isOpen: false, asset: null })}
                                style={{
                                    padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)',
                                    color: '#cbd5e1', border: 'none', cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmPurchase}
                                style={{
                                    padding: '12px 24px', borderRadius: '12px', background: '#34d399',
                                    color: '#064e3b', border: 'none', cursor: 'pointer', fontWeight: 'bold'
                                }}
                            >
                                구매 확정
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                .spin-fast { animation: spin 0.8s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const AssetCard = ({ asset, isPurchased, isOwner, onBuy, onPreview }) => {
    return (
        <div style={{
            background: 'rgba(30, 41, 59, 0.4)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease',
            position: 'relative'
        }}>
            {/* Preview Area (Static Image or Placeholder) */}
            <div style={{
                height: '240px', background: '#020617', display: 'flex', alignItems: 'center',
                justifyContent: 'center', position: 'relative', borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer', overflow: 'hidden'
            }} onClick={onPreview}>
                {asset.preview_image_url ? (
                    <img src={asset.preview_image_url} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                ) : (
                    <div style={{ textAlign: 'center', color: '#64748b' }}>
                        <Code2 size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                        <div style={{ fontSize: '0.8rem' }}>Click for Live Preview</div>
                    </div>
                )}

                <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '6px 16px', borderRadius: '20px', backdropFilter: 'blur(4px)', fontSize: '0.8rem', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ExternalLink size={14} /> Live Preview
                </div>

                {/* Badge for Owner/Purchased */}
                <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                    {isOwner && (
                        <span style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', fontSize: '0.7rem', borderRadius: '50px', fontWeight: 'bold' }}>MY ASSET</span>
                    )}
                    {isPurchased && !isOwner && (
                        <span style={{ padding: '6px 12px', background: '#10b981', color: '#fff', fontSize: '0.7rem', borderRadius: '50px', fontWeight: 'bold' }}>OWNED</span>
                    )}
                </div>
            </div>

            {/* Info Area */}
            <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: '0 0 5px 0', color: '#f1f5f9' }}>{asset.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {asset.description || '바이브 넘치는 창작자의 작품입니다.'}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <UserIcon size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Creator</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{asset.creator?.nickname || asset.creator?.username || 'Anonymous'}</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '15px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
                        <Zap size={16} />
                        <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>{asset.price} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>XP</span></span>
                    </div>

                    {isPurchased || isOwner ? (
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(asset.code);
                                alert('소스코드가 복사되었습니다!');
                            }}
                            style={{
                                padding: '10px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                                color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold'
                            }}
                        >
                            <Code2 size={16} />
                            Source Code
                        </button>
                    ) : (
                        <button
                            onClick={onBuy}
                            style={{
                                padding: '12px 24px', borderRadius: '12px', background: '#34d399',
                                color: '#064e3b', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 'bold',
                                boxShadow: '0 4px 12px rgba(52, 211, 153, 0.2)'
                            }}
                        >
                            <ShoppingCart size={18} />
                            Buy Asset
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// 마켓 카드용 미니 프리뷰 (JSX 실행) - Now used in Modal only
const MarketPreview = ({ code }) => {
    try {
        const cleanCode = code
            .replace(/import.*from.*;/g, '')
            .replace(/export default/g, 'const GeneratedComponent = ')
            .replace(/```[a-z]*\n?/gi, '').replace(/\n?```/gi, '').trim();

        if (!window.Babel) return <div style={{ color: '#475569', padding: '20px', textAlign: 'center' }}>Babel Loading...</div>;

        const transpiled = window.Babel.transform(cleanCode, { presets: ['react'] }).code;
        const body = `
            const { ${Object.keys(LucideIcons).filter(key => typeof LucideIcons[key] === 'function' || typeof LucideIcons[key] === 'object').join(', ')} } = LucideIcons;
            const { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } = React;
            ${transpiled}
            return GeneratedComponent;
        `;
        const Component = new Function('React', 'LucideIcons', body)(React, LucideIcons);
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <Component />
            </div>
        );
    } catch (err) {
        return (
            <div style={{ padding: '20px', color: '#ef4444', textAlign: 'center' }}>
                <Code2 size={40} style={{ marginBottom: '10px' }} />
                <p>렌더링 오류</p>
                <code style={{ fontSize: '0.8rem', background: '#000', padding: '4px' }}>{err.message}</code>
            </div>
        );
    }
};

export default VibeMarket;
