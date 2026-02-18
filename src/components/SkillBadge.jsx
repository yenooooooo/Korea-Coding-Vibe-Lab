import React from 'react';
import {
    Palette, Database, Smartphone, Brain, Cloud, Gamepad2, Shield, Cpu, Code2, Globe
} from 'lucide-react';

export const SKILL_CONFIG = {
    'Frontend': { icon: Palette, color: '#60a5fa', bg: 'rgba(96, 165, 250, 0.1)', border: 'rgba(96, 165, 250, 0.3)' },
    'Backend': { icon: Database, color: '#4ade80', bg: 'rgba(74, 222, 128, 0.1)', border: 'rgba(74, 222, 128, 0.3)' },
    'Fullstack': { icon: Globe, color: '#f472b6', bg: 'rgba(244, 114, 182, 0.1)', border: 'rgba(244, 114, 182, 0.3)' },
    'Mobile': { icon: Smartphone, color: '#facc15', bg: 'rgba(250, 204, 21, 0.1)', border: 'rgba(250, 204, 21, 0.3)' },
    'AI/Data': { icon: Brain, color: '#c084fc', bg: 'rgba(192, 132, 252, 0.1)', border: 'rgba(192, 132, 252, 0.3)' },
    'DevOps': { icon: Cloud, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.1)', border: 'rgba(56, 189, 248, 0.3)' },
    'Game': { icon: Gamepad2, color: '#f87171', bg: 'rgba(248, 113, 113, 0.1)', border: 'rgba(248, 113, 113, 0.3)' },
    'Security': { icon: Shield, color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)', border: 'rgba(251, 146, 60, 0.3)' },
    'Embedded': { icon: Cpu, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.3)' },
    'Other': { icon: Code2, color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.1)', border: 'rgba(203, 213, 225, 0.3)' }
};

const SkillBadge = ({ skill, type = 'main', size = 'md', showLabel = true }) => {
    if (!skill) return null;

    const config = SKILL_CONFIG[skill] || SKILL_CONFIG['Other'];
    const Icon = config.icon;

    const sizeMap = {
        sm: { icon: 12, font: '0.7rem', padding: '2px 6px' },
        md: { icon: 14, font: '0.8rem', padding: '4px 8px' },
        lg: { icon: 18, font: '0.9rem', padding: '6px 12px' }
    };

    const s = sizeMap[size];

    // Master (Main) vs Learner (Learning) Styling
    const isMain = type === 'main';
    const borderColor = isMain ? config.color : 'transparent';
    const bgColor = isMain ? config.bg : 'rgba(255, 255, 255, 0.03)';
    const textColor = isMain ? config.color : '#94a3b8';

    // Icon color for learner is dimmer unless it's the specific skill color
    const iconColor = config.color;

    return (
        <div
            title={isMain ? `Main Skill: ${skill}` : `Learning: ${skill}`}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: s.padding,
                borderRadius: '8px',
                background: bgColor,
                border: `1px solid ${config.border}`,
                color: textColor,
                fontSize: s.font,
                fontWeight: isMain ? 'bold' : 'normal',
                boxShadow: isMain ? `0 0 10px ${config.bg}` : 'none',
                transition: 'all 0.2s'
            }}
        >
            <Icon size={s.icon} color={iconColor} strokeWidth={isMain ? 2.5 : 2} />
            {showLabel && <span>{skill}</span>}
            {isMain && <span style={{ fontSize: '0.6em', opacity: 0.8 }}>👑</span>}
            {!isMain && <span style={{ fontSize: '0.6em', opacity: 0.8 }}>🌱</span>}
        </div>
    );
};

export default SkillBadge;
