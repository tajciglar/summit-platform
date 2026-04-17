# Landing Page Template Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship an MVP that lets an operator click "Generate Landing Pages" on a Funnel in Filament, get N variants rendered as card thumbnails, preview each, and publish one to the funnel's optin step — using hand-designed React templates, not AI-written JSX.

**Architecture:** Each full-page HTML template in `next-app/public/` becomes a React component with a typed Zod slot schema. A Laravel `TemplateFiller` service sends the schema to Anthropic, validates the JSON response against the schema (via `opis/json-schema` using a JSON-Schema export of the Zod definition), and stores it as a `LandingPageDraft`. A Next.js preview route renders the draft via a template registry; a public route renders published content the same way. Filament card-grid page on the Funnel handles Approve / Reject / Publish.

**Tech Stack:** Laravel 13, PHP 8.3, Filament v4, Pest 4, `opis/json-schema`, Next.js 16.2 (Turbopack), React 19.2, Zod, Vitest, `@anthropic-ai/sdk` (via Laravel Http facade, not the PHP SDK — no official package), Tailwind v4.

**Scope (MVP / Phase 1 only):**
- 2 templates converted (opus-v1 + opus-v2) to validate the pattern across two visual styles.
- Generate flow end-to-end: Filament → batch + version jobs → drafts.
- Card grid with Preview / Approve / Reject / Publish. **No Edit page** (phase 1.5).
- Public API + Next.js preview + public routes.
- Unit + feature tests.

**Out of scope for this plan:** 6 remaining templates, inline field editing, AI copy regeneration, cross-template section swap, sales / checkout / thankyou generation, visual regression automation. Each goes in a follow-up plan.

**Spec:** `docs/superpowers/specs/2026-04-17-landing-page-template-generator-design.md` (commit `6507dfa`).

---

## File Map

### Next.js (`next-app/`)

| Path | Responsibility |
|---|---|
| `src/templates/types.ts` | Shared `TemplateDefinition`, `Speaker`, `TemplateKey` types |
| `src/templates/opus-v1.schema.ts` | Zod schema for opus-v1 |
| `src/templates/OpusV1.tsx` | React component for opus-v1 |
| `src/templates/opus-v2.schema.ts` | Zod schema for opus-v2 |
| `src/templates/OpusV2.tsx` | React component for opus-v2 |
| `src/templates/registry.ts` | Central registry mapping key → definition |
| `src/templates/registry.test.ts` | Registry integrity tests (Vitest) |
| `src/templates/__fixtures__/opus-v1.fixture.ts` | Known-good content fixture |
| `src/templates/__fixtures__/opus-v2.fixture.ts` | Known-good content fixture |
| `scripts/export-template-manifest.ts` | Build-time manifest exporter (Zod → JSON Schema) |
| `public/template-manifest.json` | Generated at build, consumed by Laravel |
| `public/template-thumbs/opus-v1.jpg` | Thumbnail (manual screenshot) |
| `public/template-thumbs/opus-v2.jpg` | Thumbnail |
| `src/lib/api/laravel.ts` | API client (typed fetch wrapper) |
| `src/app/preview/[token]/page.tsx` | Preview route |
| `src/app/f/[funnel]/optin/page.tsx` | Public optin route |

### Laravel (`app/`, `database/`, `tests/`, `routes/`)

| Path | Responsibility |
|---|---|
| `database/migrations/2026_04_17_120000_add_template_fields_to_landing_page_tables.php` | Schema delta |
| `database/migrations/2026_04_17_120100_create_funnel_step_revisions_table.php` | Publish audit table |
| `app/Models/LandingPageDraft.php` | Add fillable: `template_key`, `token_count`, `generation_ms` |
| `app/Models/LandingPageBatch.php` | Add fillable: `template_pool`, cast jsonb |
| `app/Models/FunnelStepRevision.php` | New model |
| `app/Services/Anthropic/AnthropicClient.php` | HTTP wrapper around Messages API |
| `app/Services/Templates/TemplateRegistry.php` | Reads `template-manifest.json`, exposes schema/label per key |
| `app/Services/Templates/TemplateSelector.php` | Picks N distinct template_keys from pool |
| `app/Services/Templates/TemplateFiller.php` | Builds prompt, calls Anthropic, validates JSON |
| `app/Services/Templates/PublishDraftService.php` | Snapshots step content, updates, marks draft published |
| `app/Jobs/GenerateLandingPageVersionJob.php` | Per-version: calls TemplateFiller, writes draft |
| `app/Jobs/GenerateLandingPageBatchJob.php` | Picks templates, dispatches N version jobs |
| `app/Http/Controllers/Api/PublicFunnelController.php` | `GET /api/funnels/{id}/published-content` |
| `app/Http/Controllers/Api/LandingPageDraftController.php` | `GET /api/landing-page-drafts/{token}` |
| `routes/api.php` | Route registration |
| `app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php` | Form page |
| `app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php` | Card grid page |
| `app/Filament/Resources/Funnels/FunnelResource.php` | Register pages + add action |
| `tests/Unit/Services/Templates/TemplateSelectorTest.php` | |
| `tests/Unit/Services/Templates/TemplateFillerTest.php` | |
| `tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php` | |
| `tests/Feature/Http/PublicFunnelControllerTest.php` | |
| `tests/Feature/Filament/GenerateLandingPagesPageTest.php` | |
| `tests/Feature/Services/PublishDraftServiceTest.php` | |

---

## Task Order

Phase A (DB) → Phase B (Next.js templates) → Phase C (Laravel AI) → Phase D (Jobs) → Phase E (APIs) → Phase F (Renderer) → Phase G (Filament) → Phase H (Publish) → Phase I (integration).

Each task ends with a commit. One commit per task.

---

## Task 1: Schema delta migration

**Files:**
- Create: `database/migrations/2026_04_17_120000_add_template_fields_to_landing_page_tables.php`

- [ ] **Step 1: Create migration file**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE landing_page_drafts ADD COLUMN template_key VARCHAR(64)");
        DB::statement("ALTER TABLE landing_page_drafts ADD COLUMN token_count INTEGER");
        DB::statement("ALTER TABLE landing_page_drafts ADD COLUMN generation_ms INTEGER");
        DB::statement("CREATE INDEX landing_page_drafts_template_key_idx ON landing_page_drafts(template_key)");

        DB::statement("ALTER TABLE landing_page_batches ADD COLUMN template_pool JSONB");
    }

    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS landing_page_drafts_template_key_idx");
        DB::statement("ALTER TABLE landing_page_drafts DROP COLUMN IF EXISTS template_key");
        DB::statement("ALTER TABLE landing_page_drafts DROP COLUMN IF EXISTS token_count");
        DB::statement("ALTER TABLE landing_page_drafts DROP COLUMN IF EXISTS generation_ms");

        DB::statement("ALTER TABLE landing_page_batches DROP COLUMN IF EXISTS template_pool");
    }
};
```

- [ ] **Step 2: Run migration**

Run: `php artisan migrate`
Expected: `INFO  Running migrations.` with the new migration name, then `DONE`.

- [ ] **Step 3: Verify columns**

Run: `php artisan tinker --execute="\Illuminate\Support\Facades\Schema::hasColumn('landing_page_drafts', 'template_key') ? print 'OK' : print 'MISSING';"`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add database/migrations/2026_04_17_120000_add_template_fields_to_landing_page_tables.php
git commit -m "feat(db): add template_key, token_count, generation_ms to landing page drafts; template_pool to batches"
```

---

## Task 2: Funnel step revisions migration

**Files:**
- Create: `database/migrations/2026_04_17_120100_create_funnel_step_revisions_table.php`

- [ ] **Step 1: Create migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("
            CREATE TABLE funnel_step_revisions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                funnel_step_id UUID REFERENCES funnel_steps(id) ON DELETE SET NULL,
                page_content_snapshot JSONB NOT NULL,
                published_at TIMESTAMPTZ NOT NULL,
                published_by UUID REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        ");
        DB::statement('CREATE INDEX funnel_step_revisions_step_id_published_at_idx ON funnel_step_revisions(funnel_step_id, published_at DESC)');
    }

    public function down(): void
    {
        DB::statement('DROP TABLE IF EXISTS funnel_step_revisions');
    }
};
```

**Audit-log design:** both FKs use `ON DELETE SET NULL` so revision history survives deletion of the referenced step or user. Index is composite `(funnel_step_id, published_at DESC)` for the dominant "recent revisions of this step" query.

- [ ] **Step 2: Run + verify**

Run: `php artisan migrate`
Run: `php artisan tinker --execute="\Illuminate\Support\Facades\Schema::hasTable('funnel_step_revisions') ? print 'OK' : print 'MISSING';"`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add database/migrations/2026_04_17_120100_create_funnel_step_revisions_table.php
git commit -m "feat(db): add funnel_step_revisions table for publish audit"
```

---

## Task 3: Model updates + new FunnelStepRevision model

**Files:**
- Modify: `app/Models/LandingPageDraft.php` — add to `$fillable` and `$casts`
- Modify: `app/Models/LandingPageBatch.php` — add to `$fillable` and `$casts`
- Create: `app/Models/FunnelStepRevision.php`

- [ ] **Step 1: Update `LandingPageDraft`**

Open `app/Models/LandingPageDraft.php`. Replace `$fillable` and `casts()`:

```php
protected $fillable = [
    'batch_id',
    'version_number',
    'template_key',
    'blocks',
    'sections',
    'published_html',
    'published_hydration_manifest',
    'status',
    'preview_token',
    'error_message',
    'token_count',
    'generation_ms',
];

protected function casts(): array
{
    return [
        'blocks' => 'array',
        'sections' => 'array',
        'published_hydration_manifest' => 'array',
        'token_count' => 'integer',
        'generation_ms' => 'integer',
    ];
}
```

- [ ] **Step 2: Update `LandingPageBatch`**

Replace `$fillable` and `casts()`:

```php
protected $fillable = [
    'summit_id',
    'funnel_id',
    'funnel_step_id',
    'version_count',
    'status',
    'notes',
    'style_reference_url',
    'override_url',
    'allowed_types',
    'template_pool',
    'completed_at',
];

protected function casts(): array
{
    return [
        'allowed_types' => 'array',
        'template_pool' => 'array',
        'completed_at' => 'datetime',
    ];
}
```

- [ ] **Step 3: Create `FunnelStepRevision` model**

Create `app/Models/FunnelStepRevision.php`:

```php
<?php

namespace App\Models;

use App\Models\Concerns\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FunnelStepRevision extends Model
{
    use HasFactory, HasUuid;

    public $timestamps = false;   // only created_at, set by DB default

    protected $fillable = [
        'funnel_step_id',
        'page_content_snapshot',
        'published_at',
        'published_by',
    ];

    protected function casts(): array
    {
        return [
            'page_content_snapshot' => 'array',
            'published_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function funnelStep(): BelongsTo
    {
        return $this->belongsTo(FunnelStep::class);
    }

    public function publisher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'published_by');
    }
}
```

- [ ] **Step 4: Smoke-test the models**

Run: `php artisan tinker --execute="echo (new \App\Models\LandingPageDraft)->getFillable() === ['batch_id','version_number','template_key','blocks','sections','published_html','published_hydration_manifest','status','preview_token','error_message','token_count','generation_ms'] ? 'OK' : 'MISMATCH';"`
Expected: `OK`

- [ ] **Step 5: Commit**

```bash
git add app/Models/LandingPageDraft.php app/Models/LandingPageBatch.php app/Models/FunnelStepRevision.php
git commit -m "feat(models): add template fields + FunnelStepRevision model"
```

---

## Task 4: Shared Next.js types

**Files:**
- Create: `next-app/src/templates/types.ts`

- [ ] **Step 1: Create types file**

```ts
import type { ComponentType } from 'react';
import type { ZodTypeAny } from 'zod';

export interface Speaker {
  id: string;
  firstName: string;
  lastName: string;
  title: string | null;
  shortBio: string | null;
  longBio: string | null;
  photoUrl: string | null;
  masterclassTitle: string | null;
  masterclassDescription: string | null;
  rating: number | null;
  goesLiveAt: string | null;   // ISO datetime
  sortOrder: number;
  isFeatured: boolean;
}

export interface TemplateDefinition<TContent = unknown> {
  /** stable key stored in DB; must match file name */
  key: string;
  /** human-readable for UI */
  label: string;
  /** path under /public */
  thumbnail: string;
  /** Zod schema that validates TContent */
  schema: ZodTypeAny;
  /** component accepting { content, speakers } */
  Component: ComponentType<{ content: TContent; speakers: Record<string, Speaker> }>;
  /** descriptive tags for filtering */
  tags: readonly string[];
}

export interface PublishedContent {
  template_key: string;
  content: unknown;   // validated at render time by the template's schema
}
```

