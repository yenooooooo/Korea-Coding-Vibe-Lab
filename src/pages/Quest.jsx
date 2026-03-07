import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Scroll, AlertCircle, Loader2, Calendar, CheckCircle, Clock, Zap, Trophy, ChevronRight, Star, Target, Bot } from 'lucide-react';
import { generateQuest } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const QUEST_TABS = [
    { id: 'daily', label: 'Daily', icon: '🔥', color: '#3b82f6' },
    { id: 'weekly', label: 'Weekly', icon: '📅', color: '#a855f7' },
    { id: 'season', label: 'Season', icon: '🏆', color: '#f59e0b' },
    { id: 'ai', label: 'AI Quest', icon: '🤖', color: '#ec4899' },
];

// 퀘스트 카드 컴포넌트
const QuestCard = ({ uq, onClaim, onSelfCheck, index }) => {
    const quest = uq.quest;
    if (!quest) return null;

    const progressPct = Math.min((uq.progress / (quest.condition_value || 1)) * 100, 100);
    const isAI = quest.id && String(quest.id).startsWith('AI_');

    const typeColors = {
        daily: { gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)', bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa' },
        weekly: { gradient: 'linear-gradient(135deg, #a855f7, #c084fc)', bg: 'rgba(168, 85, 247, 0.1)', text: '#c084fc' },
        season: { gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)', bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24' },
    };
    const tc = typeColors[quest.quest_type] || typeColors.daily;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            style={{
                background: 'rgba(30, 41, 59, 0.5)',
                backdropFilter: 'blur(10px)',
                border: uq.is_completed
                    ? '1px solid rgba(34, 197, 94, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '0',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* 상단 컬러 바 */}
            <div style={{
                height: '3px',
                background: uq.is_completed
                    ? 'linear-gradient(90deg, #22c55e, #86efac)'
                    : tc.gradient,
            }} />

            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* 헤더: 타입 + XP */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase',
                            letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '6px',
                            background: tc.bg, color: tc.text,
                        }}>
                            {quest.quest_type === 'daily' ? 'Daily' : quest.quest_type === 'weekly' ? 'Weekly' : 'Season'}
                        </span>
                        {isAI && (
                            <span style={{
                                fontSize: '0.65rem', fontWeight: 'bold', padding: '3px 6px',
                                borderRadius: '6px', background: 'rgba(236, 72, 153, 0.15)',
                                color: '#f472b6',
                            }}>
                                AI
                            </span>
                        )}
                    </div>
                    {uq.is_completed ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            <CheckCircle size={14} /> 완료
                        </div>
                    ) : (
                        <div style={{
                            color: '#fbbf24', fontWeight: 'bold', fontSize: '0.9rem',
                            textShadow: '0 0 8px rgba(251, 191, 36, 0.3)',
                        }}>
                            +{quest.reward_points} XP
                        </div>
                    )}
                </div>

                {/* 아이콘 + 제목 + 설명 */}
                <div style={{ display: 'flex', gap: '14px', marginBottom: '16px', flex: 1 }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                        background: 'rgba(255,255,255,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.6rem',
                    }}>
                        {quest.icon}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 'bold', color: '#e2e8f0', lineHeight: '1.4' }}>
                            {quest.title}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {quest.description}
                        </p>
                    </div>
                </div>

                {/* 프로그레스 */}
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 'bold' }}>진행도</span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 'bold' }}>
                            {uq.progress}/{quest.condition_value || 1} ({Math.round(progressPct)}%)
                        </span>
                    </div>
                    <div style={{
                        width: '100%', height: '6px', borderRadius: '3px',
                        background: 'rgba(255,255,255,0.05)', overflow: 'hidden',
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            style={{
                                height: '100%', borderRadius: '3px',
                                background: uq.is_completed
                                    ? 'linear-gradient(90deg, #22c55e, #86efac)'
                                    : tc.gradient,
                                boxShadow: uq.is_completed ? `0 0 8px rgba(34,197,94,0.4)` : 'none',
                            }}
                        />
                    </div>
                </div>

                {/* 기한 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#475569', marginBottom: '14px' }}>
                    <Clock size={11} />
                    {uq.period_end} 까지
                </div>

                {/* 액션 버튼 */}
                {!uq.is_completed && isAI && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelfCheck(uq.id)}
                        style={{
                            width: '100%', padding: '10px', borderRadius: '12px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            color: '#818cf8', fontWeight: 'bold', fontSize: '0.82rem',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                    >
                        <CheckCircle size={14} /> 미션 수행 완료
                    </motion.button>
                )}
                {uq.is_completed && !uq.is_reward_claimed && (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onClaim(uq.id)}
                        style={{
                            width: '100%', padding: '11px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '0.85rem',
                            cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        }}
                    >
                        <Zap size={14} /> 보상 받기 (+{quest.reward_points}P)
                    </motion.button>
                )}
                {uq.is_reward_claimed && (
                    <div style={{
                        textAlign: 'center', padding: '10px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)', color: '#475569',
                        fontSize: '0.8rem', fontWeight: 'bold',
                    }}>
                        수령 완료
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// AI 퀘스트 생성 탭
const AIQuestTab = ({ topic, setTopic, loadingAI, errorAI, aiQuest, onGenerate, onAccept, onDismiss }) => {
    const quickTopics = ['리액트 훅', 'Python 자동화', 'API 설계', 'CSS 애니메이션', '알고리즘', 'Git 활용'];

    return (
        <div>
            {/* AI 소개 배너 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1))',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '24px',
                    padding: '32px',
                    border: '1px solid rgba(236, 72, 153, 0.15)',
                    marginBottom: '24px',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* 배경 장식 */}
                <div style={{
                    position: 'absolute', top: '-30px', right: '-30px',
                    width: '150px', height: '150px',
                    background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                        position: 'absolute', top: '20px', right: '30px',
                        fontSize: '3rem', opacity: 0.15, pointerEvents: 'none',
                    }}
                >
                    🤖
                </motion.div>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <Bot size={24} style={{ color: '#f472b6' }} />
                        <h3 style={{
                            margin: 0, fontSize: '1.2rem', fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>
                            AI Quest Generator
                        </h3>
                    </div>
                    <p style={{ color: '#94a3b8', margin: '0 0 24px', fontSize: '0.88rem' }}>
                        원하는 주제를 입력하면 AI가 맞춤형 코딩 미션을 생성합니다. 수락한 퀘스트는 My Quests에서 확인할 수 있어요.
                    </p>

                    {/* 빠른 주제 선택 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {quickTopics.map((t) => (
                            <motion.button
                                key={t}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setTopic(t)}
                                style={{
                                    padding: '6px 14px', borderRadius: '20px',
                                    background: topic === t ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                                    border: topic === t ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                                    color: topic === t ? '#f472b6' : '#94a3b8',
                                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {t}
                            </motion.button>
                        ))}
                    </div>

                    {/* 입력 폼 */}
                    <form onSubmit={onGenerate} style={{ display: 'flex', gap: '10px' }}>
                        <div style={{
                            flex: 1, display: 'flex',
                            background: 'rgba(15, 23, 42, 0.6)',
                            borderRadius: '14px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            overflow: 'hidden',
                        }}>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="주제를 입력하세요 (예: 리액트 훅)"
                                style={{
                                    flex: 1, background: 'transparent', border: 'none',
                                    padding: '14px 16px', color: '#fff', fontSize: '0.95rem', outline: 'none',
                                }}
                            />
                        </div>
                        <motion.button
                            type="submit"
                            disabled={loadingAI || !topic.trim()}
                            whileHover={!loadingAI && topic.trim() ? { scale: 1.03 } : {}}
                            whileTap={!loadingAI && topic.trim() ? { scale: 0.97 } : {}}
                            style={{
                                background: loadingAI || !topic.trim()
                                    ? 'rgba(99,102,241,0.3)'
                                    : 'linear-gradient(135deg, #ec4899, #a855f7)',
                                color: '#fff', border: 'none',
                                padding: '0 28px', borderRadius: '14px',
                                fontSize: '0.9rem', fontWeight: 'bold',
                                cursor: loadingAI || !topic.trim() ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                boxShadow: loadingAI || !topic.trim() ? 'none' : '0 4px 16px rgba(236, 72, 153, 0.3)',
                                flexShrink: 0,
                            }}
                        >
                            {loadingAI ? (
                                <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> 생성중</>
                            ) : (
                                <><Sparkles size={16} /> 생성</>
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>

            {/* 에러 메시지 */}
            <AnimatePresence>
                {errorAI && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            padding: '14px 18px', borderRadius: '14px',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#fca5a5', fontSize: '0.88rem',
                            marginBottom: '24px',
                            display: 'flex', gap: '10px', alignItems: 'center',
                        }}
                    >
                        <AlertCircle size={18} />
                        {errorAI}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI 결과 카드 */}
            <AnimatePresence>
                {aiQuest && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        style={{
                            background: 'rgba(30, 41, 59, 0.6)',
                            backdropFilter: 'blur(16px)',
                            borderRadius: '24px',
                            border: '1px solid rgba(168, 85, 247, 0.25)',
                            overflow: 'hidden',
                            boxShadow: '0 0 40px rgba(168, 85, 247, 0.08)',
                        }}
                    >
                        {/* 그래디언트 헤더 */}
                        <div style={{
                            background: 'linear-gradient(135deg, rgba(236,72,153,0.15), rgba(168,85,247,0.15))',
                            padding: '20px 24px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{
                                    padding: '4px 10px', borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                    color: '#fff', fontSize: '0.75rem', fontWeight: 'bold',
                                }}>
                                    {aiQuest.difficulty}
                                </span>
                                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>AI 생성 퀘스트</span>
                            </div>
                            <div style={{
                                color: '#fbbf24', fontWeight: 'bold', fontSize: '1.1rem',
                                textShadow: '0 0 10px rgba(251,191,36,0.3)',
                                display: 'flex', alignItems: 'center', gap: '6px',
                            }}>
                                <Zap size={16} /> +{aiQuest.xp} XP
                            </div>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <h3 style={{ margin: '0 0 8px', fontSize: '1.25rem', fontWeight: 'bold', color: '#e2e8f0' }}>
                                {aiQuest.title}
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.6' }}>
                                {aiQuest.description}
                            </p>

                            {/* 미션 박스 */}
                            <div style={{
                                background: 'rgba(99, 102, 241, 0.06)',
                                border: '1px solid rgba(99, 102, 241, 0.15)',
                                padding: '18px', borderRadius: '16px', marginBottom: '16px',
                            }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    marginBottom: '8px',
                                }}>
                                    <Target size={16} style={{ color: '#818cf8' }} />
                                    <span style={{ color: '#818cf8', fontWeight: 'bold', fontSize: '0.85rem' }}>Mission</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '0.92rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                                    {aiQuest.mission}
                                </p>
                            </div>

                            {/* 팁 */}
                            <div style={{
                                display: 'flex', alignItems: 'flex-start', gap: '8px',
                                padding: '12px 16px', borderRadius: '12px',
                                background: 'rgba(250,204,21,0.05)',
                                border: '1px solid rgba(250,204,21,0.1)',
                                marginBottom: '24px',
                            }}>
                                <span style={{ fontSize: '0.85rem', flexShrink: 0 }}>💡</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.5' }}>
                                    {aiQuest.tip}
                                </span>
                            </div>

                            {/* 버튼 */}
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onAccept}
                                    style={{
                                        flex: 1, padding: '14px', borderRadius: '14px', border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        color: '#fff', fontWeight: 'bold', fontSize: '0.95rem',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                    }}
                                >
                                    <CheckCircle size={18} /> 퀘스트 수락하기
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onDismiss}
                                    style={{
                                        padding: '14px 24px', borderRadius: '14px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: 'rgba(255,255,255,0.03)',
                                        color: '#94a3b8', fontWeight: 'bold', fontSize: '0.95rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    닫기
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI 퀘스트가 없을 때 빈 상태 */}
            {!aiQuest && !loadingAI && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        textAlign: 'center', padding: '48px 20px',
                        background: 'rgba(30, 41, 59, 0.3)',
                        borderRadius: '24px',
                        border: '1px dashed rgba(236, 72, 153, 0.15)',
                    }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.4 }}>🤖</div>
                    <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>
                        위에서 주제를 입력하고 AI 퀘스트를 생성해보세요!
                    </p>
                </motion.div>
            )}
        </div>
    );
};

