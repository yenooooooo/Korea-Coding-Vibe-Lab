import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminMentorManagement from '../components/AdminMentorManagement';

const AdminMentorPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user && user.email !== 'yaya01234@naver.com') {
            alert('관리자 권한이 없습니다.');
            navigate('/');
            return;
        }
    }, [user, navigate]);

    return (
        <div style={{ padding: '40px 40px 40px 24px', color: '#f8fafc', maxWidth: '1400px', margin: '0' }}>
            <h1 style={{ marginBottom: '30px', fontSize: '2rem' }}>📚 멘토 관리</h1>
            <AdminMentorManagement />
        </div>
    );
};

export default AdminMentorPage;
