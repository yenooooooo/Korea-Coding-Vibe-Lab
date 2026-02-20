import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
    ko: {
        // Settings Page
        'settings.title': '⚙️ 설정',
        'settings.desc': '알림, 테마, 보안 등 사이트 환경을 설정하세요.',
        'settings.notifications': '알림 설정',
        'settings.notifications.desc': '받고 싶은 알림을 선택하세요',
        'settings.notif.quest': '퀘스트 알림',
        'settings.notif.quest.desc': '새 퀘스트, 보상 획득 알림',
        'settings.notif.battle': '배틀 알림',
        'settings.notif.battle.desc': '배틀 초대, 결과 알림',
        'settings.notif.friend': '친구 알림',
        'settings.notif.friend.desc': '친구 요청, 메시지 알림',
        'settings.notif.system': '시스템 알림',
        'settings.notif.system.desc': '공지사항, 업데이트 알림',
        'settings.theme': '테마 설정',
        'settings.theme.desc': '색상, 폰트, 컴팩트 모드 등을 커스텀하세요',
        'settings.theme.open': '🎨 테마 커스터마이저 열기',
        'settings.language': '언어 설정',
        'settings.language.desc': '사이트 표시 언어',
        'settings.password': '비밀번호 변경',
        'settings.password.oauth': 'OAuth 로그인은 비밀번호를 사용하지 않습니다',
        'settings.password.new': '새 비밀번호를 설정하세요',
        'settings.password.oauth.desc': '소셜 로그인(Google/GitHub)을 사용 중이므로 비밀번호 변경이 필요 없습니다.',
        'settings.password.input.new': '새 비밀번호 (6자 이상)',
        'settings.password.input.confirm': '비밀번호 확인',
        'settings.password.btn': '비밀번호 변경',
        'settings.password.btn.ing': '변경 중...',
        'settings.delete': '계정 탈퇴',
        'settings.delete.desc': '이 작업은 되돌릴 수 없습니다',
        'settings.delete.btn': '계정 탈퇴 진행',
        'settings.delete.confirm.title': '정말 탈퇴하시겠습니까?',
        'settings.delete.confirm.desc': '탈퇴 시 프로필 정보가 초기화되며 복구할 수 없습니다.',
        'settings.delete.confirm.instruct': '확인하려면 아래에 ',
        'settings.delete.confirm.keyword': '탈퇴합니다',
        'settings.delete.confirm.instruct2': '를 입력하세요.',
        'settings.delete.cancel': '취소',
        'settings.delete.submit': '탈퇴 확인',
        'settings.login.required': '로그인 후 설정을 이용할 수 있습니다.',

        // Sidebar Main
        'sidebar.main': 'Main',
        'sidebar.home': '홈 (Home)',
        'sidebar.lounge': '바이브 라운지 (Lounge)',
        'sidebar.about': '바이브 소개 (About)',
        'sidebar.battle': 'Battle',
        'sidebar.arena': '배틀 아레나 (Arena)',
        'sidebar.growth': 'Growth',
        'sidebar.vibe.dna': '바이브 DNA (Vibe DNA)',
        'sidebar.vibe.market': '에셋 마켓 (Market)',
        'sidebar.season.pass': '시즌 패스 (Season Pass)',
        'sidebar.vibe.shop': '바이브 샵 (Shop)',
        'sidebar.vibe.sandbox': '샌드박스 (Sandbox)',
        'sidebar.inventory': '인벤토리 (Inventory)',
        'sidebar.social': 'Social',
        'sidebar.profile': '프로필 (Profile)',
        'sidebar.friends': '친구 (Friends)',
        'sidebar.messages': 'DM (Messages)',
        'sidebar.attendance': '출석 (Attendance)',
        'sidebar.study': '스터디 (Study)',
        'sidebar.moments': '따뜻한 순간 (Moments)',
        'sidebar.bookmarks': '북마크 (Bookmarks)',
        'sidebar.settings': '설정 (Settings)',
        'sidebar.utility': 'Utility',
        'sidebar.pomodoro': '학습 타이머 (Timer)',
        'sidebar.snippets': '코드 스니펫 (Snippets)',
        'sidebar.exchange': '포인트 환전소 (Exchange)',
        'sidebar.learn': 'Learn',
        'sidebar.mentor': '멘토 찾기 (Mentors)',
        'sidebar.ai.study': 'AI 페어 프로그래밍 (AI)',
        'sidebar.classroom': '화상 강의실 (Classroom)',
        'sidebar.creative': 'Creative',
        'sidebar.starter.guide': '초보자 가이드 (Guide)',
        'sidebar.interactive.demo': '인터랙티브 데모 (Demo)',
        'sidebar.showcase': '프로젝트 쇼케이스 (Showcase)',
        'sidebar.diagnosis': '자기진단 (Diagnosis)',
        'sidebar.challenge': '주간 챌린지 (Challenge)',
        'sidebar.daily': '일일 챌린지 (Daily)',
        'sidebar.points': '포인트 내역 (Points)',
        'sidebar.admin': 'Admin',
        'sidebar.admin.panel': '관리자 패널 (Admin)',
        'sidebar.level': '비기너',

        // General
        'common.user': '유저',
    },
    en: {
        // Settings Page
        'settings.title': '⚙️ Settings',
        'settings.desc': 'Configure notifications, theme, security, and more.',
        'settings.notifications': 'Notifications',
        'settings.notifications.desc': 'Select the notifications you wish to receive',
        'settings.notif.quest': 'Quest Alerts',
        'settings.notif.quest.desc': 'New quests, reward notifications',
        'settings.notif.battle': 'Battle Alerts',
        'settings.notif.battle.desc': 'Battle invites, results',
        'settings.notif.friend': 'Friend Alerts',
        'settings.notif.friend.desc': 'Friend requests, messages',
        'settings.notif.system': 'System Alerts',
        'settings.notif.system.desc': 'Announcements, updates',
        'settings.theme': 'Theme Settings',
        'settings.theme.desc': 'Customize colors, fonts, compact mode',
        'settings.theme.open': '🎨 Open Theme Customizer',
        'settings.language': 'Language Settings',
        'settings.language.desc': 'Display language of the site',
        'settings.password': 'Change Password',
        'settings.password.oauth': 'OAuth login does not use a password',
        'settings.password.new': 'Set a new password',
        'settings.password.oauth.desc': 'You are using a social login (Google/GitHub), so you do not need to change a password.',
        'settings.password.input.new': 'New Password (6+ chars)',
        'settings.password.input.confirm': 'Confirm Password',
        'settings.password.btn': 'Change Password',
        'settings.password.btn.ing': 'Changing...',
        'settings.delete': 'Delete Account',
        'settings.delete.desc': 'This action cannot be undone',
        'settings.delete.btn': 'Proceed to Delete',
        'settings.delete.confirm.title': 'Are you sure?',
        'settings.delete.confirm.desc': 'Your profile will be initialized and data cannot be recovered.',
        'settings.delete.confirm.instruct': 'To confirm, type ',
        'settings.delete.confirm.keyword': 'Delete Account',
        'settings.delete.confirm.instruct2': ' below.',
        'settings.delete.cancel': 'Cancel',
        'settings.delete.submit': 'Confirm Deletion',
        'settings.login.required': 'Please log in to change settings.',

        // Sidebar Main
        'sidebar.main': 'Main',
        'sidebar.home': 'Home',
        'sidebar.lounge': 'Lounge',
        'sidebar.about': 'About Vibe',
        'sidebar.battle': 'Battle',
        'sidebar.arena': 'Battle Arena',
        'sidebar.growth': 'Growth',
        'sidebar.vibe.dna': 'Vibe DNA',
        'sidebar.vibe.market': 'Asset Market',
        'sidebar.season.pass': 'Season Pass',
        'sidebar.vibe.shop': 'Vibe Shop',
        'sidebar.vibe.sandbox': 'Sandbox',
        'sidebar.inventory': 'Inventory',
        'sidebar.social': 'Social',
        'sidebar.profile': 'Profile',
        'sidebar.friends': 'Friends',
        'sidebar.messages': 'Messages',
        'sidebar.attendance': 'Attendance',
        'sidebar.study': 'Study Groups',
        'sidebar.moments': 'Warm Moments',
        'sidebar.bookmarks': 'Bookmarks',
        'sidebar.settings': 'Settings',
        'sidebar.utility': 'Utility',
        'sidebar.pomodoro': 'Study Timer',
        'sidebar.snippets': 'Code Snippets',
        'sidebar.exchange': 'Point Exchange',
        'sidebar.learn': 'Learn',
        'sidebar.mentor': 'Find Mentors',
        'sidebar.ai.study': 'AI Pair Programming',
        'sidebar.classroom': 'Live Classroom',
        'sidebar.creative': 'Creative',
        'sidebar.starter.guide': 'Starter Guide',
        'sidebar.interactive.demo': 'Interactive Demo',
        'sidebar.showcase': 'Project Showcase',
        'sidebar.diagnosis': 'Self-Diagnosis',
        'sidebar.challenge': 'Weekly Challenge',
        'sidebar.daily': 'Daily Challenge',
        'sidebar.points': 'Point History',
        'sidebar.admin': 'Admin',
        'sidebar.admin.panel': 'Admin Dashboard',
        'sidebar.level': 'Beginner',

        // General
        'common.user': 'User',
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState(() => localStorage.getItem('kcvl_language') || 'ko');

    useEffect(() => {
        localStorage.setItem('kcvl_language', language);
    }, [language]);

    const t = (key) => {
        return translations[language]?.[key] || key; // 번역이 없으면 key 그대로 반환
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
