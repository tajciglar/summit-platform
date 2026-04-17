# Landing Page Template Generator — Phase 1.5 Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Take the MVP from "works in dev for a single operator with 2 templates" to "shippable to production with the full 8-template library and per-section editability."

**Architecture:** Extends the Phase 1 pipeline (templates-as-whole; AI fills Zod schemas; operator picks from a card grid). Same registry + manifest contract. No architectural change — only additions: 6 more templates, an edit page that auto-generates its form from the draft's schema, and production-readiness fixes.

**Tech Stack:** Same as Phase 1 — Laravel 13, PHP 8.3, Filament v4, Pest 4, `opis/json-schema`, Next.js 16.2, React 19.2, Zod v4, Vitest, Tailwind v4.

**Scope (Phase 1.5):**
- Theme A: 4 production-readiness fixes (tenancy in tests, batch completion tracking, publish lock, prompt hints + drift detection).
- Theme B: 7 template conversions (opus-v3, opus-v4, variant-1/2/3, adhd-summit, real thumbnails).
- Theme C: 4 edit-mode tasks (Zod→Filament mapper, edit page, wiring, speaker picker).
- Theme D: 1 cleanup task (deprecate V1 pipeline code).

**Out of scope (Phase 2):**
- AI copy regeneration (hook points already exist in schema; no AI integration yet).
- Cross-template section swap in edit mode.
- Sales/checkout/thankyou page generators.
- Visual regression automation (Chromatic/Percy).
- Template A/B conversion analytics.

**Spec:** `docs/superpowers/specs/2026-04-17-landing-page-template-generator-design.md` (commit `6507dfa`, with Phase 1 revision `e1e35c2`).
**Phase 1 plan:** `docs/superpowers/plans/2026-04-17-landing-page-template-generator.md` (commits `758ddcc`..`e863a50`).

---

## Prerequisites

Before starting, confirm:

- Phase 1 is merged and green in dev (`e863a50` at tip of `experiment/framer-variants-2026-04-17` or equivalent).
- The parallel session that enabled admin tenancy (`AdminPanelProvider->tenant(Summit::class, ...)` at line 44) has committed and is not still in flight — Phase 1.5 Task A1 depends on this being stable.
- `ANTHROPIC_API_KEY` in `.env`.
- `pnpm build:templates` runs cleanly (prerequisite for Theme B template additions).

---

## File Map

### New files

| Path | Responsibility |
|---|---|
| `app/Services/Templates/FilamentSchemaMapper.php` | Converts a Zod JSON Schema to a Filament v4 Schema component tree |
| `app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php` | Filament edit page for a draft |
| `resources/views/filament/pages/edit-landing-page-draft.blade.php` | Blade view |
| `next-app/src/templates/opus-v3.schema.ts` + fixture + test + `OpusV3.tsx` + styles | Template #3 |
| `next-app/src/templates/opus-v4.schema.ts` + fixture + test + `OpusV4.tsx` + styles | Template #4 |
| `next-app/src/templates/variant-1.schema.ts` + fixture + test + `Variant1.tsx` + styles | Template #5 |
| `next-app/src/templates/variant-2.schema.ts` + fixture + test + `Variant2.tsx` + styles | Template #6 |
| `next-app/src/templates/variant-3.schema.ts` + fixture + test + `Variant3.tsx` + styles | Template #7 |
| `next-app/src/templates/adhd-summit.schema.ts` + fixture + test + `AdhdSummit.tsx` + styles | Template #8 |
| `next-app/scripts/capture-template-thumbnails.ts` | Playwright script that screenshots each template and writes to `public/template-thumbs/*.jpg` |
| `tests/Unit/Services/Templates/FilamentSchemaMapperTest.php` | Mapper tests |
| `tests/Unit/Services/Templates/ManifestIntegrityTest.php` | Drift check PHP↔Next.js |
| `tests/Feature/Filament/EditLandingPageDraftPageTest.php` | Edit page tests |

### Modified files

| Path | What changes |
|---|---|
| `app/Jobs/GenerateLandingPageVersionJob.php` | Write `batch.status='completed'` + `completed_at` when last version is done |
| `app/Services/Templates/PublishDraftService.php` | `lockForUpdate()` on the step before snapshot |
| `app/Services/Templates/TemplateFiller.php` | Comment explaining title→name mapping in user prompt |
| `app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php` | Edit action linking to edit page; batch completion display |
| `app/Filament/Resources/Funnels/FunnelResource.php` | Register edit page |
| `tests/Feature/Filament/*.php` | All passing the tenant param |
| `next-app/src/templates/registry.ts` | Register all 6 new templates |
| (deprecated) `next-app/src/lib/api-client.ts`, `next-app/src/lib/skeletons/`, `next-app/src/runtime/` (partial) | Remove unused V1 pipeline code |

### Generated / regenerated

- `next-app/public/template-manifest.json` — regenerates when new templates are added
- `next-app/public/template-thumbs/*.jpg` — 8 real thumbnails (via Playwright capture)

---

## Task Order

```
A1 → A2 → A3 → A4      (production-readiness — do first; unblocks everything else)
  ↓
B1,B2,B3,B4,B5,B6 (parallelizable)  → B7 (thumbnails after all templates)
  ↓
C1 → C2 → C3 → C4      (edit mode — needs all templates to validate mapper)
  ↓
D1                     (cleanup)
```

**Themes B and C can overlap.** Theme A must land first because A1 (tenancy fix) blocks all Filament tests.

One commit per task.

---

## Theme A — Production readiness

### Task A1: Fix tenancy in Filament tests

All 10 Filament tests in `tests/Feature/Filament/` fail with `Missing parameter: tenant` because the admin panel enabled multi-tenancy on `Summit`. Each Livewire invocation needs a tenant context.

