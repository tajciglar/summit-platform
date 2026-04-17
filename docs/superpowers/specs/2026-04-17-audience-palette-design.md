# Audience Palette System — Phase 3a Design

**Status:** Design
**Depends on:** Phase 2a (section catalog + opus-v1 on layout shell)
**Out of scope:** Audience-specific templates (Phase 3b); AI-generated palettes; new audience CRUD via Filament.

---

## Problem

Each summit targets a specific audience (ADHD-parenting, ADHD-women, menopause, herbal, …). Each audience has a distinct visual identity — primarily **color**. Today, templates hardcode their own color palette: opus-v1 is warm editorial, opus-v5 uses rose, opus-v8 uses butter-on-ink. An operator running an ADHD-women summit is limited to templates whose native palette happens to match, or lives with mismatched colors.

We want **one palette per audience** that applies to **any** compatible template. The summit's audience decides the colors; the template decides the layout and aesthetic. A separation of concerns the existing codebase does not have.

## Approach

1. Define a **curated palette per audience** in PHP code — each palette is a set of 8 CSS custom-property values.
2. Summit gains a nullable `audience` enum field. Each generation batch can optionally override.
3. When the landing-page job runs, Laravel resolves the audience into hex values and **stores the resolved palette on the draft** (immutable per generation).
4. The API returns `palette` alongside `sections` / `enabled_sections`.
5. Template layouts apply the palette as inline `style={{ '--primary': palette.primary, ... }}` on the template root.
6. Template CSS is refactored to read only from the universal 8 tokens — no template-specific hardcoded hex.

Phase 3a's template migration is scoped to **opus-v1 + opus-v5** as a pilot pair. The remaining templates migrate later once the pipeline is proven.

## Decisions (locked)

| Decision | Choice | Why |
|---|---|---|
| Palette definition strategy | Curated (hardcoded in PHP) | Deterministic; fast to ship; AI-generation can layer in later. |
| Audience list location | Hardcoded PHP enum (`SummitAudience`) | Enum + palette change together; deploy per-audience addition. |
| Summit audience field | Nullable; falls back to neutral palette | Existing summits keep working; opt-in migration. |
| Operator override scope | **Summit default + per-batch override** | One default, experimentation possible without re-tagging the summit. |
| Palette delivery to Next.js | Laravel resolves → API sends 8 hex values | Single source of truth; no enum duplication in JS. |
| Palette storage | Stored on draft (+ on published step snapshot) | Immutable per generation; palette definition changes don't mutate live pages. |
| Token count per palette | 8 | `primary`, `primary-contrast`, `ink`, `paper`, `paper-alt`, `muted`, `accent`, `border`. Enough for the current template designs; can extend later. |
| Template migration scope (3a) | opus-v1 + opus-v5 | Proves pipeline end-to-end; remaining 6 templates migrated in 3a-follow-ups. |

## Starter audiences

```php
enum SummitAudience: string
{
    case AdhdParenting   = 'adhd-parenting';
    case AdhdWomen       = 'adhd-women';
    case AdhdMen         = 'adhd-men';
    case AdhdGeneral     = 'adhd-general';
    case Ai              = 'ai';
    case Menopause       = 'menopause';
    case Herbal          = 'herbal';
    case WomenLongevity  = 'women-longevity';
}
```

Starter palette directions (hex values to be finalised during implementation with a pass from the user; these are the planning anchors):

| Audience | Primary direction | Paper direction |
|---|---|---|
| adhd-parenting | violet `#8B5CF6` | warm off-white `#FAF7FF` |
| adhd-women | rose `#B1344A` | cream `#FAF8F4` |
| adhd-men | deep blue `#1E3A8A` | charcoal-on-bone `#ECE7DB` |
| adhd-general | blue `#2563EB` | paper `#F5F1EA` |
| ai | near-black `#0A0A0A` | bone-white `#F2EFE9` |
| menopause | rose-deep `#D9436A` | blush `#FBF0F3` |
| herbal | sage `#6B8E5A` | warm cream `#F5F1E8` |
| women-longevity | eucalyptus `#5E8E72` | sand `#F4EFE4` |

## Architecture

### 1. Palette map in PHP

```
app/Services/Templates/
├── AudiencePalettes.php      # SummitAudience → [8-token palette]
└── AudienceResolver.php      # resolves summit/batch → SummitAudience → palette hex values
```

