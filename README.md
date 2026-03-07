# Korea Coding Vibe Lab 🇰🇷💻✨

**코딩과 학습을 게임화하고 커뮤니티로 연결하는 올인원 교육 플랫폼**

Korea Coding Vibe Lab은 코딩 학습자들이 멘토링, 커뮤니티, AI 지원을 통해 함께 성장하는 공간입니다.

--- 

## 🚀 시작하기 (Getting Started)

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 브라우저에서 확인 (http://localhost:5173)
```

### 환경변수 설정 (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_TOSS_CLIENT_KEY=your_toss_key
VITE_AGORA_APP_ID=your_agora_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## ✨ 주요 기능 (Features)

### 📚 학습 & 멘토링
- **👨‍🏫 멘토 찾기**: 경력 있는 멘토와 1:1 매칭
- **📅 멘토 예약**: 실시간 일정 예약 및 결제
- **🎓 AI 스터디 파트너**: Gemini AI 기반 24/7 코딩 멘토
- **💬 실시간 채팅**: 멘토와 학생 간 실시간 소통
- **📹 화상통화**: Agora RTC 기반 고품질 온라인 수업

### 🎮 게임화 & 커뮤니티
- **🏠 홈 (Dashboard)**: 오늘의 바이브와 통계 확인
- **📅 출석 체크**: 연속 출석일(Streak) 보상
- **⚔️ 배틀 시스템**: 다른 사용자와 코딩 능력 겨루기
- **🎯 퀘스트**: 일일/주간 학습 미션
- **🏆 랭킹**: 실시간 글로벌 랭킹 시스템
- **👥 커뮤니티**: 게시판, 댓글, 좋아요

### 💰 경제 시스템
- **🪙 포인트 & 배지**: 활동으로 포인트 획득
- **🛍️ 상점 (Shop)**: 포인트로 아이템/배지 구매
- **📈 마켓 (Market)**: 다른 사용자와 포인트 거래
- **💱 거래소 (Exchange)**: 가상 자산 거래
- **🎫 시즌 패스**: 프리미엄 콘텐츠 구독

### 🔧 추가 기능
- **💾 인벤토리**: 보유 아이템 관리
- **👤 프로필**: 사용자 프로필 및 배지 전시
- **👫 친구**: 친구 추가 및 친구 목록
- **💌 직접 메시지**: 프라이빗 1:1 채팅
- **🧪 샌드박스**: 코드 작성 및 테스트 환경
- **💳 결제**: 토스페이먼츠 기반 안전한 결제

---

## 🛠️ 기술 스택 (Tech Stack)

| 분류 | 기술 |
|------|------|
| **Frontend** | React 18, Vite, React Router DOM 6 |
| **Styling** | Vanilla CSS (Glassmorphism, Dark Theme) |
| **UI Components** | Lucide React, Framer Motion |
| **Backend/Database** | Supabase (PostgreSQL, Realtime) |
| **Authentication** | Supabase Auth |
| **Video Call** | Agora RTC SDK |
| **Payment** | Toss Payments API |
| **AI** | Google Generative AI (Gemini 2.0) |
| **Deployment** | Vercel |

---

## 📱 핵심 페이지 구조

```
홈 (Home)
├── 출석 (Attendance)
├── 커뮤니티 (Community)
├── 퀘스트 (Quest)
├── 배틀 (Battle Arena)
├── 랭킹 (Ranking)
├── 멘토 찾기 (Mentor Finding)
├── 멘토 예약 (Mentor Booking)
├── AI 스터디 (AI Study Partner)
├── 상점 (Shop)
├── 마켓 (Market)
├── 거래소 (Exchange)
└── 프로필 (Profile)
```

---

## 🔐 보안 & 개인정보

- Supabase Row Level Security (RLS) 활용
- 환경변수로 API 키 관리
- 사용자 인증 토큰 안전 보관
- 결제 정보는 토스페이먼츠에서 관리

---

## 📈 성능 최적화

- Vite의 빠른 개발 환경
- Code splitting 및 Lazy loading
- 이미지 최적화
- Realtime 동기화를 통한 UX 향상

---

## 🎯 향후 계획

- [ ] 소셜 러닝 (Study Group) 기능
- [ ] 멘토 라이브 방송
- [ ] 코드 리뷰 마켓플레이스
- [ ] 모바일 앱 출시
- [ ] AI 기반 개인화 추천

---

## 📝 라이선스

MIT License

---

**Korea Coding Vibe Lab** - 함께 성장하는 코딩 커뮤니티
🚀 [배포 링크](https://korea-coding-vibe-lab.vercel.app)