**Files:**
- Modify: `tests/Feature/Filament/GenerateLandingPagesPageTest.php`
- Modify: `tests/Feature/Filament/LandingPageDraftsPageTest.php`

**Diagnostic first:**

- [ ] **Step 1: Read `AdminPanelProvider.php` to confirm the tenant model + slug attribute**

Run: `grep -A 1 "->tenant" app/Providers/Filament/AdminPanelProvider.php`

Expected: `->tenant(Summit::class, slugAttribute: 'slug')` — note the attribute name.

- [ ] **Step 2: Verify the Summit model has `slug`**

Run: `php artisan tinker --execute="echo in_array('slug', (new \App\Models\Summit)->getFillable()) ? 'OK' : 'MISSING';"`

If MISSING: the parallel session may not have added `slug` to the Summit fillable. Check `database/migrations/2026_04_17_100001_create_summits_tables.php` for a `slug` column. If no column, ESCALATE — tenancy can't work without a slug source. Otherwise, add `slug` to Summit's `$fillable`.

- [ ] **Step 3: Update each Filament test to pass tenant**

The livewire invocation pattern changes from:

```php
livewire(GenerateLandingPagesPage::class, ['record' => $funnel->id])
```

to:

```php
$this->get(route('filament.admin.tenant', ['tenant' => $summit->slug]));   // activates tenancy for this request cycle
livewire(GenerateLandingPagesPage::class, ['tenant' => $summit->slug, 'record' => $funnel->id])
```

The simpler universal fix: add a helper in `beforeEach` that sets the current tenant:

```php
use Filament\Facades\Filament;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->summit = Summit::factory()->create(['slug' => 'test-summit']);
    Filament::setTenant($this->summit);
});
```

Then all tests use `$this->summit` instead of creating new summits. Update the test bodies accordingly. When `Funnel::factory()->for($summit)` is called, use `$this->summit`.

Do this pattern in both test files.

- [ ] **Step 4: Run affected tests — expect green**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
./vendor/bin/pest tests/Feature/Filament/
```

Expect: all tests pass (7 in GenerateLandingPagesPageTest + 6 in LandingPageDraftsPageTest = 13 total after additions).

- [ ] **Step 5: Commit**

```
git add tests/Feature/Filament/
git commit -m "test(filament): pass tenant param after admin panel enabled multi-tenancy"
```

---

### Task A2: Batch completion tracking

Currently `LandingPageBatch.status` transitions `queued` → `running` → (never `completed`). The integration review flagged this as a data-hygiene bug. Version jobs should update the batch when the last draft settles.

**Files:**
- Modify: `app/Jobs/GenerateLandingPageVersionJob.php`
- Modify: `tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php`

- [ ] **Step 1: Write the failing test**

Add to `tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php`:

```php
it('marks batch as completed when last draft reaches a terminal status', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 2,
        'status' => 'running',
    ]);

    $this->mock(\App\Services\Templates\TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andReturn([
            'content' => ['summit' => ['name' => 'X'], 'hero' => ['headline' => 'H']],
            'tokens' => 100,
        ]);
    });

    // First version — batch stays 'running'
    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);
    expect($batch->fresh()->status)->toBe('running');
    expect($batch->fresh()->completed_at)->toBeNull();

    // Second version — batch completes
    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v2', 2);
    $batch->refresh();
    expect($batch->status)->toBe('completed');
    expect($batch->completed_at)->not->toBeNull();
});
```

Run and confirm failure: `./vendor/bin/pest tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php`

- [ ] **Step 2: Implement completion check**

At the end of `handle()` in `app/Jobs/GenerateLandingPageVersionJob.php`, after the try/catch, add:

```php
// After success or failure, check if the batch is done
$totalDrafts = $batch->drafts()->count();
$terminalCount = $batch->drafts()
    ->whereIn('status', ['ready', 'failed'])
    ->count();

if ($totalDrafts >= $batch->version_count && $terminalCount >= $totalDrafts) {
    $batch->fresh()->update([
        'status' => 'completed',
        'completed_at' => now(),
    ]);
}
```

Note: `$batch->fresh()` reloads because this job's copy may be stale after the draft update we just did.

- [ ] **Step 3: Run — expect pass**

```
./vendor/bin/pest tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php
```

Expect: 3 tests pass (2 original + 1 new).

- [ ] **Step 4: Commit**

```
git add app/Jobs/GenerateLandingPageVersionJob.php tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php
git commit -m "feat(jobs): mark batch completed when last version job finishes"
```

---

### Task A3: Lock FunnelStep during publish

Concurrent publishes can race: both operators snapshot the same prior content, both write, last-writer wins silently. Add a pessimistic lock.

**Files:**
- Modify: `app/Services/Templates/PublishDraftService.php`
- Modify: `tests/Feature/Services/PublishDraftServiceTest.php`

- [ ] **Step 1: Add the lock**

In `PublishDraftService::publish()`, change the step lookup inside the transaction:

```php
// Before
$step = FunnelStep::where('funnel_id', $batch->funnel_id)
    ->where('step_type', 'optin')
    ->firstOrFail();

// After
$step = FunnelStep::where('funnel_id', $batch->funnel_id)
    ->where('step_type', 'optin')
    ->lockForUpdate()
    ->firstOrFail();
