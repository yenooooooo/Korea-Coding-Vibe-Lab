import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, MessageCircle, ExternalLink, X, Crown, UserPlus, UserMinus, Check, XCircle, Edit2, Save, Lock, Video } from 'lucide-react';
import ProfileSummaryModal from '../components/ProfileSummaryModal';
import { useFocusCam } from '../context/FocusCamContext';
import FocusCamGrid from '../components/FocusCamGrid';
import { isAdmin, ADMIN_NAME_STYLE, ADMIN_BADGE_STYLE, ADMIN_AVATAR_GLOW } from '../utils/admin';

const StudyGroup = () => {
    const { user } = useAuth();
    const [activeUsers, setActiveUsers] = useState([]);
    const [studyGroups, setStudyGroups] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newGroup, setNewGroup] = useState({
        title: '',
        description: '',
        tech_tags: '',
        open_chat_url: '',
        max_members: 4
    });

    // 상세 모달 관련 상태
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupMembers, setGroupMembers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [myMemberships, setMyMemberships] = useState({});
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', tech_tags: '', open_chat_url: '', max_members: 4 });
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [anchorPos, setAnchorPos] = useState(null);
    const lastMousePos = React.useRef({ x: 0, y: 0 });
    React.useEffect(() => {
        const handler = (e) => { lastMousePos.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);
    const openProfile = (id) => { setSelectedUserId(id); setAnchorPos({ ...lastMousePos.current }); };
    const { joinRoom, isJoined, currentGroupId } = useFocusCam();

    useEffect(() => {
        fetchActiveUsers();
        fetchStudyGroups();
    }, []);

    useEffect(() => {
        if (user) fetchMyMemberships();
    }, [user]);

    const fetchActiveUsers = async () => {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
            .from('attendance')
            .select('user_id, vibe_status, check_in_date, profiles!attendance_user_id_fkey(username, vibe_color, avatar_url)')
            .eq('check_in_date', today)
            .limit(10);

        if (!error && data) {
            setActiveUsers(data);
        }
    };

    const fetchStudyGroups = async () => {
        const { data, error } = await supabase
            .from('study_groups')
            .select('*, profiles!study_groups_owner_id_fkey(username, avatar_url, is_admin)')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setStudyGroups(data);
        }
    };

    const fetchMyMemberships = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('study_group_members')
                .select('group_id, status')
                .eq('user_id', user.id);

            if (!error && data) {
                const map = {};
                data.forEach(m => { map[m.group_id] = m.status; });
                setMyMemberships(map);
            }
        } catch (e) {
            // study_group_members 테이블이 아직 없는 경우 무시
            console.warn('study_group_members 테이블 조회 실패:', e);
        }
    };

    const fetchGroupDetail = async (group) => {
        // 승인된 멤버 조회
        const { data: members } = await supabase
            .from('study_group_members')
            .select('*, profiles!study_group_members_user_id_fkey(username, avatar_url)')
            .eq('group_id', group.id)
            .eq('status', 'approved')
            .order('joined_at', { ascending: true });

        setGroupMembers(members || []);

        // 방장인 경우 대기 중 신청 조회
        if (user && group.owner_id === user.id) {
            const { data: pending } = await supabase
                .from('study_group_members')
                .select('*, profiles!study_group_members_user_id_fkey(username, avatar_url)')
                .eq('group_id', group.id)
                .eq('status', 'pending')
                .order('joined_at', { ascending: true });

            setPendingRequests(pending || []);
        } else {
            setPendingRequests([]);
        }
    };

    const openGroupDetail = async (group) => {
        setSelectedGroup(group);
        setIsEditingGroup(false);
        await fetchGroupDetail(group);
    };

    const closeGroupDetail = () => {
        setSelectedGroup(null);
        setGroupMembers([]);
        setPendingRequests([]);
        setIsEditingGroup(false);
    };

    // 참여 신청
    const handleJoinRequest = async (groupId) => {
        if (!user) return alert('로그인이 필요합니다.');

        const { error } = await supabase
            .from('study_group_members')
            .insert([{ group_id: groupId, user_id: user.id, status: 'pending' }]);

        if (error) {
            if (error.code === '23505') {
                alert('이미 신청한 그룹입니다.');
            } else {
                console.error(error);
                alert('참여 신청 중 오류가 발생했습니다.');
            }
        } else {
            alert('참여 신청이 완료되었습니다! 방장의 승인을 기다려주세요.');
            fetchMyMemberships();
        }
    };

    // 그룹 탈퇴
    const handleLeaveGroup = async (groupId) => {
        if (!confirm('정말 이 그룹에서 탈퇴하시겠습니까?')) return;

        const { error } = await supabase
            .from('study_group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('user_id', user.id);

        if (!error) {
            alert('그룹에서 탈퇴했습니다.');
            fetchMyMemberships();
            fetchStudyGroups();
            if (selectedGroup?.id === groupId) {
                await fetchGroupDetail(selectedGroup);
            }
        }
    };

    // 멤버 승인
    const handleApprove = async (memberId, groupId) => {
        const { error } = await supabase
            .from('study_group_members')
            .update({ status: 'approved' })
            .eq('id', memberId);

        if (!error) {
            await fetchGroupDetail(selectedGroup);
            fetchStudyGroups();
            // 최신 그룹 정보 반영
            const { data: updatedGroup } = await supabase
                .from('study_groups')
                .select('*, profiles!study_groups_owner_id_fkey(username, avatar_url, is_admin)')
                .eq('id', groupId)
                .single();
            if (updatedGroup) setSelectedGroup(updatedGroup);
        }
    };

    // 멤버 거절
    const handleReject = async (memberId) => {
        const { error } = await supabase
            .from('study_group_members')
            .update({ status: 'rejected' })
            .eq('id', memberId);

        if (!error) {
            await fetchGroupDetail(selectedGroup);
        }
    };

    // 멤버 강퇴
    const handleKick = async (memberId, groupId) => {
        if (!confirm('이 멤버를 강퇴하시겠습니까?')) return;

        const { error } = await supabase
            .from('study_group_members')
            .delete()
            .eq('id', memberId);

        if (!error) {
            await fetchGroupDetail(selectedGroup);
            fetchStudyGroups();
            const { data: updatedGroup } = await supabase
                .from('study_groups')
                .select('*, profiles!study_groups_owner_id_fkey(username, avatar_url, is_admin)')
                .eq('id', groupId)
                .single();
            if (updatedGroup) setSelectedGroup(updatedGroup);
        }
    };

    // 모집 마감
    const handleCloseGroup = async (groupId) => {
        if (!confirm('모집을 마감하시겠습니까? 목록에서 더 이상 표시되지 않습니다.')) return;

        const { error } = await supabase
            .from('study_groups')
            .update({ is_active: false })
            .eq('id', groupId);

        if (error) {
            alert('모집 마감 중 오류가 발생했습니다.');
            return;
        }

        // 즉시 모달 닫기 (사용자 경험 향상)
        closeGroupDetail();

        // 배경에서 목록 새로고침
        fetchStudyGroups();
    };

    // 그룹 정보 수정 시작
    const startEditGroup = () => {
        setEditForm({
            title: selectedGroup.title,
            description: selectedGroup.description || '',
            tech_tags: selectedGroup.tech_tags?.join(', ') || '',
            open_chat_url: selectedGroup.open_chat_url || '',
            max_members: selectedGroup.max_members
        });
        setIsEditingGroup(true);
    };

    // 그룹 정보 저장
    const handleUpdateGroup = async () => {
        const tags = editForm.tech_tags.split(',').map(t => t.trim()).filter(t => t);

        const { error } = await supabase
            .from('study_groups')
            .update({
                title: editForm.title,
                description: editForm.description,
                tech_tags: tags,
                open_chat_url: editForm.open_chat_url,
                max_members: editForm.max_members
            })
            .eq('id', selectedGroup.id);

        if (!error) {
            const { data: updatedGroup } = await supabase
                .from('study_groups')
                .select('*, profiles!study_groups_owner_id_fkey(username, avatar_url, is_admin)')
                .eq('id', selectedGroup.id)
                .single();
            if (updatedGroup) setSelectedGroup(updatedGroup);
            setIsEditingGroup(false);
            fetchStudyGroups();
        }
    };

    const handleCreateGroup = async () => {
        if (!user) return alert('로그인이 필요합니다.');
        if (!newGroup.title || !newGroup.open_chat_url) return alert('제목과 오픈채팅방 주소는 필수입니다.');

        const tags = newGroup.tech_tags.split(',').map(t => t.trim()).filter(t => t);

        const { error } = await supabase
            .from('study_groups')
            .insert([{
                title: newGroup.title,
                description: newGroup.description,
                tech_tags: tags,
                open_chat_url: newGroup.open_chat_url,
                owner_id: user.id,
                max_members: newGroup.max_members
            }]);

        if (error) {
            console.error(error);
            alert('그룹 생성 중 오류가 발생했습니다.');
        } else {
            alert('바이브 메이트 모집을 시작합니다!');
            setIsCreating(false);
            setNewGroup({ title: '', description: '', tech_tags: '', open_chat_url: '', max_members: 4 });
            fetchStudyGroups();
        }
    };

    // 내 참여 상태에 따른 배지 렌더링
    const getStatusBadge = (groupId, ownerId) => {
        if (user && ownerId === user.id) {
            return <span style={{ ...badgeStyle, background: 'rgba(234, 179, 8, 0.15)', color: '#eab308' }}>내 그룹</span>;
        }
        const status = myMemberships[groupId];
        if (status === 'approved') {
            return <span style={{ ...badgeStyle, background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>참여중</span>;
        }
        if (status === 'pending') {
            return <span style={{ ...badgeStyle, background: 'rgba(251, 146, 60, 0.15)', color: '#fb923c' }}>신청중</span>;
        }
        return null;
    };

    // 상세 모달에서 참여 버튼 렌더링
    const renderActionButton = () => {
        if (!selectedGroup) return null;
        const isOwner = user && selectedGroup.owner_id === user.id;
        const status = myMemberships[selectedGroup.id];
        const isFull = selectedGroup.current_members >= selectedGroup.max_members;

        if (!user) {
            return <button disabled style={{ ...actionBtnStyle, opacity: 0.5, cursor: 'not-allowed' }}>로그인 후 신청 가능</button>;
        }
        if (isOwner) return null; // 방장은 관리 버튼만 사용
        if (status === 'approved') {
            return <button onClick={() => handleLeaveGroup(selectedGroup.id)} style={{ ...actionBtnStyle, background: '#ef4444' }}>탈퇴하기</button>;
        }
        if (status === 'pending') {
            return <button disabled style={{ ...actionBtnStyle, opacity: 0.5, cursor: 'not-allowed', background: '#f59e0b' }}>승인 대기 중...</button>;
        }
        if (status === 'rejected') {
            return <button disabled style={{ ...actionBtnStyle, opacity: 0.5, cursor: 'not-allowed', background: '#64748b' }}>신청이 거절되었습니다</button>;
        }
        if (isFull) {
            return <button disabled style={{ ...actionBtnStyle, opacity: 0.5, cursor: 'not-allowed', background: '#64748b' }}>정원이 가득 찼습니다</button>;
        }
        return (
            <button onClick={() => handleJoinRequest(selectedGroup.id)} style={{ ...actionBtnStyle, background: '#6366f1' }}>
                <UserPlus size={18} /> 참여 신청하기
            </button>
        );
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', color: '#fff', paddingBottom: '100px' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
                    <span style={{ background: 'linear-gradient(to right, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Vibe Mate</span> & Study
                </h1>
                <p style={{ color: '#94a3b8' }}>혼자가 힘들 땐, 함께할 메이트를 찾아보세요.</p>
            </div>

            {/* 1. Now Coding (Active Users) */}
            <div style={{ marginBottom: '50px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }}></div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Now Coding List ({activeUsers.length}명 접속 중)</h3>
                </div>

                <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {activeUsers.map((u, i) => (
                        <div
                            key={u.user_id}
                            title={u.vibe_status}
                            onClick={() => openProfile(u.user_id)}
                            style={{ textAlign: 'center', minWidth: '80px', cursor: 'pointer' }}
                        >
                            <div style={{
                                width: '60px', height: '60px',
                                background: '#1e293b',
                                borderRadius: '50%',
                                border: `2px solid ${u.vibe_status === 'BURNING' ? '#f97316' : '#6366f1'}`,
                                margin: '0 auto 8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem',
                                position: 'relative'
                            }}>
                                {u.profiles?.avatar_url ? (
                                    <img src={u.profiles.avatar_url} alt={u.profiles.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                ) : (
                                    u.profiles?.username?.[0]
                                )}
                                <div style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    width: '12px', height: '12px',
                                    background: '#22c55e',
                                    borderRadius: '50%',
                                    border: '2px solid #0f172a'
                                }} />
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {u.profiles?.username}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{u.vibe_status}</div>
                        </div>
                    ))}
                    {activeUsers.length === 0 && <p style={{ color: '#64748b' }}>아직 출석한 멤버가 없습니다. 첫 깃발을 꽂아보세요!</p>}
                </div>
            </div>

            {/* 2. Study Groups */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Recruiting Mates</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    style={{
                        padding: '12px 24px',
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
                    }}
                >
                    <Plus size={20} /> 파티 만들기
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
                {studyGroups.map((group) => (
                    <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -5 }}
                        onClick={() => openGroupDetail(group)}
                        style={{
                            background: 'rgba(30, 41, 59, 0.4)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '20px',
                            padding: '24px',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{
                                    background: 'rgba(99, 102, 241, 0.1)',
                                    color: '#818cf8',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold'
                                }}>
                                    {group.current_members}/{group.max_members}명
                                </span>
                                {getStatusBadge(group.id, group.owner_id)}
                            </div>
                            <div
                                onClick={(e) => { e.stopPropagation(); openProfile(group.owner_id); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                            >
                                {group.profiles?.avatar_url && (
                                    <img src={group.profiles.avatar_url} alt="Owner" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                                )}
                                <span style={{ fontSize: '0.8rem', ...(isAdmin(group.profiles) ? ADMIN_NAME_STYLE : { color: '#64748b' }) }}>
                                    by {group.profiles?.username}
                                </span>
                                {isAdmin(group.profiles) && <span style={{ ...ADMIN_BADGE_STYLE, fontSize: '0.55rem' }}>운영자</span>}
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '10px' }}>{group.title}</h3>
                        <p style={{ color: '#cbd5e1', marginBottom: '20px', lineHeight: '1.5', height: '60px', overflow: 'hidden' }}>
                            {group.description || "설명이 없습니다."}
                        </p>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '15px', height: '30px', overflow: 'hidden' }}>
                            {group.tech_tags?.map((tag, i) => (
                                <span key={`${group.id}-${tag}-${i}`} style={{ fontSize: '0.8rem', color: '#94a3b8' }}>#{tag}</span>
                            ))}
                        </div>

                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            width: '100%', padding: '10px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            color: '#94a3b8'
                        }}>
                            <Users size={16} /> 클릭하여 상세 보기
                        </div>
                    </motion.div>
                ))}
            </div>

            {studyGroups.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                    <Users size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                    <p>아직 모집 중인 그룹이 없습니다.</p>
                    <p style={{ fontSize: '0.9rem' }}>첫 번째 파티를 만들어 보세요!</p>
                </div>
            )}

            {/* Group Detail Modal */}
            <AnimatePresence>
                {selectedGroup && (
                    <div
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            zIndex: 100
                        }}
                        onClick={(e) => { if (e.target === e.currentTarget) closeGroupDetail(); }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{
                                background: '#1e293b',
                                padding: '30px',
                                borderRadius: '24px',
                                width: '560px',
                                maxHeight: '85vh',
                                overflowY: 'auto',
                                border: '1px solid rgba(255,255,255,0.1)',
                                position: 'relative'
                            }}
                        >
                            {/* 닫기 버튼 */}
                            <button
                                onClick={closeGroupDetail}
                                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', zIndex: 10 }}
                            >
                                <X size={24} />
                            </button>

                            {/* Focus Cam 모드일 경우 그리드 표시 */}
                            {(isJoined && currentGroupId === selectedGroup.id) ? (
                                <div style={{ height: '600px' }}>
                                    <FocusCamGrid onClose={() => { }} />
                                    {/* onClose는 FocusCamGrid 내부 '나가기' 버튼으로 처리됨 */}
                                </div>
                            ) : (
                                <>

                                    {/* 그룹 헤더 */}
                                    {!isEditingGroup ? (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                <div
                                                    onClick={() => openProfile(selectedGroup.owner_id)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                                                >
                                                    {selectedGroup.profiles?.avatar_url && (
                                                        <img
                                                            src={selectedGroup.profiles.avatar_url}
                                                            alt="Owner"
                                                            className={isAdmin(selectedGroup.profiles) ? 'admin-avatar-animated' : ''}
                                                            style={{
                                                                width: '36px', height: '36px', borderRadius: '50%',
                                                                ...(isAdmin(selectedGroup.profiles) ? { border: '2px solid #a855f7' } : {}),
                                                            }}
                                                        />
                                                    )}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ fontSize: '0.85rem', ...(isAdmin(selectedGroup.profiles) ? ADMIN_NAME_STYLE : { color: '#94a3b8' }) }}>
                                                            by {selectedGroup.profiles?.username}
                                                        </span>
                                                        {isAdmin(selectedGroup.profiles) && <span style={{ ...ADMIN_BADGE_STYLE, fontSize: '0.55rem' }}>운영자</span>}
                                                    </div>
                                                </div>
                                                <span style={{
                                                    background: selectedGroup.current_members >= selectedGroup.max_members ? 'rgba(239, 68, 68, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                                    color: selectedGroup.current_members >= selectedGroup.max_members ? '#ef4444' : '#818cf8',
                                                    padding: '4px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {selectedGroup.current_members >= selectedGroup.max_members ? '마감' : '모집중'} {selectedGroup.current_members}/{selectedGroup.max_members}
                                                </span>
                                            </div>

                                            <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '16px', paddingRight: '40px' }}>
                                                {selectedGroup.title}
                                            </h2>

                                            <p style={{ color: '#cbd5e1', lineHeight: '1.6', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                                                {selectedGroup.description || "설명이 없습니다."}
                                            </p>

                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                                                {selectedGroup.tech_tags?.map((tag, i) => (
                                                    <span key={`${selectedGroup.id}-${tag}-${i}`} style={{
                                                        background: 'rgba(99, 102, 241, 0.1)',
                                                        color: '#a5b4fc',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '0.8rem'
                                                    }}>
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        /* 그룹 수정 폼 */
                                        <div style={{ marginBottom: '24px', paddingRight: '40px' }}>
                                            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px', color: '#f59e0b' }}>
                                                <Edit2 size={16} style={{ marginRight: '8px' }} />그룹 정보 수정
                                            </h3>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                <input
                                                    placeholder="제목"
                                                    value={editForm.title}
                                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                    style={inputStyle}
                                                />
                                                <textarea
                                                    placeholder="설명"
                                                    value={editForm.description}
                                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                    style={{ ...inputStyle, height: '80px', resize: 'none' }}
                                                />
                                                <input
                                                    placeholder="태그 (쉼표로 구분)"
                                                    value={editForm.tech_tags}
                                                    onChange={(e) => setEditForm({ ...editForm, tech_tags: e.target.value })}
                                                    style={inputStyle}
                                                />
                                                <input
                                                    placeholder="오픈채팅 링크"
                                                    value={editForm.open_chat_url}
                                                    onChange={(e) => setEditForm({ ...editForm, open_chat_url: e.target.value })}
                                                    style={inputStyle}
                                                />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <label style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>최대 인원:</label>
                                                    <input
                                                        type="number"
                                                        min="2"
                                                        max="50"
                                                        value={editForm.max_members}
                                                        onChange={(e) => setEditForm({ ...editForm, max_members: parseInt(e.target.value) || 4 })}
                                                        style={{ ...inputStyle, width: '80px' }}
                                                    />
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => setIsEditingGroup(false)} style={{ flex: 1, background: '#334155', color: '#cbd5e1', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>취소</button>
                                                    <button onClick={handleUpdateGroup} style={{ flex: 1, background: '#f59e0b', color: '#000', padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                        <Save size={16} /> 저장
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* 구분선 */}
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 20px' }}></div>

                                    {/* 멤버 목록 */}
                                    <div style={{ marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Users size={18} /> 멤버 ({groupMembers.length + 1}명)
                                        </h3>

                                        {/* 방장 */}
                                        <div style={{ ...memberRowStyle, background: 'rgba(234, 179, 8, 0.05)' }}>
                                            <div
                                                onClick={() => openProfile(selectedGroup.owner_id)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                            >
                                                {selectedGroup.profiles?.avatar_url ? (
                                                    <img src={selectedGroup.profiles.avatar_url} alt="Owner" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                                ) : (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                        {selectedGroup.profiles?.username?.[0]}
                                                    </div>
                                                )}
                                                <span style={{ fontWeight: 'bold' }}>{selectedGroup.profiles?.username}</span>
                                                <Crown size={14} style={{ color: '#eab308' }} />
                                                <span style={{ fontSize: '0.75rem', color: '#eab308' }}>방장</span>
                                            </div>
                                        </div>

                                        {/* 승인된 멤버 */}
                                        {groupMembers.map((member) => (
                                            <div key={member.id} style={memberRowStyle}>
                                                <div
                                                    onClick={() => openProfile(member.user_id)}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                                >
                                                    {member.profiles?.avatar_url ? (
                                                        <img src={member.profiles.avatar_url} alt={member.profiles.username} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                                    ) : (
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                            {member.profiles?.username?.[0]}
                                                        </div>
                                                    )}
                                                    <span>{member.profiles?.username}</span>
                                                </div>
                                                {user && selectedGroup.owner_id === user.id && (
                                                    <button
                                                        onClick={() => handleKick(member.id, selectedGroup.id)}
                                                        style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                    >
                                                        <UserMinus size={12} /> 강퇴
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {groupMembers.length === 0 && (
                                            <p style={{ color: '#64748b', fontSize: '0.85rem', padding: '8px 0' }}>아직 참여 멤버가 없습니다.</p>
                                        )}
                                    </div>

                                    {/* 방장 전용: 대기 중인 신청 */}
                                    {user && selectedGroup.owner_id === user.id && pendingRequests.length > 0 && (
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 16px' }}></div>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
                                                <UserPlus size={18} /> 참여 대기 ({pendingRequests.length}명)
                                            </h3>
                                            {pendingRequests.map((req) => (
                                                <div key={req.id} style={{ ...memberRowStyle, background: 'rgba(251, 146, 60, 0.05)' }}>
                                                    <div
                                                        onClick={() => openProfile(req.user_id)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                                                    >
                                                        {req.profiles?.avatar_url ? (
                                                            <img src={req.profiles.avatar_url} alt={req.profiles.username} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                                        ) : (
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                                {req.profiles?.username?.[0]}
                                                            </div>
                                                        )}
                                                        <span>{req.profiles?.username}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px' }}>
                                                        <button
                                                            onClick={() => handleApprove(req.id, selectedGroup.id)}
                                                            style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <Check size={12} /> 승인
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req.id)}
                                                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <XCircle size={12} /> 거절
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* 구분선 */}
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 20px' }}></div>

                                    {/* 하단 액션 영역 */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        {/* 오픈채팅 링크 (승인된 멤버 또는 방장만) */}
                                        {(user && (selectedGroup.owner_id === user.id || myMemberships[selectedGroup.id] === 'approved')) && selectedGroup.open_chat_url && (
                                            <a
                                                href={selectedGroup.open_chat_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                    width: '100%', padding: '12px',
                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                    color: '#818cf8',
                                                    textDecoration: 'none',
                                                    borderRadius: '12px',
                                                    fontWeight: 'bold',
                                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                                            >
                                                <MessageCircle size={18} /> 오픈채팅 참여 <ExternalLink size={14} />
                                            </a>
                                        )}

                                        {/* Focus Cam 버튼 (승인된 멤버 또는 방장만) */}
                                        {(user && (selectedGroup.owner_id === user.id || myMemberships[selectedGroup.id] === 'approved')) && (
                                            <button
                                                onClick={() => joinRoom(selectedGroup.id)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                    width: '100%', padding: '12px',
                                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '12px',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                                                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            >
                                                <Video size={18} /> Focus Cam (무언 코딩) 참여
                                            </button>
                                        )}

                                        {/* 참여 신청 / 상태 버튼 */}
                                        {renderActionButton()}

                                        {/* 방장 관리 버튼 */}
                                        {user && selectedGroup.owner_id === user.id && !isEditingGroup && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={startEditGroup}
                                                    style={{ flex: 1, background: 'rgba(251, 146, 60, 0.1)', color: '#fb923c', padding: '10px', borderRadius: '10px', border: '1px solid rgba(251, 146, 60, 0.2)', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                >
                                                    <Edit2 size={16} /> 수정
                                                </button>
                                                <button
                                                    onClick={() => handleCloseGroup(selectedGroup.id)}
                                                    style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '10px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                >
                                                    <Lock size={16} /> 모집 마감
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div >
                )
                }
            </AnimatePresence >

            {/* Create Group Modal */}
            {
                isCreating && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 100
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', width: '500px', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>새 파티 모집하기</h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input
                                    placeholder="스터디 주제 / 모각코 제목"
                                    value={newGroup.title}
                                    onChange={(e) => setNewGroup({ ...newGroup, title: e.target.value })}
                                    style={inputStyle}
                                />
                                <textarea
                                    placeholder="어떤 활동을 하나요? (시간, 장소, 목표 등)"
                                    value={newGroup.description}
                                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                                    style={{ ...inputStyle, height: '100px', resize: 'none' }}
                                />
                                <input
                                    placeholder="태그 (예: React, 모각코, 초보)"
                                    value={newGroup.tech_tags}
                                    onChange={(e) => setNewGroup({ ...newGroup, tech_tags: e.target.value })}
                                    style={inputStyle}
                                />
                                <input
                                    placeholder="카카오톡 오픈채팅방 링크 URL"
                                    value={newGroup.open_chat_url}
                                    onChange={(e) => setNewGroup({ ...newGroup, open_chat_url: e.target.value })}
                                    style={inputStyle}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ color: '#cbd5e1' }}>최대 인원:</label>
                                    <input
                                        type="number"
                                        min="2" max="50"
                                        value={newGroup.max_members}
                                        onChange={(e) => setNewGroup({ ...newGroup, max_members: e.target.value })}
                                        style={{ ...inputStyle, width: '80px' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <button onClick={() => setIsCreating(false)} style={{ flex: 1, background: '#334155', color: '#cbd5e1', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>취소</button>
                                <button onClick={handleCreateGroup} style={{ flex: 1, background: '#6366f1', color: 'white', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>모집 시작</button>
                            </div>
                        </motion.div>
                    </div>
                )
            }

            <ProfileSummaryModal
                userId={selectedUserId}
                isOpen={!!selectedUserId}
                onClose={() => { setSelectedUserId(null); setAnchorPos(null); }}
                anchorPos={anchorPos}
            />
        </div >
    );
};

// 스타일 상수
const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.2)',
    color: 'white',
    outline: 'none'
};

const memberRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '10px',
    marginBottom: '6px'
};

const badgeStyle = {
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '0.7rem',
    fontWeight: 'bold'
};

const actionBtnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    color: '#fff',
    borderRadius: '12px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.95rem'
};

export default StudyGroup;
