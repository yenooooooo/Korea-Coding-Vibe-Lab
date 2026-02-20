import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sun, Moon, Monitor, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const THEMES = [
    { id: 'dark', name: '다크', icon: <Moon size={20} />, primary: '#1e293b', secondary: '#0f172a' },
    { id: 'light', name: '라이트', icon: <Sun size={20} />, primary: '#f8fafc', secondary: '#ffffff' },
    { id: 'purple', name: '퍼플 글로우', icon: <Palette size={20} />, primary: '#4c1d95', secondary: '#2e1065' },
    { id: 'ocean', name: '오션 블루', icon: <Palette size={20} />, primary: '#1e3a8a', secondary: '#1e40af' },
    { id: 'forest', name: '포레스트 그린', icon: <Palette size={20} />, primary: '#064e3b', secondary: '#065f46' },
    { id: 'sunset', name: '선셋 오렌지', icon: <Palette size={20} />, primary: '#7c2d12', secondary: '#9a3412' }
];

const FONT_SIZES = [
    { id: 'small', name: '작게', value: '14px' },
    { id: 'medium', name: '보통', value: '16px' },
    { id: 'large', name: '크게', value: '18px' }
];

const ThemeCustomizer = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [selectedTheme, setSelectedTheme] = useState('dark');
    const [fontSize, setFontSize] = useState('medium');
    const [compactMode, setCompactMode] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadSettings = async () => {
        const { data } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (data) {
            setSelectedTheme(data.theme || 'dark');
            setFontSize(data.font_size || 'medium');
            setCompactMode(data.compact_mode || false);
        }
    };

    useEffect(() => {
        if (user) loadSettings();
    }, [user]);

    const saveSettings = async () => {
        setSaving(true);
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: user.id,
                theme: selectedTheme,
                font_size: fontSize,
                compact_mode: compactMode
            });

        if (!error) {
            addToast('설정이 저장되었습니다', 'success');
            // 테마 적용
            document.documentElement.style.setProperty('--primary-bg', THEMES.find(t => t.id === selectedTheme)?.primary);
            document.documentElement.style.setProperty('--font-size', FONT_SIZES.find(f => f.id === fontSize)?.value);
        }
        setSaving(false);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px', color: '#fff' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Palette size={32} color="#facc15" />
                    테마 커스터마이징
                </h1>
                <p style={{ color: '#94a3b8', marginBottom: '40px' }}>나만의 스타일로 꾸며보세요</p>
            </motion.div>

            {/* Theme Selection */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px' }}>컬러 테마</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    {THEMES.map(theme => (
                        <motion.div
                            key={theme.id}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setSelectedTheme(theme.id)}
                            style={{
                                padding: '20px',
                                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                                borderRadius: '12px',
                                border: selectedTheme === theme.id ? '2px solid #facc15' : '2px solid transparent',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                        >
                            {selectedTheme === theme.id && (
                                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                    <Check size={20} color="#facc15" />
                                </div>
                            )}
                            <div style={{ marginBottom: '8px' }}>{theme.icon}</div>
                            <div style={{ fontWeight: 'bold' }}>{theme.name}</div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Font Size */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px' }}>글꼴 크기</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                    {FONT_SIZES.map(size => (
                        <motion.button
                            key={size.id}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => setFontSize(size.id)}
                            style={{
                                flex: 1,
                                padding: '16px',
                                background: fontSize === size.id ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                border: fontSize === size.id ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            {size.name}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Compact Mode */}
            <div style={{ marginBottom: '40px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={compactMode}
                        onChange={(e) => setCompactMode(e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '1.1rem' }}>컴팩트 모드 (레이아웃 밀도 높임)</span>
                </label>
            </div>

            {/* Save Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={saveSettings}
                disabled={saving}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #facc15, #f97316)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: saving ? 'not-allowed' : 'pointer'
                }}
            >
                {saving ? '저장 중...' : '설정 저장'}
            </motion.button>
        </div>
    );
};

export default ThemeCustomizer;
