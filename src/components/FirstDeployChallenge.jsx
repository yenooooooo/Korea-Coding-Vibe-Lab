import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const STORAGE_KEY = 'first_deploy_challenge';

const MISSIONS = [
    {
        day: 1,
        title: '가입 & 환경 설정',
        desc: 'Cursor 또는 Bolt.new에 가입하고, GitHub 계정을 만드세요.',
        tip: 'Bolt.new는 설치 없이 브라우저에서 바로 시작할 수 있어 초보자에게 딱입니다!'
    },
    {
        day: 2,
        title: '첫 프로젝트 만들기',
        desc: 'AI에게 "간단한 포트폴리오 페이지 만들어줘"라고 말해보세요.',
        tip: '구체적일수록 좋아요. 원하는 색상, 레이아웃도 함께 알려주세요!'
    },
    {
        day: 3,
        title: '페이지 꾸미기',
        desc: '자기소개, 사진(또는 아바타), 연락처를 추가해보세요.',
        tip: '"이 섹션에 그라디언트 배경을 추가해줘" 같은 프롬프트가 효과적입니다.'
    },
    {
        day: 4,
        title: 'GitHub에 코드 올리기',
        desc: '만든 프로젝트를 GitHub 저장소에 올려보세요.',
        tip: 'AI에게 "GitHub에 올리는 방법 알려줘"라고 물어보면 단계별로 안내해줍니다.'
    },
    {
        day: 5,
        title: 'Vercel로 배포하기',
        desc: 'Vercel(vercel.com)에 접속해서 GitHub 저장소를 연결하고 배포하세요.',
        tip: 'Vercel은 무료로 사용할 수 있고, GitHub와 연결하면 클릭 몇 번으로 배포됩니다!'
    },
    {
        day: 6,
        title: '기능 하나 추가하기',
        desc: '다크모드, 애니메이션, 연락 폼 중 하나를 AI와 함께 추가해보세요.',
        tip: '기능을 추가할 때 "현재 코드에서 X 기능만 추가해줘"라고 명확히 말하세요.'
    },
    {
        day: 7,
        title: '커뮤니티에 공유하기',
        desc: '완성된 사이트 링크를 이 커뮤니티 바이브 스퀘어에 공유해보세요!',
        tip: '배포된 URL을 복사해서 커뮤니티 게시판에 자랑해보세요. 모두가 응원합니다! 🎉'
    }
];

const FirstDeployChallenge = () => {
    const [completed, setCompleted] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    });
    const [expandedDay, setExpandedDay] = useState(null);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }, [completed]);

    const toggleComplete = (day) => {
        setCompleted(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const allDone = completed.length === MISSIONS.length;
    const progress = Math.round((completed.length / MISSIONS.length) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(30, 41, 59, 0.6))',
                borderRadius: '24px',
                padding: '30px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                marginTop: '40px'
            }}
        >
            <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    🚀 7일 첫 배포 챌린지
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
                    7일 안에 첫 번째 웹사이트를 배포해보세요! 하루 30분으로 충분합니다.
                </p>
            </div>

            {/* 진행 바 */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{completed.length}/{MISSIONS.length} 완료</span>
                    <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>{progress}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #10b981, #34d399)',
                            borderRadius: '4px',
                            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)'
                        }}
                    />
                </div>
            </div>

            {/* 미션 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {MISSIONS.map((mission) => {
                    const isDone = completed.includes(mission.day);
                    const isExpanded = expandedDay === mission.day;
                    return (
                        <div
                            key={mission.day}
                            style={{
                                background: isDone ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.4)',
                                border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                                borderRadius: '14px',
                                overflow: 'hidden',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    padding: '14px 16px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setExpandedDay(isExpanded ? null : mission.day)}
                            >
                                <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={(e) => { e.stopPropagation(); toggleComplete(mission.day); }}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
                                />
                                <div style={{
                                    minWidth: '36px', height: '36px', borderRadius: '10px',
                                    background: isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '0.8rem', fontWeight: '900',
                                    color: isDone ? '#10b981' : '#a5b4fc'
                                }}>
                                    D{mission.day}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontWeight: '700', fontSize: '0.95rem',
                                        color: isDone ? '#6ee7b7' : '#e2e8f0',
                                        textDecoration: isDone ? 'line-through' : 'none'
                                    }}>
                                        {mission.title}
                                    </div>
                                </div>
                                <span style={{ color: '#64748b', fontSize: '1rem' }}>{isExpanded ? '▲' : '▼'}</span>
                            </div>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{ padding: '0 16px 16px 68px' }}
                                >
                                    <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0 0 10px 0', lineHeight: '1.6' }}>
                                        {mission.desc}
                                    </p>
                                    <div style={{
                                        padding: '10px 14px',
                                        background: 'rgba(245, 158, 11, 0.1)',
                                        border: '1px solid rgba(245, 158, 11, 0.2)',
                                        borderRadius: '8px',
                                        fontSize: '0.85rem',
                                        color: '#fbbf24'
                                    }}>
                                        💡 {mission.tip}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 완료 메시지 */}
            {allDone && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                        marginTop: '24px',
                        padding: '20px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(52, 211, 153, 0.1))',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        borderRadius: '14px',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎉</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#6ee7b7', marginBottom: '6px' }}>
                        7일 챌린지 완료!
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                        첫 번째 배포를 완성했습니다. 이제 진짜 개발자입니다! 🚀
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default FirstDeployChallenge;