```

`lockForUpdate()` holds a row-level lock until the transaction commits. A second `publish()` call waits; when it runs, it reads the freshly-updated `page_content` (including our first publish's write) and snapshots that.

- [ ] **Step 2: Add a test for lock behavior**

Note: true concurrency testing is fragile. A simpler test: verify the query builder includes a `FOR UPDATE` clause. In `tests/Feature/Services/PublishDraftServiceTest.php`, add:

```php
it('emits FOR UPDATE on the step lookup', function () {
    \Illuminate\Support\Facades\DB::enableQueryLog();

    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => [],
    ]);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1, 'template_key' => 'opus-v1',
        'sections' => ['x' => 1], 'status' => 'ready', 'preview_token' => 't',
    ]);

    app(PublishDraftService::class)->publish($draft, User::factory()->create());

    $queries = \Illuminate\Support\Facades\DB::getQueryLog();
    $stepSelect = collect($queries)->first(fn ($q) =>
        str_contains($q['query'], 'funnel_steps') && str_contains($q['query'], 'optin')
    );
    expect($stepSelect)->not->toBeNull();
    expect($stepSelect['query'])->toContain('for update');
});
```

- [ ] **Step 3: Run — expect pass**

```
./vendor/bin/pest tests/Feature/Services/PublishDraftServiceTest.php
```

Expect: 4 tests pass (3 original + 1 new).

- [ ] **Step 4: Commit**

```
git add app/Services/Templates/PublishDraftService.php tests/Feature/Services/PublishDraftServiceTest.php
git commit -m "fix(publish): lockForUpdate on funnel step to prevent concurrent-publish races"
```

---

### Task A4: Prompt mapping hint + manifest drift test

Two small production-readiness fixes bundled — each is ~5 lines:

**1. Summit title → schema name mapping hint in prompt.**

**2. A PHP test that fails if `template-manifest.json` doesn't cover every key declared in `registry.ts`.**

**Files:**
- Modify: `app/Services/Templates/TemplateFiller.php`
- Create: `tests/Unit/Services/Templates/ManifestIntegrityTest.php`

- [ ] **Step 1: Add prompt mapping hint**

In `TemplateFiller::buildUserPrompt()`, update the user-prompt text:

```php
return <<<PROMPT
Summit: {$summitName}

The schema uses "summit.name" — populate it with this summit's title, NOT a new name.

Speakers (use only these IDs):
{$speakersJson}
{$notesBlock}{$styleBlock}

Fill the template slots for this summit.
PROMPT;
```

The explicit hint prevents the LLM from producing `summit.title` (matching our internal field) when the schema expects `summit.name`.

- [ ] **Step 2: Write the drift test**

Create `tests/Unit/Services/Templates/ManifestIntegrityTest.php`:

```php
<?php

it('template manifest covers every key from next-app registry', function () {
    $registryFile = base_path('next-app/src/templates/registry.ts');
    $manifestFile = base_path('next-app/public/template-manifest.json');

    expect(is_file($registryFile))->toBeTrue();
    expect(is_file($manifestFile))->toBeTrue();

    // Extract 'key' values from the registry TS source.
    // Pattern: "'opus-v1'" inside the templates object. Simple regex — not a full TS parser.
    $registrySource = file_get_contents($registryFile);
    preg_match_all("/key:\s*'([a-z0-9-]+)'/", $registrySource, $matches);
    $registryKeys = array_unique($matches[1]);

    sort($registryKeys);

    $manifest = json_decode(file_get_contents($manifestFile), true);
    $manifestKeys = collect($manifest['templates'] ?? [])->pluck('key')->sort()->values()->all();

    expect($manifestKeys)->toEqualCanonicalizing($registryKeys);
});
```

- [ ] **Step 3: Run — expect pass (assuming manifest is fresh)**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform/next-app && pnpm build:templates
cd /Users/tajbrzovic/wcc-projects/summit-platform && ./vendor/bin/pest tests/Unit/Services/Templates/ManifestIntegrityTest.php
```

Expect: 1 test passes.

- [ ] **Step 4: Commit**

```
git add app/Services/Templates/TemplateFiller.php tests/Unit/Services/Templates/ManifestIntegrityTest.php
git commit -m "feat(templates): prompt mapping hint + manifest drift test"
```

---

## Theme B — Template library expansion

All 6 template tasks follow the same pattern — repeat the Phase 1 Task 5/6/7 cycle for each source HTML file. The reviewer's hard rules from Phase 1 apply to every new template:

