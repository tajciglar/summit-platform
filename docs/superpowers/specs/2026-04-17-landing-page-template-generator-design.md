# Landing Page Template Generator — Design

**Date:** 2026-04-17
**Status:** Approved design, V2 rebuild complete — ready for implementation plan
**Supersedes:** 2026-04-16-landing-page-generation-v3-design.md (AI block-composition pipeline, now fully deleted in V2 rebuild)

## Revision 1 (2026-04-17, after V2 rebuild)

Parallel V2 rebuild deleted all of `app/Services/`, `app/Jobs/`, customer-facing controllers, and the entire `FunnelGenerator` AI pipeline. `LandingPageBatch` + `LandingPageDraft` models and migrations survived. Speaker schema simplified (no pivot, `Speaker.summit_id` direct, `goes_live_at` datetime replaces `presentation_day`). Filament pattern is dedicated pages only — no modals, no slideovers, all actions navigate via `->url(...)`. This revision updates "Reuse vs new", "Schema delta", "Speaker resolution", "Filament wiring", and "Prerequisites" sections to match. Design itself unchanged.

---

## One-line summary

Convert hand-designed HTML templates in `next-app/public/` into React components with typed content slots; AI fills the slots with summit-specific copy; operators pick the winning variant from a card grid and publish it to a funnel step.

## Goal

One-click landing page generation in Filament that produces visually high-quality, on-brand pages fast, with meaningful variants for the operator to choose from. Eliminate the AI-designs-JSX-from-scratch pipeline that produced inconsistent output.

## Non-goals (for this launch)

- Cross-template section mixing (deferred — revisit if operator demand materializes)
- AI copy regeneration (deferred — scaffolding allows future injection from Claude Coworker / Google Docs / external sources)
- Per-section layout swap (deferred — single-template-per-page at launch)
- Sales, checkout, thank-you page generation (same pattern will apply later; this spec only covers landing/optin)
- A/B traffic splitting on publish
- Visual regression testing (manual sign-off for launch)

## Context

Prior attempts used a 3-phase AI pipeline (`ArchitectPhase` → `CopywriterPhase` → `BlockDesignPhase`) that wrote JSX from scratch. Output quality was inconsistent — layouts drifted, colors hard-coded in `design-system.ts` overrode style briefs, and no screenshot-driven generation produced shippable results. Session handoff `docs/session-handoff-2026-04-16.md` concluded: *"Golden template approach is the only path to pixel-perfect."*

Eight hand-designed HTML templates now exist in `next-app/public/`: `opus-v1..v4`, `variant-1..3`, `adhd-summit`. Each is ~15 sections, uses Tailwind CDN, and is visually cohesive. Templates are **layouts that work**; the problem is turning them into a generation pipeline.

## Public rendering architecture decision

**Public pages are rendered by Next.js; Laravel becomes admin (Filament) + API only.** Inertia removal is a parallel migration tracked elsewhere. This spec assumes: a public visitor hits the funnel domain, Next.js fetches `GET /api/funnel/{domain}/optin` from Laravel, receives `{ template_key, content, speakers[] }`, and renders via the template registry.

---

## Architecture

### Units

1. **Template component** — `next-app/src/templates/OpusV1.tsx`, etc. Full-page React component, imports summit data from props, all colors/fonts baked in. 8 templates at launch.
2. **Template slot schema** — Zod schema per template (`opus-v1.schema.ts`). Defines content the template consumes: `{ hero: {...}, speakersByDay: [...], faqs: [...] }`. One file drives AI fill, Filament edit form, and runtime validation.
3. **Template registry** — `next-app/src/templates/registry.ts` maps `template_key` → `{ Component, schema, label, thumbnail, tags }`. Single source of truth; drift-proof.
4. **TemplateFiller service** — Laravel service. One Anthropic call per variant, schema serialized into system prompt, output validated against schema, retry once on validation failure.
5. **Generate Filament action** — attached to Funnel resource. Creates `LandingPageBatch`, dispatches N `GenerateLandingPageVersionJob`.
6. **Draft storage** — existing `LandingPageDraft` model, two new columns (`template_key`, `status` enum values).
7. **Review UI** — Filament card-grid page on the Funnel resource. Each card: template thumbnail, label, status badge, actions (Preview / Approve / Reject / Edit / Publish).
8. **Edit UI** (phase 1.5) — Filament form auto-generated from the draft's template schema via a Zod → Filament mapper.
9. **Public API endpoint** — `GET /api/funnel/{domain}/optin` returns published step's `{ template_key, content, speakers[] }`.
10. **Public renderer** — Next.js route, looks up template in registry, renders with content + speakers joined at render time.

