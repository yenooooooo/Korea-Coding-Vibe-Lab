# CLAUDE.md — Korea Coding Vibe Lab 작업 지침

## 프로젝트 개요

코딩 커뮤니티 플랫폼. 배틀, 퀘스트, 멘토링, 갤러리, DM, 출석, 포인트 시스템 등 다수의 기능을 포함한 풀스택 React 앱.

- **Frontend**: React (Vite), framer-motion, lucide-react
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Presence)
- **다국어**: 한국어/영어 (LanguageContext 내 하드코딩 번역 객체)
- **배포 환경**: `.env` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 디렉토리 구조

```
src/
  App.jsx              # 라우팅 (Routes/Route 정의)
  main.jsx             # 앱 진입점, Provider 순서 중요
  layouts/
    MainLayout.jsx     # 공통 레이아웃, 사이드바/알림/Presence/브로드캐스트 관리
  context/
    AuthContext.jsx    # user, profile, loading 상태. useAuth() 훅
    LanguageContext.jsx# t(key) 번역 훅. translations 객체에 ko/en 키 정의
    ToastContext.jsx   # addToast, success/error/warning/info 훅
    ThemeContext.jsx   # themeColors
    FocusCamContext.jsx
  components/
    Sidebar.jsx        # 사이드바 (collapsed 60px / expanded 300px)
    LivePresenceIsland.jsx # 실시간 접속자 표시
    ...
  pages/               # 각 라우트에 대응하는 페이지 컴포넌트
  lib/
    supabase.js        # supabase 클라이언트 (싱글턴)
    notifications.js   # sendNotification(), getExcludedNotificationTypes()
  hooks/
    useAnalytics.js    # 페이지뷰 로깅
  utils/
    vibeLevel.js       # getVibeLevel(points) → 레벨/칭호 계산
    admin.js           # isAdmin(user) 판별
```

---

## 핵심 패턴 및 규칙

### Supabase 사용
- 클라이언트는 항상 `import { supabase } from '../lib/supabase'` 로 가져올 것
- Realtime 구독은 반드시 cleanup에서 `supabase.removeChannel(channel)` 호출
- `.on('postgres_changes', config)` 3번째 인자(콜백)를 절대 빠뜨리지 말 것 — 빠지면 조용히 실패함
- `useEffect` 안에서 realtime 구독 시 closure 안에서 state를 참조하면 반드시 deps array에 포함

### 인증 (AuthContext)
- 로그인 상태: `const { user, profile, loading } = useAuth()`
- `user` = Supabase Auth 유저 객체 (이메일, id 등)
- `profile` = `profiles` 테이블의 커스텀 데이터 (포인트, 레벨, username 등)
- `loading`이 true인 동안 profile은 null일 수 있음 — 컴포넌트에서 null 체크 필수
- 보호된 라우트는 `<ProtectedRoute>` 래퍼 사용

### 다국어 (LanguageContext)
- 새 UI 텍스트 추가 시 반드시 `LanguageContext.jsx`의 `translations.ko`와 `translations.en` 양쪽에 키 추가
- 키가 없으면 `t(key)`는 key 문자열 그대로 반환됨 (화면에 키 이름이 노출됨)
- 사이드바 항목 추가 시 `sidebar.*` 키 패턴 유지
- `t('key') || '한국어 fallback'` 패턴은 번역 키 누락을 감추는 임시방편 — 실제 키를 추가하는 방식으로 해결

### Toast 알림
- 에러/성공 메시지는 반드시 `useToast()` 훅 사용: `addToast`, `success`, `error`, `warning`, `info`
- `alert()` 절대 사용 금지 — 브라우저 블로킹 UI이며 기존 Toast 시스템과 일관성 깨짐
- AuthContext의 ban 처리(line 32, 90)처럼 alert()가 남아있는 곳은 추후 toast로 교체 필요

### 스타일
- CSS-in-JS (inline style 객체) 방식 사용 — 별도 CSS 파일 없음
- Tailwind 사용 안 함
- 공통 색상 팔레트: `#0f172a`(배경), `#1e293b`(카드), `#6366f1`(주색), `#a855f7`(보조), `#22c55e`(성공), `#ef4444`(오류)
- 다크 테마 전용 — 라이트 모드 없음

---

## 알려진 버그 (수정 전까지 조심)

