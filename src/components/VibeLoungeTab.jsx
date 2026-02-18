import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Heart, ThumbsUp, Flame, Trash2, Pin, Code, ChevronDown, ChevronUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProfileSummaryModal from './ProfileSummaryModal';
import SkillBadge from './SkillBadge';
import ScrollToTop from './ScrollToTop';
import { isAdmin, ADMIN_NAME_STYLE, ADMIN_BADGE_STYLE, ADMIN_REACTIONS, ADMIN_TITLE_STYLE, ADMIN_TITLE_DEFAULT } from '../utils/admin';
import { VibeName, fetchBatchEquippedDetails } from '../utils/vibeItems.jsx';

const VibeLoungeTab = () => {
    const [messages, setMessages] = useState([]);
    const [reactions, setReactions] = useState({});
    const [input, setInput] = useState('');
    const [codeMode, setCodeMode] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [hoveredMsgId, setHoveredMsgId] = useState(null);
    const [pinnedCollapsed, setPinnedCollapsed] = useState(false);
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const containerRef = useRef(null);
    const textareaRef = useRef(null);
    const [equippedDetails, setEquippedDetails] = useState({});
    const [isAtBottom, setIsAtBottom] = useState(true);
    const isFirstLoad = useRef(true);
    const profileCache = useRef({});
    const [clearedAt, setClearedAt] = useState(null);
    const [systemMessages, setSystemMessages] = useState([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleScroll = () => {
        const container = containerRef.current;
        if (!container) return;
        const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
        setIsAtBottom(nearBottom);
    };

    const addSystemMessage = (text) => {
        const id = 'sys-' + Date.now();
        setSystemMessages(prev => [...prev, { id, content: text, created_at: new Date().toISOString() }]);
        setTimeout(() => setSystemMessages(prev => prev.filter(m => m.id !== id)), 8000);
    };

    const handleCommand = async (raw) => {
        const [cmd, ...args] = raw.trim().split(' ');
        setInput('');

        switch (cmd.toLowerCase()) {
            case '/clear':
                setClearedAt(new Date());
                addSystemMessage('🧹 채팅이 내 화면에서 초기화되었습니다. (고정 메시지 유지)');
                break;
            case '/me':
                if (!user) { addSystemMessage('❌ 로그인이 필요합니다.'); break; }
                if (!args.length) { addSystemMessage('사용법: /me [행동] — 예) /me 코딩 중...'); break; }
                const myName = profile?.username || user.email?.split('@')[0] || 'Unknown';
                await supabase.from('posts').insert([{
                    content: `__me__:${myName} ${args.join(' ')}`,
                    user_id: user.id,
                    user_email: user.email?.split('@')[0]
                }]);
                break;
            case '/shrug':
                setInput('¯\\_(ツ)_/¯');
                return;
            case '/뱃지':
            case '/badge':
                navigate('/profile');
                addSystemMessage('🏅 뱃지 컬렉션 확인을 위해 프로필로 이동합니다.');
                break;
            case '/vibe':
                addSystemMessage(`✨ Lv.${profile?.level || 1} | 총 ${(profile?.total_points || 0).toLocaleString()} P 보유 중`);
                break;
            case '/help':
                addSystemMessage(
                    '📖 사용 가능한 명령어:\n' +
                    '/clear — 내 화면 채팅 초기화 (고정 메시지 유지)\n' +
                    '/me [행동] — 액션 메시지 전송 (전체 공개)\n' +
                    '/shrug — ¯\\_(ツ)_/¯ 입력\n' +
                    '/vibe — 내 현재 포인트·레벨 확인\n' +
                    '/badge — 프로필 뱃지 페이지로 이동'
                );
                break;
            default:
                addSystemMessage(`❓ 알 수 없는 명령어: ${cmd} — /help 로 목록 확인`);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchReactions();

        const postChannel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, async (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newPost = payload.new;

                    // 프로필 캐시 우선 조회 → 없으면 1회만 DB 요청
                    let authorProfile = profileCache.current[newPost.user_id];
                    if (!authorProfile) {
                        const { data } = await supabase
                            .from('profiles')
                            .select('id, username, message_count, avatar_url, main_skill, is_admin, admin_title, equipped_items')
                            .eq('id', newPost.user_id)
                            .single();
                        if (data) {
                            authorProfile = data;
                            profileCache.current[newPost.user_id] = data;
                        }
                    }

                    const fullMsg = { ...newPost, profiles: authorProfile || null };

                    // 중복 방지 (내가 보낸 메시지가 fetchMessages로 이미 추가된 경우)
                    setMessages(prev => {
                        if (prev.some(m => m.id === newPost.id)) return prev;
                        return [...prev, fullMsg];
                    });

                    // 새 유저의 equipped details 처리
                    if (authorProfile) {
                        const details = await fetchBatchEquippedDetails(supabase, [authorProfile]);
                        if (Object.keys(details).length > 0) {
                            setEquippedDetails(prev => ({ ...prev, ...details }));
                        }
                    }

                } else if (payload.eventType === 'UPDATE') {
                    setMessages(prev => prev.map(m =>
                        m.id === payload.new.id ? { ...m, ...payload.new } : m
                    ));
                } else if (payload.eventType === 'DELETE') {
                    setMessages(prev => prev.filter(m => m.id !== payload.old?.id));
                }
            })
            .subscribe();

        const reactionChannel = supabase
            .channel('public:post_reactions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reactions' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const r = payload.new;
                    setReactions(prev => ({
                        ...prev,
                        [r.post_id]: [...(prev[r.post_id] || []), r],
                    }));
                } else if (payload.eventType === 'DELETE') {
                    const deletedId = payload.old?.id;
                    if (!deletedId) return;
                    setReactions(prev => {
                        const next = { ...prev };
                        for (const postId in next) {
                            next[postId] = next[postId].filter(r => r.id !== deletedId);
                        }
                        return next;
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(postChannel);
            supabase.removeChannel(reactionChannel);
        };
    }, []);

    useEffect(() => {
        if (isAtBottom) scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles!posts_user_id_fkey (id, username, message_count, avatar_url, main_skill, is_admin, admin_title, equipped_items)
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) console.error('Error fetching messages:', error);
        else {
            const sorted = (data || []).reverse();
            setMessages(sorted);

            // 프로필 캐시 저장 (신규 메시지 처리 시 재조회 방지)
            sorted.forEach(m => {
                if (m.profiles) profileCache.current[m.user_id] = m.profiles;
            });

            const profiles = sorted.map(p => p.profiles).filter(Boolean);
            const details = await fetchBatchEquippedDetails(supabase, profiles);
            setEquippedDetails(details);

            // 초기 진입 시 equippedDetails 렌더 완료 후 즉시 맨 아래로 이동
            if (isFirstLoad.current) {
                isFirstLoad.current = false;
                requestAnimationFrame(() => {
                    if (containerRef.current) {
                        containerRef.current.scrollTop = containerRef.current.scrollHeight;
                    }
                });
            }
        }
    };

    const fetchReactions = async () => {
        const { data, error } = await supabase
            .from('post_reactions')
            .select('*');

        if (error) console.error('Error fetching reactions:', error);
        else {
            const grouped = (data || []).reduce((acc, r) => {
                if (!acc[r.post_id]) acc[r.post_id] = [];
                acc[r.post_id].push(r);
                return acc;
            }, {});
            setReactions(grouped);
        }
    };

    const handleReaction = async (postId, emojiType) => {
        if (!user) { alert("로그인이 필요합니다."); return; }

        const currentReactions = reactions[postId] || [];
        const alreadyReacted = currentReactions.some(r => r.user_id === user.id && r.emoji_type === emojiType);

        setReactions(prev => {
            const postReactions = prev[postId] || [];
            if (alreadyReacted) {
                return { ...prev, [postId]: postReactions.filter(r => !(r.user_id === user.id && r.emoji_type === emojiType)) };
            } else {
                return { ...prev, [postId]: [...postReactions, { post_id: postId, user_id: user.id, emoji_type: emojiType, created_at: new Date().toISOString() }] };
            }
        });

        if (alreadyReacted) {
            const { error } = await supabase.from('post_reactions').delete().match({ post_id: postId, user_id: user.id, emoji_type: emojiType });
            if (error) { console.error("Error removing reaction:", error); fetchReactions(); }
        } else {
            const { error } = await supabase.from('post_reactions').insert([{ post_id: postId, user_id: user.id, emoji_type: emojiType }]);
            // Ignore duplicate errors: PostgreSQL code 23505 or REST API status 409
            if (error && error.code !== '23505' && error.code !== '409') {
                console.error("Error adding reaction:", error);
                fetchReactions();
            }
        }
    };

    const handleSend = async (e) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        if (input.trim().startsWith('/')) {
            handleCommand(input.trim());
            return;
        }

        if (!user) {
            if (confirm("로그인이 필요한 서비스입니다. 로그인 하시겠습니까?")) navigate('/login');
            return;
        }

        const content = codeMode ? '```\n' + input + '\n```' : input;
        const payload = [{ content, user_id: user.id, user_email: user.email?.split('@')[0] || 'Anonymous' }];

        let { error } = await supabase.from('posts').insert(payload);

        // 세션 갱신 중 요청이 중단된 경우 1회 재시도
        if (error && error.message?.includes('interrupted')) {
            await new Promise(r => setTimeout(r, 300));
            const retry = await supabase.from('posts').insert(payload);
            error = retry.error;
        }

        if (error) {
            console.error('Error sending message:', error);
            alert('메시지 전송 실패: ' + error.message);
        } else {
            setInput('');
            setCodeMode(false);
            setIsAtBottom(true);
            scrollToBottom();
            fetchMessages();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleDeleteMessage = async (msgId) => {
        if (!window.confirm('메시지를 삭제하시겠습니까?')) return;
        const { error } = await supabase.from('posts').delete().eq('id', msgId);
        if (error) { console.error('Error deleting message:', error); alert('메시지 삭제 실패'); }
        else fetchMessages();
    };

    const handleTogglePin = async (msgId, currentPinned) => {
        const { error } = await supabase.from('posts').update({ is_pinned: !currentPinned }).eq('id', msgId);
        if (error) { console.error('Error toggling pin:', error); alert('핀 고정 실패'); }
        else fetchMessages();
    };

    const currentUserIsAdmin = user && isAdmin(user.email);

    // 핀 고정 메시지 분리
    const pinnedMessages = messages.filter(m => m.is_pinned);

    // /clear 이후 메시지만 표시 + 시스템 메시지 병합 후 시간순 정렬
    const filteredNormal = messages
        .filter(m => !m.is_pinned)
        .filter(m => !clearedAt || new Date(m.created_at) > clearedAt);

    const mergedMessages = [
        ...filteredNormal.map(m => ({ _kind: 'message', ...m })),
        ...systemMessages.map(m => ({ _kind: 'system', ...m })),
    ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    // 날짜 구분선 + 메시지 그룹핑 데이터 생성
    const groupedByDate = [];
    let lastDate = null;
    let lastUserId = null;
    let lastGroupTime = null;

    mergedMessages.forEach((item) => {
        if (item._kind === 'system') {
            groupedByDate.push({ type: 'system', content: item.content, key: item.id });
            lastUserId = null;
            lastGroupTime = null;
            return;
        }

        const msg = item;
        const msgDate = new Date(msg.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
        const msgTime = new Date(msg.created_at).getTime();

        if (msgDate !== lastDate) {
            groupedByDate.push({ type: 'date-divider', date: msgDate, key: 'date-' + msgDate });
            lastUserId = null;
            lastGroupTime = null;
        }

        const isGrouped = msg.user_id === lastUserId && lastGroupTime && (msgTime - lastGroupTime < 180000);
        groupedByDate.push({ type: 'message', msg, isGrouped, key: msg.id });

        lastDate = msgDate;
        lastUserId = msg.user_id;
        lastGroupTime = msgTime;
    });

    return (
        <>
            <div style={{
                flex: 1,
                minHeight: 0,
                background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(0, 0, 0, 0.3) 100%)',
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            }}>
                {/* 핀 고정 영역 (분리) */}
                {pinnedMessages.length > 0 && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.06), rgba(234, 179, 8, 0.03))',
                        borderBottom: '1px solid rgba(250, 204, 21, 0.15)',
                    }}>
                        <button
                            onClick={() => setPinnedCollapsed(!pinnedCollapsed)}
                            style={{
                                width: '100%',
                                padding: '10px 20px',
                                background: 'none',
                                border: 'none',
                                color: '#fbbf24',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                            }}
                        >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Pin size={12} /> 고정된 메시지 {pinnedMessages.length}개
                            </span>
                            {pinnedCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                        </button>
                        <AnimatePresence>
                            {!pinnedCollapsed && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div style={{ display: 'flex', gap: '10px', padding: '0 16px 12px', overflowX: 'auto' }}>
                                        {pinnedMessages.map(pm => (
                                            <div key={pm.id} style={{
                                                minWidth: '220px',
                                                maxWidth: '300px',
                                                background: 'rgba(250, 204, 21, 0.06)',
                                                border: '1px solid rgba(250, 204, 21, 0.15)',
                                                borderRadius: '12px',
                                                padding: '10px 14px',
                                                position: 'relative',
                                                flexShrink: 0,
                                            }}>
                                                <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Pin size={10} />
                                                    {pm.profiles?.username || 'Unknown'}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: '#cbd5e1',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    lineHeight: 1.4,
                                                }}>
                                                    {pm.content?.replace(/```[\s\S]*?```/g, '[code]')}
                                                </div>
                                                {currentUserIsAdmin && (
                                                    <button
                                                        onClick={() => handleTogglePin(pm.id, true)}
                                                        style={{
                                                            position: 'absolute', top: '6px', right: '6px',
                                                            background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px',
                                                        }}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}

                {/* 메시지 영역 */}
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 0 }}>
                    <div ref={containerRef} onScroll={handleScroll} style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        padding: '16px 20px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                    }}>
                        {groupedByDate.map((item) => {
                            if (item.type === 'date-divider') {
                                return <DateDivider key={item.key} date={item.date} />;
                            }

                            if (item.type === 'system') {
                                return (
                                    <div key={item.key} style={{
                                        alignSelf: 'center',
                                        margin: '6px 0',
                                        padding: '8px 16px',
                                        background: 'rgba(99, 102, 241, 0.08)',
                                        border: '1px solid rgba(99, 102, 241, 0.15)',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        color: '#94a3b8',
                                        maxWidth: '90%',
                                        whiteSpace: 'pre-line',
                                        textAlign: 'center',
                                    }}>
                                        {item.content}
                                    </div>
                                );
                            }

                            const { msg, isGrouped } = item;
                            const isMine = user && user.id === msg.user_id;
                            const msgIsAdmin = isAdmin(msg.profiles);

                            return (
                                <MessageBubble
                                    key={item.key}
                                    msg={msg}
                                    isMine={isMine}
                                    isGrouped={isGrouped}
                                    msgIsAdmin={msgIsAdmin}
                                    isHovered={hoveredMsgId === msg.id}
                                    onHover={() => setHoveredMsgId(msg.id)}
                                    onLeave={() => setHoveredMsgId(null)}
                                    onClickUser={() => setSelectedUserId(msg.user_id)}
                                    onDelete={() => handleDeleteMessage(msg.id)}
                                    onTogglePin={() => handleTogglePin(msg.id, msg.is_pinned)}
                                    currentUserIsAdmin={currentUserIsAdmin}
                                    canDelete={user && (user.id === msg.user_id || currentUserIsAdmin)}
                                    reactions={reactions[msg.id] || []}
                                    onReact={handleReaction}
                                    currentUserId={user?.id}
                                    equippedItem={equippedDetails[msg.user_id]}
                                />
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    <ScrollToTop containerRef={containerRef} />
                </div>

                {/* 입력창 */}
                <div style={{
                    padding: '16px 20px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(8px)',
                }}>
                    {/* 코드 모드 표시 */}
                    {codeMode && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '6px 12px', marginBottom: '8px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            borderRadius: '8px',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                        }}>
                            <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 'bold' }}>
                                <Code size={12} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                코드 모드 - 전송 시 코드 블록으로 감싸집니다
                            </span>
                            <button onClick={() => setCodeMode(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        {/* 코드 토글 */}
                        <button
                            onClick={() => setCodeMode(!codeMode)}
                            title="코드 모드"
                            style={{
                                background: codeMode ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                border: codeMode ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '10px',
                                width: '42px', height: '42px',
                                minWidth: '42px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: codeMode ? '#a5b4fc' : '#64748b',
                                cursor: 'pointer',
                                flexShrink: 0,
                                transition: 'all 0.2s',
                                boxSizing: 'border-box',
                            }}
                        >
                            <Code size={18} />
                        </button>

                        {/* 텍스트 입력 */}
                        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={user
                                    ? (codeMode ? "코드를 입력하세요..." : "메시지를 입력하세요... (Shift+Enter: 줄바꿈)")
                                    : "로그인 후 메시지를 남겨보세요"
                                }
                                disabled={!user}
                                rows={1}
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    background: user ? 'rgba(30, 41, 59, 0.8)' : 'rgba(30, 41, 59, 0.3)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '14px',
                                    padding: input.length > 0 ? '10px 44px 10px 16px' : '10px 16px',
                                    color: codeMode ? '#a5b4fc' : '#f1f5f9',
                                    fontSize: codeMode ? '0.9rem' : '0.95rem',
                                    fontFamily: codeMode ? 'monospace' : 'inherit',
                                    outline: 'none',
                                    resize: 'none',
                                    maxHeight: '120px',
                                    minHeight: '42px',
                                    height: '42px',
                                    lineHeight: '1.5',
                                    cursor: user ? 'text' : 'not-allowed',
                                    transition: 'border-color 0.2s, padding 0.1s',
                                    overflowY: 'hidden',
                                    display: 'block',
                                }}
                                onInput={(e) => {
                                    e.target.style.height = '42px';
                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                    if (e.target.scrollHeight > 120) e.target.style.overflowY = 'auto';
                                    else e.target.style.overflowY = 'hidden';
                                }}
                                onFocus={(e) => e.target.style.borderColor = 'rgba(99, 102, 241, 0.4)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
                            />
                            {/* 글자 수 */}
                            {input.length > 0 && (
                                <span style={{
                                    position: 'absolute', right: '12px', bottom: '11px',
                                    fontSize: '0.65rem',
                                    color: input.length > 500 ? '#ef4444' : '#475569',
                                    pointerEvents: 'none',
                                    lineHeight: 1,
                                }}>
                                    {input.length}
                                </span>
                            )}
                        </div>

                        {/* 전송 버튼 */}
                        <button
                            onClick={handleSend}
                            disabled={!user || !input.trim()}
                            style={{
                                background: user && input.trim()
                                    ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                    : 'rgba(71, 85, 105, 0.5)',
                                border: 'none',
                                borderRadius: '12px',
                                width: '42px', height: '42px',
                                minWidth: '42px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: user && input.trim() ? 'pointer' : 'not-allowed',
                                color: '#fff',
                                flexShrink: 0,
                                transition: 'all 0.2s',
                                boxSizing: 'border-box',
                                boxShadow: user && input.trim() ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <ProfileSummaryModal
                userId={selectedUserId}
                isOpen={!!selectedUserId}
                onClose={() => setSelectedUserId(null)}
            />
        </>
    );
};

// ─── 날짜 구분선 ─────────────────────────────
const DateDivider = ({ date }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px 0 12px',
    }}>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />
        <span style={{
            fontSize: '0.7rem',
            color: '#64748b',
            fontWeight: '600',
            letterSpacing: '0.5px',
            whiteSpace: 'nowrap',
            padding: '4px 12px',
            background: 'rgba(30, 41, 59, 0.6)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
            {date}
        </span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />
    </div>
);

// ─── 메시지 버블 ──────────────────────────────
const MessageBubble = ({
    msg, isMine, isGrouped, msgIsAdmin,
    isHovered, onHover, onLeave,
    onClickUser, onDelete, onTogglePin,
    currentUserIsAdmin, canDelete,
    reactions, onReact, currentUserId,
    equippedItem,
}) => {
    const reactionCounts = reactions.reduce((acc, r) => {
        acc[r.emoji_type] = (acc[r.emoji_type] || 0) + 1;
        return acc;
    }, {});
    const myReactions = reactions.filter(r => r.user_id === currentUserId).map(r => r.emoji_type);
    const hasReactions = Object.keys(reactionCounts).length > 0;

    return (
        <div
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            style={{
                display: 'flex',
                flexDirection: isMine ? 'row-reverse' : 'row',
                gap: isGrouped ? '0' : '10px',
                alignItems: 'flex-start',
                marginTop: isGrouped ? '2px' : '12px',
                paddingLeft: !isMine && isGrouped ? '46px' : '0',
                paddingRight: isMine && isGrouped ? '46px' : '0',
                position: 'relative',
            }}
        >
            {/* 아바타 (그룹핑 시 숨김) */}
            {!isGrouped && (
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                        onClick={onClickUser}
                        className={msgIsAdmin ? 'admin-avatar-animated' : ''}
                        style={{
                            width: '36px', height: '36px',
                            borderRadius: '50%',
                            background: '#1e293b',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: msgIsAdmin ? '2px solid #a855f7' : '2px solid rgba(255,255,255,0.06)',
                            transition: 'border-color 0.3s',
                        }}
                    >
                        {equippedItem?.avatar ? (
                            <img src={equippedItem.avatar.icon_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : msg.profiles?.avatar_url ? (
                            <img src={msg.profiles.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={16} color="#64748b" />
                        )}
                    </div>
                    {msgIsAdmin && (
                        <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '0.65rem' }}>👑</span>
                    )}
                </div>
            )}

            {/* 버블 콘텐츠 */}
            <div style={{
                maxWidth: '70%',
                minWidth: '80px',
                position: 'relative',
            }}>
                {/* 닉네임 + 메타 (그룹핑 시 숨김) */}
                {!isGrouped && (
                    <div style={{
                        display: 'flex',
                        gap: '6px',
                        alignItems: 'center',
                        marginBottom: '4px',
                        flexDirection: isMine ? 'row-reverse' : 'row',
                        flexWrap: 'wrap',
                    }}>
                        <VibeName
                            name={msg.profiles?.username || msg.user_email || 'Unknown'}
                            effectItem={equippedItem?.name_effect}
                            onClick={onClickUser}
                            style={{
                                fontWeight: '600',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                ...(msgIsAdmin
                                    ? ADMIN_NAME_STYLE
                                    : { color: isMine ? '#a5b4fc' : getVibeColor(msg.profiles?.message_count || 0) }),
                            }}
                        />
                        {msgIsAdmin && <span style={{ ...ADMIN_BADGE_STYLE, fontSize: '0.55rem', padding: '1px 5px' }}>운영자</span>}
                        {msgIsAdmin && (
                            <span style={{ ...ADMIN_TITLE_STYLE, fontSize: '0.5rem' }}>
                                {msg.profiles?.admin_title || ADMIN_TITLE_DEFAULT}
                            </span>
                        )}
                        <SkillBadge skill={msg.profiles?.main_skill} type="main" size="sm" showLabel={false} />
                        {(msg.profiles?.message_count || 0) >= 10 && (
                            <span style={{
                                fontSize: '0.6rem',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                background: (msg.profiles?.message_count || 0) >= 50
                                    ? 'rgba(234, 179, 8, 0.2)'
                                    : 'rgba(59, 130, 246, 0.2)',
                                color: (msg.profiles?.message_count || 0) >= 50 ? '#fbbf24' : '#60a5fa',
                                fontWeight: 'bold',
                            }}>
                                LV.{msg.profiles?.message_count || 0}
                            </span>
                        )}
                    </div>
                )}

                {/* 메시지 본문 버블 */}
                <motion.div
                    initial={msgIsAdmin ? { opacity: 0, x: -8 } : false}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        padding: '10px 14px',
                        borderRadius: isMine
                            ? (isGrouped ? '16px' : '16px 4px 16px 16px')
                            : (isGrouped ? '16px' : '4px 16px 16px 16px'),
                        background: msgIsAdmin
                            ? 'linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(99, 102, 241, 0.08))'
                            : isMine
                                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(129, 140, 248, 0.12))'
                                : 'rgba(30, 41, 59, 0.7)',
                        border: msgIsAdmin
                            ? '1px solid rgba(168, 85, 247, 0.2)'
                            : isMine
                                ? '1px solid rgba(99, 102, 241, 0.15)'
                                : '1px solid rgba(255, 255, 255, 0.04)',
                        position: 'relative',
                        wordBreak: 'break-word',
                    }}
                >
                    {/* 관리자 좌측 악센트 바 */}
                    {msgIsAdmin && (
                        <div style={{
                            position: 'absolute',
                            left: 0, top: '6px', bottom: '6px',
                            width: '3px',
                            borderRadius: '2px',
                            background: 'linear-gradient(180deg, #a855f7, #6366f1)',
                        }} />
                    )}
                    {renderMessage(msg.content)}

                    {/* 시간 (버블 내 우하단) */}
                    <div style={{
                        textAlign: isMine ? 'right' : 'left',
                        marginTop: '4px',
                        fontSize: '0.6rem',
                        color: '#475569',
                    }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </motion.div>

                {/* 반응 요약 (항상 표시, 있을 때만) */}
                {hasReactions && (
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        marginTop: '4px',
                        flexWrap: 'wrap',
                        justifyContent: isMine ? 'flex-end' : 'flex-start',
                    }}>
                        {Object.entries(reactionCounts).map(([type, count]) => {
                            const isActive = myReactions.includes(type);
                            const isAdminType = ADMIN_REACTIONS.some(r => r.type === type);
                            const emoji = isAdminType
                                ? ADMIN_REACTIONS.find(r => r.type === type)?.emoji
                                : (type === 'like' ? '👍' : type === 'heart' ? '❤️' : '🔥');
                            return (
                                <button
                                    key={type}
                                    onClick={() => (!isAdminType || currentUserIsAdmin) && onReact(msg.id, type)}
                                    style={{
                                        background: isActive ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                                        border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                                        borderRadius: '20px',
                                        padding: '2px 8px',
                                        display: 'flex', alignItems: 'center', gap: '3px',
                                        fontSize: '0.7rem',
                                        color: isActive ? '#a5b4fc' : '#94a3b8',
                                        cursor: (!isAdminType || currentUserIsAdmin) ? 'pointer' : 'default',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <span style={{ fontSize: '0.7rem' }}>{emoji}</span>
                                    <span>{count}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* 호버 액션 (플로팅 툴바) */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.9 }}
                            transition={{ duration: 0.12 }}
                            style={{
                                position: 'absolute',
                                top: '-32px',
                                ...(isMine ? { right: '0' } : { left: '0' }),
                                display: 'flex',
                                gap: '2px',
                                background: 'rgba(15, 23, 42, 0.95)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '8px',
                                padding: '4px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                                zIndex: 10,
                            }}
                        >
                            {/* 반응 버튼들 */}
                            {[
                                { type: 'like', emoji: '👍' },
                                { type: 'heart', emoji: '❤️' },
                                { type: 'fire', emoji: '🔥' },
                            ].map(({ type, emoji }) => (
                                <button
                                    key={type}
                                    onClick={() => onReact(msg.id, type)}
                                    style={{
                                        background: myReactions.includes(type) ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 6px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        transition: 'background 0.15s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = myReactions.includes(type) ? 'rgba(99,102,241,0.3)' : 'transparent'}
                                >
                                    {emoji}
                                </button>
                            ))}
                            {/* 관리자 특수 반응 */}
                            {currentUserIsAdmin && ADMIN_REACTIONS.map(({ type, emoji }) => (
                                <button
                                    key={type}
                                    onClick={() => onReact(msg.id, type)}
                                    style={{
                                        background: myReactions.includes(type) ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 6px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                            {/* 구분선 */}
                            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '2px 2px' }} />
                            {/* 핀 고정 (관리자) */}
                            {currentUserIsAdmin && (
                                <button
                                    onClick={onTogglePin}
                                    title={msg.is_pinned ? '핀 해제' : '핀 고정'}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 6px',
                                        cursor: 'pointer',
                                        color: msg.is_pinned ? '#fbbf24' : '#64748b',
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    <Pin size={13} />
                                </button>
                            )}
                            {/* 삭제 */}
                            {canDelete && (
                                <button
                                    onClick={onDelete}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        padding: '4px 6px',
                                        cursor: 'pointer',
                                        color: '#ef4444',
                                        display: 'flex', alignItems: 'center',
                                    }}
                                >
                                    <Trash2 size={13} />
                                </button>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

// ─── 유틸 ──────────────────────────────────────
const getVibeColor = (count) => {
    if (count >= 50) return '#facc15';
    if (count >= 10) return '#60a5fa';
    return '#94a3b8';
};

// 이미지 URL 감지 정규식
const IMAGE_URL_REGEX = /https?:\/\/\S+\.(?:png|jpg|jpeg|gif|webp|svg)(\?\S*)?/gi;

const renderMessage = (content) => {
    if (!content) return null;

    // /me 액션 메시지
    if (content.startsWith('__me__:')) {
        return (
            <div style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '0.88rem' }}>
                * {content.slice(7)}
            </div>
        );
    }

    // 코드 블록 분리
    const parts = content.split(/```([\s\S]*?)```/);

    return (
        <div style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#e2e8f0' }}>
            {parts.map((part, index) => {
                if (index % 2 === 1) {
                    return (
                        <div key={index} style={{
                            margin: '8px 0',
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '12px 14px',
                            borderRadius: '10px',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            fontFamily: '"Fira Code", "Cascadia Code", monospace',
                            fontSize: '0.82rem',
                            color: '#a5b4fc',
                            whiteSpace: 'pre-wrap',
                            overflowX: 'auto',
                            position: 'relative',
                        }}>
                            <span style={{
                                position: 'absolute', top: '6px', right: '8px',
                                fontSize: '0.55rem', color: '#475569',
                                fontFamily: 'sans-serif', fontWeight: 'bold',
                                textTransform: 'uppercase',
                            }}>
                                CODE
                            </span>
                            {part.trim()}
                        </div>
                    );
                }

                // 일반 텍스트에서 이미지 URL 감지
                const imageMatches = part.match(IMAGE_URL_REGEX);
                if (imageMatches) {
                    const textWithoutImages = part.replace(IMAGE_URL_REGEX, '').trim();
                    return (
                        <span key={index}>
                            {textWithoutImages && <span style={{ whiteSpace: 'pre-wrap' }}>{textWithoutImages}</span>}
                            {imageMatches.map((url, i) => (
                                <div key={`img-${i}`} style={{
                                    marginTop: '8px',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    maxWidth: '320px',
                                }}>
                                    <img
                                        src={url}
                                        alt="shared"
                                        style={{
                                            width: '100%',
                                            maxHeight: '240px',
                                            objectFit: 'cover',
                                            display: 'block',
                                        }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                </div>
                            ))}
                        </span>
                    );
                }

                return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>;
            })}
        </div>
    );
};

export default VibeLoungeTab;
