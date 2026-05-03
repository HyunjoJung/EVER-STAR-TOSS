# Supabase Edge Functions

## Environment

Use Supabase secrets, not app bundle env, for server-side keys.

```bash
supabase secrets set SUPABASE_URL=...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set OPENAI_API_KEY=...
supabase secrets set OPENAI_TEXT_MODEL=gpt-4.1-mini
supabase secrets set OPENAI_IMAGE_MODEL=gpt-image-1
supabase secrets set OPENAI_IMAGE_ENABLED=false
supabase secrets set TOSS_PUSH_ENABLED=false
```

## Function Contracts

All app-facing functions are POST-only and accept `anonymousHash`.

- `bootstrap-user`: creates or returns the Apps in Toss anonymous user.
- `create-pet`: creates a pet, personalities, memorial book, sentiment summary, and system notification.
- `update-pet`: updates owned pet fields and personalities.
- `list-pets`: returns only the caller's pets.
- `get-pet`: returns one owned pet.
- `get-today-quest`: calculates the current quest from `quest_started_at`.
- `submit-quest-answer`: upserts today's answer and creates pending AI work.
- `send-letter`: creates/lists/gets letters and creates pending AI work.
- `process-ai-jobs`: processes pending `ai_answers`.
- `get-memorial-book`: returns pet, quests, answers, letters, diaries, and summary data.
- `dispatch-notifications`: lists, marks read, and later dispatches queued push jobs.

## Security Model

Row-level security is enabled on all app tables. The client uses the anon key only to invoke Edge Functions. Edge Functions use the service role key and must call `requireAppUser` plus `requireOwnedPet` before touching user-owned rows.

Do not add direct client table reads unless matching RLS policies and automated tests exist.

## Cron

Recommended Supabase Cron jobs:

```sql
select cron.schedule(
  'ever-star-process-ai-jobs',
  '* * * * *',
  $$select net.http_post(url := 'https://PROJECT_REF.functions.supabase.co/process-ai-jobs', headers := '{"Authorization":"Bearer SERVICE_ROLE_KEY"}'::jsonb);$$
);

select cron.schedule(
  'ever-star-dispatch-notifications',
  '*/5 * * * *',
  $$select net.http_post(url := 'https://PROJECT_REF.functions.supabase.co/dispatch-notifications', body := '{"action":"dispatch"}'::jsonb, headers := '{"Authorization":"Bearer SERVICE_ROLE_KEY"}'::jsonb);$$
);
```

Replace `PROJECT_REF` and secret handling before using this in production. Do not paste a raw service role key into migration files.
