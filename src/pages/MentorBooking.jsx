import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sendNotification } from '../lib/notifications';
import { Star, MapPin, Clock, Users, X, Calendar, Send, Package, Coins } from 'lucide-react';
import { PRICING_PACKAGES, SESSION_TYPES, calculatePrice } from '../components/MentorPricing';

const MentorBooking = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [bookingForm, setBookingForm] = useState({
        scheduled_date: '',
        scheduled_time: '14:00',
        duration_minutes: 60,
        message: '',
        sessionType: '60min',
        packageType: 'single',
        usePoints: 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('mentors')
                .select('*')
                .eq('availability', 'available')
                .order('rating', { ascending: false });

            if (error) throw error;
            setMentors(data || []);
        } catch (error) {
            console.error('Error fetching mentors:', error);
            addToast('멘토 목록을 불러올 수 없습니다', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!bookingForm.scheduled_date) {
            addToast('수업 날짜를 선택해주세요', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const scheduledAt = new Date(`${bookingForm.scheduled_date}T${bookingForm.scheduled_time}`);

            // mentor_sessions 생성
            const { error: sessionError } = await supabase
                .from('mentor_sessions')
                .insert({
                    mentor_id: selectedMentor.id,
                    student_id: user.id,
                    title: `${selectedMentor.name}과의 1:1 수업`,
                    description: bookingForm.message || '',
                    scheduled_at: scheduledAt.toISOString(),
                    duration_minutes: bookingForm.duration_minutes,
                    status: 'scheduled'
                });

            if (sessionError) throw sessionError;

            // 생성된 세션의 ID 조회
            const { data: createdSession, error: fetchError } = await supabase
                .from('mentor_sessions')
                .select('id')
                .eq('student_id', user.id)
                .eq('mentor_id', selectedMentor.id)
                .eq('scheduled_at', scheduledAt.toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (fetchError || !createdSession) throw fetchError || new Error('세션 ID를 찾을 수 없습니다');

            addToast('수업이 예약되었습니다! 결제 페이지로 이동합니다.', 'success');

            // 멘토에게 알림 전송
            const studentName = user?.user_metadata?.username || '학생';
            sendNotification(
                selectedMentor.user_id,
                'MENTOR_BOOKING',
                `📅 ${studentName}님이 수업을 예약했습니다! (${bookingForm.scheduled_date} ${bookingForm.scheduled_time})`,
                '/mentor-profile-setup'
            );

            // 결제 페이지로 이동하며 세션 ID 전달
            setTimeout(() => {
                navigate('/payment', { state: { sessionId: createdSession.id } });
            }, 500);
        } catch (error) {
            console.error('Error creating session:', error);
            addToast('예약 중 오류가 발생했습니다', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ color: '#fff', textAlign: 'center', padding: '40px' }}>로딩 중...</div>;
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff', paddingBottom: '60px' }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    padding: '40px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
                    borderRadius: '24px',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    backdropFilter: 'blur(10px)',
                    marginBottom: '40px',
                    textAlign: 'center'
                }}
            >
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '12px', background: 'linear-gradient(135deg, #a78bfa, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    👨‍🏫 멘토 수업 예약
                </h1>
                <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: 0 }}>
                    경력 있는 멘토들과 1:1 맞춤 수업을 예약하세요
                </p>
            </motion.div>

            {/* 멘토 목록 */}
            {mentors.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}
                >
                    <p style={{ fontSize: '1.2rem' }}>현재 수업 가능한 멘토가 없습니다</p>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                    {mentors.map((mentor, idx) => (
                        <motion.div
                            key={mentor.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            whileHover={{ y: -8 }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.4))',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                padding: '28px',
                                backdropFilter: 'blur(10px)',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onClick={() => {
                                setSelectedMentor(mentor);
                                setShowBookingModal(true);
                            }}
                        >
                            {/* 배경 그래디언트 */}
                            <div style={{
                                position: 'absolute',
                                top: '-50%',
                                right: '-50%',
                                width: '300px',
                                height: '300px',
                                background: 'radial-gradient(circle, rgba(168, 85, 247, 0.1), transparent)',
                                pointerEvents: 'none'
                            }} />

                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {/* 이름 & 별점 */}
                                <div style={{ marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 8px 0', color: '#e2e8f0' }}>
                                        {mentor.name}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    fill={i < Math.round(mentor.rating) ? '#fbbf24' : 'transparent'}
                                                    color="#fbbf24"
                                                />
                                            ))}
                                        </div>
                                        <span style={{ fontWeight: '700', color: '#e2e8f0' }}>
                                            {mentor.rating?.toFixed(1) || '0.0'}
                                        </span>
                                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                                            ({mentor.reviews_count || 0})
                                        </span>
                                    </div>
                                </div>

                                {/* 가격 */}
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    style={{
                                        padding: '16px',
                                        background: 'rgba(168, 85, 247, 0.15)',
                                        border: '1px solid rgba(168, 85, 247, 0.3)',
                                        borderRadius: '14px',
                                        marginBottom: '16px'
                                    }}
                                >
                                    <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 6px 0', fontWeight: '500' }}>
                                        시간당 요금
                                    </p>
                                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#c084fc', margin: 0 }}>
                                        ₩{mentor.hourly_rate?.toLocaleString() || '0'}/h
                                    </p>
                                </motion.div>

                                {/* 정보 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                                        <Users size={18} />
                                        <span style={{ fontSize: '0.95rem' }}>
                                            주당 {mentor.max_students_per_week || 10}명까지 수업 가능
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#cbd5e1' }}>
                                        <Clock size={18} />
                                        <span style={{ fontSize: '0.95rem' }}>
                                            1시간 ~ 2시간 자유롭게 선택
                                        </span>
                                    </div>
                                </div>

                                {/* 전문분야 */}
                                <div style={{ marginBottom: '20px' }}>
                                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 10px 0', fontWeight: '500', textTransform: 'uppercase' }}>
                                        전문 분야
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {mentor.expertise?.slice(0, 4).map((skill) => (
                                            <span
                                                key={skill}
                                                style={{
                                                    background: 'rgba(99, 102, 241, 0.2)',
                                                    color: '#a5b4fc',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: '500',
                                                    border: '1px solid rgba(99, 102, 241, 0.3)'
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                        {mentor.expertise?.length > 4 && (
                                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '6px 0', fontWeight: '500' }}>
                                                +{mentor.expertise.length - 4}개
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* 예약 버튼 */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '1rem',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Calendar size={18} />
                                    수업 예약하기
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* 예약 모달 */}
            <AnimatePresence>
                {showBookingModal && selectedMentor && (
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
                            zIndex: 100,
                            backdropFilter: 'blur(4px)'
                        }}
                        onClick={() => setShowBookingModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                borderRadius: '24px',
                                padding: '40px',
                                maxWidth: '500px',
                                width: '90%',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                boxShadow: '0 20px 80px rgba(0, 0, 0, 0.5)',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            {/* 헤더 */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>
                                    수업 예약
                                </h2>
                                <button
                                    onClick={() => setShowBookingModal(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#94a3b8',
                                        cursor: 'pointer',
                                        fontSize: '1.5rem'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* 멘토 정보 요약 */}
                            <div style={{
                                padding: '16px',
                                background: 'rgba(168, 85, 247, 0.1)',
                                borderRadius: '12px',
                                marginBottom: '24px',
                                border: '1px solid rgba(168, 85, 247, 0.2)'
                            }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#e2e8f0', margin: '0 0 8px 0' }}>
                                    {selectedMentor.name}
                                </h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#cbd5e1' }}>
                                    <span>⭐ {selectedMentor.rating?.toFixed(1)} ({selectedMentor.reviews_count || 0})</span>
                                    <span>₩{selectedMentor.hourly_rate?.toLocaleString()}/시간</span>
                                </div>
                            </div>

                            {/* 예약 폼 */}
                            <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* 날짜 */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: '#e2e8f0' }}>
                                        📅 수업 날짜
                                    </label>
                                    <input
                                        type="date"
                                        value={bookingForm.scheduled_date}
                                        onChange={(e) => setBookingForm({ ...bookingForm, scheduled_date: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                {/* 시간 */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: '#e2e8f0' }}>
                                            🕐 시작 시간
                                        </label>
                                        <input
                                            type="time"
                                            value={bookingForm.scheduled_time}
                                            onChange={(e) => setBookingForm({ ...bookingForm, scheduled_time: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: 'rgba(0, 0, 0, 0.2)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px',
                                                color: 'white',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: '#e2e8f0' }}>
                                            ⏱️ 수업 시간
                                        </label>
                                        <select
                                            value={bookingForm.duration_minutes}
                                            onChange={(e) => setBookingForm({ ...bookingForm, duration_minutes: parseInt(e.target.value) })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: 'rgba(0, 0, 0, 0.2)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px',
                                                color: 'white',
                                                fontSize: '1rem'
                                            }}
                                        >
                                            <option value={60}>1시간</option>
                                            <option value={90}>1시간 30분</option>
                                            <option value={120}>2시간</option>
                                        </select>
                                    </div>
                                </div>

                                {/* 세션 타입 선택 */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: '#e2e8f0' }}>
                                        ⏰ 세션 타입
                                    </label>
                                    <select
                                        value={bookingForm.sessionType}
                                        onChange={(e) => {
                                            const type = SESSION_TYPES.find(t => t.id === e.target.value);
                                            setBookingForm({
                                                ...bookingForm,
                                                sessionType: e.target.value,
                                                duration_minutes: type.duration
                                            });
                                        }}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    >
                                        {SESSION_TYPES.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name} ({type.duration}분) - {type.basePrice.toLocaleString()}원
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* 패키지 선택 */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: '#e2e8f0' }}>
                                        <Package size={16} style={{ display: 'inline', marginRight: '4px' }} />
                                        패키지 선택
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {PRICING_PACKAGES.map(pkg => (
                                            <button
                                                key={pkg.id}
                                                type="button"
                                                onClick={() => setBookingForm({ ...bookingForm, packageType: pkg.id })}
                                                style={{
                                                    padding: '12px 8px',
                                                    background: bookingForm.packageType === pkg.id ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                                    border: bookingForm.packageType === pkg.id ? '2px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.1)',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    position: 'relative'
                                                }}
                                            >
                                                {pkg.popular && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '-8px',
                                                        right: '4px',
                                                        background: '#22c55e',
                                                        color: '#000',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        인기
                                                    </div>
                                                )}
                                                <div style={{ fontWeight: 'bold' }}>{pkg.label}</div>
                                                {pkg.discount > 0 && (
                                                    <div style={{ fontSize: '0.7rem', color: '#22c55e' }}>{pkg.badge}</div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 포인트 사용 */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: '#e2e8f0' }}>
                                        <Coins size={16} style={{ display: 'inline', marginRight: '4px' }} />
                                        포인트 사용 (보유: 10,000P)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10000"
                                        step="1000"
                                        value={bookingForm.usePoints}
                                        onChange={(e) => setBookingForm({ ...bookingForm, usePoints: parseInt(e.target.value) || 0 })}
                                        placeholder="사용할 포인트 입력"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(250, 204, 21, 0.3)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '1rem'
                                        }}
                                    />
                                </div>

                                {/* 예상 요금 */}
                                {(() => {
                                    const sessionType = SESSION_TYPES.find(t => t.id === bookingForm.sessionType);
                                    const pricing = calculatePrice(sessionType?.basePrice || 35000, bookingForm.packageType, bookingForm.usePoints);
                                    const pkg = PRICING_PACKAGES.find(p => p.id === bookingForm.packageType);

                                    return (
                                        <div style={{
                                            padding: '16px',
                                            background: 'rgba(99, 102, 241, 0.1)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(99, 102, 241, 0.3)'
                                        }}>
                                            <div style={{ marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '4px' }}>
                                                    <span>기본 금액 ({pkg.sessions}회)</span>
                                                    <span>₩{pricing.original.toLocaleString()}</span>
                                                </div>
                                                {pkg.discount > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#22c55e', marginBottom: '4px' }}>
                                                        <span>패키지 할인 ({pkg.discount}%)</span>
                                                        <span>-₩{pricing.discountAmount.toLocaleString()}</span>
                                                    </div>
                                                )}
                                                {bookingForm.usePoints > 0 && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#facc15', marginBottom: '4px' }}>
                                                        <span>포인트 할인</span>
                                                        <span>-₩{bookingForm.usePoints.toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '12px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 'bold' }}>최종 결제 금액</span>
                                                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#a5b4fc' }}>
                                                        ₩{pricing.final.toLocaleString()}
                                                    </span>
                                                </div>
                                                {pkg.sessions > 1 && (
                                                    <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                                        회당 ₩{pricing.pricePerSession.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* 특별 요청사항 */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95rem', fontWeight: '600', color: '#e2e8f0' }}>
                                        💬 특별 요청사항 (선택)
                                    </label>
                                    <textarea
                                        value={bookingForm.message}
                                        onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                                        placeholder="학습 목표, 특별한 요청 등을 적어주세요"
                                        style={{
                                            width: '100%',
                                            minHeight: '80px',
                                            padding: '12px',
                                            background: 'rgba(0, 0, 0, 0.2)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '8px',
                                            color: 'white',
                                            fontSize: '0.95rem',
                                            resize: 'vertical',
                                            fontFamily: 'inherit'
                                        }}
                                    />
                                </div>

                                {/* 버튼 */}
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setShowBookingModal(false)}
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
                                    <motion.button
                                        type="submit"
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: 'linear-gradient(135deg, #a855f7, #8b5cf6)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff',
                                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                            opacity: isSubmitting ? 0.7 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        {isSubmitting ? '처리 중...' : (
                                            <>
                                                <Send size={16} />
                                                수업 예약
                                            </>
                                        )}
                                    </motion.button>
                                </div>

                                {/* 안내 */}
                                <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0', textAlign: 'center' }}>
                                    예약 후 결제 페이지로 이동합니다
                                </p>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MentorBooking;