const Quest = () => {
    const { user, refetchProfile } = useAuth();
    const [topic, setTopic] = useState('');
    const [aiQuest, setAiQuest] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [errorAI, setErrorAI] = useState(null);

    const [myQuests, setMyQuests] = useState([]);
    const [loadingQuests, setLoadingQuests] = useState(true);
    const [activeTab, setActiveTab] = useState('daily');

    // 1. 기존 퀘스트 불러오기
    useEffect(() => {
        if (!user) return;

        const fetchQuests = async () => {
            try {
                await Promise.all([
                    supabase.rpc('assign_daily_quests', { p_user_id: user.id }),
                    supabase.rpc('assign_weekly_quests', { p_user_id: user.id }),
                    supabase.rpc('assign_season_quests', { p_user_id: user.id })
                ]);

                const { data, error } = await supabase
                    .from('user_quests')
                    .select(`
                        *,
                        quest:quests (
                            id,
                            title,
                            description,
                            icon,
                            quest_type,
                            reward_points,
                            condition_value
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('is_completed', { ascending: true })
                    .order('period_end', { ascending: true });

                if (error) throw error;
                setMyQuests(data || []);
            } catch (err) {
                console.error("Error fetching quests:", err);
            } finally {
                setLoadingQuests(false);
            }
        };

        fetchQuests();
    }, [user]);

    // 2. 퀘스트 보상 받기
    const handleClaim = async (userQuestId) => {
        try {
            const { data, error } = await supabase.rpc('claim_quest_reward', { p_user_quest_id: userQuestId });
            if (error) throw error;

            if (data.success) {
                alert(`보상 ${data.reward}P 획득! ${data.bonus > 0 ? `(보너스 +${data.bonus}P)` : ''}`);
                setMyQuests(prev => prev.map(q =>
                    q.id === userQuestId ? { ...q, is_reward_claimed: true } : q
                ));
                refetchProfile();
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error("Error claiming reward:", err);
            alert("보상 수령 실패");
        }
    };

    // 3. AI 퀘스트 생성
    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        setLoadingAI(true);
        setErrorAI(null);
        setAiQuest(null);

        try {
            const result = await generateQuest(topic);
            setAiQuest(result);
        } catch (err) {
            setErrorAI(err.message);
        } finally {
            setLoadingAI(false);
        }
    };

    // 4. AI 퀘스트 수락
    const handleAccept = async () => {
        if (!aiQuest) return;

        try {
            const { data, error } = await supabase.rpc('accept_ai_quest', {
                p_title: aiQuest.title,
                p_description: aiQuest.description,
                p_mission: aiQuest.mission,
                p_difficulty: aiQuest.difficulty,
                p_xp: aiQuest.xp,
                p_icon: '🤖'
            });

            if (error) throw error;

            alert("퀘스트를 수락했습니다! [My Quests]에서 확인하세요.");
            setAiQuest(null);
            setTopic('');
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert("퀘스트 수락 실패: " + err.message);
        }
    };

    // 5. 셀프 체크
    const handleSelfCheck = async (userQuestId) => {
        if (!window.confirm("미션을 정말 완료하셨나요?")) return;

        try {
            const { data, error } = await supabase.rpc('complete_ai_quest', {
                p_user_quest_id: userQuestId
            });

            if (error) throw error;

            if (data.success) {
                alert("퀘스트 완료! 이제 보상을 받으세요.");
                setMyQuests(prev => prev.map(q =>
                    q.id === userQuestId ? { ...q, is_completed: true, progress: 1 } : q
                ));
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
            alert("완료 처리 실패");
        }
    };

    // 탭별 필터링
    const filteredQuests = activeTab === 'ai'
        ? []
        : myQuests.filter(uq => uq.quest && uq.quest.quest_type === activeTab);

    // 통계
    const totalQuests = myQuests.length;
    const completedQuests = myQuests.filter(q => q.is_completed).length;
    const claimableQuests = myQuests.filter(q => q.is_completed && !q.is_reward_claimed).length;

    return (
        <div style={{ color: '#fff', maxWidth: '960px', margin: '0 auto', padding: '32px 20px 80px' }}>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>

            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '28px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <Scroll size={28} style={{ color: '#ec4899' }} />
                    <h1 style={{
                        margin: 0, fontSize: '1.8rem', fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    }}>
                        Quest Center
                    </h1>
                </div>
                <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>
                    퀘스트를 수행하고, AI에게 새로운 미션을 요청하세요.
                </p>
            </motion.div>

            {/* 통계 카드 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
                    marginBottom: '28px',
                }}
            >
                {[
                    { label: '진행중', value: totalQuests - completedQuests, icon: <Target size={18} />, color: '#6366f1' },
                    { label: '완료', value: completedQuests, icon: <CheckCircle size={18} />, color: '#22c55e' },
                    { label: '수령 대기', value: claimableQuests, icon: <Trophy size={18} />, color: '#f59e0b', pulse: claimableQuests > 0 },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        style={{
                            background: 'rgba(30, 41, 59, 0.5)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '16px',
                            padding: '18px',
                            border: `1px solid ${stat.color}22`,
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {stat.pulse && (
                            <div style={{
                                position: 'absolute', inset: 0,
                                border: `2px solid ${stat.color}44`,
                                borderRadius: '16px',
                                animation: 'statPulse 2s infinite',
                            }} />
                        )}
                        <div style={{ color: stat.color, marginBottom: '8px' }}>{stat.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>
            <style>{`
                @keyframes statPulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0; transform: scale(1.05); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>

            {/* 탭 네비게이션 */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                    display: 'flex', gap: '8px', marginBottom: '24px',
                    padding: '6px',
                    background: 'rgba(30, 41, 59, 0.4)',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.06)',
                }}
            >
                {QUEST_TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const tabQuestCount = tab.id === 'ai'
                        ? null
                        : myQuests.filter(q => q.quest && q.quest.quest_type === tab.id).length;

                    return (
                        <motion.button
                            key={tab.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1, padding: '12px 8px', borderRadius: '12px', border: 'none',
                                background: isActive
                                    ? `linear-gradient(135deg, ${tab.color}25, ${tab.color}15)`
                                    : 'transparent',
                                color: isActive ? tab.color : '#64748b',
                                cursor: 'pointer', fontWeight: isActive ? 'bold' : '500',
                                fontSize: '0.85rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                transition: 'all 0.2s',
                                position: 'relative',
                            }}
                        >
                            <span style={{ fontSize: '1rem' }}>{tab.icon}</span>
                            <span>{tab.label}</span>
                            {tabQuestCount !== null && tabQuestCount > 0 && (
                                <span style={{
                                    fontSize: '0.65rem', fontWeight: 'bold',
                                    padding: '1px 6px', borderRadius: '8px',
                                    background: isActive ? `${tab.color}30` : 'rgba(255,255,255,0.06)',
                                    color: isActive ? tab.color : '#475569',
                                }}>
                                    {tabQuestCount}
                                </span>
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    style={{
                                        position: 'absolute', bottom: '-1px', left: '20%', right: '20%',
                                        height: '2px', background: tab.color, borderRadius: '1px',
                                    }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </motion.div>

            {/* 탭 컨텐츠 */}
            <AnimatePresence mode="wait">
                {activeTab === 'ai' ? (
                    <motion.div
                        key="ai"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <AIQuestTab
                            topic={topic}
                            setTopic={setTopic}
                            loadingAI={loadingAI}
                            errorAI={errorAI}
                            aiQuest={aiQuest}
                            onGenerate={handleGenerate}
                            onAccept={handleAccept}
                            onDismiss={() => setAiQuest(null)}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {loadingQuests ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
                                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                                <p>퀘스트 로딩 중...</p>
                            </div>
                        ) : filteredQuests.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                style={{
                                    textAlign: 'center', padding: '60px 20px',
                                    background: 'rgba(30, 41, 59, 0.3)',
                                    borderRadius: '24px',
                                    border: '1px dashed rgba(255,255,255,0.08)',
                                }}
                            >
                                <div style={{ fontSize: '3rem', marginBottom: '12px', opacity: 0.4 }}>
                                    {QUEST_TABS.find(t => t.id === activeTab)?.icon}
                                </div>
                                <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 8px' }}>
                                    {activeTab === 'daily' ? '오늘의' : activeTab === 'weekly' ? '이번 주' : '이번 시즌'} 퀘스트가 없습니다.
                                </p>
                                <p style={{ color: '#374151', fontSize: '0.82rem', margin: 0 }}>
                                    활동을 계속하면 새 퀘스트가 배정됩니다.
                                </p>
                            </motion.div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
                                gap: '16px',
                            }}>
                                {filteredQuests.map((uq, i) => (
                                    <QuestCard
                                        key={uq.id}
                                        uq={uq}
                                        index={i}
                                        onClaim={handleClaim}
                                        onSelfCheck={handleSelfCheck}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Quest;