- [ ] **Step 2: Commit**

```bash
git add next-app/src/templates/types.ts
git commit -m "feat(templates): add shared types for Speaker + TemplateDefinition"
```

---

## Task 5: opus-v1 Zod schema + fixture

**Files:**
- Create: `next-app/src/templates/opus-v1.schema.ts`
- Create: `next-app/src/templates/__fixtures__/opus-v1.fixture.ts`
- Create: `next-app/src/templates/opus-v1.schema.test.ts`

- [ ] **Step 1: Write the failing schema test**

Create `next-app/src/templates/opus-v1.schema.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { OpusV1Schema } from './opus-v1.schema';
import { opusV1Fixture } from './__fixtures__/opus-v1.fixture';

describe('OpusV1Schema', () => {
  it('accepts the known-good fixture', () => {
    expect(() => OpusV1Schema.parse(opusV1Fixture)).not.toThrow();
  });

  it('rejects missing summit.name', () => {
    const bad = { ...opusV1Fixture, summit: { ...opusV1Fixture.summit, name: '' } };
    expect(() => OpusV1Schema.parse(bad)).toThrow();
  });

  it('rejects bonusStack with zero entries', () => {
    const bad = { ...opusV1Fixture, bonusStack: [] };
    expect(() => OpusV1Schema.parse(bad)).toThrow();
  });

  it('rejects faqs with fewer than 3 entries', () => {
    const bad = { ...opusV1Fixture, faqs: opusV1Fixture.faqs.slice(0, 2) };
    expect(() => OpusV1Schema.parse(bad)).toThrow();
  });

  it('requires speakersByDay[].speakerIds to be UUIDs', () => {
    const bad = {
      ...opusV1Fixture,
      speakersByDay: [{ ...opusV1Fixture.speakersByDay[0], speakerIds: ['not-a-uuid'] }],
    };
    expect(() => OpusV1Schema.parse(bad)).toThrow();
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `cd next-app && pnpm test src/templates/opus-v1.schema.test.ts`
Expected: FAIL with module-not-found for `./opus-v1.schema` and `./__fixtures__/opus-v1.fixture`.

- [ ] **Step 3: Write the schema**

Create `next-app/src/templates/opus-v1.schema.ts`:

```ts
import { z } from 'zod';

export const OpusV1Schema = z.object({
  summit: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    startDate: z.string(),       // ISO yyyy-mm-dd
    endDate: z.string(),
    timezone: z.string(),
  }),
  hero: z.object({
    eyebrow: z.string(),
    headline: z.string().min(3),
    subheadline: z.string().min(3),
    ctaLabel: z.string().min(1),
    ctaSubtext: z.string().optional(),
  }),
  socialProof: z.object({
    statLabel1: z.string(), statValue1: z.string(),
    statLabel2: z.string(), statValue2: z.string(),
    statLabel3: z.string(), statValue3: z.string(),
  }),
  featureBand: z.object({
    eyebrow: z.string(),
    headline: z.string(),
    body: z.string(),
    bullets: z.array(z.string()).length(3),
  }),
  speakersByDay: z.array(z.object({
    dayLabel: z.string(),             // "Day 1 — Diagnosis"
    dayDate: z.string(),
    speakerIds: z.array(z.string().uuid()),
  })).min(1),
  bonusStack: z.array(z.object({
    title: z.string(),
    description: z.string(),
    valueLabel: z.string(),
  })).min(1).max(5),
  faqs: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })).min(3).max(10),
  closing: z.object({
    headline: z.string(),
    subheadline: z.string(),
    ctaLabel: z.string(),
  }),
});

export type OpusV1Content = z.infer<typeof OpusV1Schema>;
```

- [ ] **Step 4: Create fixture**

Create `next-app/src/templates/__fixtures__/opus-v1.fixture.ts`:

```ts
import type { OpusV1Content } from '../opus-v1.schema';

export const opusV1Fixture: OpusV1Content = {
  summit: {
    name: 'ADHD Parenting Summit 2026',
    tagline: 'Real strategies for real families',
    startDate: '2026-04-22',
    endDate: '2026-04-26',
    timezone: 'America/New_York',
  },
  hero: {
    eyebrow: 'FREE ONLINE EVENT',
    headline: 'Five days with twenty experts on ADHD parenting',
    subheadline: 'Practical, evidence-based masterclasses — free to attend live.',
    ctaLabel: 'Save my free seat',
    ctaSubtext: 'No credit card required',
  },
  socialProof: {
    statLabel1: 'families', statValue1: '38,000+',
    statLabel2: 'countries', statValue2: '42',
    statLabel3: 'avg rating', statValue3: '4.9 / 5',
  },
  featureBand: {
    eyebrow: 'WHY THIS MATTERS',
    headline: 'When parents have the right tools, families settle.',
    body: 'The gap between clinical advice and the kitchen floor at 7 a.m. is where most guides fail. These masterclasses are written for the kitchen floor.',
    bullets: [
      'Morning and bedtime routines that survive real life',
      'Scripts for the meltdown in aisle four',
      'How to protect siblings from ADHD fallout without guilt',
    ],
  },
  speakersByDay: [
    {
      dayLabel: 'Day 1 — Diagnosis & Foundations',
      dayDate: '2026-04-22',
      speakerIds: ['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'],
    },
    {
      dayLabel: 'Day 2 — Routines That Stick',
      dayDate: '2026-04-23',
      speakerIds: ['33333333-3333-3333-3333-333333333333'],
    },
  ],
  bonusStack: [
    { title: 'The Morning Routine Pack', description: 'Printable schedules for 3 age groups', valueLabel: '$49 value' },
    { title: 'Meltdown Scripts', description: '22 ready-made phrases for public outbursts', valueLabel: '$29 value' },
  ],
  faqs: [
    { question: 'Is this really free?', answer: 'Yes. Each masterclass is free to watch live.' },
    { question: 'Do I need to be there live?', answer: 'Live viewing is free; VIP pass unlocks replays.' },
    { question: 'Will I be pitched something?', answer: 'Yes — the VIP pass. You can ignore it and still get value.' },
  ],
  closing: {
    headline: 'Your family is not broken — the tools were wrong.',
    subheadline: 'Join us for five days of real help.',
    ctaLabel: 'Save my free seat',
  },
};
```

- [ ] **Step 5: Run tests — expect pass**

Run: `cd next-app && pnpm test src/templates/opus-v1.schema.test.ts`
Expected: 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add next-app/src/templates/opus-v1.schema.ts next-app/src/templates/opus-v1.schema.test.ts next-app/src/templates/__fixtures__/opus-v1.fixture.ts
git commit -m "feat(templates): opus-v1 Zod schema + fixture + passing schema tests"
```

---

## Task 6: opus-v1 React component

**Files:**
- Create: `next-app/src/templates/OpusV1.tsx`
- Reference: `next-app/public/opus-v1.html` (source HTML to port)

This task ports the static HTML to a typed React component with slots. The template is long (~800 lines); the steps below show the pattern for 3 sections and instruct how to port the rest.

- [ ] **Step 1: Create the component shell**

Create `next-app/src/templates/OpusV1.tsx`:

```tsx
import type { OpusV1Content } from './opus-v1.schema';
import type { Speaker } from './types';

type Props = {
  content: OpusV1Content;
  speakers: Record<string, Speaker>;
};

export function OpusV1({ content, speakers }: Props) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{content.summit.name}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,700;9..144,900&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Inline styles from the static template are ported into src/templates/opus-v1.styles.css */}
      </head>
      <body className="antialiased">
        <Hero content={content} />
        <SocialProof content={content} />
        <FeatureBand content={content} />
        <SpeakersByDay content={content} speakers={speakers} />
        <BonusStack content={content} />
        <FAQs content={content} />
        <Closing content={content} />
      </body>
    </html>
  );
}

function Hero({ content }: { content: OpusV1Content }) {
  return (
    <section className="px-8 py-24 max-w-6xl mx-auto">
      <p className="eyebrow text-ochre-600">{content.hero.eyebrow}</p>
      <h1 className="font-display text-5xl md:text-7xl text-ink-900 leading-tight mt-4">
        {content.hero.headline}
      </h1>
      <p className="mt-6 text-xl text-taupe-700 max-w-2xl">{content.hero.subheadline}</p>
      <div className="mt-10 flex items-center gap-4">
        <button className="bg-ochre-600 hover:bg-ochre-700 text-paper-50 px-8 py-4 font-ui font-semibold">
          {content.hero.ctaLabel}
        </button>
        {content.hero.ctaSubtext && (
          <span className="text-sm text-taupe-600">{content.hero.ctaSubtext}</span>
        )}
      </div>
    </section>
  );
}

function SocialProof({ content }: { content: OpusV1Content }) {
  const stats = [
    { label: content.socialProof.statLabel1, value: content.socialProof.statValue1 },
    { label: content.socialProof.statLabel2, value: content.socialProof.statValue2 },
    { label: content.socialProof.statLabel3, value: content.socialProof.statValue3 },
  ];
  return (
    <section className="py-16 rule">
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-8 text-center">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="pullmark">{stat.value}</p>
            <p className="eyebrow mt-2 text-taupe-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SpeakersByDay({ content, speakers }: Props) {
  return (
    <section className="py-24 max-w-6xl mx-auto px-8">
      {content.speakersByDay.map((day) => (
        <div key={day.dayLabel} className="mb-16">
          <h2 className="font-display text-4xl text-ink-900">{day.dayLabel}</h2>
          <p className="mt-2 figure-label">{day.dayDate}</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {day.speakerIds
              .map((id) => speakers[id])
              .filter((s): s is Speaker => Boolean(s))
              .map((speaker) => (
                <div key={speaker.id} className="portrait">
                  {speaker.photoUrl && (
                    <img src={speaker.photoUrl} alt={`${speaker.firstName} ${speaker.lastName}`} />
                  )}
                  <h3 className="font-display mt-4 text-xl">
                    {speaker.firstName} {speaker.lastName}
                  </h3>
                  {speaker.title && <p className="figure-label">{speaker.title}</p>}
                  {speaker.masterclassTitle && (
                    <p className="mt-2 italic text-taupe-700">{speaker.masterclassTitle}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function FeatureBand({ content }: { content: OpusV1Content }) {
  return (
    <section className="py-24 bg-paper-100">
      <div className="max-w-4xl mx-auto px-8">
        <p className="eyebrow text-ochre-700">{content.featureBand.eyebrow}</p>
        <h2 className="font-display text-4xl md:text-5xl text-ink-900 mt-4">
          {content.featureBand.headline}
        </h2>
        <p className="mt-6 text-lg text-taupe-700 dropcap">{content.featureBand.body}</p>
        <ul className="mt-10 space-y-4">
          {content.featureBand.bullets.map((bullet) => (
            <li key={bullet} className="text-lg pl-6 relative before:absolute before:left-0 before:top-3 before:w-3 before:h-3 before:bg-ochre-500">
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function BonusStack({ content }: { content: OpusV1Content }) {
  return (
    <section className="py-24 max-w-6xl mx-auto px-8">
      <h2 className="font-display text-4xl text-ink-900">Included bonuses</h2>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {content.bonusStack.map((bonus) => (
          <div key={bonus.title} className="border border-paper-400 p-6">
            <h3 className="font-display text-2xl">{bonus.title}</h3>
            <p className="mt-2 text-taupe-700">{bonus.description}</p>
            <p className="mt-4 figure-label text-ochre-600">{bonus.valueLabel}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQs({ content }: { content: OpusV1Content }) {
  return (
    <section className="py-24 max-w-3xl mx-auto px-8">
      <h2 className="font-display text-4xl text-ink-900 mb-8">Frequently asked</h2>
      {content.faqs.map((faq) => (
        <details key={faq.question}>
          <summary>{faq.question}</summary>
          <p className="pb-6 text-taupe-700">{faq.answer}</p>
        </details>
      ))}
    </section>
  );
}

function Closing({ content }: { content: OpusV1Content }) {
  return (
    <section className="py-32 bg-ink-900 text-paper-50 text-center">
      <h2 className="font-display text-5xl">{content.closing.headline}</h2>
      <p className="mt-4 text-xl text-paper-200">{content.closing.subheadline}</p>
      <button className="mt-10 bg-ochre-500 hover:bg-ochre-600 text-ink-900 px-10 py-4 font-ui font-semibold">
        {content.closing.ctaLabel}
      </button>
    </section>
  );
}
```

