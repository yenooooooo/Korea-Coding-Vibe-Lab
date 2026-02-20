import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader, MessageCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const AIStudyPartner = () => {
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'error'
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: '안녕하세요! 저는 당신의 AI 스터디 파트너입니다. 코딩, 알고리즘, 데이터 구조 등 무엇이든 물어봐주세요! 📚',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // 사용자 메시지 추가
        const userMessage = {
            id: messages.length + 1,
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages([...messages, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

            const result = await model.generateContent(
                `당신은 친근하고 도움이 되는 코딩 멘토입니다. 학생의 질문에 명확하고 이해하기 쉽게 답변하세요.\n\n학생 질문: ${input}`
            );

            const aiResponse = result.response.text();

            const aiMessage = {
                id: messages.length + 2,
                text: aiResponse,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Gemini API Error:', error);
            const errorMessage = {
                id: messages.length + 2,
                text: '죄송합니다. 현재 응답을 생성할 수 없습니다. 다시 시도해주세요.',
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            height: 'calc(100vh - 120px)',
            display: 'flex',
            flexDirection: 'column',
            color: '#fff',
            paddingBottom: '60px'
        }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
                    borderRadius: '16px',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    marginBottom: '20px',
                    textAlign: 'center'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
                    <MessageCircle size={28} color="#a78bfa" />
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>AI 스터디 파트너</h1>
                </div>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem' }}>
                    언제든지 질문하세요. 저는 24/7 당신을 도와드립니다! 🤖
                </p>
            </motion.div>

            {/* 탭 네비게이션 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', padding: '6px',
                background: 'rgba(30, 41, 59, 0.5)', borderRadius: '14px',
                border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                {[
                    { id: 'chat', label: '멘토 채팅', emoji: '💬' },
                    { id: 'error', label: '에러 번역기', emoji: '🔍' }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        flex: 1, padding: '10px',
                        background: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                        border: activeTab === tab.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                        borderRadius: '10px', color: activeTab === tab.id ? '#a5b4fc' : '#94a3b8',
                        cursor: 'pointer', fontSize: '0.95rem',
                        fontWeight: activeTab === tab.id ? 'bold' : 'normal', transition: 'all 0.2s'
                    }}>
                        {tab.emoji} {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'chat' && (
                <>
                    {/* 채팅 영역 */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        marginBottom: '20px',
                        paddingRight: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px'
                    }}>
                        {messages.map((msg, idx) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    alignItems: 'flex-end',
                                    gap: '12px'
                                }}
                            >
                                {msg.sender === 'ai' && (
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        flexShrink: 0
                                    }}>
                                        🤖
                                    </div>
                                )}

                                <div style={{
                                    maxWidth: '70%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    background: msg.sender === 'user'
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : 'rgba(100, 116, 139, 0.3)',
                                    border: msg.sender === 'user'
                                        ? 'none'
                                        : '1px solid rgba(148, 163, 184, 0.2)',
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5'
                                }}>
                                    {msg.text}
                                </div>

                                {msg.sender === 'user' && (
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: 'rgba(168, 85, 247, 0.2)',
                                        border: '1px solid rgba(168, 85, 247, 0.3)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem',
                                        flexShrink: 0
                                    }}>
                                        👤
                                    </div>
                                )}
                            </motion.div>
                        ))}

                        {loading && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                                </div>
                                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>생각 중입니다...</span>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* 입력 영역 */}
                    <form onSubmit={handleSendMessage} style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '16px',
                        background: 'rgba(15, 23, 42, 0.5)',
                        borderRadius: '12px',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="질문을 입력하세요..."
                            disabled={loading}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(148, 163, 184, 0.2)',
                                borderRadius: '8px',
                                color: '#fff',
                                fontSize: '0.95rem',
                                outline: 'none',
                                cursor: loading ? 'not-allowed' : 'text',
                                opacity: loading ? 0.6 : 1
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            style={{
                                padding: '12px 20px',
                                background: loading || !input.trim()
                                    ? 'rgba(99, 102, 241, 0.3)'
                                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff',
                                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '600',
                                opacity: loading || !input.trim() ? 0.6 : 1
                            }}
                        >
                            <Send size={18} />
                            전송
                        </button>
                    </form>
                </>
            )}
            {activeTab === 'error' && <ErrorTranslator />}
        </div>
    );
};