### Dependency graph

```
┌────────────────────────────────────────────────────────────────┐
│  registry.ts  (key → Component, schema, label, thumbnail)      │
│       ▲                ▲                    ▲                  │
│       │                │                    │                  │
│  TemplateFiller   Zod→Filament form    Public renderer         │
│  (AI fills)       (admin edits)         (visitor renders)      │
└────────────────────────────────────────────────────────────────┘
```

Registry is source of truth. AI, admin form, and renderer all read the same schema. Schema evolves → all three update together.

### Reuse vs new

**Reuse (already present in V2):**
- `landing_page_batches` + `landing_page_drafts` tables (schema delta below)
- `LandingPageBatch` + `LandingPageDraft` Eloquent models (minor field additions)
- `preview_token` generation on draft create
- `funnel_steps.page_content` JSONB column as the publish target
- Queue infrastructure (database driver, `php artisan queue:work`)
- Filament admin panel shell (Indigo/Slate palette, navigation groups)

**Build fresh (V2 rebuild deleted the originals):**
- `app/Services/Templates/TemplateRegistry.php` — PHP mirror of the Next.js registry
- `app/Services/Templates/TemplateFiller.php` — schema-driven Anthropic call per variant
- `app/Services/Templates/TemplateSelector.php` — picks N distinct template_keys from a pool (replaces the old `ArchitectPhase` with a much smaller surface)
- `app/Services/AnthropicClient.php` — thin wrapper around the Anthropic SDK (was deleted with old `FunnelGenerator/`)
- `app/Jobs/GenerateLandingPageBatchJob.php` — creates per-version jobs
- `app/Jobs/GenerateLandingPageVersionJob.php` — calls TemplateFiller, writes draft
- `app/Http/Controllers/Api/PublicFunnelController.php` — `GET /api/funnels/{id}/published-content`
- Filament generate page on Funnel resource (dedicated `GenerateLandingPagesPage`, not a modal action)
- Filament card-grid page (dedicated `LandingPageDraftsPage` on the Funnel)
- Filament draft edit page (phase 1.5 — dedicated `EditLandingPageDraftPage`)

**New in Next.js app:**
- `next-app/src/templates/` — 8 components + 8 Zod schemas + registry
- `next-app/src/templates/registry.test.ts` — integrity tests
- `next-app/src/app/preview/[token]/page.tsx` — preview route (fetches draft via Laravel API, renders via registry)
- `next-app/src/app/f/[funnel]/optin/page.tsx` (or similar) — public landing page route

---

## Template slot schema pattern

Example (`opus-v1.schema.ts`):

```ts
import { z } from 'zod';

export const OpusV1Schema = z.object({
  summit: z.object({
    name: z.string().min(1),
    tagline: z.string().min(1),
    startDate: z.string(),          // ISO
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
    dayLabel: z.string(),            // "Day 1 — Diagnosis"
    dayDate: z.string(),
    speakerIds: z.array(z.string().uuid()),
  })).min(1),
  bonusStack: z.array(z.object({
    title: z.string(), description: z.string(), valueLabel: z.string(),
  })).min(1).max(5),
  faqs: z.array(z.object({
    question: z.string(), answer: z.string(),
  })).min(3).max(10),
  closing: z.object({
    headline: z.string(), subheadline: z.string(), ctaLabel: z.string(),
  }),
});

export type OpusV1Content = z.infer<typeof OpusV1Schema>;
```