- [ ] **Step 2: Create the styles file**

The source `next-app/public/opus-v1.html` has ~100 lines of custom CSS in a `<style>` tag (eyebrow, dropcap, rule, figure-label, pullmark, portrait, etc.). Port these into `next-app/src/templates/opus-v1.styles.css` and `@import` from the global stylesheet (`next-app/src/app/globals.css`):

```css
/* next-app/src/templates/opus-v1.styles.css */
.eyebrow { font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.22em; font-weight: 600; font-size: 0.7rem; }
.dropcap::first-letter { font-family: 'Fraunces', serif; font-weight: 900; font-size: 4.5rem; float: left; line-height: 0.88; padding: 0.3rem 0.6rem 0 0; color: #4A1F2D; font-style: normal; }
.rule { border-top: 1px solid #E8DFD0; }
.figure-label { font-family: 'Inter', sans-serif; text-transform: uppercase; letter-spacing: 0.2em; font-size: 0.65rem; color: #8A7A6C; font-weight: 600; }
.pullmark { font-family: 'Fraunces', serif; font-size: 8rem; line-height: 0.75; color: #C9812A; font-weight: 900; }
.portrait { border-radius: 2px; overflow: hidden; position: relative; }
.portrait::after { content: ''; position: absolute; inset: 0; box-shadow: inset 0 0 0 1px rgba(74, 31, 45, 0.15); pointer-events: none; }

details { border-bottom: 1px solid #E8DFD0; }
details summary { cursor: pointer; list-style: none; padding: 1.5rem 0; font-family: 'Fraunces', serif; font-weight: 700; font-size: 1.2rem; color: #2A0F17; }
details summary::-webkit-details-marker { display: none; }
details summary::after { content: '+'; float: right; font-family: 'Fraunces', serif; font-weight: 500; font-size: 1.6rem; line-height: 1; color: #C9812A; transition: transform 0.2s; }
details[open] summary::after { content: '—'; }
```

Add to `next-app/src/app/globals.css`:

```css
@import '../templates/opus-v1.styles.css';
```

Add the custom Tailwind color tokens. Since this project uses Tailwind v4 (CSS-first config), append to `next-app/src/app/globals.css`:

```css
@theme {
  --color-paper-50: #FDFBF5;
  --color-paper-100: #F9F4EC;
  --color-paper-200: #F2EADD;
  --color-paper-300: #E8DFD0;
  --color-paper-400: #D4C7B2;
  --color-ink-900: #2A0F17;
  --color-ink-800: #3A1822;
  --color-ink-700: #4A1F2D;
  --color-ink-600: #6B3340;
  --color-ink-500: #8A4E5D;
  --color-ochre-700: #A6691F;
  --color-ochre-600: #C9812A;
  --color-ochre-500: #D9963F;
  --color-ochre-400: #E7B273;
  --color-taupe-700: #4F4238;
  --color-taupe-600: #6B5B4E;
  --color-taupe-500: #8A7A6C;
  --color-taupe-400: #A89887;
  --font-display: 'Fraunces', serif;
  --font-serif: 'Source Serif 4', Georgia, serif;
  --font-ui: 'Inter', system-ui, sans-serif;
}
```

- [ ] **Step 3: Port remaining sections from opus-v1.html**

The component in Step 1 covers the 7 major sections. The source HTML includes a sticky countdown bar, a logo strip/marquee, a speaker-grid subvariant with portraits and rating, a video testimonials strip, and a footer. Port each missing section into its own sub-component inside `OpusV1.tsx`, following the same pattern:

- Read the corresponding markup in `next-app/public/opus-v1.html`.
- Identify every dynamic string/number/array → add to the Zod schema in `opus-v1.schema.ts` if missing, update the fixture, and add a schema test for any bounded constraint.
- Replace static text with `content.*` references.
- Replace inline `style`/`class` attributes with React's `style`/`className`.
- Speaker references: use `speakers[id]` lookup.

Rule: **no string literal that would change per summit survives in the JSX.** If you find one, add a schema field for it.

- [ ] **Step 4: Build sanity check**

Run: `cd next-app && pnpm typecheck`
Expected: no errors.

Run: `cd next-app && pnpm build`
Expected: successful Next build (template not yet referenced by a route, but imports must typecheck).

- [ ] **Step 5: Commit**

```bash
git add next-app/src/templates/OpusV1.tsx next-app/src/templates/opus-v1.styles.css next-app/src/app/globals.css next-app/src/templates/opus-v1.schema.ts next-app/src/templates/__fixtures__/opus-v1.fixture.ts
git commit -m "feat(templates): OpusV1 React component + styles + theme tokens"
```

---

## Task 7: opus-v2 schema + component

Repeat Tasks 5 and 6 for `opus-v2`, targeting `next-app/public/opus-v2.html` as the source.

**Files:**
- Create: `next-app/src/templates/opus-v2.schema.ts`
- Create: `next-app/src/templates/opus-v2.schema.test.ts`
- Create: `next-app/src/templates/__fixtures__/opus-v2.fixture.ts`
- Create: `next-app/src/templates/OpusV2.tsx`
- Create: `next-app/src/templates/opus-v2.styles.css` (if its design tokens differ from opus-v1)

- [ ] **Step 1: Inspect `next-app/public/opus-v2.html`** to identify its sections and dynamic fields. The opus-v2 aesthetic differs from opus-v1 — note its color tokens and font families so you can port theme variables into `globals.css` under separate CSS custom properties if they differ.

- [ ] **Step 2: Port the schema** following the opus-v1 pattern. Sections may differ (opus-v2 may have a video testimonials section opus-v1 lacks, or vice versa). Include `summit`, `hero`, `speakersByDay` (required by all templates), plus template-specific sections.

- [ ] **Step 3: Create the fixture** with realistic placeholder content that passes the schema.

- [ ] **Step 4: Write schema tests** — at minimum: fixture-passes, fixture-fails-when-name-missing, speakerIds-must-be-uuids, any bounded-array limits.

- [ ] **Step 5: Write the component** following the opus-v1 structure — one sub-component per section, slots only, no static summit-specific strings.

- [ ] **Step 6: Add any opus-v2-specific styles** to `opus-v2.styles.css` and `@import` from `globals.css`.

- [ ] **Step 7: Run tests + typecheck + build**

Run: `cd next-app && pnpm test src/templates/opus-v2.schema.test.ts && pnpm typecheck && pnpm build`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add next-app/src/templates/opus-v2.{schema,tsx,styles.css}.ts next-app/src/templates/opus-v2.schema.test.ts next-app/src/templates/__fixtures__/opus-v2.fixture.ts next-app/src/app/globals.css
git commit -m "feat(templates): OpusV2 schema + component + theme tokens"
```

---

## Task 8: Template registry + integrity test

**Files:**
- Create: `next-app/src/templates/registry.ts`
- Create: `next-app/src/templates/registry.test.ts`

- [ ] **Step 1: Write the failing integrity test**

```ts
// next-app/src/templates/registry.test.ts
import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { templates, templateKeys } from './registry';