const ErrorTranslator = () => {
    const [errorInput, setErrorInput] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleTranslate = async () => {
        if (!errorInput.trim()) return;
        setLoading(true);
        setResult(null);
        try {
            const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const prompt = `다음 에러 메시지를 초보 개발자도 이해할 수 있도록 한국어로 분석해줘.
반드시 아래 형식으로만 답변해:

[원인]
에러가 발생한 정확한 원인을 2-3문장으로 설명

[해결책]
단계별 해결 방법을 번호 없이 자연스럽게 설명

[예시]
수정 전/후 간단한 코드 예시 또는 구체적인 해결 예시

에러 메시지: ${errorInput}`;

            const response = await model.generateContent(prompt);
            const text = response.response.text();

            const causeMatch = text.match(/\[원인\]([\s\S]*?)(?=\[해결책\])/);
            const solutionMatch = text.match(/\[해결책\]([\s\S]*?)(?=\[예시\])/);
            const exampleMatch = text.match(/\[예시\]([\s\S]*?)$/);

            setResult({
                cause: causeMatch ? causeMatch[1].trim() : '원인을 분석할 수 없습니다.',
                solution: solutionMatch ? solutionMatch[1].trim() : '해결책을 생성할 수 없습니다.',
                example: exampleMatch ? exampleMatch[1].trim() : '예시를 생성할 수 없습니다.'
            });
        } catch (error) {
            console.error('Error:', error);
            setResult({
                cause: 'API 요청 중 오류가 발생했습니다.',
                solution: '잠시 후 다시 시도해주세요.',
                example: ''
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
            <div style={{
                padding: '16px',
                background: 'rgba(239, 68, 68, 0.05)',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.15)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <AlertCircle size={18} color="#ef4444" />
                    <span style={{ fontWeight: '700', color: '#fca5a5', fontSize: '0.95rem' }}>에러 메시지 입력</span>
                </div>
                <textarea
                    value={errorInput}
                    onChange={(e) => setErrorInput(e.target.value)}
                    placeholder={'TypeError: Cannot read properties of undefined (reading \'map\')\n또는 콘솔에서 복사한 에러 메시지를 붙여넣으세요...'}
                    style={{
                        width: '100%',
                        minHeight: '120px',
                        padding: '12px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(148,163,184,0.2)',
                        borderRadius: '8px',
                        color: '#e2e8f0',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                        outline: 'none',
                        fontFamily: 'monospace',
                        lineHeight: '1.5',
                        boxSizing: 'border-box'
                    }}
                />
                <button
                    onClick={handleTranslate}
                    disabled={loading || !errorInput.trim()}
                    style={{
                        marginTop: '12px',
                        padding: '12px 24px',
                        background: loading || !errorInput.trim()
                            ? 'rgba(99,102,241,0.3)'
                            : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#fff',
                        fontWeight: '700',
                        cursor: loading || !errorInput.trim() ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.95rem',
                        opacity: loading || !errorInput.trim() ? 0.6 : 1
                    }}
                >
                    {loading
                        ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> 분석 중...</>
                        : '🔍 번역하기'
                    }
                </button>
            </div>

            {result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { label: '🔴 원인', content: result.cause, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
                        { label: '🟢 해결책', content: result.solution, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
                        { label: '💡 예시', content: result.example, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' }
                    ].map((card) => (
                        <div key={card.label} style={{
                            padding: '16px',
                            background: card.bg,
                            borderRadius: '12px',
                            border: `1px solid ${card.color}25`
                        }}>
                            <div style={{ fontWeight: '800', color: card.color, marginBottom: '10px', fontSize: '0.9rem' }}>{card.label}</div>
                            <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{card.content}</div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default AIStudyPartner;
