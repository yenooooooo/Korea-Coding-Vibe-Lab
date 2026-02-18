import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Monitor } from 'lucide-react';

const VideoPlayer = ({ stream, isMe, username, isMuted, isScreenShare }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            background: isScreenShare ? '#0f172a' : '#1a1f3a',
            borderRadius: '12px',
            overflow: 'hidden',
            border: isMe ? '2.5px solid #6366f1' : '1px solid rgba(148, 163, 184, 0.3)',
            boxShadow: isMe
                ? '0 0 20px rgba(99, 102, 241, 0.4), inset 0 0 20px rgba(99, 102, 241, 0.1)'
                : isScreenShare
                    ? '0 0 16px rgba(59, 130, 246, 0.3)'
                    : '0 8px 32px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
        }}>
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMe}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: (isMe && !isScreenShare) ? 'scaleX(-1)' : 'none',
                }}
            />

            {/* 화면공유 상태 배지 */}
            {isScreenShare && (
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: 'rgba(59, 130, 246, 0.9)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(8px)',
                    zIndex: 10,
                }}>
                    <Monitor size={14} color="#fff" />
                    <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 'bold' }}>
                        화면공유
                    </span>
                </div>
            )}

            {/* 하단 정보 오버레이 */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '12px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)',
                borderRadius: '0 0 12px 12px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                backdropFilter: 'blur(4px)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                        fontSize: '0.95rem',
                        color: '#fff',
                        fontWeight: '600',
                        letterSpacing: '0.3px',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}>
                        {username || 'Unknown'}
                        {isMe && <span style={{ color: '#a0aec0', fontSize: '0.85rem', marginLeft: '4px' }}>(나)</span>}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isMuted ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            borderRadius: '6px',
                            backdropFilter: 'blur(4px)',
                        }}>
                            <MicOff size={16} color="#ef4444" />
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            background: 'rgba(34, 197, 94, 0.2)',
                            borderRadius: '6px',
                            backdropFilter: 'blur(4px)',
                        }}>
                            <Mic size={16} color="#22c55e" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
