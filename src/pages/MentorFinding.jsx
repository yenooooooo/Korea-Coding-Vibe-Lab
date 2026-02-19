import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Users, Clock, X, Send, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * MentorFinding 페이지
 * 입문자를 위한 멘토 찾기 및 매칭 시스템
 * - 멘토 프로필 표시
 * - 필터링 및 정렬
 * - 1:1 매칭 요청
 */
const MentorFinding = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [expertiseFilter, setExpertiseFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');
    const [sortBy, setSortBy] = useState('rating');
    const [selectedMentor, setSelectedMentor] = useState(null);
    const [matchingMode, setMatchingMode] = useState(false);
    const [matchingForm, setMatchingForm] = useState({
        introduction: '',
        goals: '',
        preferredTime: ''
    });
    const [mentorsData, setMentorsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Supabase에서 멘토 데이터 조회 및 Realtime 구독
    useEffect(() => {
        const fetchMentors = async () => {
            try {
                setLoading(true);
                const { data, error: fetchError } = await supabase
                    .from('mentors')
                    .select('*')
                    .order('rating', { ascending: false });

                if (fetchError) {
                    console.warn('멘토 데이터 조회 실패, 샘플 데이터 사용:', fetchError.message);
                    setMentorsData(null);
                } else {
                    setMentorsData(data || null);
                }
            } catch (err) {
                console.warn('멘토 데이터 조회 오류:', err.message);
                setMentorsData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchMentors();

        // Realtime 구독: mentors 테이블 변경 감지
        const mentorsChannel = supabase
            .channel('mentors-realtime')
            .on('postgres_changes', {
                event: '*', // INSERT, UPDATE, DELETE 모두 감지
                schema: 'public',
                table: 'mentors'
            }, (payload) => {
                console.log('멘토 데이터 변경:', payload);
                // 새 멘토 추가 시 자동 새로고침
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    fetchMentors();
                }
            })
            .subscribe();

        // 정리: 컴포넌트 언마운트 시 구독 해제
        return () => {
            mentorsChannel.unsubscribe();
        };
    }, []);

    // 매칭 요청 제출
    const handleSubmitMatching = async () => {
        if (matchingForm.introduction.trim() && matchingForm.goals.trim()) {
            try {
                if (user && selectedMentor) {
                    const { error: insertError } = await supabase.from('mentor_requests').insert({
                        user_id: user.id,
                        mentor_id: selectedMentor.id,
                        introduction: matchingForm.introduction,
                        goals: matchingForm.goals,
                        preferred_time: matchingForm.preferredTime
                    });

                    if (insertError) {
                        throw insertError;
                    }

                    // 성공 메시지
                    console.log('✅ 매칭 요청이 데이터베이스에 저장되었습니다');
                    alert(`✅ ${selectedMentor.name} 멘토에게 매칭 요청이 발송되었습니다!\n\n📧 곧 연락을 받으실 거예요.\n⏱️ 평균 응답 시간: ${selectedMentor.responseTime || '24시간 이내'}`);
                } else {
                    alert('로그인 후 요청해주세요.');
                }
                setMatchingForm({ introduction: '', goals: '', preferredTime: '' });
                setMatchingMode(false);
                setSelectedMentor(null);
            } catch (err) {
                console.error('매칭 요청 실패:', err);
                alert(`❌ 요청 발송에 실패했습니다.\n\n오류: ${err.message}\n\n잠시 후 다시 시도해주세요.`);
            }
        }
    };

    // 샘플 멘토 데이터 (Supabase에서 못 가져온 경우 사용)
    const sampleMentors = [
        {
            id: 1,
            name: '김개발',
            avatar: '👨‍💻',
            title: 'React 전문가',
            expertise: ['React', 'JavaScript', 'Node.js'],
            experience: '5년',
            level: 'expert',
            rating: 4.9,
            students: 42,
            responseTime: '1시간',
            introduction: '함께 성장하는 멘토입니다',
            description: 'React로 정말 많은 프로젝트를 해봤고, 입문자부터 고급 개발자까지 가르친 경험이 있습니다.',
            reviews: [
                { name: '학생A', text: '정말 친절하고 자세하게 설명해주셨어요!', rating: 5 },
                { name: '학생B', text: '실전 경험 많으신 멘토분이에요', rating: 5 }
            ]
        },
        {
            id: 2,
            name: '박파이썬',
            avatar: '🐍',
            title: 'Python & AI 전문가',
            expertise: ['Python', 'AI', 'ML'],
            experience: '7년',
            level: 'expert',
            rating: 4.8,
            students: 38,
            responseTime: '30분',
            introduction: '데이터와 AI로 세상을 바꾸고 싶습니다',
            description: 'AI와 머신러닝의 기초부터 실전까지, 많은 학생들을 가르쳤습니다.',
            reviews: [
                { name: '학생C', text: '복잡한 개념을 쉽게 설명해주세요', rating: 5 },
                { name: '학생D', text: '프로젝트까지 함께 만들어봤어요', rating: 4 }
            ]
        },
        {
            id: 3,
            name: '이디자인',
            avatar: '🎨',
            title: 'UI/UX 디자인 & 웹',
            expertise: ['CSS', 'Design', 'React'],
            experience: '3년',
            level: 'intermediate',
            rating: 4.7,
            students: 28,
            responseTime: '2시간',
            introduction: '예쁜 웹사이트를 함께 만들어요',
            description: '디자인 감각과 웹 개발을 함께 배울 수 있는 멘토입니다.',
            reviews: [
                { name: '학생E', text: '디자인 감각까지 배울 수 있어요', rating: 5 },
                { name: '학생F', text: '포트폴리오 만들 때 많은 도움이 됐어요', rating: 4 }
            ]
        },
        {
            id: 4,
            name: '최풀스택',
            avatar: '⚙️',
            title: '풀스택 개발자',
            expertise: ['JavaScript', 'React', 'Node.js', 'Database'],
            experience: '6년',
            level: 'expert',
            rating: 4.9,
            students: 51,
            responseTime: '1시간',
            introduction: '전체적인 웹 개발의 흐름을 알려드립니다',
            description: '프론트엔드부터 백엔드까지, 전체 웹 개발 프로세스를 경험하게 해드립니다.',
            reviews: [
                { name: '학생G', text: '정말 완벽한 설명입니다', rating: 5 },
                { name: '학생H', text: '실무와 매우 유사한 프로젝트를 해봤어요', rating: 5 }
            ]
        },
        {
            id: 5,
            name: '정초보친화',
            avatar: '🌟',
            title: '입문자 전문 멘토',
            expertise: ['HTML', 'CSS', 'JavaScript'],
            experience: '2년',
            level: 'beginner',
            rating: 4.6,
            students: 23,
            responseTime: '30분',
            introduction: '완전 초보도 괜찮습니다!',
            description: '저도 최근에 개발을 시작했기 때문에, 입문자의 마음을 잘 이해합니다.',
            reviews: [
                { name: '학생I', text: '초보자에게 정말 좋은 멘토입니다', rating: 5 },
                { name: '학생J', text: '친절하고 이해하기 쉽게 설명해요', rating: 4 }
            ]
        },
        {
            id: 6,
            name: '주데이터',
            avatar: '📊',
            title: 'Data Engineering 전문가',
            expertise: ['SQL', 'Python', 'Data'],
            experience: '8년',
            level: 'expert',
            rating: 4.8,
            students: 35,
            responseTime: '2시간',
            introduction: '데이터에서 인사이트를 뽑아내세요',
            description: '데이터 엔지니어링의 기초부터 심화까지, 체계적으로 배워볼 수 있습니다.',
            reviews: [
                { name: '학생K', text: '데이터 처리가 이렇게 쉬울 수가!', rating: 5 },
                { name: '학생L', text: '실전 스킬을 배울 수 있어요', rating: 5 }
            ]
        }
    ];

    // 실제 데이터 또는 샘플 데이터 사용
    const mentors = mentorsData || sampleMentors;

    const expertiseOptions = [
        { id: 'all', name: '전체' },
        { id: 'react', name: 'React' },
        { id: 'python', name: 'Python' },
        { id: 'javascript', name: 'JavaScript' },
        { id: 'design', name: 'Design' },
        { id: 'database', name: 'Database' }
    ];

    const levelOptions = [
        { id: 'all', name: '모든 수준' },
        { id: 'beginner', name: '입문자 친화' },
        { id: 'intermediate', name: '중급' },
        { id: 'expert', name: '전문가' }
    ];

    // 필터링 및 정렬
    const filteredAndSorted = useMemo(() => {
        let result = mentors.filter(mentor => {
            const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 mentor.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesExpertise = expertiseFilter === 'all' ||
                                    mentor.expertise.some(e => e.toLowerCase().includes(expertiseFilter));
            const matchesLevel = levelFilter === 'all' || mentor.level === levelFilter;
            return matchesSearch && matchesExpertise && matchesLevel;
        });

        // 정렬
        if (sortBy === 'rating') {
            result.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'students') {
            result.sort((a, b) => b.students - a.students);
        } else if (sortBy === 'response') {
            result.sort((a, b) => {
                const timeA = parseInt(a.responseTime);
                const timeB = parseInt(b.responseTime);
                return timeA - timeB;
            });
        }

        return result;
    }, [searchQuery, expertiseFilter, levelFilter, sortBy]);


    return (
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 20px'
        }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{ marginBottom: '40px', textAlign: 'center' }}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: '0 0 12px 0'
                }}>
                    🎓 멘토 찾기
                </h1>
                <p style={{
                    color: '#94a3b8',
                    fontSize: '1rem',
                    margin: 0
                }}>
                    경험 많은 멘토와 1:1로 연결되어 당신의 성장을 함께하세요
                </p>
            </motion.div>

            {/* 검색 및 필터 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{ marginBottom: '32px' }}
            >
                {/* 검색창 */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        flex: 1,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Search size={20} color="#818cf8" style={{ position: 'absolute', left: '16px', pointerEvents: 'none' }} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="멘토명이나 전문분야로 검색..."
                            style={{
                                width: '100%',
                                paddingLeft: '48px',
                                paddingRight: '16px',
                                height: '48px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '12px',
                                color: '#e2e8f0',
                                fontSize: '0.95rem',
                                outline: 'none',
                                fontFamily: 'inherit',
                                transition: 'all 0.3s'
                            }}
                        />
                    </div>
                </div>

                {/* 필터 */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px'
                }}>
                    {/* 전문분야 필터 */}
                    <div>
                        <label style={{
                            display: 'block',
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            marginBottom: '8px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                        }}>
                            전문분야
                        </label>
                        <select
                            value={expertiseFilter}
                            onChange={(e) => setExpertiseFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '10px',
                                color: '#e2e8f0',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                outline: 'none'
                            }}
                        >
                            {expertiseOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* 수준 필터 */}
                    <div>
                        <label style={{
                            display: 'block',
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            marginBottom: '8px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                        }}>
                            멘토 수준
                        </label>
                        <select
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '10px',
                                color: '#e2e8f0',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                outline: 'none'
                            }}
                        >
                            {levelOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* 정렬 */}
                    <div>
                        <label style={{
                            display: 'block',
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            marginBottom: '8px',
                            fontWeight: '600',
                            textTransform: 'uppercase'
                        }}>
                            정렬
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                background: 'rgba(0,0,0,0.3)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '10px',
                                color: '#e2e8f0',
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                outline: 'none'
                            }}
                        >
                            <option value="rating">평점순</option>
                            <option value="students">학생 많은 순</option>
                            <option value="response">응답 빠른 순</option>
                        </select>
                    </div>
                </div>
            </motion.div>

            {/* 로딩 상태 */}
            {loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        marginBottom: '60px'
                    }}
                >
                    <p style={{ color: '#94a3b8', fontSize: '1rem' }}>멘토 목록을 불러오는 중...</p>
                </motion.div>
            )}

            {/* 데이터 출처 표시 */}
            {!loading && mentorsData && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '0.85rem',
                        color: '#22c55e'
                    }}
                >
                    ✓ 데이터베이스에서 실시간 멘토 정보를 가져오고 있습니다
                </motion.div>
            )}

            {/* 멘토 카드 그리드 */}
            {!loading && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px',
                    marginBottom: '60px'
                }}
            >
                {filteredAndSorted.map((mentor, idx) => (
                    <motion.div
                        key={mentor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        whileHover={{ y: -8 }}
                        onClick={() => setSelectedMentor(mentor)}
                        style={{
                            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7))',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            borderRadius: '16px',
                            padding: '24px',
                            cursor: 'pointer',
                            backdropFilter: 'blur(20px)',
                            transition: 'all 0.3s'
                        }}
                    >
                        {/* 아바타 */}
                        <div style={{
                            fontSize: '3rem',
                            textAlign: 'center',
                            marginBottom: '16px'
                        }}>
                            {mentor.avatar}
                        </div>

                        {/* 정보 */}
                        <h3 style={{
                            color: 'white',
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            margin: '0 0 4px 0',
                            textAlign: 'center'
                        }}>
                            {mentor.name}
                        </h3>

                        <p style={{
                            color: '#818cf8',
                            fontSize: '0.9rem',
                            margin: '0 0 16px 0',
                            textAlign: 'center',
                            fontWeight: '600'
                        }}>
                            {mentor.title}
                        </p>

                        <p style={{
                            color: '#cbd5e1',
                            fontSize: '0.85rem',
                            margin: '0 0 16px 0',
                            textAlign: 'center',
                            lineHeight: '1.5',
                            minHeight: '40px'
                        }}>
                            {mentor.introduction}
                        </p>

                        {/* 전문분야 */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                            marginBottom: '16px',
                            justifyContent: 'center'
                        }}>
                            {mentor.expertise.slice(0, 3).map((exp, i) => (
                                <span
                                    key={i}
                                    style={{
                                        background: 'rgba(168, 85, 247, 0.2)',
                                        border: '1px solid rgba(168, 85, 247, 0.3)',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        color: '#d8b4fe'
                                    }}
                                >
                                    {exp}
                                </span>
                            ))}
                        </div>

                        {/* 통계 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            marginBottom: '16px',
                            paddingBottom: '16px',
                            borderBottom: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    color: '#fbbf24',
                                    fontWeight: '700',
                                    marginBottom: '4px'
                                }}>
                                    <Star size={14} fill="currentColor" />
                                    {mentor.rating}
                                </div>
                                <p style={{
                                    color: '#94a3b8',
                                    fontSize: '0.75rem',
                                    margin: 0
                                }}>
                                    평점
                                </p>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    color: '#22c55e',
                                    fontWeight: '700',
                                    marginBottom: '4px'
                                }}>
                                    <Users size={14} />
                                    {mentor.students}
                                </div>
                                <p style={{
                                    color: '#94a3b8',
                                    fontSize: '0.75rem',
                                    margin: 0
                                }}>
                                    학생 수
                                </p>
                            </div>
                        </div>

                        {/* 응답 시간 */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            color: '#94a3b8',
                            fontSize: '0.85rem',
                            marginBottom: '16px'
                        }}>
                            <Clock size={14} />
                            응답 {mentor.responseTime}
                        </div>

                        {/* 버튼 */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <MessageCircle size={16} />
                            자세히 보기
                        </motion.button>
                    </motion.div>
                ))}
            </motion.div>
            )}

            {filteredAndSorted.length === 0 && !loading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        background: 'rgba(99, 102, 241, 0.05)',
                        borderRadius: '16px',
                        marginBottom: '60px'
                    }}
                >
                    <p style={{
                        color: '#94a3b8',
                        fontSize: '1.1rem',
                        margin: 0
                    }}>
                        검색 조건에 맞는 멘토가 없습니다
                    </p>
                </motion.div>
            )}

            {/* 멘토 상세 모달 */}
            <AnimatePresence>
                {selectedMentor && !matchingMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedMentor(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 100,
                            padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '20px',
                                padding: '40px',
                                maxWidth: '600px',
                                width: '100%',
                                backdropFilter: 'blur(20px)',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            {/* 닫기 */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSelectedMentor(null)}
                                style={{
                                    position: 'absolute',
                                    top: '20px',
                                    right: '20px',
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    color: '#818cf8',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </motion.button>

                            {/* 아바타 */}
                            <div style={{
                                fontSize: '4rem',
                                textAlign: 'center',
                                marginBottom: '20px'
                            }}>
                                {selectedMentor.avatar}
                            </div>

                            {/* 정보 */}
                            <h2 style={{
                                color: 'white',
                                fontSize: '1.8rem',
                                fontWeight: '700',
                                margin: '0 0 8px 0',
                                textAlign: 'center'
                            }}>
                                {selectedMentor.name}
                            </h2>

                            <p style={{
                                color: '#818cf8',
                                fontSize: '1rem',
                                margin: '0 0 20px 0',
                                textAlign: 'center',
                                fontWeight: '600'
                            }}>
                                {selectedMentor.title}
                            </p>

                            {/* 경력 */}
                            <p style={{
                                color: '#cbd5e1',
                                fontSize: '0.95rem',
                                margin: '0 0 20px 0',
                                textAlign: 'center'
                            }}>
                                💼 경력: {selectedMentor.experience}
                            </p>

                            {/* 상세 설명 */}
                            <div style={{
                                background: 'rgba(99, 102, 241, 0.1)',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '20px'
                            }}>
                                <p style={{
                                    color: '#cbd5e1',
                                    fontSize: '0.95rem',
                                    margin: 0,
                                    lineHeight: '1.6'
                                }}>
                                    {selectedMentor.description}
                                </p>
                            </div>

                            {/* 후기 */}
                            <div style={{ marginBottom: '20px' }}>
                                <h4 style={{
                                    color: '#818cf8',
                                    fontSize: '1rem',
                                    fontWeight: '700',
                                    margin: '0 0 12px 0'
                                }}>
                                    학생 후기
                                </h4>
                                {selectedMentor.reviews.map((review, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            background: 'rgba(0,0,0,0.3)',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            marginBottom: '8px'
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '6px'
                                        }}>
                                            <span style={{
                                                color: '#e2e8f0',
                                                fontWeight: '600',
                                                fontSize: '0.9rem'
                                            }}>
                                                {review.name}
                                            </span>
                                            <span style={{
                                                color: '#fbbf24',
                                                fontSize: '0.85rem'
                                            }}>
                                                {'⭐'.repeat(review.rating)}
                                            </span>
                                        </div>
                                        <p style={{
                                            color: '#cbd5e1',
                                            fontSize: '0.85rem',
                                            margin: 0
                                        }}>
                                            {review.text}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* 매칭 버튼 */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setMatchingMode(true)}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                                }}
                            >
                                <Send size={18} />
                                1:1 매칭 요청
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 매칭 요청 모달 */}
            <AnimatePresence>
                {selectedMentor && matchingMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMatchingMode(false)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0, 0, 0, 0.7)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 101,
                            padding: '20px'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                borderRadius: '20px',
                                padding: '40px',
                                maxWidth: '500px',
                                width: '100%',
                                backdropFilter: 'blur(20px)',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            <h2 style={{
                                color: 'white',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                margin: '0 0 12px 0'
                            }}>
                                {selectedMentor.name}에게 매칭 요청
                            </h2>

                            <p style={{
                                color: '#94a3b8',
                                fontSize: '0.9rem',
                                margin: '0 0 24px 0'
                            }}>
                                당신의 정보를 멘토와 공유해주세요
                            </p>

                            {/* 자기소개 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    color: '#94a3b8',
                                    fontSize: '0.85rem',
                                    marginBottom: '8px',
                                    fontWeight: '600'
                                }}>
                                    간단한 자기소개
                                </label>
                                <textarea
                                    value={matchingForm.introduction}
                                    onChange={(e) => setMatchingForm({ ...matchingForm, introduction: e.target.value })}
                                    placeholder="당신에 대해 알려주세요"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                        borderRadius: '8px',
                                        color: '#e2e8f0',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit',
                                        minHeight: '80px',
                                        resize: 'none',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* 학습 목표 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{
                                    display: 'block',
                                    color: '#94a3b8',
                                    fontSize: '0.85rem',
                                    marginBottom: '8px',
                                    fontWeight: '600'
                                }}>
                                    학습 목표
                                </label>
                                <textarea
                                    value={matchingForm.goals}
                                    onChange={(e) => setMatchingForm({ ...matchingForm, goals: e.target.value })}
                                    placeholder="무엇을 배우고 싶으신가요?"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                        borderRadius: '8px',
                                        color: '#e2e8f0',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit',
                                        minHeight: '80px',
                                        resize: 'none',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* 선호 일정 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{
                                    display: 'block',
                                    color: '#94a3b8',
                                    fontSize: '0.85rem',
                                    marginBottom: '8px',
                                    fontWeight: '600'
                                }}>
                                    선호 일정 (선택)
                                </label>
                                <input
                                    type="text"
                                    value={matchingForm.preferredTime}
                                    onChange={(e) => setMatchingForm({ ...matchingForm, preferredTime: e.target.value })}
                                    placeholder="예: 주 2회, 저녁 7시"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        background: 'rgba(0,0,0,0.3)',
                                        border: '1px solid rgba(99, 102, 241, 0.2)',
                                        borderRadius: '8px',
                                        color: '#e2e8f0',
                                        fontSize: '0.9rem',
                                        fontFamily: 'inherit',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            {/* 버튼 */}
                            <div style={{
                                display: 'flex',
                                gap: '12px'
                            }}>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setMatchingMode(false)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        borderRadius: '8px',
                                        color: '#818cf8',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    취소
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSubmitMatching}
                                    disabled={!matchingForm.introduction.trim() || !matchingForm.goals.trim()}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: (!matchingForm.introduction.trim() || !matchingForm.goals.trim()) ? 'rgba(99, 102, 241, 0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: (!matchingForm.introduction.trim() || !matchingForm.goals.trim()) ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        fontSize: '0.9rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        opacity: (!matchingForm.introduction.trim() || !matchingForm.goals.trim()) ? 0.6 : 1
                                    }}
                                >
                                    <CheckCircle size={16} />
                                    요청 보내기
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MentorFinding;