**Design choices locked into the schema pattern:**
- **Speakers by ID reference, not inlined copy.** Updating a speaker's bio does not require regenerating pages.
- **Day grouping is data, not derived.** AI groups `SummitSpeaker` records by `presentation_day`, returns `speakersByDay` — templates are free to render day-grouped or flat.
- **Fixed-arity fields.** Where layout demands exactly 3 stats or 3 bullets, the schema enforces `.length(3)`. Templates can't misrender.
- **`min`/`max` bounds** prevent empty or overflowing sections.

### Template component signature

```ts
export function OpusV1({
  content,
  speakers,
}: {
  content: OpusV1Content;
  speakers: Record<string, Speaker>;   // keyed by speakerId for O(1) lookup
}) { /* render */ }
```

### Registry shape

```ts
export const templates = {
  'opus-v1': {
    label: 'Editorial (Ochre / Ink)',
    thumbnail: '/template-thumbs/opus-v1.jpg',
    Component: OpusV1,
    schema: OpusV1Schema,
    tags: ['editorial', 'serif', 'warm'] as const,
  },
  // opus-v2, opus-v3, opus-v4, variant-1, variant-2, variant-3, adhd-summit
} satisfies Record<string, TemplateDefinition>;

export type TemplateKey = keyof typeof templates;
```

---

## Data flow

### Generate

```
Filament /admin/funnels/{id}
  Click "Generate Landing Pages" → form → submit
    ↓
LandingPageBatch::create({
  summit_id, funnel_id, version_count,
  template_pool, notes, style_reference,
  status: 'queued'
})
dispatch(GenerateLandingPageBatchJob)
    ↓
[GenerateLandingPageBatchJob]
  1. Select N distinct templates from template_pool
     (ArchitectPhase repurposed — or random pick if pool.count == N)
  2. Dispatch one GenerateLandingPageVersionJob per template
    ↓
[GenerateLandingPageVersionJob × N]
  1. Load summit + funnel + speakers (grouped by presentation_day)
  2. TemplateFiller::fill(summit, funnel, template_key, speakers, notes, styleReferenceUrl)
     → Anthropic call, schema-validated output
  3. LandingPageDraft::create({
       batch_id, summit_id, funnel_id,
       template_key, content (JSONB),
       preview_token (uuid), status: 'ready'
     })
  4. Broadcast event → Filament card grid reactively adds card
```

### Review

```
Filament /admin/funnels/{id}/landing-pages (card grid)
  Each card: thumbnail + label + status + action buttons
  Preview → opens /preview/{token} on Next.js in new tab
  Approve → draft.status = 'shortlisted'
  Reject  → draft.status = 'rejected' (soft-hide, restorable)
  Edit    → (phase 1.5) /admin/.../landing-pages/{draft}/edit
  Publish → confirmation modal → FunnelStep.content updated
```

### Publish

```
Publish (from shortlisted card)
  → Schema revalidation against current registry
  → FunnelStep::where(funnel_id, step_type='optin')->update({
      content: { template_key: draft.template_key, content: draft.content },
      published_at: now()
    })
  → Previous live step.content snapshotted to FunnelStepRevision (audit)
  → draft.status = 'published', previously-published drafts → 'archived'
```

### Public render

```
Visitor → https://summit.domain.com/funnel-slug
  → Laravel ResolveFunnelDomain middleware → returns funnel + step
  → (Inertia path removed — this spec assumes Next.js hosts public pages)
  → Next.js fetches GET /api/funnel/{domain}/optin
       → Laravel returns { template_key, content, speakers[] }
  → Next.js looks up registry[template_key].Component, renders
```

### Edit (phase 1.5)

```
Filament draft edit page
  → Form generated from draft's schema via Zod→Filament mapper
  → Fields: TextInput / Textarea / Repeater / Select-from-speakers
  → Save → draft.content updated, preview iframe refreshes
  → Live page unaffected until Publish
```

### State transitions (`LandingPageDraft.status`)

```
queued → generating → ready         (success)
                   ↘ failed          (AI retry exhausted)
ready → shortlisted                  (Approve)
      → rejected                     (Reject, soft-hidden)
      → published                    (Publish)
shortlisted → published
            → rejected
published → archived                 (another draft published)
```