1. No `<html>`/`<head>`/`<body>` (return a `<div>`).
2. Namespaced CSS tokens (`--color-<template>-*`, `--font-<template>-*`).
3. `.min(1)` on every visible string field.
4. `z.string().date()` for dates.
5. Valid v4 UUIDs in fixtures.
6. Section labels as schema slots, not hardcoded.
7. Null-safe speaker lookup.
8. No `'use client'` unless a sub-section needs it.
9. CSS classes namespaced per template.
10. `funnelId` in Props (for OptinModal, per Critical #2).
11. Render `<OptinModal funnelId={funnelId} />` at end of root `<div>`.

### Per-template tasks (B1–B6)

Each task has identical structure. Replace `{TEMPLATE_KEY}`, `{COMPONENT_NAME}`, `{SOURCE_HTML}` per the table below:

| Task | Template key | Component name | Source HTML |
|---|---|---|---|
| B1 | `opus-v3` | `OpusV3` | `next-app/public/opus-v3.html` |
| B2 | `opus-v4` | `OpusV4` | `next-app/public/opus-v4.html` |
| B3 | `variant-1` | `Variant1` | `next-app/public/variant-1.html` |
| B4 | `variant-2` | `Variant2` | `next-app/public/variant-2.html` |
| B5 | `variant-3` | `Variant3` | `next-app/public/variant-3.html` |
| B6 | `adhd-summit` | `AdhdSummit` | `next-app/public/adhd-summit.html` |

For each, follow these steps:

- [ ] **Step 1: Inventory the source HTML**

Read the source file. Count sections. Note: color palette, font families, any sections not in opus-v1/v2 (e.g. video testimonials, pricing tiers, bonus comparison table).

- [ ] **Step 2: Write the Zod schema**

Create `next-app/src/templates/{TEMPLATE_KEY}.schema.ts`. Follow the opus-v2 schema at `next-app/src/templates/opus-v2.schema.ts` as the most-polished reference. Canonical headline form (`headlineLead`/`headlineAccent?`/`headlineTrail?`). All visible strings `.min(1)`. Dates `.date()`. Speaker IDs `.uuid()`.

- [ ] **Step 3: Write the fixture**

Create `next-app/src/templates/__fixtures__/{TEMPLATE_KEY}.fixture.ts` typed as `{COMPONENT_NAME}Content`. Realistic copy — see the opus-v2 fixture for quality bar. UUIDs in v4 form (position-13 = `4`, position-17 = `8-b`). Footer hrefs should be anchors like `#schedule` or relative paths like `/privacy`, not raw `#`.

- [ ] **Step 4: Write schema tests**

Create `next-app/src/templates/{TEMPLATE_KEY}.schema.test.ts` with at least:
- accepts fixture
- rejects missing required top-level fields
- rejects `.min(1)` fields set to empty
- rejects malformed UUIDs in `speakersByDay[].speakerIds`
- rejects array size violations if schema sets `.min()`/`.max()`

Run: `cd next-app && pnpm test src/templates/{TEMPLATE_KEY}.schema.test.ts` — expect green.

- [ ] **Step 5: Write the React component**

Create `next-app/src/templates/{COMPONENT_NAME}.tsx`. Same signature as OpusV1: `{ content: {COMPONENT_NAME}Content; speakers: Record<string, Speaker>; funnelId: string }`. One sub-component per section. Speaker lookups null-safe. Imports and renders `<OptinModal funnelId={funnelId} ctaLabel={...} />` at the end of the root `<div>`.

- [ ] **Step 6: Port CSS**

Create `next-app/src/templates/{TEMPLATE_KEY}.styles.css`. Port the `<style>` block from the source HTML. Namespace every selector with `.{TEMPLATE_KEY}-root` or `.{TEMPLATE_KEY}-body` prefix.

Add to `next-app/src/app/globals.css`:
- `@import '../templates/{TEMPLATE_KEY}.styles.css';`
- Theme tokens in `@theme` block, all prefixed `--color-{TEMPLATE_KEY}-*` / `--font-{TEMPLATE_KEY}-*`.

- [ ] **Step 7: Register in the registry**

Add to `next-app/src/templates/registry.ts`:

```ts
'{TEMPLATE_KEY}': {
  key: '{TEMPLATE_KEY}',
  label: '…',           // describe aesthetic, not placeholder
  thumbnail: '/template-thumbs/{TEMPLATE_KEY}.jpg',
  schema: {COMPONENT_NAME}Schema,
  Component: {COMPONENT_NAME},
  tags: […] as const,   // pick from TemplateTag union in types.ts
},
```

Import the new component + schema at the top.

- [ ] **Step 8: Regenerate manifest**

```
cd next-app && pnpm build:templates
```

Verify the new key appears: `jq '.templates[].key' public/template-manifest.json`

- [ ] **Step 9: Add a temporary stub thumbnail**

Use the same 1×1 JPEG approach as Phase 1 Task 8 (Task B7 will generate real ones):

```
cp next-app/public/template-thumbs/opus-v1.jpg next-app/public/template-thumbs/{TEMPLATE_KEY}.jpg
```

- [ ] **Step 10: Run Next.js tests + build**

```
cd next-app
pnpm test src/templates/
pnpm typecheck 2>&1 | grep "{TEMPLATE_KEY}\|{COMPONENT_NAME}" && echo "ERRORS ABOVE" || echo "CLEAN"
pnpm build
```

- [ ] **Step 11: Run the Laravel manifest drift test**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform && ./vendor/bin/pest tests/Unit/Services/Templates/ManifestIntegrityTest.php
```

Expect green — Task A4's drift test should now detect the new key in both sources.

- [ ] **Step 12: Commit**

```
git add next-app/src/templates/{TEMPLATE_KEY}.schema.ts \
        next-app/src/templates/{TEMPLATE_KEY}.schema.test.ts \
        next-app/src/templates/__fixtures__/{TEMPLATE_KEY}.fixture.ts \
        next-app/src/templates/{COMPONENT_NAME}.tsx \
        next-app/src/templates/{TEMPLATE_KEY}.styles.css \
        next-app/src/templates/registry.ts \
        next-app/src/app/globals.css \
        next-app/public/template-manifest.json \
        next-app/public/template-thumbs/{TEMPLATE_KEY}.jpg
git commit -m "feat(templates): {COMPONENT_NAME} schema + component + registry entry"
```

---

### Task B7: Real thumbnails via Playwright

Replace all 8 stub thumbnails with real screenshots. Uses Playwright (already installed per Phase 1).

**Files:**
- Create: `next-app/scripts/capture-template-thumbnails.ts`
- Modify: `next-app/package.json` (add `thumbnails:capture` script)
- Replace: `next-app/public/template-thumbs/*.jpg` (8 files)

- [ ] **Step 1: Check Playwright is installed**

```
cd next-app && grep -E "\"@playwright/test\"|\"playwright\"" package.json
```

If missing: `pnpm add -D @playwright/test && pnpm exec playwright install chromium`

- [ ] **Step 2: Write the capture script**

Create `next-app/scripts/capture-template-thumbnails.ts`:

```ts
import { chromium } from 'playwright';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..');

// Each template has a matching HTML at public/{key}.html (source files the templates were ported from).
// Screenshot those directly — they render the intended look standalone.
const templates = [
  { key: 'opus-v1', source: 'opus-v1.html' },
  { key: 'opus-v2', source: 'opus-v2.html' },
  { key: 'opus-v3', source: 'opus-v3.html' },
  { key: 'opus-v4', source: 'opus-v4.html' },
  { key: 'variant-1', source: 'variant-1.html' },
  { key: 'variant-2', source: 'variant-2.html' },
  { key: 'variant-3', source: 'variant-3.html' },
  { key: 'adhd-summit', source: 'adhd-summit.html' },
];

async function main() {
  mkdirSync(resolve(REPO, 'public/template-thumbs'), { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  for (const t of templates) {
    const page = await context.newPage();
    await page.goto(`file://${resolve(REPO, 'public', t.source)}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: resolve(REPO, `public/template-thumbs/${t.key}.jpg`),
      clip: { x: 0, y: 0, width: 1440, height: 900 },
      quality: 80,
      type: 'jpeg',
    });
    console.log(`✓ ${t.key}.jpg`);
    await page.close();
  }

  await browser.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
```

- [ ] **Step 3: Add script entry**

In `next-app/package.json`, add to `scripts`:

```json
"thumbnails:capture": "tsx scripts/capture-template-thumbnails.ts"
```

- [ ] **Step 4: Run the capture**

```
cd next-app && pnpm thumbnails:capture
```

Expect: 8 `✓ <key>.jpg` lines, and the 8 JPG files replaced with real screenshots (~50-200 KB each, not 332 B).

Verify with `ls -la public/template-thumbs/`.

- [ ] **Step 5: Confirm registry integrity test still passes**

```
cd next-app && pnpm test src/templates/registry.test.ts
```

Expect: 9 tests pass (the thumbnail-exists check now reads real files).

- [ ] **Step 6: Commit**

```
git add next-app/scripts/capture-template-thumbnails.ts \
        next-app/package.json \
        next-app/public/template-thumbs/
git commit -m "feat(templates): capture real thumbnails via Playwright for all 8 templates"
```

---

## Theme C — Edit mode

### Task C1: Zod → Filament form mapper

Given a JSON Schema (exported from Zod), produce a Filament v4 Schema component tree. Used by the edit page to auto-render an edit form per template, without hand-coding a form per template.

**Files:**
- Create: `app/Services/Templates/FilamentSchemaMapper.php`
- Create: `tests/Unit/Services/Templates/FilamentSchemaMapperTest.php`

- [ ] **Step 1: Write the failing test**

Create `tests/Unit/Services/Templates/FilamentSchemaMapperTest.php`:

```php
<?php

use App\Services\Templates\FilamentSchemaMapper;
use Filament\Forms\Components\{Repeater, Select, TextInput, Textarea};

it('maps a plain object schema to TextInput components', function () {
    $schema = [
        'type' => 'object',
        'required' => ['name'],
        'properties' => [
            'name' => ['type' => 'string', 'minLength' => 1],
            'subtitle' => ['type' => 'string'],
        ],
    ];
    $components = (new FilamentSchemaMapper)->map($schema, 'data');
    expect($components)->toHaveCount(2);
    expect($components[0])->toBeInstanceOf(TextInput::class);
    expect($components[1])->toBeInstanceOf(TextInput::class);
});

it('uses Textarea for fields with maxLength > 200', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'body' => ['type' => 'string', 'maxLength' => 1000],
        ],
    ];
    $components = (new FilamentSchemaMapper)->map($schema, 'data');
    expect($components[0])->toBeInstanceOf(Textarea::class);
});

it('maps an array-of-objects schema to a Repeater', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'faqs' => [
                'type' => 'array',
                'minItems' => 3,
                'maxItems' => 10,
                'items' => [
                    'type' => 'object',
                    'properties' => [
                        'question' => ['type' => 'string', 'minLength' => 1],
                        'answer' => ['type' => 'string', 'minLength' => 1],
                    ],
                ],
            ],
        ],
    ];
    $components = (new FilamentSchemaMapper)->map($schema, 'data');
    expect($components[0])->toBeInstanceOf(Repeater::class);
});

it('nests object properties recursively', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'hero' => [
                'type' => 'object',
                'properties' => [
                    'headline' => ['type' => 'string', 'minLength' => 1],
                    'subheadline' => ['type' => 'string'],
                ],
            ],
        ],
    ];
    $components = (new FilamentSchemaMapper)->map($schema, 'data');
    // Nested object → Filament Fieldset + nested components
    expect($components)->toHaveCount(1);
});

it('maps enums to Select', function () {
    $schema = [
        'type' => 'object',
        'properties' => [
            'tone' => ['type' => 'string', 'enum' => ['serious', 'playful', 'urgent']],
        ],
    ];
    $components = (new FilamentSchemaMapper)->map($schema, 'data');
    expect($components[0])->toBeInstanceOf(Select::class);
});
```

Run — expect fail: `./vendor/bin/pest tests/Unit/Services/Templates/FilamentSchemaMapperTest.php`

- [ ] **Step 2: Implement the mapper**

Create `app/Services/Templates/FilamentSchemaMapper.php`:

```php
<?php

namespace App\Services\Templates;

use Filament\Forms\Components\{Component, Fieldset, Repeater, Select, TextInput, Textarea};
use Filament\Schemas\Schema;

class FilamentSchemaMapper
{
    /**
     * Map a JSON Schema (from Zod via zodToJsonSchema) to a list of Filament form components.
     *
     * @param  array $schema  The JSON Schema subtree.
     * @param  string $statePath  Dot-path prefix for nested fields.
     * @return array<int, Component>
     */
    public function map(array $schema, string $statePath): array
    {
        if (($schema['type'] ?? null) !== 'object' || empty($schema['properties'])) {
            return [];
        }

        $required = $schema['required'] ?? [];
        $out = [];

        foreach ($schema['properties'] as $name => $propSchema) {
            $isRequired = in_array($name, $required, true);
            $fieldPath = "{$statePath}.{$name}";

            $out[] = $this->mapProperty($name, $propSchema, $fieldPath, $isRequired);
        }

        return $out;
    }

    private function mapProperty(string $name, array $schema, string $path, bool $required): Component
    {
        $label = ucwords(str_replace(['_', '-'], ' ', preg_replace('/([a-z])([A-Z])/', '$1 $2', $name)));

        // Enum → Select
        if (isset($schema['enum'])) {
            return Select::make($name)
                ->label($label)
                ->options(array_combine($schema['enum'], $schema['enum']))
                ->required($required)
                ->statePath($path);
        }

        // Array of objects → Repeater
        if (($schema['type'] ?? null) === 'array' && isset($schema['items'])) {
            $itemSchema = $schema['items'];
            $repeater = Repeater::make($name)
                ->label($label)
                ->statePath($path)
                ->schema($this->map($itemSchema, ''));
            if (isset($schema['minItems'])) $repeater->minItems($schema['minItems']);
            if (isset($schema['maxItems'])) $repeater->maxItems($schema['maxItems']);
            return $repeater;
        }

        // Nested object → Fieldset with recursed components
        if (($schema['type'] ?? null) === 'object') {
            return Fieldset::make($label)
                ->schema($this->map($schema, $path));
        }

        // String: TextInput (short) or Textarea (long)
        $maxLength = $schema['maxLength'] ?? null;
        $minLength = $schema['minLength'] ?? null;
        $component = ($maxLength !== null && $maxLength > 200)
            ? Textarea::make($name)->rows(4)
            : TextInput::make($name);

        $component = $component
            ->label($label)
            ->statePath($path)
            ->required($required);

        if ($minLength) $component->minLength($minLength);
        if ($maxLength) $component->maxLength($maxLength);
        if (($schema['format'] ?? null) === 'date') $component = $component->placeholder('YYYY-MM-DD');

        return $component;
    }
}
```

Run — expect pass: `./vendor/bin/pest tests/Unit/Services/Templates/FilamentSchemaMapperTest.php` (5 tests).

- [ ] **Step 3: Commit**

```
git add app/Services/Templates/FilamentSchemaMapper.php tests/Unit/Services/Templates/FilamentSchemaMapperTest.php
git commit -m "feat(templates): Zod JSON Schema -> Filament form component mapper"
```

---

### Task C2: Edit page — skeleton + form wiring

**Files:**
- Create: `app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php`
- Create: `resources/views/filament/pages/edit-landing-page-draft.blade.php`
- Modify: `app/Filament/Resources/Funnels/FunnelResource.php` (register the page)
- Create: `tests/Feature/Filament/EditLandingPageDraftPageTest.php`

- [ ] **Step 1: Implement the page**

Create `app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php`:

```php
<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\{Funnel, LandingPageDraft};
use App\Services\Templates\{FilamentSchemaMapper, TemplateRegistry};
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Resources\Pages\Page;
use Filament\Schemas\Schema;
use Filament\Actions\Action;
use Filament\Notifications\Notification;

