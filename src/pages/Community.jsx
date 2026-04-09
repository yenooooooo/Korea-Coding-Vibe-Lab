import React, { useState } from 'react';
import { MessageSquare, Sprout, MessageCircle, HelpCircle } from 'lucide-react';
import VibeLoungeTab from '../components/VibeLoungeTab';
import DebugForest from '../components/DebugForest';
import VibeSquare from '../components/VibeSquare';

const Community = () => {
    const [activeTab, setActiveTab] = useState('square'); // Default to new tab

    const tabs = [
        { id: 'square', label: '바이브 스퀘어', icon: <MessageCircle size={18} />, emoji: '🏘️' },
        { id: 'lounge', label: '라운지', icon: <MessageSquare size={18} />, emoji: '💬' },
        { id: 'forest', label: '대나무숲', icon: <Sprout size={18} />, emoji: '🎋' },

        { id: 'beginner', label: '초보 Q&A', icon: <HelpCircle size={18} />, emoji: '🌱' }
    ];

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ marginBottom: '20px' }}>Vibe Community 🏘️</h1>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                gap: '6px',
                marginBottom: '20px',
                padding: '6px',
                background: 'rgba(30, 41, 59, 0.5)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
            }}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => !tab.disabled && setActiveTab(tab.id)}
                        disabled={tab.disabled}
                        style={{
                            flex: '0 0 auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            padding: '10px 14px',
                            whiteSpace: 'nowrap',
                            background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                            border: activeTab === tab.id ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
                            borderRadius: '12px',
                            color: tab.disabled ? '#475569' : (activeTab === tab.id ? '#a5b4fc' : '#94a3b8'),
                            cursor: tab.disabled ? 'not-allowed' : 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                            transition: 'all 0.2s',
                            opacity: tab.disabled ? 0.5 : 1
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>{tab.emoji}</span>
                        <span>{tab.label}</span>
                        {tab.disabled && <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>(준비중)</span>}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'square' && <VibeSquare />}
                {activeTab === 'lounge' && <VibeLoungeTab />}
                {activeTab === 'forest' && <DebugForest />}

                {activeTab === 'beginner' && <VibeSquare defaultCategory="beginner" />}
            </div>
        </div>
    );
};

const ComingSoonTab = ({ title, subtitle }) => (
    <div style={{
        flex: 1,
        background: 'rgba(0, 0, 0, 0.2)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
    }}>
        <h2 style={{ fontSize: '2rem', margin: 0 }}>{title}</h2>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>{subtitle}</p>
        <div style={{
            padding: '12px 24px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: '12px',
            color: '#a5b4fc',
            fontSize: '0.9rem'
        }}>
            Coming Soon... 🚀
        </div>
    </div>
);

export default Community;
