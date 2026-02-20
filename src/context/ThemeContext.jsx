import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const THEME_MAP = {
    dark: {
        bg: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
        cardBg: 'rgba(30, 41, 59, 0.6)',
        textPrimary: '#f1f5f9',
        textSecondary: '#94a3b8',
        borderColor: 'rgba(255,255,255,0.1)',
    },
    light: {
        bg: 'linear-gradient(135deg, #f0f4f8, #dfe6ed)',
        cardBg: 'rgba(255, 255, 255, 0.85)',
        textPrimary: '#1e293b',
        textSecondary: '#475569',
        borderColor: 'rgba(0,0,0,0.1)',
    },
    purple: {
        bg: 'radial-gradient(circle at top right, #4c1d95, #2e1065)',
        cardBg: 'rgba(76, 29, 149, 0.4)',
        textPrimary: '#e9d5ff',
        textSecondary: '#c4b5fd',
        borderColor: 'rgba(167, 139, 250, 0.2)',
    },
    ocean: {
        bg: 'radial-gradient(circle at top right, #1e3a8a, #1e40af)',
        cardBg: 'rgba(30, 58, 138, 0.4)',
        textPrimary: '#dbeafe',
        textSecondary: '#93c5fd',
        borderColor: 'rgba(96, 165, 250, 0.2)',
    },
    forest: {
        bg: 'radial-gradient(circle at top right, #064e3b, #065f46)',
        cardBg: 'rgba(6, 78, 59, 0.4)',
        textPrimary: '#d1fae5',
        textSecondary: '#6ee7b7',
        borderColor: 'rgba(52, 211, 153, 0.2)',
    },
    sunset: {
        bg: 'radial-gradient(circle at top right, #7c2d12, #9a3412)',
        cardBg: 'rgba(124, 45, 18, 0.4)',
        textPrimary: '#fed7aa',
        textSecondary: '#fdba74',
        borderColor: 'rgba(251, 146, 60, 0.2)',
    }
};

const FONT_SIZE_MAP = {
    small: '14px',
    medium: '16px',
    large: '18px',
};

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const [theme, setTheme] = useState('dark');
    const [fontSize, setFontSize] = useState('medium');
    const [compactMode, setCompactMode] = useState(false);

    const loadSettings = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (data) {
            setTheme(data.theme || 'dark');
            setFontSize(data.font_size || 'medium');
            setCompactMode(data.compact_mode || false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, [user]);

    // Apply CSS variables globally whenever theme/fontSize changes
    useEffect(() => {
        const colors = THEME_MAP[theme] || THEME_MAP.dark;
        const root = document.documentElement;

        root.style.setProperty('--theme-bg', colors.bg);
        root.style.setProperty('--theme-card-bg', colors.cardBg);
        root.style.setProperty('--theme-text-primary', colors.textPrimary);
        root.style.setProperty('--theme-text-secondary', colors.textSecondary);
        root.style.setProperty('--theme-border', colors.borderColor);
        root.style.setProperty('--theme-font-size', FONT_SIZE_MAP[fontSize] || '16px');

        // Apply font size to body
        document.body.style.fontSize = FONT_SIZE_MAP[fontSize] || '16px';

        // Apply background to body for light theme
        if (theme === 'light') {
            document.body.style.backgroundColor = '#f0f4f8';
            document.body.style.color = '#1e293b';
        } else {
            document.body.style.backgroundColor = '#0f172a';
            document.body.style.color = '#f8fafc';
        }
    }, [theme, fontSize]);

    const updateTheme = (newTheme) => setTheme(newTheme);
    const updateFontSize = (newSize) => setFontSize(newSize);
    const updateCompactMode = (val) => setCompactMode(val);

    const themeColors = THEME_MAP[theme] || THEME_MAP.dark;

    const saveSettings = async () => {
        if (!user) return;
        await supabase.from('user_settings').upsert({
            user_id: user.id,
            theme,
            font_size: fontSize,
            compact_mode: compactMode
        });
    };

    return (
        <ThemeContext.Provider value={{
            theme, fontSize, compactMode, themeColors,
            updateTheme, updateFontSize, updateCompactMode, saveSettings,
            reloadSettings: loadSettings
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
