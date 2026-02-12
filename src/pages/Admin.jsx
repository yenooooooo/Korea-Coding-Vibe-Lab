
import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Users, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Admin = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({
        totalVisits: 0,
        todayVisits: 0,
        totalUsers: 0
    })
    const [recentVisits, setRecentVisits] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (user && user.email !== 'yaya01234@naver.com') {
            alert("관리자 권한이 없습니다.")
            navigate('/')
            return
        }

        if (user) {
            fetchStats()
        }
    }, [user, navigate])

    const fetchStats = async () => {
        setLoading(true)

        // 1. Total Visits
        const { count: totalVisits } = await supabase
            .from('visits')
            .select('*', { count: 'exact', head: true })

        // 2. Today's Visits
        const today = new Date().toISOString().split('T')[0]
        const { count: todayVisits } = await supabase
            .from('visits')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today)

        // 3. Recent 20 Logs
        const { data: logs } = await supabase
            .from('visits')
            .select(`
                *,
                profiles (username, email)
            `) // Left join if you linked profiles, but visits.user_id might not be linked in schema yet?
            // Actually we defined user_id references auth.users. 
            // Joining auth.users is not directly possible via client. 
            // We will just show user_id or if linked to profiles.
            // Let's try to join profiles if possible. 
            // If profiles table exists and visits.user_id references auth.users which profiles.id also references.
            // Supabase client can join if we set up the foreign key relation properly. 
            // But visits.user_id -> auth.users. profiles.id -> auth.users.
            // It's easier to just show raw logs for now or fetch profiles separately.
            .order('created_at', { ascending: false })
            .limit(20)

        // 4. Total Signed Up Users (Profiles)
        const { count: totalUsers } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        setStats({
            totalVisits: totalVisits || 0,
            todayVisits: todayVisits || 0,
            totalUsers: totalUsers || 0
        })
        setRecentVisits(logs || [])
        setLoading(false)
    }

    return (
        <div style={{ padding: '40px', color: '#f8fafc', maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '30px', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BarChart size={32} />
                관리자 대시보드 (Analytics)
            </h1>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                <StatCard
                    title="총 방문자 수"
                    value={stats.totalVisits}
                    icon={<Users size={24} color="#818cf8" />}
                    color="rgba(99, 102, 241, 0.1)"
                />
                <StatCard
                    title="오늘 방문자"
                    value={stats.todayVisits}
                    icon={<Clock size={24} color="#34d399" />}
                    color="rgba(52, 211, 153, 0.1)"
                />
                <StatCard
                    title="총 회원 수"
                    value={stats.totalUsers}
                    icon={<Users size={24} color="#f472b6" />}
                    color="rgba(244, 114, 182, 0.1)"
                />
            </div>

            {/* Recent Logs Table */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '16px', padding: '24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1.2rem' }}>최근 접속 기록 (Latest Visits)</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '12px', color: '#94a3b8' }}>시간 (Time)</th>
                                <th style={{ padding: '12px', color: '#94a3b8' }}>유저 ID (User)</th>
                                <th style={{ padding: '12px', color: '#94a3b8' }}>페이지 (Path)</th>
                                <th style={{ padding: '12px', color: '#94a3b8' }}>디바이스 (Device)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentVisits.map((visit) => (
                                <tr key={visit.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '12px', color: '#cbd5e1' }}>
                                        {new Date(visit.created_at).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '12px', color: '#a5b4fc' }}>
                                        {visit.user_id ? '회원 (Logged In)' : '비회원 (Guest)'}
                                        {visit.user_id && <div style={{ fontSize: '0.7em', opacity: 0.7 }}>{visit.user_id}</div>}
                                    </td>
                                    <td style={{ padding: '12px', color: '#e2e8f0' }}>{visit.page_path}</td>
                                    <td style={{ padding: '12px', color: '#94a3b8' }}>
                                        {visit.metadata?.screen_width > 768 ? 'PC' : 'Mobile'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

const StatCard = ({ title, value, icon, color }) => (
    <div style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    }}>
        <div style={{
            width: '50px', height: '50px',
            borderRadius: '12px',
            background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            {icon}
        </div>
        <div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '4px' }}>{title}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#f8fafc' }}>{value.toLocaleString()}</div>
        </div>
    </div>
)

export default Admin
