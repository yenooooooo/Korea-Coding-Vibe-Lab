
import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const value = {
        addToast,
        removeToast,
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            {createPortal(
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    zIndex: 9999,
                    pointerEvents: 'none'
                }}>
                    {toasts.map(toast => (
                        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
                    ))}
                </div>,
                document.body
            )}
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }) => {
    const { id, message, type } = toast;

    // Animation state
    const [isExiting, setIsExiting] = useState(false);

    const handleRemove = () => {
        setIsExiting(true);
        setTimeout(() => onRemove(id), 300); // Wait for animation
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={20} color="#34d399" />;
            case 'error': return <AlertCircle size={20} color="#f87171" />;
            case 'warning': return <AlertTriangle size={20} color="#facc15" />;
            default: return <Info size={20} color="#60a5fa" />;
        }
    };

    const getStyles = () => {
        const baseStyle = {
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minWidth: '300px',
            maxWidth: '400px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            pointerEvents: 'auto',
            transform: isExiting ? 'translateX(100%)' : 'translateX(0)',
            opacity: isExiting ? 0 : 1,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        };

        if (type === 'success') baseStyle.borderLeft = '4px solid #34d399';
        if (type === 'error') baseStyle.borderLeft = '4px solid #f87171';
        if (type === 'warning') baseStyle.borderLeft = '4px solid #facc15';
        if (type === 'info') baseStyle.borderLeft = '4px solid #60a5fa';

        return baseStyle;
    };

    return (
        <div style={getStyles()}>
            {getIcon()}
            <p style={{ margin: 0, fontSize: '0.95rem', flex: 1, lineHeight: '1.4' }}>{message}</p>
            <button onClick={handleRemove} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
                <X size={16} />
            </button>
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
