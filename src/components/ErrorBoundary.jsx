import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('React Error Boundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0f172a',
                    color: '#f8fafc',
                    padding: '20px',
                    textAlign: 'center',
                }}>
                    <div style={{ maxWidth: '500px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                        <h2 style={{ marginBottom: '12px' }}>페이지 로딩 중 오류가 발생했습니다</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '0.9rem' }}>
                            {this.state.error?.message || '알 수 없는 오류'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '12px 32px',
                                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                border: 'none',
                                borderRadius: '12px',
                                color: '#fff',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '1rem',
                            }}
                        >
                            새로고침
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
