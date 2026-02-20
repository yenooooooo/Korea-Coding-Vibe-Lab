import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * 로그인 필수 페이지 래퍼
 * 비로그인 시 /login으로 리다이렉트하며, 로그인 후 원래 페이지로 돌아옴
 */
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // AuthContext가 아직 로딩 중이면 로딩 표시
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                color: '#94a3b8',
                fontSize: '1.1rem'
            }}>
                로딩 중...
            </div>
        );
    }

    // 비로그인 → /login으로 리다이렉트 (현재 경로를 state로 전달)
    if (!user) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    return children;
};

export default ProtectedRoute;