describe('template registry', () => {
  it('has at least two templates', () => {
    expect(templateKeys.length).toBeGreaterThanOrEqual(2);
  });

  it.each(templateKeys)('template "%s" has all required properties', (key) => {
    const t = templates[key];
    expect(t.key).toBe(key);
    expect(t.label).toBeTruthy();
    expect(t.thumbnail).toMatch(/^\/template-thumbs\/.+\.(jpg|png|webp)$/);
    expect(t.schema).toBeDefined();
    expect(t.Component).toBeTruthy();
    expect(Array.isArray(t.tags)).toBe(true);
  });

  it.each(templateKeys)('template "%s" thumbnail file exists on disk', (key) => {
    const t = templates[key];
    const publicPath = resolve(process.cwd(), 'public', t.thumbnail.replace(/^\//, ''));
    expect(existsSync(publicPath)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

Run: `cd next-app && pnpm test src/templates/registry.test.ts`
Expected: FAIL with module-not-found.

- [ ] **Step 3: Write the registry**

```ts
// next-app/src/templates/registry.ts
import type { TemplateDefinition } from './types';
import { OpusV1 } from './OpusV1';
import { OpusV1Schema } from './opus-v1.schema';
import { OpusV2 } from './OpusV2';
import { OpusV2Schema } from './opus-v2.schema';

export const templates = {
  'opus-v1': {
    key: 'opus-v1',
    label: 'Editorial (Ochre / Ink)',
    thumbnail: '/template-thumbs/opus-v1.jpg',
    schema: OpusV1Schema,
    Component: OpusV1,
    tags: ['editorial', 'serif', 'warm'] as const,
  },
  'opus-v2': {
    key: 'opus-v2',
    label: 'Opus V2',   // update with the actual aesthetic label once ported
    thumbnail: '/template-thumbs/opus-v2.jpg',
    schema: OpusV2Schema,
    Component: OpusV2,
    tags: [] as const,   // fill in once the design is inspected
  },
} satisfies Record<string, TemplateDefinition>;

export type TemplateKey = keyof typeof templates;
export const templateKeys = Object.keys(templates) as TemplateKey[];

export function getTemplate(key: string): TemplateDefinition | null {
  return (templates as Record<string, TemplateDefinition>)[key] ?? null;
}
```

- [ ] **Step 4: Generate thumbnails**

Open each `*.html` in a browser, take a screenshot (viewport 1440×900 recommended), crop and save as:

- `next-app/public/template-thumbs/opus-v1.jpg`
- `next-app/public/template-thumbs/opus-v2.jpg`

(Later templates ship with their own thumbnails in their respective tasks.)

- [ ] **Step 5: Run tests — expect pass**

Run: `cd next-app && pnpm test src/templates/registry.test.ts`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add next-app/src/templates/registry.ts next-app/src/templates/registry.test.ts next-app/public/template-thumbs/
git commit -m "feat(templates): registry + integrity tests for opus-v1 and opus-v2"
```

---

## Task 9: Template manifest exporter

Generates a JSON Schema manifest Laravel can read. Runs on `prebuild`.

**Files:**
- Create: `next-app/scripts/export-template-manifest.ts`
- Modify: `next-app/package.json` — add script
- Install: `zod-to-json-schema` dev dep

- [ ] **Step 1: Install dependency**

Run: `cd next-app && pnpm add -D zod-to-json-schema`
Expected: added to `devDependencies`.

- [ ] **Step 2: Write the exporter**

```ts
// next-app/scripts/export-template-manifest.ts
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { templates, templateKeys } from '../src/templates/registry';

const manifest = {
  generatedAt: new Date().toISOString(),
  templates: templateKeys.map((key) => {
    const t = templates[key];
    return {
      key: t.key,
      label: t.label,
      thumbnail: t.thumbnail,
      tags: t.tags,
      jsonSchema: zodToJsonSchema(t.schema, { target: 'jsonSchema7' }),
    };
  }),
};

const outPath = resolve(__dirname, '../public/template-manifest.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`✓ Wrote ${manifest.templates.length} templates to ${outPath}`);
```

- [ ] **Step 3: Add `build:templates` script to `next-app/package.json`**

Modify the `scripts` block. Add `"build:templates": "tsx scripts/export-template-manifest.ts"`. Update `predev` and `prebuild` to chain it:

```json
"predev": "pnpm build:runtime && pnpm build:templates",
"prebuild": "pnpm build:runtime && pnpm build:templates",
"build:templates": "tsx scripts/export-template-manifest.ts",
```

- [ ] **Step 4: Run the exporter**

Run: `cd next-app && pnpm build:templates`
Expected: `✓ Wrote 2 templates to ...public/template-manifest.json`

- [ ] **Step 5: Spot-check the output**

Run: `cd next-app && jq '.templates[].key' public/template-manifest.json`
Expected: `"opus-v1"` and `"opus-v2"` on separate lines.

- [ ] **Step 6: Commit**

```bash
git add next-app/scripts/export-template-manifest.ts next-app/package.json next-app/pnpm-lock.yaml next-app/public/template-manifest.json
git commit -m "feat(templates): JSON Schema manifest exporter + prebuild hook"
```

---

## Task 10: AnthropicClient wrapper

**Files:**
- Create: `app/Services/Anthropic/AnthropicClient.php`
- Create: `tests/Unit/Services/Anthropic/AnthropicClientTest.php`
- Modify: `config/services.php` — add `anthropic` config block

- [ ] **Step 1: Add config**

In `config/services.php`, append:

```php
'anthropic' => [
    'api_key' => env('ANTHROPIC_API_KEY'),
    'model' => env('ANTHROPIC_MODEL', 'claude-opus-4-7'),
    'base_url' => env('ANTHROPIC_BASE_URL', 'https://api.anthropic.com'),
    'max_tokens' => (int) env('ANTHROPIC_MAX_TOKENS', 8192),
],
```

- [ ] **Step 2: Write the failing test**

Create `tests/Unit/Services/Anthropic/AnthropicClientTest.php`:

```php
<?php

use App\Services\Anthropic\AnthropicClient;
use Illuminate\Support\Facades\Http;

it('posts to the messages endpoint with the configured model and returns parsed content', function () {
    config()->set('services.anthropic.api_key', 'test-key');
    config()->set('services.anthropic.model', 'claude-opus-4-7');
    config()->set('services.anthropic.base_url', 'https://api.anthropic.com');
    config()->set('services.anthropic.max_tokens', 4096);

    Http::fake([
        'api.anthropic.com/v1/messages' => Http::response([
            'id' => 'msg_123',
            'type' => 'message',
            'role' => 'assistant',
            'model' => 'claude-opus-4-7',
            'content' => [['type' => 'text', 'text' => '{"hello":"world"}']],
            'stop_reason' => 'end_turn',
            'usage' => ['input_tokens' => 10, 'output_tokens' => 3],
        ], 200),
    ]);

    $client = app(AnthropicClient::class);
    $result = $client->complete(
        system: 'You are a JSON generator.',
        user: 'Return {"hello":"world"}',
    );

    expect($result['text'])->toBe('{"hello":"world"}');
    expect($result['tokens'])->toBe(13);

    Http::assertSent(function ($req) {
        return $req->hasHeader('x-api-key', 'test-key')
            && $req->hasHeader('anthropic-version', '2023-06-01')
            && $req['model'] === 'claude-opus-4-7'
            && $req['max_tokens'] === 4096;
    });
});

it('throws when Anthropic returns an error status', function () {
    config()->set('services.anthropic.api_key', 'test-key');
    Http::fake(['api.anthropic.com/v1/messages' => Http::response(['error' => 'rate_limited'], 429)]);

    expect(fn () => app(AnthropicClient::class)->complete(system: 's', user: 'u'))
        ->toThrow(\RuntimeException::class);
});
```

- [ ] **Step 3: Run test — expect failure**

Run: `./vendor/bin/pest tests/Unit/Services/Anthropic/AnthropicClientTest.php`
Expected: FAIL — class `App\Services\Anthropic\AnthropicClient` not found.

- [ ] **Step 4: Implement the client**

```php
<?php

namespace App\Services\Anthropic;

use Illuminate\Support\Facades\Http;

class AnthropicClient
{
    /**
     * @return array{text: string, tokens: int}
     * @throws \RuntimeException on non-2xx response
     */
    public function complete(string $system, string $user): array
    {
        $config = config('services.anthropic');

        $response = Http::timeout(120)
            ->withHeaders([
                'x-api-key' => $config['api_key'],
                'anthropic-version' => '2023-06-01',
                'content-type' => 'application/json',
            ])
            ->post($config['base_url'] . '/v1/messages', [
                'model' => $config['model'],
                'max_tokens' => $config['max_tokens'],
                'system' => $system,
                'messages' => [
                    ['role' => 'user', 'content' => $user],
                ],
            ]);

        if ($response->failed()) {
            throw new \RuntimeException(
                "Anthropic API returned {$response->status()}: " . $response->body()
            );
        }

        $data = $response->json();
        $text = collect($data['content'] ?? [])
            ->where('type', 'text')
            ->pluck('text')
            ->implode('');

        return [
            'text' => $text,
            'tokens' => ($data['usage']['input_tokens'] ?? 0) + ($data['usage']['output_tokens'] ?? 0),
        ];
    }
}
```

- [ ] **Step 5: Run test — expect pass**

Run: `./vendor/bin/pest tests/Unit/Services/Anthropic/AnthropicClientTest.php`
Expected: 2 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Services/Anthropic/AnthropicClient.php tests/Unit/Services/Anthropic/AnthropicClientTest.php config/services.php
git commit -m "feat(anthropic): thin client around Messages API with Http::fake tests"
```

---

## Task 11: TemplateRegistry (PHP)

Reads `next-app/public/template-manifest.json`.

**Files:**
- Create: `app/Services/Templates/TemplateRegistry.php`
- Create: `tests/Unit/Services/Templates/TemplateRegistryTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php

use App\Services\Templates\TemplateRegistry;

beforeEach(function () {
    $this->tmp = tempnam(sys_get_temp_dir(), 'manifest');
    file_put_contents($this->tmp, json_encode([
        'generatedAt' => '2026-04-17T00:00:00Z',
        'templates' => [
            [
                'key' => 'opus-v1',
                'label' => 'Editorial',
                'thumbnail' => '/template-thumbs/opus-v1.jpg',
                'tags' => ['editorial'],
                'jsonSchema' => ['type' => 'object', 'properties' => ['x' => ['type' => 'string']]],
            ],
        ],
    ]));
});

afterEach(fn () => @unlink($this->tmp));

it('lists all template keys', function () {
    $registry = new TemplateRegistry($this->tmp);
    expect($registry->allKeys())->toEqual(['opus-v1']);
});

it('returns a template definition by key', function () {
    $registry = new TemplateRegistry($this->tmp);
    $t = $registry->get('opus-v1');
    expect($t['label'])->toBe('Editorial');
    expect($t['jsonSchema']['type'])->toBe('object');
});

it('throws when manifest file is missing', function () {
    expect(fn () => new TemplateRegistry('/does/not/exist.json'))
        ->toThrow(\RuntimeException::class);
});

it('throws when key does not exist', function () {
    $registry = new TemplateRegistry($this->tmp);
    expect(fn () => $registry->get('missing'))->toThrow(\InvalidArgumentException::class);
});
```

- [ ] **Step 2: Run — expect failure**

Run: `./vendor/bin/pest tests/Unit/Services/Templates/TemplateRegistryTest.php`
Expected: FAIL.

- [ ] **Step 3: Implement**

```php
<?php

namespace App\Services\Templates;

class TemplateRegistry
{
    /** @var array<string, array{key:string, label:string, thumbnail:string, tags:array, jsonSchema:array}> */
    private array $templates;

    public function __construct(?string $manifestPath = null)
    {
        $path = $manifestPath ?? base_path('next-app/public/template-manifest.json');
        if (!is_file($path)) {
            throw new \RuntimeException("Template manifest not found at {$path}. Run `pnpm build:templates` in next-app.");
        }
        $manifest = json_decode(file_get_contents($path), associative: true);
        $this->templates = collect($manifest['templates'] ?? [])->keyBy('key')->all();
    }

    /** @return list<string> */
    public function allKeys(): array
    {
        return array_keys($this->templates);
    }

    /** @return array{key:string, label:string, thumbnail:string, tags:array, jsonSchema:array} */
    public function get(string $key): array
    {
        if (!isset($this->templates[$key])) {
            throw new \InvalidArgumentException("Unknown template key: {$key}");
        }
        return $this->templates[$key];
    }

    public function exists(string $key): bool
    {
        return isset($this->templates[$key]);
    }
}
```

- [ ] **Step 4: Run — expect pass**

Run: `./vendor/bin/pest tests/Unit/Services/Templates/TemplateRegistryTest.php`
Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Services/Templates/TemplateRegistry.php tests/Unit/Services/Templates/TemplateRegistryTest.php
git commit -m "feat(templates): PHP TemplateRegistry reads next-app manifest"
```

---

## Task 12: TemplateSelector

Picks N distinct keys from a pool.

**Files:**
- Create: `app/Services/Templates/TemplateSelector.php`
- Create: `tests/Unit/Services/Templates/TemplateSelectorTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php

use App\Services\Templates\TemplateRegistry;
use App\Services\Templates\TemplateSelector;

it('picks N distinct keys from the pool', function () {
    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('allKeys')->andReturn(['a', 'b', 'c', 'd']);

    $selector = new TemplateSelector($registry);
    $picks = $selector->pick(pool: ['a', 'b', 'c', 'd'], count: 3);

    expect($picks)->toHaveCount(3);
    expect(array_unique($picks))->toHaveCount(3);
    foreach ($picks as $p) expect(['a','b','c','d'])->toContain($p);
});

it('returns the entire pool when count == pool size', function () {
    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('allKeys')->andReturn(['a', 'b']);
    $selector = new TemplateSelector($registry);
    expect($selector->pick(pool: ['a', 'b'], count: 2))->toEqualCanonicalizing(['a', 'b']);
});

it('caps count at pool size', function () {
    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('allKeys')->andReturn(['a', 'b']);
    $selector = new TemplateSelector($registry);
    $picks = $selector->pick(pool: ['a', 'b'], count: 5);
    expect($picks)->toHaveCount(2);
});

it('defaults to full registry when pool is empty', function () {
    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('allKeys')->andReturn(['a', 'b', 'c']);
    $selector = new TemplateSelector($registry);
    expect($selector->pick(pool: [], count: 2))->toHaveCount(2);
});

it('filters pool entries that do not exist in registry', function () {
    $registry = Mockery::mock(TemplateRegistry::class);
    $registry->shouldReceive('allKeys')->andReturn(['a', 'b']);
    $selector = new TemplateSelector($registry);
    $picks = $selector->pick(pool: ['a', 'bogus'], count: 2);
    expect($picks)->toEqual(['a']);
});
```

- [ ] **Step 2: Run — expect failure**

Run: `./vendor/bin/pest tests/Unit/Services/Templates/TemplateSelectorTest.php`
Expected: FAIL.

- [ ] **Step 3: Implement**

```php
<?php

namespace App\Services\Templates;

class TemplateSelector
{
    public function __construct(private TemplateRegistry $registry) {}

    /**
     * @param  list<string> $pool  Candidate template keys. Empty = all registry keys.
     * @param  int $count
     * @return list<string>
     */
    public function pick(array $pool, int $count): array
    {
        $validKeys = $this->registry->allKeys();
        $candidates = empty($pool) ? $validKeys : array_values(array_intersect($pool, $validKeys));

        if (empty($candidates) || $count <= 0) {
            return [];
        }

        shuffle($candidates);
        return array_slice($candidates, 0, min($count, count($candidates)));
    }
}
```

- [ ] **Step 4: Run — expect pass**

Run: `./vendor/bin/pest tests/Unit/Services/Templates/TemplateSelectorTest.php`
Expected: 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Services/Templates/TemplateSelector.php tests/Unit/Services/Templates/TemplateSelectorTest.php
git commit -m "feat(templates): TemplateSelector picks N distinct keys from pool"
```

---

## Task 13: TemplateFiller

The AI call. Uses `opis/json-schema` for validation.

**Files:**
- Create: `app/Services/Templates/TemplateFiller.php`
- Create: `tests/Unit/Services/Templates/TemplateFillerTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php

use App\Models\Summit;
use App\Models\Speaker;
use App\Services\Anthropic\AnthropicClient;
use App\Services\Templates\TemplateFiller;
use App\Services\Templates\TemplateRegistry;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->schema = [
        'type' => 'object',
        'required' => ['summit', 'hero'],
        'properties' => [
            'summit' => [
                'type' => 'object',
                'required' => ['name'],
                'properties' => ['name' => ['type' => 'string', 'minLength' => 1]],
            ],
            'hero' => [
                'type' => 'object',
                'required' => ['headline'],
                'properties' => ['headline' => ['type' => 'string', 'minLength' => 1]],
            ],
        ],
    ];

    $this->registry = Mockery::mock(TemplateRegistry::class);
    $this->registry->shouldReceive('get')->with('opus-v1')->andReturn([
        'key' => 'opus-v1',
        'label' => 'Editorial',
        'thumbnail' => '/x.jpg',
        'tags' => [],
        'jsonSchema' => $this->schema,
    ]);
});

it('calls anthropic with schema in system prompt and returns validated content', function () {
    $client = Mockery::mock(AnthropicClient::class);
    $client->shouldReceive('complete')
        ->once()
        ->andReturn([
            'text' => '{"summit":{"name":"X"},"hero":{"headline":"H"}}',
            'tokens' => 500,
        ]);

    $summit = Summit::factory()->create(['name' => 'Test Summit']);
    $filler = new TemplateFiller($this->registry, $client);

    $result = $filler->fill(
        summit: $summit,
        templateKey: 'opus-v1',
        speakers: collect(),
        notes: null,
        styleReferenceUrl: null,
    );

    expect($result['content'])->toBe(['summit' => ['name' => 'X'], 'hero' => ['headline' => 'H']]);
    expect($result['tokens'])->toBe(500);
});

it('retries once when response is invalid JSON', function () {
    $client = Mockery::mock(AnthropicClient::class);
    $client->shouldReceive('complete')
        ->times(2)
        ->andReturn(
            ['text' => 'not json', 'tokens' => 100],
            ['text' => '{"summit":{"name":"OK"},"hero":{"headline":"H"}}', 'tokens' => 400],
        );

    $summit = Summit::factory()->create();
    $filler = new TemplateFiller($this->registry, $client);
    $result = $filler->fill($summit, 'opus-v1', collect(), null, null);
    expect($result['content']['summit']['name'])->toBe('OK');
});

it('throws after two failed attempts', function () {
    $client = Mockery::mock(AnthropicClient::class);
    $client->shouldReceive('complete')
        ->times(2)
        ->andReturn(['text' => 'not json', 'tokens' => 100]);

    $summit = Summit::factory()->create();
    $filler = new TemplateFiller($this->registry, $client);
    expect(fn () => $filler->fill($summit, 'opus-v1', collect(), null, null))
        ->toThrow(\RuntimeException::class);
});

it('throws when schema validation fails twice', function () {
    $client = Mockery::mock(AnthropicClient::class);
    $client->shouldReceive('complete')
        ->times(2)
        ->andReturn(['text' => '{"summit":{"name":""},"hero":{"headline":"H"}}', 'tokens' => 100]);

    $summit = Summit::factory()->create();
    $filler = new TemplateFiller($this->registry, $client);
    expect(fn () => $filler->fill($summit, 'opus-v1', collect(), null, null))
        ->toThrow(\RuntimeException::class, 'schema validation');
});
```

- [ ] **Step 2: Run — expect failure**

Run: `./vendor/bin/pest tests/Unit/Services/Templates/TemplateFillerTest.php`
Expected: FAIL.

- [ ] **Step 3: Implement**

```php
<?php

namespace App\Services\Templates;

use App\Models\Speaker;
use App\Models\Summit;
use App\Services\Anthropic\AnthropicClient;
use Illuminate\Support\Collection;
use Opis\JsonSchema\Validator;
use Opis\JsonSchema\Errors\ErrorFormatter;

class TemplateFiller
{
    public function __construct(
        private TemplateRegistry $registry,
        private AnthropicClient $anthropic,
    ) {}

    /**
     * @param  Collection<int, Speaker>  $speakers
     * @return array{content: array, tokens: int}
     * @throws \RuntimeException when two attempts fail
     */
    public function fill(
        Summit $summit,
        string $templateKey,
        Collection $speakers,
        ?string $notes,
        ?string $styleReferenceUrl,
    ): array {
        $template = $this->registry->get($templateKey);
        $schema = $template['jsonSchema'];

        $systemPrompt = $this->buildSystemPrompt($schema);
        $userPrompt = $this->buildUserPrompt($summit, $speakers, $notes, $styleReferenceUrl);

        $lastError = null;
        $totalTokens = 0;

        for ($attempt = 1; $attempt <= 2; $attempt++) {
            $effectiveUser = $attempt === 1
                ? $userPrompt
                : "{$userPrompt}\n\nPrevious attempt failed with: {$lastError}\nReturn only valid JSON matching the schema.";

            $response = $this->anthropic->complete($systemPrompt, $effectiveUser);
            $totalTokens += $response['tokens'];

            $json = $this->extractJson($response['text']);
            if ($json === null) {
                $lastError = 'response was not valid JSON';
                continue;
            }

            $validation = (new Validator)->validate(
                json_decode(json_encode($json)),   // opis requires object graph
                json_encode($schema),
            );

            if ($validation->isValid()) {
                return ['content' => $json, 'tokens' => $totalTokens];
            }

            $lastError = 'schema validation failed: '
                . json_encode((new ErrorFormatter)->format($validation->error()));
        }

        throw new \RuntimeException("TemplateFiller: {$lastError}");
    }

    private function buildSystemPrompt(array $schema): string
    {
        $schemaJson = json_encode($schema, JSON_PRETTY_PRINT);
        return <<<PROMPT
You are a landing-page copywriter for online summits. Given a summit's data, you fill in the slots of a pre-designed template by returning a JSON object that matches this JSON Schema exactly:

{$schemaJson}

Requirements:
- Return ONLY the JSON object. No prose, no markdown fences.
- Every required field must be present and non-empty.
- Do not invent speakers — use only the IDs provided in the user message.
- Keep copy specific, human, and on-brand. No generic marketing speak ("revolutionize", "game-changer").
- Headlines should be 6–14 words. Subheadings 10–20.
PROMPT;
    }

    private function buildUserPrompt(
        Summit $summit,
        Collection $speakers,
        ?string $notes,
        ?string $styleReferenceUrl,
    ): string {
        $speakersJson = json_encode($speakers->map(fn (Speaker $s) => [
            'id' => $s->id,
            'firstName' => $s->first_name,
            'lastName' => $s->last_name,
            'title' => $s->title,
            'masterclassTitle' => $s->masterclass_title,
            'goesLiveAt' => $s->goes_live_at?->toIso8601String(),
        ])->values(), JSON_PRETTY_PRINT);

        $notesBlock = $notes ? "\n\nOperator notes: {$notes}" : '';
        $styleBlock = $styleReferenceUrl
            ? "\n\nStyle / voice reference: match the tone and cadence of {$styleReferenceUrl}."
            : '';

        return <<<PROMPT
Summit: {$summit->name}
Summit description: {$summit->description}

Speakers (use only these IDs):
{$speakersJson}
{$notesBlock}{$styleBlock}

Fill the template slots for this summit.
PROMPT;
    }

    /** Extract the first JSON object from a string that may have surrounding text. */
    private function extractJson(string $text): ?array
    {
        $text = trim($text);
        $first = strpos($text, '{');
        $last = strrpos($text, '}');
        if ($first === false || $last === false || $last <= $first) return null;

        $candidate = substr($text, $first, $last - $first + 1);
        $decoded = json_decode($candidate, true);
        return is_array($decoded) ? $decoded : null;
    }
}
```

- [ ] **Step 4: Run — expect pass**

Run: `./vendor/bin/pest tests/Unit/Services/Templates/TemplateFillerTest.php`
Expected: 4 tests PASS. If your Summit factory doesn't include a `description` field, adjust the factory or switch to `$summit->name` only in the prompt.

- [ ] **Step 5: Commit**

```bash
git add app/Services/Templates/TemplateFiller.php tests/Unit/Services/Templates/TemplateFillerTest.php
git commit -m "feat(templates): TemplateFiller with schema validation + retry"
```

---

## Task 14: GenerateLandingPageVersionJob

**Files:**
- Create: `app/Jobs/GenerateLandingPageVersionJob.php`
- Create: `tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php

use App\Jobs\GenerateLandingPageVersionJob;
use App\Models\{LandingPageBatch, LandingPageDraft, Speaker, Summit, Funnel};
use App\Services\Templates\TemplateFiller;

it('creates a draft with content from TemplateFiller', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $speaker = Speaker::factory()->for($summit)->create(['goes_live_at' => now()]);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) use ($summit) {
        $m->shouldReceive('fill')
            ->once()
            ->andReturn([
                'content' => ['summit' => ['name' => $summit->name], 'hero' => ['headline' => 'H']],
                'tokens' => 300,
            ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::first();
    expect($draft->template_key)->toBe('opus-v1');
    expect($draft->sections)->toBe(['summit' => ['name' => $summit->name], 'hero' => ['headline' => 'H']]);
    expect($draft->status)->toBe('ready');
    expect($draft->token_count)->toBe(300);
    expect($draft->version_number)->toBe(1);
});

it('marks draft as failed when filler throws', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andThrow(new \RuntimeException('oops'));
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::first();
    expect($draft->status)->toBe('failed');
    expect($draft->error_message)->toContain('oops');
});
```

- [ ] **Step 2: Run — expect failure**

Run: `./vendor/bin/pest tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php`
Expected: FAIL — class missing.

- [ ] **Step 3: Implement the job**

```php
<?php

namespace App\Jobs;

use App\Models\{LandingPageBatch, LandingPageDraft, Speaker};
use App\Services\Templates\TemplateFiller;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Str;

class GenerateLandingPageVersionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 180;

    public function __construct(
        public string $batchId,
        public string $templateKey,
        public int $versionNumber,
    ) {}

    public function handle(TemplateFiller $filler): void
    {
        $batch = LandingPageBatch::findOrFail($this->batchId);

        $draft = LandingPageDraft::create([
            'batch_id' => $batch->id,
            'version_number' => $this->versionNumber,
            'template_key' => $this->templateKey,
            'status' => 'generating',
            'preview_token' => Str::random(40),
        ]);

        $start = microtime(true);
        try {
            $summit = $batch->summit;
            $speakers = Speaker::query()
                ->where('summit_id', $summit->id)
                ->whereNotNull('goes_live_at')
                ->orderBy('goes_live_at')
                ->orderBy('sort_order')
                ->get();

            $result = $filler->fill(
                summit: $summit,
                templateKey: $this->templateKey,
                speakers: $speakers,
                notes: $batch->notes,
                styleReferenceUrl: $batch->style_reference_url,
            );

            $draft->update([
                'sections' => $result['content'],
                'token_count' => $result['tokens'],
                'generation_ms' => (int) ((microtime(true) - $start) * 1000),
                'status' => 'ready',
            ]);
        } catch (\Throwable $e) {
            $draft->update([
                'status' => 'failed',
                'error_message' => substr($e->getMessage(), 0, 500),
                'generation_ms' => (int) ((microtime(true) - $start) * 1000),
            ]);
            report($e);
        }
    }
}
```

- [ ] **Step 4: Run — expect pass**

Run: `./vendor/bin/pest tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Jobs/GenerateLandingPageVersionJob.php tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php
git commit -m "feat(jobs): GenerateLandingPageVersionJob"
```

---

## Task 15: GenerateLandingPageBatchJob

**Files:**
- Create: `app/Jobs/GenerateLandingPageBatchJob.php`
- Create: `tests/Feature/Jobs/GenerateLandingPageBatchJobTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php

use App\Jobs\{GenerateLandingPageBatchJob, GenerateLandingPageVersionJob};
use App\Models\{LandingPageBatch, Funnel, Summit};
use App\Services\Templates\TemplateSelector;
use Illuminate\Support\Facades\Queue;

it('selects N templates and dispatches a version job per template', function () {
    Queue::fake();

    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 3,
        'status' => 'queued',
        'template_pool' => ['opus-v1', 'opus-v2'],
    ]);

    $this->mock(TemplateSelector::class, function ($m) {
        $m->shouldReceive('pick')
            ->once()
            ->with(['opus-v1', 'opus-v2'], 3)
            ->andReturn(['opus-v1', 'opus-v2']);
    });

    GenerateLandingPageBatchJob::dispatchSync($batch->id);

    Queue::assertPushed(GenerateLandingPageVersionJob::class, 2);
    expect($batch->fresh()->status)->toBe('running');
});

it('marks the batch as failed when selector returns no keys', function () {
    Queue::fake();
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 3, 'status' => 'queued',
    ]);

    $this->mock(TemplateSelector::class, function ($m) {
        $m->shouldReceive('pick')->andReturn([]);
    });

    GenerateLandingPageBatchJob::dispatchSync($batch->id);
    expect($batch->fresh()->status)->toBe('failed');
});
```

- [ ] **Step 2: Run — expect failure**

Run: `./vendor/bin/pest tests/Feature/Jobs/GenerateLandingPageBatchJobTest.php`
Expected: FAIL.

- [ ] **Step 3: Implement**

```php
<?php

namespace App\Jobs;

use App\Models\LandingPageBatch;
use App\Services\Templates\TemplateSelector;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateLandingPageBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 60;

    public function __construct(public string $batchId) {}

    public function handle(TemplateSelector $selector): void
    {
        $batch = LandingPageBatch::findOrFail($this->batchId);
        $pool = (array) ($batch->template_pool ?? []);

        $keys = $selector->pick($pool, $batch->version_count);
        if (empty($keys)) {
            $batch->update(['status' => 'failed']);
            return;
        }

        $batch->update(['status' => 'running']);

        foreach ($keys as $i => $key) {
            GenerateLandingPageVersionJob::dispatch($batch->id, $key, $i + 1);
        }
    }
}
```

- [ ] **Step 4: Run — expect pass**

Run: `./vendor/bin/pest tests/Feature/Jobs/GenerateLandingPageBatchJobTest.php`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Jobs/GenerateLandingPageBatchJob.php tests/Feature/Jobs/GenerateLandingPageBatchJobTest.php
git commit -m "feat(jobs): GenerateLandingPageBatchJob dispatches version jobs"
```

---

## Task 16: API endpoint — published content

**Files:**
- Create: `app/Http/Controllers/Api/PublicFunnelController.php`
- Create: `tests/Feature/Http/PublicFunnelControllerTest.php`
- Create: `routes/api.php`

- [ ] **Step 1: Check if `routes/api.php` exists**

Run: `test -f routes/api.php && echo EXISTS || echo MISSING`
If MISSING: `touch routes/api.php` and register it in `bootstrap/app.php` under `withRouting`:

```php
->withRouting(
    web: __DIR__.'/../routes/web.php',
    api: __DIR__.'/../routes/api.php',
    commands: __DIR__.'/../routes/console.php',
)
```

- [ ] **Step 2: Write the failing test**

```php
<?php

use App\Models\{Funnel, FunnelStep, Summit};

it('returns the published page_content for an optin step', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => [
            'template_key' => 'opus-v1',
            'content' => ['summit' => ['name' => 'Test']],
        ],
    ]);

    $response = $this->getJson("/api/funnels/{$funnel->id}/published-content");

    $response->assertOk();
    $response->assertJsonPath('template_key', 'opus-v1');
    $response->assertJsonPath('content.summit.name', 'Test');
    $response->assertJsonStructure(['speakers']);
});

it('returns 404 when funnel has no optin step with content', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    $this->getJson("/api/funnels/{$funnel->id}/published-content")
        ->assertNotFound();
});
```

- [ ] **Step 3: Run — expect failure**

Run: `./vendor/bin/pest tests/Feature/Http/PublicFunnelControllerTest.php`
Expected: FAIL.

- [ ] **Step 4: Implement the controller**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Models\Funnel;
use App\Models\Speaker;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class PublicFunnelController extends Controller
{
    public function show(string $funnelId): JsonResponse
    {
        $funnel = Funnel::with(['steps' => fn ($q) => $q->where('step_type', 'optin')])
            ->findOrFail($funnelId);

        $step = $funnel->steps->first();
        $content = $step?->page_content ?? null;

        if (!$content || !isset($content['template_key'])) {
            return response()->json(['error' => 'no published content'], 404);
        }

        $speakers = Speaker::where('summit_id', $funnel->summit_id)->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'firstName' => $s->first_name,
                'lastName' => $s->last_name,
                'title' => $s->title,
                'shortBio' => $s->short_bio,
                'longBio' => $s->long_bio,
                'photoUrl' => $s->photo_url,
                'masterclassTitle' => $s->masterclass_title,
                'masterclassDescription' => $s->masterclass_description,
                'rating' => $s->rating,
                'goesLiveAt' => $s->goes_live_at?->toIso8601String(),
                'sortOrder' => $s->sort_order,
                'isFeatured' => $s->is_featured,
            ]);

        return response()->json([
            'template_key' => $content['template_key'],
            'content' => $content['content'] ?? [],
            'speakers' => $speakers,
        ]);
    }
}
```

- [ ] **Step 5: Register the route**

In `routes/api.php`:

```php
<?php

use App\Http\Controllers\Api\PublicFunnelController;
use Illuminate\Support\Facades\Route;

Route::get('/funnels/{funnelId}/published-content', [PublicFunnelController::class, 'show']);
```

- [ ] **Step 6: Run — expect pass**

Run: `./vendor/bin/pest tests/Feature/Http/PublicFunnelControllerTest.php`
Expected: 2 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add app/Http/Controllers/Api/PublicFunnelController.php routes/api.php tests/Feature/Http/PublicFunnelControllerTest.php bootstrap/app.php
git commit -m "feat(api): GET /api/funnels/{id}/published-content"
```

---

## Task 17: API endpoint — draft preview

**Files:**
- Create: `app/Http/Controllers/Api/LandingPageDraftController.php`
- Modify: `routes/api.php`
- Create: `tests/Feature/Http/LandingPageDraftControllerTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php

use App\Models\{LandingPageBatch, LandingPageDraft, Summit, Funnel};

it('returns draft content by preview token', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1',
        'sections' => ['summit' => ['name' => 'Preview']],
        'status' => 'ready',
        'preview_token' => 'tok-abc-123',
    ]);

    $response = $this->getJson("/api/landing-page-drafts/tok-abc-123");

    $response->assertOk();
    $response->assertJsonPath('template_key', 'opus-v1');
    $response->assertJsonPath('content.summit.name', 'Preview');
    $response->assertJsonStructure(['speakers']);
});

it('returns 404 for unknown preview token', function () {
    $this->getJson('/api/landing-page-drafts/nope')->assertNotFound();
});
```

- [ ] **Step 2: Run — expect failure**

Run: `./vendor/bin/pest tests/Feature/Http/LandingPageDraftControllerTest.php`
Expected: FAIL.

- [ ] **Step 3: Implement**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Models\{LandingPageDraft, Speaker};
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class LandingPageDraftController extends Controller
{
    public function showByToken(string $token): JsonResponse
    {
        $draft = LandingPageDraft::with('batch')->where('preview_token', $token)->firstOrFail();

        $summitId = $draft->batch->summit_id;
        $speakers = Speaker::where('summit_id', $summitId)->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'firstName' => $s->first_name,
                'lastName' => $s->last_name,
                'title' => $s->title,
                'shortBio' => $s->short_bio,
                'longBio' => $s->long_bio,
                'photoUrl' => $s->photo_url,
                'masterclassTitle' => $s->masterclass_title,
                'masterclassDescription' => $s->masterclass_description,
                'rating' => $s->rating,
                'goesLiveAt' => $s->goes_live_at?->toIso8601String(),
                'sortOrder' => $s->sort_order,
                'isFeatured' => $s->is_featured,
            ]);

        return response()->json([
            'template_key' => $draft->template_key,
            'content' => $draft->sections ?? [],
            'speakers' => $speakers,
            'status' => $draft->status,
        ]);
    }
}
```

Register in `routes/api.php`:

```php
use App\Http\Controllers\Api\LandingPageDraftController;
Route::get('/landing-page-drafts/{token}', [LandingPageDraftController::class, 'showByToken']);
```

- [ ] **Step 4: Run — expect pass**

Run: `./vendor/bin/pest tests/Feature/Http/LandingPageDraftControllerTest.php`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/Api/LandingPageDraftController.php routes/api.php tests/Feature/Http/LandingPageDraftControllerTest.php
git commit -m "feat(api): GET /api/landing-page-drafts/{token}"
```

---

## Task 18: Next.js API client

**Files:**
- Create: `next-app/src/lib/api/laravel.ts`

- [ ] **Step 1: Add env var**

In `next-app/.env.local` (gitignored):

```
LARAVEL_API_URL=http://localhost:8000
```

- [ ] **Step 2: Create the client**

```ts
// next-app/src/lib/api/laravel.ts
import type { PublishedContent, Speaker } from '@/templates/types';

const BASE = process.env.LARAVEL_API_URL ?? 'http://localhost:8000';

export interface DraftPayload extends PublishedContent {
  speakers: Speaker[];
  status: string;
}

export interface PublicPayload extends PublishedContent {
  speakers: Speaker[];
}

export async function fetchDraft(token: string): Promise<DraftPayload | null> {
  const res = await fetch(`${BASE}/api/landing-page-drafts/${encodeURIComponent(token)}`, {
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Draft fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchPublished(funnelId: string): Promise<PublicPayload | null> {
  const res = await fetch(`${BASE}/api/funnels/${encodeURIComponent(funnelId)}/published-content`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Published fetch failed: ${res.status}`);
  return res.json();
}

export function speakersById(speakers: Speaker[]): Record<string, Speaker> {
  return Object.fromEntries(speakers.map((s) => [s.id, s]));
}
```

- [ ] **Step 3: Commit**

```bash
git add next-app/src/lib/api/laravel.ts next-app/.env.local.example 2>/dev/null || git add next-app/src/lib/api/laravel.ts
git commit -m "feat(next): Laravel API client for drafts + published content"
```

---

## Task 19: Preview route

**Files:**
- Create: `next-app/src/app/preview/[token]/page.tsx`

- [ ] **Step 1: Create the route**

```tsx
// next-app/src/app/preview/[token]/page.tsx
import { notFound } from 'next/navigation';
import { fetchDraft, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';

export const dynamic = 'force-dynamic';

export default async function PreviewPage({
  params,
}: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const draft = await fetchDraft(token);
  if (!draft) notFound();

  const template = getTemplate(draft.template_key);
  if (!template) {
    return <div>Template "{draft.template_key}" no longer exists. Generate a new draft.</div>;
  }

  const parsed = template.schema.safeParse(draft.content);
  if (!parsed.success) {
    return (
      <div>
        <h1>Schema validation failed</h1>
        <pre>{JSON.stringify(parsed.error.issues, null, 2)}</pre>
      </div>
    );
  }

  const speakers = speakersById(draft.speakers);
  const Component = template.Component;
  return <Component content={parsed.data} speakers={speakers} />;
}
```

- [ ] **Step 2: Smoke test**

Run a full end-to-end smoke with a seeded draft:

```bash
cd next-app && pnpm dev
# In another shell:
php artisan tinker --execute='
  $summit = \App\Models\Summit::first() ?? \App\Models\Summit::factory()->create();
  $funnel = \App\Models\Funnel::first() ?? \App\Models\Funnel::factory()->for($summit)->create();
  $batch = \App\Models\LandingPageBatch::create([
    "summit_id" => $summit->id, "funnel_id" => $funnel->id,
    "version_count" => 1, "status" => "running",
  ]);
  $fixture = json_decode(file_get_contents(base_path("next-app/src/templates/__fixtures__/opus-v1.fixture.ts")), true)
    ?? ["summit"=>["name"=>"Test","tagline"=>"T","startDate"=>"2026-04-22","endDate"=>"2026-04-26","timezone"=>"America/New_York"]];   // fallback
  $draft = \App\Models\LandingPageDraft::create([
    "batch_id" => $batch->id, "version_number" => 1,
    "template_key" => "opus-v1",
    "sections" => [],   // use your own valid fixture or run a full generate
    "status" => "ready",
    "preview_token" => "manual-test-token",
  ]);
  echo "http://localhost:3000/preview/manual-test-token";
'
```

Note: for real content you'll need a valid fixture that matches `OpusV1Schema`. The TS fixture file isn't JSON-parseable from PHP, so either hand-craft the payload in tinker or wait until the full pipeline runs in Task 24.

Expected: visiting the URL renders the template. If `sections` is empty the schema validation error will show — that's fine at this stage, it proves the route plumbing works.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/app/preview/\[token\]/page.tsx
git commit -m "feat(next): /preview/[token] route renders drafts via registry"
```

---

## Task 20: Public optin route

**Files:**
- Create: `next-app/src/app/f/[funnel]/optin/page.tsx`

- [ ] **Step 1: Create the route**

```tsx
// next-app/src/app/f/[funnel]/optin/page.tsx
import { notFound } from 'next/navigation';
import { fetchPublished, speakersById } from '@/lib/api/laravel';
import { getTemplate } from '@/templates/registry';

export const revalidate = 60;

export default async function OptinPage({
  params,
}: { params: Promise<{ funnel: string }> }) {
  const { funnel } = await params;
  const published = await fetchPublished(funnel);
  if (!published) notFound();

  const template = getTemplate(published.template_key);
  if (!template) notFound();

  const parsed = template.schema.safeParse(published.content);
  if (!parsed.success) notFound();

  const Component = template.Component;
  return <Component content={parsed.data} speakers={speakersById(published.speakers)} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add next-app/src/app/f/\[funnel\]/optin/page.tsx
git commit -m "feat(next): public /f/[funnel]/optin route renders published content"
```

---

## Task 21: Filament GenerateLandingPagesPage

**Files:**
- Create: `app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php`
- Create: `tests/Feature/Filament/GenerateLandingPagesPageTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php

use App\Filament\Resources\Funnels\FunnelResource;
use App\Filament\Resources\Funnels\Pages\GenerateLandingPagesPage;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\{Funnel, Summit, User};
use Illuminate\Support\Facades\Queue;

use function Pest\Livewire\livewire;

beforeEach(function () {
    $this->actingAs(User::factory()->create());
});

it('renders the generate form', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    livewire(GenerateLandingPagesPage::class, ['record' => $funnel->id])
        ->assertSuccessful()
        ->assertFormFieldExists('version_count')
        ->assertFormFieldExists('template_pool')
        ->assertFormFieldExists('notes')
        ->assertFormFieldExists('style_reference_url');
});

it('creates a batch and dispatches the job on submit', function () {
    Queue::fake();
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();

    livewire(GenerateLandingPagesPage::class, ['record' => $funnel->id])
        ->fillForm([
            'version_count' => 2,
            'template_pool' => ['opus-v1', 'opus-v2'],
            'notes' => 'Urgent, mention free bonuses',
            'style_reference_url' => 'https://parenting-summits.com',
        ])
        ->call('submit')
        ->assertHasNoFormErrors();

    Queue::assertPushed(GenerateLandingPageBatchJob::class);
    expect(\App\Models\LandingPageBatch::count())->toBe(1);
});
```

- [ ] **Step 2: Run — expect failure**

Run: `./vendor/bin/pest tests/Feature/Filament/GenerateLandingPagesPageTest.php`
Expected: FAIL.

- [ ] **Step 3: Implement the page**

```php
<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Jobs\GenerateLandingPageBatchJob;
use App\Models\{Funnel, LandingPageBatch};
use App\Services\Templates\TemplateRegistry;
use Filament\Forms\Components\{TextInput, Textarea, Select};
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Form;
use Filament\Resources\Pages\Page;
use Filament\Schemas\Schema;
use Filament\Actions\Action;

class GenerateLandingPagesPage extends Page
{
    protected static string $resource = FunnelResource::class;
    protected string $view = 'filament.pages.generate-landing-pages';
    protected static ?string $title = 'Generate Landing Pages';

    public Funnel $funnel;
    public ?array $data = [];

    public function mount(string $record): void
    {
        $this->funnel = Funnel::findOrFail($record);
        $this->form->fill([
            'version_count' => 3,
            'template_pool' => [],
        ]);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('version_count')
                    ->label('Number of Variants')
                    ->numeric()->integer()->minValue(1)->maxValue(5)
                    ->required()->default(3),
                Select::make('template_pool')
                    ->label('Template Pool')
                    ->multiple()
                    ->options(function (TemplateRegistry $registry) {
                        return collect($registry->allKeys())
                            ->mapWithKeys(fn ($k) => [$k => $registry->get($k)['label']])
                            ->all();
                    })
                    ->helperText('Leave empty to use all templates.'),
                Textarea::make('notes')
                    ->label('Creative Notes')
                    ->rows(3)
                    ->placeholder('E.g. "Mention the free gifts, urgent tone, 5-day summit"'),
                TextInput::make('style_reference_url')
                    ->label('Style / Voice Reference URL')
                    ->url()
                    ->placeholder('https://parenting-summits.com'),
            ])
            ->statePath('data');
    }

    public function submit(): void
    {
        $data = $this->form->getState();

        $batch = LandingPageBatch::create([
            'summit_id' => $this->funnel->summit_id,
            'funnel_id' => $this->funnel->id,
            'version_count' => (int) $data['version_count'],
            'template_pool' => $data['template_pool'] ?: null,
            'notes' => $data['notes'] ?? null,
            'style_reference_url' => $data['style_reference_url'] ?? null,
            'status' => 'queued',
        ]);

        GenerateLandingPageBatchJob::dispatch($batch->id);

        $this->redirect(LandingPageDraftsPage::getUrl([
            'record' => $this->funnel->id,
            'batch' => $batch->id,
        ]));
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('submit')->label('Start Generation')->submit('submit'),
        ];
    }
}
```

Create the blade view `resources/views/filament/pages/generate-landing-pages.blade.php`:

```blade
<x-filament-panels::page>
    <form wire:submit="submit">
        {{ $this->form }}
    </form>
</x-filament-panels::page>
```

- [ ] **Step 4: Run — expect pass**

Run: `./vendor/bin/pest tests/Feature/Filament/GenerateLandingPagesPageTest.php`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Filament/Resources/Funnels/Pages/GenerateLandingPagesPage.php resources/views/filament/pages/generate-landing-pages.blade.php tests/Feature/Filament/GenerateLandingPagesPageTest.php
git commit -m "feat(filament): GenerateLandingPagesPage with form + job dispatch"
```

---

## Task 22: Filament LandingPageDraftsPage (card grid)

**Files:**
- Create: `app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php`
- Create: `resources/views/filament/pages/landing-page-drafts.blade.php`

- [ ] **Step 1: Implement the page**

```php
<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\{Funnel, LandingPageDraft};
use App\Services\Templates\TemplateRegistry;
use Filament\Resources\Pages\Page;

class LandingPageDraftsPage extends Page
{
    protected static string $resource = FunnelResource::class;
    protected string $view = 'filament.pages.landing-page-drafts';
    protected static ?string $title = 'Landing Pages';

    public Funnel $funnel;
    public ?string $batch = null;

    public function mount(string $record, ?string $batch = null): void
    {
        $this->funnel = Funnel::findOrFail($record);
        $this->batch = $batch;
    }

    public function getDraftsProperty()
    {
        return LandingPageDraft::query()
            ->whereHas('batch', fn ($q) => $q->where('funnel_id', $this->funnel->id))
            ->when($this->batch, fn ($q) => $q->where('batch_id', $this->batch))
            ->whereNotIn('status', ['rejected', 'archived'])
            ->orderByDesc('created_at')
            ->get();
    }

    public function getRegistryProperty(): TemplateRegistry
    {
        return app(TemplateRegistry::class);
    }

    public function approve(string $draftId): void
    {
        LandingPageDraft::findOrFail($draftId)->update(['status' => 'shortlisted']);
    }

    public function reject(string $draftId): void
    {
        LandingPageDraft::findOrFail($draftId)->update(['status' => 'rejected']);
    }

    public function publish(string $draftId): void
    {
        app(\App\Services\Templates\PublishDraftService::class)
            ->publish(LandingPageDraft::findOrFail($draftId), auth()->user());
    }

    protected function getPollingInterval(): ?string
    {
        $hasPending = $this->drafts->whereIn('status', ['queued', 'generating'])->isNotEmpty();
        return $hasPending ? '3s' : null;
    }
}
```

- [ ] **Step 2: Blade view with card grid**

Create `resources/views/filament/pages/landing-page-drafts.blade.php`:

```blade
<x-filament-panels::page>
    <div wire:poll.{{ $this->getPollingInterval() ?? '0s' }}>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @foreach($this->drafts as $draft)
                @php
                    $template = $this->registry->exists($draft->template_key)
                        ? $this->registry->get($draft->template_key)
                        : null;
                @endphp
                <div class="border rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                    @if($template && $draft->status === 'ready')
                        <img src="{{ env('LARAVEL_NEXT_URL','http://localhost:3000') }}{{ $template['thumbnail'] }}"
                             alt="{{ $template['label'] }}"
                             class="w-full h-48 object-cover" />
                    @else
                        <div class="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                            @if(in_array($draft->status, ['queued','generating']))
                                <span>Generating…</span>
                            @elseif($draft->status === 'failed')
                                <span class="text-rose-600">Failed</span>
                            @endif
                        </div>
                    @endif

                    <div class="p-4">
                        <div class="flex items-center justify-between">
                            <h3 class="font-semibold">{{ $template['label'] ?? $draft->template_key }}</h3>
                            <span class="text-xs uppercase tracking-wider
                                @switch($draft->status)
                                    @case('ready') text-sky-600 @break
                                    @case('shortlisted') text-emerald-600 @break
                                    @case('published') text-indigo-600 @break
                                    @case('failed') text-rose-600 @break
                                    @default text-gray-500
                                @endswitch">
                                {{ $draft->status }}
                            </span>
                        </div>

                        @if($draft->status === 'failed' && $draft->error_message)
                            <p class="mt-2 text-sm text-rose-600">{{ $draft->error_message }}</p>
                        @endif

                        <div class="mt-4 flex gap-2 flex-wrap">
                            @if(in_array($draft->status, ['ready', 'shortlisted']))
                                <a href="{{ env('LARAVEL_NEXT_URL','http://localhost:3000') }}/preview/{{ $draft->preview_token }}"
                                   target="_blank"
                                   class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">Preview</a>

                                @if($draft->status === 'ready')
                                    <button wire:click="approve('{{ $draft->id }}')"
                                            class="px-3 py-1 text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded">Approve</button>
                                @endif

                                <button wire:click="publish('{{ $draft->id }}')"
                                        wire:confirm="This will replace the currently live landing page. Continue?"
                                        class="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded">Publish</button>

                                <button wire:click="reject('{{ $draft->id }}')"
                                        wire:confirm="Hide this draft?"
                                        class="px-3 py-1 text-sm bg-rose-100 hover:bg-rose-200 text-rose-800 rounded">Reject</button>
                            @endif
                        </div>
                    </div>
                </div>
            @endforeach

            @if($this->drafts->isEmpty())
                <div class="col-span-3 text-center py-16 text-gray-500">
                    No drafts yet. Click "Generate Landing Pages" on the funnel to create some.
                </div>
            @endif
        </div>
    </div>
</x-filament-panels::page>
```

- [ ] **Step 3: Commit**

```bash
git add app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php resources/views/filament/pages/landing-page-drafts.blade.php
git commit -m "feat(filament): LandingPageDraftsPage card grid with approve/reject/publish"
```

---

## Task 23: PublishDraftService

**Files:**
- Create: `app/Services/Templates/PublishDraftService.php`
- Create: `tests/Feature/Services/PublishDraftServiceTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php

use App\Models\{FunnelStep, FunnelStepRevision, LandingPageBatch, LandingPageDraft, Summit, Funnel, User};
use App\Services\Templates\PublishDraftService;

it('writes template_key + content to the optin step and snapshots the previous content', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'page_content' => ['template_key' => 'old', 'content' => ['a' => 1]],
    ]);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1',
        'sections' => ['summit' => ['name' => 'New']],
        'status' => 'ready',
        'preview_token' => 'tok',
    ]);
    $user = User::factory()->create();

    app(PublishDraftService::class)->publish($draft, $user);

    $step->refresh();
    expect($step->page_content)->toBe([
        'template_key' => 'opus-v1',
        'content' => ['summit' => ['name' => 'New']],
    ]);

    expect(FunnelStepRevision::count())->toBe(1);
    $rev = FunnelStepRevision::first();
    expect($rev->page_content_snapshot)->toBe(['template_key' => 'old', 'content' => ['a' => 1]]);
    expect($rev->published_by)->toBe($user->id);

    expect($draft->fresh()->status)->toBe('published');
});

it('archives previously-published drafts for the same funnel', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $step = FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin', 'page_content' => []]);
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 2, 'status' => 'running',
    ]);
    $old = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1, 'template_key' => 'opus-v1',
        'sections' => [], 'status' => 'published', 'preview_token' => 't1',
    ]);
    $new = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 2, 'template_key' => 'opus-v2',
        'sections' => [], 'status' => 'ready', 'preview_token' => 't2',
    ]);

    app(PublishDraftService::class)->publish($new, User::factory()->create());

    expect($old->fresh()->status)->toBe('archived');
    expect($new->fresh()->status)->toBe('published');
});
```

- [ ] **Step 2: Run — expect failure**

Run: `./vendor/bin/pest tests/Feature/Services/PublishDraftServiceTest.php`
Expected: FAIL.

- [ ] **Step 3: Implement**

```php
<?php

namespace App\Services\Templates;

use App\Models\{FunnelStep, FunnelStepRevision, LandingPageDraft, User};
use Illuminate\Support\Facades\DB;

class PublishDraftService
{
    public function publish(LandingPageDraft $draft, User $user): void
    {
        DB::transaction(function () use ($draft, $user) {
            $batch = $draft->batch;
            $step = FunnelStep::where('funnel_id', $batch->funnel_id)
                ->where('step_type', 'optin')
                ->firstOrFail();

            // Snapshot previous
            if (!empty($step->page_content)) {
                FunnelStepRevision::create([
                    'funnel_step_id' => $step->id,
                    'page_content_snapshot' => $step->page_content,
                    'published_at' => now(),
                    'published_by' => $user->id,
                ]);
            }

            // Write new
            $step->update([
                'page_content' => [
                    'template_key' => $draft->template_key,
                    'content' => $draft->sections,
                ],
            ]);

            // Archive previously-published drafts for this funnel
            LandingPageDraft::query()
                ->whereHas('batch', fn ($q) => $q->where('funnel_id', $batch->funnel_id))
                ->where('status', 'published')
                ->where('id', '!=', $draft->id)
                ->update(['status' => 'archived']);

            $draft->update(['status' => 'published']);
        });
    }
}
```

- [ ] **Step 4: Run — expect pass**

Run: `./vendor/bin/pest tests/Feature/Services/PublishDraftServiceTest.php`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Services/Templates/PublishDraftService.php tests/Feature/Services/PublishDraftServiceTest.php
git commit -m "feat(templates): PublishDraftService with snapshot + archive"
```

---

## Task 24: Wire pages into FunnelResource

**Files:**
- Modify: `app/Filament/Resources/Funnels/FunnelResource.php`

- [ ] **Step 1: Read the current resource**

Read `app/Filament/Resources/Funnels/FunnelResource.php` to see where pages are registered and which actions the View page has.

- [ ] **Step 2: Register the new pages**

Find `public static function getPages(): array` and add:

```php
public static function getPages(): array
{
    return [
        'index' => \App\Filament\Resources\Funnels\Pages\ListFunnels::route('/'),
        'create' => \App\Filament\Resources\Funnels\Pages\CreateFunnel::route('/create'),
        'view' => \App\Filament\Resources\Funnels\Pages\ViewFunnel::route('/{record}'),
        'edit' => \App\Filament\Resources\Funnels\Pages\EditFunnel::route('/{record}/edit'),
        // NEW:
        'generate-landing-pages' => \App\Filament\Resources\Funnels\Pages\GenerateLandingPagesPage::route('/{record}/generate-landing-pages'),
        'landing-pages' => \App\Filament\Resources\Funnels\Pages\LandingPageDraftsPage::route('/{record}/landing-pages'),
    ];
}
```

- [ ] **Step 3: Add header action to ViewFunnel page**

Open `app/Filament/Resources/Funnels/Pages/ViewFunnel.php`. Add two header actions:

```php
protected function getHeaderActions(): array
{
    return [
        \Filament\Actions\Action::make('generateLandingPages')
            ->label('Generate Landing Pages')
            ->icon('heroicon-o-sparkles')
            ->color('primary')
            ->url(fn () => \App\Filament\Resources\Funnels\Pages\GenerateLandingPagesPage::getUrl(['record' => $this->record])),

        \Filament\Actions\Action::make('viewLandingPages')
            ->label('View Landing Pages')
            ->icon('heroicon-o-squares-2x2')
            ->color('gray')
            ->url(fn () => \App\Filament\Resources\Funnels\Pages\LandingPageDraftsPage::getUrl(['record' => $this->record])),

        \Filament\Actions\EditAction::make(),
    ];
}
```

- [ ] **Step 4: Smoke test**

Run: `php artisan test --filter=GenerateLandingPagesPage`
Expected: existing tests still pass.

Also run the existing Filament livewire render tests (if any for Funnels) to confirm no regression:

Run: `php artisan test --filter=Funnel`

- [ ] **Step 5: Commit**

```bash
git add app/Filament/Resources/Funnels/FunnelResource.php app/Filament/Resources/Funnels/Pages/ViewFunnel.php
git commit -m "feat(filament): wire GenerateLandingPagesPage + LandingPageDraftsPage into Funnel resource"
```

---

## Task 25: End-to-end integration test

**Files:**
- Create: `tests/Feature/LandingPageGenerationE2ETest.php`

- [ ] **Step 1: Write the test**

This test exercises the full pipeline with Anthropic mocked. It proves batch → version jobs → draft → publish → live page works together.

```php
<?php

use App\Jobs\{GenerateLandingPageBatchJob, GenerateLandingPageVersionJob};
use App\Models\{Funnel, FunnelStep, LandingPageBatch, LandingPageDraft, Speaker, Summit, User};
use App\Services\Anthropic\AnthropicClient;
use App\Services\Templates\{PublishDraftService, TemplateRegistry};

it('runs the full generate → approve → publish flow', function () {
    // Registry fake — override only for this test
    $this->mock(TemplateRegistry::class, function ($m) {
        $m->shouldReceive('allKeys')->andReturn(['opus-v1']);
        $m->shouldReceive('exists')->with('opus-v1')->andReturn(true);
        $m->shouldReceive('get')->with('opus-v1')->andReturn([
            'key' => 'opus-v1',
            'label' => 'Editorial',
            'thumbnail' => '/template-thumbs/opus-v1.jpg',
            'tags' => ['editorial'],
            'jsonSchema' => [
                'type' => 'object',
                'required' => ['summit'],
                'properties' => [
                    'summit' => [
                        'type' => 'object', 'required' => ['name'],
                        'properties' => ['name' => ['type' => 'string', 'minLength' => 1]],
                    ],
                ],
            ],
        ]);
    });

    // Anthropic mock — returns a valid JSON payload
    $this->mock(AnthropicClient::class, function ($m) {
        $m->shouldReceive('complete')
            ->andReturn([
                'text' => '{"summit":{"name":"Integration Summit"}}',
                'tokens' => 250,
            ]);
    });

    // Setup
    $summit = Summit::factory()->create(['name' => 'Integration Summit']);
    $funnel = Funnel::factory()->for($summit)->create();
    FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin', 'page_content' => []]);
    Speaker::factory()->for($summit)->create(['goes_live_at' => now()]);
    $user = User::factory()->create();

    // Kick off generation
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id,
        'funnel_id' => $funnel->id,
        'version_count' => 1,
        'template_pool' => ['opus-v1'],
        'status' => 'queued',
    ]);

    GenerateLandingPageBatchJob::dispatchSync($batch->id);

    $draft = LandingPageDraft::where('batch_id', $batch->id)->firstOrFail();
    expect($draft->status)->toBe('ready');
    expect($draft->template_key)->toBe('opus-v1');
    expect($draft->sections)->toBe(['summit' => ['name' => 'Integration Summit']]);

    // Approve + publish
    $draft->update(['status' => 'shortlisted']);
    app(PublishDraftService::class)->publish($draft, $user);

    // Verify live
    $response = $this->getJson("/api/funnels/{$funnel->id}/published-content");
    $response->assertOk();
    $response->assertJsonPath('template_key', 'opus-v1');
    $response->assertJsonPath('content.summit.name', 'Integration Summit');
});
```

- [ ] **Step 2: Run — expect pass**

Run: `./vendor/bin/pest tests/Feature/LandingPageGenerationE2ETest.php`
Expected: 1 test PASS.

- [ ] **Step 3: Run the full suite**

Run: `php artisan test`
Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/Feature/LandingPageGenerationE2ETest.php
git commit -m "test: end-to-end landing page generation + publish flow"
```

---

## Manual smoke test (do after Task 25)

1. `php artisan queue:work` in one terminal (or use `composer dev` for all-in-one).
2. `cd next-app && pnpm dev` in another terminal.
3. Visit `http://localhost:8000/admin`, log in, open a Funnel (create one if needed), click "Generate Landing Pages".
4. Fill variant count = 2, leave pool empty, add notes, submit.
5. You're redirected to the Landing Pages card grid. Cards poll every 3s.
6. When a card shows "ready", click "Preview" — it opens `http://localhost:3000/preview/{token}` and renders.
7. Click "Approve" → card becomes shortlisted.
8. Click "Publish" → confirms, page refreshes, card shows "published".
9. Visit `http://localhost:3000/f/{funnel-id}/optin` — the published template renders.

Record any issues; they become tasks in the next plan iteration.

---

## Self-Review Notes

**Spec coverage check:**

| Spec section | Covered by task(s) |
|---|---|
| Architecture: template component | T6, T7 |
| Architecture: slot schema | T5, T7 |
| Architecture: registry | T8 |
| Architecture: TemplateFiller | T13 |
| Architecture: Generate action on Funnel | T21, T24 |
| Architecture: draft storage | T1, T3 |
| Architecture: card grid review UI | T22 |
| Architecture: public API endpoint | T16 |
| Architecture: public renderer | T20 |
| Template slot schema pattern | T5 |
| Registry shape | T8 |
| Generate data flow | T14, T15, T21 |
| Review data flow | T22 |
| Publish data flow | T23 |
| Public render data flow | T16, T20 |
| Edit data flow (phase 1.5) | DEFERRED (out of scope for this plan) |
| State transitions | T14, T22, T23 |
| Speaker resolution | T14 (query), T16/T17 (serialization), T6 (template usage) |
| Error handling: API timeout | T10 (client throws), T13 (retry), T14 (caught → failed draft) |
| Error handling: malformed JSON | T13 (retry), T14 |
| Error handling: schema-valid placeholder | Partially — T13 validates non-empty via schema `minLength`, no explicit lint pass yet. **Added to Phase 1.5 backlog.** |
| Error handling: no speakers | **Added to form validation in T21** — but current form doesn't block empty speakers. Plan iteration: add `->beforeSubmit()` check. Flagging now; covered by manual test. |
| Error handling: worker crash watchdog | **Missing from this plan.** Add as task in Phase 1.5 (`app/Console/Commands/MarkStuckDraftsFailed.php` + schedule). |
| Schema delta | T1, T2 |
| New FunnelStepRevision table | T2, T3 |
| Filament wiring | T21, T22, T24 |
| Unit tests: schema per template | T5, T7 |
| Unit tests: registry integrity | T8 |
| Unit tests: TemplateFiller | T13 |
| Unit tests: speaker day-grouping | Covered implicitly in T14 (speaker query ordered by `goes_live_at` + `sort_order`); no separate test yet. Grouping by-date happens in the AI prompt, not in PHP — validated by the fixture passing. |
| Integration tests | T25 |

**Gaps flagged for Phase 1.5 plan:**
- Placeholder-content lint pass in TemplateFiller
- Speaker-count validation in Generate form
- Stuck-draft watchdog scheduled command
- Edit page (Zod → Filament mapper)
- Remaining 6 templates
- Inline field editing UX

**Placeholder scan:** No "TBD", "TODO", or "implement later" in code blocks. One place in T7 (`tags: []`) has a prompt to "fill in once the design is inspected" — this is a judgment call during porting, not a code placeholder.

**Type consistency check:**
- `LandingPageDraft` uses `sections` (reused column) throughout (T3, T14, T23, T25). Consistent.
- `PublishedContent.content` is `unknown` in types, validated at render by the template's `schema` — same pattern in T4, T19, T20. Consistent.
- `LandingPageBatch.template_pool` is array cast — consistent across T3, T15, T21.
- `TemplateFiller::fill` signature matches between T13 (definition), T14 (usage), and T25 (integration test mock).
- `PublishDraftService::publish(LandingPageDraft, User)` signature consistent in T23 and T25.

---

**Plan complete.**

Save location: `docs/superpowers/plans/2026-04-17-landing-page-template-generator.md`
Spec source: `docs/superpowers/specs/2026-04-17-landing-page-template-generator-design.md` (commit `6507dfa`)
