# Landing Page Quality — Design Doc

> **Goal:** generate landing pages that match `docs/block-references/*.png` quality immediately, and approach parenting-summits.com fidelity over time, by introducing a per-summit Style Brief and a two-stage (image → code) per-section generation pipeline.

**Date:** 2026-04-15
**Author:** Brainstorming session (operator + Claude)
**Status:** Draft — pending operator approval before writing implementation plan.
**Prerequisite reading:**
- `docs/superpowers/specs/2026-04-15-runtime-gemini-landing-page-design.md` (the Phase-1 runtime-Gemini spec this builds on)
- `docs/superpowers/plans/2026-04-15-runtime-gemini-landing-page.md` (its implementation plan)

---

## Why this doc exists

The runtime-Gemini flow that landed earlier today produces output that the operator considers visually inferior to both their hand-curated `docs/block-references/*.png` and to their target reference (parenting-summits.com). Section quality also varies wildly between sections of the same page — there's no shared design DNA. Worse, the existing pipeline used the per-section reference PNGs as a layout anchor while *also* trying to mimic a different style URL, sending Gemini in two directions at once.

This doc proposes a re-architecture that:
1. Generates one **Style Brief** per summit (auto-built from a reference URL, operator-editable, reused across all the summit's funnels).
2. Replaces single-call section generation with a **two-stage per-section pipeline**: an image-design model first produces a mockup PNG, then a code model implements the mockup as JSX.
3. Retires the per-section reference PNGs as generation inputs in favour of the Style Brief + URL screenshot.
4. Adds operator control over which section types are eligible for a given page generation.

---

## Decisions locked in during brainstorm

| # | Question | Answer |
|---|----------|--------|
| 1 | Quality target | Match `docs/block-references` quality first; long-term match parenting-summits.com style |
| 2 | Latency budget | Quality > speed; ~3-5 min per page acceptable |
| 3 | Operator workflow | Generate, then iterate 1-2 sections with notes (B in brainstorm) |
| 4 | Whole-page cohesion | Critical — page-level Style Brief constrains every section (A in brainstorm) |
| 5 | Brief visibility | Operator-editable in Filament with lock-fields (A in brainstorm) |
| 6 | Pipeline shape | Two-phase: Phase 0 = Style Brief once; Phase 1 = image → code per section |
| 7 | Source of visual truth | The style-reference URL screenshot — retire per-section reference PNGs as inputs |
| 8 | Brief scope | Summit-level base + funnel-level optional override (C in brainstorm) |
| 9 | Section selection | Operator can include/exclude specific section types per generation |

---

## Non-goals

- Replacing or upgrading the AST validator, JSX compiler, field-extractor, hydration runtime, or publisher. They keep working as-is.
- Replacing Claude's ArchitectPhase. It still picks section *order* — only the *eligible set* becomes operator-controlled.
- Visual quality assertions in tests. Operator's eye is the source of truth for "looks good".
- Multi-page generation in one shot. Each landing page is still generated independently; the Style Brief is the only thing shared across pages.

---

## Architecture overview

```
Phase 0 — Style Brief (one-time per summit, reusable across funnels)
─────────────────────────────────────────────────────────────────────
[Operator] sets style_reference_url on summit
    ↓
[Laravel] dispatches BuildStyleBriefJob
    ↓
[Next.js + Playwright] screenshots the URL → reference.png
    ↓
[Gemini Pro vision] analyses screenshot + summit context →
    { palette, typography, components, rhythm, voice, hero_pattern }
    ↓
[Laravel] saves to summit.style_brief; status = ready
    ↓
[Filament] /admin/summits/{id}/style-brief lets operator edit/regen/lock fields


Phase 1 — Per-page generation (parallel per section)
─────────────────────────────────────────────────────────────────────
[Operator] clicks Generate → form (versions, sections, optional URL override, notes)
    ↓
[Laravel ArchitectPhase] (Claude) picks section sequence from operator's allowed set
    ↓
[Laravel BlockDesignPhase] dispatches N parallel HTTP calls to Next.js
    ↓
For each section in parallel:
    1. Image stage   → gemini-3.1-flash-image-preview
                       inputs: brief + reference.png + summit data + section brief
                       output: section-mockup.png
    2. Code stage    → gemini-2.5-flash
                       inputs: section-mockup.png + brief + design-system + primitives
                       output: { jsx, fields } envelope
    3. Validate      → AST whitelist; retry once on fail
    4. Persist       → draft.sections[i] (with mockup_url for debugging)
    ↓
[Filament editor] renders sections; operator iterates per-section regen with note
                  (regen re-runs both stages; mockup PNG updates each time)
```

**Where everything lives:**

| Layer | Responsibility |
|---|---|
| Laravel | Orchestration: jobs, controllers, Filament UI. Talks to Next.js over HTTP. Owns DB. |
| Next.js | Stateless services: Playwright, Gemini calls, JSX validation, render. Routes: `/api/style-briefs/build`, `/api/sections/design-image`, `/api/sections/generate`, `/api/sections/regenerate`, `/api/drafts/preview/render`. |
| Postgres | `summits.style_brief` jsonb, `funnels.style_brief_override` jsonb, existing `landing_page_drafts.sections` jsonb. |
| Storage | `storage/app/public/style-briefs/{summitId}/reference.png`, `storage/app/public/draft-mockups/{draftId}/{sectionId}.png`. Bunny in prod via `FILESYSTEM_DISK` swap. |

---

## Style Brief schema

Stored on `summits.style_brief` (jsonb). Auto-generated; operator can override any field. Locked fields survive `Regenerate from URL`.

```json
{
  "palette": {
    "primary":      "#5e4d9b",
    "primary_text": "#ffffff",
    "accent":       "#00b553",
    "background":   "#ffffff",
    "surface":      "#f9fafb",
    "text":         "#111827",
    "text_muted":   "#6b7280",
    "border":       "#e5e7eb"
  },
  "typography": {
    "heading_font":   "Plus Jakarta Sans",
    "body_font":      "Inter",
    "heading_weight": 700,
    "scale":          "comfortable"
  },
  "components": {
    "button_shape":  "pill",
    "button_weight": "bold",
    "card_style":    "elevated",
    "card_radius":   "lg"
  },
  "rhythm": {
    "section_padding": "comfortable",
    "max_width":       1200,
    "density":         "airy"
  },
  "voice": {
    "tone":           "warm-expert",
    "headline_style": "benefit-driven"
  },
  "hero_pattern":  "split-image-right",

  "_generated_from": "https://parenting-summits.com",
  "_generated_at":   "2026-04-15T13:50Z",
  "_locked_fields":  ["palette.primary", "voice.tone"]
}
```

**Resolution at generation time** (`StyleBriefResolver`):

```php
public function resolveForFunnel(Funnel $funnel): array {
    $base     = $funnel->summit->style_brief ?? $this->defaultBrief();
    $override = $funnel->style_brief_override ?? [];
    return Arr::deepMerge($base, $override);
}
```

---

## Per-section pipeline detail

### Stage 1 — Image (gemini-3.1-flash-image-preview)

**Inputs (multimodal):**

| Input | What it provides |
|---|---|
| `style_brief` | Visual constraints (palette, typography, density, hero_pattern) |
| `reference_screenshot.png` | The summit's style URL screenshot (visual style anchor) |
| `summit_context` | Name, tagline, dates, speaker count, sample names, price, brand colors |
| `section_brief` | type, position, purpose |

**Prompt summary:** *"Design a `{section.type}` section for this summit. Match the visual style of `reference_screenshot.png`. Apply palette/typography from style_brief. Output a single 1440×900 mockup PNG."*

**Output:** `section-mockup.png`, ~200KB.

**On failure:** retry once with stricter prompt; second fail → mark `image_failed` and fall back to Stage-2-only path. Stage 2 then uses the **summit's reference URL screenshot** (already stored from Phase 0) as the visual anchor instead of a generated mockup. The section still renders something visually consistent with the brand.

### Stage 2 — Code (gemini-2.5-flash, `responseMimeType: application/json`)

**Inputs (multimodal):**

| Input | What it provides |
|---|---|
| `section-mockup.png` | The visual target (Stage 1 output) |
| `style_brief` | Tailwind tokens + class hints derived from brief |
| `design_system` | Existing tokens.md |
| `primitives` | Source code of `@/components/ui/*` available imports |
| `runtime_envelope_example` | Single-file `{ jsx, fields }` example (the inline one we already have) |

**Prompt summary:** *"Implement `section-mockup.png` as React JSX. Match the visual exactly — colors, spacing, typography, icon shapes, layout. Use only allowed imports. Return JSON envelope `{ jsx, fields }`."*

**Output:** `{ jsx, fields }` envelope.

**On parse fail or validator reject:** retry once with the error fed back into the prompt; second fail → mark `failed`, store raw output for debugging.

### Persisted shape per section

```json
{
  "id":          "uuid",
  "type":        "HeroWithCountdown",
  "jsx":         "...",
  "fields":      [...],
  "status":      "ready" | "image_failed" | "render_failed" | "failed" | "regenerating",
  "mockup_url":  "/storage/draft-mockups/{draftId}/{sectionId}.png",
  "raw_output":  "...",
  "regeneration_note":  null,
  "source_section_id":  null
}
```

---

## Failure handling

| Where it fails | What happens | Operator sees |
|---|---|---|
| Phase 0: Playwright can't reach style URL | Build brief from summit context only; status `failed_screenshot` | Yellow banner: "URL unreachable; brief from defaults" |
| Phase 0: vision model 503/garbage | Retry once. Second fail → default brief | Banner: "Couldn't analyse reference; using defaults" |
| Stage 1: model 503/UNAVAILABLE | Exp backoff 3 tries → fall back to Stage-2-only path; Stage 2 uses the summit reference URL screenshot as visual anchor | Orange "fallback rendered" badge with Regenerate |
| Stage 1: invalid PNG bytes | Treat as 503 — same fallback | Same |
| Stage 2: JSON parse fail | Tolerant 3-strategy parser. If all fail, retry once with parse error in prompt | `failed` status; raw output stored |
| Stage 2: AST validator reject | Retry once with error in prompt. Second fail → `failed` | `failed` with rule-violation message |
| Stage 2: SSR throws | `render_failed`. Mockup PNG still saved | Red error box + "View mockup" link + "Regenerate code" button |
| Whole-job: queue worker dies | Job marked `failed` on next worker boot; partial sections preserved | Banner: "Generation interrupted — N/M sections done — Resume" |
| Operator hits Regen-all while job in-flight | Idempotency guard refuses | Toast warning, no destructive action |

**Three rules:**
1. Partial success > total failure.
2. Always preserve operator work (regenerate is opt-in; operator-edited fields survive Stage 2 retries).
3. Every failure is debuggable (mockup PNG, raw output, validator error all stored on the section).

---

## Data model

### Migration 1 — summit gets style fields

```php
// 2026_04_15_140000_add_style_brief_to_summits.php
Schema::table('summits', function (Blueprint $t) {
    $t->string('style_reference_url', 500)->nullable();
    $t->jsonb('style_brief')->nullable();
    $t->timestamp('style_brief_built_at')->nullable();
    $t->string('style_brief_status', 32)->default('absent');
    // status: absent | building | ready | failed
});
```

### Migration 2 — funnel can override

```php
// 2026_04_15_140100_add_style_brief_override_to_funnels.php
Schema::table('funnels', function (Blueprint $t) {
    $t->jsonb('style_brief_override')->nullable();
    $t->jsonb('last_section_selection')->nullable(); // remembers operator's last checkbox state
});
```

### Migration 3 — section JSON shape

No migration. `landing_page_drafts.sections` is already jsonb; we extend the per-section JSON with `mockup_url` and `raw_output` (both optional, backwards-compatible).

### Migration 4 — retire batch-level style_reference

```php
// 2026_04_15_140300_move_style_reference_from_batches.php
DB::statement("
    UPDATE summits s
       SET style_reference_url = b.style_reference
      FROM landing_page_batches b
     WHERE b.summit_id = s.id
       AND s.style_reference_url IS NULL
       AND b.style_reference IS NOT NULL
");

Schema::table('landing_page_batches', function (Blueprint $t) {
    $t->dropColumn('style_reference');
});
```

The batch-level style override (a per-generation deviation from the summit URL) becomes a form field on the Generate modal that's *not* persisted — it just feeds into that batch's Phase 1 image stage if non-empty.

### File storage

| Path | Purpose |
|---|---|
| `storage/app/public/style-briefs/{summitId}/reference.png` | Phase 0 URL screenshot |
| `storage/app/public/draft-mockups/{draftId}/{sectionId}.png` | Stage 1 mockup per section |

Symlinked to `public/storage` via `php artisan storage:link` (already run). Switch to Bunny in prod by changing the disk in `config/filesystems.php` — no code changes.

**Cleanup:** daily prune job removes mockup PNGs for drafts with `status = rejected` older than 7 days.

---

## Operator UX

### Step 1 — Set the style reference (one-time per summit)

`/admin/summits/{id}/edit` gets a new "Style" section: text input for `style_reference_url` + "Build Style Brief" button.

Clicking Build:
1. Status flips to `building`; toast "Building style brief — ~30s".
2. `BuildStyleBriefJob` dispatches.
3. Job calls Next.js `POST /api/style-briefs/build` with URL + summit_context.
4. Next.js: Playwright screenshot → Gemini Pro vision → JSON brief.
5. Result saved to `summit.style_brief`; status = `ready`.
6. Filament shows green "Ready" + "Edit brief" link.

### Step 2 — Review/edit the brief (optional)

`/admin/summits/{id}/style-brief` shows the editor (color swatches, font picks, button preview, density slider, hero-pattern thumbnails).

Actions:
- **Save** — persist edits without regen.
- **Re-screenshot** — grab URL again; locked fields preserved.
- **Regenerate from URL** — full rebuild from screenshot; locked fields preserved.
- **Reset** — discard edits, restore last auto-built version.

Most operators skip on first pass — defaults are usually OK; they edit only if the generated pages disappoint.

### Step 3 — (Optional) Per-funnel override

Edit Funnel page gets a "Style override" disclosure, collapsed by default. Shows: "Inheriting from {summit.name}'s style brief — *Customize this funnel*".

Click Customize → loads the brief editor preloaded with summit values; edits become the override. Reset clears the override.

### Step 4 — Generate landing pages

`/admin/funnels/{id}/landing-pages` → Generate Landing Pages modal:

| Field | Notes |
|---|---|
| Number of versions | Existing |
| Sections to include | NEW: checkbox grid grouped by category; defaults to Architect's typical sequence for the funnel's step type; "Reset to recommended" + "Select all" / "Deselect all" buttons; persisted as `funnel.last_section_selection` |
| Style override URL | NEW: optional, just for this batch; if set, used as Stage 1 reference instead of summit's |
| Creative notes | Existing |

**Pre-flight:** Generate is disabled if `summit.style_brief_status !== 'ready'` (with tooltip "Build the summit's style brief first").

**Validation:** if fewer than 4 sections checked, warn before submit.

`ArchitectPhase::run()` gets one new optional parameter:

```php
public function run(array $brief, array $catalog, array $stepTypes, ?array $allowedTypes = null): array
```

When `$allowedTypes` is non-null, the architect tool's `type` enum is restricted. Backwards-compatible.

### Step 5 — Review + iterate

Existing version-cards + sections-list UI. Two additions:
- **"View mockup" link** per section row pops the Stage 1 PNG in a modal.
- **New status badges**: `image_failed` (orange), `render_failed` (red); each has a per-state regenerate action.
- **Existing "Regenerate UI with note" textarea** now triggers BOTH stages: re-image with note, then re-code from new image.

---

## Testing strategy

| Layer | What | Where it runs |
|---|---|---|
| Unit (Vitest) | style-brief schema validator, deep-merge, prefix-tolerant resolver, tolerant envelope parser, image-stage prompt builder, code-stage prompt builder | Every commit |
| Feature (Pest, Laravel) | BuildStyleBriefJob (happy/screenshot-fail/vision-fail), StyleBriefResolver, ArchitectPhase with allowedTypes, GenerateLandingPageVersionJob new pipeline (happy + Stage-1-fail), brief editor save/regen/lock-fields, Generate form section selection | Every commit. Next.js stubbed via `Http::fake()`. |
| Smoke (real Gemini) | Build a real brief, generate 1 version × 4 sections, assert ≥ 3/4 ready + mockups exist + preview HTML loads | Manual / daily cron, NOT CI |
| Browser (Playwright) | Login → Build Brief → Generate → Wait for ready → Preview → Publish → visit funnel URL | Manual / daily cron, NOT CI |

**Test count estimate:** ~25 unit + ~15 feature + 1 smoke + 1 Playwright. Fits an afternoon.

**Explicitly NOT tested:** visual quality of generated pages (subjective), Gemini's prompt obedience (we test our handling of bad output, not the model), style-brief field semantics ("airy" looking airy is operator's call).

