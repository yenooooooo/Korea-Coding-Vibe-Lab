import { supabase } from './supabase';

/**
 * 특정 사용자에게 알림을 전송합니다.
 * 
 * @param {string} userId - 알림을 받을 사용자의 UUID
 * @param {string} type - 알림 유형 (NOTIFICATION_ICONS에 정의된 타입)
 *   지원 타입: REACTION, JOIN_REQUEST, JOIN_APPROVED, JOIN_REJECTED,
 *             NEW_MESSAGE, RANK_UP, ACHIEVEMENT, POINTS_EARNED,
 *             BADGE_EARNED, FRIEND_REQUEST, MENTOR_BOOKING, PAYMENT_COMPLETE
 * @param {string} message - 알림 메시지 내용
 * @param {string} [link] - 알림 클릭 시 이동할 경로 (예: '/messages', '/mentor-booking')
 * @returns {Promise<boolean>} 성공 여부
 */
export const sendNotification = async (userId, type, message, link = null) => {
    try {
        if (!userId) {
            console.warn('sendNotification: userId가 없습니다.');
            return false;
        }

        const { error } = await supabase
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                message,
                link,
                is_read: false,
            });

        if (error) {
            console.error('알림 전송 실패:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('sendNotification 오류:', err);
        return false;
    }
};

/**
 * 여러 사용자에게 동시에 알림을 보냅니다.
 * 
 * @param {string[]} userIds - 알림을 받을 사용자들의 UUID 배열
 * @param {string} type - 알림 유형
 * @param {string} message - 알림 메시지
 * @param {string} [link] - 이동 경로
 */
export const sendNotificationToMany = async (userIds, type, message, link = null) => {
    if (!userIds || userIds.length === 0) return;

    const notifications = userIds.map(userId => ({
        user_id: userId,
        type,
        message,
        link,
        is_read: false,
    }));

    try {
        const { error } = await supabase
            .from('notifications')
            .insert(notifications);

        if (error) {
            console.error('다중 알림 전송 실패:', error);
        }
    } catch (err) {
        console.error('sendNotificationToMany 오류:', err);
    }
};