### Speaker resolution

Schema note: V2 `Speaker` belongs to `Summit` directly via `summit_id` (no pivot). Day is derived from `speakers.goes_live_at` (datetime — the exact moment content goes live and the free-access window opens).

- **Generate:** AI receives `Speaker::where('summit_id', $id)->whereNotNull('goes_live_at')->orderBy('goes_live_at')->orderBy('sort_order')->get()`, grouped by `$speaker->goes_live_at->toDateString()`. Returns `speakersByDay` with only `speakerIds` per group.
- **Speakers with `goes_live_at = null`** are excluded from `speakersByDay` (not yet scheduled). They remain selectable manually in edit mode.
- **Edit (phase 1.5):** Operator reassigns IDs between day buckets, reorders within a day, or excludes. Only IDs change — no copy duplicated.
- **Render:** Template component receives `speakers: Record<uuid, Speaker>` keyed by ID, joins at render. Speaker edits in Filament (bio, photo, masterclass title) appear on live page immediately; the draft doesn't need regenerating.

---

## Error handling

### Generation

| Failure | Behavior |
|---|---|
| Anthropic timeout / 5xx | Retry once (exp backoff 5s, 15s); second fail → `status=failed`, error saved on draft, red card in grid |
| Malformed JSON response | Retry once with error appended to prompt; second fail → `failed` |
| Schema-valid but placeholder content (`< 3 chars`, "Lorem ipsum") | Reject via lint pass, retry once, then fail |
| Summit has no speakers | Form validation blocks submit: *"Attach speakers to this summit before generating"* |
| Empty template pool | Form validation blocks submit |
| Worker crash mid-gen | `ShouldBeUnique` + `tries=3`; watchdog marks stuck `generating` rows `failed` after 5 min |

### Render

| Failure | Behavior |
|---|---|
| `template_key` missing from registry | Next.js shows admin error page; visitor sees 503; Publish prevents writing deprecated keys |
| Draft content fails current schema | Zod catches at render; Next.js shows fallback; admin notified; edit page highlights broken fields |
| Referenced speaker deleted | Template filters speaker out (graceful degradation); edit mode shows warning badge |
| Preview token invalid | 404 |

### Publish

| Failure | Behavior |
|---|---|
| Schema revalidation fails | Publish error: *"Draft out of date, open editor to fix"* |
| Concurrent publish | Optimistic lock on `FunnelStep.updated_at` — second publish fails with refresh prompt |

### Edit (phase 1.5)

- Required empty field → inline Filament validation
- Deleted speaker in dropdown → auto-unlink on save + toast warning

### Observability

- Every job logs to `activity_log` (Spatie) with summit/funnel/batch IDs
- `TemplateFiller` logs token count + validation errors (structured)
- Filament batch page surfaces per-draft timing + token spend (cost tracking)

---

## Testing strategy

### Unit

1. **Schema per template** — known-good fixture passes; known-bad fixture fails with expected error. One test file per template.
2. **Registry integrity** — every key has all required properties; thumbnail files exist.
3. **Zod → Filament mapper** — given known Zod node types, correct Filament components generated.
4. **`TemplateFiller::validateAgainstSchema`** — valid response parsed, invalid throws typed exception.
5. **`TemplateFiller::fill`** with mocked Anthropic — system prompt includes serialized schema; retry logic on invalid JSON.
6. **Speaker day-grouping** — mixed `presentation_day` values → correct `speakersByDay` ordered by date.

### Integration (PHPUnit feature)

1. Full generate flow — create summit + speakers, dispatch batch job, assert N drafts created with valid content.
2. Publish flow — shortlisted draft published, `FunnelStep.content` updated, revision snapshotted, prior draft archived.
3. Speaker disappearance — delete speaker referenced in published draft, fetch public API, render degrades gracefully.
4. Schema drift — mutate schema (add required field), attempt publish of older draft, assert error.

### Next.js

1. **Template snapshot tests** — per template, fixture content + speakers → snapshot.
2. **Public API** — `/api/funnel/{domain}/optin` returns expected shape; 404 when no published step.

