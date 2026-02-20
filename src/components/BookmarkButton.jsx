import React, { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const BookmarkButton = ({
    contentType, // 'post', 'snippet', 'project', 'resource' 등
    contentId,
    contentData = {}, // { title, description, url 등 }
    size = 20,
    showLabel = false
}) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            checkBookmarkStatus();
        }
    }, [user, contentId]);

    const checkBookmarkStatus = async () => {
        try {
            const { data, error } = await supabase
                .from('bookmarks')
                .select('id')
                .eq('user_id', user.id)
                .eq('content_type', contentType)
                .eq('content_id', contentId)
                .maybeSingle();

            if (error) throw error;
            setIsBookmarked(!!data);
        } catch (error) {
            console.error('Error checking bookmark:', error);
        }
    };

    const toggleBookmark = async (e) => {
        e.stopPropagation();
        if (!user) {
            addToast('로그인이 필요합니다', 'error');
            return;
        }

        setLoading(true);
        try {
            if (isBookmarked) {
                // 북마크 제거
                const { error } = await supabase
                    .from('bookmarks')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('content_type', contentType)
                    .eq('content_id', contentId);

                if (error) throw error;
                setIsBookmarked(false);
                addToast('북마크가 제거되었습니다', 'success');
            } else {
                // 북마크 추가
                const { error } = await supabase
                    .from('bookmarks')
                    .insert({
                        user_id: user.id,
                        content_type: contentType,
                        content_id: contentId,
                        content_data: contentData
                    });

                if (error) throw error;
                setIsBookmarked(true);
                addToast('북마크에 저장되었습니다', 'success');
            }
        } catch (error) {
            console.error('Error toggling bookmark:', error);
            addToast('오류가 발생했습니다', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleBookmark}
            disabled={loading}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                padding: showLabel ? '8px 12px' : '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: isBookmarked ? '#facc15' : '#94a3b8',
                transition: 'all 0.2s'
            }}
            title={isBookmarked ? '북마크 제거' : '북마크 추가'}
        >
            {isBookmarked ? (
                <BookmarkCheck size={size} fill="#facc15" />
            ) : (
                <Bookmark size={size} />
            )}
            {showLabel && (
                <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                    {isBookmarked ? '저장됨' : '저장'}
                </span>
            )}
        </motion.button>
    );
};

export default BookmarkButton;
