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

/**
 * 로컬 스토리지에서 알림 설정을 가져옵니다.
 */
export const getLocalNotificationSettings = () => {
    try {
        const saved = localStorage.getItem('kcvl_notifications');
        if (saved) return JSON.parse(saved);
    } catch (e) { }
    return { quest: true, battle: true, friend: true, system: true };
};

/**
 * 알림 타입과 설정 객체를 비교하여 해당 알림이 켜져 있는지 확인합니다.
 */
export const isNotificationEnabled = (type, settings) => {
    if (!settings) settings = getLocalNotificationSettings();

    const TYPE_MAP = {
        quest: ['ACHIEVEMENT', 'POINTS_EARNED', 'BADGE_EARNED'],
        battle: ['RANK_UP'],
        friend: ['FRIEND_REQUEST', 'JOIN_REQUEST', 'JOIN_APPROVED', 'JOIN_REJECTED', 'REACTION', 'NEW_MESSAGE'],
        system: ['MENTOR_BOOKING', 'PAYMENT_COMPLETE']
    };

    if (TYPE_MAP.quest.includes(type) && !settings.quest) return false;
    if (TYPE_MAP.battle.includes(type) && !settings.battle) return false;
    if (TYPE_MAP.friend.includes(type) && !settings.friend) return false;
    if (TYPE_MAP.system.includes(type) && !settings.system) return false;

    return true;
};

/**
 * DB 쿼리에서 필터링할 제외 타입 목록을 반환합니다.
 */
export const getExcludedNotificationTypes = () => {
    const settings = getLocalNotificationSettings();
    const excluded = [];
    if (!settings.quest) excluded.push('ACHIEVEMENT', 'POINTS_EARNED', 'BADGE_EARNED');
    if (!settings.battle) excluded.push('RANK_UP');
    if (!settings.friend) excluded.push('FRIEND_REQUEST', 'JOIN_REQUEST', 'JOIN_APPROVED', 'JOIN_REJECTED', 'REACTION', 'NEW_MESSAGE');
    if (!settings.system) excluded.push('MENTOR_BOOKING', 'PAYMENT_COMPLETE');
    return excluded;
};