### Manual smoke test (per release)

- Generate 3 variants → cards appear → preview each → approve one → publish → visit live URL → rendering matches preview
- Edit shortlisted draft (phase 1.5 only)
- Delete a speaker → refresh live → graceful degradation

### Out of scope

- Load testing under concurrent batches
- Visual regression automation (manual sign-off at launch; add Chromatic/Percy in phase 2)
- Template A/B conversion analytics (phase 3)

---

## Schema delta

V2 schema is in place (migrations `2026_04_17_100011_create_landing_page_tables.php`). Delta below is a single follow-up migration.

### `landing_page_drafts` (V2 shape today)

Current columns: `id`, `batch_id`, `version_number`, `blocks` jsonb, `sections` jsonb, `published_html` text, `published_hydration_manifest` jsonb, `status`, `preview_token`, `error_message`.

| Change | Type | Default |
|---|---|---|
| Add `template_key` | `varchar(64)` not null | — |
| Add `token_count` | `int` nullable | `null` |
| Add `generation_ms` | `int` nullable | `null` |
| Widen `status` valid values | string (no enum constraint now) → accept: `queued`, `generating`, `ready`, `shortlisted`, `rejected`, `published`, `archived`, `failed` | `queued` |

**Reuse of existing columns:**
- `sections` (jsonb) — repurposed as the template-slot content store. Matches the template's Zod schema for its `template_key`.
- `blocks`, `published_html`, `published_hydration_manifest` — legacy from deleted pipeline. Leave untouched for this migration; drop in a cleanup migration after templates prove out (phase 2).
- `preview_token` — kept as-is.
- `error_message` — kept as-is.

### `landing_page_batches` (V2 shape today)

Current columns: `id`, `summit_id`, `funnel_id`, `funnel_step_id`, `version_count`, `status`, `notes`, `style_reference_url`, `override_url`, `allowed_types` jsonb, `completed_at`.

| Change | Type | Default |
|---|---|---|
| Add `template_pool` | `jsonb` nullable (array of template_keys, `null` = all) | `null` |

**Reuse of existing columns:**
- `style_reference_url`, `notes` — used by `TemplateFiller`.
- `funnel_step_id` — already present; points to the target funnel step (optin) the batch will publish to.
- `allowed_types` — legacy from deleted pipeline (was for block-type filtering). Leave untouched; drop in phase 2 cleanup. Do **not** reuse it for `template_pool` — semantics differ.
- `override_url` — legacy, same treatment.

### New table: `funnel_step_revisions` (publish audit log)

| Column | Type |
|---|---|
| `id` | uuid pk (`gen_random_uuid()`) |
| `funnel_step_id` | uuid fk `funnel_steps(id)` **on delete set null, nullable** |
| `page_content_snapshot` | jsonb not null |
| `published_at` | timestamptz not null |
| `published_by` | uuid fk `users(id)` on delete set null, nullable |
| `created_at` | timestamptz default now() |

Snapshot is taken just before `FunnelStep::page_content` is overwritten on publish.

**Audit-log design notes:**
- Both FKs use `on delete set null` so revision rows survive deletion of the referenced step or user. Deleting a funnel_step must not wipe its publish history.
- Secondary index is composite `(funnel_step_id, published_at DESC)` — serves the dominant query "show revisions for this step, most-recent-first" in one index scan (no post-filter sort).

---

## Filament wiring

Convention (established by the V2 rebuild): **dedicated pages only — no `->slideOver()`, no modal form actions**. All actions navigate via `->url(PageClass::getUrl([...]))`.

Resource: `app/Filament/Resources/Funnels/FunnelResource.php`.

New pages to add under `app/Filament/Resources/Funnels/Pages/`:

1. **`GenerateLandingPagesPage`** (extends `Page`, not a record page) — URL: `/admin/funnels/{record}/generate-landing-pages`.
   - Full-page form: variant count, template pool multi-select (defaults "all"), notes textarea, style reference URL.
   - Submit → create `LandingPageBatch` + dispatch `GenerateLandingPageBatchJob` → redirect to `LandingPageDraftsPage` with the batch ID.
   - Registered in `FunnelResource::getPages()`.

