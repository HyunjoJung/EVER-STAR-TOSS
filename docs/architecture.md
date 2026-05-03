# Architecture

## App

The app is a Granite React Native app registered with Apps in Toss through `AppsInToss.registerApp`. The root provider stack is:

- `TDSProvider`: Toss Design System React Native components and font scaling
- `QueryClientProvider`: server-state cache and mutation invalidation
- `AppSessionProvider`: anonymous Apps in Toss identity, Supabase bootstrap, selected pet

Main screens:

- `/`
- `/onboarding`
- `/pets`
- `/pet-create`
- `/letters`
- `/letter-detail`
- `/quest-today`
- `/memorial-book`
- `/settings`
- `/notifications`

The v1 route set intentionally has no video, chat, community, cheering, random exploration, FCM/SSE, or PDF entry point.

## Identity

The app does not expose email or social login UI. On launch, `src/lib/tossIdentity.ts` calls `getAnonymousKey()` and uses the returned `hash` as the anonymous identity. `bootstrap-user` stores or returns the matching `app_users` row.

The schema keeps `identity_provider`, `anonymous_hash`, and nullable `toss_user_key` so Toss Login or push-enabled `userKey` can be added later without rewriting pet, quest, letter, or notification ownership.

## Data Access

The React Native app never writes directly to Supabase tables. `src/lib/api.ts` invokes Edge Functions when Supabase env is configured. When `EVERSTAR_USE_MOCKS=true`, the same API surface uses an in-memory mock store for local UI work.

Every user-scoped function receives `anonymousHash`, resolves `app_users`, and checks ownership before reading or writing pet, quest, letter, memorial book, or notification rows.

## AI

AI work is modeled through `ai_answers`.

- `submit-quest-answer` creates `quest_text_reply` or `image_generation` jobs.
- `send-letter` creates `letter_text_reply` jobs.
- `process-ai-jobs` processes pending rows server-side with OpenAI.
- Failures are written to `ai_answers.status = failed` with `error`.

Text uses the Responses API. Image generation uses the Images API only when `OPENAI_IMAGE_ENABLED=true`; otherwise image jobs fail fast and can be retried after the flag is enabled.

## Notifications

The v1 product experience is in-app notifications. `notifications` stores user-visible items, and `notification_jobs` keeps a queue-shaped record for future Toss push delivery.

`dispatch-notifications` lists and marks in-app notifications. Its dispatch path skips push work while `TOSS_PUSH_ENABLED=false` or when no `toss_user_key` exists. If Supabase Edge Functions cannot handle Toss mTLS later, a minimal Rust `toss-push-proxy` should consume only `notification_jobs`.
