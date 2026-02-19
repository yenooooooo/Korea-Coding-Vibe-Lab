// 바이브코딩 스타터팩 PDF 페이지 정의 (한글화)
export const getPdfPages = () => {
    const year = new Date().getFullYear();

    return [
        // 표지
        `<div style="width:794px;height:1123px;background:#0f172a;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Segoe UI',sans-serif;position:relative;">
            <div style="position:absolute;top:0;left:0;right:0;height:8px;background:linear-gradient(90deg,#6366f1,#a855f7);"></div>
            <div style="font-size:52px;font-weight:900;color:#fff;letter-spacing:4px;margin-bottom:8px;">VIBE CODING</div>
            <div style="font-size:36px;font-weight:800;color:#a855f7;letter-spacing:6px;margin-bottom:40px;">STARTER PACK</div>
            <div style="width:120px;height:2px;background:#6366f1;margin-bottom:40px;"></div>
            <div style="font-size:22px;color:#94a3b8;margin-bottom:8px;">AI 프롬프트 코딩 완벽 가이드</div>
            <div style="font-size:16px;color:#64748b;margin-bottom:80px;">바이브코딩 입문자를 위한 필수 안내서</div>
            <div style="font-size:18px;color:#cbd5e1;margin-bottom:8px;">Korea Coding Vibe Lab</div>
            <div style="position:absolute;bottom:40px;font-size:13px;color:#475569;">Version 1.0 | ${year} | korea-coding-vibe-lab.vercel.app</div>
        </div>`,

        // 목차
        `<div style="width:794px;height:1123px;background:#0f172a;padding:50px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;">
            <div style="font-size:28px;font-weight:800;color:#6366f1;margin-bottom:10px;">목차 TABLE OF CONTENTS</div>
            <div style="height:2px;background:#6366f1;margin-bottom:40px;width:100%;"></div>
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;"><div style="font-size:32px;font-weight:900;color:#6366f1;min-width:50px;">01</div><div><div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px;">바이브코딩이란?</div><div style="font-size:14px;color:#94a3b8;">AI와 대화하며 코딩하는 새로운 방식</div></div></div>
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;"><div style="font-size:32px;font-weight:900;color:#10b981;min-width:50px;">02</div><div><div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px;">시작 전 준비물</div><div style="font-size:14px;color:#94a3b8;">필수 도구, 계정, 환경 설정 가이드</div></div></div>
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;"><div style="font-size:32px;font-weight:900;color:#f59e0b;min-width:50px;">03</div><div><div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px;">프롬프트 작성법</div><div style="font-size:14px;color:#94a3b8;">좋은 프롬프트 vs 나쁜 프롬프트 비교</div></div></div>
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;"><div style="font-size:32px;font-weight:900;color:#ec4899;min-width:50px;">04</div><div><div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px;">실전 프로젝트 예제</div><div style="font-size:14px;color:#94a3b8;">바로 따라할 수 있는 5가지 프로젝트</div></div></div>
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;"><div style="font-size:32px;font-weight:900;color:#ef4444;min-width:50px;">05</div><div><div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px;">초보자 흔한 실수 TOP 5</div><div style="font-size:14px;color:#94a3b8;">이것만 피하면 절반은 성공!</div></div></div>
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;"><div style="font-size:32px;font-weight:900;color:#3b82f6;min-width:50px;">06</div><div><div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px;">AI 코딩 도구 비교</div><div style="font-size:14px;color:#94a3b8;">Cursor, Windsurf, Bolt 등 핵심 도구</div></div></div>
            <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;"><div style="font-size:32px;font-weight:900;color:#8b5cf6;min-width:50px;">07</div><div><div style="font-size:20px;font-weight:700;color:#fff;margin-bottom:4px;">다음 단계</div><div style="font-size:14px;color:#94a3b8;">Korea Coding Vibe Lab 200% 활용법</div></div></div>
        </div>`,

        // Chapter 01
        `<div style="width:794px;height:1123px;background:#0f172a;padding:50px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;">
            <div style="height:6px;background:#6366f1;margin:-50px -50px 30px -50px;"></div>
            <div style="font-size:13px;font-weight:700;color:#6366f1;letter-spacing:2px;margin-bottom:8px;">CHAPTER 01</div>
            <div style="font-size:28px;font-weight:800;color:#fff;margin-bottom:30px;">바이브코딩이란?</div>
            <div style="font-size:15px;color:#cbd5e1;line-height:2;">
                <p>바이브코딩(Vibe Coding)은 <span style="color:#a855f7;font-weight:700;">AI에게 자연어로 설명하면 AI가 코드를 작성해주는</span> 새로운 프로그래밍 방식입니다.</p>
                <p>프로그래밍 언어를 외울 필요 없이, 한국어로 "이런 걸 만들어줘"라고 말하면 실제 작동하는 프로그램이 완성됩니다.</p>
                <br/>
                <div style="font-size:18px;font-weight:700;color:#a855f7;margin-bottom:12px;">💡 핵심 3단계</div>
                <div style="padding-left:16px;">
                    <p>1️⃣ 원하는 것을 구체적으로 AI에게 설명한다</p>
                    <p>2️⃣ AI가 생성한 코드를 확인하고 실행한다</p>
                    <p>3️⃣ 추가 프롬프트로 수정하고 발전시킨다</p>
                </div>
                <br/>
                <div style="font-size:18px;font-weight:700;color:#a855f7;margin-bottom:12px;">🎯 이런 분에게 추천합니다</div>
                <div style="padding-left:16px;">
                    <p>• 코딩을 전혀 모르지만 앱/웹사이트를 만들고 싶은 분</p>
                    <p>• 창업 아이디어가 있지만 개발자가 없는 분</p>
                    <p>• 디자이너인데 프로토타입을 빠르게 만들고 싶은 분</p>
                    <p>• 프로그래밍을 배우고 싶은 학생</p>
                    <p>• AI 시대의 새로운 기술에 관심있는 모든 분</p>
                </div>
                <br/>
                <div style="font-size:18px;font-weight:700;color:#a855f7;margin-bottom:12px;">🚀 왜 바이브코딩인가?</div>
                <div style="padding-left:16px;">
                    <p>• 사전 코딩 경험이 전혀 필요 없음</p>
                    <p>• 몇 달이 아닌 몇 시간 만에 앱 완성 가능</p>
                    <p>• "어떻게 코딩하나"가 아닌 "무엇을 만들 것인가"에 집중</p>
                    <p>• 자연스럽게 프로그래밍 개념을 습득</p>
                </div>
            </div>
        </div>`,

        // Chapter 02
        `<div style="width:794px;height:1123px;background:#0f172a;padding:50px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;">
            <div style="height:6px;background:#10b981;margin:-50px -50px 30px -50px;"></div>
            <div style="font-size:13px;font-weight:700;color:#10b981;letter-spacing:2px;margin-bottom:8px;">CHAPTER 02</div>
            <div style="font-size:28px;font-weight:800;color:#fff;margin-bottom:20px;">시작 전 준비물</div>
            <div style="font-size:14px;color:#cbd5e1;line-height:1.8;">
                <div style="font-size:18px;font-weight:700;color:#10b981;margin-bottom:10px;">🛠️ 필수 도구 (모두 무료)</div>
                <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <p><span style="color:#fff;font-weight:700;">1. Cursor</span> (cursor.com) — VS Code 기반 AI 코드 에디터</p>
                    <p style="color:#94a3b8;padding-left:16px;">추천: 본격적인 프로젝트 개발에 최적</p>
                </div>
                <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <p><span style="color:#fff;font-weight:700;">2. Windsurf</span> (codeium.com/windsurf) — 풀 기능 AI IDE</p>
                    <p style="color:#94a3b8;padding-left:16px;">추천: 대규모 프로젝트에 적합</p>
                </div>
                <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <p><span style="color:#fff;font-weight:700;">3. Bolt.new</span> (bolt.new) — 설치 없이 브라우저에서 바로 사용</p>
                    <p style="color:#94a3b8;padding-left:16px;">추천: 초보자 1순위! 가장 쉽게 시작</p>
                </div>
                <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <p><span style="color:#fff;font-weight:700;">4. v0 by Vercel</span> (v0.dev) — 텍스트만으로 UI 생성</p>
                    <p style="color:#94a3b8;padding-left:16px;">추천: 프론트엔드/UI 디자인에 최적</p>
                </div>
                <div style="font-size:18px;font-weight:700;color:#10b981;margin:16px 0 10px;">📋 만들어야 할 계정</div>
                <p>✅ <span style="font-weight:700;color:#fff;">GitHub</span> (github.com) — 코드 저장 & 버전 관리</p>
                <p>✅ <span style="font-weight:700;color:#fff;">Vercel</span> (vercel.com) — 무료 웹사이트 배포</p>
                <p>✅ <span style="font-weight:700;color:#fff;">Supabase</span> (supabase.com) — 무료 데이터베이스 & 인증</p>
                <p>✅ <span style="font-weight:700;color:#fff;">ChatGPT 또는 Claude</span> — 프롬프트 작성 보조</p>
                <div style="font-size:18px;font-weight:700;color:#10b981;margin:16px 0 10px;">🏁 시작 4단계</div>
                <p>Step 1: Cursor 설치 또는 Bolt.new 접속</p>
                <p>Step 2: 새 프로젝트 폴더 만들기</p>
                <p>Step 3: AI 채팅 열기 (Cursor에서 Ctrl+L)</p>
                <p>Step 4: 첫 번째 프롬프트 입력!</p>
            </div>
        </div>`,
    ];
};

