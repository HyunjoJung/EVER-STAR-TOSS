# Apps in Toss Checklist

## App Metadata

- App name is fixed to `ever-star` in `granite.config.ts`.
- Display name is `EVER-STAR`.
- Scheme is `intoss`.
- Required deep links:
  - `intoss://ever-star`
  - `intoss://ever-star/quest-today`
  - `intoss://ever-star/letters`

## Visuals

- Primary logo is `assets/brand/ever-star-logo-600.png`.
- Logo is 600x600 PNG.
- Logo has a white background and no alpha channel.
- UI uses mostly white surfaces, gray text, and restrained `#ff9078`-family accents.
- Text-heavy screens avoid hero/marketing composition and keep actions close to the workflow.

## Sandbox QA

- `getAnonymousKey()` returns a hash in the Apps in Toss sandbox.
- Home route opens without login UI.
- Hardware/software back behavior works from all top-level screens.
- Network failures show retryable error states.
- Font scaling does not overlap titles, cards, buttons, or form fields.
- TDS components render in sandbox.
- Excluded features do not appear as routes, buttons, tabs, settings, or empty states.

## Notification QA

- In-app notifications can be listed and marked read.
- Push remains disabled while `TOSS_PUSH_ENABLED=false`.
- Actual Toss push must wait for console setup, mTLS certificate, approved template, and `x-toss-user-key`.
- Recommended copy length: title around 13 Korean characters, body around 20 Korean characters.

## Before Review

- Run `npm run verify`.
- Run `npm run build`.
- Confirm Supabase Edge Functions are deployed with service role and OpenAI secrets.
- Keep `OPENAI_IMAGE_ENABLED=false` until image model organization/usage requirements are ready.
