import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sendNotification } from '../lib/notifications';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus, Loader, Check, X, Trash2, MessageCircle } from 'lucide-react';
import ProfileSummaryModal from '../components/ProfileSummaryModal';

const Friends = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    // States
    const [friends, setFriends] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('friends'); // friends, received, sent, search
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [equippedDetails, setEquippedDetails] = useState({});

    useEffect(() => {
        if (user) {
            fetchFriendsData();
        }
    }, [user]);

    const fetchFriendsData = async () => {
        setLoading(true);
        try {
            // 1. 친구 목록
            const { data: friendships, error: friendshipsError } = await supabase
                .from('friendships')
                .select(`
                    id,
                    user_id_1,
                    user_id_2,
                    created_at
                `)
                .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`);

            if (friendshipsError) throw friendshipsError;

            // 친구 ID 추출
            const friendIds = friendships.map(f =>
                f.user_id_1 === user.id ? f.user_id_2 : f.user_id_1
            );

            // 친구 프로필 정보 조회
            let friendProfiles = [];
            if (friendIds.length > 0) {
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, total_points, current_streak')
                    .in('id', friendIds);

                if (profilesError) throw profilesError;
                friendProfiles = profiles || [];
            }

            setFriends(friendProfiles);

            // 2. 받은 친구 요청 (프로필 따로 조회)
            const { data: received, error: receivedError } = await supabase
                .from('friend_requests')
                .select('id, requester_id, status, created_at')
                .eq('receiver_id', user.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (receivedError) throw receivedError;

            // 요청자의 프로필 정보 조회
            let receivedWithProfiles = [];
            if (received && received.length > 0) {
                const requesterIds = received.map(r => r.requester_id);
                const { data: requesterProfiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, total_points')
                    .in('id', requesterIds);

                if (profilesError) throw profilesError;

                receivedWithProfiles = received.map(req => ({
                    ...req,
                    profiles: requesterProfiles.find(p => p.id === req.requester_id)
                }));
            }

            setReceivedRequests(receivedWithProfiles);

            // 3. 보낸 친구 요청 (프로필 따로 조회)
            const { data: sent, error: sentError } = await supabase
                .from('friend_requests')
                .select('id, receiver_id, status, created_at')
                .eq('requester_id', user.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (sentError) throw sentError;

            // 수신자의 프로필 정보 조회
            let sentWithProfiles = [];
            if (sent && sent.length > 0) {
                const receiverIds = sent.map(r => r.receiver_id);
                const { data: receiverProfiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, username, avatar_url, total_points')
                    .in('id', receiverIds);

                if (profilesError) throw profilesError;

                sentWithProfiles = sent.map(req => ({
                    ...req,
                    profiles: receiverProfiles.find(p => p.id === req.receiver_id)
                }));
            }

            setSentRequests(sentWithProfiles);

        } catch (error) {
            console.error('Error fetching friends data:', error);
            addToast('친구 데이터를 불러오지 못했습니다.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, username, avatar_url, total_points, current_streak')
                .ilike('username', `%${searchQuery}%`)
                .neq('id', user.id)
                .limit(10);

            if (error) throw error;

            // 이미 친구인지, 신청했는지 확인
            const enrichedProfiles = profiles.map(profile => {
                const isFriend = friends.some(f => f.id === profile.id);
                const hasSentRequest = sentRequests.some(r => r.receiver_id === profile.id);
                const hasReceivedRequest = receivedRequests.some(r => r.profiles.id === profile.id);

                return {
                    ...profile,
                    isFriend,
                    hasSentRequest,
                    hasReceivedRequest
                };
            });

            setSearchResults(enrichedProfiles);
        } catch (error) {
            console.error('Search error:', error);
            addToast('검색에 실패했습니다.', 'error');
        }
    };

    const sendFriendRequest = async (receiverId) => {
        try {
            const { error } = await supabase
                .from('friend_requests')
                .insert({
                    requester_id: user.id,
                    receiver_id: receiverId,
                    status: 'pending'
                });

            if (error) throw error;
            addToast('친구 신청을 보냈습니다! 🎉', 'success');

            // 상대방에게 친구 요청 알림
            const myName = user?.user_metadata?.username || '유저';
            sendNotification(
                receiverId,
                'FRIEND_REQUEST',
                `👋 ${myName}님이 친구 신청을 보냈습니다!`,
                '/friends'
            );

            fetchFriendsData();
            handleSearch(); // 검색 결과 새로고침
        } catch (error) {
            console.error('Error sending friend request:', error);
            addToast('이미 신청했거나 오류가 발생했습니다.', 'error');
        }
    };

    const acceptFriendRequest = async (requestId) => {
        try {
            const { error } = await supabase
                .from('friend_requests')
                .update({ status: 'accepted' })
                .eq('id', requestId);

            if (error) throw error;
            addToast('친구 신청을 수락했습니다! 👋', 'success');

            // 요청자에게 수락 알림
            const request = receivedRequests.find(r => r.id === requestId);
            if (request) {
                const myName = user?.user_metadata?.username || '유저';
                sendNotification(
                    request.requester_id,
                    'JOIN_APPROVED',
                    `🎉 ${myName}님이 친구 신청을 수락했습니다!`,
                    '/friends'
                );
            }

            fetchFriendsData();
        } catch (error) {
            console.error('Error accepting request:', error);
            addToast('오류가 발생했습니다.', 'error');
        }
    };

    const rejectFriendRequest = async (requestId) => {
        try {
            const { error } = await supabase
                .from('friend_requests')
                .update({ status: 'rejected' })
                .eq('id', requestId);

            if (error) throw error;
            addToast('친구 신청을 거절했습니다.', 'success');
            fetchFriendsData();
        } catch (error) {
            console.error('Error rejecting request:', error);
            addToast('오류가 발생했습니다.', 'error');
        }
    };

    const removeFriend = async (friendId) => {
        if (!window.confirm('정말 친구를 삭제하시겠어요?')) return;

        try {
            const { error } = await supabase
                .from('friendships')
                .delete()
                .or(
                    `and(user_id_1.eq.${user.id},user_id_2.eq.${friendId}),and(user_id_1.eq.${friendId},user_id_2.eq.${user.id})`
                );

            if (error) throw error;
            addToast('친구를 삭제했습니다.', 'success');
            fetchFriendsData();
        } catch (error) {
            console.error('Error removing friend:', error);
            addToast('친구 삭제에 실패했습니다.', 'error');
        }
    };

    const startDM = async (friendId) => {
        try {
            // 대화방 생성 또는 조회
            const user1 = user.id < friendId ? user.id : friendId;
            const user2 = user.id > friendId ? user.id : friendId;

            const { data: conv, error: convError } = await supabase
                .from('conversations')
                .select('id')
                .eq('user_id_1', user1)
                .eq('user_id_2', user2)
                .maybeSingle();

            if (convError && convError.code !== 'PGRST116') throw convError;

            if (!conv) {
                // 새로운 대화방 생성
                const { error: insertError } = await supabase
                    .from('conversations')
                    .insert({
                        user_id_1: user1,
                        user_id_2: user2
                    });

                if (insertError) throw insertError;
            }

            navigate('/messages');
            addToast('메시지 페이지로 이동합니다.', 'success');
        } catch (error) {
            console.error('Error starting DM:', error);
            addToast('메시지를 시작할 수 없습니다.', 'error');
        }
    };

    const cancelRequest = async (requestId) => {
        try {
            const { error } = await supabase
                .from('friend_requests')
                .delete()
                .eq('id', requestId);

            if (error) throw error;
            addToast('신청을 취소했습니다.', 'success');
            fetchFriendsData();
            handleSearch();
        } catch (error) {
            console.error('Error canceling request:', error);
            addToast('오류가 발생했습니다.', 'error');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: '#94a3b8' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Loader size={48} color="#818cf8" />
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', paddingBottom: '100px' }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: '40px' }}
            >
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '900',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: 'linear-gradient(135deg, #818cf8, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px'
                }}>
                    <Users size={40} style={{ color: '#818cf8' }} />
                    친구 목록
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem' }}>
                    함께 성장할 친구들을 찾아보세요 🚀
                </p>
            </motion.div>

            {/* 탭 네비게이션 */}
            <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '32px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '16px',
                flexWrap: 'wrap'
            }}>
                {[
                    { id: 'friends', label: `👥 친구 (${friends.length})` },
                    { id: 'received', label: `💌 받은 신청 (${receivedRequests.length})` },
                    { id: 'sent', label: `📤 보낸 신청 (${sentRequests.length})` },
                    { id: 'search', label: '🔍 검색' }
                ].map(t => (
                    <motion.button
                        key={t.id}
                        onClick={() => { setTab(t.id); setSearchQuery(''); setSearchResults([]); }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '12px',
                            border: tab === t.id ? '2px solid #818cf8' : '1px solid rgba(255,255,255,0.2)',
                            background: tab === t.id ? 'rgba(129, 140, 248, 0.2)' : 'transparent',
                            color: tab === t.id ? '#818cf8' : '#94a3b8',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        {t.label}
                    </motion.button>
                ))}
            </div>

            {/* 검색 탭 */}
            {tab === 'search' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '32px' }}
                >
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="유저명으로 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{
                                flex: 1,
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.2)',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                outline: 'none',
                                fontSize: '1rem'
                            }}
                        />
                        <button
                            onClick={handleSearch}
                            style={{
                                padding: '12px 24px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #818cf8, #a855f7)',
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Search size={18} />
                            검색
                        </button>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '16px'
                    }}>
                        {searchResults.map(profile => (
                            <FriendCard
                                key={profile.id}
                                profile={profile}
                                isFriend={profile.isFriend}
                                hasSentRequest={profile.hasSentRequest}
                                hasReceivedRequest={profile.hasReceivedRequest}
                                onSendRequest={() => sendFriendRequest(profile.id)}
                                onAccept={profile.hasReceivedRequest ? () => {
                                    const req = receivedRequests.find(r => r.profiles.id === profile.id);
                                    if (req) acceptFriendRequest(req.id);
                                } : null}
                                onReject={profile.hasReceivedRequest ? () => {
                                    const req = receivedRequests.find(r => r.profiles.id === profile.id);
                                    if (req) rejectFriendRequest(req.id);
                                } : null}
                                onRemoveFriend={() => removeFriend(profile.id)}
                                onViewProfile={() => setSelectedUserId(profile.id)}
                            />
                        ))}
                    </div>

                    {searchQuery && searchResults.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            <p>검색 결과가 없습니다.</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* 친구 목록 탭 */}
            {tab === 'friends' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {friends.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '16px'
                        }}>
                            {friends.map(friend => (
                                <FriendCard
                                    key={friend.id}
                                    profile={friend}
                                    isFriend={true}
                                    onRemoveFriend={() => removeFriend(friend.id)}
                                    onViewProfile={() => setSelectedUserId(friend.id)}
                                    onStartDM={() => startDM(friend.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>아직 친구가 없어요.</p>
                            <p style={{ marginTop: '8px' }}>검색 탭에서 친구를 찾아보세요!</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* 받은 신청 탭 */}
            {tab === 'received' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {receivedRequests.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '16px'
                        }}>
                            {receivedRequests.map(req => (
                                <FriendRequestCard
                                    key={req.id}
                                    profile={req.profiles}
                                    onAccept={() => acceptFriendRequest(req.id)}
                                    onReject={() => rejectFriendRequest(req.id)}
                                    onViewProfile={() => setSelectedUserId(req.profiles.id)}
                                    type="received"
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>받은 신청이 없어요.</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* 보낸 신청 탭 */}
            {tab === 'sent' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    {sentRequests.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '16px'
                        }}>
                            {sentRequests.map(req => (
                                <FriendRequestCard
                                    key={req.id}
                                    profile={req.profiles}
                                    onCancel={() => cancelRequest(req.id)}
                                    onViewProfile={() => setSelectedUserId(req.profiles.id)}
                                    type="sent"
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📤</div>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>보낸 신청이 없어요.</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* 프로필 모달 */}
            <ProfileSummaryModal
                userId={selectedUserId}
                isOpen={!!selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </div>
    );
};

// 친구 카드 컴포넌트
const FriendCard = ({ profile, isFriend, hasSentRequest, hasReceivedRequest, onSendRequest, onAccept, onReject, onRemoveFriend, onViewProfile, onStartDM }) => (
    <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
        style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.3s',
            cursor: 'pointer'
        }}
    >
        {/* 아바타 */}
        <div onClick={onViewProfile} style={{ marginBottom: '16px' }}>
            <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #818cf8, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto',
                border: '2px solid rgba(129, 140, 248, 0.5)',
                overflow: 'hidden'
            }}>
                {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    profile.username?.[0]?.toUpperCase() || '👤'
                )}
            </div>
        </div>

        {/* 정보 */}
        <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '12px'
        }}>
            {profile.username}
        </h3>

        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '16px',
            fontSize: '0.9rem'
        }}>
            <div style={{ background: 'rgba(96, 165, 250, 0.1)', padding: '8px', borderRadius: '12px', textAlign: 'center', color: '#60a5fa' }}>
                Lv.{Math.floor(Math.sqrt(profile.total_points || 0)) + 1}
            </div>
            <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '8px', borderRadius: '12px', textAlign: 'center', color: '#fb923c' }}>
                🔥 {profile.current_streak || 0}일
            </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
            <button
                onClick={onViewProfile}
                style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'rgba(129, 140, 248, 0.2)',
                    color: '#818cf8',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                }}
            >
                프로필 보기
            </button>

            {isFriend ? (
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                        onClick={onStartDM}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'rgba(52, 211, 153, 0.2)',
                            color: '#34d399',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <MessageCircle size={14} /> 메시지
                    </button>
                    <button
                        onClick={onRemoveFriend}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Trash2 size={14} /> 삭제
                    </button>
                </div>
            ) : hasSentRequest ? (
                <button
                    disabled
                    style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'rgba(100, 116, 139, 0.2)',
                        color: '#94a3b8',
                        fontWeight: 'bold',
                        cursor: 'not-allowed',
                        fontSize: '0.9rem'
                    }}
                >
                    ⏳ 신청 중...
                </button>
            ) : hasReceivedRequest ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {onAccept && (
                        <button
                            onClick={onAccept}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'rgba(52, 211, 153, 0.2)',
                                color: '#34d399',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                            }}
                        >
                            <Check size={14} /> 수락
                        </button>
                    )}
                    {onReject && (
                        <button
                            onClick={onReject}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                            }}
                        >
                            <X size={14} /> 거절
                        </button>
                    )}
                </div>
            ) : (
                <button
                    onClick={onSendRequest}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #818cf8, #a855f7)',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                    }}
                >
                    <UserPlus size={14} /> 친구 신청
                </button>
            )}
        </div>
    </motion.div>
);

// 친구 신청 카드 컴포넌트
const FriendRequestCard = ({ profile, onAccept, onReject, onCancel, onViewProfile, type }) => (
    <motion.div
        whileHover={{ scale: 1.03, y: -5 }}
        style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'all 0.3s',
            cursor: 'pointer'
        }}
    >
        <div onClick={onViewProfile} style={{ marginBottom: '16px' }}>
            <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #818cf8, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto',
                border: '2px solid rgba(129, 140, 248, 0.5)',
                overflow: 'hidden'
            }}>
                {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    profile.username?.[0]?.toUpperCase() || '👤'
                )}
            </div>
        </div>

        <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#fff',
            textAlign: 'center',
            marginBottom: '12px'
        }}>
            {profile.username}
        </h3>

        <div style={{
            display: 'flex',
            gap: '8px',
            flexDirection: 'column'
        }}>
            <button
                onClick={onViewProfile}
                style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'rgba(129, 140, 248, 0.2)',
                    color: '#818cf8',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                }}
            >
                프로필 보기
            </button>

            {type === 'received' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={onAccept}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'rgba(52, 211, 153, 0.2)',
                            color: '#34d399',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                        }}
                    >
                        <Check size={14} /> 수락
                    </button>
                    <button
                        onClick={onReject}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            borderRadius: '10px',
                            border: 'none',
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                        }}
                    >
                        <X size={14} /> 거절
                    </button>
                </div>
            ) : (
                <button
                    onClick={onCancel}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: 'none',
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    }}
                >
                    <X size={14} /> 신청 취소
                </button>
            )}
        </div>
    </motion.div>
);

export default Friends;
