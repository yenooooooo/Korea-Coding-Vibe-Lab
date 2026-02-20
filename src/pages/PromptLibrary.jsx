import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, CheckCircle2, Search } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: '전체', emoji: '📚' },
    { id: 'ui', label: 'UI/디자인', emoji: '🎨' },
    { id: 'feature', label: '기능 구현', emoji: '⚡' },
    { id: 'debug', label: '디버깅', emoji: '🐛' },
    { id: 'deploy', label: '배포', emoji: '🚀' },
    { id: 'database', label: '데이터베이스', emoji: '🗄️' }
];

const PROMPTS = [
    // UI
    {
        id: 1, category: 'ui', title: '다크모드 랜딩페이지',
        description: '모던한 다크 테마 랜딩페이지 생성',
        prompt: '다크 테마의 모던한 랜딩페이지를 React로 만들어줘. 헤더, 히어로 섹션, 기능 소개, CTA 버튼이 포함되어야 해. Tailwind CSS를 사용하고, 보라색과 파란색 그라디언트를 사용해줘.'
    },
    {
        id: 2, category: 'ui', title: '반응형 네비게이션 바',
        description: '모바일/데스크톱 반응형 네비게이션',
        prompt: '반응형 네비게이션 바를 만들어줘. 데스크톱에서는 가로 메뉴, 모바일에서는 햄버거 메뉴로 바뀌어야 해. 스크롤하면 배경이 불투명하게 변하는 효과도 추가해줘.'
    },
    {
        id: 3, category: 'ui', title: '카드 그리드 레이아웃',
        description: '호버 애니메이션 포함 반응형 카드 그리드',
        prompt: '카드 그리드 레이아웃을 만들어줘. 각 카드에는 이미지, 제목, 설명, 태그가 있어야 해. 호버 시 카드가 살짝 올라오는 애니메이션을 추가하고, 반응형으로 만들어줘.'
    },
    {
        id: 4, category: 'ui', title: '로그인/회원가입 폼',
        description: '유효성 검사 포함 인증 폼',
        prompt: '로그인과 회원가입 폼을 만들어줘. 이메일, 비밀번호 유효성 검사가 포함되어야 하고, 탭으로 전환 가능해야 해. 에러 메시지와 로딩 상태도 처리해줘.'
    },
    {
        id: 5, category: 'ui', title: '데이터 대시보드',
        description: '차트와 통계 카드 대시보드',
        prompt: '관리자 대시보드를 만들어줘. 사용자 수, 매출, 방문자 통계 카드와 라인 차트가 있어야 해. Chart.js나 Recharts를 사용하고, 다크 테마로 만들어줘.'
    },
    {
        id: 6, category: 'ui', title: '포트폴리오 페이지',
        description: '개발자 포트폴리오 사이트',
        prompt: '개발자 포트폴리오 사이트를 만들어줘. 자기소개, 기술 스택, 프로젝트 섹션, 연락처가 필요해. 스크롤 애니메이션을 추가하고, 코딩 느낌의 디자인으로 만들어줘.'
    },
    // Feature
    {
        id: 7, category: 'feature', title: '무한 스크롤',
        description: 'Intersection Observer API 활용',
        prompt: '무한 스크롤 기능을 구현해줘. Intersection Observer API를 사용하고, 데이터가 로딩 중일 때 스켈레톤 UI를 보여줘. 페이지 끝에 도달하면 자동으로 다음 데이터를 불러와야 해.'
    },
    {
        id: 8, category: 'feature', title: '실시간 검색',
        description: '디바운스 적용 실시간 검색 기능',
        prompt: '실시간 검색 기능을 만들어줘. 입력할 때마다 결과가 필터링되고, 디바운스(300ms)를 적용해서 API 요청을 최적화해줘. 결과 없을 때 빈 상태 메시지도 보여줘.'
    },
    {
        id: 9, category: 'feature', title: '드래그 앤 드롭 Kanban',
        description: 'Kanban 보드 드래그 기능',
        prompt: '드래그 앤 드롭으로 순서를 변경할 수 있는 Kanban 보드를 만들어줘. To Do, In Progress, Done 컬럼이 있고, 카드를 드래그해서 컬럼 간 이동이 가능해야 해.'
    },
    {
        id: 10, category: 'feature', title: '다크모드 토글',
        description: 'localStorage 저장 다크모드',
        prompt: '다크/라이트 모드 토글을 구현해줘. 사용자 설정을 localStorage에 저장하고, 시스템 기본 설정을 초기값으로 사용해줘. CSS 변수를 활용한 테마 전환 방식으로 만들어줘.'
    },
    {
        id: 11, category: 'feature', title: '이미지 업로드 미리보기',
        description: '드래그 업로드 + 미리보기',
        prompt: '이미지 업로드 기능을 만들어줘. 드래그 앤 드롭과 클릭 업로드를 모두 지원하고, 업로드 전 미리보기가 가능해야 해. 이미지 크기 제한(5MB)과 형식 검사도 추가해줘.'
    },
    {
        id: 12, category: 'feature', title: '알림 토스트 시스템',
        description: '스택형 토스트 알림 시스템',
        prompt: '토스트 알림 시스템을 만들어줘. 성공, 에러, 경고, 정보 4가지 타입이 있고, 오른쪽 하단에 쌓이는 형태로 표시해줘. 3초 후 자동으로 사라지고, X 버튼으로 수동 닫기도 가능해야 해.'
    },
    // Debug
    {
        id: 13, category: 'debug', title: 'Cannot read properties of undefined',
        description: '가장 흔한 JS 에러 해결법',
        prompt: '다음 에러를 해결해줘: "Cannot read properties of undefined". 에러 원인을 설명하고, 옵셔널 체이닝(?.), nullish 병합 연산자(??), 조건부 렌더링을 활용한 3가지 해결법을 보여줘.'
    },
    {
        id: 14, category: 'debug', title: 'CORS 에러 해결',
        description: '프론트엔드 CORS 에러 처리',
        prompt: 'CORS 에러가 발생하고 있어. "Access-Control-Allow-Origin" 에러 원인을 설명하고, 개발 환경에서의 프록시 설정과 프로덕션 서버 설정 방법을 알려줘.'
    },
    {
        id: 15, category: 'debug', title: 'React useEffect 무한 루프',
        description: 'useEffect 의존성 배열 문제',
        prompt: 'useEffect가 무한 루프를 발생시키고 있어. 의존성 배열 설정 방법, 객체/함수를 의존성으로 사용할 때의 문제, useCallback과 useMemo로 해결하는 방법을 알려줘.'
    },
    {
        id: 16, category: 'debug', title: '콘솔 에러 분석',
        description: 'Chrome DevTools 활용 디버깅',
        prompt: '이 에러 메시지를 분석해줘: [에러 메시지]. 발생 원인, 스택 트레이스 읽는 법, 수정 방법을 단계별로 설명해줘. Chrome DevTools에서 어떻게 디버깅할 수 있는지도 알려줘.'
    },
    {
        id: 17, category: 'debug', title: '빌드 에러 해결',
        description: 'npm run build 실패 해결',
        prompt: 'npm run build에서 에러가 발생하고 있어: [에러 내용]. 원인 분석과 해결 방법을 알려줘. 비슷한 에러가 재발하지 않도록 예방법도 설명해줘.'
    },
    {
        id: 18, category: 'debug', title: 'map is not a function',
        description: '배열 메서드 에러 해결',
        prompt: '"TypeError: .map is not a function" 에러가 나고 있어. 왜 이런 에러가 발생하는지, 데이터가 배열인지 확인하는 방법, 안전하게 map을 사용하는 패턴을 알려줘.'
    },
    // Deploy
    {
        id: 19, category: 'deploy', title: 'Vercel 무료 배포',
        description: 'GitHub 연동 Vercel 배포 가이드',
        prompt: 'React 앱을 Vercel에 배포하는 방법을 단계별로 알려줘. GitHub 연동, 환경 변수 설정, 커스텀 도메인 연결, 자동 배포 설정 방법을 포함해줘.'
    },
    {
        id: 20, category: 'deploy', title: 'GitHub Actions CI/CD',
        description: '자동 테스트 및 배포 워크플로우',
        prompt: 'GitHub Actions로 CI/CD 파이프라인을 만들어줘. push 시 자동으로 테스트 실행, 빌드, Vercel 배포까지 진행되어야 해. 환경 변수는 GitHub Secrets로 관리해줘.'
    },
    {
        id: 21, category: 'deploy', title: '환경 변수 설정',
        description: '.env 파일과 배포 환경 변수',
        prompt: 'React 앱에서 환경 변수를 설정하는 방법을 알려줘. .env, .env.local, .env.production 파일 차이, VITE_ 접두사 사용법, 보안을 위해 API 키를 숨기는 방법을 설명해줘.'
    },
    {
        id: 22, category: 'deploy', title: 'Docker 컨테이너화',
        description: 'React 앱 Docker 이미지 생성',
        prompt: 'React 앱을 Docker로 컨테이너화해줘. 멀티 스테이지 빌드를 사용하고, Nginx로 정적 파일을 서빙해줘. docker-compose.yml도 함께 만들어줘.'
    },
    {
        id: 23, category: 'deploy', title: '배포 후 404 에러',
        description: 'SPA 라우팅 404 에러 해결',
        prompt: 'Vercel/Netlify에 React Router 앱을 배포했는데 새로고침 시 404 에러가 나고 있어. 원인과 해결 방법(vercel.json, _redirects 파일 설정)을 알려줘.'
    },
    // Database
    {
        id: 24, category: 'database', title: 'Supabase 시작하기',
        description: 'Supabase 무료 DB + Auth 설정',
        prompt: 'Supabase를 React 앱에 연결하는 방법을 알려줘. 프로젝트 생성, @supabase/supabase-js 설치, 환경 변수 설정, 간단한 CRUD 예제 코드를 작성해줘.'
    },
    {
        id: 25, category: 'database', title: 'Supabase 인증 구현',
        description: '이메일/소셜 로그인 구현',
        prompt: 'Supabase Auth로 이메일/비밀번호 로그인과 Google OAuth를 구현해줘. 로그인 상태를 전역 Context로 관리하고, 보호된 라우트를 구현해줘.'
    },
    {
        id: 26, category: 'database', title: '실시간 데이터 구독',
        description: 'Supabase Realtime 구독',
        prompt: 'Supabase Realtime을 사용해서 데이터 변경 사항을 실시간으로 반영해줘. INSERT, UPDATE, DELETE 이벤트를 구독하고, React state에 자동으로 업데이트되도록 만들어줘.'
    },
    {
        id: 27, category: 'database', title: 'Firebase Firestore CRUD',
        description: 'Firebase 데이터 읽기/쓰기',
        prompt: 'Firebase Firestore로 기본 CRUD를 구현해줘. 문서 추가, 조회, 수정, 삭제 함수를 만들고, 실시간 구독으로 UI가 자동 업데이트되도록 해줘.'
    },
    {
        id: 28, category: 'database', title: 'localStorage 상태 관리',
        description: 'localStorage로 데이터 영속화',
        prompt: 'React에서 localStorage를 사용해서 상태를 영속화하는 커스텀 훅을 만들어줘. JSON 직렬화, 에러 처리, 초기값 설정, 타입 안전성을 고려해서 구현해줘.'
    },
    {
        id: 29, category: 'database', title: 'API 데이터 페칭 훅',
        description: 'fetch/axios 데이터 로딩 패턴',
        prompt: 'API에서 데이터를 가져오는 커스텀 훅 useFetch를 만들어줘. 로딩, 에러, 데이터 상태를 관리하고, 요청 취소(AbortController)도 구현해줘.'
    },
    {
        id: 30, category: 'database', title: '오프라인 지원 PWA',
        description: 'PWA 오프라인 데이터 처리',
        prompt: '오프라인 상태에서도 작동하는 앱을 만들어줘. navigator.onLine으로 연결 상태 감지, Service Worker로 캐싱, 온라인 복구 시 데이터 동기화를 구현해줘.'
    }
];

