import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Eye, Check, X, ArrowLeft, Send, Loader, Shield } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { VibeName, fetchBatchEquippedDetails } from '../utils/vibeItems.jsx';

const BattleRoom = ({ room, onRoomUpdate }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const isHost = user?.id === room.host_id;
    const isGuest = user?.id === room.guest_id;
    const isParticipant = isHost || isGuest;
    const isSpectator = !isParticipant;

    const [myCode, setMyCode] = useState(room.battle_problems?.starter_code || '');
    const [opponentCode, setOpponentCode] = useState(room.battle_problems?.starter_code || '');
    const [timeLeft, setTimeLeft] = useState(room.time_limit || 300);
    const [countdown, setCountdown] = useState(null); // 3, 2, 1
    const [spectatorCount, setSpectatorCount] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [mySubmitted, setMySubmitted] = useState(false);
    const [readying, setReadying] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [problemExpanded, setProblemExpanded] = useState(true);
    const [directorMessage, setDirectorMessage] = useState(null);
    const [equippedDetails, setEquippedDetails] = useState({});

    const channelRef = useRef(null);
    const timerRef = useRef(null);
    const codeDebounceRef = useRef(null);

    const myRole = isHost ? 'host' : isGuest ? 'guest' : 'spectator';
    const myReady = isHost ? room.host_ready : room.guest_ready;

    // Broadcast 채널 설정
    useEffect(() => {
        const channel = supabase.channel(`battle_room_${room.id}`, {
            config: { presence: { key: user?.id || 'anon_' + Math.random() } },
        });

        channel
            .on('broadcast', { event: 'code_sync' }, (payload) => {
                const { role, code } = payload.payload;
                // 상대방 코드 수신
                if (role !== myRole) {
                    setOpponentCode(code);
                }
            })
            .on('broadcast', { event: 'timer_sync' }, (payload) => {
                if (!isHost) {
                    setTimeLeft(payload.payload.timeLeft);
                }
            })
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                setSpectatorCount(Object.keys(state).length);
            })
            .on('broadcast', { event: 'director_poke' }, (payload) => {
                setDirectorMessage(payload.payload.message);
                setTimeout(() => setDirectorMessage(null), 5000);
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ role: myRole });
                }
            });

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [room.id, user?.id, myRole, isHost]);

    // Realtime: room status 변경 감지
    useEffect(() => {
        const channel = supabase
            .channel(`battle_room_status_${room.id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'battle_rooms', filter: `id=eq.${room.id}` },
                () => { onRoomUpdate(); }
            )
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'battle_submissions', filter: `room_id=eq.${room.id}` },
                () => { onRoomUpdate(); }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [room.id, onRoomUpdate]);

    // Fetch equipped details for host/guest
    useEffect(() => {
        const fetchDetails = async () => {
            const profiles = [room.host, room.guest].filter(Boolean);
            if (profiles.length > 0) {
                const details = await fetchBatchEquippedDetails(supabase, profiles);
                setEquippedDetails(details);
            }
        };
        fetchDetails();
    }, [room.host, room.guest]);

    // 카운트다운 처리
    useEffect(() => {
        if (room.status === 'countdown') {
            setCountdown(3);
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        // 호스트가 start_battle 호출
                        if (isHost) {
                            supabase.rpc('start_battle', { p_room_id: room.id });
                        }
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [room.status, isHost, room.id]);

    // 게임 타이머 (playing 상태)
    useEffect(() => {
        if (room.status !== 'playing') return;

        // 서버 started_at 기준으로 남은 시간 계산
        if (room.started_at) {
            const startTime = new Date(room.started_at).getTime();
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, room.time_limit - elapsed);
            setTimeLeft(remaining);
        }

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                const next = prev - 1;
                if (next <= 0) {
                    clearInterval(timerRef.current);
                    // 호스트가 타임아웃 처리
                    if (isHost) {
                        supabase.rpc('timeout_battle', { p_room_id: room.id });
                    }
                    return 0;
                }

                // 호스트: 10초마다 타이머 동기화
                if (isHost && next % 10 === 0 && channelRef.current) {
                    channelRef.current.send({
                        type: 'broadcast',
                        event: 'timer_sync',
                        payload: { timeLeft: next },
                    });
                }

                return next;
            });
        }, 1000);

        return () => { clearInterval(timerRef.current); };
    }, [room.status, room.started_at, room.time_limit, isHost, room.id]);

    // 코드 변경 시 Broadcast (3초 디바운스)
    const handleCodeChange = (value) => {
        setMyCode(value || '');

        if (codeDebounceRef.current) clearTimeout(codeDebounceRef.current);
        codeDebounceRef.current = setTimeout(() => {
            if (channelRef.current && room.status === 'playing') {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'code_sync',
                    payload: { role: myRole, code: value || '' },
                });
            }
        }, 3000);
    };

    // 레디 토글
    const handleReady = async () => {
        if (readying) return;
        setReadying(true);
        try {
            await supabase.rpc('toggle_battle_ready', { p_room_id: room.id });
        } catch (err) {
            console.error('Ready error:', err);
        } finally {
            setReadying(false);
        }
    };

    // 코드 제출
    const handleSubmit = async () => {
        if (submitting || mySubmitted) return;
        setSubmitting(true);
        try {
            const { data, error } = await supabase.rpc('submit_battle_code', {
                p_room_id: room.id,
                p_code: myCode,
            });
            if (error) throw error;
            if (data.success) {
                setMySubmitted(true);
            }
        } catch (err) {
            console.error('Submit error:', err);
            alert('제출에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    // 방 취소
    const handleCancel = async () => {
        if (cancelling) return;
        setCancelling(true);
        try {
            await supabase.rpc('cancel_battle_room', { p_room_id: room.id });
            navigate('/battle');
        } catch (err) {
            console.error('Cancel error:', err);
        } finally {
            setCancelling(false);
        }
    };

    // 시간 포맷
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const diffColors = {
        easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444',
    };

    const problem = room.battle_problems;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px', color: '#fff' }}>
            {/* Admin Director Message Overlay */}
            <AnimatePresence>
                {directorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                            position: 'fixed', top: '100px', left: '50%',
                            transform: 'translateX(-50%)', zIndex: 9999,
                            background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                            padding: '16px 32px', borderRadius: '20px',
                            color: '#fff', fontWeight: 'bold',
                            boxShadow: '0 10px 40px rgba(239, 68, 68, 0.4)',
                            border: '2px solid rgba(255,255,255,0.2)',
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}
                    >
                        <Shield size={24} />
                        <div>{directorMessage}</div>
                    </motion.div>
                )}
            </AnimatePresence>

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

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* 타이머 */}
                    {room.status === 'playing' && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 14px', borderRadius: '10px',
                            background: timeLeft <= 30 ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.1)',
                            border: `1px solid ${timeLeft <= 30 ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)'}`,
                        }}>
                            <Clock size={16} color={timeLeft <= 30 ? '#ef4444' : '#818cf8'} />
                            <span style={{
                                fontSize: '1.1rem', fontWeight: 'bold', fontFamily: 'monospace',
                                color: timeLeft <= 30 ? '#ef4444' : '#f1f5f9',
                            }}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    )}

                    {/* 관전자 수 */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        fontSize: '0.8rem', color: '#64748b',
                    }}>
                        <Eye size={14} /> {spectatorCount}명
                    </div>
                </div>
            </div>

            {/* 문제 영역 */}
            <div style={{
                padding: '16px 20px', borderRadius: '14px', marginBottom: '16px',
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(255,255,255,0.06)',
            }}>
                <div
                    onClick={() => setProblemExpanded(!problemExpanded)}
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f1f5f9' }}>
                            {problem?.title}
                        </span>
                        <span style={{
                            padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 'bold',
                            background: `${diffColors[problem?.difficulty] || '#6366f1'}20`,
                            color: diffColors[problem?.difficulty] || '#6366f1',
                        }}>
                            {problem?.difficulty?.toUpperCase()}
                        </span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                        {problemExpanded ? '접기' : '펼치기'}
                    </span>
                </div>
                <AnimatePresence>
                    {problemExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <p style={{
                                marginTop: '12px', color: '#cbd5e1', fontSize: '0.9rem',
                                lineHeight: '1.7', whiteSpace: 'pre-wrap',
                            }}>
                                {problem?.description}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* WAITING / READY 상태 */}
            {(room.status === 'waiting' || room.status === 'ready') && (
                <div style={{
                    textAlign: 'center', padding: '60px 20px',
                    background: 'rgba(30, 41, 59, 0.3)', borderRadius: '20px',
                    border: '1px solid rgba(255,255,255,0.05)',
                }}>
                    {room.status === 'waiting' && (
                        <>
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ fontSize: '3rem', marginBottom: '16px' }}
                            >
                                <Loader size={48} color="#94a3b8" style={{ display: 'inline' }} />
                            </motion.div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#f1f5f9' }}>
                                상대를 기다리는 중...
                            </h2>
                            <p style={{ color: '#64748b', marginBottom: '20px' }}>
                                방 링크를 공유하여 상대를 초대하세요
                            </p>
                            <div style={{
                                display: 'inline-block', padding: '10px 20px', borderRadius: '10px',
                                background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)',
                                fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'monospace',
                                wordBreak: 'break-all',
                            }}>
                                {window.location.href}
                            </div>
                            {isHost && (
                                <div style={{ marginTop: '20px' }}>
                                    <button
                                        onClick={handleCancel}
                                        disabled={cancelling}
                                        style={{
                                            padding: '8px 20px', borderRadius: '10px',
                                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                                            color: '#f87171', cursor: 'pointer', fontSize: '0.85rem',
                                        }}
                                    >
                                        {cancelling ? '취소 중...' : '방 취소하기'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {room.status === 'ready' && (
                        <>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#f1f5f9' }}>
                                준비 상태
                            </h2>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginBottom: '24px' }}>
                                {/* 호스트 */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        background: room.host_ready ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                                        border: `2px solid ${room.host_ready ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 8px',
                                        overflow: 'hidden'
                                    }}>
                                        {equippedDetails[room.host_id]?.avatar ? (
                                            <img src={equippedDetails[room.host_id].avatar.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : room.host_ready
                                            ? <Check size={32} color="#22c55e" />
                                            : <Clock size={32} color="#64748b" />}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 'bold' }}>
                                        <VibeName name={room.host?.username || 'Host'} effectItem={equippedDetails[room.host_id]?.name_effect} />
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: room.host_ready ? '#22c55e' : '#64748b' }}>
                                        {room.host_ready ? 'READY' : '대기 중'}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem', color: '#64748b', fontWeight: 'bold' }}>
                                    VS
                                </div>

                                {/* 게스트 */}
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: '80px', height: '80px', borderRadius: '50%',
                                        background: room.guest_ready ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                                        border: `2px solid ${room.guest_ready ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 8px',
                                        overflow: 'hidden'
                                    }}>
                                        {equippedDetails[room.guest_id]?.avatar ? (
                                            <img src={equippedDetails[room.guest_id].avatar.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : room.guest_ready
                                            ? <Check size={32} color="#22c55e" />
                                            : <Clock size={32} color="#64748b" />}
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 'bold' }}>
                                        <VibeName name={room.guest?.username || 'Guest'} effectItem={equippedDetails[room.guest_id]?.name_effect} />
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: room.guest_ready ? '#22c55e' : '#64748b' }}>
                                        {room.guest_ready ? 'READY' : '대기 중'}
                                    </div>
                                </div>
                            </div>

                            {isParticipant && (
                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleReady}
                                        disabled={readying}
                                        style={{
                                            padding: '12px 32px', borderRadius: '12px', border: 'none',
                                            background: myReady
                                                ? 'rgba(239,68,68,0.15)'
                                                : 'linear-gradient(135deg, #22c55e, #16a34a)',
                                            color: myReady ? '#f87171' : '#fff',
                                            fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer',
                                        }}
                                    >
                                        {readying ? '...' : myReady ? '준비 취소' : 'READY'}
                                    </motion.button>

                                    {isHost && (
                                        <button
                                            onClick={handleCancel}
                                            disabled={cancelling}
                                            style={{
                                                padding: '12px 20px', borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem',
                                            }}
                                        >
                                            취소
                                        </button>
                                    )}
                                </div>
                            )}

                            {isSpectator && (
                                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                    양쪽 플레이어가 준비하면 배틀이 시작됩니다.
                                </p>
                            )}
                        </>
                    )
                    }
                </div>
            )}

            {/* COUNTDOWN */}
            <AnimatePresence>
                {room.status === 'countdown' && countdown !== null && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 200,
                    }}>
                        <motion.div
                            key={countdown}
                            initial={{ scale: 2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            style={{
                                fontSize: '8rem', fontWeight: '900',
                                background: 'linear-gradient(to bottom, #f97316, #ef4444)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 0 80px rgba(239, 68, 68, 0.3)',
                            }}
                        >
                            {countdown}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* PLAYING 상태 - 에디터 */}
            {
                room.status === 'playing' && (
                    <div>
                        {/* 에디터 2분할 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '12px',
                            marginBottom: '16px',
                        }}>
                            {/* 내 에디터 (또는 호스트 - 관전자용) */}
                            <div style={{
                                borderRadius: '14px', overflow: 'hidden',
                                border: '1px solid rgba(99,102,241,0.2)',
                            }}>
                                <div style={{
                                    padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: 'rgba(99,102,241,0.1)',
                                    borderBottom: '1px solid rgba(99,102,241,0.15)',
                                }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#818cf8' }}>
                                        {isHost ? '내 코드' : isGuest ? '상대 코드 (읽기 전용)' : <VibeName name={room.host?.username || 'Host'} effectItem={equippedDetails[room.host_id]?.name_effect} />}
                                    </span>
                                    {isHost && (
                                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>편집 가능</span>
                                    )}
                                </div>
                                <Editor
                                    height="400px"
                                    language={problem?.language_hint || 'javascript'}
                                    theme="vs-dark"
                                    value={isHost ? myCode : isGuest ? opponentCode : myCode}
                                    onChange={isHost ? handleCodeChange : undefined}
                                    options={{
                                        readOnly: !isHost,
                                        domReadOnly: !isHost,
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                        padding: { top: 12 },
                                    }}
                                />
                            </div>

                            {/* 상대 에디터 (또는 게스트 - 관전자용) */}
                            <div style={{
                                borderRadius: '14px', overflow: 'hidden',
                                border: '1px solid rgba(239,68,68,0.2)',
                            }}>
                                <div style={{
                                    padding: '8px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: 'rgba(239,68,68,0.1)',
                                    borderBottom: '1px solid rgba(239,68,68,0.15)',
                                }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f87171' }}>
                                        {isHost ? '상대 코드 (읽기 전용)' : isGuest ? '내 코드' : <VibeName name={room.guest?.username || 'Guest'} effectItem={equippedDetails[room.guest_id]?.name_effect} />}
                                    </span>
                                    {isGuest && (
                                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>편집 가능</span>
                                    )}
                                </div>
                                <Editor
                                    height="400px"
                                    language={problem?.language_hint || 'javascript'}
                                    theme="vs-dark"
                                    value={isGuest ? myCode : isHost ? opponentCode : opponentCode}
                                    onChange={isGuest ? handleCodeChange : undefined}
                                    options={{
                                        readOnly: !isGuest,
                                        domReadOnly: !isGuest,
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                        padding: { top: 12 },
                                    }}
                                />
                            </div>
                        </div>

                        {/* 하단 액션 바 */}
                        {isParticipant && (
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 20px', borderRadius: '14px',
                                background: 'rgba(30, 41, 59, 0.5)',
                                border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Eye size={14} color="#64748b" />
                                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        관전자 {spectatorCount}명
                                    </span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleSubmit}
                                    disabled={submitting || mySubmitted}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '8px',
                                        padding: '10px 28px', borderRadius: '12px', border: 'none',
                                        background: mySubmitted
                                            ? 'rgba(34,197,94,0.15)'
                                            : 'linear-gradient(135deg, #f97316, #ef4444)',
                                        color: mySubmitted ? '#22c55e' : '#fff',
                                        fontWeight: 'bold', fontSize: '0.95rem',
                                        cursor: mySubmitted ? 'default' : 'pointer',
                                        opacity: submitting ? 0.6 : 1,
                                    }}
                                >
                                    {mySubmitted ? (
                                        <><Check size={18} /> 제출 완료</>
                                    ) : submitting ? (
                                        '제출 중...'
                                    ) : (
                                        <><Send size={18} /> 코드 제출</>
                                    )}
                                </motion.button>
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    );
};

export default BattleRoom;
