import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { Check, X, Eye, Mail, Calendar } from 'lucide-react';

const AdminMentorManagement = () => {
    const { addToast } = useToast();
    const [applications, setApplications] = useState([]);
    const [approvedMentors, setApprovedMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // pending, approved
    const [selectedApp, setSelectedApp] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 대기 중인 신청
            const { data: pendingData, error: pendingError } = await supabase
                .from('mentor_applications')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (pendingError) throw pendingError;
            setApplications(pendingData || []);

            // 승인된 멘토
            const { data: mentorData, error: mentorError } = await supabase
                .from('mentors')
                .select('*')
                .order('rating', { ascending: false });

            if (mentorError) throw mentorError;
            setApprovedMentors(mentorData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            addToast('데이터 조회 실패', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (appId, userId) => {
        try {
            // 1. 멘토 프로필 생성
            const { data: profile } = await supabase
                .from('profiles')
                .select('nickname')
                .eq('id', userId)
                .single();

            const app = applications.find(a => a.id === appId);

            const { error: mentorError } = await supabase
                .from('mentors')
                .insert({
                    user_id: userId,
                    name: profile?.nickname || 'Mentor',
                    expertise: app.expertise,
                    hourly_rate: 0, // 기본값, 나중에 수정
                    availability: 'available'
                });

            if (mentorError) throw mentorError;

            // 2. 신청 상태 업데이트
            const { error: appError } = await supabase
                .from('mentor_applications')
                .update({ status: 'approved' })
                .eq('id', appId);

            if (appError) throw appError;

            addToast('멘토 신청이 승인되었습니다', 'success');
            await fetchData();
        } catch (error) {
            console.error('Error approving:', error);
            addToast('승인 중 오류가 발생했습니다', 'error');
        }
    };

    const handleReject = async () => {
        if (!selectedApp) return;

        try {
            const { error } = await supabase
                .from('mentor_applications')
                .update({
                    status: 'rejected'
                })
                .eq('id', selectedApp.id);

            if (error) throw error;

            addToast('멘토 신청이 거절되었습니다', 'success');
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedApp(null);
            await fetchData();
        } catch (error) {
            console.error('Error rejecting:', error);
            addToast('거절 중 오류가 발생했습니다', 'error');
        }
    };

    if (loading) {
        return <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>로딩 중...</div>;
    }

    return (
        <div style={{ color: '#fff' }}>
            {/* 탭 네비게이션 */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '30px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
                <button
                    onClick={() => setActiveTab('pending')}
                    style={{
                        background: activeTab === 'pending' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                        border: activeTab === 'pending' ? '2px solid #a855f7' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: activeTab === 'pending' ? '#c084fc' : '#94a3b8',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                    }}
                >
                    ⏳ 승인 대기 ({applications.length})
                </button>
                <button
                    onClick={() => setActiveTab('approved')}
                    style={{
                        background: activeTab === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                        border: activeTab === 'approved' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                        color: activeTab === 'approved' ? '#6ee7b7' : '#94a3b8',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem',
                        transition: 'all 0.2s'
                    }}
                >
                    ✅ 승인된 멘토 ({approvedMentors.length})
                </button>
            </div>

            {/* 승인 대기 탭 */}
            <AnimatePresence mode="wait">
                {activeTab === 'pending' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {applications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                                <p style={{ fontSize: '1.2rem' }}>승인 대기 중인 신청이 없습니다</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {applications.map((app, idx) => (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.5)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '16px',
                                            padding: '24px',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        {/* 헤더 */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 8px 0', color: '#e2e8f0' }}>
                                                    {app.user_id}
                                                </h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                    <Mail size={16} />
                                                    <span>{app.user_id}</span>
                                                </div>
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                                신청일: {new Date(app.created_at).toLocaleDateString('ko-KR')}
                                            </div>
                                        </div>

                                        {/* 경력 & 전문분야 */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                            <div>
                                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 6px 0' }}>경력</p>
                                                <p style={{ fontSize: '1.1rem', fontWeight: '600', margin: 0, color: '#e2e8f0' }}>
                                                    {app.experience_years}년
                                                </p>
                                            </div>
                                            <div>
                                                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 6px 0' }}>전문 분야</p>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                    {app.expertise?.slice(0, 3).map((skill) => (
                                                        <span
                                                            key={skill}
                                                            style={{
                                                                background: 'rgba(168, 85, 247, 0.2)',
                                                                color: '#c084fc',
                                                                padding: '4px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '0.8rem',
                                                                fontWeight: '500'
                                                            }}
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                    {app.expertise?.length > 3 && (
                                                        <span style={{ color: '#94a3b8', fontSize: '0.8rem', paddingTop: '4px' }}>
                                                            +{app.expertise.length - 3}개
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 자기소개 */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 8px 0' }}>자기소개</p>
                                            <p style={{ margin: 0, color: '#cbd5e1', lineHeight: '1.6', fontSize: '0.95rem', maxHeight: '100px', overflow: 'hidden' }}>
                                                {app.introduction}
                                            </p>
                                        </div>

                                        {/* 액션 버튼 */}
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleApprove(app.id, app.user_id)}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px 16px',
                                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.1))',
                                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                                    color: '#6ee7b7',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Check size={18} />
                                                승인하기
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setSelectedApp(app);
                                                    setShowRejectModal(true);
                                                }}
                                                style={{
                                                    flex: 1,
                                                    padding: '12px 16px',
                                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1))',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    color: '#fca5a5',
                                                    borderRadius: '10px',
                                                    cursor: 'pointer',
                                                    fontWeight: '600',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    fontSize: '0.95rem',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <X size={18} />
                                                거절하기
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 승인된 멘토 탭 */}
            <AnimatePresence mode="wait">
                {activeTab === 'approved' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {approvedMentors.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                                <p style={{ fontSize: '1.2rem' }}>승인된 멘토가 없습니다</p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {approvedMentors.map((mentor, idx) => (
                                    <motion.div
                                        key={mentor.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.4))',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '16px',
                                            padding: '20px',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                    >
                                        {/* 멘토 이름 & 별점 */}
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', margin: '0 0 12px 0', color: '#e2e8f0' }}>
                                            {mentor.name}
                                        </h3>

                                        {/* 평점 */}
                                        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{ fontSize: '1.2rem', color: '#fbbf24' }}>⭐</span>
                                            <span style={{ fontWeight: '700', color: '#e2e8f0', fontSize: '1.1rem' }}>
                                                {mentor.rating?.toFixed(1) || '0.0'}
                                            </span>
                                            <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                                ({mentor.reviews_count || 0}개 리뷰)
                                            </span>
                                        </div>

                                        {/* 시간당 요금 */}
                                        <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 6px 0' }}>시간당 요금</p>
                                            <p style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c084fc', margin: 0 }}>
                                                ₩{mentor.hourly_rate?.toLocaleString() || '0'}/h
                                            </p>
                                        </div>

                                        {/* 전문분야 */}
                                        <div style={{ marginBottom: '12px' }}>
                                            <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 6px 0' }}>전문 분야</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {mentor.expertise?.slice(0, 3).map((skill) => (
                                                    <span
                                                        key={skill}
                                                        style={{
                                                            background: 'rgba(99, 102, 241, 0.2)',
                                                            color: '#a5b4fc',
                                                            padding: '4px 10px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '500'
                                                        }}
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 상태 */}
                                        <div style={{
                                            padding: '10px 12px',
                                            background: mentor.availability === 'available'
                                                ? 'rgba(16, 185, 129, 0.1)'
                                                : 'rgba(156, 163, 175, 0.1)',
                                            borderRadius: '8px',
                                            textAlign: 'center',
                                            color: mentor.availability === 'available'
                                                ? '#6ee7b7'
                                                : '#9ca3af',
                                            fontSize: '0.9rem',
                                            fontWeight: '600'
                                        }}>
                                            {mentor.availability === 'available' ? '✅ 수업 가능' : '⏸️ 수업 불가'}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 거절 모달 */}
            <AnimatePresence>
                {showRejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 100
                        }}
                        onClick={() => setShowRejectModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: '#1e293b',
                                borderRadius: '16px',
                                padding: '30px',
                                maxWidth: '400px',
                                width: '90%',
                                border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>
                                거절 사유
                            </h2>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="거절 사유를 입력해주세요 (선택사항)"
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '12px',
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                    marginBottom: '20px',
                                    resize: 'vertical'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleReject}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: '#ef4444',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    거절하기
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminMentorManagement;
