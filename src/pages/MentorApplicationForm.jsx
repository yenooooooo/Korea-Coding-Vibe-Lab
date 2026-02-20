import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CheckCircle2, AlertCircle, ArrowRight, DollarSign } from 'lucide-react';
import MentorPricing from '../components/MentorPricing';

const MentorApplicationForm = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [existingApplication, setExistingApplication] = useState(null);

    const [form, setForm] = useState({
        introduction: '',
        experience_years: 1,
        expertise: [],
        email_verified: false
    });

    const [newExpertise, setNewExpertise] = useState('');

    const expertiseOptions = [
        'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'C++', 'C#',
        'Go', 'Rust', 'TypeScript', 'SQL', 'MongoDB', 'Machine Learning',
        'AI/Deep Learning', 'Web Development', 'Mobile Development',
        'DevOps', 'Cloud', 'System Design', '알고리즘', '자료구조'
    ];

    // 기존 신청 확인
    useEffect(() => {
        if (user) {
            checkExistingApplication();
        }
    }, [user]);

    const checkExistingApplication = async () => {
        const { data, error } = await supabase
            .from('mentor_applications')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (data) {
            setExistingApplication(data);
            setForm({
                introduction: data.introduction || '',
                experience_years: data.experience_years || 1,
                expertise: data.expertise || [],
                email_verified: !!data.email_verified
            });
        }
    };

    const handleAddExpertise = () => {
        if (newExpertise && !form.expertise.includes(newExpertise)) {
            setForm({
                ...form,
                expertise: [...form.expertise, newExpertise]
            });
            setNewExpertise('');
        }
    };

    const handleRemoveExpertise = (item) => {
        setForm({
            ...form,
            expertise: form.expertise.filter(e => e !== item)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.introduction.trim()) {
            addToast('자기소개를 작성해주세요.', 'error');
            return;
        }

        if (form.expertise.length === 0) {
            addToast('전문 분야를 최소 1개 이상 선택해주세요.', 'error');
            return;
        }

        setLoading(true);

        try {
            if (existingApplication) {
                // 기존 신청 업데이트
                const { error } = await supabase
                    .from('mentor_applications')
                    .update({
                        introduction: form.introduction,
                        experience_years: form.experience_years,
                        expertise: form.expertise,
                        updated_at: new Date()
                    })
                    .eq('user_id', user.id);

                if (error) throw error;
                addToast('신청 정보가 업데이트되었습니다.', 'success');
            } else {
                // 새 신청 생성
                const { error } = await supabase
                    .from('mentor_applications')
                    .insert({
                        user_id: user.id,
                        introduction: form.introduction,
                        experience_years: form.experience_years,
                        expertise: form.expertise,
                        status: 'pending'
                    });

                if (error) throw error;
                addToast('멘토 신청이 완료되었습니다. 승인 대기 중입니다.', 'success');
                await checkExistingApplication();
            }
        } catch (error) {
            console.error('Error submitting application:', error);
            addToast('신청 중 오류가 발생했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = () => {
        if (!existingApplication) return null;

        switch (existingApplication.status) {
            case 'pending':
                return {
                    label: '⏳ 승인 대기 중',
                    color: '#f59e0b',
                    bgColor: 'rgba(245, 158, 11, 0.1)',
                    borderColor: '#f59e0b'
                };
            case 'approved':
                return {
                    label: '✅ 승인됨',
                    color: '#10b981',
                    bgColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: '#10b981'
                };
            case 'rejected':
                return {
                    label: '❌ 거절됨',
                    color: '#ef4444',
                    bgColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#ef4444'
                };
            default:
                return null;
        }
    };

    const statusBadge = getStatusBadge();

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', color: '#fff', paddingBottom: '60px' }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    padding: '40px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.15))',
                    borderRadius: '24px',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '40px',
                    textAlign: 'center'
                }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '12px', background: 'linear-gradient(135deg, #a78bfa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    👨‍🏫 멘토 신청하기
                </h1>
                <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: 0 }}>
                    경력자분들은 멘토로 가입하여 다른 학습자를 가르칠 수 있습니다
                </p>
            </motion.div>

            {/* 멘토 수익 안내 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                    padding: '30px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '20px',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    marginBottom: '40px'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    color: '#e2e8f0'
                }}>
                    <DollarSign size={28} color="#22c55e" />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        멘토 수익 안내
                    </h2>
                </div>
                <MentorPricing basePrice={35000} showCalculator={true} />
            </motion.div>

            {/* 상태 배지 */}
            {statusBadge && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        padding: '16px 20px',
                        background: statusBadge.bgColor,
                        border: `2px solid ${statusBadge.borderColor}`,
                        borderRadius: '16px',
                        marginBottom: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: statusBadge.color,
                        fontWeight: '600'
                    }}
                >
                    {statusBadge.status === 'pending' && <AlertCircle size={20} />}
                    {statusBadge.status === 'approved' && <CheckCircle2 size={20} />}
                    <span>{statusBadge.label}</span>
                </motion.div>
            )}

            {/* 신청 폼 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '24px',
                    padding: '40px',
                    backdropFilter: 'blur(10px)'
                }}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* 경력 년수 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0' }}>
                            💼 경력 년수
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="50"
                            value={form.experience_years}
                            onChange={(e) => setForm({ ...form, experience_years: parseInt(e.target.value) })}
                            style={{
                                width: '100%',
                                padding: '14px 16px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>
                            {form.experience_years}년의 경력이 있습니다
                        </p>
                    </div>

                    {/* 전문 분야 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0' }}>
                            🎯 전문 분야 (최소 1개 이상)
                        </label>

                        {/* 추천 기술 칩 */}
                        <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {expertiseOptions.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        if (!form.expertise.includes(option)) {
                                            setForm({
                                                ...form,
                                                expertise: [...form.expertise, option]
                                            });
                                        }
                                    }}
                                    disabled={form.expertise.includes(option)}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        border: form.expertise.includes(option)
                                            ? '2px solid #a855f7'
                                            : '1px solid rgba(255, 255, 255, 0.2)',
                                        background: form.expertise.includes(option)
                                            ? 'rgba(168, 85, 247, 0.2)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        color: form.expertise.includes(option) ? '#c084fc' : '#94a3b8',
                                        cursor: form.expertise.includes(option) ? 'default' : 'pointer',
                                        fontSize: '0.9rem',
                                        fontWeight: '500',
                                        transition: 'all 0.2s',
                                        opacity: form.expertise.includes(option) ? 1 : 0.7
                                    }}
                                >
                                    {form.expertise.includes(option) ? '✓ ' : ''}{option}
                                </button>
                            ))}
                        </div>

                        {/* 선택된 전문 분야 */}
                        {form.expertise.length > 0 && (
                            <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '12px' }}>
                                    선택된 분야: {form.expertise.length}개
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {form.expertise.map((item) => (
                                        <div
                                            key={item}
                                            style={{
                                                padding: '6px 12px',
                                                background: 'rgba(168, 85, 247, 0.2)',
                                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                                borderRadius: '8px',
                                                color: '#c084fc',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {item}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExpertise(item)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#ef4444',
                                                    cursor: 'pointer',
                                                    fontSize: '1rem',
                                                    padding: '0'
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 자기소개 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0' }}>
                            📝 자기소개 (최소 50자)
                        </label>
                        <textarea
                            value={form.introduction}
                            onChange={(e) => setForm({ ...form, introduction: e.target.value })}
                            placeholder="당신의 경력, 교육 철학, 특별한 강점 등을 자유롭게 소개해주세요. 최소 50자 이상 작성해주세요."
                            style={{
                                width: '100%',
                                minHeight: '150px',
                                padding: '16px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit'
                            }}
                        />
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px', textAlign: 'right' }}>
                            {form.introduction.length}/50 (최소)
                        </p>
                    </div>

                    {/* 유의사항 */}
                    <div style={{
                        padding: '16px',
                        background: 'rgba(245, 158, 11, 0.05)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '12px',
                        color: '#fbbf24'
                    }}>
                        <p style={{ margin: '0', fontSize: '0.95rem', fontWeight: '500' }}>
                            ⚠️ 유의사항:
                        </p>
                        <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '0.9rem', color: '#fcd34d' }}>
                            <li>관리자가 신청을 검토한 후 승인합니다 (1~3일 소요)</li>
                            <li>거짓 정보 입력 시 계정이 정지될 수 있습니다</li>
                            <li>승인 후 프로필 페이지에서 시간당 요금을 설정할 수 있습니다</li>
                        </ul>
                    </div>

                    {/* 제출 버튼 */}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {loading ? '처리 중...' : (
                            <>
                                멘토 신청하기
                                <ArrowRight size={20} />
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>

            {/* 승인 후 안내 */}
            {existingApplication?.status === 'approved' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        marginTop: '40px',
                        padding: '24px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05))',
                        border: '2px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '16px',
                        textAlign: 'center'
                    }}
                >
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#10b981', marginBottom: '12px' }}>
                        ✅ 축하합니다! 멘토로 승인되셨습니다
                    </h3>
                    <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
                        이제 멘토 프로필을 완성하고 수업 시간당 요금을 설정해주세요
                    </p>
                    <a
                        href="/mentor-profile-setup"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: '#10b981',
                            color: 'white',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        프로필 설정하러 가기 →
                    </a>
                </motion.div>
            )}
        </div>
    );
};

export default MentorApplicationForm;