const PromptLibrary = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    const handleCopy = (id, prompt) => {
        try {
            navigator.clipboard.writeText(prompt).then(() => {
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
            }).catch(() => {
                const el = document.createElement('textarea');
                el.value = prompt;
                document.body.appendChild(el);
                el.select();
                document.execCommand('copy');
                document.body.removeChild(el);
                setCopiedId(id);
                setTimeout(() => setCopiedId(null), 2000);
            });
        } catch {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const filtered = PROMPTS.filter(p => {
        const matchCat = activeCategory === 'all' || p.category === activeCategory;
        const matchSearch = !searchTerm ||
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', paddingBottom: '100px', color: '#fff' }}>
            {/* 헤더 */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{
                    fontSize: '2.4rem', fontWeight: '900',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: '12px'
                }}>
                    📋 프롬프트 라이브러리
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                    바로 복사해서 쓰는 바이브코딩 프롬프트 모음 — {PROMPTS.length}개
                </p>
            </motion.div>

            {/* 검색 */}
            <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                    type="text"
                    placeholder="프롬프트 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '14px 14px 14px 48px',
                        background: 'rgba(30, 41, 59, 0.6)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '14px',
                        color: '#e2e8f0',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
            </div>

            {/* 카테고리 필터 */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '32px', flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
                        padding: '8px 18px',
                        background: activeCategory === cat.id ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.5)',
                        border: activeCategory === cat.id ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '20px',
                        color: activeCategory === cat.id ? '#a5b4fc' : '#94a3b8',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: activeCategory === cat.id ? 'bold' : 'normal',
                        transition: 'all 0.2s'
                    }}>
                        {cat.emoji} {cat.label}
                    </button>
                ))}
            </div>

            {/* 프롬프트 카드 그리드 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {filtered.length === 0 ? (
                    <div style={{ color: '#64748b', textAlign: 'center', gridColumn: '1/-1', padding: '60px', fontSize: '1rem' }}>
                        검색 결과가 없습니다.
                    </div>
                ) : filtered.map((p, idx) => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        style={{
                            background: 'rgba(30, 41, 59, 0.6)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '18px',
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                            <div>
                                <div style={{ fontWeight: '800', fontSize: '1rem', color: '#f1f5f9', marginBottom: '4px' }}>{p.title}</div>
                                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{p.description}</div>
                            </div>
                            <span style={{
                                flexShrink: 0,
                                fontSize: '0.7rem', fontWeight: 'bold',
                                padding: '3px 10px', borderRadius: '8px',
                                background: 'rgba(99,102,241,0.15)',
                                color: '#a5b4fc',
                                border: '1px solid rgba(99,102,241,0.25)'
                            }}>
                                {CATEGORIES.find(c => c.id === p.category)?.emoji} {CATEGORIES.find(c => c.id === p.category)?.label}
                            </span>
                        </div>
                        <div style={{
                            padding: '12px',
                            background: 'rgba(15, 23, 42, 0.5)',
                            borderRadius: '10px',
                            fontSize: '0.82rem',
                            color: '#94a3b8',
                            lineHeight: '1.6',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.04)',
                            fontFamily: 'monospace'
                        }}>
                            {p.prompt}
                        </div>
                        <button
                            onClick={() => handleCopy(p.id, p.prompt)}
                            style={{
                                padding: '10px',
                                background: copiedId === p.id ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.15)',
                                border: copiedId === p.id ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(99,102,241,0.3)',
                                borderRadius: '10px',
                                color: copiedId === p.id ? '#34d399' : '#a5b4fc',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: '0.88rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {copiedId === p.id
                                ? <><CheckCircle2 size={16} /> 복사 완료!</>
                                : <><Copy size={16} /> 프롬프트 복사</>
                            }
                        </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default PromptLibrary;
