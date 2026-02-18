import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const AdminEntryToast = () => {
    const [toasts, setToasts] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        const channel = supabase
            .channel('admin_entry_broadcast')
            .on('broadcast', { event: 'admin_checkin' }, (payload) => {
                // 본인이 관리자면 토스트 표시하지 않음
                if (user && payload.payload?.userId === user.id) return;

                const id = Date.now();
                setToasts(prev => [...prev, {
                    id,
                    username: payload.payload?.username || '운영자',
                }]);

                // 4초 후 자동 제거
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== id));
                }, 4000);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none',
        }}>
            <AnimatePresence>
                {toasts.map((toast) => (
                    <motion.div
                        key={toast.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(99, 102, 241, 0.9))',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '12px',
                            padding: '12px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            border: '1px solid rgba(168, 85, 247, 0.5)',
                            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
                            pointerEvents: 'auto',
                        }}
                    >
                        <Crown size={18} color="#fbbf24" />
                        <span style={{ color: '#fff', fontSize: '0.9rem', fontWeight: '600' }}>
                            {toast.username} 님이 출석했습니다!
                        </span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default AdminEntryToast;
