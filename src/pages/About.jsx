import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Code2, Heart, Users, Zap } from 'lucide-react';

const About = () => {
    return (
        <div style={{ paddingBottom: '100px', fontFamily: '"Pretendard", sans-serif' }}>
            {/* Header */}
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
                        What is Vibe Coding?
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                        '바이브 코딩'은 단순히 코드를 짜는 행위를 넘어,<br />
                        코딩을 즐기고, 몰입하며, 그 과정 자체에서 리듬을 타는 것을 의미합니다.
                    </p>
                </motion.div>
            </section>

            {/* Core Values */}
            <section style={{ maxWidth: '1000px', margin: '0 auto 80px', padding: '0 20px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px'
                }}>
                    <ValueCard
                        icon={<Brain size={32} color="#facc15" />}
                        title="Focus on Data Flow"
                        desc="문법보다는 데이터의 흐름과 로직에 집중합니다. AI가 코드를 작성하는 동안, 우리는 건축가가 되어 전체적인 구조를 설계합니다."
                        delay={0.1}
                    />
                    <ValueCard
                        icon={<Sparkles size={32} color="#2dd4bf" />}
                        title="AI-Native Workflow"
                        desc="AI를 단순한 도구가 아닌 파트너로 인식합니다. 프롬프트는 우리의 새로운 프로그래밍 언어이며, 대화는 곧 코드가 됩니다."
                        delay={0.2}
                    />
                    <ValueCard
                        icon={<Heart size={32} color="#f472b6" />}
                        title="No Stress, Just Vibe"
                        desc="에러는 배움의 기회일 뿐, 스트레스가 아닙니다. 안 풀리면 심호흡 한 번 하고, 좋아하는 음악을 들으며 다시 시작하세요."
                        delay={0.3}
                    />
                </div>
            </section>

            {/* Manifesto Section */}
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
                    textAlign: 'center'
                }}
            >
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '40px' }}>
                        Our Manifesto
                    </h2>
                    <div style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: '2', wordBreak: 'keep-all' }}>
                        <p style={{ marginBottom: '20px' }}>
                            우리는 <strong>완벽한 코드</strong>보다 <strong>창의적인 해결책</strong>을 지향합니다.<br />
                            우리는 <strong>혼자 걷는 천재</strong>보다 <strong>함께 걷는 동료</strong>를 소중히 여깁니다.<br />
                            우리는 <strong>기술의 껍데기</strong>가 아닌, <strong>본질적인 가치</strong>를 추구합니다.
                        </p>
                        <p>
                            이곳 Korea Coding Vibe Lab에서,<br />
                            당신만의 고유한 리듬(Vibe)을 찾으시길 바랍니다.
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* Community Culture */}
            <section style={{ maxWidth: '1000px', margin: '80px auto', padding: '0 20px' }}>
                <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '40px' }}>
                    Community Culture
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    <CultureItem
                        icon={<Users size={24} color="#60a5fa" />}
                        title="Respect & Share"
                        desc="서로의 코드를 존중하고, 아낌없이 지식을 공유합니다. 비난보다는 격려가, 지적보다는 조언이 오가는 문화를 만듭니다."
                    />
                    <CultureItem
                        icon={<Zap size={24} color="#a855f7" />}
                        title="Keep Growing"
                        desc="어제보다 나은 오늘의 나를 목표로 합니다. 느려도 괜찮습니다. 멈추지 않고 꾸준히 나아가는 것이 중요합니다."
                    />
                    <CultureItem
                        icon={<Code2 size={24} color="#4ade80" />}
                        title="Open Source Spirit"
                        desc="우리의 결과물을 투명하게 공개하고, 더 큰 생태계에 기여하는 오픈소스 정신을 지향합니다."
                    />
                </div>
            </section>
        </div>
    );
};

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
            boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.2)'
        }}
    >
        <div style={{ marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '12px', color: '#f8fafc' }}>{title}</h3>
        <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{desc}</p>
    </motion.div>
);

const CultureItem = ({ icon, title, desc }) => (
    <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)'
    }}>
        <div style={{
            background: 'rgba(255,255,255,0.05)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>{title}</h4>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', lineHeight: '1.5', margin: 0 }}>{desc}</p>
        </div>
    </div>
);

export default About;