---

## Backwards compatibility

- Existing drafts in `landing_page_drafts.sections` (with no `mockup_url`) load fine — UI just doesn't show the View Mockup link for them.
- Existing drafts in `landing_page_drafts.blocks` (legacy CopywriterPhase output) continue to render via the existing `RenderBlocks` fallback in `/preview/[token]`.
- Operator can roll back the whole feature by setting `ENABLE_RUNTIME_GEMINI_GEN=false` — falls back to the old CopywriterPhase pipeline. This safety valve is preserved.
- Migration 4's backfill is idempotent and only acts where `summit.style_reference_url` is null.

---

## Open questions / parking lot

1. **Mockup PNG size.** 1440×900 ~200KB. With ~10 sections × 5 retained drafts, that's ~10MB per summit on disk. Trivial in dev; in prod we'd want lifecycle rules. Defer to ops phase.
2. **Vision model selection for Phase 0.** Currently spec says "Gemini Pro vision". Could be cheaper Flash Pro for first pass, escalate to full Pro on retry. Defer until we measure brief quality.
3. **Multiple URL pages.** Spec uses one screenshot. Could capture hero+mid+footer for richer style anchor. Phase-0 enhancement worth measuring after V1 ships.
4. **"Save section as block" path.** If operator hand-edits a generated section to perfection, can they save it back to the curated block library? Out of scope for this doc; tracked separately.
5. **Concurrent generation rate-limiting.** Several summits running batches at once could hit Gemini rate limits hard. Per-tenant queue throttling deferred to ops phase.

---

## Implementation order (high level — full plan in writing-plans skill)

1. **Migrations + models** — fields, casts, fillable updates.
2. **`StyleBriefResolver`** + default brief — pure logic, easy to test.
3. **Phase 0 backend** — `BuildStyleBriefJob`, Next.js `/api/style-briefs/build`, Playwright service.
4. **Phase 0 UX** — Filament summit Style section + brief editor page.
5. **Phase 1 image stage** — Next.js `/api/sections/design-image` + Stage-1-only smoke test.
6. **Phase 1 wiring** — `BlockDesignPhase` extended to call Stage 1 then Stage 2 with mockup; mockup persistence.
7. **Generate form upgrade** — section-selection checkboxes + `ArchitectPhase` allowedTypes.
8. **Per-section regen path** — re-runs both stages; preserve operator-edited fields.
9. **Mockup pruning job** — scheduled task.
10. **End-to-end smoke + Playwright scripts.**
11. **Roll forward**: enable for one summit, monitor, then default.