class EditLandingPageDraftPage extends Page implements HasForms
{
    use InteractsWithForms;

    protected static string $resource = FunnelResource::class;
    protected string $view = 'filament.pages.edit-landing-page-draft';
    protected static ?string $title = 'Edit Landing Page';

    public Funnel $funnel;
    public LandingPageDraft $draft;
    public ?array $data = [];

    public function mount(string $record, string $draft): void
    {
        $this->funnel = Funnel::findOrFail($record);
        $this->draft = LandingPageDraft::findOrFail($draft);
        $this->form->fill(['content' => $this->draft->sections ?? []]);
    }

    public function form(Schema $schema): Schema
    {
        $registry = app(TemplateRegistry::class);
        $template = $registry->get($this->draft->template_key);
        $jsonSchema = $template['jsonSchema'];

        $mapper = app(FilamentSchemaMapper::class);
        $components = $mapper->map($jsonSchema, 'data.content');

        return $schema->components($components);
    }

    public function save(): void
    {
        $data = $this->form->getState();
        $this->draft->update(['sections' => $data['content']]);
        Notification::make()
            ->title('Draft saved')
            ->success()
            ->send();
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('save')->label('Save draft')->submit('save'),
        ];
    }
}
```

- [ ] **Step 2: Blade view**

Create `resources/views/filament/pages/edit-landing-page-draft.blade.php`:

```blade
<x-filament-panels::page>
    <form wire:submit="save">
        {{ $this->form }}
    </form>
