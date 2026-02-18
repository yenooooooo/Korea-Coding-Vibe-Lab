import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { supabase } from '../lib/supabase';

const FocusCamContext = createContext();

export const useFocusCam = () => useContext(FocusCamContext);

export const FocusCamProvider = ({ children }) => {
    const { user, profile } = useAuth();
    const { addToast: showToast } = useToast();
    const [channel, setChannel] = useState(null);
    const [peer, setPeer] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [peers, setPeers] = useState({}); // { peerId: { call, stream, userProfile } }
    const [isJoined, setIsJoined] = useState(false);
    const [currentGroupId, setCurrentGroupId] = useState(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    // PeerJS 초기화
    useEffect(() => {
        let newPeer = null;

        if (user) {
            newPeer = new Peer(user.id, {
                // Cloud PeerServer 사용 (기본값)
                // debug: 2
            });

            newPeer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
            });

            newPeer.on('call', (call) => {
                // 전화 받기 (기존 스트림으로 응답)
                navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                    .then((stream) => {
                        // 이미 내 스트림이 있다면 그걸 사용 (Mute 상태 유지 등)
                        const responseStream = myStream || stream;

                        // 초기 오디오 Mute (무언 코딩) - 새로 얻은 스트림이면 적용
                        if (!myStream) {
                            stream.getAudioTracks().forEach(track => track.enabled = false);
                            setMyStream(stream);
                        }

                        call.answer(responseStream);

                        call.on('stream', (remoteStream) => {
                            handleUserConnected(call.peer, call, remoteStream, call.metadata);
                        });
                    })
                    .catch(err => console.error('Failed to get local stream', err));
            });

            setPeer(newPeer);
        }

        return () => {
            if (newPeer) {
                newPeer.destroy();
                setPeer(null);
            }
        };
    }, [user]);

    const handleUserConnected = (peerId, call, stream, metadata) => {
        console.log('User connected:', peerId);
        setPeers(prev => {
            if (prev[peerId]) return prev; // 이미 연결됨
            return {
                ...prev,
                [peerId]: { call, stream, userProfile: metadata?.userProfile || { username: 'Unknown' } }
            };
        });
    };

    const joinRoom = async (groupId) => {
        if (!peer || !user) return;
        setIsJoined(true);
        setCurrentGroupId(groupId);

        try {
            // 1. 내 스트림 획득
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getAudioTracks().forEach(track => track.enabled = false); // 기본 음소거
            setMyStream(stream);

            // 2. DB에 내 Peer ID 등록 (Signaling)
            await supabase
                .from('study_group_members')
                .update({ peer_id: peer.id })
                .eq('group_id', groupId)
                .eq('user_id', user.id);

            // 3. 기존 참여자 목록 가져오기 및 연결 (Newcomer initiates calls)
            const { data: members } = await supabase
                .from('study_group_members')
                .select('peer_id, profiles(username, avatar_url)')
                .eq('group_id', groupId)
                .neq('user_id', user.id) // 나 제외
                .not('peer_id', 'is', null);

            if (members) {
                members.forEach(member => {
                    connectToPeer(member.peer_id, stream, member.profiles);
                });
            }

            // 4. 실시간 참여/퇴장 감지
            const newChannel = supabase.channel(`room:${groupId}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'study_group_members',
                    filter: `group_id=eq.${groupId}`
                }, async (payload) => {
                    const { new: newRecord, old: oldRecord } = payload;

                    // 누군가 들어옴 (Peer ID가 생김 혹은 변경됨)
                    if (newRecord.peer_id && newRecord.peer_id !== peer.id) {
                        // 내가 이미 연결했는지 확인? 
                        // Newcomer가 건 전화를 받을 것이므로, 여기서는 'Call' 이벤트가 처리함.
                        // 하지만 'Call'이 실패할 경우를 대비하거나, 양방향 연결 안정성을 위해
                        // 기존 멤버는 가만히 있어도 됨 (Newcomer calls).
                        // 다만, 누군가 '나가기'를 했을 때 (peer_id null) 처리가 중요.
                    }

                    // 누군가 나감 (Peer ID가 null이 됨)
                    if (!newRecord.peer_id && oldRecord.peer_id) {
                        closeConnection(oldRecord.peer_id);
                    }
                })
                .subscribe();

            setChannel(newChannel);

        } catch (err) {
            console.error('Error joining room:', err);
            setIsJoined(false);
            showToast('카메라/마이크 권한이 필요하거나 연결에 실패했습니다.', 'error');
        }
    };

    const connectToPeer = (remotePeerId, stream, userProfile) => {
        if (!peer) return;
        console.log('Calling peer:', remotePeerId);

        const call = peer.call(remotePeerId, stream, {
            metadata: { userProfile: profile } // 내 프로필 정보 전송
        });

        call.on('stream', (remoteStream) => {
            handleUserConnected(remotePeerId, call, remoteStream, { userProfile });
        });

        call.on('close', () => {
            closeConnection(remotePeerId);
        });

        call.on('error', (err) => {
            console.error('Call error:', err);
            closeConnection(remotePeerId);
        });
    };

    const closeConnection = (peerId) => {
        setPeers(prev => {
            const newPeers = { ...prev };
            if (newPeers[peerId]) {
                newPeers[peerId].call.close();
                delete newPeers[peerId];
            }
            return newPeers;
        });
    };

    const leaveRoom = async () => {
        if (currentGroupId && user) {
            // DB에서 Peer ID 제거
            await supabase
                .from('study_group_members')
                .update({ peer_id: null })
                .eq('group_id', currentGroupId)
                .eq('user_id', user.id);

            // 채널 구독 해제
            if (channel) {
                supabase.removeChannel(channel);
                setChannel(null);
            }
        }

        // 스트림 정지
        if (myStream) {
            myStream.getTracks().forEach(track => track.stop());
            setMyStream(null);
        }

        // 모든 연결 종료
        Object.values(peers).forEach(({ call }) => call.close());
        setPeers({});

        setIsJoined(false);
        setCurrentGroupId(null);
        setIsScreenSharing(false);
    };

    const toggleScreenShare = async () => {
        if (!isJoined || !peer) return;

        if (isScreenSharing) {
            // 화면 공유 중단 -> 카메라로 복귀
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            stream.getAudioTracks().forEach(track => track.enabled = false); // Mute 유지

            replaceStream(stream);
            setMyStream(stream);
            setIsScreenSharing(false);
        } else {
            // 화면 공유 시작
            try {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                replaceStream(stream);
                setMyStream(stream);
                setIsScreenSharing(true);

                // 화면 공유 중지 버튼(브라우저 내장) 눌렀을 때 처리
                stream.getVideoTracks()[0].onended = () => {
                    toggleScreenShare(); // 재귀 호출로 카메라 복귀
                };
            } catch (err) {
                if (err.name === 'NotAllowedError') {
                    console.info('Screen share cancelled by user');
                    showToast('화면 공유가 취소되었습니다.', 'info');
                } else {
                    console.error('Screen share failed:', err);
                    showToast('화면 공유 시작에 실패했습니다.', 'error');
                }
            }
        }
    };

    // 활성화된 모든 Call의 트랙 교체
    const replaceStream = (newStream) => {
        Object.values(peers).forEach(({ call }) => {
            if (call.peerConnection) {
                const senders = call.peerConnection.getSenders();

                const videoTrack = newStream.getVideoTracks()[0];
                const audioTrack = newStream.getAudioTracks()[0];

                const videoSender = senders.find(s => s.track?.kind === 'video');
                const audioSender = senders.find(s => s.track?.kind === 'audio');

                if (videoSender && videoTrack) videoSender.replaceTrack(videoTrack);
                if (audioSender && audioTrack) audioSender.replaceTrack(audioTrack);
            }
        });
    };

    const toggleAudio = () => {
        if (myStream) {
            myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
            // Force re-render if needed or return status
            return myStream.getAudioTracks()[0].enabled;
        }
        return false;
    };

    const toggleVideo = () => {
        if (myStream) {
            myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
            return myStream.getVideoTracks()[0].enabled;
        }
        return false;
    };

    return (
        <FocusCamContext.Provider value={{
            peer,
            myStream,
            peers,
            isJoined,
            currentGroupId,
            joinRoom,
            leaveRoom,
            toggleScreenShare,
            isScreenSharing,
            toggleAudio,
            toggleVideo
        }}>
            {children}
        </FocusCamContext.Provider>
    );
};
