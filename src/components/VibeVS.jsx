import React, { useState, useEffect } from 'react';
import { Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const VibeVS = () => {
    const [battles, setBattles] = useState([]);
    const [currentBattle, setCurrentBattle] = useState(null);
    const [votes, setVotes] = useState([]);
    const [myVote, setMyVote] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        fetchBattles();
        fetchVotes();

        const voteChannel = supabase
            .channel('vs_votes_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'vs_votes' }, () => {
                fetchVotes();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(voteChannel);
        };
    }, []);

    useEffect(() => {
        if (battles.length > 0) {
            setCurrentBattle(battles[currentIndex]);
        }
    }, [battles, currentIndex]);

    useEffect(() => {
        if (currentBattle && user) {
            const vote = votes.find(v => v.battle_id === currentBattle.id && v.user_id === user.id);
            setMyVote(vote?.choice || null);
        } else {
            setMyVote(null);
        }
    }, [currentBattle, votes, user]);

    const fetchBattles = async () => {
        const { data, error } = await supabase
            .from('vs_battles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching battles:', error);
        else setBattles(data || []);
    };

    const fetchVotes = async () => {
        const { data, error } = await supabase
            .from('vs_votes')
            .select('*');

        if (error) console.error('Error fetching votes:', error);
        else setVotes(data || []);
    };

    const handleVote = async (choice) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        if (myVote) {
            // Update vote
            const { error } = await supabase
                .from('vs_votes')
                .update({ choice })
                .match({ battle_id: currentBattle.id, user_id: user.id });

            if (error) console.error('Error updating vote:', error);
        } else {
            // Insert new vote
            const { error } = await supabase
                .from('vs_votes')
                .insert([{ battle_id: currentBattle.id, user_id: user.id, choice }]);

            if (error && error.code !== '23505') {
                console.error('Error inserting vote:', error);
            }
        }
        fetchVotes();
    };

    const goNext = () => {
        setCurrentIndex((prev) => (prev + 1) % battles.length);
    };

    const goPrev = () => {
        setCurrentIndex((prev) => (prev - 1 + battles.length) % battles.length);
    };

    if (!currentBattle) {
        return (
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
                <p style={{ color: '#94a3b8' }}>배틀을 불러오는 중...</p>
            </div>
        );
    }

    const battleVotes = votes.filter(v => v.battle_id === currentBattle.id);
    const aVotes = battleVotes.filter(v => v.choice === 'A').length;
    const bVotes = battleVotes.filter(v => v.choice === 'B').length;
    const totalVotes = aVotes + bVotes;
    const aPercent = totalVotes > 0 ? Math.round((aVotes / totalVotes) * 100) : 50;
    const bPercent = totalVotes > 0 ? Math.round((bVotes / totalVotes) * 100) : 50;

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(251, 146, 60, 0.15))',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                textAlign: 'center'
            }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Flame size={24} /> Vibe VS
                </h2>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
                    개발자의 영원한 딜레마... 당신의 선택은?
                </p>
            </div>

            {/* Battle Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                    onClick={goPrev}
                    disabled={battles.length <= 1}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        color: '#94a3b8',
                        cursor: battles.length > 1 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    <ChevronLeft size={16} /> 이전
                </button>

                <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {currentIndex + 1} / {battles.length}
                </span>

                <button
                    onClick={goNext}
                    disabled={battles.length <= 1}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        color: '#94a3b8',
                        cursor: battles.length > 1 ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    다음 <ChevronRight size={16} />
                </button>
            </div>

            {/* Battle Arena */}
            <div style={{
                flex: 1,
                display: 'flex',
                gap: '20px',
                minHeight: '400px'
            }}>
                {/* Option A */}
                <motion.div
                    whileHover={{ scale: myVote ? 1 : 1.02 }}
                    onClick={() => !myVote && handleVote('A')}
                    style={{
                        flex: 1,
                        background: myVote === 'A'
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.15))'
                            : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.6))',
                        borderRadius: '24px',
                        padding: '40px',
                        border: myVote === 'A' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: myVote ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s'
                    }}
                >
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: myVote === 'A' ? '#60a5fa' : '#64748b'
                    }}>
                        A
                    </div>
                    <p style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: myVote === 'A' ? '#e2e8f0' : '#cbd5e1',
                        textAlign: 'center',
                        lineHeight: 1.6,
                        margin: 0
                    }}>
                        {currentBattle.option_a}
                    </p>
                    {myVote && (
                        <div style={{
                            marginTop: 'auto',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#60a5fa',
                                marginBottom: '8px'
                            }}>
                                {aPercent}%
                            </div>
                            <div style={{
                                fontSize: '0.85rem',
                                color: '#94a3b8'
                            }}>
                                {aVotes}명 투표
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* VS Divider */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}>
                    <div style={{
                        background: 'linear-gradient(to bottom, #ef4444, #f97316)',
                        borderRadius: '50%',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: 'white',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
                    }}>
                        VS
                    </div>
                </div>

                {/* Option B */}
                <motion.div
                    whileHover={{ scale: myVote ? 1 : 1.02 }}
                    onClick={() => !myVote && handleVote('B')}
                    style={{
                        flex: 1,
                        background: myVote === 'B'
                            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.15))'
                            : 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.6))',
                        borderRadius: '24px',
                        padding: '40px',
                        border: myVote === 'B' ? '2px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                        cursor: myVote ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '24px',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s'
                    }}
                >
                    <div style={{
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        color: myVote === 'B' ? '#fca5a5' : '#64748b'
                    }}>
                        B
                    </div>
                    <p style={{
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: myVote === 'B' ? '#e2e8f0' : '#cbd5e1',
                        textAlign: 'center',
                        lineHeight: 1.6,
                        margin: 0
                    }}>
                        {currentBattle.option_b}
                    </p>
                    {myVote && (
                        <div style={{
                            marginTop: 'auto',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 'bold',
                                color: '#fca5a5',
                                marginBottom: '8px'
                            }}>
                                {bPercent}%
                            </div>
                            <div style={{
                                fontSize: '0.85rem',
                                color: '#94a3b8'
                            }}>
                                {bVotes}명 투표
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Vote Info */}
            {!user ? (
                <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5'
                }}>
                    로그인하고 당신의 선택을 남겨보세요! 🔥
                </div>
            ) : myVote ? (
                <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: 'rgba(74, 222, 128, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(74, 222, 128, 0.2)',
                    color: '#86efac'
                }}>
                    ✨ 투표 완료! 다른 배틀도 구경해보세요
                </div>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#94a3b8'
                }}>
                    👆 위에서 하나를 선택해주세요!
                </div>
            )}
        </div>
    );
};

export default VibeVS;
