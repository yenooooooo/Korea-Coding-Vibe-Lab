import React, { useState } from 'react';
import { motion } from 'framer-motion';
import FirstDeployChallenge from '../components/FirstDeployChallenge';
import { Download, BookOpen, Rocket, Code2, AlertTriangle, Wrench, ArrowRight, Sparkles, CheckCircle, X, Monitor, Zap, MessageSquare, Loader } from 'lucide-react';

const StarterGuide = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeSection, setActiveSection] = useState(null);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: html2canvas } = await import('html2canvas');
            const { getPdfPages, getPdfPages2 } = await import('../lib/starterGuidePdfPages');

            const allPages = [...getPdfPages(), ...getPdfPages2()];
            const pdf = new jsPDF('p', 'mm', 'a4');

            for (let i = 0; i < allPages.length; i++) {
                const container = document.createElement('div');
                container.innerHTML = allPages[i];
                container.style.position = 'fixed';
                container.style.left = '-9999px';
                container.style.top = '0';
                document.body.appendChild(container);

                const canvas = await html2canvas(container.firstElementChild, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#0f172a',
                    logging: false,
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                if (i > 0) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
                document.body.removeChild(container);
            }

            pdf.save('바이브코딩_스타터팩_가이드.pdf');
        } catch (error) {
            console.error('PDF generation error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const sections = [
        {
            num: '01', title: '바이브코딩이란?',
            subtitle: 'AI와 대화하며 코딩하는 새로운 방식',
            icon: <Sparkles size={24} />, color: '#6366f1',
            content: [
                '코드를 모르는 사람도 AI에게 "이런 걸 만들어줘"라고 말하면 실제 작동하는 프로그램이 완성됩니다.',
                'AI가 코드를 작성하고, 당신은 아이디어와 방향을 제시하는 것이 바이브코딩의 핵심입니다.',
                '프로그래밍 언어를 외울 필요 없이, 자연어로 소통하며 원하는 결과물을 만들어보세요!'
            ]
        },
        {
            num: '02', title: '시작 전 준비물',
            subtitle: '도구, 계정, 환경 설정',
            icon: <Wrench size={24} />, color: '#10b981',
            content: [
                'Cursor, Windsurf, Bolt.new 중 하나만 있으면 시작 가능!',
                'GitHub 계정으로 코드를 저장하고, Vercel로 무료 배포하세요.',
                'Supabase를 연결하면 데이터베이스와 인증까지 무료로 추가됩니다.'
            ]
        },
        {
            num: '03', title: '프롬프트 작성 기초',
            subtitle: '좋은 프롬프트 vs 나쁜 프롬프트',
            icon: <MessageSquare size={24} />, color: '#f59e0b',
            content: [
                '❌ "웹사이트 만들어줘" → ⭕ "다크모드 포트폴리오 사이트를 React로 만들어줘"',
                '❌ "버튼 추가" → ⭕ "보라색 그라디언트 제출 버튼을 폼 하단에 추가해줘"',
                '구체적일수록, 기술 스택을 명시할수록 AI가 정확한 결과를 줍니다.'
            ]
        },
        {
            num: '04', title: '실전 예제 5가지',
            subtitle: '바로 따라할 수 있는 프로젝트',
            icon: <Code2 size={24} />, color: '#ec4899',
            content: [
                '포트폴리오 사이트, 투두 앱, 날씨 대시보드, 미니 게임, 채팅 앱',
                '각 예제마다 바로 복사해서 쓸 수 있는 프롬프트 템플릿이 포함되어 있습니다.',
                'PDF에서 더 자세한 프롬프트 예시를 확인하세요!'
            ]
        },
        {
            num: '05', title: '초보자 흔한 실수 TOP 5',
            subtitle: '이것만 피하면 절반은 성공',
            icon: <AlertTriangle size={24} />, color: '#ef4444',
            content: [
                '너무 애매하게 말하기 / 한번에 다 만들려고 하기',
                '테스트 안 하고 계속 기능 추가 / 에러 메시지 무시',
                '버전 관리(Git) 안 하기 — 이 5가지만 피해도 성장 속도가 2배!'
            ]
        },
        {
            num: '06', title: '추천 AI 코딩 도구',
            subtitle: 'Cursor, Windsurf, Bolt 등 비교',
            icon: <Monitor size={24} />, color: '#3b82f6',
            content: [
                '초보자 추천 1순위: Bolt.new (설치 없이 브라우저에서 바로 사용)',
                '본격적으로 배울 때: Cursor (무료 티어로도 충분)',
                'UI 디자인만: v0.dev (텍스트로 컴포넌트 생성)'
            ]
        },
        {
            num: '07', title: '다음 단계',
            subtitle: 'Korea Coding Vibe Lab 활용하기',
            icon: <Rocket size={24} />, color: '#8b5cf6',
            content: [
                '출석 체크인으로 꾸준함 기르기, AI 스터디로 실력 올리기',
                '배틀 아레나에서 경쟁하고, 퀘스트로 포인트 모으기',
                '7일 챌린지: 가입 → 랜딩페이지 → DB 연결 → 배포 → 커뮤니티 공유!'
            ]
        }
    ];

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', paddingBottom: '100px' }}>
            {/* 헤더 */}
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '50px' }}>
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                    style={{
                        width: '80px', height: '80px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        borderRadius: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)',
                    }}
                >
                    <BookOpen size={40} color="white" />
                </motion.div>
                <h1 style={{
                    fontSize: '2.8rem', fontWeight: '900',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: '12px', lineHeight: '1.2'
                }}>
                    바이브코딩 스타터 팩
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.15rem', marginBottom: '32px', lineHeight: '1.6' }}>
                    AI 프롬프트 코딩 초보자를 위한 완벽 가이드 📚
                </p>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    style={{
                        padding: '18px 40px',
                        background: isGenerating ? 'rgba(99, 102, 241, 0.3)' : 'linear-gradient(135deg, #6366f1, #a855f7)',
                        border: 'none', borderRadius: '16px', color: '#fff',
                        fontSize: '1.1rem', fontWeight: '800',
                        cursor: isGenerating ? 'wait' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '12px',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                    }}
                >
                    {isGenerating ? (<><Loader size={22} style={{ animation: 'spin 1s linear infinite' }} /> PDF 생성 중...</>) : (<><Download size={22} /> 📥 PDF 다운로드 (무료)</>)}
                </motion.button>
                <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '12px' }}>10페이지 · 한글 콘텐츠 · A4 사이즈</p>
            </motion.div>

            {/* 콘텐츠 미리보기 카드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginBottom: '60px' }}>
                {sections.map((section, idx) => (
                    <motion.div
                        key={section.num}
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                        onClick={() => setActiveSection(activeSection === idx ? null : idx)}
                        style={{
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
                            backdropFilter: 'blur(10px)',
                            border: activeSection === idx ? `2px solid ${section.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '20px', padding: '24px', cursor: 'pointer',
                            transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
                        }}
                    >
                        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, ${section.color}15, transparent 70%)`, borderRadius: '50%' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: `${section.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: section.color, border: `1px solid ${section.color}30`, flexShrink: 0,
                            }}>
                                {section.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: section.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                    Chapter {section.num}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fff', margin: 0 }}>{section.title}</h3>
                            </div>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 12px 0', lineHeight: '1.5' }}>{section.subtitle}</p>
                        {activeSection === idx && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px', marginTop: '6px' }}>
                                {section.content.map((text, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                                        <CheckCircle size={16} color={section.color} style={{ marginTop: '3px', flexShrink: 0 }} />
                                        <span style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5' }}>{text}</span>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: section.color, fontSize: '0.8rem', fontWeight: '600' }}>
                            {activeSection === idx ? (<>접기 <X size={14} /></>) : (<>미리보기 <ArrowRight size={14} /></>)}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 하단 CTA */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                style={{
                    textAlign: 'center', padding: '48px 32px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05))',
                    borderRadius: '24px', border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
            >
                <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#fff', marginBottom: '12px' }}>지금 바로 시작하세요! 🚀</h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '28px', lineHeight: '1.6' }}>
                    PDF를 다운로드하고, 첫 번째 프로젝트를 만들어보세요.<br />
                    모든 대가는 초보자였습니다. 중요한 건 시작하는 것!
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPDF} disabled={isGenerating}
                    style={{
                        padding: '16px 36px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        border: 'none', borderRadius: '14px', color: '#fff',
                        fontSize: '1.05rem', fontWeight: '700', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '10px',
                    }}
                >
                    <Download size={20} /> PDF 다운로드
                </motion.button>
            </motion.div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

            <FirstDeployChallenge />
        </div>
    );
};

export default StarterGuide;
