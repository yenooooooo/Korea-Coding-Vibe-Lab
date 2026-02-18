import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, Radio, CheckCircle, Bug, HelpCircle, Lightbulb } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FeedbackModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [category, setCategory] = useState('BUG_REPORT');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = [
        { id: 'BUG_REPORT', label: '버그 제보', icon: <Bug size={18} />, color: '#ef4444', desc: '서비스 이용 중 오류가 발생했어요.' },
        { id: 'INQUIRY', label: '1:1 문의', icon: <HelpCircle size={18} />, color: '#6366f1', desc: '궁금한 점이나 도움이 필요해요.' },
        { id: 'SUGGESTION', label: '기능 제안', icon: <Lightbulb size={18} />, color: '#facc15', desc: '이런 기능이 있으면 좋겠어요!' },
        { id: 'OTHER', label: '기타 의견', icon: <MessageSquare size={18} />, color: '#94a3b8', desc: '그 외 하고 싶은 말이 있어요.' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            addToast('내용을 입력해주세요.', 'error');
            return;
        }

        try {
            setIsSubmitting(true);
            const { error } = await supabase
                .from('feedback')
                .insert([{
                    user_id: user.id,
                    category,
                    content,
                    status: 'PENDING'
                }]);

            if (error) throw error;

            addToast('소중한 의견이 접수되었습니다! 💌', 'success');
            setContent('');
            setCategory('BUG_REPORT');
            onClose();

        } catch (error) {
            console.error('Error submitting feedback:', error);
            addToast('전송 중 오류가 발생했습니다.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 99999, // Increased z-index to maximum
                    padding: '20px'
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        background: '#1e293b',
                        width: '100%',
                        maxWidth: '500px',
                        borderRadius: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '20px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(255,255,255,0.02)'
                    }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, color: '#f8fafc' }}>
                            피드백 & 문의 보내기
                        </h2>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <form onSubmit={handleSubmit} style={{ padding: '24px' }}>

                        {/* Category Selection */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                어떤 내용을 보내시나요?
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: category === cat.id
                                                ? `1px solid ${cat.color}`
                                                : '1px solid rgba(255,255,255,0.05)',
                                            background: category === cat.id
                                                ? `${cat.color}15`
                                                : 'rgba(255,255,255,0.02)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        <div style={{ color: cat.color }}>{cat.icon}</div>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: category === cat.id ? '#fff' : '#cbd5e1' }}>
                                                {cat.label}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{cat.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content Input */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                상세 내용
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="내용을 자세히 적어주시면 빠른 처리에 도움이 됩니다."
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: '#0f172a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    resize: 'none',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5',
                                    lineHeight: '1.5',
                                    verticalAlign: 'top',
                                    fontFamily: 'inherit',
                                    boxSizing: 'border-box' // Fix for width overflow
                                }}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                background: isSubmitting ? '#475569' : '#6366f1',
                                color: 'white',
                                border: 'none',
                                fontWeight: 'bold',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '1rem',
                                transition: 'background 0.2s'
                            }}
                        >
                            {isSubmitting ? (
                                '전송 중...'
                            ) : (
                                <>
                                    <Send size={18} />
                                    보내기
                                </>
                            )}
                        </button>

                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default FeedbackModal;
