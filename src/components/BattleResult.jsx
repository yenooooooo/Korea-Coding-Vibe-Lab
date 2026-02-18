import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ThumbsUp, Clock, Zap, Star, ArrowLeft, Crown, Users } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const BattleResult = ({ room, onRoomUpdate }) => {
    const { user, refetchProfile } = useAuth();
    const navigate = useNavigate();

    const isHost = user?.id === room.host_id;
    const isGuest = user?.id === room.guest_id;
    const isParticipant = isHost || isGuest;

    const [submissions, setSubmissions] = useState([]);
    const [votes, setVotes] = useState([]);
    const [myVote, setMyVote] = useState(null);
    const [voting, setVoting] = useState(false);
    const [finalizing, setFinalizing] = useState(false);
    const [reviewTimer, setReviewTimer] = useState(30);
    const timerRef = useRef(null);

    // 제출 및 투표 데이터 로드
    const fetchData = useCallback(async () => {
        const [subsRes, votesRes] = await Promise.all([
            supabase
                .from('battle_submissions')
                .select('*, user:profiles!battle_submissions_user_profiles_fkey(username)')
                .eq('room_id', room.id),
            supabase
                .from('battle_votes')
                .select('*')
                .eq('room_id', room.id),
        ]);

        if (subsRes.data) setSubmissions(subsRes.data);
        if (votesRes.data) {
            setVotes(votesRes.data);
            const mv = votesRes.data.find(v => v.voter_id === user?.id);
            if (mv) setMyVote(mv.voted_for_user_id);
        }
    }, [room.id, user?.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Realtime: 투표 변경 감지
    useEffect(() => {
        const channel = supabase
            .channel(`battle_result_${room.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'battle_votes', filter: `room_id=eq.${room.id}` },
                () => { fetchData(); }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'battle_rooms', filter: `id=eq.${room.id}` },
                () => { onRoomUpdate(); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [room.id, fetchData, onRoomUpdate]);

    // reviewing 타이머 (30초 후 자동 finalize)
    useEffect(() => {
        if (room.status !== 'reviewing') return;

        timerRef.current = setInterval(() => {
            setReviewTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    // 호스트가 finalize
                    if (isHost) {
                        handleFinalize();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => { clearInterval(timerRef.current); };
    }, [room.status, isHost]);

    // 투표
    const handleVote = async (votedForId) => {
        if (voting || myVote) return;
        setVoting(true);
        try {
            const { data, error } = await supabase.rpc('cast_battle_vote', {
                p_room_id: room.id,
                p_voted_for: votedForId,
            });
            if (error) throw error;
            if (!data.success) {
                alert(data.error);
                return;
            }
            setMyVote(votedForId);
            refetchProfile();
        } catch (err) {
            console.error('Vote error:', err);
            alert('투표에 실패했습니다.');
        } finally {
            setVoting(false);
        }
    };

    // Finalize
    const handleFinalize = async () => {
        if (finalizing) return;
        setFinalizing(true);
        try {
            const { data, error } = await supabase.rpc('finalize_battle', { p_room_id: room.id });
            if (error) throw error;
            refetchProfile();
        } catch (err) {
            console.error('Finalize error:', err);
        } finally {
            setFinalizing(false);
        }
    };

    const hostSub = submissions.find(s => s.user_id === room.host_id);
    const guestSub = submissions.find(s => s.user_id === room.guest_id);
    const hostVotes = votes.filter(v => v.voted_for_user_id === room.host_id).length;
    const guestVotes = votes.filter(v => v.voted_for_user_id === room.guest_id).length;

    const problem = room.battle_problems;

    // 승자 판단
    const isWinner = (userId) => room.winner_id === userId;
    const isDraw = room.status === 'finished' && !room.winner_id;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px', color: '#fff' }}>
            {/* 상단 바 */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', marginBottom: '16px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
            }}>
                <button
                    onClick={() => navigate('/battle')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'none', border: 'none', color: '#94a3b8',
                        cursor: 'pointer', fontSize: '0.85rem',
                    }}
                >
                    <ArrowLeft size={16} /> 로비
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {room.status === 'reviewing' && (
                        <span style={{
                            padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem',
                            background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 'bold',
                        }}>
                            투표 중 ({reviewTimer}s)
                        </span>
                    )}
                    {room.status === 'finished' && (
                        <span style={{
                            padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem',
                            background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontWeight: 'bold',
                        }}>
                            종료됨
                        </span>
                    )}
                </div>
            </div>

            {/* 승자 배너 (finished) */}
            {room.status === 'finished' && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        textAlign: 'center', padding: '28px 20px', marginBottom: '24px',
                        borderRadius: '20px', position: 'relative', overflow: 'hidden',
                        background: isDraw
                            ? 'linear-gradient(135deg, rgba(148,163,184,0.1), rgba(100,116,139,0.05))'
                            : 'linear-gradient(135deg, rgba(250,204,21,0.1), rgba(245,158,11,0.05))',
                        border: isDraw
                            ? '1px solid rgba(148,163,184,0.15)'
                            : '1px solid rgba(250,204,21,0.2)',
                    }}
                >
                    {!isDraw && (
                        <div style={{
                            position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
                            width: '300px', height: '300px',
                            background: 'radial-gradient(circle, rgba(250,204,21,0.12), transparent 60%)',
                            pointerEvents: 'none',
                        }} />
                    )}

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {isDraw ? (
                            <>
                                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                                    <Users size={48} color="#94a3b8" style={{ display: 'inline' }} />
                                </div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#94a3b8', margin: '0 0 4px' }}>
                                    DRAW
                                </h2>
                                <p style={{ color: '#64748b', margin: 0 }}>무승부입니다!</p>
                            </>
                        ) : (
                            <>
                                <motion.div
                                    animate={{ rotate: [0, 5, -5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ display: 'inline-block', marginBottom: '8px' }}
                                >
                                    <Crown size={48} color="#facc15" />
                                </motion.div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#facc15', margin: '0 0 4px' }}>
                                    {isWinner(room.host_id) ? (room.host?.username || 'Host') : (room.guest?.username || 'Guest')} 승리!
                                </h2>
                                <p style={{ color: '#94a3b8', margin: 0 }}>
                                    {hostVotes} vs {guestVotes} 투표
                                </p>
                            </>
                        )}
                    </div>

                    {/* 포인트 내역 */}
                    {room.status === 'finished' && isParticipant && (
                        <div style={{
                            marginTop: '20px', display: 'inline-flex', flexDirection: 'column', gap: '6px',
                            padding: '16px 24px', borderRadius: '12px',
                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)',
                            textAlign: 'left', position: 'relative', zIndex: 1,
                        }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f1f5f9', marginBottom: '4px' }}>
                                포인트 내역
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
                                <span>참가 보상</span>
                                <span style={{ color: '#22c55e' }}>+10P</span>
                            </div>
                            {isWinner(user?.id) && (
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
                                    <span>승리 보너스</span>
                                    <span style={{ color: '#facc15' }}>+30P</span>
                                </div>
                            )}
                            {hostSub && guestSub && hostSub.submitted_at && guestSub.submitted_at && (() => {
                                const hostFirst = new Date(hostSub.submitted_at) < new Date(guestSub.submitted_at);
                                const iAmFirst = (isHost && hostFirst) || (isGuest && !hostFirst);
                                if (iAmFirst) {
                                    return (
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
                                            <span>스피드 보너스</span>
                                            <span style={{ color: '#f97316' }}>+10P</span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    )}
                </motion.div>
            )}

            {/* 문제 제목 */}
            <div style={{
                padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                background: 'rgba(30, 41, 59, 0.3)',
                border: '1px solid rgba(255,255,255,0.05)',
                fontSize: '0.9rem', color: '#94a3b8',
            }}>
                <strong style={{ color: '#f1f5f9' }}>{problem?.title}</strong>
                <span style={{
                    marginLeft: '8px', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem',
                    background: `${problem?.difficulty === 'easy' ? '#22c55e' : problem?.difficulty === 'medium' ? '#f59e0b' : '#ef4444'}20`,
                    color: problem?.difficulty === 'easy' ? '#22c55e' : problem?.difficulty === 'medium' ? '#f59e0b' : '#ef4444',
                }}>
                    {problem?.difficulty?.toUpperCase()}
                </span>
            </div>

            {/* 코드 비교 + 투표 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '16px',
            }}>
                {/* 호스트 코드 */}
                <div style={{
                    borderRadius: '14px', overflow: 'hidden',
                    border: `1px solid ${isWinner(room.host_id) ? 'rgba(250,204,21,0.3)' : 'rgba(99,102,241,0.15)'}`,
                }}>
                    <div style={{
                        padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: isWinner(room.host_id) ? 'rgba(250,204,21,0.08)' : 'rgba(99,102,241,0.08)',
                        borderBottom: `1px solid ${isWinner(room.host_id) ? 'rgba(250,204,21,0.15)' : 'rgba(99,102,241,0.1)'}`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isWinner(room.host_id) && <Crown size={16} color="#facc15" />}
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f1f5f9' }}>
                                {room.host?.username || 'Host'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                <ThumbsUp size={13} style={{ verticalAlign: 'middle' }} /> {hostVotes}
                            </span>
                            {room.status === 'reviewing' && user?.id !== room.host_id && !myVote && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleVote(room.host_id)}
                                    disabled={voting}
                                    style={{
                                        padding: '4px 12px', borderRadius: '8px', border: 'none',
                                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                        color: '#fff', fontWeight: 'bold', fontSize: '0.75rem',
                                        cursor: 'pointer', opacity: voting ? 0.6 : 1,
                                    }}
                                >
                                    투표
                                </motion.button>
                            )}
                            {myVote === room.host_id && (
                                <span style={{
                                    padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem',
                                    background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 'bold',
                                }}>
                                    MY VOTE
                                </span>
                            )}
                        </div>
                    </div>
                    <Editor
                        height="350px"
                        language={problem?.language_hint || 'javascript'}
                        theme="vs-dark"
                        value={hostSub?.code || '// 제출된 코드가 없습니다'}
                        options={{
                            readOnly: true,
                            domReadOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            padding: { top: 12 },
                        }}
                    />
                </div>

                {/* 게스트 코드 */}
                <div style={{
                    borderRadius: '14px', overflow: 'hidden',
                    border: `1px solid ${isWinner(room.guest_id) ? 'rgba(250,204,21,0.3)' : 'rgba(239,68,68,0.15)'}`,
                }}>
                    <div style={{
                        padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: isWinner(room.guest_id) ? 'rgba(250,204,21,0.08)' : 'rgba(239,68,68,0.08)',
                        borderBottom: `1px solid ${isWinner(room.guest_id) ? 'rgba(250,204,21,0.15)' : 'rgba(239,68,68,0.1)'}`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isWinner(room.guest_id) && <Crown size={16} color="#facc15" />}
                            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f1f5f9' }}>
                                {room.guest?.username || 'Guest'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                <ThumbsUp size={13} style={{ verticalAlign: 'middle' }} /> {guestVotes}
                            </span>
                            {room.status === 'reviewing' && user?.id !== room.guest_id && !myVote && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleVote(room.guest_id)}
                                    disabled={voting}
                                    style={{
                                        padding: '4px 12px', borderRadius: '8px', border: 'none',
                                        background: 'linear-gradient(135deg, #f97316, #ef4444)',
                                        color: '#fff', fontWeight: 'bold', fontSize: '0.75rem',
                                        cursor: 'pointer', opacity: voting ? 0.6 : 1,
                                    }}
                                >
                                    투표
                                </motion.button>
                            )}
                            {myVote === room.guest_id && (
                                <span style={{
                                    padding: '3px 8px', borderRadius: '6px', fontSize: '0.7rem',
                                    background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 'bold',
                                }}>
                                    MY VOTE
                                </span>
                            )}
                        </div>
                    </div>
                    <Editor
                        height="350px"
                        language={problem?.language_hint || 'javascript'}
                        theme="vs-dark"
                        value={guestSub?.code || '// 제출된 코드가 없습니다'}
                        options={{
                            readOnly: true,
                            domReadOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                            padding: { top: 12 },
                        }}
                    />
                </div>
            </div>

            {/* reviewing 상태: 수동 finalize 버튼 (호스트) */}
            {room.status === 'reviewing' && isHost && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFinalize}
                        disabled={finalizing}
                        style={{
                            padding: '12px 32px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, #f97316, #ef4444)',
                            color: '#fff', fontWeight: 'bold', fontSize: '1rem',
                            cursor: 'pointer', opacity: finalizing ? 0.6 : 1,
                        }}
                    >
                        {finalizing ? '집계 중...' : '투표 종료 & 결과 확정'}
                    </motion.button>
                </div>
            )}

            {/* 로비 돌아가기 */}
            {room.status === 'finished' && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/battle')}
                        style={{
                            padding: '12px 32px', borderRadius: '12px', border: 'none',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: '#fff', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                        }}
                    >
                        로비로 돌아가기
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default BattleResult;
