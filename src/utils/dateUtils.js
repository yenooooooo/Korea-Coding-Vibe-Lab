/**
 * 한국 시간(KST) 기준의 오늘 날짜를 YYYY-MM-DD 형식의 문자열로 반환합니다.
 * @returns {string} YYYY-MM-DD
 */
export const getTodayKST = () => {
    // en-CA locale uses YYYY-MM-DD format
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
};

/**
 * 주어진 날짜 객체를 한국 시간 기준의 YYYY-MM-DD 문자열로 변환합니다.
 * @param {Date} date 
 * @returns {string}
 */
export const formatDateKST = (date) => {
    return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
};

/**
 * 한국 시간 기준의 현재 시각(Date 객체)을 반환합니다. (표시용)
 * @returns {Date}
 */
export const getNowKST = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const kstOffset = 9 * 60 * 60 * 1000;
    return new Date(utc + kstOffset);
};
