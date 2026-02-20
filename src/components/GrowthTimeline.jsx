import React from 'react';
import { motion } from 'framer-motion';

const GrowthTimeline = ({ attendanceHistory, badges, postCount, profile }) => {
    if (!profile) return null;

    const events = [];

    // 가입일
    if (profile.created_at) {
        events.push({
            date: profile.created_at,
            icon: '🌱',
            title: '코딩 여정 시작!',
            desc: 'Korea Coding Vibe Lab에 가입했습니다.',
            color: '#10b981'
        });
    }

    // 첫 출석
    if (attendanceHistory && attendanceHistory.length > 0) {
        const sorted = [...attendanceHistory].sort((a, b) =>
            new Date(a.check_in_date) - new Date(b.check_in_date)
        );
        events.push({
            date: sorted[0].check_in_date,
            icon: '✅',
            title: '첫 출석 체크!',
            desc: '첫 번째 출석을 기록했습니다. +10 포인트',
            color: '#6366f1'
        });
    }

    // 뱃지 획득 이력
    if (badges && badges.length > 0) {
        badges.forEach(b => {
            if (b.awarded_at && b.badges) {
                events.push({
                    date: b.awarded_at,
                    icon: b.badges.icon || '🏅',
                    title: `뱃지 획득: ${b.badges.name}`,
                    desc: b.badges.description || '새 뱃지를 획득했습니다!',
                    color: '#f59e0b'
                });
            }
        });
    }

    // 게시글 마일스톤
    if (postCount >= 1) {
        events.push({
            date: null,
            icon: '📝',
            title: '첫 게시글 작성!',
            desc: `현재까지 ${postCount}개의 게시글을 작성했습니다.`,
            color: '#ec4899'
        });
    }

    // 연속 출석 마일스톤
    if (profile.current_streak >= 7) {
        events.push({
            date: null,
            icon: '🔥',
            title: '7일 연속 출석 달성!',
            desc: `현재 ${profile.current_streak}일 연속 출석 중입니다.`,
            color: '#f97316'
        });
    }

    // 날짜순 정렬 (null은 마지막)
    events.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(a.date) - new Date(b.date);
    });

    if (events.length === 0) return null;

    return (
        <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
            borderRadius: '24px',
            padding: '30px',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '30px',
            backdropFilter: 'blur(10px)'
        }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>📈</span>
                성장 타임라인
            </h3>
            <div style={{ position: 'relative' }}>
                {/* 세로 선 */}
                <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '0',
                    bottom: '0',
                    width: '2px',
                    background: 'linear-gradient(to bottom, rgba(99,102,241,0.5), rgba(99,102,241,0.05))'
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {events.map((event, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.08 }}
                            style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingLeft: '8px' }}
                        >
                            {/* 아이콘 원 */}
                            <div style={{
                                minWidth: '24px', height: '24px', borderRadius: '50%',
                                background: `${event.color}30`,
                                border: `2px solid ${event.color}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.75rem',
                                zIndex: 1,
                                marginTop: '2px'
                            }}>
                                {event.icon}
                            </div>
                            {/* 카드 */}
                            <div style={{
                                flex: 1,
                                padding: '12px 16px',
                                background: 'rgba(15, 23, 42, 0.4)',
                                borderRadius: '12px',
                                border: `1px solid ${event.color}20`
                            }}>
                                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#e2e8f0', marginBottom: '4px' }}>
                                    {event.title}
                                </div>
                                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: event.date ? '4px' : 0 }}>
                                    {event.desc}
                                </div>
                                {event.date && (
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                        {new Date(event.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GrowthTimeline;
