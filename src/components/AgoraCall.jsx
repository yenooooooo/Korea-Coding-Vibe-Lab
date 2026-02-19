import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, Copy, Check } from 'lucide-react';

const AgoraCall = ({ channelName, token, uid, onError, onExit }) => {
    const [micEnabled, setMicEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [remoteUsers, setRemoteUsers] = useState(new Map());
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const localVideoRef = useRef(null);
    const agoraEngineRef = useRef(null);
    const rtcRef = useRef(null);

    useEffect(() => {
        setupAgora();
        return () => {
            cleanupAgora();
        };
    }, [channelName, token, uid]);

    const setupAgora = async () => {
        try {
            setLoading(true);

            // Agora SDK 동적 로드
            const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

            // Agora 클라이언트 생성
            const client = AgoraRTC.createClient({
                mode: 'rtc',
                codec: 'vp8' // 또는 'h264'
            });

            agoraEngineRef.current = client;

            // 원격 사용자 구독
            client.on('user-published', async (user, mediaType) => {
                await client.subscribe(user, mediaType);

                if (mediaType === 'video') {
                    setRemoteUsers(prev => {
                        const updated = new Map(prev);
                        updated.set(user.uid, user);
                        return updated;
                    });

                    // 비디오 렌더링
                    setTimeout(() => {
                        const container = document.getElementById(`remote-${user.uid}`);
                        if (container) {
                            user.videoTrack?.play(container);
                        }
                    }, 100);
                }

                if (mediaType === 'audio') {
                    user.audioTrack?.play();
                }
            });

            // 원격 사용자 구독 취소
            client.on('user-unpublished', (user, mediaType) => {
                if (mediaType === 'video') {
                    user.videoTrack?.stop();
                    setRemoteUsers(prev => {
                        const updated = new Map(prev);
                        updated.delete(user.uid);
                        return updated;
                    });
                }
                if (mediaType === 'audio') {
                    user.audioTrack?.stop();
                }
            });

            // 사용자 연결 해제
            client.on('user-left', (user) => {
                console.log('User left:', user.uid);
                setRemoteUsers(prev => {
                    const updated = new Map(prev);
                    updated.delete(user.uid);
                    return updated;
                });
            });

            // 채널 입장
            await client.join(
                import.meta.env.VITE_AGORA_APP_ID,
                channelName,
                token,
                uid
            );

            // 로컬 트랙 생성
            const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            const localVideoTrack = await AgoraRTC.createCameraVideoTrack();

            // 로컬 비디오 렌더링
            if (localVideoRef.current) {
                localVideoTrack.play(localVideoRef.current);
            }

            // 로컬 트랙 게시
            await client.publish([localAudioTrack, localVideoTrack]);

            // 트랙 참조 저장
            rtcRef.current = {
                localAudioTrack,
                localVideoTrack,
                client
            };

            setLoading(false);
        } catch (error) {
            console.error('Agora setup error:', error);
            if (onError) {
                onError(error.message || '화상통화 설정 중 오류가 발생했습니다');
            }
            setLoading(false);
        }
    };

    const cleanupAgora = async () => {
        if (rtcRef.current) {
            const { localAudioTrack, localVideoTrack, client } = rtcRef.current;

            localAudioTrack?.close();
            localVideoTrack?.close();

            await client?.leave();
        }
    };

    const toggleMic = async () => {
        if (rtcRef.current?.localAudioTrack) {
            await rtcRef.current.localAudioTrack.setEnabled(!micEnabled);
            setMicEnabled(!micEnabled);
        }
    };

    const toggleVideo = async () => {
        if (rtcRef.current?.localVideoTrack) {
            await rtcRef.current.localVideoTrack.setEnabled(!videoEnabled);
            setVideoEnabled(!videoEnabled);
        }
    };

    const handleHangup = async () => {
        await cleanupAgora();
        if (onExit) {
            onExit();
        }
    };

    const copyChannelInfo = () => {
        const info = `채널: ${channelName}\nUID: ${uid}`;
        navigator.clipboard.writeText(info);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#1a1a1a',
                color: '#fff'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem', animation: 'spin 1s linear infinite', marginBottom: '20px' }}>
                        📹
                    </div>
                    <p>화상통화 설정 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            height: '100%',
            background: '#1a1a1a',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* 메인 비디오 영역 */}
            <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: remoteUsers.size > 0 ? '1fr 1fr' : '1fr',
                gap: '12px',
                padding: '16px',
                overflowY: 'auto'
            }}>
                {/* 로컬 비디오 */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        background: '#0a0a0a',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        position: 'relative',
                        aspectRatio: '16/9',
                        border: '2px solid rgba(168, 85, 247, 0.3)'
                    }}
                >
                    <div ref={localVideoRef} style={{ width: '100%', height: '100%' }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                    }}>
                        👤 나 (UID: {uid})
                    </div>
                </motion.div>

                {/* 원격 비디오들 */}
                {Array.from(remoteUsers.values()).map((user, idx) => (
                    <motion.div
                        key={user.uid}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        style={{
                            background: '#0a0a0a',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            position: 'relative',
                            aspectRatio: '16/9',
                            border: '2px solid rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <div id={`remote-${user.uid}`} style={{ width: '100%', height: '100%' }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '12px',
                            left: '12px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}>
                            👥 참가자 (UID: {user.uid})
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 하단 컨트롤 바 */}
            <div style={{
                padding: '20px',
                background: 'rgba(26, 26, 26, 0.95)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                flexWrap: 'wrap'
            }}>
                {/* 마이크 토글 */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleMic}
                    style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: 'none',
                        background: micEnabled
                            ? 'rgba(168, 85, 247, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        color: micEnabled ? '#c084fc' : '#fca5a5',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s'
                    }}
                    title={micEnabled ? '마이크 끄기' : '마이크 켜기'}
                >
                    {micEnabled ? (
                        <>
                            <Mic size={18} />
                            마이크
                        </>
                    ) : (
                        <>
                            <MicOff size={18} />
                            마이크 끔
                        </>
                    )}
                </motion.button>

                {/* 카메라 토글 */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleVideo}
                    style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        border: 'none',
                        background: videoEnabled
                            ? 'rgba(99, 102, 241, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                        color: videoEnabled ? '#a5b4fc' : '#fca5a5',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s'
                    }}
                    title={videoEnabled ? '카메라 끄기' : '카메라 켜기'}
                >
                    {videoEnabled ? (
                        <>
                            <Video size={18} />
                            카메라
                        </>
                    ) : (
                        <>
                            <VideoOff size={18} />
                            카메라 끔
                        </>
                    )}
                </motion.button>

                {/* 참가자 수 표시 */}
                <div style={{
                    padding: '8px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.9rem',
                    color: '#cbd5e1'
                }}>
                    <Users size={16} />
                    <span>
                        {remoteUsers.size + 1}명 참가 중
                    </span>
                </div>

                {/* 통화 정보 복사 */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={copyChannelInfo}
                    style={{
                        padding: '8px 14px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '500'
                    }}
                >
                    {copied ? (
                        <>
                            <Check size={14} color="#10b981" />
                            복사됨
                        </>
                    ) : (
                        <>
                            <Copy size={14} />
                            정보 복사
                        </>
                    )}
                </motion.button>

                {/* 통화 종료 */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleHangup}
                    style={{
                        padding: '14px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#ef4444',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '700',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s'
                    }}
                    title="통화 종료"
                >
                    <PhoneOff size={18} />
                    통화 종료
                </motion.button>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AgoraCall;
