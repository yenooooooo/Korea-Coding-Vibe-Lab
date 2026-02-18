import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { Sparkles, Terminal, Play, Save, Trash2, Code2, Layers, Zap, Share2, DollarSign, X, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import { generateVibeComponent } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VibeSandbox = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [prompt, setPrompt] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [publishData, setPublishData] = useState({ title: '', description: '', price: 100 });
    const [isPublishing, setIsPublishing] = useState(false);
    const [scale, setScale] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handlePublish = async () => {
        if (!publishData.title.trim() || !generatedCode) return;
        setIsPublishing(true);
        try {
            const { error: publishError } = await supabase
                .from('market_assets')
                .insert([{
                    creator_id: user.id,
                    title: publishData.title,
                    description: publishData.description,
                    code: generatedCode,
                    price: publishData.price
                }]);

            if (publishError) throw publishError;
            addToast('마켓에 성공적으로 등록되었습니다! 🎉', 'success');
            setIsPublishModalOpen(false);
        } catch (err) {
            addToast('등록 실패: ' + err.message, 'error');
        } finally {
            setIsPublishing(false);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setError(null);
        try {
            const code = await generateVibeComponent(prompt);
            setGeneratedCode(code);
            // 최신 생성물 히스토리에 추가
            setHistory(prev => [{ prompt, code, id: Date.now() }, ...prev.slice(0, 9)]);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 20px',
            color: '#f1f5f9',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
        }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '50px',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    color: '#818cf8',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    marginBottom: '16px'
                }}>
                    <Sparkles size={16} />
                    <span>AI-Powered Vibe Coding Playground</span>
                </div>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '800',
                    margin: 0,
                    background: 'linear-gradient(to right, #fff, #6366f1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Vibe Sandbox
                </h1>
                <p style={{ color: '#64748b', marginTop: '10px' }}>
                    상상하는 웹 요소를 프롬프트로 입력해보세요. 바이브 넘치는 AI가 즉시 코드로 구현해줍니다.
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '30px',
                flex: 1
            }}>
                {/* Left: Input & History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Prompt Input */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                            <Terminal size={18} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Prompt Interface</span>
                        </div>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="예: 현대적이고 힙한 느낌의 보라색 글로우가 있는 프로필 카드 만들어줘."
                            style={{
                                width: '100%',
                                minHeight: '120px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                padding: '16px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                resize: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !prompt.trim()}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                color: '#fff',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <Zap className="spin-fast" size={20} />
                                    <span>Vibing through code...</span>
                                </>
                            ) : (
                                <>
                                    <Play size={20} />
                                    <span>Generate Magic</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Quick Suggestions */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {[
                            '네온 싸인 버튼',
                            '글래스모피즘 뉴스레터',
                            '사이버펑크 대시보드',
                            '애니메이션 프로필 카드'
                        ].map(s => (
                            <button
                                key={s}
                                onClick={() => setPrompt(s)}
                                style={{
                                    padding: '8px 14px',
                                    borderRadius: '50px',
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    color: '#94a3b8',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                # {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right: Preview */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: isFullscreen ? '0' : '24px',
                    border: isFullscreen ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '500px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    position: isFullscreen ? 'fixed' : 'relative',
                    top: isFullscreen ? 0 : 'auto',
                    left: isFullscreen ? 0 : 'auto',
                    width: isFullscreen ? '100vw' : 'auto',
                    height: isFullscreen ? '100vh' : 'auto',
                    zIndex: isFullscreen ? 9999 : 1,
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
                            <Layers size={18} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Live Preview</span>
                        </div>

                        {/* Control Toolbar */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '6px 12px', borderRadius: '12px' }}>
                            <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))} title="Zoom Out" style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex' }}><ZoomOut size={16} /></button>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8', minWidth: '40px', textAlign: 'center' }}>{Math.round(scale * 100)}%</span>
                            <button onClick={() => setScale(s => Math.min(3, s + 0.1))} title="Zoom In" style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex' }}><ZoomIn size={16} /></button>
                            <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
                            <button onClick={() => setIsFullscreen(!isFullscreen)} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', display: 'flex' }}>
                                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                        </div>

                        {generatedCode && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    style={{
                                        background: 'rgba(52, 211, 153, 0.1)',
                                        border: '1px solid rgba(52, 211, 153, 0.2)',
                                        color: '#34d399',
                                        padding: '8px 14px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold'
                                    }}
                                    onClick={() => setIsPublishModalOpen(true)}
                                >
                                    <Share2 size={14} />
                                    {/* Text hidden on small screens if needed, but keeping simple */}
                                    Publish
                                </button>
                                <button
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '0.8rem'
                                    }}
                                    onClick={() => {
                                        navigator.clipboard.writeText(generatedCode);
                                        addToast('코드가 복사되었습니다! 📋', 'success');
                                    }}
                                >
                                    <Code2 size={14} />
                                    Copy Code
                                </button>
                            </div>
                        )}
                    </div>

                    <div style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        position: 'relative',
                        overflow: 'auto', // Allow scrolling if scaled content is big, or just for access
                        display: 'flex',
                        alignItems: 'center', // Center when small
                        justifyContent: 'center'
                    }}>
                        {isGenerating ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                                <div className="pulse-circle" />
                                <p style={{ color: '#475569', fontSize: '0.9rem' }}>AI가 아트를 굽는 중...</p>
                            </div>
                        ) : generatedCode ? (
                            <div style={{
                                transform: `scale(${scale})`,
                                transformOrigin: 'center center', // Center zoom
                                width: '100%', // Allow content to take full width
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.2s ease'
                            }}>
                                <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>
                                    <DynamicRenderer code={generatedCode} />
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#475569' }}>
                                <Sparkles size={48} style={{ opacity: 0.1, marginBottom: '10px' }} />
                                <p>프롬프트를 입력해 마법을 시작하세요</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Publish Modal */}
            {isPublishModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '20px'
                }}>
                    <div style={{
                        background: '#1e293b', padding: '30px', borderRadius: '24px',
                        width: '100%', maxWidth: '450px', border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', flexDirection: 'column', gap: '20px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Share2 size={24} color="#34d399" />
                                Publish to Market
                            </h2>
                            <button onClick={() => setIsPublishModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>Asset Title</label>
                                <input
                                    type="text"
                                    placeholder="멋진 컴포넌트 이름"
                                    value={publishData.title}
                                    onChange={e => setPublishData(prev => ({ ...prev, title: e.target.value }))}
                                    style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>Description</label>
                                <textarea
                                    placeholder="컴포넌트의 특징을 간단히 설명해주세요."
                                    value={publishData.description}
                                    onChange={e => setPublishData(prev => ({ ...prev, description: e.target.value }))}
                                    style={{ width: '100%', padding: '12px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#fff', outline: 'none', height: '80px', resize: 'none', boxSizing: 'border-box' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>Price (XP)</label>
                                <div style={{ position: 'relative' }}>
                                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#34d399' }} />
                                    <input
                                        type="number"
                                        value={publishData.price}
                                        onChange={e => setPublishData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                                        style={{ width: '100%', padding: '12px 12px 12px 35px', background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#fff', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePublish}
                            disabled={isPublishing || !publishData.title.trim()}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff', border: 'none', fontWeight: 'bold', fontSize: '1rem',
                                cursor: isPublishing ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                marginTop: '10px'
                            }}
                        >
                            {isPublishing ? <Zap className="spin-fast" size={20} /> : <Share2 size={20} />}
                            <span>{isPublishing ? 'Publishing...' : 'List on Market'}</span>
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                .spin-fast { animation: spin 0.6s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
                
                .pulse-circle {
                    width: 40px;
                    height: 40px;
                    background: #6366f1;
                    border-radius: 50%;
                    box-shadow: 0 0 20px #6366f1;
                    animation: pulse 1.5s ease-in-out infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1.1); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

// 동적 코드를 실행하는 컴포넌트
const DynamicRenderer = React.memo(({ code }) => {
    const Component = React.useMemo(() => {
        try {
            // 1. imports와 컴포넌트 코드 분리 및 Babel 변환
            let cleanCode = code
                // Remove imports (multi-line supported)
                .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
                // Remove side-effect imports
                .replace(/import\s+['"][^'"]+['"];?/g, '')
                // Handle export default
                .replace(/export\s+default\s+/g, 'const GeneratedComponent = ')
                // Remove named exports (keep the declaration)
                .replace(/export\s+(const|let|var|function|class)/g, '$1');

            // 추가 안전 장치: 마크다운 백틱이 남아있을 경우 제거
            cleanCode = cleanCode.replace(/```[a-z]*\n?/gi, '').replace(/\n?```/gi, '').trim();

            // Babel을 이용한 JSX -> JS 변환
            if (!window.Babel) {
                throw new Error("Babel loader가 아직 준비되지 않았습니다. 잠시만 기다려주세요.");
            }

            const transpiled = window.Babel.transform(cleanCode, {
                presets: ['react']
            }).code;

            // 2. 누락된 아이콘 감지 및 폴백 처리 (hallucination 방지)
            const availableIcons = Object.keys(LucideIcons).filter(key => typeof LucideIcons[key] === 'function' || typeof LucideIcons[key] === 'object');
            const availableSet = new Set(availableIcons);

            // 코드에서 사용된 컴포넌트 이름 추출 (<IconName ...)
            const usedComponents = new Set(cleanCode.match(/<([A-Z][a-zA-Z0-9]*)/g)?.map(s => s.slice(1)) || []);

            // Lucide에 없고, 코드 내에서 정의되지 않은 것 같은 컴포넌트 식별
            const missingComponents = [...usedComponents].filter(c => {
                if (availableSet.has(c)) return false; // 이미 존재함
                if (c === 'GeneratedComponent') return false; // 메인 컴포넌트
                // 코드 내에서 정의된 흔적이 있으면 패스 (const X, function X, class X 등)
                if (new RegExp(`(const|let|var|function|class)\\s+${c}\\b`).test(cleanCode)) return false;
                return true;
            });

            // 폴백 정의 생성 (예: const Memory = LucideIcons.HelpCircle;)
            const fallbackDef = missingComponents.map(c => `const ${c} = LucideIcons.HelpCircle;`).join('\n');

            const body = `
                const { ${availableIcons.join(', ')} } = LucideIcons;
                const { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } = React;
                
                // Fallback for missing icons
                ${fallbackDef}
                
                ${transpiled}
                return GeneratedComponent;
            `;

            // Function 생성자를 이용해 리액트 컴포넌트 생성
            return new Function('React', 'LucideIcons', body)(React, LucideIcons);
        } catch (err) {
            return () => (
                <div style={{ padding: '20px', color: '#f87171', fontSize: '0.8rem', textAlign: 'left' }}>
                    <p style={{ fontWeight: 'bold' }}>⚠️ Rendering Error</p>
                    <code style={{ background: 'rgba(0,0,0,0.5)', padding: '10px', display: 'block' }}>{err.message}</code>
                </div>
            );
        }
    }, [code]);

    return <Component />;
});

export default VibeSandbox;
