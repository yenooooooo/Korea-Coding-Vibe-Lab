import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
    User, MapPin, Link as LinkIcon, Github, Globe,
    Edit2, Save, X, Trophy, Flame, Sparkles, MessageSquare
} from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const [badges, setBadges] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [isNicknameUnlocked, setIsNicknameUnlocked] = useState(false);
    const [editForm, setEditForm] = useState({
        nickname: '',
        bio: '',
        tech_stack: '', // Comma separated string for input
        github_url: '',
        blog_url: ''
    });

    // Avatar Selection State
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');

    // DiceBear Avatar Styles
    const avatarStyles = [
        "https://api.dicebear.com/9.x/adventurer/svg?seed=Felix",
        "https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka",
        "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Mario",
        "https://api.dicebear.com/9.x/fun-emoji/svg?seed=Luigi",
        "https://api.dicebear.com/9.x/bottts/svg?seed=Robot1",
        "https://api.dicebear.com/9.x/bottts/svg?seed=Robot2",
        "https://api.dicebear.com/9.x/lorelei/svg?seed=Artist",
        "https://api.dicebear.com/9.x/lorelei/svg?seed=Muse",
        "https://api.dicebear.com/9.x/notionists/svg?seed=Coder",
        "https://api.dicebear.com/9.x/notionists/svg?seed=Designer"
    ];







    useEffect(() => {
        if (user) {
            fetchProfileData();
        }
    }, [user]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileError) throw profileError;

            // 2. Fetch Badges
            const { data: badgeData, error: badgeError } = await supabase
                .from('user_badges')
                .select('badge_id, awarded_at, badges(*)')
                .eq('user_id', user.id);

            if (badgeError) throw badgeError;

            // 3. Fetch Attendance (For Heatmap)
            const { data: attendanceData, error: attendanceError } = await supabase
                .from('attendance')
                .select('check_in_date, vibe_status')
                .eq('user_id', user.id)
                .gte('check_in_date', new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString());

            if (attendanceError) throw attendanceError;

            setProfile(profileData);
            setBadges(badgeData || []);
            setAttendanceHistory(attendanceData || []);

            // Init Edit Form
            setEditForm({
                nickname: profileData.nickname || '',
                bio: profileData.bio || '',
                tech_stack: profileData.tech_stack ? profileData.tech_stack.join(', ') : '',
                github_url: profileData.github_url || '',
                blog_url: profileData.blog_url || ''
            });

            setAvatarUrl(profileData.avatar_url || '');

        } catch (error) {
            console.error('Error fetching profile:', error);
            // alert('프로필 정보를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            const updates = {
                bio: editForm.bio,
                tech_stack: editForm.tech_stack.split(',').map(tag => tag.trim()).filter(t => t),
                github_url: editForm.github_url,
                blog_url: editForm.blog_url,
                updated_at: new Date()
            };

            // Only include nickname if it was unlocked and changed
            if (isNicknameUnlocked) {
                updates.nickname = editForm.nickname;
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            setProfile({ ...profile, ...updates });
            setIsEditing(false);
            setIsNicknameUnlocked(false); // Reset unlock state
            alert('프로필 정보가 업데이트되었습니다! ✨');

        } catch (error) {
            console.error('Error updating profile:', error);
            alert('업데이트 중 오류가 발생했습니다.');
        }
    };

    // Independent Avatar Update
    const handleSelectAvatar = async (url) => {
        try {
            // 1. Optimistic UI Update
            setProfile(prev => ({ ...prev, avatar_url: url }));
            setAvatarUrl(url);
            setShowAvatarModal(false); // Close modal immediately

            // 2. Background Save
            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: url, updated_at: new Date() })
                .eq('id', user.id);

            if (error) {
                console.error('Error saving avatar:', error);
                alert('아바타 저장에 실패했습니다.');
                fetchProfileData();
            }
        } catch (error) {
            console.error('Error saving avatar:', error);
        }
    };

    // Calculate Heatmap Data
    const getHeatmapData = () => {
        const yearDays = [];
        const today = new Date();
        const startDate = new Date();
        startDate.setFullYear(today.getFullYear() - 1);

        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const record = attendanceHistory.find(r => r.check_in_date === dateStr);
            yearDays.push({ date: dateStr, record });
        }
        return yearDays;
    };
    const heatmapData = getHeatmapData();

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading Profile...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#fff', paddingBottom: '100px' }}>

            {/* Top Banner (Gradient) */}
            <div style={{
                height: '200px',
                background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)',
                borderRadius: '24px',
                marginBottom: '-60px',
                position: 'relative'
            }}></div>

            {/* Profile Info Section */}
            <div style={{ padding: '0 40px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '120px', height: '120px',
                            background: '#1e293b',
                            borderRadius: '50%',
                            border: '4px solid #0f172a',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '3rem',
                            position: 'relative',
                            zIndex: 10
                        }}>
                            {profile?.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt="Avatar"
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                profile?.nickname?.[0] || <User />
                            )}
                            <button
                                onClick={() => setShowAvatarModal(true)}
                                style={{
                                    position: 'absolute', bottom: 0, right: 0,
                                    background: '#3b82f6', border: 'none', borderRadius: '50%',
                                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                                }}
                            >
                                <Edit2 size={16} color="white" />
                            </button>
                        </div>

                        {/* Name & Bio */}
                        <div style={{ paddingBottom: '10px' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {profile?.nickname}
                                <span style={{
                                    fontSize: '0.8rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    color: '#94a3b8'
                                }}>
                                    Lv. {Math.floor((profile?.message_count || 0) / 10) + 1}
                                </span>
                            </h1>
                            <p style={{ color: '#cbd5e1', marginTop: '4px', maxWidth: '500px' }}>
                                {profile?.bio || "아직 자기소개가 없습니다. 멋진 바이브를 보여주세요!"}
                            </p>
                        </div>
                    </div>

                    {/* Links & Edit */}
                    <div style={{ display: 'flex', gap: '10px', paddingBottom: '10px' }}>
                        {profile?.github_url && (
                            <a href={profile.github_url} target="_blank" rel="noopener noreferrer" style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }}>
                                <Github size={20} />
                            </a>
                        )}
                        {profile?.blog_url && (
                            <a href={profile.blog_url} target="_blank" rel="noopener noreferrer" style={{ padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', color: '#fff' }}>
                                <Globe size={20} />
                            </a>
                        )}
                        <button
                            onClick={() => setIsEditing(true)}
                            style={{
                                padding: '10px 20px',
                                background: '#facc15',
                                color: '#000',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}
                        >
                            <Edit2 size={16} /> 프로필 수정
                        </button>
                    </div>
                </div>

                {/* Tech Stack Tags */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap' }}>
                    {profile?.tech_stack?.map((tech, i) => (
                        <span key={i} style={{
                            background: 'rgba(99, 102, 241, 0.2)',
                            color: '#a5b4fc',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '0.9rem',
                            border: '1px solid rgba(99, 102, 241, 0.4)'
                        }}>
                            #{tech}
                        </span>
                    ))}
                    {!profile?.tech_stack?.length && (
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>#Tech_Stack을_추가해보세요</span>
                    )}
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                    <StatCard icon={<Flame color="#f97316" />} label="연속 출석" value={`${profile?.current_streak || 0}일`} desc="최대 기록: 100일" />
                    <StatCard icon={<Sparkles color="#facc15" />} label="바이브 포인트" value={`${profile?.total_points || 0} P`} desc="상위 10%" />
                    <StatCard icon={<MessageSquare color="#2dd4bf" />} label="커뮤니티 활동" value={`${profile?.message_count || 0}회`} desc="게시글 + 댓글" />
                    <StatCard icon={<Trophy color="#a855f7" />} label="획득 뱃지" value={`${badges.length}개`} desc="수집률 20%" />
                </div>

                {/* Badges Section */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>🏆 획득한 뱃지</h3>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {badges.length > 0 ? badges.map(({ badges: badge }, i) => (
                            <div key={i} title={badge.description} style={{ textAlign: 'center' }}>
                                <div style={{
                                    width: '60px', height: '60px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '2rem',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    marginBottom: '8px',
                                    cursor: 'help'
                                }}>
                                    {badge.icon}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{badge.name}</div>
                            </div>
                        )) : (
                            <p style={{ color: '#64748b' }}>아직 획득한 뱃지가 없습니다. 활동을 시작해보세요!</p>
                        )}
                    </div>
                </div>

                {/* Heatmap Section */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>📅 마이 바이브 로그</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {heatmapData.map((day, i) => (
                            <div
                                key={i}
                                title={`${day.date}: ${day.record ? day.record.vibe_status : '기록 없음'}`}
                                style={{
                                    width: '12px', height: '12px', borderRadius: '2px',
                                    background: day.record ?
                                        (day.record.vibe_status === 'BURNING' ? '#f97316' :
                                            day.record.vibe_status === 'CHILL' ? '#2dd4bf' :
                                                day.record.vibe_status === 'DEBUGGING' ? '#ef4444' : '#a855f7')
                                        : 'rgba(255,255,255,0.05)',
                                    opacity: day.record ? 1 : 0.4
                                }}
                            />
                        ))}
                    </div>
                </div>

            </div>

            {/* Avatar Selection Modal */}
            {showAvatarModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 110
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', width: '500px', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '80vh', overflowY: 'auto' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>아바타 선택</h2>
                            <button onClick={() => setShowAvatarModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                            {avatarStyles.map((url, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleSelectAvatar(url)}
                                    style={{
                                        cursor: 'pointer',
                                        borderRadius: '12px',
                                        overflow: 'hidden',
                                        border: avatarUrl === url ? '2px solid #facc15' : '2px solid transparent',
                                        transition: 'all 0.2s',
                                        background: 'rgba(255,255,255,0.05)'
                                    }}
                                >
                                    <img src={url} alt={`Avatar ${i}`} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                        <p style={{ textAlign: 'center', marginTop: '20px', color: '#64748b', fontSize: '0.9rem' }}>
                            Powered by DiceBear 🎲
                        </p>
                    </motion.div>
                </div>
            )}

            {/* Edit Profile Modal */}
            {isEditing && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ background: '#1e293b', padding: '30px', borderRadius: '24px', width: '500px', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>프로필 수정</h2>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Nickname Field with Lock */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>닉네임</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        value={editForm.nickname}
                                        onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                                        disabled={!isNicknameUnlocked}
                                        style={{
                                            flex: 1,
                                            background: isNicknameUnlocked ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.05)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            color: isNicknameUnlocked ? 'white' : '#64748b',
                                            outline: 'none',
                                            cursor: isNicknameUnlocked ? 'text' : 'not-allowed'
                                        }}
                                    />
                                    <button
                                        onClick={() => setIsNicknameUnlocked(!isNicknameUnlocked)}
                                        style={{
                                            background: isNicknameUnlocked ? '#ef4444' : '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '0 12px',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            width: '60px'
                                        }}
                                    >
                                        {isNicknameUnlocked ? '취소' : '변경'}
                                    </button>
                                </div>
                            </div>

                            <InputField label="한줄 소개 (Bio)" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} />
                            <InputField label="기술 스택 (쉼표로 구분, 예: React, AI)" value={editForm.tech_stack} onChange={(e) => setEditForm({ ...editForm, tech_stack: e.target.value })} />
                            <InputField label="GitHub 주소" value={editForm.github_url} onChange={(e) => setEditForm({ ...editForm, github_url: e.target.value })} />
                            <InputField label="블로그 주소" value={editForm.blog_url} onChange={(e) => setEditForm({ ...editForm, blog_url: e.target.value })} />
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                            <button onClick={handleUpdateProfile} style={{ flex: 1, background: '#6366f1', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <Save size={18} /> 저장하기
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

        </div>
    );
};

const StatCard = ({ icon, label, value, desc }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ marginBottom: '10px' }}>{icon}</div>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{desc}</div>
    </div>
);

const InputField = ({ label, value, onChange }) => (
    <div>
        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>{label}</label>
        <input
            type="text"
            value={value}
            onChange={onChange}
            style={{
                width: '100%',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '12px',
                borderRadius: '8px',
                color: 'white',
                outline: 'none'
            }}
        />
    </div>
);

export default Profile;