export const getPdfPages2 = () => [
    // Chapter 03
    `<div style="width:794px;height:1123px;background:#0f172a;padding:50px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;">
            <div style="height:6px;background:#f59e0b;margin:-50px -50px 30px -50px;"></div>
            <div style="font-size:13px;font-weight:700;color:#f59e0b;letter-spacing:2px;margin-bottom:8px;">CHAPTER 03</div>
            <div style="font-size:28px;font-weight:800;color:#fff;margin-bottom:20px;">프롬프트 작성법</div>
            <div style="font-size:14px;color:#cbd5e1;line-height:1.8;">
                <div style="font-size:18px;font-weight:700;color:#f59e0b;margin-bottom:12px;">📝 프롬프트 작성 5대 황금 법칙</div>
                <div style="margin-bottom:14px;">
                    <p style="font-weight:700;color:#fff;">법칙 1: 구체적으로 말하기</p>
                    <p style="color:#ef4444;">  ❌ 나쁜 예: "웹사이트 만들어줘"</p>
                    <p style="color:#22c55e;">  ✅ 좋은 예: "다크 모드의 개인 포트폴리오 사이트를 React로 만들어줘. 히어로 섹션, 프로젝트 갤러리, 연락처 폼 포함"</p>
                </div>
                <div style="margin-bottom:14px;">
                    <p style="font-weight:700;color:#fff;">법칙 2: 맥락 제공하기</p>
                    <p style="color:#ef4444;">  ❌ 나쁜 예: "버튼 추가해줘"</p>
                    <p style="color:#22c55e;">  ✅ 좋은 예: "폼 하단에 보라색 그라디언트 제출 버튼 추가. 클릭하면 로딩 스피너 표시"</p>
                </div>
                <div style="margin-bottom:14px;">
                    <p style="font-weight:700;color:#fff;">법칙 3: 복잡한 작업은 나눠서</p>
                    <p style="color:#ef4444;">  ❌ 나쁜 예: "쇼핑몰 사이트 전체 만들어줘"</p>
                    <p style="color:#22c55e;">  ✅ 좋은 예: "먼저 상품 목록 페이지부터. 3열 그리드로 이미지, 이름, 가격, 장바구니 버튼"</p>
                </div>
                <div style="margin-bottom:14px;">
                    <p style="font-weight:700;color:#fff;">법칙 4: 기술 스택 명시하기</p>
                    <p style="color:#22c55e;">  ✅ "React 사용, 애니메이션은 Framer Motion, 백엔드는 Supabase로"</p>
                </div>
                <div style="margin-bottom:14px;">
                    <p style="font-weight:700;color:#fff;">법칙 5: 디자인 스타일 설명하기</p>
                    <p style="color:#22c55e;">  ✅ "다크모드, 글래스모피즘 카드, 보라색 포인트, 호버 시 애니메이션"</p>
                </div>
                <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:16px;margin-top:8px;">
                    <div style="font-weight:700;color:#f59e0b;margin-bottom:8px;">📋 프롬프트 템플릿</div>
                    <p style="color:#e2e8f0;">"[무엇]을 만들고 싶어.</p>
                    <p style="color:#e2e8f0;">[핵심 기능]이 포함되어야 해.</p>
                    <p style="color:#e2e8f0;">스타일은 [디자인 설명]으로.</p>
                    <p style="color:#e2e8f0;">[기술스택]을 사용해줘.</p>
                    <p style="color:#e2e8f0;">[첫번째 단계]부터 시작하자."</p>
                </div>
            </div>
        </div>`,

    // Chapter 04
    `<div style="width:794px;height:1123px;background:#0f172a;padding:50px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;">
            <div style="height:6px;background:#ec4899;margin:-50px -50px 30px -50px;"></div>
            <div style="font-size:13px;font-weight:700;color:#ec4899;letter-spacing:2px;margin-bottom:8px;">CHAPTER 04</div>
            <div style="font-size:28px;font-weight:800;color:#fff;margin-bottom:20px;">실전 프로젝트 예제</div>
            <div style="font-size:13px;color:#cbd5e1;line-height:1.7;">
                <div style="background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.2);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="font-weight:700;color:#ec4899;font-size:15px;margin-bottom:4px;">예제 1: 개인 포트폴리오 사이트</div>
                    <p style="color:#e2e8f0;font-style:italic;">"개인 포트폴리오 웹사이트를 React로 만들어줘. 히어로 섹션에 타이핑 애니메이션, 스킬 프로그레스 바, 프로젝트 갤러리, 연락처 폼. 다크 테마, 보라색 포인트"</p>
                </div>
                <div style="background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.2);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="font-weight:700;color:#ec4899;font-size:15px;margin-bottom:4px;">예제 2: 할 일 관리 앱 (Todo App)</div>
                    <p style="color:#e2e8f0;font-style:italic;">"모던한 투두 앱. 추가/수정/삭제, 카테고리별 컬러 태그, 드래그 앤 드롭 정렬, 로컬스토리지 저장, 부드러운 애니메이션. React + Framer Motion"</p>
                </div>
                <div style="background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.2);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="font-weight:700;color:#ec4899;font-size:15px;margin-bottom:4px;">예제 3: 날씨 대시보드</div>
                    <p style="color:#e2e8f0;font-style:italic;">"날씨 대시보드. 도시별 현재 날씨, 5일 예보 아이콘, 날씨 배경 애니메이션, OpenWeatherMap API, 모바일 반응형"</p>
                </div>
                <div style="background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.2);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="font-weight:700;color:#ec4899;font-size:15px;margin-bottom:4px;">예제 4: 미니 게임 (Snake Game)</div>
                    <p style="color:#e2e8f0;font-style:italic;">"스네이크 게임. 방향키 조작, 점수 & 최고 점수, 점수 오를수록 속도 증가, 게임 오버 + 재시작. HTML Canvas, 네온 스타일"</p>
                </div>
                <div style="background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.2);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="font-weight:700;color:#ec4899;font-size:15px;margin-bottom:4px;">예제 5: 실시간 채팅 앱</div>
                    <p style="color:#e2e8f0;font-style:italic;">"실시간 채팅 앱. 회원가입/로그인, 실시간 메시지, 유저 아바타 & 온라인 상태, 이모지 리액션, 타이핑 표시기. React + Supabase"</p>
                </div>
                <div style="background:rgba(236,72,153,0.15);border:1px solid rgba(236,72,153,0.3);border-radius:12px;padding:14px;">
                    <div style="font-weight:700;color:#ec4899;margin-bottom:6px;">💡 모든 예제의 핵심 팁</div>
                    <p>1. 작게 시작해서 기능을 하나씩 추가</p>
                    <p>2. 다음 기능 전에 현재 기능 반드시 테스트</p>
                    <p>3. 에러 발생 시 AI에게 에러 메시지 전체 복사해서 전달</p>
                    <p>4. git commit으로 자주 저장</p>
                    <p>5. 빨리 배포해서 친구에게 자랑하세요! 🎉</p>
                </div>
            </div>
        </div>`,

    // Chapter 05
    `<div style="width:794px;height:1123px;background:#0f172a;padding:50px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;">
            <div style="height:6px;background:#ef4444;margin:-50px -50px 30px -50px;"></div>
            <div style="font-size:13px;font-weight:700;color:#ef4444;letter-spacing:2px;margin-bottom:8px;">CHAPTER 05</div>
            <div style="font-size:28px;font-weight:800;color:#fff;margin-bottom:20px;">초보자 흔한 실수 TOP 5</div>
            <div style="font-size:14px;color:#cbd5e1;line-height:1.8;">
                <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="font-weight:700;color:#ef4444;font-size:16px;margin-bottom:6px;">실수 1: 너무 애매하게 말하기</div>
                    <p style="color:#ef4444;">❌ "좀 더 예쁘게 해줘"</p>
                    <p style="color:#22c55e;">✅ "카드 배경을 #1e293b → #0f172a 그라디언트, 흰색 20% 투명도 테두리, box-shadow 추가"</p>
                </div>
                <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="font-weight:700;color:#ef4444;font-size:16px;margin-bottom:6px;">실수 2: 한번에 다 만들려고 하기</div>
                    <p style="color:#ef4444;">❌ "SNS 전체를 만들어줘 – 포스트, 댓글, 좋아요, 스토리, DM..."</p>
                    <p style="color:#22c55e;">✅ 단계별로! 먼저 포스트 → 작동하면 댓글 추가 → 그 다음 좋아요</p>
                </div>
                <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="font-weight:700;color:#ef4444;font-size:16px;margin-bottom:6px;">실수 3: 테스트 없이 계속 추가하기</div>
                    <p style="color:#ef4444;">❌ 10개 프롬프트 보내고 확인 안 함</p>
                    <p style="color:#22c55e;">✅ 매 프롬프트마다 테스트! 문제 생기면 다음 진행 전 반드시 수정</p>
                </div>
                <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="font-weight:700;color:#ef4444;font-size:16px;margin-bottom:6px;">실수 4: 에러 메시지 무시하기</div>
                    <p style="color:#ef4444;">❌ "안 돼, 고쳐줘"</p>
                    <p style="color:#22c55e;">✅ 에러 메시지 전체를 복사해서 AI에게 전달. "ProductList.jsx 42줄에서 TypeError 발생" 처럼 구체적으로!</p>
                </div>
                <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:12px;padding:14px;margin-bottom:12px;">
                    <div style="font-weight:700;color:#ef4444;font-size:16px;margin-bottom:6px;">실수 5: 버전 관리 안 하기 (Git)</div>
                    <p style="color:#ef4444;">❌ 50개 변경 후 원래대로 돌아갈 수 없음</p>
                    <p style="color:#22c55e;">✅ 기능 완성마다 git commit! "git add . && git commit -m '상품 카드 UI 추가'" — 언제든 되돌릴 수 있어요</p>
                </div>
            </div>
        </div>`,

    // Chapter 06
    `<div style="width:794px;height:1123px;background:#0f172a;padding:50px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;">
            <div style="height:6px;background:#3b82f6;margin:-50px -50px 30px -50px;"></div>
            <div style="font-size:13px;font-weight:700;color:#3b82f6;letter-spacing:2px;margin-bottom:8px;">CHAPTER 06</div>
            <div style="font-size:28px;font-weight:800;color:#fff;margin-bottom:20px;">AI 코딩 도구 비교</div>
            <div style="font-size:14px;color:#cbd5e1;">
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                    <thead><tr style="background:rgba(59,130,246,0.15);"><th style="padding:10px;text-align:left;color:#93c5fd;border-bottom:2px solid rgba(59,130,246,0.3);">도구</th><th style="padding:10px;text-align:left;color:#93c5fd;border-bottom:2px solid rgba(59,130,246,0.3);">유형</th><th style="padding:10px;text-align:left;color:#93c5fd;border-bottom:2px solid rgba(59,130,246,0.3);">가격</th><th style="padding:10px;text-align:left;color:#93c5fd;border-bottom:2px solid rgba(59,130,246,0.3);">추천 용도</th></tr></thead>
                    <tbody>
                        <tr style="background:rgba(30,41,59,0.5);"><td style="padding:8px;font-weight:700;color:#fff;border-bottom:1px solid rgba(255,255,255,0.05);">Cursor</td><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.05);">데스크톱 IDE</td><td style="padding:8px;color:#10b981;border-bottom:1px solid rgba(255,255,255,0.05);">무료 / $20/월</td><td style="padding:8px;color:#a78bfa;border-bottom:1px solid rgba(255,255,255,0.05);">본격 프로젝트</td></tr>
                        <tr><td style="padding:8px;font-weight:700;color:#fff;border-bottom:1px solid rgba(255,255,255,0.05);">Windsurf</td><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.05);">데스크톱 IDE</td><td style="padding:8px;color:#10b981;border-bottom:1px solid rgba(255,255,255,0.05);">무료 / $15/월</td><td style="padding:8px;color:#a78bfa;border-bottom:1px solid rgba(255,255,255,0.05);">대규모 코드</td></tr>
                        <tr style="background:rgba(30,41,59,0.5);"><td style="padding:8px;font-weight:700;color:#fff;border-bottom:1px solid rgba(255,255,255,0.05);">Bolt.new</td><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.05);">브라우저</td><td style="padding:8px;color:#10b981;border-bottom:1px solid rgba(255,255,255,0.05);">무료 / $20/월</td><td style="padding:8px;color:#a78bfa;border-bottom:1px solid rgba(255,255,255,0.05);">빠른 프로토타입</td></tr>
                        <tr><td style="padding:8px;font-weight:700;color:#fff;border-bottom:1px solid rgba(255,255,255,0.05);">v0 (Vercel)</td><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.05);">브라우저</td><td style="padding:8px;color:#10b981;border-bottom:1px solid rgba(255,255,255,0.05);">무료 / $20/월</td><td style="padding:8px;color:#a78bfa;border-bottom:1px solid rgba(255,255,255,0.05);">UI 컴포넌트</td></tr>
                        <tr style="background:rgba(30,41,59,0.5);"><td style="padding:8px;font-weight:700;color:#fff;border-bottom:1px solid rgba(255,255,255,0.05);">Lovable</td><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.05);">브라우저</td><td style="padding:8px;color:#10b981;border-bottom:1px solid rgba(255,255,255,0.05);">무료 / $20/월</td><td style="padding:8px;color:#a78bfa;border-bottom:1px solid rgba(255,255,255,0.05);">풀스택 앱</td></tr>
                        <tr><td style="padding:8px;font-weight:700;color:#fff;border-bottom:1px solid rgba(255,255,255,0.05);">GitHub Copilot</td><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.05);">확장 프로그램</td><td style="padding:8px;color:#10b981;border-bottom:1px solid rgba(255,255,255,0.05);">$10/월</td><td style="padding:8px;color:#a78bfa;border-bottom:1px solid rgba(255,255,255,0.05);">코드 자동완성</td></tr>
                        <tr style="background:rgba(30,41,59,0.5);"><td style="padding:8px;font-weight:700;color:#fff;border-bottom:1px solid rgba(255,255,255,0.05);">Claude</td><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.05);">채팅</td><td style="padding:8px;color:#10b981;border-bottom:1px solid rgba(255,255,255,0.05);">$20/월</td><td style="padding:8px;color:#a78bfa;border-bottom:1px solid rgba(255,255,255,0.05);">복잡한 로직</td></tr>
                        <tr><td style="padding:8px;font-weight:700;color:#fff;border-bottom:1px solid rgba(255,255,255,0.05);">ChatGPT</td><td style="padding:8px;color:#94a3b8;border-bottom:1px solid rgba(255,255,255,0.05);">채팅</td><td style="padding:8px;color:#10b981;border-bottom:1px solid rgba(255,255,255,0.05);">무료 / $20/월</td><td style="padding:8px;color:#a78bfa;border-bottom:1px solid rgba(255,255,255,0.05);">범용 코딩</td></tr>
                    </tbody>
                </table>
                <div style="font-size:18px;font-weight:700;color:#3b82f6;margin-bottom:12px;">🏆 초보자 추천 순위</div>
                <div style="background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:12px;padding:16px;">
                    <p style="margin-bottom:8px;"><span style="font-size:18px;">🥇</span> <span style="font-weight:700;color:#fff;">Bolt.new</span> — 설치 없이 브라우저에서 바로, 즉시 미리보기</p>
                    <p style="margin-bottom:8px;"><span style="font-size:18px;">🥈</span> <span style="font-weight:700;color:#fff;">Cursor</span> — 더 강력한 기능, 학습에 최적, 무료 티어 충분</p>
                    <p><span style="font-size:18px;">🥉</span> <span style="font-weight:700;color:#fff;">v0.dev</span> — UI만 빠르게, 텍스트로 컴포넌트 생성</p>
                </div>
            </div>
        </div>`,

    // Chapter 07
    `<div style="width:794px;height:1123px;background:#0f172a;padding:50px;box-sizing:border-box;font-family:'Segoe UI',sans-serif;position:relative;">
            <div style="height:6px;background:#8b5cf6;margin:-50px -50px 30px -50px;"></div>
            <div style="font-size:13px;font-weight:700;color:#8b5cf6;letter-spacing:2px;margin-bottom:8px;">CHAPTER 07</div>
            <div style="font-size:28px;font-weight:800;color:#fff;margin-bottom:20px;">다음 단계</div>
            <div style="font-size:14px;color:#cbd5e1;line-height:1.8;">
                <div style="font-size:18px;font-weight:700;color:#8b5cf6;margin-bottom:12px;">🏠 Korea Coding Vibe Lab 활용하기</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">
                    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:12px;"><div style="font-weight:700;color:#fff;font-size:14px;margin-bottom:4px;">📅 출석 체크인</div><div style="color:#94a3b8;font-size:13px;">매일 출석으로 포인트와 스트릭 보상</div></div>
                    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:12px;"><div style="font-weight:700;color:#fff;font-size:14px;margin-bottom:4px;">🤖 AI 스터디</div><div style="color:#94a3b8;font-size:13px;">AI와 함께하는 코딩 연습</div></div>
                    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:12px;"><div style="font-weight:700;color:#fff;font-size:14px;margin-bottom:4px;">⚔️ 배틀 아레나</div><div style="color:#94a3b8;font-size:13px;">실시간 코딩 대결</div></div>
                    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:12px;"><div style="font-weight:700;color:#fff;font-size:14px;margin-bottom:4px;">🎯 퀘스트</div><div style="color:#94a3b8;font-size:13px;">미션 완료로 포인트 & 배지 획득</div></div>
                    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:12px;"><div style="font-weight:700;color:#fff;font-size:14px;margin-bottom:4px;">👨‍🏫 멘토 시스템</div><div style="color:#94a3b8;font-size:13px;">경험 많은 개발자에게 도움 받기</div></div>
                    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:12px;"><div style="font-weight:700;color:#fff;font-size:14px;margin-bottom:4px;">🛍️ 바이브 상점</div><div style="color:#94a3b8;font-size:13px;">포인트로 아이템 구매</div></div>
                    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:12px;"><div style="font-weight:700;color:#fff;font-size:14px;margin-bottom:4px;">📚 스터디 그룹</div><div style="color:#94a3b8;font-size:13px;">함께 배우는 학습 모임</div></div>
                    <div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.2);border-radius:10px;padding:12px;"><div style="font-weight:700;color:#fff;font-size:14px;margin-bottom:4px;">🏆 시즌 패스</div><div style="color:#94a3b8;font-size:13px;">시즌별 특별 보상 획득</div></div>
                </div>
                <div style="font-size:18px;font-weight:700;color:#8b5cf6;margin-bottom:12px;">📆 7일 챌린지</div>
                <div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:12px;padding:16px;margin-bottom:20px;">
                    <p>Day 1: 회원가입 & 첫 출석 체크인</p>
                    <p>Day 2: AI로 간단한 랜딩 페이지 만들기</p>
                    <p>Day 3: 인터랙션 추가 (버튼, 폼)</p>
                    <p>Day 4: 데이터베이스 연결 (Supabase)</p>
                    <p>Day 5: 첫 프로젝트 온라인 배포!</p>
                    <p>Day 6: 스터디 그룹 참가</p>
                    <p>Day 7: 커뮤니티에 프로젝트 공유! 🎉</p>
                </div>
                <div style="text-align:center;padding:20px;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.1));border-radius:16px;border:1px solid rgba(139,92,246,0.3);">
                    <div style="font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;">모든 대가는 초보자였습니다 ✨</div>
                    <div style="color:#a78bfa;font-size:15px;">작게 시작하고, 꾸준히 하며, 과정을 즐기세요.</div>
                    <div style="color:#a78bfa;font-size:15px;margin-top:4px;">Happy Vibe Coding! 🚀</div>
                </div>
            </div>
            <div style="position:absolute;bottom:0;left:0;right:0;height:6px;background:linear-gradient(90deg,#6366f1,#a855f7);"></div>
        </div>`,
];
