import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dna, Share2, RefreshCw, ChevronRight, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import {
    collectDNAData,
    calculateScores,
    classifyType,
    generateInsight,
    DNA_AXES,
    AXIS_LABELS,
    AXIS_ICONS,
    AXIS_COLORS,
} from '../utils/vibeDNA';

// SVG 레이더 차트 컴포넌트
const RadarChart = ({ scores, size = 280 }) => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 40;
    const levels = [20, 40, 60, 80, 100];
    const axes = DNA_AXES;

    const getPoint = (index, value) => {
        const angle = (Math.PI * 2 * index) / axes.length - Math.PI / 2;
        const r = (value / 100) * radius;
        return {
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
        };
    };

    const dataPoints = axes.map((axis, i) => getPoint(i, scores[axis] || 0));
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <defs>
                <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* 그리드 레벨 */}
            {levels.map((level) => {
                const points = axes.map((_, i) => getPoint(i, level));
                const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
                return (
                    <path
                        key={level}
                        d={path}
                        fill="none"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1"
                    />
                );
            })}

            {/* 축 선 */}
            {axes.map((_, i) => {
                const end = getPoint(i, 100);
                return (
                    <line
                        key={i}
                        x1={cx}
                        y1={cy}
                        x2={end.x}
                        y2={end.y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="1"
                    />
                );
            })}

            {/* 데이터 영역 */}
            <motion.path
                d={dataPath}
                fill="url(#radarGrad)"
                stroke="url(#radarStroke)"
                strokeWidth="2"
                filter="url(#glow)"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
            />

            {/* 데이터 포인트 */}
            {dataPoints.map((p, i) => (
                <motion.circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill={AXIS_COLORS[axes[i]]}
                    stroke="#fff"
                    strokeWidth="1.5"
                    filter="url(#glow)"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                />
            ))}

            {/* 축 라벨 */}
            {axes.map((axis, i) => {
                const labelPoint = getPoint(i, 125);
                return (
                    <text
                        key={axis}
                        x={labelPoint.x}
                        y={labelPoint.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={AXIS_COLORS[axis]}
                        fontSize="12"
                        fontWeight="bold"
                    >
                        {AXIS_ICONS[axis]} {AXIS_LABELS[axis]}
                    </text>
                );
            })}
        </svg>
    );
};

