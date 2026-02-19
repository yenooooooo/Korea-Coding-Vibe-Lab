# API 키 발급 가이드

`.env` 파일 설정을 위한 Toss Payments 및 Agora API 키 발급 방법을 안내합니다.

---

## 1. Toss Payments (토스 페이먼츠) 클라이언트 키 발급

결제 기능을 테스트하기 위해 **Client Key**가 필요합니다.

1.  **[토스페이먼츠 개발자센터](https://developers.tosspayments.com)**에 접속합니다.
2.  로그인 후, 우측 상단의 **[내 개발정보]** (또는 대시보드 -> API 키) 메뉴로 이동합니다.
3.  **API 키** 섹션에서 **클라이언트 키**를 확인합니다.
    *   **테스트용:** `pk_test_`로 시작하는 키를 복사합니다. (개발 및 테스트 단계에서 사용)
    *   **실제 운영용:** `pk_live_`로 시작하는 키 (실제 결제 시 사용, 계약 필요)
4.  복사한 키를 `.env` 파일의 `VITE_TOSS_CLIENT_KEY` 값으로 입력합니다.

---

## 2. Agora (아고라) SDK 키 발급

화상 채팅 및 실시간 통신 기능을 위해 **App ID**와 **App Certificate**가 필요합니다.

1.  **[Agora Console](https://console.agora.io)**에 접속하여 로그인(또는 회원가입)합니다.
2.  좌측 메뉴에서 **Project Management**를 클릭합니다.
3.  **[Create]** 버튼을 클릭하여 새 프로젝트를 생성합니다.
    *   **Project Name:** 프로젝트 이름 입력 (예: `VibeLab`)
    *   **Use Case:** `Social` 또는 `Education` 등 적절한 항목 선택
    *   **Authentication Mechanism:** **Secured mode (App ID + Token)** 선택 권장
        *   *(보안을 위해 토큰 방식을 사용하는 것이 안전합니다. `App ID only`는 테스트는 편하지만 보안에 취약할 수 있습니다.)*
4.  프로젝트가 생성되면 목록에서 해당 프로젝트를 찾습니다.
5.  **App ID** 밑에 있는 복사 아이콘을 클릭하여 복사합니다.
    *   `.env` 파일의 `VITE_AGORA_APP_ID` 값으로 입력합니다.
6.  **Action** 열의 **Config** (또는 수정 연필 아이콘)을 클릭하여 상세 설정으로 들어갑니다.
7.  **Security** 섹션이나 **App Certificate** 항목 옆의 **눈 모양 아이콘** 또는 **복사 버튼**을 클릭하여 값을 확인하고 복사합니다.
    *   `.env` 파일의 `AGORA_APP_CERTIFICATE` 값으로 입력합니다.

---

## 3. 적용 확인

`.env` 파일 작성이 완료되면 개발 서버를 재시작해야 변경된 환경 변수가 적용됩니다.

```bash
npm run dev
# 또는
vite
```