</x-filament-panels::page>
```

- [ ] **Step 3: Register in the resource**

In `FunnelResource::getPages()`, add:

```php
'edit-landing-page-draft' => EditLandingPageDraftPage::route('/{record}/landing-pages/{draft}/edit'),
```

Add `use App\Filament\Resources\Funnels\Pages\EditLandingPageDraftPage;` if not covered by namespace.

- [ ] **Step 4: Write a smoke test**

Create `tests/Feature/Filament/EditLandingPageDraftPageTest.php`:

```php
<?php

use App\Filament\Resources\Funnels\Pages\EditLandingPageDraftPage;
use App\Models\{Funnel, LandingPageBatch, LandingPageDraft, Summit, User};
use Filament\Facades\Filament;

use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
    $this->summit = Summit::factory()->create(['slug' => 'test-summit']);
    Filament::setTenant($this->summit);
});

it('renders a form generated from the draft template schema', function () {
    $funnel = Funnel::factory()->for($this->summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $this->summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1',
        'sections' => [
            'summit' => ['name' => 'Test', 'tagline' => 'T', 'startDate' => '2026-04-22', 'endDate' => '2026-04-26', 'timezone' => 'UTC'],
        ],
        'status' => 'shortlisted',
        'preview_token' => 't1',
    ]);

    livewire(EditLandingPageDraftPage::class, [
        'tenant' => $this->summit->slug,
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])->assertSuccessful();
});

