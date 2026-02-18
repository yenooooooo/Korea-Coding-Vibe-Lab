
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Users, Clock, Eye, Terminal, Zap, Shield, Flame, Megaphone, Swords, Search, Copy, Ghost, Sparkles, CheckCircle2 } from 'lucide-react'
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
    const [allUsers, setAllUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [ecoStats, setEcoStats] = useState(null)
    const [broadcastRefresh, setBroadcastRefresh] = useState(0)

    useEffect(() => {
        if (user && user.email !== 'yaya01234@naver.com') {
            alert("관리자 권한이 없습니다.")
            navigate('/')
            return
        }

        if (user) {
            fetchStats()
            fetchEcoStats()
            fetchAllUsers()
        }
    }, [user, navigate])

    const fetchAllUsers = async () => {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setAllUsers(data);
    };

    const fetchEcoStats = async () => {
        const { data } = await supabase.rpc('admin_get_economy_stats');
        if (data?.success) setEcoStats(data);
    };

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
                profiles!fk_visits_profiles (username)
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
        <div style={{ padding: '40px 40px 40px 24px', color: '#f8fafc', maxWidth: '1400px', margin: '0' }}>
            <h1 style={{ marginBottom: '30px', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <BarChart size={32} />
                관리자 대시보드 (Analytics)
            </h1>

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
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

            {/* Global Control Tower (Phase 1) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginBottom: '40px'
            }}>
                {/* 바이브 컨트롤 타워 (Vibe Control Tower) */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(168, 85, 247, 0.2)',
                    boxShadow: '0 8px 32px rgba(124, 58, 237, 0.1)'
                }}>
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#a855f7' }}>✨</span> 바이브 컨트롤 타워
                    </h3>
                    <div style={{ padding: '24px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '20px', border: '1px solid rgba(168, 85, 247, 0.2)', marginBottom: '20px' }}>
                        <div style={{ color: '#a78bfa', fontSize: '0.9rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Flame size={16} /> 전체 유통 포인트 (잔액 합계)
                        </div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{ecoStats?.points_in_circulation?.toLocaleString() || 0} P</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                            누적 획득: {ecoStats?.total_points_accumulated?.toLocaleString() || 0} P
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <VibeButton label="하이퍼 블루" color="#3b82f6" vibe="hyper_blue" />
                        <VibeButton label="퍼플 글로우" color="#a855f7" vibe="purple_glow" />
                        <VibeButton label="에메랄드 칠" color="#10b981" vibe="emerald_chill" />
                        <VibeButton label="블러드 문" color="#ef4444" vibe="blood_moon" />
                        <VibeButton label="기본 테마로 복구" color="#64748b" vibe="default" fullWidth />
                    </div>
                </div>

                {/* 전 서버 공지 (God-Mode Broadcast) */}
                <div style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    boxShadow: '0 8px 32px rgba(245, 158, 11, 0.1)'
                }}>
                    <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#f59e0b' }}>📢</span> 전 서버 공지 (God-Mode)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <textarea
                            id="broadcast-msg"
                            placeholder="모든 접속 유저에게 전파할 메시지를 입력하세요..."
                            style={{
                                background: 'rgba(15, 23, 42, 0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '12px',
                                padding: '12px',
                                color: '#fff',
                                height: '80px',
                                resize: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                        <button
                            onClick={async () => {
                                try {
                                    console.log('🎯 공지 전송 시작...');
                                    const msg = document.getElementById('broadcast-msg').value;
                                    console.log('📝 메시지:', msg);

                                    if (!msg) {
                                        console.warn('⚠️ 메시지가 비어있습니다');
                                        alert('메시지를 입력해주세요');
                                        return;
                                    }

                                    console.log('👤 사용자 ID:', user?.id);
                                    console.log('👤 사용자명:', user?.user_metadata?.username);

                                    // 사용자 프로필에서 username 조회 (선택사항)
                                    let senderName = user?.email || 'Admin';
                                    try {
                                        const { data: profile } = await Promise.race([
                                            supabase
                                                .from('profiles')
                                                .select('username')
                                                .eq('id', user.id)
                                                .single(),
                                            new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))
                                        ]);
                                        if (profile?.username) senderName = profile.username;
                                    } catch (err) {
                                        console.log('프로필 조회 스킵:', err);
                                    }

                                    const payload = {
                                        type: 'announcement',
                                        payload: {
                                            message: msg,
                                            sender: senderName
                                        },
                                        created_by: user.id,
                                        active: true
                                    };
                                    console.log('📦 전송할 데이터:', payload);

                                    const { data, error } = await supabase
                                        .from('admin_broadcasts')
                                        .insert([payload])
                                        .select();

                                    console.log('✅ 응답 데이터:', data);
                                    console.log('❌ 응답 에러:', error);

                                    if (error) {
                                        console.error('🔴 공지 전송 실패:', error);
                                        alert('공지 전송 실패:\n' + JSON.stringify(error, null, 2));
                                    } else {
                                        console.log('🟢 공지 전송 성공!');
                                        document.getElementById('broadcast-msg').value = '';
                                        alert('✅ 전 서버에 공지가 송출되었습니다!');

                                        // BroadcastMonitor는 Realtime으로 자동 업데이트되므로 강제 리프레시 불필요
                                        // setBroadcastRefresh(prev => prev + 1);
                                    }
                                } catch (err) {
                                    console.error('💥 전송 중 오류:', err);
                                    alert('오류 발생:\n' + err.message);
                                }
                            }}
                            style={{
                                padding: '10px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                color: '#fff',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            전체 배포 (Full-Screen)
                        </button>
                    </div>
                </div>
            </div>

            {/* 브로드캐스트 모니터: 실시간 공지/효과/투표 추적 (Broadcast Monitor) */}
            <BroadcastMonitor />

            {/* 유저 마스터: 가입자 UUID 확인 (User Master) */}
            <UserMaster users={allUsers} />

            {/* 카오스 & 블레싱 콘솔: 실시간 특수 효과 (FX Control) */}
            <ChaosConsole />

            {/* 오라클 아이: 실시간 유저 활동 (Oracle Eye) */}
            <OracleEye />

            {/* 배틀 디렉터: 활성 배틀 감독 (Battle Director) */}
            <BattleDirector />

            {/* 이코노미 & 인벤토리 마스터 (Economy Master) */}
            <EconomyMaster ecoStats={ecoStats} fetchEcoStats={fetchEcoStats} />

            {/* 피드백 마스터: 유저 피드백 관리 (Feedback Master) */}
            <FeedbackMaster />

            {/* 관리자 슬래시 터미널 (Admin Terminal) */}
            <AdminTerminal user={user} stats={stats} ecoStats={ecoStats} />

            {/* 최근 접속 기록 테이블 */}
            <VisitHistoryTable visits={recentVisits} />
        </div>
    )
}

const UserMaster = ({ users }) => {
    const [search, setSearch] = useState('');
    const filteredUsers = users.filter(u =>
        u.username?.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase())
    );

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('UUID가 클립보드에 복사되었습니다.');
    };

    const toggleBan = async (userId, currentStatus) => {
        if (!confirm(`정말로 이 유저를 ${currentStatus ? '차단 해제(Unban)' : '차단(Ban)'} 하시겠습니까?`)) return;

        const { data, error } = await supabase.rpc('admin_toggle_ban', { p_user_id: userId });

        if (data?.success) {
            alert(`처리되었습니다: ${data.new_status ? '차단됨' : '차단 해제됨'}`);
            // UI 업데이트는 상위 컴포넌트의 fetchAllUsers를 다시 호출하거나, 
            // 로컬 상태를 업데이트해야 하지만 여기서는 간편하게 새로고침 유도 또는 부모 리프레시 필요.
            // (실제로는 prop으로 refresh 함수를 받아오는 게 좋음)
            window.location.reload();
        } else {
            alert('실패했습니다: ' + (error?.message || data?.error));
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
            borderRadius: '24px',
            padding: '28px',
            marginBottom: '40px',
            border: '1px solid rgba(129, 140, 248, 0.1)',
            backdropFilter: 'blur(16px)',
            width: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s ease'
        }}>
            <h3 style={{
                marginBottom: '24px',
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#fff',
                fontWeight: '800',
                letterSpacing: '-0.5px'
            }}>
                <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)' }}>
                    <Users size={20} color="#818cf8" />
                </div>
                유저 마스터: 전체 대원 명단
            </h3>

            <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#818cf8', opacity: 0.6 }} />
                <input
                    type="text"
                    placeholder="대원 닉네임 또는 UUID 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '14px 16px 14px 48px',
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid rgba(129, 140, 248, 0.2)',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
                    }}
                    onFocus={(e) => {
                        e.target.style.border = '1px solid rgba(129, 140, 248, 0.6)';
                        e.target.style.background = 'rgba(0,0,0,0.4)';
                        e.target.style.boxShadow = '0 0 15px rgba(129, 140, 248, 0.15), inset 0 2px 4px rgba(0,0,0,0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.border = '1px solid rgba(129, 140, 248, 0.2)';
                        e.target.style.background = 'rgba(0,0,0,0.2)';
                        e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
                    }}
                />
            </div>

            <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                overflowX: 'auto',
                borderRadius: '16px',
                border: '1px solid rgba(129, 140, 248, 0.05)',
                background: 'rgba(0,0,0,0.15)'
            }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'separate',
                    borderSpacing: '0',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    tableLayout: 'auto'
                }}>
                    <thead style={{ background: 'rgba(15, 23, 42, 0.9)', position: 'sticky', top: 0, zIndex: 10 }}>
                        <tr>
                            <th style={{ padding: '16px', color: '#818cf8', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>회원 정보</th>
                            <th style={{ padding: '16px', color: '#818cf8', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>UUID (고유 식별자)</th>
                            <th style={{ padding: '16px', color: '#818cf8', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>가입일</th>
                            <th style={{ padding: '16px', color: '#818cf8', fontWeight: 'bold', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>관리 (Actions)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr
                                key={u.id}
                                style={{
                                    borderBottom: '1px solid rgba(129, 140, 248, 0.05)',
                                    transition: 'all 0.2s ease',
                                    cursor: 'default',
                                    background: u.is_banned ? 'rgba(239, 68, 68, 0.1)' : 'transparent'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = u.is_banned ? 'rgba(239, 68, 68, 0.15)' : 'rgba(129, 140, 248, 0.04)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = u.is_banned ? 'rgba(239, 68, 68, 0.1)' : 'none';
                                }}
                            >
                                <td style={{ padding: '16px' }}>
                                    <div style={{ fontWeight: '800', color: u.is_banned ? '#ef4444' : '#fff', fontSize: '1rem', textDecoration: u.is_banned ? 'line-through' : 'none' }}>
                                        {u.username || 'Unknown'}
                                        {u.is_banned && <span style={{ marginLeft: '8px', fontSize: '0.7rem', color: '#ef4444', border: '1px solid #ef4444', padding: '2px 6px', borderRadius: '4px' }}>BANNED</span>}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 'bold', marginTop: '2px' }}>RANK: LEVEL {u.level || 1}</div>
                                </td>
                                <td style={{ padding: '16px', maxWidth: '300px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <code style={{
                                            background: 'rgba(0,0,0,0.4)',
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            color: '#818cf8',
                                            fontSize: '0.8rem',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '220px',
                                            border: '1px solid rgba(129, 140, 248, 0.1)',
                                            fontFamily: 'monospace'
                                        }} title={u.id}>{u.id}</code>
                                        <button
                                            onClick={() => copyToClipboard(u.id)}
                                            style={{
                                                background: 'rgba(129, 140, 248, 0.1)',
                                                border: 'none',
                                                color: '#818cf8',
                                                padding: '6px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                flexShrink: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(129, 140, 248, 0.2)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(129, 140, 248, 0.1)'}
                                            title="UUID 복사"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td style={{ padding: '16px', color: '#94a3b8', fontSize: '0.85rem' }}>
                                    {new Date(u.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </td>
                                <td style={{ padding: '16px' }}>
                                    <button
                                        onClick={() => toggleBan(u.id, u.is_banned)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            border: u.is_banned ? '1px solid #10b981' : '1px solid #ef4444',
                                            background: u.is_banned ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: u.is_banned ? '#10b981' : '#ef4444',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            fontSize: '0.8rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <Shield size={14} />
                                        {u.is_banned ? '언밴 (Unban)' : '밴 (Ban)'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ChaosConsole = () => {
    const { user } = useAuth();
    const [pollQuestion, setPollQuestion] = useState('');
    const [lastFX, setLastFX] = useState(null);
    const [lastPoll, setLastPoll] = useState(null);

    const sendFX = async (fx) => {
        const { data, error } = await supabase.from('admin_broadcasts').insert({
            type: 'fx',
            payload: { fx },
            created_by: user.id,
            active: true
        }).select().single();

        if (error) {
            alert('이펙트 전송 실패: ' + error.message);
        } else {
            setLastFX({ ...data, broadcasted: new Date() });
            alert(`전 서버에 ${fx === 'confetti' ? '축복(폭죽)' : '카오스(글리치)'} 효과를 뿌렸습니다!`);
        }
    };

    const sendPoll = async () => {
        if (!pollQuestion.trim()) return;

        const { data, error } = await supabase.from('admin_broadcasts').insert({
            type: 'poll',
            payload: { question: pollQuestion },
            created_by: user.id,
            active: true
        }).select().single();

        if (error) {
            alert('투표 시작 실패: ' + error.message);
        } else {
            setLastPoll({ ...data, broadcasted: new Date() });
            alert('실시간 투표가 시작되었습니다!');
            setPollQuestion('');
        }
    };

    return (
        <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px'
        }}>
            {/* 시각 효과 제어 (Chaos & Blessing) */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
                borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} color="#fcd34d" />
                    카오스 & 블레싱 콘솔
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <button
                        onClick={() => sendFX('confetti')}
                        style={{ padding: '16px', borderRadius: '16px', border: '1px solid #10b981', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        🎊 하이퍼 폭죽 투하
                    </button>
                    <button
                        onClick={() => sendFX('glitch')}
                        style={{ padding: '16px', borderRadius: '16px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        ⚡ 디지털 카오스 (Glitch)
                    </button>
                </div>
                {lastFX && (
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(252, 211, 77, 0.2)',
                        fontSize: '0.85rem',
                        color: '#fcd34d'
                    }}>
                        ✓ 최근: {lastFX.payload.fx === 'confetti' ? '🎊 폭죽' : '⚡ 글리치'} - <strong>{lastFX.viewed_count || 0}</strong>명 수신
                    </div>
                )}
            </div>

            {/* 오라클 실시간 투표 (Oracle Poll) */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8))',
                borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)'
            }}>
                <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Megaphone size={20} color="#3b82f6" />
                    오라클 실시간 투표 전파
                </h3>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <input
                        type="text"
                        placeholder="예: 지금 다들 코딩 바이브 어떠신가요?"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        style={{ flex: 1, padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(129, 140, 248, 0.3)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem' }}
                    />
                    <button
                        onClick={sendPoll}
                        style={{ padding: '0 20px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        전파
                    </button>
                </div>
                {lastPoll && (
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '12px',
                        borderRadius: '12px',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        fontSize: '0.85rem',
                        color: '#cbd5e1'
                    }}>
                        <div style={{ marginBottom: '8px', color: '#3b82f6', fontWeight: 'bold' }}>
                            ✓ 진행 중: "{lastPoll.payload.question}"
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem' }}>
                            <div>👍 찬성: <strong style={{ color: '#3b82f6' }}>{lastPoll.votes_yes || 0}</strong></div>
                            <div>👎 반대: <strong style={{ color: '#ef4444' }}>{lastPoll.votes_no || 0}</strong></div>
                            <div>👥 수신: <strong>{lastPoll.viewed_count || 0}</strong>명</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const BattleDirector = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        fetchRooms();
        const channel = supabase.channel('battle_rooms_admin')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'battle_rooms' }, fetchRooms)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, []);

    const fetchRooms = async () => {
        const { data } = await supabase.from('battle_rooms')
            .select(`*, host:profiles!battle_rooms_host_id_fkey(username), guest:profiles!battle_rooms_guest_id_fkey(username)`)
            .in('status', ['waiting', 'playing'])
            .order('created_at', { ascending: false });
        if (data) setRooms(data);
    };

    const cancelRoom = async (roomId) => {
        const { data } = await supabase.rpc('cancel_battle_room', { p_room_id: roomId });
        if (data) alert('방이 강제 종료되었습니다.');
        fetchRooms();
    };

    const pokePlayers = (roomId) => {
        supabase.channel(`battle:${roomId}`).send({
            type: 'broadcast',
            event: 'director_poke',
            payload: { message: '관리자가 지켜보고 있습니다! 행쇼!' }
        });
        alert('플레이어들에게 자극을 주었습니다.');
    };

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '40px',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)'
        }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Swords size={20} color="#ef4444" />
                Battle Director: 활성 배틀 감독
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {rooms.map(room => (
                    <div key={room.id} style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        padding: '16px',
                        borderRadius: '16px',
                        border: `1px solid ${room.status === 'playing' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {room.status === 'playing' && (
                            <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div className="admin-sparkle" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                                <span style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 'bold' }}>LIVE</span>
                            </div>
                        )}
                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '4px' }}>{room.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '12px' }}>
                            방장: {room.host?.username || 'Unknown'} {room.guest ? `/ 상대: ${room.guest.username}` : ''}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => pokePlayers(room.id)}
                                style={{ flex: 1, padding: '6px', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', cursor: 'pointer' }}
                            >
                                자극 주기 (Poke)
                            </button>
                            <button
                                onClick={() => cancelRoom(room.id)}
                                style={{ flex: 1, padding: '6px', fontSize: '0.75rem', borderRadius: '8px', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer' }}
                            >
                                강제 종료
                            </button>
                        </div>
                    </div>
                ))}

                {rooms.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        활성화된 배틀 룸이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

const EconomyMaster = ({ ecoStats, fetchEcoStats }) => {
    const [searchId, setSearchId] = useState('');
    const [newPoints, setNewPoints] = useState('');
    const [updating, setUpdating] = useState(false);

    const handleUpdatePoints = async () => {
        if (!searchId || !newPoints || updating) return;
        setUpdating(true);
        const { data } = await supabase.rpc('admin_update_points', {
            p_user_id: searchId,
            p_points: parseInt(newPoints)
        });
        if (data?.success) {
            alert('포인트가 성공적으로 수정되었습니다.');
            fetchEcoStats();
            setNewPoints('');
        } else {
            alert('수정에 실패했습니다: ' + (data?.error || 'Unknown error'));
        }
        setUpdating(false);
    };

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '40px',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)'
        }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={20} color="#facc15" />
                이코노미 & 인벤토리 마스터
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Stats */}
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '20px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>커뮤니티 경제 지표</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>총 유통량</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#facc15' }}>
                                {ecoStats?.points_in_circulation?.toLocaleString() || 0} P
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>1인당 평균</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#cbd5e1' }}>
                                {ecoStats?.average_points?.toLocaleString() || 0} P
                            </div>
                        </div>
                    </div>
                </div>

                {/* Point Editor */}
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '20px', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>유저 포인트 강제 수정</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="User UUID"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                        />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="number"
                                placeholder="New Points"
                                value={newPoints}
                                onChange={(e) => setNewPoints(e.target.value)}
                                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                            />
                            <button
                                onClick={handleUpdatePoints}
                                disabled={updating}
                                style={{ background: '#facc15', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                                {updating ? '...' : '수정'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const OracleEye = () => {
    const [onlineUsers, setOnlineUsers] = useState({});

    useEffect(() => {
        const presenceChannel = supabase.channel('online-users');

        presenceChannel.on('presence', { event: 'sync' }, () => {
            setOnlineUsers(presenceChannel.presenceState());
        }).subscribe();

        return () => {
            supabase.removeChannel(presenceChannel);
        };
    }, []);

    const users = Object.values(onlineUsers).flat();
    const groupedUsers = users.reduce((acc, user) => {
        const path = user.currentPath || '/';
        if (!acc[path]) acc[path] = [];
        acc[path].push(user);
        return acc;
    }, {});

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '40px',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)'
        }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="#818cf8" />
                오라클 아이: 실시간 유저 활동
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {Object.entries(groupedUsers).map(([path, users]) => (
                    <div key={path} style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        padding: '16px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.03)'
                    }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {path} ({users.length})
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {users.map((u, i) => (
                                <div key={i} style={{ position: 'relative' }}>
                                    <div style={{
                                        width: '32px', height: '32px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 'bold', color: '#fff',
                                        boxShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
                                        cursor: 'help'
                                    }} title={u.username}>
                                        {u.username?.[0] || '비'}
                                    </div>
                                    <div style={{
                                        position: 'absolute', bottom: '-4px', right: '-4px',
                                        width: '10px', height: '10px', borderRadius: '50%',
                                        background: '#22c55e', border: '2px solid #0f172a'
                                    }} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {users.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        현재 접속 중인 유저가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

const VibeButton = ({ label, color, vibe, fullWidth }) => {
    const { user } = useAuth();
    const changeVibe = async () => {
        // 1. Secure Broadcast: Insert into DB
        const { error } = await supabase.from('admin_broadcasts').insert({
            type: 'vibe_change',
            payload: { vibe },
            created_by: user.id
        });

        if (error) {
            console.error('Vibe change failed:', error);
            return;
        }

        // 2. 관리자 본인의 화면 즉시 변경 (WebSocket 연결 지연 대비)
        window.dispatchEvent(new CustomEvent('local_vibe_change', { detail: vibe }));
    };

    return (
        <button
            onClick={changeVibe}
            style={{
                gridColumn: fullWidth ? 'span 2' : 'auto',
                padding: '10px',
                borderRadius: '10px',
                border: `1px solid ${color}40`,
                background: `${color}10`,
                color: color,
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.target.style.background = `${color}20`; e.target.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.target.style.background = `${color}10`; e.target.style.transform = 'translateY(0)'; }}
        >
            {label}
        </button>
    );
};

const AdminTerminal = ({ user, stats, ecoStats }) => {
    const [history, setHistory] = useState([
        { type: 'sys', text: 'Korea Coding Vibe Lab - 관리자 터미널 v1.0.5' },
        { type: 'sys', text: '사용 가능한 명령어를 확인하려면 /help 를 입력하세요.' },
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    const processCommand = async (e) => {
        if (e.key !== 'Enter' || !input.trim()) return;

        const cmdLine = input.trim();
        const [cmd, ...args] = cmdLine.split(' ');
        setInput('');
        setHistory(prev => [...prev, { type: 'in', text: `> ${cmdLine}` }]);

        switch (cmd.toLowerCase()) {
            case '/help':
                setHistory(prev => [...prev, { type: 'sys', text: '명령어: /vibe [이름], /broadcast [메시지], /clear, /whoami, /stats' }]);
                break;
            case '/clear':
                setHistory([{ type: 'sys', text: '터미널 상의 모든 로그가 초기화되었습니다.' }]);
                break;
            case '/whoami':
                setHistory(prev => [...prev, { type: 'sys', text: `현재 로그인 계정: ${user?.email}` }]);
                break;
            case '/vibe':
                const vibe = args[0] || 'default';
                await supabase.channel('vibe_broadcast').send({
                    type: 'broadcast',
                    event: 'change_vibe',
                    payload: { vibe }
                });
                setHistory(prev => [...prev, { type: 'sys', text: `전체 서버 테마가 변경됨: ${vibe}` }]);
                break;
            case '/broadcast':
                const msg = args.join(' ');
                if (!msg) {
                    setHistory(prev => [...prev, { type: 'err', text: '사용법: /broadcast [메시지]' }]);
                } else {
                    await supabase.channel('vibe_broadcast').send({
                        type: 'broadcast',
                        event: 'global_announce',
                        payload: { message: msg, sender: 'Admin Terminal' }
                    });
                    setHistory(prev => [...prev, { type: 'sys', text: '전체 서버 공지가 성공적으로 송출되었습니다.' }]);
                }
                break;
            case '/stats':
                setHistory(prev => [...prev,
                { type: 'sys', text: '--- 시스템 주요 지표 ---' },
                { type: 'sys', text: `총 회원 수: ${stats.totalUsers}명` },
                { type: 'sys', text: `오늘 방문자: ${stats.todayVisits}명` },
                { type: 'sys', text: `전체 유통 포인트: ${ecoStats?.points_in_circulation || 0} P` },
                { type: 'sys', text: `누적 획득 포인트: ${ecoStats?.total_points_accumulated || 0} P` },
                { type: 'sys', text: '----------------------' }
                ]);
                break;
            case '/give-points':
                const [targetUser, amount] = args;
                if (!targetUser || !amount) {
                    setHistory(prev => [...prev, { type: 'err', text: '사용법: /give-points [유저ID] [금액]' }]);
                } else {
                    const { data: res } = await supabase.rpc('admin_update_points', {
                        p_user_id: targetUser,
                        p_points: parseInt(amount)
                    });
                    if (res?.success) {
                        setHistory(prev => [...prev, { type: 'sys', text: `성공: ${targetUser}님의 포인트를 수정했습니다.` }]);
                    } else {
                        setHistory(prev => [...prev, { type: 'err', text: `오류: ${res?.error || '알 수 없는 에러'}` }]);
                    }
                }
                break;
            default:
                setHistory(prev => [...prev, { type: 'err', text: `알 수 없는 명령어: ${cmd}` }]);
        }
    };

    return (
        <div style={{
            background: '#000',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '40px',
            border: '1px solid #1e293b',
            boxShadow: '0 0 20px rgba(0,255,100,0.05)',
            fontFamily: '"Fira Code", monospace',
            color: '#0f0'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #111', paddingBottom: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27c93f' }} />
                <span style={{ marginLeft: '10px', fontSize: '0.75rem', color: '#444' }}>admin@vibe-lab: ~ (관리자 터미널)</span>
            </div>

            <div
                ref={scrollRef}
                style={{
                    height: '240px',
                    overflowY: 'auto',
                    marginBottom: '12px',
                    fontSize: '0.85rem'
                }}
            >
                {history.map((h, i) => (
                    <div key={i} style={{
                        marginBottom: '4px',
                        color: h.type === 'err' ? '#ef4444' : h.type === 'in' ? '#3b82f6' : '#0f0',
                        opacity: h.type === 'sys' ? 0.8 : 1
                    }}>
                        {h.text}
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#3b82f6' }}>$</span>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={processCommand}
                    placeholder="명령어를 입력하세요..."
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        outline: 'none',
                        width: '100%',
                        fontSize: '0.85rem'
                    }}
                />
            </div>
        </div>
    );
};

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

const FeedbackMaster = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [filter, setFilter] = useState('ALL'); // ALL, PENDING, RESOLVED

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        const { data, error } = await supabase
            .from('feedback')
            .select('*, profiles(username)')
            .order('created_at', { ascending: false });

        if (data) setFeedbacks(data);
        if (error) console.error('Error fetching feedbacks:', error);
    };

    const updateStatus = async (id, newStatus) => {
        const { error } = await supabase
            .from('feedback')
            .update({ status: newStatus, updated_at: new Date() })
            .eq('id', id);

        if (!error) {
            alert('상태가 변경되었습니다.');
            fetchFeedbacks();
        } else {
            alert('상태 변경 실패: ' + error.message);
        }
    };

    const filteredFeedbacks = feedbacks.filter(f => filter === 'ALL' ? true : f.status === filter);

    return (
        <div style={{
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '40px',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)'
        }}>
            <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={20} color="#f472b6" />
                피드백 마스터: 유저 제보 및 문의
            </h3>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                {['ALL', 'PENDING', 'RESOLVED'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: filter === status ? '1px solid #f472b6' : '1px solid rgba(255,255,255,0.1)',
                            background: filter === status ? 'rgba(244, 114, 182, 0.1)' : 'transparent',
                            color: filter === status ? '#f472b6' : '#94a3b8',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem'
                        }}
                    >
                        {status === 'ALL' ? '전체' : status === 'PENDING' ? '대기중' : '완료됨'}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                {filteredFeedbacks.map(item => (
                    <div key={item.id} style={{
                        background: 'rgba(30, 41, 59, 0.6)',
                        padding: '20px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: 'bold',
                                    padding: '4px 8px', borderRadius: '6px',
                                    background: item.category === 'BUG_REPORT' ? 'rgba(239, 68, 68, 0.1)' :
                                        item.category === 'INQUIRY' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(250, 204, 21, 0.1)',
                                    color: item.category === 'BUG_REPORT' ? '#ef4444' :
                                        item.category === 'INQUIRY' ? '#818cf8' : '#facc15'
                                }}>
                                    {item.category}
                                </span>
                                <span style={{ fontSize: '0.9rem', color: '#e2e8f0', fontWeight: 'bold' }}>
                                    {item.profiles?.username || 'Unknown User'}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    {new Date(item.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {item.status === 'PENDING' && (
                                    <button
                                        onClick={() => updateStatus(item.id, 'RESOLVED')}
                                        style={{
                                            padding: '6px 12px', borderRadius: '8px', border: 'none',
                                            background: '#10b981', color: 'white', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer'
                                        }}
                                    >
                                        처리 완료
                                    </button>
                                )}
                                {item.status === 'RESOLVED' && (
                                    <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <CheckCircle2 size={14} /> 완료됨
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{
                            fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.5',
                            background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px'
                        }}>
                            {item.content}
                        </div>
                    </div>
                ))}
                {filteredFeedbacks.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        표시할 피드백이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

const BroadcastMonitor = () => {
    const [broadcasts, setBroadcasts] = useState([]);
    const [filter, setFilter] = useState('all'); // all, announcement, fx, poll
    const [deactivatingId, setDeactivatingId] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);

    const fetchBroadcasts = useCallback(async () => {
        try {
            console.log('📡 브로드캐스트 조회 중...');
            const { data, error } = await supabase
                .from('admin_broadcasts')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                console.error('조회 에러:', error);
                return;
            }

            if (data) {
                // 각 broadcast의 created_by 사용자 정보 조회 (Batch Fetching 최적화)
                const userIds = [...new Set(data.filter(b => b.created_by).map(b => b.created_by))];
                let profileMap = {};

                if (userIds.length > 0) {
                    const { data: profiles, error: profileError } = await supabase
                        .from('profiles')
                        .select('id, username')
                        .in('id', userIds);

                    if (profiles) {
                        profiles.forEach(p => { profileMap[p.id] = p; });
                    }
                }

                const broadcasts = data.map(bc => ({
                    ...bc,
                    profiles: profileMap[bc.created_by] || null
                }));

                console.log('✅ 브로드캐스트 로드:', broadcasts.length, '개 (Batch Processed)');
                setBroadcasts(broadcasts);
                setLastUpdate(new Date());
            }
        } catch (err) {
            console.error('💥 fetchBroadcasts 에러:', err);
        }
    }, []);

    useEffect(() => {
        // 초기 로드
        fetchBroadcasts();

        // Realtime 구독 (최적화: 부분 업데이트)
        const channel = supabase
            .channel('broadcast_monitor')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'admin_broadcasts'
            }, (payload) => {
                // INSERT: 목록 맨 앞에 추가
                if (payload.eventType === 'INSERT') {
                    const newBroadcast = payload.new;
                    // 프로필 정보가 없으므로 일단 껍데기만 추가하고, 필요시 개별 로드하거나
                    // 그냥 Admin(System)으로 표시
                    setBroadcasts(prev => [newBroadcast, ...prev]);
                }
                // UPDATE: 해당 항목만 찾아서 교체 (전체 리로드 방지)
                else if (payload.eventType === 'UPDATE') {
                    setBroadcasts(prev => prev.map(item =>
                        item.id === payload.new.id ? { ...item, ...payload.new } : item
                    ));
                    // 종료(active: false)된 경우, UI에서 즉시 반영
                    if (payload.new.active === false) {
                        console.log('Broadcast terminated:', payload.new.id);
                    }
                }
                // DELETE: 목록에서 제거
                else if (payload.eventType === 'DELETE') {
                    setBroadcasts(prev => prev.filter(item => item.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [fetchBroadcasts]);

    const deactivateBroadcast = async (id) => {
        setDeactivatingId(id);
        const { error } = await supabase
            .from('admin_broadcasts')
            .update({ active: false })
            .eq('id', id);

        if (error) {
            alert('종료 실패: ' + error.message);
        } else {
            alert('브로드캐스트가 종료되었습니다.');
            // Optimistic Update (혹시 Realtime 늦을 경우 대비)
            setBroadcasts(prev => prev.map(b => b.id === id ? { ...b, active: false } : b));
        }
        setDeactivatingId(null);
        // fetchBroadcasts(); // Realtime이 처리하므로 불필요, 하지만 확실히 하기 위해 유지해도 됨 (일단 주석)
    };

    const filteredBroadcasts = filter === 'all'
        ? broadcasts
        : broadcasts.filter(b => b.type === filter);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
            borderRadius: '24px',
            padding: '28px',
            marginBottom: '40px',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        }}>
            <h3 style={{
                marginBottom: '24px',
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#fff',
                fontWeight: '800',
            }}>
                <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)' }}>
                    <Megaphone size={20} color="#a855f7" />
                </div>
                브로드캐스트 모니터: 실시간 공지/효과/투표 추적
            </h3>

            {/* 필터 탭 + 새로고침 */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                    { key: 'all', label: '전체', icon: '📊' },
                    { key: 'announcement', label: '공지', icon: '📢' },
                    { key: 'fx', label: '효과', icon: '✨' },
                    { key: 'poll', label: '투표', icon: '🗳️' }
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: filter === tab.key ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                            background: filter === tab.key ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                            color: filter === tab.key ? '#a855f7' : '#94a3b8',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {lastUpdate ? `최근: ${lastUpdate.toLocaleTimeString()}` : '로딩중...'}
                    </span>
                    <button
                        onClick={fetchBroadcasts}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #34d399',
                            background: 'rgba(52, 211, 153, 0.1)',
                            color: '#34d399',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            transition: 'all 0.2s'
                        }}
                    >
                        🔄 새로고침
                    </button>
                </div>
            </div>

            {/* 브로드캐스트 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                {filteredBroadcasts.map(bc => (
                    <div key={bc.id} style={{
                        background: bc.active ? 'rgba(30, 41, 59, 0.6)' : 'rgba(15, 23, 42, 0.4)', // 종료된 항목은 더 어둡게
                        padding: '16px',
                        borderRadius: '16px',
                        border: `1px solid ${bc.active ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.05)'}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        opacity: bc.active ? 1 : 0.6, // 종료된 항목 투명도 낮춤
                        transition: 'all 0.3s ease'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                <span style={{
                                    fontSize: '0.75rem', fontWeight: 'bold',
                                    padding: '4px 8px', borderRadius: '6px',
                                    background: bc.type === 'announcement' ? 'rgba(245, 158, 11, 0.1)' :
                                        bc.type === 'fx' ? 'rgba(168, 85, 247, 0.1)' :
                                            'rgba(99, 102, 241, 0.1)',
                                    color: bc.type === 'announcement' ? '#f59e0b' :
                                        bc.type === 'fx' ? '#a855f7' : '#818cf8'
                                }}>
                                    {bc.type === 'announcement' ? '📢 공지' :
                                        bc.type === 'fx' ? '✨ 효과' :
                                            bc.type === 'poll' ? '🗳️ 투표' : '🎨 테마'}
                                </span>
                                <span style={{
                                    fontSize: '0.7rem', color: '#64748b'
                                }}>
                                    {new Date(bc.created_at).toLocaleString('ko-KR')}
                                </span>
                                <span style={{
                                    fontSize: '0.7rem',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: bc.active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                                    color: bc.active ? '#22c55e' : '#94a3b8'
                                }}>
                                    {bc.active ? '🟢 활성' : '⚫ 종료'}
                                </span>
                            </div>

                            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', marginBottom: '8px' }}>
                                {bc.type === 'announcement' && bc.payload?.message}
                                {bc.type === 'fx' && `${bc.payload?.fx === 'confetti' ? '🎊 폭죽' : '⚡ 글리치'} 효과 송출`}
                                {bc.type === 'poll' && `❓ ${bc.payload?.question}`}
                            </div>

                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '0.85rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8' }}>
                                    <Users size={14} />
                                    <strong>{bc.viewed_count}</strong> 수신
                                </div>

                                {bc.type === 'poll' && (
                                    <div style={{ display: 'flex', gap: '12px', color: '#cbd5e1' }}>
                                        <div style={{ color: '#3b82f6' }}>
                                            👍 {bc.votes_yes || 0}
                                        </div>
                                        <div style={{ color: '#ef4444' }}>
                                            👎 {bc.votes_no || 0}
                                        </div>
                                    </div>
                                )}

                                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                    by {bc.profiles?.username || 'Admin'}
                                </span>
                            </div>
                        </div>

                        {bc.active && (
                            <button
                                onClick={() => deactivateBroadcast(bc.id)}
                                disabled={deactivatingId === bc.id}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    border: '1px solid #ef4444',
                                    background: deactivatingId === bc.id ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                                    color: '#ef4444',
                                    cursor: deactivatingId === bc.id ? 'not-allowed' : 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    marginLeft: '16px',
                                    opacity: deactivatingId === bc.id ? 0.6 : 1,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {deactivatingId === bc.id ? '처리중...' : '종료'}
                            </button>
                        )}
                    </div>
                ))}

                {filteredBroadcasts.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        아직 브로드캐스트가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

const VisitHistoryTable = ({ visits }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
    const [userTypeFilter, setUserTypeFilter] = useState('all'); // all, member, guest
    const [deviceFilter, setDeviceFilter] = useState('all'); // all, pc, mobile

    // 필터링 로직
    const filteredVisits = visits.filter(visit => {
        // 날짜 필터
        const visitDate = new Date(visit.created_at);
        const now = new Date();
        let dateOk = true;

        if (dateFilter === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dateOk = visitDate >= today;
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            dateOk = visitDate >= weekAgo;
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            dateOk = visitDate >= monthAgo;
        }

        // 유저 타입 필터
        let userTypeOk = true;
        if (userTypeFilter === 'member') userTypeOk = !!visit.user_id;
        if (userTypeFilter === 'guest') userTypeOk = !visit.user_id;

        // 디바이스 필터
        let deviceOk = true;
        const isPC = visit.metadata?.screen_width > 768;
        if (deviceFilter === 'pc') deviceOk = isPC;
        if (deviceFilter === 'mobile') deviceOk = !isPC;

        return dateOk && userTypeOk && deviceOk;
    });

    // 페이지네이션
    const totalPages = Math.ceil(filteredVisits.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const paginatedVisits = filteredVisits.slice(startIdx, endIdx);

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
            borderRadius: '24px',
            padding: '28px',
            marginBottom: '40px',
            border: '1px solid rgba(129, 140, 248, 0.1)',
            backdropFilter: 'blur(16px)'
        }}>
            <h3 style={{
                marginBottom: '24px',
                fontSize: '1.3rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#fff',
                fontWeight: '800'
            }}>
                <div style={{ padding: '8px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)' }}>
                    📊
                </div>
                최근 접속 기록 (Latest Visits)
            </h3>

            {/* 필터 탭 */}
            <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {/* 날짜 필터 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                        { key: 'all', label: '전체' },
                        { key: 'today', label: '오늘' },
                        { key: 'week', label: '1주일' },
                        { key: 'month', label: '1개월' }
                    ].map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => { setDateFilter(opt.key); setCurrentPage(1); }}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: dateFilter === opt.key ? '1px solid #818cf8' : '1px solid rgba(255,255,255,0.1)',
                                background: dateFilter === opt.key ? 'rgba(129, 140, 248, 0.2)' : 'transparent',
                                color: dateFilter === opt.key ? '#818cf8' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* 유저 타입 필터 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                        { key: 'all', label: '전체' },
                        { key: 'member', label: '회원' },
                        { key: 'guest', label: '비회원' }
                    ].map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => { setUserTypeFilter(opt.key); setCurrentPage(1); }}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: userTypeFilter === opt.key ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.1)',
                                background: userTypeFilter === opt.key ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                                color: userTypeFilter === opt.key ? '#34d399' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* 디바이스 필터 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                        { key: 'all', label: '전체' },
                        { key: 'pc', label: '🖥️ PC' },
                        { key: 'mobile', label: '📱 Mobile' }
                    ].map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => { setDeviceFilter(opt.key); setCurrentPage(1); }}
                            style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: deviceFilter === opt.key ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                                background: deviceFilter === opt.key ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
                                color: deviceFilter === opt.key ? '#f59e0b' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 'bold',
                                transition: 'all 0.2s'
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 통계 */}
            <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '12px',
                fontSize: '0.85rem',
                color: '#94a3b8',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <span>
                    총 <strong style={{ color: '#818cf8' }}>{filteredVisits.length}</strong>건 중
                    <strong style={{ color: '#34d399', marginLeft: '8px' }}>{startIdx + 1}~{Math.min(endIdx, filteredVisits.length)}</strong>표시
                </span>
                <span>
                    페이지 <strong style={{ color: '#f59e0b' }}>{currentPage}</strong> / <strong>{totalPages}</strong>
                </span>
            </div>

            {/* 테이블 */}
            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', tableLayout: 'auto' }}>
                    <thead style={{ background: 'rgba(15, 23, 42, 0.8)', position: 'sticky', top: 0 }}>
                        <tr>
                            <th style={{ padding: '12px', color: '#818cf8', fontWeight: 'bold', textAlign: 'left' }}>시간</th>
                            <th style={{ padding: '12px', color: '#818cf8', fontWeight: 'bold', textAlign: 'left' }}>유저</th>
                            <th style={{ padding: '12px', color: '#818cf8', fontWeight: 'bold', textAlign: 'left' }}>페이지</th>
                            <th style={{ padding: '12px', color: '#818cf8', fontWeight: 'bold', textAlign: 'left' }}>디바이스</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedVisits.map((visit, idx) => (
                            <tr
                                key={visit.id}
                                style={{
                                    borderBottom: '1px solid rgba(129, 140, 248, 0.05)',
                                    background: idx % 2 === 0 ? 'transparent' : 'rgba(99, 102, 241, 0.02)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)'}
                                onMouseOut={(e) => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(99, 102, 241, 0.02)'}
                            >
                                <td style={{ padding: '12px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                                    {new Date(visit.created_at).toLocaleString('ko-KR')}
                                </td>
                                <td style={{ padding: '12px', color: visit.user_id ? '#a5b4fc' : '#94a3b8' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        {visit.user_id ? '👤 회원' : '👥 비회원'}
                                    </div>
                                    {visit.user_id && (
                                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                                            {visit.user_id.substring(0, 8)}...
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: '12px', color: '#e2e8f0', fontSize: '0.9rem' }}>
                                    <span style={{
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem'
                                    }}>
                                        {visit.page_path}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                    {visit.metadata?.screen_width > 768 ? '🖥️ PC' : '📱 Mobile'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            background: currentPage === 1 ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            opacity: currentPage === 1 ? 0.5 : 1
                        }}
                    >
                        « 처음
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages)
                        .map((page, idx, arr) => (
                            <div key={page}>
                                {idx > 0 && arr[idx - 1] !== page - 1 && (
                                    <span style={{ padding: '8px 4px', color: '#64748b' }}>...</span>
                                )}
                                <button
                                    onClick={() => setCurrentPage(page)}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                        background: currentPage === page ? 'rgba(99, 102, 241, 0.6)' : 'rgba(99, 102, 241, 0.2)',
                                        color: currentPage === page ? '#fff' : '#818cf8',
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {page}
                                </button>
                            </div>
                        ))}

                    <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            background: currentPage === totalPages ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.2)',
                            color: '#818cf8',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            opacity: currentPage === totalPages ? 0.5 : 1
                        }}
                    >
                        끝 »
                    </button>
                </div>
            )}

            {paginatedVisits.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                    필터에 맞는 접속 기록이 없습니다.
                </div>
            )}
        </div>
    );
};

export default Admin
