
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Coffee, Code2, ArrowRight, Flame, Trophy, Sparkles, Brain, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ paddingBottom: '100px', fontFamily: '"Pretendard", sans-serif' }}>
            {/* Hero Section */}
            <section style={{
                textAlign: 'center',
                padding: '120px 20px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Decor */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
                    zIndex: -1,
                    filter: 'blur(80px)',
                    animation: 'pulse 6s infinite ease-in-out'
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 20px',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '30px',
                        marginBottom: '30px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.9rem',
                        color: '#94a3b8',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <Sparkles size={16} color="#fbbf24" />
                        <span style={{ letterSpacing: '0.5px' }}>AI Native Coding Paradigm</span>
                    </div>

                    <h1 style={{
                        fontSize: '3.5rem',
                        fontWeight: '800',
                        marginBottom: '24px',
                        lineHeight: '1.2',
                        color: 'white'
                    }}>
                        코딩, 이제 암기가 아니라<br />
                        <span style={{
                            background: 'linear-gradient(to right, #818cf8, #c084fc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>'감각(Vibe)'</span>입니다.
                    </h1>

                    <p style={{
                        fontSize: '1.25rem',
                        color: '#94a3b8',
                        maxWidth: '700px',
                        margin: '0 auto 40px',
                        lineHeight: '1.7',
                        wordBreak: 'keep-all'
                    }}>
                        복잡한 문법은 AI에게 맡기고, 당신은 흐름만 타세요.<br />
                        누구나 자신의 아이디어를 현실로 만드는 곳,<br />
                        <strong>Korea Coding Vibe Lab</strong>입니다.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '60px' }}>
                        <Link to="/attendance" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '16px 36px',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    border: 'none',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    boxShadow: '0 10px 25px -10px rgba(99, 102, 241, 0.6)'
                                }}
                            >
                                나만의 Vibe 찾기
                                <ArrowRight size={20} />
                            </motion.button>
                        </Link>
                        <Link to="/community" style={{ textDecoration: 'none' }}>
                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    padding: '16px 36px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '16px',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <Users size={20} />
                                동료들의 코드 구경하기
                            </motion.button>
                        </Link>
                    </div>

                    <p style={{
                        fontSize: '1rem',
                        color: '#64748b',
                        fontStyle: 'italic'
                    }}>
                        "Error는 실패가 아닙니다. 더 완벽한 Vibe를 찾기 위한 과정일 뿐입니다."
                    </p>
                </motion.div>
            </section>

            {/* Vibe Stats (TODAY'S HEAT) */}
            <motion.section
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ maxWidth: '1000px', margin: '0 auto 120px', padding: '0 20px' }}
            >
                <div style={{
                    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '30px',
                    padding: '40px 50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '40px',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#fb923c' }}>
                            <Flame size={24} fill="#fb923c" />
                            <span style={{ fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.9rem' }}>TODAY'S HEAT</span>
                        </div>
                        <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px', color: 'white', lineHeight: '1' }}>
                            1,240 <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 'normal' }}>points</span>
                        </h2>
                        <p style={{ color: '#cbd5e1', maxWidth: '400px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                            오늘 하루 동안 멤버들이 코딩으로 불태운 열정의 총합입니다.
                            여러분의 한 줄 코드가 모여 온도를 높입니다! 🔥
                        </p>
                    </div>

                    {/* Mock Progress Bar */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.9rem', color: '#94a3b8' }}>
                            <span>Normal</span>
                            <span>Burning!</span>
                        </div>
                        <div style={{ width: '100%', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>
                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: '75%' }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #facc15 0%, #f97316 100%)',
                                    borderRadius: '10px',
                                    boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)'
                                }}
                            />
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '0.85rem', color: '#fb923c', fontWeight: 'bold' }}>
                            현재 상태: 매우 뜨거움 🥵
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Philosophy Section */}
            <section style={{ maxWidth: '1200px', margin: '0 auto 120px', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '16px' }}>What is Vibe Coding?</h2>
                    <p style={{ fontSize: '1.1rem', color: '#94a3b8' }}>
                        이제 개발자는 '작성자(Writer)'에서 '관리자(Manager)'로 변모합니다.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    gap: '30px'
                }}>
                    <PhilosophyCard
                        icon={<Brain size={32} color="#a855f7" />}
                        title="Focus on Logic"
                        desc="코드의 세부 구현보다는 논리, 구조, 그리고 창의적인 아이디어에 집중하세요."
                    />
                    <PhilosophyCard
                        icon={<Sparkles size={32} color="#2dd4bf" />}
                        title="AI Collaboration"
                        desc="개발자가 문법 하나하나를 타이핑하는 것이 아니라, AI에게 자연어로 의도를 전달합니다."
                    />
                    <PhilosophyCard
                        icon={<Code2 size={32} color="#f472b6" />}
                        title="Accessibility"
                        desc="복잡한 코딩 문법을 몰라도, 논리적 사고만 있다면 누구나 소프트웨어를 만들 수 있습니다."
                    />
                </div>
            </section>

            {/* Mission Section */}
            <section style={{
                background: 'rgba(255,255,255,0.02)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                padding: '100px 20px'
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '40px' }}>
                        우리는 코딩의 문턱을 없앱니다.
                    </h2>
                    <div style={{ fontSize: '1.1rem', color: '#cbd5e1', lineHeight: '1.8', wordBreak: 'keep-all' }}>
                        <p style={{ marginBottom: '24px' }}>
                            '개발은 어렵다'는 편견을 버리세요.<br />
                            바이브 코딩 시대에는 당신의 아이디어와 논리만 있다면 충분합니다.
                        </p>
                        <p style={{ marginBottom: '24px' }}>
                            이곳은 이제 막 코딩에 흥미를 느낀 일반인부터,<br />
                            더 나은 효율을 찾는 현업 개발자까지 모두가 모인 오픈 커뮤니티입니다.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '40px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <Zap size={20} color="#facc15" />
                                <span><strong>자유로운 공유:</strong> 내가 만든 프롬프트와 코드를 자랑하고 피드백을 받으세요.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <Users size={20} color="#60a5fa" />
                                <span><strong>집단지성:</strong> 막히는 문제가 있나요? 동료들과 AI가 함께 답을 찾아갑니다.</span>
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <Activity size={20} color="#f472b6" />
                                <span><strong>동반 성장:</strong> 서로의 Vibe를 배우며 어제보다 더 나은 개발자로 성장합니다.</span>
                            </li>
                        </ul>
                        <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>
                            기술이 아닌, 문화를 만듭니다.<br />
                            당신의 첫 번째 코드를 여기서 시작하세요.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

const PhilosophyCard = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ y: -10, borderColor: 'rgba(255,255,255,0.2)' }}
        style={{
            background: 'rgba(30, 41, 59, 0.3)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            padding: '40px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            transition: 'all 0.3s ease'
        }}
    >
        <div style={{
            width: '60px', height: '60px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px'
        }}>
            {icon}
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#f8fafc' }}>{title}</h3>
        <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '1.05rem' }}>{desc}</p>
    </motion.div>
);

export default Home;
