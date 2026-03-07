
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

const SignUp = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const { signUp, signInWithOAuth } = useAuth()
    const { success } = useToast()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("비밀번호가 일치하지 않습니다.")
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await signUp(email, password)

        if (error) {
            console.error(error)
            // Friendly error message for rate limit
            if (error.message?.includes("rate limit") || error.status === 429) {
                setError("이메일 가입 요청이 너무 많습니다. 잠시 후(약 1시간) 다시 시도해주세요.")
            } else {
                setError(error.message)
            }
            setLoading(false)
        } else {
            success('계정이 생성되었습니다! 이메일을 확인 후 로그인해주세요.', 6000)
            navigate('/login')
        }
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#f8fafc'
        }}>
            <div style={{
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(10px)',
                padding: '40px',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '2rem', fontWeight: 'bold' }}>회원가입</h2>

                {error && (
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        color: '#fca5a5',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>이메일</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(15, 23, 42, 0.5)',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(15, 23, 42, 0.5)',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1' }}>비밀번호 확인</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                background: 'rgba(15, 23, 42, 0.5)',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '14px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            marginTop: '10px'
                        }}
                    >
                        {loading ? '가입 중...' : '회원가입'}
                    </button>

                    {/* 소셜 로그인 설정 완료 후 주석 해제
                    <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span style={{ padding: '0 10px', color: '#64748b', fontSize: '0.8rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button type="button" onClick={() => signInWithOAuth('google')}>Google로 계속하기</button>
                        <button type="button" onClick={() => signInWithOAuth('kakao')}>Kakao로 계속하기</button>
                    </div>
                    */}
                </form>
                <div style={{ marginTop: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                    이미 계정이 있으신가요? <Link to="/login" style={{ color: '#818cf8', textDecoration: 'none' }}>로그인</Link>
                </div>
            </div>
        </div>
    )
}

export default SignUp
