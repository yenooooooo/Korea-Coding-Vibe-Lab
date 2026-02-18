import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Plus, Clock, Users, Trophy, X, ChevronDown, Zap, Shield, Flame } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BattleRoom from '../components/BattleRoom';
import BattleResult from '../components/BattleResult';
import { VibeName, fetchBatchEquippedDetails } from '../utils/vibeItems.jsx';

const difficultyConfig = {
    easy: { label: 'Easy', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    hard: { label: 'Hard', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const categoryConfig = {
    algorithm: { label: '알고리즘', icon: <Zap size={14} /> },
    optimization: { label: '최적화', icon: <Flame size={14} /> },
    bugfix: { label: '버그 수정', icon: <Shield size={14} /> },
    creative: { label: '창의력', icon: <Trophy size={14} /> },
};

const BattleArena = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useToast();

    const [rooms, setRooms] = useState([]);
    const [problems, setProblems] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [myHistory, setMyHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(null);
    const [equippedDetails, setEquippedDetails] = useState({});

    // 방 생성 폼
    const [selectedProblem, setSelectedProblem] = useState('');
    const [selectedTime, setSelectedTime] = useState(300);

    // 로비 데이터 로드
    const fetchLobbyData = useCallback(async () => {
        setLoading(true);
        try {
            const [roomsRes, problemsRes] = await Promise.all([
                supabase
                    .from('battle_rooms')
                    .select('*, battle_problems(title, difficulty, category), host:profiles!battle_rooms_host_profiles_fkey(id, username, equipped_items)')
                    .in('status', ['waiting', 'playing', 'reviewing'])
                    .order('created_at', { ascending: false }),
                supabase
                    .from('battle_problems')
                    .select('*')
                    .eq('is_active', true)
                    .order('difficulty'),
            ]);

            if (roomsRes.data) {
                setRooms(roomsRes.data);
                const profiles = roomsRes.data.map(r => r.host).filter(Boolean);
                const details = await fetchBatchEquippedDetails(supabase, profiles);
                setEquippedDetails(prev => ({ ...prev, ...details }));
            }
            if (problemsRes.data) setProblems(problemsRes.data);

            // 내 전적
            if (user) {
                const { data: historyData } = await supabase
                    .from('battle_rooms')
                    .select('*, battle_problems(title, difficulty), host:profiles!battle_rooms_host_profiles_fkey(username), guest:profiles!battle_rooms_guest_profiles_fkey(username)')
                    .eq('status', 'finished')
                    .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
                    .order('ended_at', { ascending: false })
                    .limit(5);
                if (historyData) {
                    setMyHistory(historyData);
                    const profiles = historyData.flatMap(h => [h.host, h.guest]).filter(Boolean);
                    const details = await fetchBatchEquippedDetails(supabase, profiles);
                    setEquippedDetails(prev => ({ ...prev, ...details }));
                }
            }
        } catch (err) {
            console.error('Lobby fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // 특정 방 데이터 로드
    const fetchRoom = useCallback(async () => {
        if (!roomId) return;
        const { data } = await supabase
            .from('battle_rooms')
            .select('*, battle_problems(*), host:profiles!battle_rooms_host_profiles_fkey(username), guest:profiles!battle_rooms_guest_profiles_fkey(username)')
            .eq('id', roomId)
            .single();
        if (data) setCurrentRoom(data);
    }, [roomId]);

    useEffect(() => {
        if (roomId) {
            fetchRoom();
        } else {
            fetchLobbyData();
        }
    }, [roomId, fetchRoom, fetchLobbyData]);

    // Realtime 구독
    useEffect(() => {
        const channel = supabase
            .channel('battle_lobby')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'battle_rooms' },
                (payload) => {
                    if (roomId) {
                        if (payload.new?.id === roomId) {
                            fetchRoom();
                        }
                    } else {
                        fetchLobbyData();
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [roomId, fetchRoom, fetchLobbyData]);

    // 방 만들기
    const handleCreateRoom = async () => {
        if (!selectedProblem || creating) return;
        setCreating(true);
        try {
            const { data, error } = await supabase
                .from('battle_rooms')
                .insert({
                    host_id: user.id,
                    problem_id: selectedProblem,
                    time_limit: selectedTime,
                })
                .select()
                .single();

            if (error) throw error;
            setShowCreateModal(false);
            navigate(`/battle/${data.id}`);
            addToast('배틀 방이 생성되었습니다! 🔥', 'success');
        } catch (err) {
            console.error('Create room error:', err);
            addToast('방 생성에 실패했습니다.', 'error');
        } finally {
            setCreating(false);
        }
    };

    // 방 참가
    const handleJoinRoom = async (id) => {
        if (joining) return;
        setJoining(id);
        try {
            const { data, error } = await supabase.rpc('join_battle_room', { p_room_id: id });
            if (error) throw error;
            if (!data.success) {
                addToast(data.error, 'error');
                return;
            }
            navigate(`/battle/${id}`);
            addToast('배틀에 참가했습니다! ⚔️', 'success');
        } catch (err) {
            console.error('Join room error:', err);
            addToast('참가에 실패했습니다.', 'error');
        } finally {
            setJoining(null);
        }
    };

    // roomId가 있으면 방 뷰
    if (roomId && currentRoom) {
        if (['waiting', 'ready', 'countdown', 'playing'].includes(currentRoom.status)) {
            return <BattleRoom room={currentRoom} onRoomUpdate={fetchRoom} />;
        }
        if (['reviewing', 'finished'].includes(currentRoom.status)) {
            return <BattleResult room={currentRoom} onRoomUpdate={fetchRoom} />;
        }
        if (currentRoom.status === 'cancelled') {
            return (
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    <Swords size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <h2 style={{ color: '#f1f5f9', marginBottom: '8px' }}>취소된 배틀입니다</h2>
                    <button
                        onClick={() => navigate('/battle')}
                        style={{
                            marginTop: '16px', padding: '10px 24px', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                            fontWeight: 'bold', cursor: 'pointer',
                        }}
                    >
                        로비로 돌아가기
                    </button>
                </div>
            );
        }
    }

    if (roomId && !currentRoom && !loading) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <Swords size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h2 style={{ color: '#f1f5f9', marginBottom: '8px' }}>방을 찾을 수 없습니다</h2>
                <button
                    onClick={() => navigate('/battle')}
                    style={{
                        marginTop: '16px', padding: '10px 24px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
                        fontWeight: 'bold', cursor: 'pointer',
                    }}
                >
                    로비로 돌아가기
                </button>
            </div>
        );
    }

    // 로그인 필요
    if (!user) {
        return (
            <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <Swords size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h2 style={{ color: '#f1f5f9', marginBottom: '8px' }}>로그인이 필요합니다</h2>
                <p>코딩 배틀에 참여하려면 먼저 로그인해 주세요.</p>
            </div>
        );
    }

    const waitingRooms = rooms.filter(r => r.status === 'waiting');
    const activeRooms = rooms.filter(r => ['playing', 'reviewing'].includes(r.status));

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '100px', color: '#fff' }}>
            {/* 헤더 */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                    <span style={{
                        background: 'linear-gradient(to right, #f97316, #ef4444)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        코딩 배틀
                    </span>{' '}
                    <Swords size={28} style={{ display: 'inline', verticalAlign: 'middle' }} color="#ef4444" />
                </h1>
                <p style={{ color: '#94a3b8' }}>
                    1v1 실시간 코딩 대결! 같은 문제, 다른 풀이. 관전자가 승자를 결정합니다.
                </p>
                {activeRooms.length > 0 && (
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '8px',
                        padding: '4px 12px', borderRadius: '20px',
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
                        <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold' }}>
                            진행 중 {activeRooms.length}개
                        </span>
                    </div>
                )}
            </div>

            {/* 방 만들기 버튼 */}
            <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowCreateModal(true)}
                style={{
                    width: '100%', padding: '16px', marginBottom: '24px',
                    borderRadius: '16px', border: '2px dashed rgba(239, 68, 68, 0.3)',
                    background: 'rgba(239, 68, 68, 0.05)', color: '#f87171',
                    fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
            >
                <Plus size={20} />
                배틀 방 만들기
            </motion.button>

            {/* 대기 중 방 목록 */}
            <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px', color: '#f1f5f9' }}>
                    <Users size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
                    대기 중인 방 ({waitingRooms.length})
                </h3>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>로딩 중...</div>
                ) : waitingRooms.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '40px',
                        background: 'rgba(30, 41, 59, 0.3)', borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)', color: '#64748b',
                    }}>
                        대기 중인 방이 없습니다. 새 배틀을 만들어보세요!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {waitingRooms.map(room => {
                            const diff = difficultyConfig[room.battle_problems?.difficulty] || difficultyConfig.easy;
                            const cat = categoryConfig[room.battle_problems?.category] || categoryConfig.algorithm;
                            return (
                                <motion.div
                                    key={room.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '16px 20px', borderRadius: '14px',
                                        background: 'rgba(30, 41, 59, 0.5)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#f1f5f9' }}>
                                                {room.battle_problems?.title || '문제'}
                                            </span>
                                            <span style={{
                                                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px',
                                                background: diff.bg, color: diff.color, fontWeight: 'bold',
                                            }}>
                                                {diff.label}
                                            </span>
                                            <span style={{
                                                fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px',
                                                background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                                                display: 'flex', alignItems: 'center', gap: '3px',
                                            }}>
                                                {cat.icon} {cat.label}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <span>
                                                호스트: <VibeName name={room.host?.username || '??'} effectItem={equippedDetails[room.host?.id]?.name_effect} style={{ fontWeight: 'bold' }} />
                                            </span>
                                            <span><Clock size={13} style={{ verticalAlign: 'middle' }} /> {Math.floor(room.time_limit / 60)}분</span>
                                        </div>
                                    </div>
                                    {room.host_id !== user?.id && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleJoinRoom(room.id)}
                                            disabled={joining === room.id}
                                            style={{
                                                padding: '8px 20px', borderRadius: '10px', border: 'none',
                                                background: 'linear-gradient(135deg, #f97316, #ef4444)', color: '#fff',
                                                fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer',
                                                opacity: joining === room.id ? 0.6 : 1, flexShrink: 0,
                                            }}
                                        >
                                            {joining === room.id ? '참가 중...' : '참가'}
                                        </motion.button>
                                    )}
                                    {room.host_id === user?.id && (
                                        <span style={{
                                            padding: '8px 16px', borderRadius: '10px',
                                            background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                                            fontSize: '0.85rem', fontWeight: 'bold', flexShrink: 0,
                                        }}>
                                            내 방
                                        </span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 진행 중 관전 */}
            {activeRooms.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px', color: '#f1f5f9' }}>
                        <Flame size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} color="#ef4444" />
                        진행 중 ({activeRooms.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {activeRooms.map(room => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => navigate(`/battle/${room.id}`)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '14px 20px', borderRadius: '14px',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    border: '1px solid rgba(239, 68, 68, 0.15)', cursor: 'pointer',
                                }}
                            >
                                <div>
                                    <span style={{ fontWeight: 'bold', color: '#f1f5f9', fontSize: '0.95rem' }}>
                                        {room.battle_problems?.title}
                                    </span>
                                    <span style={{
                                        marginLeft: '8px', fontSize: '0.7rem', padding: '2px 8px',
                                        borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: '#f87171',
                                    }}>
                                        {room.status === 'playing' ? 'LIVE' : 'REVIEW'}
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>관전하기 &rarr;</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* 내 전적 */}
            {myHistory.length > 0 && (
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '12px', color: '#f1f5f9' }}>
                        <Trophy size={18} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} color="#facc15" />
                        내 전적 (최근 5개)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {myHistory.map(h => {
                            const isWin = h.winner_id === user.id;
                            const isDraw = !h.winner_id;
                            const opponent = h.host_id === user.id ? h.guest?.username : h.host?.username;
                            return (
                                <div
                                    key={h.id}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 16px', borderRadius: '12px',
                                        background: 'rgba(30, 41, 59, 0.4)',
                                        border: `1px solid ${isWin ? 'rgba(34,197,94,0.15)' : isDraw ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.15)'}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold',
                                            background: isWin ? 'rgba(34,197,94,0.15)' : isDraw ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.15)',
                                            color: isWin ? '#22c55e' : isDraw ? '#94a3b8' : '#ef4444',
                                        }}>
                                            {isWin ? 'WIN' : isDraw ? 'DRAW' : 'LOSE'}
                                        </span>
                                        <span style={{ fontSize: '0.9rem', color: '#f1f5f9' }}>{h.battle_problems?.title}</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        vs <VibeName name={opponent || '??'} effectItem={equippedDetails[h.host_id === user.id ? h.guest_id : h.host_id]?.name_effect} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 방 만들기 모달 */}
            <AnimatePresence>
                {showCreateModal && (
                    <div
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 100,
                        }}
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                background: 'linear-gradient(145deg, #1e293b, #0f172a)',
                                padding: '32px', borderRadius: '20px', maxWidth: '480px', width: '90%',
                                border: '1px solid rgba(255,255,255,0.1)',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 'bold' }}>
                                    <Swords size={22} style={{ verticalAlign: 'middle', marginRight: '8px' }} color="#f97316" />
                                    배틀 방 만들기
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px', width: '32px', height: '32px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: '#94a3b8',
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* 문제 선택 */}
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>
                                    문제 선택
                                </label>
                                <select
                                    value={selectedProblem}
                                    onChange={e => setSelectedProblem(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px', borderRadius: '10px',
                                        background: 'rgba(15, 23, 42, 0.8)', color: '#f1f5f9',
                                        border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.9rem',
                                        appearance: 'none', cursor: 'pointer',
                                    }}
                                >
                                    <option value="">문제를 선택하세요</option>
                                    {problems.map(p => (
                                        <option key={p.id} value={p.id}>
                                            [{difficultyConfig[p.difficulty]?.label}] {p.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 선택된 문제 미리보기 */}
                            {selectedProblem && (() => {
                                const prob = problems.find(p => p.id === selectedProblem);
                                if (!prob) return null;
                                const diff = difficultyConfig[prob.difficulty];
                                return (
                                    <div style={{
                                        padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                                        background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)',
                                    }}>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '4px' }}>
                                            <span style={{
                                                padding: '1px 6px', borderRadius: '4px', marginRight: '6px',
                                                background: diff.bg, color: diff.color, fontSize: '0.7rem', fontWeight: 'bold',
                                            }}>
                                                {diff.label}
                                            </span>
                                            {categoryConfig[prob.category]?.label}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                                            {prob.description.substring(0, 100)}...
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* 시간 설정 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px', fontWeight: 'bold' }}>
                                    <Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                    제한 시간
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {[180, 300, 600].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedTime(t)}
                                            style={{
                                                flex: 1, padding: '10px', borderRadius: '10px',
                                                border: selectedTime === t ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.08)',
                                                background: selectedTime === t ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
                                                color: selectedTime === t ? '#f87171' : '#94a3b8',
                                                fontWeight: selectedTime === t ? 'bold' : 'normal',
                                                cursor: 'pointer', fontSize: '0.9rem',
                                            }}
                                        >
                                            {t / 60}분
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleCreateRoom}
                                disabled={!selectedProblem || creating}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                                    background: selectedProblem
                                        ? 'linear-gradient(135deg, #f97316, #ef4444)'
                                        : 'rgba(255,255,255,0.05)',
                                    color: selectedProblem ? '#fff' : '#64748b',
                                    fontWeight: 'bold', fontSize: '1rem', cursor: selectedProblem ? 'pointer' : 'not-allowed',
                                    opacity: creating ? 0.6 : 1,
                                }}
                            >
                                {creating ? '생성 중...' : '방 만들기'}
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
        </div>
    );
};

export default BattleArena;