2. **`LandingPageDraftsPage`** (extends `Page`) — URL: `/admin/funnels/{record}/landing-pages`.
   - Card grid (Livewire component or Blade partial inside the Filament page).
   - Per card: template thumbnail, label, status badge, actions (Preview, Approve, Reject, Publish, Edit-phase-1.5).
   - Poll every 3s for status updates (cheap; only while any draft is in `queued`/`generating`).
   - Action dispatched via Livewire actions, not modal forms.

3. **`EditLandingPageDraftPage`** (phase 1.5, extends `EditRecord`-style page) — URL: `/admin/funnels/{record}/landing-pages/{draft}/edit`.
   - Form auto-generated from the draft's template schema (Zod → Filament via a mapper service in `app/Services/Templates/FilamentSchemaMapper.php`).

Action entry point on `FunnelResource` list or view:
```php
Action::make('generateLandingPages')
    ->label('Generate Landing Pages')
    ->icon('heroicon-o-sparkles')
    ->url(fn (Funnel $record) =>
        GenerateLandingPagesPage::getUrl(['record' => $record]))
```

Card grid is reachable from `FunnelResource` ViewRecord page via a header link or nav sub-item — no modal, no slide-over.

---

## Prerequisites before implementation

All blockers cleared as of 2026-04-17 (V2 rebuild complete — 22 tasks, 17 migrations, 17 models, 9 Filament resources). Remaining coordination:

1. **Inertia removal status.** `HandleInertiaRequests` middleware is still present. Customer-facing controllers are deleted per V2 rebuild notes, to be rebuilt with the V2 checkout flow. This spec assumes public rendering is done by Next.js — the rebuilt public controllers should return JSON via `/api/funnels/{id}/published-content` (or equivalent) rather than `Inertia::render`. Coordinate with whoever rebuilds checkout so the pattern is consistent.
2. **Anthropic API key.** `ANTHROPIC_API_KEY` must be present in `.env` (was used by the deleted pipeline — verify it survived the rebuild).
3. **Queue worker running.** `QUEUE_CONNECTION=database` and `php artisan queue:work` (supervised in prod, manual in dev).

---

## Rollout plan

### Phase 1 (MVP, ~2 weeks after prereqs)

- 2 templates converted (opus-v1 + one more) to prove the pattern
- Generate action + batch job + TemplateFiller
- Card grid with Preview / Approve / Reject / Publish (no Edit)
- Public API endpoint + Next.js renderer
- Unit + integration tests for the 2 templates

### Phase 1.5 (~1 week after Phase 1)

- Remaining 6 templates converted
- Edit page with Zod → Filament form mapper
- Speaker picker override in edit mode

### Phase 2 (~2 weeks after Phase 1.5)

- Deprecated pipeline removed (`CopywriterPhase`, `BlockDesignPhase`, `polish-stage.ts`, skeletons)
- Visual regression automation (Chromatic or Percy)
- Cost dashboard (token spend per batch)

### Phase 3 (opportunistic, demand-driven)

- Cross-template section swap in edit mode (swap hero / faq / speaker grid layout while keeping theme)
- AI copy regeneration hooks (Claude Coworker / Google Docs injection)
- Sales / checkout / thank-you page generators using the same pattern
- Template A/B conversion analytics

---

## Open questions (for the implementation plan, not this spec)

1. Where do template thumbnails come from? (Manual screenshot once per template during conversion, stored in `next-app/public/template-thumbs/`.)
2. Does the PHP-side `TemplateRegistry` need to stay in sync with the Next.js registry automatically, or manually? (Recommend: Next.js registry exports a JSON manifest at build time; Laravel reads it. One source of truth, no double maintenance.)
3. How does `ArchitectPhase` decide which templates to pick from a large pool? (Recommend: simple match on `tags` — e.g., `["parenting", "warm", "editorial"]` — plus Claude one-shot picker for tiebreaks. Keep cheap.)
4. Is the `/preview/{token}` route already secured against enumeration? (Check — preview_token is UUID, but confirm no public listing endpoint leaks tokens.)