`AudiencePalettes::PALETTES` is a `const array` keyed by `SummitAudience::value`. `AudiencePalettes::NEUTRAL` holds the fallback (warm ochre/paper — matches opus-v1's current look).

`AudienceResolver::resolveForBatch(LandingPageBatch $batch): array` returns the 8-hex palette: batch override wins, otherwise summit default, otherwise neutral.

### 2. Summit model + Filament

Migration:

```php
Schema::table('summits', function (Blueprint $t) {
    $t->string('audience')->nullable()->after('slug');
});
```

Model: `SummitAudience` cast on `audience`. Filament SummitResource adds a `Select::make('audience')->options(SummitAudience::class)->nullable()`.

### 3. Batch override field

Migration:

```php
Schema::table('landing_page_batches', function (Blueprint $t) {
    $t->string('audience_override')->nullable()->after('completed_at');
});
```

`GenerateLandingPagesPage` form gains a `Select::make('audience_override')->options(SummitAudience::class)->nullable()->placeholder('Use summit default')`.

### 4. Draft pipeline

Two new columns:

```php
Schema::table('landing_page_drafts', function (Blueprint $t) {
    $t->string('audience')->nullable()->after('enabled_sections');  // resolved audience
    $t->json('palette')->nullable()->after('audience');               // resolved 8-hex map
});
```

`GenerateLandingPageVersionJob` calls `AudienceResolver::resolveForBatch($batch)` and stores:

- `audience` — the resolved SummitAudience string (or null if neutral used).
- `palette` — `['primary' => '#..', 'ink' => '#..', ...]`.

### 5. Publish snapshot

`PublishDraftService` copies `audience` + `palette` into `funnel_steps.page_content` alongside `sections`, `enabled_sections`, `template_key`.

### 6. API response

Preview + published endpoints include `palette: { primary, primary-contrast, ink, paper, paper-alt, muted, accent, border }` as top-level keys on the draft/step payload. `audience` included for debug/analytics.

### 7. Next.js application

`DraftPayload` and `PublicPayload` types gain:

```ts
palette: {
  primary: string;
  'primary-contrast': string;
  ink: string;
  paper: string;
  'paper-alt': string;
  muted: string;
  accent: string;
  border: string;
} | null;
```

Template layouts (`OpusV1Layout`, `OpusV5Layout` in Phase 3a; others later) render:

```tsx
const vars = palette
  ? ({
      '--primary': palette.primary,
      '--primary-contrast': palette['primary-contrast'],
      '--ink': palette.ink,
      '--paper': palette.paper,
      '--paper-alt': palette['paper-alt'],
      '--muted': palette.muted,
      '--accent': palette.accent,
      '--border': palette.border,
    } as React.CSSProperties)
  : undefined;

return (
  <div className="opus-v1-root" style={vars}>
    ...
  </div>
);
```

When `palette` is null (legacy draft, missing audience), the template's CSS falls back to hardcoded values defined in the template stylesheet — the values become the "neutral" fallback. (This is what gives us the graceful-legacy path.)

### 8. Template migration

Two templates in Phase 3a: **opus-v1** and **opus-v5**.

For each template:

1. Rewrite `<template>.styles.css` to read from the universal 8 tokens (`var(--primary)`, `var(--ink)`, etc.). Keep `:root` defaults as the hardcoded fallback.
2. Rename internal selectors from `opus-v1-ochre`/`opus-v5-rose` class names to palette-driven custom-property usage. Where Tailwind utility classes ship with literal color references (e.g. `bg-paper-100` backed by a Tailwind theme color), either switch the Tailwind theme token to read `var(--paper)` (cleanest) or replace the utility with an inline style on the component.
3. Update skin components that use inline gradients (e.g. opus-v1 `PORTRAIT_GRADIENTS` constants) to be expressed via the palette tokens, or keep them as decorative-only gradients that don't need to follow audience colors (palette applies to content surfaces and accents, not portrait placeholder gradients).

Decision point per template: **which existing colors are palette-driven vs decorative?** opus-v1's ochre CTA = `--primary`. Its paper background = `--paper`. But its portrait-placeholder gradients (brownish earth tones) are intentionally neutral regardless of audience — keep them hardcoded.

## Operator UX

### Creating/editing a summit

Filament SummitResource form gains an audience row:

```
Audience  [Adhd women ▼]  (optional — controls palette colors)
```

Picker lists the 8 starter audiences plus "— none / neutral —".

### Generating landing pages

Current form shows template pool + variant count. Adds:

```
Audience override  [Use summit default ▼]
```

Picker defaults to "use summit default"; operator can override to any audience for this batch only.

### Edit page

No change. Edit page doesn't expose palette — audience is decided before generation and baked into every draft in the batch. (Per-draft palette edit deferred; if needed, gets added in a later phase.)

## Render flow summary

```
Summit(audience=adhd-women)
  └── Batch(audience_override=null)
       └── AudienceResolver → palette hex values
            └── Job stores on LandingPageDraft(audience, palette)
                 └── API returns palette with draft JSON
                      └── Next.js OpusV1Layout applies palette as CSS vars
                           └── template CSS reads --primary, --ink, etc.
```

## Data backfill

Existing drafts and published steps have no `audience` / `palette`. No backfill needed — they render via the CSS fallback (template's `:root` defaults = current look). Only newly-generated drafts after Phase 3a land carry palette data.

## Risk

- **Token mismatch.** If a template's CSS hasn't been migrated but the palette is applied anyway, nothing visible changes (template still uses its hardcoded colors). Safe — no regressions. Migrated templates gain the palette behavior.
- **Palette drift.** Hand-tuning hex values for 8 audiences requires design care. Recommendation: pair with a designer or run palettes through a contrast-ratio checker (WCAG AA for text on `--paper`, etc.) before shipping. Ship the starter directions first; refine as real summits use them.
- **Tailwind theme interaction.** opus-v1 uses Tailwind utility classes (`bg-paper-100`, `text-ink-700`) that reference a Tailwind theme defined in `globals.css`. Need to either (a) change those theme values to `var(--paper)`-style references (Tailwind v4 supports this), or (b) switch component JSX to inline styles where palette tokens matter. Plan favours (a) — less churn in JSX.
- **Dark-mode-ish palettes.** opus-v8 renders dark-on-light-surface. If an audience like `ai` uses `--ink` as the page background, some templates will need opposite text/fg colors. The 8-token vocabulary already distinguishes `primary-contrast` (text on primary) and implies the layout reads tokens consistently — audit each template as it migrates.

## Testing strategy

- **Unit:** `AudienceResolverTest` — summit-only, batch-override, neutral fallback.
- **Unit:** `AudiencePalettes::PALETTES` — every `SummitAudience` case has an entry; every palette has all 8 tokens; every hex value is 7 chars `#` + 6.
- **Feature (job):** `GenerateLandingPageVersionJob` seeds `audience` + `palette` on the draft.
- **Feature (publish):** `PublishDraftService` snapshots audience + palette into `page_content`.
- **E2E (browser):** generate a draft with `adhd-women`, render preview, assert the page's root element has the expected `--primary` CSS var via `getComputedStyle`.

## Phase 3a task outline (pre-plan)

1. PHP: `SummitAudience` enum.
2. PHP: `AudiencePalettes` + 8 starter palettes + `NEUTRAL`.
3. PHP: `AudienceResolver` + tests.
4. DB: migration — summit.audience, batch.audience_override, draft.audience + draft.palette. Model casts.
5. Filament: SummitResource audience picker.
6. Filament: GenerateLandingPagesPage audience_override picker.
7. Job: `GenerateLandingPageVersionJob` resolves + stores palette on draft.
8. Publish: `PublishDraftService` snapshots palette.
9. API: controllers return palette in draft/step JSON.
10. Next.js: add `palette` to `DraftPayload` + `PublicPayload` types.
11. Next.js: `OpusV1Layout` applies palette CSS vars; opus-v1 styles migrated to 8-token vocabulary.
12. Next.js: port opus-v5 HTML → schema/skins/layout (sized as a full Phase 2a-style template migration); uses palette tokens from day one.
13. Tests: palettes-integrity + resolver + job + publish + browser smoke.
14. Register opus-v5 in manifest + update `ManifestIntegrityTest` coverage.

One commit per task. Tasks 1–9 are PHP/Laravel. Tasks 10–14 are Next.js.

## What ships after Phase 3a

- 8 audiences in the enum.
- 8 curated palettes.
- Summit + batch fields wired end-to-end.
- opus-v1 renders audience palettes correctly (existing 7 summits using opus-v1 instantly look different per-audience).
- opus-v5 exists as a new template that renders audience palettes.
- Other 6 templates (opus-v2/v3/v4, variants 1–3, adhd-summit) still on their hardcoded palettes — they continue to work but ignore the audience. 3b/follow-ups migrate them one by one.

## Open items for plan step

- **Palette finalisation.** The starter hex values above are planning anchors. Before implementation a short exercise with the user (or a designer) nails down final values per audience. Plan allocates one task for this.
- **Tailwind theme strategy.** Whether to rewrite the Tailwind theme to read CSS vars (v4 native) or remove utility-class color references in migrated templates. Picked in the plan; simpler default: keep Tailwind utilities, but make their backing theme colors read `var(--paper)` etc.

