import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, BookOpen, Flame, Trophy, User } from 'lucide-react';
import SkillBadge from './SkillBadge';
import { supabase } from '../lib/supabase';
import { getVibeLevel } from '../utils/vibeLevel';
import { isAdmin, ADMIN_NAME_STYLE, ADMIN_BADGE_STYLE, ADMIN_AVATAR_GLOW, ADMIN_PROFILE_HEADER, ADMIN_TITLE_STYLE, ADMIN_TITLE_DEFAULT } from '../utils/admin';
import { fetchEquippedDetails, VibeName, getBannerStyle } from '../utils/vibeItems.jsx';

const ProfileSummaryModal = ({ userId, isOpen, onClose }) => {
    const [profile, setProfile] = useState(null);
    const [userBadges, setUserBadges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [equippedDetails, setEquippedDetails] = useState({});
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        if (!isOpen || !userId) {
            setProfile(null);
            setUserBadges([]);
            setError(null);
            setEquippedDetails({});
            return;
        }

        const fetchProfileSummary = async () => {
            setLoading(true);
            setError(null);
            try {
                // Optimized RPC call: Fetch everything in one go
                const { data, error } = await supabase.rpc('get_profile_summary', { p_user_id: userId });

                if (error) throw error;
                if (!data || !data.profile) throw new Error('Profile not found');

                setProfile(data.profile);
                setUserBadges(data.badges || []);
                setEquippedDetails(data.equipped_details || {});

                // Fetch season pass status
                const { data: seasonData } = await supabase
                    .from('user_season_progress')
                    .select('is_premium')
                    .eq('user_id', userId)
                    .order('updated_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (seasonData) {
                    setIsPremium(seasonData.is_premium);
                } else {
                    setIsPremium(false);
                }

            } catch (error) {
                console.error('Error fetching profile summary:', error);
                setError(error.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        fetchProfileSummary();
    }, [isOpen, userId]);

    // Admin Title Render helper
    const renderAdminTitle = () => {
        if (!isAdmin(profile)) return null;
        return (
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                borderRadius: '20px',
                border: '1px solid rgba(168, 85, 247, 0.5)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
                <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 'bold', textShadow: '0 0 10px #a855f7' }}>
                    👑 {profile.admin_title || ADMIN_TITLE_DEFAULT}
                </span>
            </div>
        );
    };

    return (
        <AnimatePresence mode="wait">
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.4)',
                            zIndex: 200,
                            backdropFilter: 'blur(2px)'
                        }}
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            right: '16px',
                            top: '64px',
                            width: '288px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #374151',
                            borderRadius: '12px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                            zIndex: 201,
                            overflow: 'hidden' // Ensure banner doesn't stick out
                        }}
                    >
                        {/* Close Button - High Z-Index & Contrast */}
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                padding: '6px',
                                color: '#fff',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '50%',
                                border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                zIndex: 100, // Ensure it's on top of everything
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                                backdropFilter: 'blur(4px)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.3)';
                            }}
                        >
                            <X size={14} />
                        </button>

                        {loading ? (
                            <div style={{
                                height: '192px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    border: '3px solid transparent',
                                    borderTopColor: '#a855f7',
                                    borderRightColor: '#a855f7',
                                    borderRadius: '50%',
                                    animation: 'spin 0.8s linear infinite'
                                }} />
                            </div>
                        ) : error ? (
                            <div style={{
                                padding: '24px',
                                textAlign: 'center'
                            }}>
                                <p style={{
                                    color: '#f87171',
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    marginBottom: '4px'
                                }}>⚠️ 프로필 로드 실패</p>
                                <p style={{
                                    color: '#9ca3af',
                                    fontSize: '11px'
                                }}>{error}</p>
                            </div>
                        ) : profile ? (
                            <div>
                                {/* Combined Banner Area */}
                                <div style={{
                                    height: '80px', // Increased height for better look
                                    background: getBannerStyle(equippedDetails.banner),
                                    position: 'relative'
                                }}>
                                    {/* Admin Title Overlay (Merged) */}
                                    {renderAdminTitle()}
                                </div>

                                {/* Header Content */}
                                <div style={{
                                    padding: '0 16px 16px 16px',
                                    position: 'relative',
                                    marginTop: '-30px' // Pull up avatar area
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center', // Changed from flex-end for better vertical alignment
                                        gap: '14px', // Increased gap
                                        marginTop: '4px' // Slight adjustment
                                    }}>
                                        {/* Avatar */}
                                        <div style={{ position: 'relative', flexShrink: 0 }}>
                                            <div style={{
                                                width: '60px', // Slightly larger avatar
                                                height: '60px',
                                                borderRadius: '50%',
                                                background: '#1a1a1a',
                                                border: isAdmin(profile) ? '2px solid #a855f7' : '3px solid #1a1a1a',
                                                padding: '2px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.5rem',
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                            }}>
                                                <div style={{
                                                    width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                                                    position: 'relative'
                                                }}>
                                                    {equippedDetails.avatar ? (
                                                        <img src={equippedDetails.avatar.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : profile.avatar_url ? (
                                                        <img
                                                            src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`}
                                                            alt="Avatar"
                                                            className={isAdmin(profile) ? 'admin-avatar-animated' : ''}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <User size={24} color="#9ca3af" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Online Status */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '2px',
                                                right: '2px',
                                                width: '14px',
                                                height: '14px',
                                                backgroundColor: '#22c55e',
                                                borderRadius: '50%',
                                                border: '2px solid #1a1a1a',
                                                boxShadow: '0 0 0 1px rgba(0,0,0,0.1)'
                                            }} />
                                        </div>

                                        {/* Name & Badge */}
                                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                                                <h3 style={{
                                                    fontSize: '17px', // Slightly larger font
                                                    fontWeight: '700',
                                                    margin: 0,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    ...(isAdmin(profile) ? ADMIN_NAME_STYLE : { color: 'white' }),
                                                    lineHeight: '1.2'
                                                }}>
                                                    <VibeName
                                                        name={profile.nickname || profile.username || '익명'}
                                                        effectItem={equippedDetails.name_effect}
                                                    />
                                                </h3>
                                                {isAdmin(profile) && <span style={{
                                                    fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px',
                                                    background: '#a855f7', color: 'white', fontWeight: 'bold',
                                                    alignSelf: 'center',
                                                    boxShadow: '0 2px 4px rgba(168, 85, 247, 0.3)'
                                                }}>운영자</span>}
                                                {isPremium && (
                                                    <span style={{
                                                        fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px',
                                                        background: 'linear-gradient(135deg, #facc15, #f59e0b)', color: 'black', fontWeight: 'bold',
                                                        alignSelf: 'center',
                                                        boxShadow: '0 2px 4px rgba(250, 204, 21, 0.3)'
                                                    }}>PREMIUM ✨</span>
                                                )}
                                            </div>
                                            <p style={{
                                                fontSize: '11px',
                                                color: '#9ca3af',
                                                margin: '2px 0 0 0',
                                                fontFamily: 'monospace',
                                                fontWeight: '500'
                                            }}>
                                                @{profile.email?.split('@')[0] || 'user'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Level Badge */}
                                    {(() => {
                                        const levelInfo = getVibeLevel(profile.total_points || 0);
                                        return (
                                            <div style={{ marginTop: '12px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '4px',
                                                    fontSize: '11px',
                                                    color: levelInfo.color,
                                                    background: `${levelInfo.color}15`,
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    border: `1px solid ${levelInfo.color}30`,
                                                    fontWeight: 'bold',
                                                    boxShadow: `0 0 10px ${levelInfo.color}10`
                                                }}>
                                                    {levelInfo.icon} Lv.{levelInfo.level} {levelInfo.title}
                                                </span>
                                            </div>
                                        );
                                    })()}

                                    {/* Skills (Aligned with Level) */}
                                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                                        <SkillBadge skill={profile.main_skill} type="main" size="sm" />
                                        <SkillBadge skill={profile.learning_skill} type="learning" size="sm" />
                                    </div>
                                </div>

                                {/* Main Content Area */}
                                <div style={{
                                    padding: '0 16px 16px 16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '12px'
                                }}>
                                    {/* Stats Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div style={{
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                <Flame size={12} style={{ color: '#f97316' }} />
                                                <span style={{ fontSize: '10px', color: '#9ca3af' }}>STREAK</span>
                                            </div>
                                            <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                                                {profile.current_streak || 0}<span style={{ fontSize: '10px', fontWeight: 'normal', opacity: 0.7, marginLeft: '2px' }}>일</span>
                                            </p>
                                        </div>
                                        <div style={{
                                            backgroundColor: 'rgba(255,255,255,0.03)',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                <Trophy size={12} style={{ color: '#facc15' }} />
                                                <span style={{ fontSize: '10px', color: '#9ca3af' }}>POINTS</span>
                                            </div>
                                            <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', margin: 0 }}>
                                                {profile.total_points || 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tech Stack */}
                                    {profile.tech_stack && profile.tech_stack.length > 0 && (
                                        <div>
                                            <p style={{
                                                fontSize: '10px',
                                                color: '#6b7280',
                                                fontWeight: 'bold',
                                                marginBottom: '6px',
                                                textTransform: 'uppercase'
                                            }}>Stack</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                {profile.tech_stack.slice(0, 6).map((tech, i) => (
                                                    <span key={`${tech}-${i}`} style={{
                                                        fontSize: '10px',
                                                        padding: '3px 8px',
                                                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                                        color: '#38bdf8',
                                                        border: '1px solid rgba(56, 189, 248, 0.2)',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Badges */}
                                    {userBadges.length > 0 && (
                                        <div>
                                            <p style={{
                                                fontSize: '10px',
                                                color: '#6b7280',
                                                fontWeight: 'bold',
                                                marginBottom: '6px',
                                                textTransform: 'uppercase'
                                            }}>BADGES ({userBadges.length})</p>
                                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                {userBadges.slice(0, 5).map((badge, i) => (
                                                    <div
                                                        key={badge.id || i}
                                                        title={badge.badges?.name}
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                                            borderRadius: '6px',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '16px',
                                                            cursor: 'help'
                                                        }}
                                                    >
                                                        {badge.badges?.icon}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
                                사용자 정보를 찾을 수 없습니다.
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ProfileSummaryModal;
