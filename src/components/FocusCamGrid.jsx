import React from 'react';
import { useFocusCam } from '../context/FocusCamContext';
import VideoPlayer from './VideoPlayer';
import { Mic, MicOff, Video, VideoOff, Monitor, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const FocusCamGrid = ({ onClose }) => {
    const {
        myStream,
        peers,
        leaveRoom,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
        isScreenSharing
    } = useFocusCam();

    const [isMicOn, setIsMicOn] = React.useState(false); // 기본 Mute
    const [isCamOn, setIsCamOn] = React.useState(true);

    const handleToggleAudio = () => {
        const newState = toggleAudio();
        setIsMicOn(newState);
    };

    const handleToggleVideo = () => {
        const newState = toggleVideo();
        setIsCamOn(newState);
    };

    const handleLeave = () => {
        leaveRoom();
        if (onClose) onClose();
    };

    const participants = [
        { id: 'me', stream: myStream, isMe: true, username: '나' },
        ...Object.entries(peers).map(([id, p]) => ({
            id,
            stream: p.stream,
            isMe: false,
            username: p.userProfile?.username || 'Vibe Mate'
        }))
    ];

    // 그리드 계산 (1명: 1fr, 2명: 1fr 1fr, 3~4명: 2x2, 5~6명: 2x3...)
    const gridCols = participants.length <= 1 ? '1fr' : participants.length <= 4 ? '1fr 1fr' : 'repeat(3, 1fr)';

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            background: 'linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)',
            borderRadius: '16px',
            overflow: 'hidden',
        }}>
            {/* 비디오 그리드 영역 */}
            <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: gridCols,
                gap: '12px',
                padding: '12px',
                overflowY: 'auto',
                background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.6), rgba(26, 31, 58, 0.8))',
            }}>
                {participants.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        style={{ aspectRatio: '16/9', minHeight: '150px' }}
                    >
                        <VideoPlayer
                            stream={p.stream}
                            isMe={p.isMe}
                            username={p.username}
                            isMuted={!isMicOn && p.isMe}
                            isScreenShare={isScreenSharing && p.isMe}
                        />
                    </motion.div>
                ))}
            </div>

            {/* 하단 컨트롤 바 */}
            <div style={{
                height: '90px',
                background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                padding: '0 16px',
            }}>
                <ControlBtn
                    onClick={handleToggleAudio}
                    active={isMicOn}
                    icon={isMicOn ? <Mic /> : <MicOff />}
                    label={isMicOn ? '음소거' : '음소거 해제'}
                    color="#ef4444"
                />
                <ControlBtn
                    onClick={handleToggleVideo}
                    active={isCamOn}
                    icon={isCamOn ? <Video /> : <VideoOff />}
                    label={isCamOn ? '카메라 끄기' : '카메라 켜기'}
                    color="#f59e0b"
                />
                <ControlBtn
                    onClick={toggleScreenShare}
                    active={isScreenSharing}
                    icon={<Monitor />}
                    label="화면 공유"
                    color="#3b82f6"
                />
                <div style={{
                    width: '1px',
                    height: '50px',
                    background: 'linear-gradient(to bottom, transparent, rgba(148, 163, 184, 0.3), transparent)',
                    margin: '0 8px'
                }}></div>
                <ControlBtn
                    onClick={handleLeave}
                    active={true}
                    icon={<LogOut />}
                    label="나가기"
                    color="#ef4444"
                    danger
                />
            </div>
        </div>
    );
};

const ControlBtn = ({ onClick, active, icon, label, color, danger }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <motion.button
            onClick={onClick}
            title={label}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: 'none',
                background: danger
                    ? isHovered
                        ? 'rgba(239, 68, 68, 0.9)'
                        : 'rgba(239, 68, 68, 0.8)'
                    : active
                        ? `linear-gradient(135deg, ${color}, ${color}dd)`
                        : 'rgba(51, 65, 85, 0.6)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: isHovered || active
                    ? danger
                        ? '0 0 20px rgba(239, 68, 68, 0.5)'
                        : `0 0 20px ${color}66, 0 4px 12px rgba(0,0,0,0.3)`
                    : '0 4px 12px rgba(0,0,0,0.2)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* 활성 상태 인디케이터 */}
            {active && !danger && (
                <motion.div
                    layoutId="activeIndicator"
                    style={{
                        position: 'absolute',
                        bottom: '4px',
                        width: '20px',
                        height: '3px',
                        background: color,
                        borderRadius: '2px',
                    }}
                />
            )}

            {React.cloneElement(icon, { size: 24 })}
        </motion.button>
    );
};

export default FocusCamGrid;
