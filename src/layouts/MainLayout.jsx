import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'radial-gradient(circle at top right, #1e293b, #0f172a)' }}>
            <Sidebar />
            <main style={{
                marginLeft: '260px',
                flex: 1,
                padding: '40px',
                maxWidth: '1200px',
                width: '100%'
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
