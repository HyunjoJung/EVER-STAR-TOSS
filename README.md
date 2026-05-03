# EVER-STAR Toss

앱인토스 비게임 미니앱 형태로 다시 만든 EVER-STAR v1입니다. 기존 `EVER-STAR` Spring Boot/CRA 코드는 참고용으로만 두고, 이 저장소는 React Native + Granite + 앱인토스 SDK 2.x + Supabase Edge Functions 기준으로 동작합니다.

## 결정 사항

- `appName`: `ever-star`
- 표시 이름: `EVER-STAR`
- 딥링크: `intoss://ever-star`, `intoss://ever-star/quest-today`, `intoss://ever-star/letters`
- 인증: 앱 시작 시 `getAnonymousKey()`의 `hash`를 Supabase `app_users.anonymous_hash`에 매핑
- 백엔드: 클라이언트 직접 DB 접근 없이 Supabase Edge Function만 호출
- 푸시: v1은 인앱 알림 완성, 토스 푸시는 `TOSS_PUSH_ENABLED=false`가 기본

## 포함 기능

- 반려동물 등록/선택
- 49일 퀘스트와 날짜 기반 일일 공개
- 편지 작성 및 AI 답장 작업 생성
- OpenAI 텍스트 답장, 이미지 생성 작업 처리
- 감정 요약/메모리얼북 조회 구조
- 인앱 알림과 향후 토스 푸시 큐

## 제외 기능

화상통화, 채팅, 커뮤니티, 외부 응원 메시지, 랜덤 탐험, FCM/SSE, PDF 저장은 v1 앱 표면과 라우트에서 제외했습니다.

## 실행

```bash
npm install
cp .env.example .env
npm run dev
```

기본값은 `EVERSTAR_USE_MOCKS=true`라 Supabase 없이 앱 화면을 확인할 수 있습니다. 실제 Supabase Edge Function을 쓰려면 `.env`에 `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `EVERSTAR_USE_MOCKS=false`를 설정합니다.

## 검증

```bash
npm run verify
npm run build
```

`verify`는 TypeScript, ESLint, Jest를 순서대로 실행합니다. `build`는 Granite 라우터를 재생성하고 iOS/Android 번들을 검사합니다.

## Supabase

초기 스키마와 49개 퀘스트 seed는 `supabase/migrations/20260503000000_initial_schema.sql`에 있습니다. Edge Function 비밀값은 앱 `.env`가 아니라 Supabase secrets에 넣습니다.

```bash
supabase db push
supabase functions deploy bootstrap-user
supabase functions deploy create-pet update-pet list-pets get-pet
supabase functions deploy get-today-quest submit-quest-answer send-letter
supabase functions deploy process-ai-jobs get-memorial-book dispatch-notifications
```

필수 secrets 예시는 `supabase/.env.example`을 봅니다. 이미지 생성은 운영/과금 확인 전 `OPENAI_IMAGE_ENABLED=false`로 둡니다.

## 문서

- `docs/architecture.md`: 앱/백엔드/AI/알림 구조
- `docs/app-in-toss-checklist.md`: 앱인토스 검수 전 체크리스트
- `docs/supabase-edge-functions.md`: Edge Function 계약과 운영 메모
