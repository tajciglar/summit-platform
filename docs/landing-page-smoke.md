# Landing-page pipeline smoke test

Exercises the two-stage (Style Brief + image → code) generation end-to-end
against a live Laravel + Next.js stack.

## Pre-reqs

```
# Laravel
php artisan serve            # :8000

# Next.js
pnpm dev                     # :3000

# Queue worker (must pass explicit env — claude desktop pollutes ANTHROPIC_*)
ENABLE_RUNTIME_GEMINI_GEN=true \
INTERNAL_API_TOKEN=… \
GEMINI_API_KEY=… \
NEXT_APP_URL=http://localhost:3000 \
NEXT_APP_TOKEN=… \
php artisan queue:work --timeout=420
```

## Running the smoke

```
cd next-app
TEST_ADMIN_EMAIL=test@example.com \
TEST_ADMIN_PASSWORD=password \
STYLE_REF_URL=https://parenting-summits.com \
npx playwright test tests/e2e/landing-page-flow.spec.ts
```

## What it checks

1. Operator can log into `/admin`.
2. Saving `style_reference_url` on a summit + clicking **Build Style Brief**
   flips `summit.style_brief_status` to `ready` within 3 minutes.
3. Reference PNG shows up under `storage/app/public/style-briefs/{id}/reference.png`
   (visible in the editor view).

## Extending the smoke

Follow-up tests to add once the happy path is green:
- Generate landing pages → Preview → Publish
- Per-section regen with note → mockup PNG refreshes
- Section-selection checkbox grid → only checked types land in architect output
