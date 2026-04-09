import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Brain, Code2, Heart, Users, Zap, ChevronLeft, ChevronRight, CheckCircle, Clock, Target, Trophy, MessageCircle } from 'lucide-react';

const About = () => {
    const navigate = useNavigate();
    const [currentCaseIndex, setCurrentCaseIndex] = useState(0);
    const [expandedFAQ, setExpandedFAQ] = useState(null);

    const cases = [
        {
            number: '1',
            emoji: '👩‍🎨',
            name: '김디자이너',
            background: '디자이너 (코딩 경험 0)',
            duration: '정확히 3주',
            project: '할일 관리 앱',
            description: '포토샵만 하던 디자이너가 AI와 함께 실제 동작하는 앱을 만들었어요.',
            result: '사용자 50명이 사용 중인 앱 완성!',
            quote: '"정말 가능할 줄 몰랐어요. 이제 내 아이디어를 바로 만들 수 있다는 게 신기합니다!"',
            color: '#f472b6'
        },
        {
            number: '2',
            emoji: '📊',
            name: '박마케터',
            background: '마케팅 담당자 (코딩 경험 0)',
            duration: '2주',
            project: '자동 보고서 생성 도구',
            description: '매월 반복되는 보고서 작성을 자동화하는 도구를 만들었어요.',
            result: '월 50시간의 업무 시간 단축!',
            quote: '"업무 효율이 5배 높아졌어요. 모든 직장인이 이걸 알아야 합니다!"',
            color: '#fbbf24'
        },
        {
            number: '3',
            emoji: '🎮',
            name: '이학생',
            background: '고등학생 (코딩 경험 약간)',
            duration: '10일',
            project: '2048 게임',
            description: '학교 프로젝트로 게임을 만들었는데, 완전히 새로운 경험이었어요.',
            result: '선생님께 A+ 받고, 친구들도 다 플레이 중!',
            quote: '"코딩이 이렇게 재미있을 줄... 이제 더 많은 게임을 만들고 싶어요!"',
            color: '#60a5fa'
        }
    ];

    const faqs = [
        {
            question: "코딩 경험이 없어도 정말 될까요?",
            answer: "네, 절대 문제없습니다! 오히려 고민이 적어서 더 창의적입니다. 우리 커뮤니티의 성공 사례들이 모두 0에서 시작했거든요. 중요한 것은 '논리적 사고'이지, '문법 지식'이 아닙니다.",
            icon: "❓"
        },
        {
            question: "얼마나 배우는데 걸려요?",
            answer: "• 첫 프로젝트 완성: 1주일\n• 실제 아이디어 구현: 2-3주\n• 중급 수준: 6-8주\n• 전문 수준: 2-3개월\n\n개인차가 있지만, 전통 코딩보다 80% 더 빠릅니다.",
            icon: "⏱️"
        },
        {
            question: "실패해도 괜찮나요?",
            answer: "물론입니다! 우리 커뮤니티의 모든 멘토들이 '실패'에서 시작했습니다. 실패는 '배움의 신호'일 뿐, 절대 수치심의 원인이 아닙니다. 오히려 공개적으로 질문할수록 더 빨리 성장합니다.",
            icon: "💪"
        },
        {
            question: "AI가 모든 걸 해주면, 난 뭐 하는 거죠?",
            answer: "AI는 '손'이고, 당신은 '뇌'입니다. 당신이 하는 일:\n• 아이디어 기획\n• 데이터 흐름 설계\n• 문제 해결\n• 창의적 판단\n\nAI는 단순히 당신의 명령을 코드로 변환할 뿐입니다.",
            icon: "🧠"
        },
        {
            question: "정말 취업이나 수익화가 가능한가요?",
            answer: "네, 완전히 가능합니다! 바이브 코딩으로:\n• 프리랜서 프로젝트 진행\n• 자신의 아이디어 구현 및 출시\n• 기업의 내부 도구 개발\n• 부캐 수익화\n\n중요한 것은 '얼마나 빨리 만드느냐'입니다.",
            icon: "💰"
        },
        {
            question: "준비물은 뭐가 필요한가요?",
            answer: "정말 간단합니다:\n• 💻 노트북 (어떤 브랜드든 OK)\n• 🤖 AI 도구 계정 (ChatGPT, Claude 등 - 무료 가능)\n• 🔥 열정 (가장 중요!)\n\n그게 다입니다!",
            icon: "📦"
        }
    ];

    const learningPath = [
        {
            week: '1주차',
            title: '기초 다지기',
            emoji: '📚',
            tasks: [
                '프롬프트 작성 기초 배우기 (5분 영상)',
                '첫 번째 프로젝트 완성 (계산기)',
                '커뮤니티에 자기소개하기',
                '멘토 찾기'
            ],
            color: '#86efac',
            timeCommit: '주 5-7시간'
        },
        {
            week: '2주차',
            title: '실습하기',
            emoji: '🎮',
            tasks: [
                '게임 1개 만들기',
                '웹페이지 1개 만들기',
                '첫 실패를 멘토와 공유하기',
                'Weekly Challenge 참여'
            ],
            color: '#fca5a5',
            timeCommit: '주 7-10시간'
        },
        {
            week: '3주차',
            title: '심화하기',
            emoji: '⚡',
            tasks: [
                '"내가 만들고 싶던 것" 정의하기',
                '심화 프롬프팅 배우기',
                '1:1 멘토 상담 받기',
                '커뮤니티 피드백 수집'
            ],
            color: '#60a5fa',
            timeCommit: '주 8-12시간'
        },
        {
            week: '4주차',
            title: '공유하기',
            emoji: '🏆',
            tasks: [
                '완성한 프로젝트 발표하기',
                '커뮤니티에 정식 공개',
                '다른 입문자들 멘토링하기',
                '뱃지 및 스포트라이트 획득'
            ],
            color: '#fbbf24',
            timeCommit: '주 10시간 + 공유 시간'
        }
    ];

    return (
        <div style={{ paddingBottom: '100px', fontFamily: '"Pretendard", sans-serif' }}>
            {/* ==================== 헤더 ==================== */}
            <section style={{ textAlign: 'center', padding: '80px 20px 40px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: '800',
                        marginBottom: '16px',
                        background: 'linear-gradient(to right, #818cf8, #c084fc)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Vibe Coding이란?
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        '바이브 코딩'은 단순히 코드를 짜는 행위를 넘어,<br />
                        <strong>누구나, 빠르게, 즐겁게</strong> 자신의 아이디어를 현실로 만드는 것입니다.
                    </p>
                </motion.div>
            </section>

            {/* ==================== 실제 사례 (인터랙티브 슬라이드) ==================== */}
            <section style={{ maxWidth: '1000px', margin: '80px auto', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                        🌟 실제 성공 사례들
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                        이 사람들도 3개월 전엔 입문자였습니다
                    </p>
                </div>

                <motion.div
                    key={currentCaseIndex}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '50px',
                        marginBottom: '40px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        top: '-30%',
                        right: '-20%',
                        width: '300px',
                        height: '300px',
                        background: `radial-gradient(circle, rgba(${cases[currentCaseIndex].color === '#f472b6' ? '244,114,182' : cases[currentCaseIndex].color === '#fbbf24' ? '251,191,36' : '96,165,250'}, 0.1), transparent 60%)`,
                        pointerEvents: 'none'
                    }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{ fontSize: '4rem' }}>{cases[currentCaseIndex].emoji}</div>
                            <div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '700', margin: 0, color: 'white', marginBottom: '4px' }}>
                                    {cases[currentCaseIndex].name}
                                </h3>
                                <p style={{ color: cases[currentCaseIndex].color, fontWeight: '600', margin: 0 }}>
                                    {cases[currentCaseIndex].background}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                            <StatBox label="소요 시간" value={cases[currentCaseIndex].duration} icon="⏱️" />
                            <StatBox label="만든 것" value={cases[currentCaseIndex].project} icon="🎯" />
                            <StatBox label="결과" value={cases[currentCaseIndex].result} icon="🏆" />
                        </div>

                        <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '20px' }}>
                            {cases[currentCaseIndex].description}
                        </p>

                        <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderLeft: `4px solid ${cases[currentCaseIndex].color}`,
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '20px'
                        }}>
                            <p style={{ color: cases[currentCaseIndex].color, fontStyle: 'italic', fontSize: '1.05rem', margin: 0 }}>
                                {cases[currentCaseIndex].quote}
                            </p>
                        </div>

                        {/* 슬라이드 컨트롤 */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                            <button
                                onClick={() => setCurrentCaseIndex((prev) => (prev - 1 + cases.length) % cases.length)}
                                style={{
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '10px',
                                    padding: '10px',
                                    color: '#818cf8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                {cases.map((_, i) => (
                                    <motion.div
                                        key={i}
                                        onClick={() => setCurrentCaseIndex(i)}
                                        animate={{
                                            width: i === currentCaseIndex ? 24 : 8,
                                            background: i === currentCaseIndex ? '#818cf8' : 'rgba(255,255,255,0.2)'
                                        }}
                                        style={{
                                            height: '8px',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s'
                                        }}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentCaseIndex((prev) => (prev + 1) % cases.length)}
                                style={{
                                    background: 'rgba(99, 102, 241, 0.2)',
                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                    borderRadius: '10px',
                                    padding: '10px',
                                    color: '#818cf8',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ==================== 솔직한 Q&A ==================== */}
            <section style={{ maxWidth: '1000px', margin: '80px auto', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                        🙋 자주 묻는 질문
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                        입문자들의 모든 걱정, 여기 있습니다
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                >
                    {faqs.map((faq, i) => (
                        <FAQItem
                            key={i}
                            faq={faq}
                            isExpanded={expandedFAQ === i}
                            onToggle={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                        />
                    ))}
                </motion.div>
            </section>

            {/* ==================== 4주 학습 경로 ==================== */}
            <section style={{ maxWidth: '1000px', margin: '80px auto', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                        📅 4주 완성 학습 경로
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                        단계별로 성장하는 여정, 함께 하세요
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))',
                        gap: '24px'
                    }}
                >
                    {learningPath.map((path, i) => (
                        <LearningPathCard key={i} path={path} index={i} />
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '2px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: '16px',
                        padding: '24px',
                        marginTop: '40px',
                        textAlign: 'center'
                    }}
                >
                    <p style={{ color: '#22c55e', fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>
                        ✨ 4주 후, 당신은 "실제로 무언가를 만들 수 있는 개발자"가 됩니다!
                    </p>
                </motion.div>
            </section>

            {/* ==================== 멘토와 함께 ==================== */}
            <section style={{ maxWidth: '1000px', margin: '80px auto', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', color: 'white', marginBottom: '12px' }}>
                        👨‍🏫 멘토와 함께 성장하기
                    </h2>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                        혼자가 아닙니다. 같은 길을 걸었던 멘토들이 응원합니다
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    style={{
                        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '24px',
                        padding: '40px',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '32px', marginBottom: '40px' }}>
                        <MentorBenefit
                            emoji="🎓"
                            title="1:1 맞춤 상담"
                            desc="당신만의 학습 경로를 함께 설계합니다"
                        />
                        <MentorBenefit
                            emoji="🚀"
                            title="빠른 피드백"
                            desc="막히는 부분을 즉시 도와드립니다"
                        />
                        <MentorBenefit
                            emoji="💪"
                            title="심리적 지원"
                            desc="'실패도 배움'이라는 것을 함께 느껴봅니다"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/mentor')}
                        style={{
                            padding: '16px 40px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                        }}
                    >
                        멘토 찾아보기
                    </motion.button>
                </motion.div>
            </section>

            {/* ==================== 핵심 가치 (재정의) ==================== */}
            <section style={{ maxWidth: '1000px', margin: '80px auto 0', padding: '0 20px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))',
                    gap: '24px'
                }}>
                    <ValueCard
                        icon={<Brain size={32} color="#facc15" />}
                        title="논리에 집중"
                        desc="코딩 문법은 AI가, 당신은 문제 해결과 창의력에만 집중합니다."
                        delay={0.1}
                    />
                    <ValueCard
                        icon={<Sparkles size={32} color="#2dd4bf" />}
                        title="AI와 협업"
                        desc="AI는 도구가 아닌 파트너입니다. 자연어로 대화하듯 코드를 만듭니다."
                        delay={0.2}
                    />
                    <ValueCard
                        icon={<Heart size={32} color="#f472b6" />}
                        title="즐거움이 우선"
                        desc="에러는 배움이고, 실패는 성장입니다. 스트레스 없이 즐겨보세요."
                        delay={0.3}
                    />
                </div>
            </section>

            {/* ==================== Manifesto ==================== */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                style={{
                    background: 'rgba(30, 41, 59, 0.3)',
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    padding: '80px 20px',
                    textAlign: 'center',
                    marginTop: '80px'
                }}
            >
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '40px' }}>
                        우리의 선언
                    </h2>
                    <div style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: '2', wordBreak: 'keep-all' }}>
                        <p style={{ marginBottom: '20px' }}>
                            우리는 <strong style={{ color: '#fff' }}>완벽한 코드</strong>보다 <strong style={{ color: '#fff' }}>창의적인 해결책</strong>을 지향합니다.<br />
                            우리는 <strong style={{ color: '#fff' }}>혼자 걷는 천재</strong>보다 <strong style={{ color: '#fff' }}>함께 걷는 동료</strong>를 소중히 여깁니다.<br />
                            우리는 <strong style={{ color: '#fff' }}>기술의 껍데기</strong>가 아닌, <strong style={{ color: '#fff' }}>본질적인 가치</strong>를 추구합니다.
                        </p>
                        <p>
                            이곳 Korea Coding Vibe Lab에서,<br />
                            <strong style={{ color: '#818cf8' }}>당신만의 고유한 리듬(Vibe)을 찾으시길 바랍니다.</strong>
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* ==================== Community Culture ==================== */}
            <section style={{ maxWidth: '1000px', margin: '80px auto', padding: '0 20px' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '40px' }}>
                    🤝 우리의 커뮤니티 문화
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '20px' }}>
                    <CultureItem
                        icon={<Users size={24} color="#60a5fa" />}
                        title="존중과 공유"
                        desc="서로의 코드를 존중하고, 아낌없이 지식을 공유합니다. 비난보다는 격려가 오가는 문화입니다."
                    />
                    <CultureItem
                        icon={<Zap size={24} color="#a855f7" />}
                        title="지속적 성장"
                        desc="어제보다 나은 오늘의 나를 목표로 합니다. 느려도 괜찮습니다. 멈추지 않는 것이 중요합니다."
                    />
                    <CultureItem
                        icon={<Code2 size={24} color="#4ade80" />}
                        title="오픈 정신"
                        desc="우리의 결과물을 투명하게 공개하고, 더 큰 생태계에 기여하는 오픈소스 정신을 지향합니다."
                    />
                </div>
            </section>

            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

// 재사용 컴포넌트들
const StatBox = ({ label, value, icon }) => (
    <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 4px' }}>{label}</p>
        <p style={{ color: '#fff', fontWeight: '600', fontSize: '1rem', margin: 0 }}>{value}</p>
    </div>
);

const FAQItem = ({ faq, isExpanded, onToggle }) => (
    <div
        style={{
            background: isExpanded ? 'rgba(99, 102, 241, 0.1)' : 'rgba(30, 41, 59, 0.3)',
            border: isExpanded ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'background 0.3s, border 0.3s'
        }}
    >
        <button
            onClick={onToggle}
            style={{
                width: '100%',
                padding: '20px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '1.05rem',
                fontWeight: '600',
                textAlign: 'left'
            }}
        >
            <span style={{ fontSize: '1.5rem' }}>{faq.icon}</span>
            <span style={{ flex: 1 }}>{faq.question}</span>
            <span style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
                display: 'flex'
            }}>
                <ChevronRight size={20} />
            </span>
        </button>

        {isExpanded && (
            <div style={{
                borderTop: '1px solid rgba(255,255,255,0.05)',
                padding: '20px',
                paddingTop: '12px'
            }}>
                <p style={{ color: '#cbd5e1', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {faq.answer}
                </p>
            </div>
        )}
    </div>
);

const LearningPathCard = ({ path, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -8 }}
        style={{
            background: `linear-gradient(145deg, rgba(${path.color === '#86efac' ? '134,239,172' : path.color === '#fca5a5' ? '252,165,165' : path.color === '#60a5fa' ? '96,165,250' : '251,191,36'}, 0.1), transparent)`,
            backdropFilter: 'blur(10px)',
            border: `2px solid rgba(${path.color === '#86efac' ? '134,239,172' : path.color === '#fca5a5' ? '252,165,165' : path.color === '#60a5fa' ? '96,165,250' : '251,191,36'}, 0.3)`,
            borderRadius: '20px',
            padding: '28px',
            transition: 'all 0.3s',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '150px',
            height: '150px',
            background: `radial-gradient(circle, rgba(${path.color === '#86efac' ? '134,239,172' : path.color === '#fca5a5' ? '252,165,165' : path.color === '#60a5fa' ? '96,165,250' : '251,191,36'}, 0.1), transparent 60%)`,
            pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '2rem' }}>{path.emoji}</div>
                <div>
                    <p style={{ color: path.color, fontSize: '0.85rem', fontWeight: '700', margin: 0, textTransform: 'uppercase' }}>
                        {path.week}
                    </p>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: 0, color: 'white' }}>
                        {path.title}
                    </h3>
                </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '16px', fontStyle: 'italic' }}>
                ⏱️ {path.timeCommit}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {path.tasks.map((task, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                        <CheckCircle size={16} color={path.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{task}</span>
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
);

const MentorBenefit = ({ emoji, title, desc }) => (
    <motion.div
        whileHover={{ y: -8 }}
        style={{
            textAlign: 'center'
        }}
    >
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{emoji}</div>
        <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            {title}
        </h4>
        <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
            {desc}
        </p>
    </motion.div>
);

const ValueCard = ({ icon, title, desc, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: delay }}
        whileHover={{ y: -5 }}
        style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.3s'
        }}
    >
        <div style={{ marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '12px', color: '#f8fafc' }}>{title}</h3>
        <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{desc}</p>
    </motion.div>
);

const CultureItem = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ y: -5 }}
        style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'all 0.3s'
        }}
    >
        <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0
        }}>
            {icon}
        </div>
        <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{title}</h4>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>{desc}</p>
        </div>
    </motion.div>
);

export default About;
