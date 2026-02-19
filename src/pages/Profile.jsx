import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import {
    User, MapPin, Link as LinkIcon, Github, Globe,
    Edit2, Save, X, Trophy, Flame, Sparkles, MessageSquare, Lock, Gem
} from 'lucide-react';
import IdentitySelector from '../components/IdentitySelector';
import SkillBadge from '../components/SkillBadge';
import { getVibeLevel } from '../utils/vibeLevel';
import { fetchEquippedDetails, VibeName, getBannerStyle } from '../utils/vibeItems.jsx';
import LevelGuideModal from '../components/LevelGuideModal';
import PointGuideModal from '../components/PointGuideModal';
import UserJourneyIntegration from '../components/UserJourneyIntegration';

const Profile = () => {
    const { user, profile: authProfile } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);

    const [profile, setProfile] = useState(null);
    const [badges, setBadges] = useState([]);       // 획득한 뱃지
    const [allBadges, setAllBadges] = useState([]);  // 전체 뱃지 목록
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [newBadge, setNewBadge] = useState(null);  // 새 뱃지 획득 알림용
    const [seasonProgress, setSeasonProgress] = useState(null); // 시즌 패스 진척도

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [isNicknameUnlocked, setIsNicknameUnlocked] = useState(false);
    const [editForm, setEditForm] = useState({
        nickname: '',
        bio: '',
        tech_stack: '', // Comma separated string for input
        github_url: '',
        blog_url: '',
        main_skill: '',
        learning_skill: ''
    });

    const [equippedDetails, setEquippedDetails] = useState({});
    const [showLevelGuide, setShowLevelGuide] = useState(false);
    const [showPointGuide, setShowPointGuide] = useState(false);

    useEffect(() => {
        if (profile?.equipped_items) {
            fetchEquippedDetails(supabase, profile.equipped_items).then(setEquippedDetails);
        } else {
            setEquippedDetails({});
        }
    }, [profile?.equipped_items]);

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

    // AuthContext Realtime 동기화: 관리자 포인트 지급 등 외부 변경 즉시 반영
    useEffect(() => {
        if (authProfile && profile) {
            setProfile(prev => prev ? { ...prev, total_points: authProfile.total_points } : prev);
        }
    }, [authProfile?.total_points]);

    const fetchProfileData = async () => {
        try {
            setLoading(true);

            // Parallel Fetching
            const [
                { data: profileData, error: profileError },
                { data: badgeData, error: badgeError },
                { data: allBadgeData, error: allBadgeError },
                { data: attendanceData, error: attendanceError },
                { data: seasonData, error: seasonError }
            ] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('user_badges').select('badge_id, awarded_at, badges(*)').eq('user_id', user.id),
                supabase.from('badges').select('*'),
                supabase.from('attendance').select('check_in_date, vibe_status').eq('user_id', user.id).gte('check_in_date', new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString()),
                supabase.from('user_season_progress').select('is_premium, current_tier').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).maybeSingle()
            ]);

            if (profileError) throw profileError;
            if (badgeError) throw badgeError;
            if (allBadgeError) throw allBadgeError;
            if (attendanceError) throw attendanceError;

            setProfile(profileData);
            setBadges(badgeData || []);
            setAllBadges(allBadgeData || []);
            setAttendanceHistory(attendanceData || []);
            setSeasonProgress(seasonData);

            // 새 뱃지 획득 감지 (localStorage 비교)
            const earnedIds = (badgeData || []).map(b => b.badge_id);
            const prevIds = JSON.parse(localStorage.getItem(`badges_${user.id}`) || '[]');
            const newlyEarned = earnedIds.filter(id => !prevIds.includes(id));
            if (newlyEarned.length > 0 && prevIds.length > 0) {
                const newBadgeInfo = (allBadgeData || []).find(b => b.id === newlyEarned[0]);
                if (newBadgeInfo) setNewBadge(newBadgeInfo);
            }
            localStorage.setItem(`badges_${user.id}`, JSON.stringify(earnedIds));

            // Init Edit Form
            setEditForm({
                nickname: profileData.nickname || '',
                bio: profileData.bio || '',
                tech_stack: profileData.tech_stack ? profileData.tech_stack.join(', ') : '',
                github_url: profileData.github_url || '',
                blog_url: profileData.blog_url || '',
                main_skill: profileData.main_skill || '',
                learning_skill: profileData.learning_skill || ''
            });

            setAvatarUrl(profileData.avatar_url || '');

        } catch (error) {
            console.error('Error fetching profile:', error);
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
                main_skill: editForm.main_skill,
                learning_skill: editForm.learning_skill,
                updated_at: new Date()
            };

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
            setIsNicknameUnlocked(false);
            addToast('프로필 정보가 업데이트되었습니다! ✨', 'success');

        } catch (error) {
            console.error('Error updating profile:', error);
            addToast('업데이트 중 오류가 발생했습니다.', 'error');
        }
    };

    const handleSelectAvatar = async (url) => {
        try {
            setProfile(prev => ({ ...prev, avatar_url: url }));
            setAvatarUrl(url);
            setShowAvatarModal(false);

            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: url, updated_at: new Date() })
                .eq('id', user.id);

            if (error) {
                console.error('Error saving avatar:', error);
                addToast('아바타 저장에 실패했습니다.', 'error');
                fetchProfileData();
            } else {
                addToast('아바타가 변경되었습니다!', 'success');
            }
        } catch (error) {
            console.error('Error saving avatar:', error);
        }
    };

    const heatmapData = React.useMemo(() => {
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
    }, [attendanceHistory]);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading Profile...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', color: '#fff', paddingBottom: '100px' }}>

            {/* Top Banner (Gradient) */}
            <div style={{
                height: '200px',
                background: getBannerStyle(equippedDetails.banner),
                borderRadius: '24px',
                position: 'relative',
                transition: 'background 0.5s ease'
            }}></div>

            {/* Profile Info Section */}
            <div style={{ padding: '0 40px', marginTop: '-60px' }}>
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
                            {equippedDetails.avatar?.item_data?.icon ? (
                                <div style={{ fontSize: '4rem' }}>{equippedDetails.avatar.item_data.icon}</div>
                            ) : profile?.avatar_url ? (
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
                        <div style={{ paddingBottom: '0px', paddingTop: '70px', position: 'relative', zIndex: 10 }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <VibeName name={profile?.nickname} effectItem={equippedDetails.name_effect} />
                                {(() => {
                                    const levelInfo = getVibeLevel(profile?.total_points || 0);
                                    return (
                                        <motion.span
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowLevelGuide(true)}
                                            style={{
                                                fontSize: '0.8rem',
                                                background: `${levelInfo.color}20`,
                                                border: `1px solid ${levelInfo.color}40`,
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                color: levelInfo.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                cursor: 'pointer',
                                                boxShadow: `0 0 10px ${levelInfo.color}10`
                                            }}
                                        >
                                            {levelInfo.icon} Lv.{levelInfo.level} {levelInfo.title}
                                        </motion.span>
                                    );
                                })()}
                                <div style={{ display: 'flex', gap: '6px', marginLeft: '6px' }}>
                                    <SkillBadge skill={profile?.main_skill} type="main" size="md" />
                                    <SkillBadge skill={profile?.learning_skill} type="learning" size="md" />
                                </div>
                                {seasonProgress?.is_premium && (
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                        padding: '4px 10px', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, rgba(250,204,21,0.2), rgba(245,158,11,0.2))',
                                        border: '1px solid rgba(250, 204, 21, 0.4)',
                                        color: '#facc15', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '6px'
                                    }}>
                                        <Gem size={12} /> PREMIUM PASS
                                    </div>
                                )}
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
                    <StatCard icon={<Flame color="#f97316" />} label="연속 출석" value={`${profile?.current_streak || 0}일`} desc={`최대 기록: ${profile?.max_streak || 0}일`} />
                    <div style={{ position: 'relative' }}>
                        <StatCard icon={<Sparkles color="#facc15" />} label="바이브 포인트" value={`${profile?.total_points || 0} P`} desc="활동으로 적립" />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowPointGuide(true);
                            }}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            i
                        </motion.button>
                    </div>
                    <StatCard icon={<MessageSquare color="#2dd4bf" />} label="커뮤니티 활동" value={`${profile?.message_count || 0}회`} desc="게시글 + 댓글" />
                    <StatCard icon={<Trophy color="#a855f7" />} label="획득 뱃지" value={`${badges.length}개`} desc={`${badges.length}/${allBadges.length}개 수집`} />
                </div>

                {/* Badges Section */}
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                            🏆 뱃지 컬렉션
                        </h3>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                            {badges.length}/{allBadges.length}개 획득
                        </span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', height: '6px', marginBottom: '24px', overflow: 'hidden' }}>
                        <div style={{
                            width: allBadges.length > 0 ? `${(badges.length / allBadges.length) * 100}%` : '0%',
                            height: '100%',
                            background: 'linear-gradient(to right, #6366f1, #a855f7)',
                            borderRadius: '8px',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                        {allBadges.map((badge) => {
                            const earned = badges.find(b => b.badge_id === badge.id);
                            const progress = getBadgeProgress(badge, profile);
                            return (
                                <BadgeCard
                                    key={badge.id}
                                    badge={badge}
                                    earned={earned}
                                    progress={progress}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Vibe Flow Timeline - Last 7 Days */}
                <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '24px', color: '#fff', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>⚡</span>
                        최근 7일 바이브 흐름
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1 }}>
                        {(() => {
                            const last7Days = [];
                            for (let i = 6; i >= 0; i--) {
                                const date = new Date();
                                date.setDate(date.getDate() - i);
                                const dateStr = date.toISOString().split('T')[0];
                                const record = attendanceHistory.find(r => r.check_in_date === dateStr);
                                last7Days.push({ date: dateStr, record, dayName: ['일', '월', '화', '수', '목', '금', '토'][date.getDay()] });
                            }

                            return last7Days.map((day, idx) => {
                                const isToday = idx === 6;
                                let vibeColor = '#64748b';
                                let vibeEmoji = '⚫';
                                let vibeText = '휴식';
                                let glowColor = 'rgba(100, 116, 139, 0.3)';

                                if (day.record) {
                                    switch (day.record.vibe_status) {
                                        case 'BURNING':
                                            vibeColor = '#f97316';
                                            vibeEmoji = '🔥';
                                            vibeText = 'Burning';
                                            glowColor = 'rgba(249, 115, 22, 0.4)';
                                            break;
                                        case 'CHILL':
                                            vibeColor = '#2dd4bf';
                                            vibeEmoji = '☕';
                                            vibeText = 'Chill';
                                            glowColor = 'rgba(45, 212, 191, 0.4)';
                                            break;
                                        case 'DEBUGGING':
                                            vibeColor = '#ef4444';
                                            vibeEmoji = '🐛';
                                            vibeText = 'Debugging';
                                            glowColor = 'rgba(239, 68, 68, 0.4)';
                                            break;
                                        case 'LEARNING':
                                            vibeColor = '#a855f7';
                                            vibeEmoji = '📚';
                                            vibeText = 'Learning';
                                            glowColor = 'rgba(168, 85, 247, 0.4)';
                                            break;
                                    }
                                }

                                return (
                                    <motion.div
                                        key={day.date}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            padding: '14px 18px',
                                            borderRadius: '16px',
                                            background: isToday ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                            border: isToday ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.08)' }}
                                    >
                                        <div style={{ minWidth: '70px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '2px' }}>{day.dayName}요일</div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: isToday ? '#6366f1' : '#cbd5e1' }}>
                                                {new Date(day.date).getMonth() + 1}/{new Date(day.date).getDate()}
                                            </div>
                                        </div>

                                        <motion.div
                                            animate={day.record ? { scale: [1, 1.2, 1] } : {}}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                background: `linear-gradient(135deg, ${vibeColor}, ${vibeColor}dd)`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem',
                                                boxShadow: day.record ? `0 0 20px ${glowColor}` : 'none',
                                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                                opacity: day.record ? 1 : 0.4
                                            }}
                                        >
                                            {vibeEmoji}
                                        </motion.div>

                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '4px' }}>
                                                {day.record ? vibeText : '쉬는 날'}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                {day.record ? '+10 Points 획득' : '출석하지 않음'}
                                            </div>
                                        </div>

                                        <div style={{ width: '80px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: day.record ? '100%' : '0%',
                                                height: '100%',
                                                background: `linear-gradient(to right, ${vibeColor}, ${vibeColor}cc)`,
                                                borderRadius: '3px',
                                                transition: 'width 0.5s ease'
                                            }} />
                                        </div>
                                    </motion.div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* Heatmap Section - 3D Glassmorphism */}
                <div style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))', borderRadius: '24px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-40%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15), transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', color: '#fff', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.4rem' }}>📅</span>
                        마이 바이브 로그 (1년)
                    </h3>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', position: 'relative', zIndex: 1 }}>
                        {heatmapData.map((day, i) => {
                            let bg = 'rgba(255,255,255,0.05)';
                            let glow = 'none';
                            let vibeLabel = '기록 없음';

                            if (day.record) {
                                switch (day.record.vibe_status) {
                                    case 'BURNING':
                                        bg = 'linear-gradient(135deg, #f97316, #fb923c)';
                                        glow = '0 0 10px rgba(249, 115, 22, 0.5)';
                                        vibeLabel = '🔥 Burning';
                                        break;
                                    case 'CHILL':
                                        bg = 'linear-gradient(135deg, #2dd4bf, #5eead4)';
                                        glow = '0 0 10px rgba(45, 212, 191, 0.5)';
                                        vibeLabel = '☕ Chill';
                                        break;
                                    case 'DEBUGGING':
                                        bg = 'linear-gradient(135deg, #ef4444, #f87171)';
                                        glow = '0 0 10px rgba(239, 68, 68, 0.5)';
                                        vibeLabel = '🐛 Debugging';
                                        break;
                                    case 'LEARNING':
                                        bg = 'linear-gradient(135deg, #a855f7, #c084fc)';
                                        glow = '0 0 10px rgba(168, 85, 247, 0.5)';
                                        vibeLabel = '📚 Learning';
                                        break;
                                    default:
                                        bg = 'linear-gradient(135deg, #6366f1, #818cf8)';
                                        glow = '0 0 10px rgba(99, 102, 241, 0.5)';
                                        vibeLabel = '✨ Vibe';
                                }
                            }

                            return (
                                <motion.div
                                    key={i}
                                    whileHover={{
                                        scale: day.record ? 1.4 : 1.1,
                                        zIndex: 10,
                                        transition: { duration: 0.2 }
                                    }}
                                    title={`${day.date}\n${vibeLabel}\n${day.record ? '+10 Points' : ''}`}
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '3px',
                                        background: bg,
                                        opacity: day.record ? 1 : 0.4,
                                        boxShadow: day.record ? glow : 'none',
                                        border: day.record ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
                                        cursor: 'pointer',
                                        backdropFilter: 'blur(4px)',
                                        transition: 'all 0.2s ease'
                                    }}
                                />
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginTop: '20px', fontSize: '0.8rem', color: '#cbd5e1', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #f97316, #fb923c)', borderRadius: '3px', boxShadow: '0 0 6px rgba(249, 115, 22, 0.4)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                            <span>🔥 Burning</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #2dd4bf, #5eead4)', borderRadius: '3px', boxShadow: '0 0 6px rgba(45, 212, 191, 0.4)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                            <span>☕ Chill</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #ef4444, #f87171)', borderRadius: '3px', boxShadow: '0 0 6px rgba(239, 68, 68, 0.4)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                            <span>🐛 Debugging</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', background: 'linear-gradient(135deg, #a855f7, #c084fc)', borderRadius: '3px', boxShadow: '0 0 6px rgba(168, 85, 247, 0.4)', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                            <span>📚 Learning</span>
                        </div>
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

            {/* Badge Celebration Modal */}
            {newBadge && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 120
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        style={{
                            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                            padding: '40px',
                            borderRadius: '24px',
                            textAlign: 'center',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            boxShadow: '0 0 60px rgba(99, 102, 241, 0.2)',
                            maxWidth: '360px'
                        }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{newBadge.icon}</div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#facc15', marginBottom: '8px' }}>
                            새 뱃지 획득!
                        </h2>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                            {newBadge.name}
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
                            {newBadge.description}
                        </p>
                        <button
                            onClick={() => setNewBadge(null)}
                            style={{
                                background: '#6366f1', color: '#fff', border: 'none',
                                padding: '12px 32px', borderRadius: '12px',
                                fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
                            }}
                        >
                            확인
                        </button>
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
                        style={{
                            background: '#1e293b',
                            padding: '30px',
                            borderRadius: '24px',
                            width: '500px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>프로필 수정</h2>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}><X /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

                            <div style={{ marginTop: '10px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                <IdentitySelector
                                    selectedMain={editForm.main_skill}
                                    selectedLearning={editForm.learning_skill}
                                    onSelectMain={(skill) => setEditForm({ ...editForm, main_skill: skill })}
                                    onSelectLearning={(skill) => setEditForm({ ...editForm, learning_skill: skill })}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '10px' }}>
                            <button onClick={handleUpdateProfile} style={{ flex: 1, background: '#6366f1', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                                <Save size={18} /> 저장하기
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Level Guide Modal */}
            <LevelGuideModal
                isOpen={showLevelGuide}
                onClose={() => setShowLevelGuide(false)}
                currentLevel={getVibeLevel(profile?.total_points || 0).level}
            />

            {/* Point Guide Modal */}
            <PointGuideModal
                isOpen={showPointGuide}
                onClose={() => setShowPointGuide(false)}
            />

            {/* 사용자 여정 및 퀘스트 섹션 */}
            {profile && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    style={{ marginTop: '60px', paddingTop: '60px', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <UserJourneyIntegration
                        userPoints={profile.total_points || 0}
                        userStreak={profile.current_streak || 0}
                        userId={user?.id}
                    />
                </motion.div>
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

// 뱃지 진행률 계산
const getBadgeProgress = (badge, profile) => {
    if (!profile) return 0;
    let current = 0;
    if (badge.condition_type === 'STREAK') current = profile.current_streak || 0;
    else if (badge.condition_type === 'POST_COUNT') current = profile.message_count || 0;
    else if (badge.condition_type === 'VIBE_POINT') current = profile.total_points || 0;
    return Math.min(Math.round((current / badge.condition_value) * 100), 100);
};

// 개별 뱃지 카드
const BadgeCard = ({ badge, earned, progress }) => {
    const isEarned = !!earned;
    return (
        <div
            title={badge.description}
            style={{
                background: isEarned ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.02)',
                borderRadius: '16px',
                padding: '16px',
                border: isEarned ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
                opacity: isEarned ? 1 : 0.6,
                transition: 'all 0.3s'
            }}
        >
            <div style={{
                fontSize: '2rem',
                marginBottom: '8px',
                filter: isEarned ? 'none' : 'grayscale(1)',
                position: 'relative',
                display: 'inline-block'
            }}>
                {badge.icon}
                {!isEarned && (
                    <Lock size={14} style={{
                        position: 'absolute', bottom: -2, right: -6,
                        color: '#64748b'
                    }} />
                )}
            </div>
            <div style={{
                fontSize: '0.8rem',
                fontWeight: 'bold',
                color: isEarned ? '#e2e8f0' : '#64748b',
                marginBottom: '4px'
            }}>
                {badge.name}
            </div>
            {isEarned ? (
                <div style={{ fontSize: '0.7rem', color: '#6366f1' }}>
                    {new Date(earned.awarded_at).toLocaleDateString()}
                </div>
            ) : (
                <>
                    <div style={{
                        fontSize: '0.7rem', color: '#64748b', marginBottom: '6px'
                    }}>
                        {badge.description}
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                        height: '4px',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${progress}%`,
                            height: '100%',
                            background: progress >= 100 ? '#22c55e' : '#6366f1',
                            borderRadius: '4px',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '4px' }}>
                        {progress}%
                    </div>
                </>
            )}
        </div>
    );
};

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
