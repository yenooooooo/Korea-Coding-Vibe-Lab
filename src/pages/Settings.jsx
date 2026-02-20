import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Bell, Palette, Lock, Trash2, Globe, ChevronRight, Shield, Eye, EyeOff, Check, AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ToggleSwitch = ({ enabled, onToggle }) => (
    <motion.div
        onClick={onToggle}
        style={{
            width: '48px', height: '26px', borderRadius: '13px', cursor: 'pointer',
            background: enabled ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.1)',
            padding: '3px', transition: 'background 0.3s',
        }}
    >
        <motion.div
            animate={{ x: enabled ? 22 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff' }}
        />
    </motion.div>
);

const SectionCard = ({ icon, title, description, children, color = '#6366f1' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px', padding: '28px', marginBottom: '20px',
        }}
    >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: color, border: `1px solid ${color}30`,
            }}>
                {icon}
            </div>
            <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0 }}>{title}</h3>
                {description && <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>{description}</p>}
            </div>
        </div>
        {children}
    </motion.div>
);

const SettingRow = ({ label, description, children }) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
        <div style={{ flex: 1 }}>
            <div style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: '600' }}>{label}</div>
            {description && <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>{description}</div>}
        </div>
        {children}
    </div>
);

const Settings = () => {
    const { user, profile, signOut } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const { t, language, setLanguage } = useLanguage();

    // 알림 설정
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('kcvl_notifications');
        return saved ? JSON.parse(saved) : { quest: true, battle: true, friend: true, system: true };
    });




    // 비밀번호 변경
    const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // 계정 탈퇴
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // OAuth 유저인지 확인
    const isOAuthUser = user?.app_metadata?.provider && user.app_metadata.provider !== 'email';

    useEffect(() => {
        localStorage.setItem('kcvl_notifications', JSON.stringify(notifications));
    }, [notifications]);





    const handleToggleNotification = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        addToast('알림 설정이 변경되었습니다.', 'success');
    };

    const handlePasswordChange = async () => {
        if (passwordForm.newPassword.length < 6) {
            addToast('비밀번호는 최소 6자 이상이어야 합니다.', 'error');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            addToast('비밀번호가 일치하지 않습니다.', 'error');
            return;
        }
        setIsChangingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword });
            if (error) throw error;
            addToast('비밀번호가 성공적으로 변경되었습니다! 🔒', 'success');
            setPasswordForm({ newPassword: '', confirmPassword: '' });
        } catch (error) {
            addToast(`비밀번호 변경 실패: ${error.message}`, 'error');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== '탈퇴합니다') {
            addToast('"탈퇴합니다"를 정확히 입력해주세요.', 'error');
            return;
        }
        try {
            // 프로필 데이터 초기화
            await supabase.from('profiles').update({
                nickname: '[탈퇴한 회원]',
                bio: '',
                avatar_url: '',
                tech_stack: [],
                github_url: '',
                blog_url: '',
                is_banned: true,
                updated_at: new Date(),
            }).eq('id', user.id);

            addToast('계정이 비활성화되었습니다. 안녕히 가세요... 👋', 'success');
            await signOut();
            navigate('/');
        } catch (error) {
            addToast(`계정 탈퇴 실패: ${error.message}`, 'error');
        }
    };

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 20px', color: '#94a3b8' }}>
                <SettingsIcon size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>{t('settings.login.required')}</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', paddingBottom: '100px' }}>
            {/* 헤더 */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '36px' }}>
                <h1 style={{
                    fontSize: '2rem', fontWeight: '900',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: '8px',
                }}>
                    {t('settings.title')}
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.95rem' }}>{t('settings.desc')}</p>
            </motion.div>

            {/* 알림 설정 */}
            <SectionCard icon={<Bell size={22} />} title={t('settings.notifications')} description={t('settings.notifications.desc')} color="#6366f1">
                <SettingRow label={t('settings.notif.quest')} description={t('settings.notif.quest.desc')}>
                    <ToggleSwitch enabled={notifications.quest} onToggle={() => handleToggleNotification('quest')} />
                </SettingRow>
                <SettingRow label={t('settings.notif.battle')} description={t('settings.notif.battle.desc')}>
                    <ToggleSwitch enabled={notifications.battle} onToggle={() => handleToggleNotification('battle')} />
                </SettingRow>
                <SettingRow label={t('settings.notif.friend')} description={t('settings.notif.friend.desc')}>
                    <ToggleSwitch enabled={notifications.friend} onToggle={() => handleToggleNotification('friend')} />
                </SettingRow>
                <SettingRow label={t('settings.notif.system')} description={t('settings.notif.system.desc')}>
                    <ToggleSwitch enabled={notifications.system} onToggle={() => handleToggleNotification('system')} />
                </SettingRow>
            </SectionCard>

            {/* 테마 설정 */}
            <SectionCard icon={<Palette size={22} />} title={t('settings.theme')} description={t('settings.theme.desc')} color="#f59e0b">
                <Link
                    to="/theme"
                    style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '18px 20px', borderRadius: '14px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        color: '#f59e0b', textDecoration: 'none',
                        fontWeight: '700', fontSize: '0.95rem',
                        transition: 'all 0.3s',
                    }}
                >
                    <span>{t('settings.theme.open')}</span>
                    <ChevronRight size={20} />
                </Link>
            </SectionCard>

            {/* 언어 설정 */}
            <SectionCard icon={<Globe size={22} />} title={t('settings.language')} description={t('settings.language.desc')} color="#10b981">
                <div style={{ display: 'flex', gap: '12px' }}>
                    {[
                        { id: 'ko', label: '한국어', flag: '🇰🇷' },
                        { id: 'en', label: 'English', flag: '🇺🇸' },
                    ].map(l => (
                        <motion.div
                            key={l.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => { setLanguage(l.id); addToast(`언어가 ${l.label}로 변경되었습니다.`, 'success'); }}
                            style={{
                                flex: 1, padding: '18px', borderRadius: '14px', cursor: 'pointer',
                                background: language === l.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                                border: language === l.id ? '2px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                                textAlign: 'center', transition: 'all 0.3s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            }}
                        >
                            <span style={{ fontSize: '1.5rem' }}>{l.flag}</span>
                            <span style={{ color: '#e2e8f0', fontWeight: '700' }}>{l.label}</span>
                            {language === l.id && <Check size={16} color="#10b981" />}
                        </motion.div>
                    ))}
                </div>
            </SectionCard>

            {/* 비밀번호 변경 */}
            <SectionCard icon={<Lock size={22} />} title={t('settings.password')} description={isOAuthUser ? t('settings.password.oauth') : t('settings.password.new')} color="#8b5cf6">
                {isOAuthUser ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                        <Shield size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                        <p>{t('settings.password.oauth.desc')}</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder={t('settings.password.input.new')}
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                                style={{
                                    width: '100%', padding: '14px 48px 14px 16px', borderRadius: '12px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                                }}
                            />
                            <button onClick={() => setShowPassword(!showPassword)} style={{
                                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
                            }}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder={t('settings.password.input.confirm')}
                            value={passwordForm.confirmPassword}
                            onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                            style={{
                                width: '100%', padding: '14px 16px', borderRadius: '12px',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: '#e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box',
                            }}
                        />
                        <motion.button
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={handlePasswordChange}
                            disabled={isChangingPassword || !passwordForm.newPassword}
                            style={{
                                padding: '14px', borderRadius: '12px',
                                background: passwordForm.newPassword ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255,255,255,0.05)',
                                border: 'none', color: '#fff', fontWeight: '700', cursor: 'pointer',
                                opacity: !passwordForm.newPassword ? 0.5 : 1,
                            }}
                        >
                            {isChangingPassword ? t('settings.password.btn.ing') : t('settings.password.btn')}
                        </motion.button>
                    </div>
                )}
            </SectionCard>

            {/* 계정 탈퇴 */}
            <SectionCard icon={<Trash2 size={22} />} title={t('settings.delete')} description={t('settings.delete.desc')} color="#ef4444">
                {!showDeleteConfirm ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{
                            width: '100%', padding: '14px', borderRadius: '12px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            color: '#ef4444', fontWeight: '700', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        }}
                    >
                        <Trash2 size={18} /> {t('settings.delete.btn')}
                    </motion.button>
                ) : (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <div style={{
                            padding: '20px', borderRadius: '14px',
                            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', color: '#ef4444' }}>
                                <AlertTriangle size={20} />
                                <strong>{t('settings.delete.confirm.title')}</strong>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px', lineHeight: '1.5' }}>
                                {t('settings.delete.confirm.desc')}<br />
                                {t('settings.delete.confirm.instruct')} <strong style={{ color: '#ef4444' }}>"{t('settings.delete.confirm.keyword')}"</strong>{t('settings.delete.confirm.instruct2')}
                            </p>
                            <input
                                type="text" value={deleteConfirmText}
                                onChange={e => setDeleteConfirmText(e.target.value)}
                                placeholder={t('settings.delete.confirm.keyword')}
                                style={{
                                    width: '100%', padding: '12px 16px', borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#e2e8f0', fontSize: '0.95rem', outline: 'none', marginBottom: '12px', boxSizing: 'border-box',
                                }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '10px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#94a3b8', fontWeight: '600', cursor: 'pointer',
                                    }}
                                >
                                    취소
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirmText !== '탈퇴합니다'}
                                    style={{
                                        flex: 1, padding: '12px', borderRadius: '10px',
                                        background: deleteConfirmText === '탈퇴합니다' ? '#ef4444' : 'rgba(239,68,68,0.2)',
                                        border: 'none', color: '#fff', fontWeight: '700', cursor: 'pointer',
                                        opacity: deleteConfirmText !== '탈퇴합니다' ? 0.5 : 1,
                                    }}
                                >
                                    탈퇴 확인
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </SectionCard>
        </div>
    );
};

export default Settings;
