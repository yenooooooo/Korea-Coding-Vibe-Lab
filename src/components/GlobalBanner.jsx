import React, { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalBanner = () => {
    const [announcement, setAnnouncement] = useState(null);
    const [dismissedId, setDismissedId] = useState(null);

    useEffect(() => {
        fetchAnnouncement();

        const channel = supabase
            .channel('global_banner')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'site_announcements' }, () => {
                fetchAnnouncement();
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_announcements' }, () => {
                fetchAnnouncement();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchAnnouncement = async () => {
        const { data, error } = await supabase
            .from('site_announcements')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!error && data) {
            setAnnouncement(data);
        } else {
            setAnnouncement(null);
        }
    };

    if (!announcement || dismissedId === announcement.id) return null;

    return (
        <AnimatePresence>
            {announcement && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(99, 102, 241, 0.15))',
                        borderBottom: '1px solid rgba(168, 85, 247, 0.4)',
                        overflow: 'hidden',
                        position: 'relative',
                        zIndex: 9998, // 네비게이션바보다 아래, 콘텐츠보다 위
                    }}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        padding: '12px 20px',
                        position: 'relative',
                        maxWidth: '1200px',
                        margin: '0 auto',
                    }}>
                        <Megaphone size={18} color="#a855f7" />
                        <span style={{
                            color: '#e2e8f0',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            letterSpacing: '0.5px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        }}>
                            {announcement.content}
                        </span>
                        <button
                            onClick={() => setDismissedId(announcement.id)}
                            style={{
                                marginLeft: 'auto',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '50%',
                                border: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            <X size={14} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GlobalBanner;