// 능력치 상세 카드
const StatCard = ({ axis, score, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * index }}
        style={{
            background: 'rgba(30, 41, 59, 0.5)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '20px',
            border: `1px solid ${AXIS_COLORS[axis]}33`,
            position: 'relative',
            overflow: 'hidden',
        }}
    >
        <div style={{
            position: 'absolute', top: '-20px', right: '-20px',
            width: '80px', height: '80px',
            background: `radial-gradient(circle, ${AXIS_COLORS[axis]}15 0%, transparent 70%)`,
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>{AXIS_ICONS[axis]}</span>
            <span style={{ color: AXIS_COLORS[axis], fontWeight: 'bold', fontSize: '0.95rem' }}>
                {AXIS_LABELS[axis]}
            </span>
            <span style={{
                marginLeft: 'auto',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '1.3rem',
                background: `linear-gradient(135deg, ${AXIS_COLORS[axis]}, ${AXIS_COLORS[axis]}aa)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>
                {score}
            </span>
        </div>
        <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '3px',
            overflow: 'hidden',
        }}>
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, delay: 0.2 * index, ease: 'easeOut' }}
                style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${AXIS_COLORS[axis]}, ${AXIS_COLORS[axis]}aa)`,
                    borderRadius: '3px',
                    boxShadow: `0 0 10px ${AXIS_COLORS[axis]}44`,
                }}
            />
        </div>
    </motion.div>
);

const VibeDNA = () => {
    const { user, profile } = useAuth();
    const [scores, setScores] = useState(null);
    const [type, setType] = useState(null);
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        analyzeDNA();
    }, [user]);

    const analyzeDNA = async () => {
        setLoading(true);
        try {
            const data = await collectDNAData(user.id, supabase);
            const s = calculateScores(data);
            const t = classifyType(s);
            const ins = generateInsight(t, s);
            setScores(s);
            setType(t);
            setInsights(ins);
        } catch (err) {
            console.error('DNA 분석 오류:', err);
        }
        setLoading(false);
    };

    const handleShare = () => {
        if (!scores || !type) return;
        const total = Object.values(scores).reduce((a, b) => a + b, 0);
        const text = [
            `🧬 나의 Vibe DNA: ${type.emoji} ${type.name}`,
            ``,
            DNA_AXES.map(a => `${AXIS_ICONS[a]} ${AXIS_LABELS[a]}: ${scores[a]}점`).join('\n'),
            ``,
            `총합: ${total}/600`,
            ``,
            `#KoreaCodingVibeLab #VibeDNA`,
        ].join('\n');

        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // 비로그인
    if (!user) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        maxWidth: '400px',
                        margin: '0 auto',
                        background: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        padding: '48px 32px',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <Lock size={48} style={{ color: '#6366f1', marginBottom: '16px' }} />
                    <h2 style={{ color: '#fff', margin: '0 0 12px', fontSize: '1.3rem' }}>로그인이 필요합니다</h2>
                    <p style={{ color: '#94a3b8', margin: '0 0 24px', fontSize: '0.9rem' }}>
                        활동 데이터를 분석하여 나만의 개발자 DNA를 확인해보세요.
                    </p>
                    <Link to="/login" style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '12px 24px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        color: '#fff', textDecoration: 'none', fontWeight: 'bold',
                    }}>
                        로그인하기 <ChevronRight size={16} />
                    </Link>
                </motion.div>
            </div>
        );
    }

    // 로딩
    if (loading) {
        return (
            <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                    style={{ display: 'inline-block', marginBottom: '16px' }}
                >
                    <Dna size={48} style={{ color: '#6366f1' }} />
                </motion.div>
                <p style={{ color: '#94a3b8', fontSize: '1rem' }}>DNA 분석 중...</p>
            </div>
        );
    }

    if (!scores || !type) return null;

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    return (
        <div style={{ padding: '32px 20px', maxWidth: '800px', margin: '0 auto' }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '32px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Dna size={28} style={{ color: '#a855f7' }} />
                    <h1 style={{
                        margin: 0, fontSize: '1.8rem', fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Vibe DNA
                    </h1>
                </div>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                    나의 활동 데이터를 기반으로 분석한 개발자 성향입니다.
                </p>
            </motion.div>

            {/* DNA 카드 (레이더 차트 + 유형) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '24px',
                    padding: '32px',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    marginBottom: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* 배경 그래디언트 */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.08) 0%, transparent 60%)',
                    pointerEvents: 'none',
                }} />

                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '24px', position: 'relative', zIndex: 1,
                }}>
                    <RadarChart scores={scores} />

                    {/* 유형 표시 */}
                    <div style={{ textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            style={{ fontSize: '2.5rem', marginBottom: '8px' }}
                        >
                            {type.emoji}
                        </motion.div>
                        <h2 style={{
                            color: '#fff', margin: '0 0 8px', fontSize: '1.5rem', fontWeight: 'bold',
                        }}>
                            {type.name}
                        </h2>
                        <p style={{ color: '#94a3b8', margin: '0 0 16px', fontSize: '0.9rem', maxWidth: '400px' }}>
                            {type.desc}
                        </p>
                        <div style={{
                            display: 'inline-block',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#818cf8',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                        }}>
                            총합 {totalScore} / 600
                        </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={handleShare}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 20px', borderRadius: '12px',
                                background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                                border: copied ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                                color: copied ? '#34d399' : '#818cf8',
                                cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            <Share2 size={16} />
                            {copied ? '복사됨!' : '공유하기'}
                        </button>
                        <button
                            onClick={analyzeDNA}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 20px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#94a3b8', cursor: 'pointer',
                                fontWeight: 'bold', fontSize: '0.85rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            <RefreshCw size={16} />
                            다시 분석
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* 능력치 상세 카드 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
            }}>
                {DNA_AXES.map((axis, i) => (
                    <StatCard key={axis} axis={axis} score={scores[axis]} index={i} />
                ))}
            </div>

            {/* 인사이트 */}
            {insights.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '24px',
                        padding: '24px',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                        💡 AI 인사이트
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {insights.map((insight, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'flex-start', gap: '10px',
                                padding: '12px 16px',
                                background: 'rgba(99, 102, 241, 0.08)',
                                borderRadius: '12px',
                                border: '1px solid rgba(99, 102, 241, 0.15)',
                            }}>
                                <ChevronRight size={16} style={{ color: '#818cf8', marginTop: '2px', flexShrink: 0 }} />
                                <span style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    {insight}
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default VibeDNA;