it('save action persists changes to draft sections', function () {
    $funnel = Funnel::factory()->for($this->summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $this->summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1',
        'sections' => ['summit' => ['name' => 'Old', 'tagline' => 'T', 'startDate' => '2026-04-22', 'endDate' => '2026-04-26', 'timezone' => 'UTC']],
        'status' => 'shortlisted',
        'preview_token' => 't1',
    ]);

    livewire(EditLandingPageDraftPage::class, [
        'tenant' => $this->summit->slug,
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])
        ->fillForm(['content' => ['summit' => ['name' => 'New', 'tagline' => 'T', 'startDate' => '2026-04-22', 'endDate' => '2026-04-26', 'timezone' => 'UTC']]])
        ->call('save')
        ->assertHasNoFormErrors();

    $sections = $draft->fresh()->sections;
    expect($sections['summit']['name'])->toBe('New');
});
```

Run: `./vendor/bin/pest tests/Feature/Filament/EditLandingPageDraftPageTest.php`. Adjust the form-fill payload as needed to satisfy the schema (you may need to provide a full valid content payload depending on how strict the render path is).

- [ ] **Step 5: Commit**

```
git add app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php \
        app/Filament/Resources/Funnels/FunnelResource.php \
        resources/views/filament/pages/edit-landing-page-draft.blade.php \
        tests/Feature/Filament/EditLandingPageDraftPageTest.php
git commit -m "feat(filament): EditLandingPageDraftPage auto-generates form from draft schema"
```

---

### Task C3: Wire the Edit button in the card grid

Add an Edit button to each card in `LandingPageDraftsPage` that links to `EditLandingPageDraftPage`.

**Files:**
- Modify: `resources/views/filament/pages/landing-page-drafts.blade.php`

- [ ] **Step 1: Add the Edit button inside each card**

In the card's action row, alongside Preview / Approve / Publish / Reject:

```blade
<a href="{{ \App\Filament\Resources\Funnels\Pages\EditLandingPageDraftPage::getUrl(['tenant' => $this->funnel->summit->slug, 'record' => $this->funnel->id, 'draft' => $draft->id]) }}"
   class="px-3 py-1 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded">Edit</a>
```

Note the `tenant` param — per Task A1's tenancy pattern.

- [ ] **Step 2: Verify**

Visit the card grid in dev. Click Edit on a ready-or-shortlisted draft. Verify it opens the edit page with the form populated.

- [ ] **Step 3: Run tests**

`./vendor/bin/pest tests/Feature/Filament/` — all green.

- [ ] **Step 4: Commit**

```
git add resources/views/filament/pages/landing-page-drafts.blade.php
git commit -m "feat(filament): link Edit button on each draft card to EditLandingPageDraftPage"
```

---

### Task C4: Speaker picker override in edit mode

Currently the AI fills `speakersByDay[].speakerIds`. The operator may want to override which speakers appear in each day. Add a dedicated field on the edit page that re-uses the existing schema but exposes speaker selection as a multi-select of actual `Speaker` records.

**Files:**
- Modify: `app/Services/Templates/FilamentSchemaMapper.php` (add special case for uuid-array in speakers)
- Modify: `tests/Unit/Services/Templates/FilamentSchemaMapperTest.php`

- [ ] **Step 1: Extend the mapper with a speaker-picker override**

The convention: a field named `speakerIds` inside an array-of-objects should render as a `Select::multiple()` of the summit's speakers, not a generic repeater of UUIDs. This is context-specific, so pass a `summitId` option to `map()`:

```php
// Before
public function map(array $schema, string $statePath): array

// After
public function map(array $schema, string $statePath, ?string $summitId = null): array
```

Inside `mapProperty()`, detect `speakerIds`:

```php
if ($name === 'speakerIds' && ($schema['type'] ?? null) === 'array' && $summitId) {
    return Select::make($name)
        ->label('Speakers')
        ->multiple()
        ->options(
            \App\Models\Speaker::where('summit_id', $summitId)
                ->get()
                ->mapWithKeys(fn ($s) => [$s->id => trim("{$s->first_name} {$s->last_name}")])
                ->all()
        )
        ->statePath($path);
}
```

Plumb `summitId` through recursive calls.

- [ ] **Step 2: Update the test**

Add to `FilamentSchemaMapperTest.php`:

```php
it('renders speakerIds field as a Select::multiple when summitId is provided', function () {
    $summit = \App\Models\Summit::factory()->create();
    \App\Models\Speaker::factory()->for($summit)->create(['first_name' => 'Alice']);
    \App\Models\Speaker::factory()->for($summit)->create(['first_name' => 'Bob']);

    $schema = [
        'type' => 'object',
        'properties' => [
            'speakerIds' => [
                'type' => 'array',
                'items' => ['type' => 'string', 'format' => 'uuid'],
            ],
        ],
    ];
    $components = (new FilamentSchemaMapper)->map($schema, 'data', $summit->id);
    expect($components[0])->toBeInstanceOf(\Filament\Forms\Components\Select::class);
});
```

Note: this test needs `RefreshDatabase`. Add `uses(RefreshDatabase::class);` at top if the file doesn't already.

- [ ] **Step 3: Update the edit page to pass summitId**

In `EditLandingPageDraftPage::form()`:

```php
$components = $mapper->map($jsonSchema, 'data.content', $this->funnel->summit_id);
```

- [ ] **Step 4: Run tests**

```
./vendor/bin/pest tests/Unit/Services/Templates/FilamentSchemaMapperTest.php
./vendor/bin/pest tests/Feature/Filament/EditLandingPageDraftPageTest.php
```

Expect green.

- [ ] **Step 5: Commit**

```
git add app/Services/Templates/FilamentSchemaMapper.php \
        tests/Unit/Services/Templates/FilamentSchemaMapperTest.php \
        app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php
