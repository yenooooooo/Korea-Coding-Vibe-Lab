import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Sun, Moon, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

const THEMES = [
    { id: 'dark', name: '다크', icon: <Moon size={20} />, primary: '#1e293b', secondary: '#0f172a' },
    { id: 'light', name: '라이트', icon: <Sun size={20} />, primary: '#f0f4f8', secondary: '#dfe6ed' },
    { id: 'purple', name: '퍼플 글로우', icon: <Palette size={20} />, primary: '#4c1d95', secondary: '#2e1065' },
    { id: 'ocean', name: '오션 블루', icon: <Palette size={20} />, primary: '#1e3a8a', secondary: '#1e40af' },
    { id: 'forest', name: '포레스트 그린', icon: <Palette size={20} />, primary: '#064e3b', secondary: '#065f46' },
    { id: 'sunset', name: '선셋 오렌지', icon: <Palette size={20} />, primary: '#7c2d12', secondary: '#9a3412' }
];

const FONT_SIZES = [
    { id: 'small', name: '작게' },
    { id: 'medium', name: '보통' },
    { id: 'large', name: '크게' }
];

const ThemeCustomizer = () => {
    const { theme, fontSize, compactMode, updateTheme, updateFontSize, updateCompactMode, saveSettings } = useTheme();
    const { addToast } = useToast();

    const handleSave = async () => {
        await saveSettings();
        addToast('테마 설정이 저장되었습니다! ✨', 'success');
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px', color: '#fff' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Palette size={32} color="#facc15" />
                    테마 커스터마이징
                </h1>
                <p style={{ color: '#94a3b8', marginBottom: '40px' }}>나만의 스타일로 꾸며보세요 — 변경사항이 즉시 적용됩니다</p>
            </motion.div>

            {/* Theme Selection */}
            <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '16px' }}>컬러 테마</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    {THEMES.map(t => (
                        <motion.div
                            key={t.id}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => updateTheme(t.id)}
                            style={{
                                padding: '20px',
                                background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                                borderRadius: '12px',
                                border: theme === t.id ? '2px solid #facc15' : '2px solid transparent',
                                cursor: 'pointer',
                                position: 'relative',
                                boxShadow: theme === t.id ? '0 0 20px rgba(250, 204, 21, 0.3)' : 'none',
                                transition: 'all 0.3s'
                            }}
                        >
                            {theme === t.id && (
                                <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                                    <Check size={20} color="#facc15" />
                                </div>
                            )}
                            <div style={{ marginBottom: '8px' }}>{t.icon}</div>
                            <div style={{ fontWeight: 'bold', color: '#fff' }}>{t.name}</div>
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
                            onClick={() => updateFontSize(size.id)}
                            style={{
                                flex: 1,
                                padding: '16px',
                                background: fontSize === size.id ? '#6366f1' : 'rgba(255,255,255,0.05)',
                                border: fontSize === size.id ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                boxShadow: fontSize === size.id ? '0 4px 12px rgba(99, 102, 241, 0.4)' : 'none'
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
                        onChange={(e) => updateCompactMode(e.target.checked)}
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '1.1rem' }}>컴팩트 모드 (레이아웃 밀도 높임)</span>
                </label>
            </div>

            {/* Save Button */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #facc15, #f97316)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#000',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(250, 204, 21, 0.3)'
                }}
            >
                설정 저장 (DB에 영구 저장)
            </motion.button>

            <p style={{ marginTop: '12px', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
                💡 테마와 글꼴 크기는 즉시 미리보기됩니다. 저장 버튼을 눌러야 다음 방문에도 유지됩니다.
            </p>
        </div>
    );
};

export default ThemeCustomizer;