### 1. LivePresenceIsland — profiles stale closure
`src/components/LivePresenceIsland.jsx` line 68~90
`useEffect` dep array가 `[]`라 `sync` 핸들러 안 `profiles`는 항상 초기 `{}`를 봄.
→ 매 sync마다 이미 로드된 프로필도 재요청됨. 수정 시 `profiles`를 ref로 전환하거나 deps에 추가.

### 2. DirectMessages — conversations 구독 콜백 누락
`src/pages/DirectMessages.jsx` line 35~41
`.on('postgres_changes', config)` 콜백 없음 → 대화목록 실시간 갱신 안 됨.

### 3. DirectMessages — 내가 보낸 메시지 중복 표시
`src/pages/DirectMessages.jsx` line 162~178
sendMessage 성공 시 로컬 state에 추가 + realtime INSERT 이벤트로도 추가 → 메시지 2개 표시됨.
→ 전송 시 로컬 추가를 제거하고 realtime으로만 받거나, ID 중복 필터 추가 필요.

### 4. AuthContext — loading race condition
`src/context/AuthContext.jsx` line 50~54
`fetchProfile()`이 async인데 await 없이 `setLoading(false)` 실행됨.
→ profile null 상태로 화면이 먼저 렌더링될 수 있음.

---

## Supabase Realtime 구독 올바른 패턴

```js
// 반드시 이 패턴 따를 것
useEffect(() => {
    if (!user) return;

    const channel = supabase
        .channel('unique_channel_name_' + user.id)
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'table_name', filter: `user_id=eq.${user.id}` },
            (payload) => {
                // 콜백 반드시 있어야 함
                // state 직접 참조 대신 함수형 업데이트 사용
                setItems(prev => [...prev, payload.new]);
            }
        )
        .subscribe();

    return () => supabase.removeChannel(channel);
}, [user]); // 의존성 명확히
```

---

## 새 페이지/기능 추가 체크리스트

- [ ] `App.jsx`에 Route 추가 (보호 필요 시 `<ProtectedRoute>` 래퍼)
- [ ] `Sidebar.jsx` navCategories에 항목 추가
- [ ] `LanguageContext.jsx` ko/en 양쪽에 번역 키 추가
- [ ] `LivePresenceIsland.jsx` PAGE_NAMES에 경로 추가
- [ ] Supabase 구독 사용 시 cleanup 확인
- [ ] alert() 대신 useToast() 사용
- [ ] profile null 체크 (`profile?.username || '익명'` 패턴)

---

## 주요 Supabase 테이블 (확인된 것)

| 테이블 | 용도 |
|--------|------|
| `profiles` | 유저 커스텀 데이터 (username, avatar_url, total_points, level, is_banned) |
| `notifications` | 알림 (user_id, type, message, is_read) |
| `conversations` | DM 대화방 (user_id_1, user_id_2, last_message_at) |
| `direct_messages` | DM 메시지 (conversation_id, sender_id, content, is_read) |
| `admin_broadcasts` | 관리자 브로드캐스트 (type: vibe_change/announcement/fx/poll) |
| `broadcast_views` | 브로드캐스트 수신 기록 |
| `poll_votes` | 투표 기록 (broadcast_id, user_id, vote) |

---

## 파일 길이 관리 원칙

작업 중 생성하거나 수정하는 모든 파일은 Claude가 한 번에 읽고 처리할 수 있는 길이로 유지한다.

- 단일 파일 기준: **약 300~400줄 이하** 권장
- 파일이 길어질 경우 기능 단위로 분리 (예: 큰 컴포넌트 → 서브컴포넌트 파일로 분리)
- 이 CLAUDE.md 자체도 200줄 이하로 유지 — 섹션이 늘어나면 내용을 압축하거나 별도 파일로 분리
- 긴 번역 데이터(`LanguageContext.jsx` 등)는 예외지만, 신규 파일은 이 원칙 적용

---

## 작업 시 절대 하지 말 것

- `alert()` 사용 — Toast 쓸 것
- Supabase `.on()` 콜백 누락
- useEffect에서 async state를 closure로 캡처하면서 deps array 비우기
- 번역 키 추가 없이 `|| 'fallback'` 패턴으로 때우기
- Supabase 구독 후 cleanup(`removeChannel`) 빠뜨리기
- `profile`이 null일 수 있는 상황에서 null 체크 없이 접근