git commit -m "feat(templates): speaker multi-select in edit form when summitId in context"
```

---

## Theme D — Cleanup

### Task D1: Deprecate V1 pipeline code

Several files in `next-app/src/` are leftover from the V1 pipeline we replaced: `api-client.ts`, `skeletons/`, runtime render-block path, `themes/parenting-summits.ts`, etc. They're no longer referenced but still shipped. Remove them.

**Files:**
- Delete: `next-app/src/lib/api-client.ts` (deprecated; use `lib/api/laravel.ts` instead)
- Delete: `next-app/src/lib/draft-api-client.ts`
- Delete: `next-app/src/lib/skeletons/` (directory)
- Delete: `next-app/src/lib/themes/` (directory, if only contains V1 theme)
- Delete: `next-app/src/lib/blocks/` (directory, V1 block catalog consumer)
- Delete: `next-app/src/runtime/` (directory, V1 runtime)
- Delete: `next-app/src/render-block.tsx` (V1 block renderer)
- Delete: `next-app/src/app/api/drafts/` (deprecated preview-render endpoint)

Before deleting, grep for references.

- [ ] **Step 1: Audit references**

For each candidate file/directory, check that nothing in our MVP uses it:

```
cd next-app
for p in src/lib/api-client.ts src/lib/draft-api-client.ts src/lib/skeletons src/lib/themes src/lib/blocks src/runtime src/render-block.tsx src/app/api/drafts; do
  echo "=== $p ==="
  grep -r "$p" src/ app/ 2>/dev/null | grep -v "^$p" | head
done
```

If any of `src/templates/`, `src/app/preview/[token]/`, `src/app/f/[funnel]/optin/`, `src/lib/api/laravel.ts`, `src/components/OptinModal.tsx` reference these candidates, DO NOT delete that candidate — investigate the dependency.

- [ ] **Step 2: Delete the confirmed-unused files**

Whatever Step 1 cleared as safe to remove:

```
cd next-app
rm -rf src/lib/skeletons src/lib/themes src/lib/blocks src/runtime src/app/api/drafts
rm -f src/lib/api-client.ts src/lib/draft-api-client.ts src/render-block.tsx
```

Note: `src/lib/cn.ts` and `src/lib/cn.test.ts` may be referenced by components (it's a common utility). Don't delete those.

- [ ] **Step 3: Remove references from package.json scripts**

Check `package.json` for `build:runtime`, `build:catalog`, `sync:catalog`, `gen:block` — any scripts pointing to deleted code should be removed.

`predev` / `prebuild` currently chain through `build:runtime`. If we deleted `src/runtime/`, remove that from the chain too:

```json
"predev": "pnpm build:templates",
"prebuild": "pnpm build:templates",
```

- [ ] **Step 4: Run tests + build**

```
cd next-app
pnpm test src/templates/
pnpm typecheck
pnpm build
```

If typecheck or build fails, you deleted something still-referenced. Restore from git (`git checkout HEAD -- <path>`) and re-audit.

- [ ] **Step 5: Commit**

```
git add -u next-app/
git commit -m "chore: remove deprecated V1 pipeline code (api-client, skeletons, runtime, blocks)"
```

---

## Manual smoke checklist (after all tasks)

Per the Phase 1 checklist, extended:

1. Start services: `composer dev` (runs server + queue + pail + vite) and `cd next-app && pnpm dev`.
2. In `/admin`, log in. Pick or create a summit with a slug. Create a funnel with an optin FunnelStep.
3. Click **Generate Landing Pages**. Pick 3 variants, open pool to all templates. Submit.
4. Card grid polls every 3s until all 3 drafts are ready.
5. Click **Preview** on one card — Next.js renders the template with AI-filled content.
6. Click **Edit** on a card — a form appears with every schema field editable, speakers as multi-select.
7. Change a headline and save. Refresh preview — change is reflected.
8. Click **Approve** + **Publish** on one card. Visit `/f/{funnelId}/optin` — published template renders.
9. Click any CTA in the live page — Optin modal opens. Submit email + name. Verify row appears in `optins` table.
10. Delete the summit. Verify `funnel_step_revisions` rows still exist (audit log survives).

---

## Self-Review

**Spec coverage:**

| Phase 1.5 goal | Covered by task(s) |
|---|---|
| Tenancy fix in tests | A1 |
| Batch status completion | A2 |
| Concurrent publish safety | A3 |
| Summit title↔name prompt hint | A4 |
| Manifest/registry drift detection | A4 |
| 6 remaining templates | B1–B6 |
| Real thumbnails | B7 |
| Zod→Filament mapper | C1 |
| Edit page | C2 |
| Edit button in card grid | C3 |
| Speaker override in edit mode | C4 |
| Deprecated code removal | D1 |

**Placeholder check:** no TBD/TODO in code blocks. Task B1–B6 intentionally parameterize by template key rather than duplicating 600 lines × 6 — acceptable since the Phase 1 opus-v1/v2 tasks provide the full pattern.

**Type consistency:**
- `FilamentSchemaMapper::map(array $schema, string $statePath, ?string $summitId = null)` signature consistent between C1 definition and C2/C4 callers.
- `EditLandingPageDraftPage` route params `tenant`, `record`, `draft` consistent between route registration (C2) and Edit button link (C3).
- `Speaker::where('summit_id', $summitId)` consistent with the null-safe lookup pattern established in Phase 1 Task 14.

**Plan complete.**

Save location: `docs/superpowers/plans/2026-04-17-landing-page-template-generator-phase-1.5.md`
Phase 1 plan: `docs/superpowers/plans/2026-04-17-landing-page-template-generator.md`
Spec: `docs/superpowers/specs/2026-04-17-landing-page-template-generator-design.md`
