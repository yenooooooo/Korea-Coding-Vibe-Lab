import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Save, AlertCircle, Clock } from 'lucide-react';

const MentorProfileSetup = () => {
    const { user, profile } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mentorProfile, setMentorProfile] = useState(null);
    const [isApproved, setIsApproved] = useState(false);

    const [form, setForm] = useState({
        bio: '',
        hourly_rate: 50000,
        availability: 'available',
        max_students_per_week: 10,
        introduction_message: ''
    });

    useEffect(() => {
        checkMentorStatus();
    }, [user]);

    const checkMentorStatus = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // 멘토 신청 상태 확인
            const { data: appData } = await supabase
                .from('mentor_applications')
                .select('status')
                .eq('user_id', user.id)
                .single();

            if (appData?.status !== 'approved') {
                setIsApproved(false);
                addToast('먼저 멘토 신청을 승인받아야 합니다', 'error');
                return;
            }

            setIsApproved(true);

            // 멘토 프로필 조회
            const { data: mentorData } = await supabase
                .from('mentors')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (mentorData) {
                setMentorProfile(mentorData);
                setForm({
                    bio: mentorData.bio || '',
                    hourly_rate: mentorData.hourly_rate || 50000,
                    availability: mentorData.availability || 'available',
                    max_students_per_week: mentorData.max_students_per_week || 10,
                    introduction_message: mentorData.introduction_message || ''
                });
            }
        } catch (error) {
            console.error('Error checking mentor status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (form.hourly_rate < 10000) {
            addToast('시간당 요금은 최소 10,000원 이상이어야 합니다', 'error');
            return;
        }

        setSaving(true);
        try {
            if (mentorProfile) {
                // 기존 프로필 업데이트
                const { error } = await supabase
                    .from('mentors')
                    .update({
                        bio: form.bio,
                        hourly_rate: form.hourly_rate,
                        availability: form.availability,
                        max_students_per_week: form.max_students_per_week,
                        introduction_message: form.introduction_message,
                        updated_at: new Date()
                    })
                    .eq('user_id', user.id);

                if (error) throw error;
                addToast('프로필이 업데이트되었습니다', 'success');
            }

            await checkMentorStatus();
        } catch (error) {
            console.error('Error saving:', error);
            addToast('저장 중 오류가 발생했습니다', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>로딩 중...</div>;
    }

    if (!isApproved) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', color: '#fff', paddingBottom: '60px' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        padding: '40px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '16px',
                        textAlign: 'center'
                    }}
                >
                    <AlertCircle size={48} color="#fca5a5" style={{ marginBottom: '20px', marginLeft: 'auto', marginRight: 'auto' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fca5a5', marginBottom: '12px' }}>
                        멘토 신청이 아직 승인되지 않았습니다
                    </h2>
                    <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>
                        먼저 멘토 신청을 완료하고 관리자의 승인을 기다려주세요
                    </p>
                    <a
                        href="/mentor-application"
                        style={{
                            display: 'inline-block',
                            padding: '12px 24px',
                            background: '#ef4444',
                            color: '#fff',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}
                    >
                        멘토 신청하기 →
                    </a>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', color: '#fff', paddingBottom: '60px' }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    padding: '40px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(99, 102, 241, 0.15))',
                    borderRadius: '24px',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '40px',
                    textAlign: 'center'
                }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '12px', background: 'linear-gradient(135deg, #6ee7b7, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    ✅ 멘토 프로필 설정
                </h1>
                <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: 0 }}>
                    당신의 멘토 프로필을 완성하고 수업을 시작하세요
                </p>
            </motion.div>

            {/* 설정 폼 */}
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
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* 시간당 요금 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0' }}>
                            💰 시간당 요금 (원)
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>₩</span>
                            <input
                                type="number"
                                min="10000"
                                step="5000"
                                value={form.hourly_rate}
                                onChange={(e) => setForm({ ...form, hourly_rate: parseInt(e.target.value) })}
                                style={{
                                    flex: 1,
                                    padding: '14px 16px',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                            />
                            <span style={{ color: '#94a3b8', fontSize: '0.9rem', minWidth: '60px' }}>/ 1시간</span>
                        </div>
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                            💡 추천 가격대: 50,000원 ~ 150,000원 (경력 및 전문성에 따라)
                        </div>
                    </div>

                    {/* 주당 최대 학생 수 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0' }}>
                            👥 주당 최대 학생 수
                        </label>
                        <select
                            value={form.max_students_per_week}
                            onChange={(e) => setForm({ ...form, max_students_per_week: parseInt(e.target.value) })}
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
                        >
                            {[5, 10, 15, 20, 30].map((num) => (
                                <option key={num} value={num} style={{ background: '#1e293b' }}>
                                    {num}명
                                </option>
                            ))}
                        </select>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>
                            당신이 관리할 수 있는 최대 학생 수를 설정하세요
                        </p>
                    </div>

                    {/* 현재 상태 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0' }}>
                            📊 현재 상태
                        </label>
                        <select
                            value={form.availability}
                            onChange={(e) => setForm({ ...form, availability: e.target.value })}
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
                        >
                            <option value="available" style={{ background: '#1e293b' }}>
                                ✅ 수업 가능
                            </option>
                            <option value="busy" style={{ background: '#1e293b' }}>
                                ⏸️ 바쁜 중
                            </option>
                            <option value="unavailable" style={{ background: '#1e293b' }}>
                                ❌ 수업 불가
                            </option>
                        </select>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>
                            학생들이 당신의 상태를 확인할 수 있습니다
                        </p>
                    </div>

                    {/* 간단한 소개 */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '12px', fontSize: '1.1rem', fontWeight: '600', color: '#e2e8f0' }}>
                            📝 멘토 프로필 소개
                        </label>
                        <textarea
                            value={form.introduction_message}
                            onChange={(e) => setForm({ ...form, introduction_message: e.target.value })}
                            placeholder="수업 스타일, 교육 철학, 특별한 강점 등을 자유롭게 작성해주세요"
                            style={{
                                width: '100%',
                                minHeight: '120px',
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
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '8px' }}>
                            {form.introduction_message.length}/500
                        </p>
                    </div>

                    {/* 추가 정보 */}
                    <div style={{
                        padding: '16px',
                        background: 'rgba(99, 102, 241, 0.05)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        color: '#cbd5e1'
                    }}>
                        <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', fontWeight: '500', color: '#a5b4fc' }}>
                            ℹ️ 멘토링 시스템:
                        </p>
                        <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.6' }}>
                            <li>학생들은 당신의 프로필을 보고 수업을 예약할 수 있습니다</li>
                            <li>예약 후 결제 (토스페이먼츠)로 진행됩니다</li>
                            <li>수업은 Agora 화상 통화 + 채팅 + 화이트보드로 진행됩니다</li>
                            <li>수업 완료 후 학생 리뷰와 평점이 반영됩니다</li>
                        </ul>
                    </div>

                    {/* 저장 버튼 */}
                    <motion.button
                        type="submit"
                        disabled={saving}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {saving ? '저장 중...' : (
                            <>
                                <Save size={20} />
                                프로필 저장
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>

            {/* 다음 단계 */}
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
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#6ee7b7', marginBottom: '12px' }}>
                    🎉 프로필 설정 완료!
                </h3>
                <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
                    이제 학생들이 당신의 프로필을 볼 수 있고, 수업을 예약할 수 있습니다
                </p>
            </motion.div>
        </div>
    );
};

export default MentorProfileSetup;
