import React from 'react';
import { SKILL_CONFIG } from './SkillBadge';
import { motion } from 'framer-motion';

const IdentitySelector = ({ selectedMain, selectedLearning, onSelectMain, onSelectLearning }) => {
    const skills = Object.keys(SKILL_CONFIG).filter(k => k !== 'Other');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Main Skill Selector */}
            <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: 'bold' }}>
                    👑 Main Skill (자신 있는 분야)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skills.map(skill => {
                        const config = SKILL_CONFIG[skill];
                        const Icon = config.icon;
                        const isSelected = selectedMain === skill;

                        return (
                            <motion.button
                                key={`main-${skill}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelectMain(skill)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '8px 12px',
                                    borderRadius: '10px',
                                    background: isSelected ? config.bg : 'rgba(30, 41, 59, 0.5)',
                                    border: isSelected ? `2px solid ${config.color}` : '1px solid rgba(255,255,255,0.1)',
                                    color: isSelected ? config.color : '#94a3b8',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    boxShadow: isSelected ? `0 0 15px ${config.bg}` : 'none'
                                }}
                            >
                                <Icon size={16} />
                                {skill}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Learning Skill Selector */}
            <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '8px', fontWeight: 'bold' }}>
                    🌱 Learning Interest (공부 중인 분야)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {skills.map(skill => {
                        const config = SKILL_CONFIG[skill];
                        const Icon = config.icon;
                        const isSelected = selectedLearning === skill;

                        return (
                            <motion.button
                                key={`learning-${skill}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSelectLearning(skill)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 10px',
                                    borderRadius: '10px',
                                    background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(30, 41, 59, 0.3)',
                                    border: isSelected ? `1px solid ${config.color}` : '1px solid rgba(255,255,255,0.05)',
                                    color: isSelected ? '#fff' : '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    opacity: isSelected ? 1 : 0.7
                                }}
                            >
                                <Icon size={14} />
                                {skill}
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default IdentitySelector;
