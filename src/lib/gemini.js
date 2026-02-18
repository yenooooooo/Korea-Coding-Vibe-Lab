
// ⚠️ Google Gemini API Key 설정
// 1. https://aistudio.google.com/app/apikey 에서 키를 발급받으세요.
// 2. 아래 'YOUR_API_KEY_HERE' 부분을 발급받은 키로 교체하세요. (따옴표는 유지)
// 3. 주의: 이 파일은 브라우저에 노출되므로, 실제 서비스 런칭 시에는 Edge Function으로 옮겨야 합니다.
const GEMINI_API_KEY = 'AIzaSyA_i3AFH4YWEJdwHSU5Wl5X0tJWXGEbV-E';

export const generateQuest = async (topic) => {
    if (GEMINI_API_KEY === 'PASTE_YOUR_KEY_HERE' || !GEMINI_API_KEY) {
        throw new Error("API 키가 설정되지 않았습니다. src/lib/gemini.js 파일을 확인해주세요.");
    }

    const prompt = `
당신은 최고의 코딩 멘토 'Vibe Master'입니다.
사용자가 입력한 주제: "${topic}"

이 주제를 바탕으로 초보 개발자를 위한 재미있는 코딩 퀘스트를 하나 만들어주세요.
응답은 반드시 아래 JSON 형식으로만 해주세요. 다른 말은 하지 마세요.

{
  "title": "퀘스트 제목 (흥미롭게)",
  "description": "퀘스트 설명 (친절하고 동기부여 되게)",
  "mission": "구체적인 수행 목표 (한 문장)",
  "difficulty": "난이도 (Easy / Normal / Hard)",
  "xp": "보상 경험치 (숫자만, 100~500 사이)",
  "tip": "도움이 될 만한 힌트"
}
    `;

    // 모델 후보군 (진단 도구에서 확인된 모델들)
    const models = [
        { name: 'gemini-2.0-flash', version: 'v1beta' },
        { name: 'gemini-flash-latest', version: 'v1beta' },
        { name: 'gemini-pro-latest', version: 'v1beta' },
        { name: 'gemini-2.5-flash', version: 'v1beta' } // 최신 모델
    ];

    let lastError = null;

    for (const model of models) {
        try {
            console.log(`Trying Gemini Model: ${model.name} (${model.version})...`);

            const response = await fetch(`https://generativelanguage.googleapis.com/${model.version}/models/${model.name}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData.error?.message || response.statusText;
                console.warn(`Model ${model.name} failed: ${errorMessage}`);

                // 404(Not Found)나 400(Invalid Argument - 모델명 관련)일 경우 다음 모델 시도
                if (response.status === 404 || response.status === 400) {
                    lastError = new Error(`Model ${model.name} error: ${errorMessage}`);
                    continue;
                }

                // 그 외 오류(인증, 서버 오류 등)는 즉시 throw
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error("No candidates returned from Gemini API");
            }

            const textResponse = data.candidates[0].content.parts[0].text;

            // JSON 파싱 (혹시 모를 마크다운 코드블럭 제거)
            const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);

        } catch (error) {
            console.error(`Gemini Attempt Error (${model.name}):`, error);
            lastError = error;
            // 계속해서 다음 모델 시도
        }
    }

    // 모든 모델 실패 시
    throw lastError || new Error("모든 AI 모델 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
};

/**
 * Vibe Sandbox 전용: 프롬프트를 바탕으로 React 컴포넌트 코드 생성
 */
export const generateVibeComponent = async (promptText) => {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_API_KEY')) {
        throw new Error("API 키가 설정되지 않았습니다.");
    }

    const systemPrompt = `
당신은 세계 최고의 '바이브 코더(Vibe Coder)'입니다. 
사용자의 요청에 따라 매우 힙하고, 현대적이며, 시각적으로 뛰어난 React 컴포넌트를 하나 작성해야 합니다.

[규칙]
1. 반드시 단 하나의 함수형 컴포넌트만 반환하세요. (컴포넌트 이름은 상관없음)
2. 스타일은 반드시 인라인 CSS (style={{...}}) 또는 Tailwind CSS 클래스를 사용하세요.
3. Lucide-React 아이콘을 마음껏 사용하세요. (아이콘은 이미 'lucide-react'에서 import 가능하다고 가정)
4. 외부 라이브러리(Framer Motion 등)는 사용하지 마세요. 순수 React와 CSS만 사용합니다.
5. 응답 본문에는 마크다운 없이 '코드'만 적으세요. 다른 설명은 일절 금지합니다.
6. 컴포넌트는 즉시 실행 가능한 형태여야 합니다.

[사용자 요청]
"${promptText}"
    `;

    const models = [
        { name: 'gemini-2.0-flash', version: 'v1beta' },
        { name: 'gemini-1.5-flash', version: 'v1beta' }
    ];

    let lastError = null;

    for (const model of models) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/${model.version}/models/${model.name}:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: systemPrompt }] }]
                })
            });

            if (!response.ok) continue;

            const data = await response.json();
            const textResponse = data.candidates[0].content.parts[0].text;

            // 마크다운 코드 블럭 제거
            // 마크다운 코드 블럭 제거 (더 강력한 버전)
            let cleanCode = textResponse.trim();
            if (cleanCode.includes('```')) {
                const match = cleanCode.match(/```(?:[a-z]*)\n?([\s\S]*?)\n?```/i);
                if (match) {
                    cleanCode = match[1].trim();
                } else {
                    cleanCode = cleanCode.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/i, '').trim();
                }
            }
            return cleanCode;

        } catch (error) {
            lastError = error;
        }
    }

    throw lastError || new Error("AI 컴포넌트 생성에 실패했습니다.");
};
