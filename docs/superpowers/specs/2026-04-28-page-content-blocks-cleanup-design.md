# Page Content Blocks Cleanup — Design

**Date:** 2026-04-28
**Status:** Spec

## Problem

The Filament step editor exposes too many inputs per block. A single visible
headline like *"Your bright, busy-minded child is not a problem to be solved."*
shows as **three** inputs (Lead / Accent / Trail) because the Zod schema splits
it for the renderer's accent styling. Several other sections do the same with
multi-paragraph bodies. Every block also carries a `Design (this section)`
fieldset (palette + fonts) that's almost never used. The `summit` block
duplicates dates and timezone that already live on the `Summit` model. Net
effect: editors hunt across many fields to make trivial copy edits.

## Goals

- Collapse styling-driven field splits into single rich-text inputs.
- Remove per-section design overrides (handled globally as the next task).
- Single source of truth for summit dates and timezone (the `Summit` model).
- Auto-render the event-status label/date string from the active summit phase.

## Non-goals

- Renaming fields across the catalog ("Title" / "Subtitle" / etc.) — deferred.
- Changing the canonical on-disk shape that Next.js Zod schemas validate.
- Redesigning the global design controls — separate brainstorm/task.
- Touching repeaters (FAQs, speakers, testimonials, etc.) — already one element.

## Design

### 1. Rich-text consolidation

**Rule.** Where adjacent fields exist purely so the renderer can apply different
styling to parts of one paragraph, the editor exposes one rich-text input. The
mapper splits the HTML on save into the canonical multi-string shape; on load
it re-joins them.

**Scope (catalog-wide).** Identified by static scan of
`next-app/src/templates/*.schema.ts`:

| Pattern in schema                            | Editor field       | Round-trip                                                           |
|----------------------------------------------|--------------------|----------------------------------------------------------------------|
| `headlineLead` + `headlineAccent` + `headlineTrail` | one **Title** rich-text | `lead<em>accent</em>trail` ↔ three strings (split on first `<em>…</em>`) |
| `paragraph1` + `paragraph2` (+ `paragraph3`) | one **Body** rich-text | `<p>…</p><p>…</p>` ↔ N strings (split on `</p>`)                       |
| `body1` + `body2`                            | one **Body** rich-text | same as above                                                        |

Anything not matching one of these patterns stays as-is.

**Editor.** Filament's `RichEditor` with a constrained toolbar: bold, italic,
link, paragraph break only. No headings, no lists, no blockquote, no code —
those would produce HTML the renderer can't represent.

**Mapper.** `TemplateBlockFactory::wrapValueForBlock` /
`unwrapValueFromBlock` already converts between Builder state and the on-disk
map. We extend it with two named transforms:

- `splitHeadlineHtml(string $html): array{lead: string, accent: string, trail: string}`
  — extracts the first `<em>…</em>` (falling back to `<i>…</i>`); returns
  `lead = ''` / `trail = ''` when missing. Strips remaining HTML.
- `joinHeadlineParts(array $parts): string` — `e($lead) . '<em>' . e($accent) . '</em>' . e($trail)`.

And mirrors for paragraphs:

- `splitBodyHtml(string $html): array<int, string>` — splits on `</p>`,
  strips wrappers, trims, drops empties.
- `joinBodyParts(array $parts): string` — wraps each in `<p>…</p>`.

The factory detects the trio/duo by property names and emits one
`RichEditor` field whose dehydrate/mutate hooks call the matching transform.
Underlying jsonSchema and Zod validation are unchanged.

**Empty / partial states.** If a record on disk has only `headlineLead`
populated (legacy data), the rich-text loads with that text and no `<em>`. Save
normalises it to `lead = '<text>', accent = '', trail = ''` — Zod's
`min(1)` requirement on `headlineAccent` is the only risk; we relax those to
`.optional()` in schemas where currently `min(1)`. Templates already handle
empty accent strings (renders nothing). This change is editor-driven, not
data-driven, so existing populated records continue to validate.

### 2. Per-section Design fieldset — removed

Drop the `Fieldset::make('Design (this section)')` block entirely from
`TemplateBlockFactory::blocksForStep()`. Stop reading/writing
`data.__design.*` and `page_overrides.sections[type]` in
`EditFunnelStep` and `EditLandingPageDraftPage`.

Existing `page_overrides.sections` data on records: leave in place (no
migration). The renderer's section-overrides path is left wired so old data
keeps rendering, but no new data is written and the field is no longer
editable. Cleanup migration deferred until the global design panel ships.

### 3. Timezone — removed entirely

Drop `timezone` from:

- `summits.timezone` column (migration: `dropColumn`).
- `Summit::$fillable`, no cast needed (was a string).
- Filament `SummitResource` form.
- `Summit::buildSummitContext()` / wherever it's emitted to the renderer.
- The `summit` block's schema/fields in templates.
- Next.js renderers — replace any `summit.timezone` reads with the project
  constant `'America/New_York'` (or whichever; confirmed single timezone).

### 4. Dates — single source of truth on `Summit`

Per-block `startDate` / `endDate` fields are removed from any block that
currently exposes them. The Next.js renderer reads `summit.start_date` /
`summit.end_date` (derived from `during_summit_starts_at` / `ends_at`) at
render time and substitutes them into block templates that need date strings.

Where date strings appear in copy (e.g., "ONLINE Event, 27–29 April"), the
renderer formats them from those summit fields, not from per-block content.

### 5. Auto event-status label

The top-bar / hero status string switches based on `Summit::computePhase()`:

| Phase            | Rendered string                                           |
|------------------|-----------------------------------------------------------|
| `pre`, `late_pre`| `ONLINE Event, {start_date}–{end_date}` (formatted, locale-en) |
| `during`         | `Event live`                                              |
| `post`           | `Event ended`                                             |
| `null` (no dates set) | empty string (block hides itself)                    |

Computed in `Summit::buildSummitContext()` as a new `eventStatusLabel`
string, sent with the rest of the summit context to Next.js. Renderers consume
that prebuilt string — no client-side date logic, no timezone-tricky `Date`
math in JS. Ranges are formatted server-side in PHP using `Carbon`.

When start/end fall in the same month: `27–29 April`. Different months:
`30 April – 2 May`. Different years: `30 Dec 2026 – 2 Jan 2027`.

Block fields that previously stored these strings (e.g. `topBar.status`,
`hero.eventDates`) are removed from the editor; if a record still has them on
disk, `buildSummitContext()`'s computed value wins.

## Components touched

- `app/Services/Templates/TemplateBlockFactory.php` — drop design fieldset;
  detect headline trio + paragraph duo/trio and emit single `RichEditor`;
  add named transforms used by `dehydrateStateUsing` /
  `mutateDehydratedStateUsing` (or wired through wrap/unwrap).
- `app/Services/Templates/FilamentSchemaMapper.php` — opt-out for the
  consolidated keys so it doesn't also emit raw text inputs for them.
- `app/Models/Summit.php` — remove `timezone`; add `eventStatusLabel` accessor
  / inclusion in `buildSummitContext()`.
- `app/Filament/Resources/Summits/SummitResource.php` — remove timezone
  field.
- `app/Filament/Resources/FunnelSteps/Pages/EditFunnelStep.php` and
  `app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php` —
  remove `__design`/`page_overrides.sections` round-trip.
- `next-app/src/templates/*.schema.ts` — relax `headlineAccent.min(1)` to
  `.optional()` where present (≈14 occurrences).
- `next-app/src/templates/**/skins/*.tsx` — read `eventStatusLabel` instead of
  `topBar.status` / `hero.eventDates`; remove `summit.timezone` reads.
- `database/migrations/<date>_drop_summit_timezone.php` — new migration.

## Testing

- **Pest feature test** for `TemplateBlockFactory`:
  - Loading a record with `{headlineLead:'A', headlineAccent:'b', headlineTrail:'c'}`
    yields one Builder field whose value is `A<em>b</em>c`.
  - Saving `A<em>b</em>c` writes the original three strings.
  - Saving `Just text` with no `<em>` writes `lead='Just text', accent='', trail=''`.
  - `paragraph1/paragraph2` round-trip with `<p>…</p><p>…</p>`.
- **Pest unit** for `Summit::eventStatusLabel`: each phase, plus same-month /
  cross-month / cross-year date ranges.
- **Pest browser smoke** (`tests/Browser`): edit a step, change the rich-text
  title, save, refresh — the value persists and the rendered preview shows the
  italic accent in the right place.
- **Existing tests** (`design-tokens-roundtrip.spec.ts` and friends) updated
  to drop the per-section design assertions; replaced with a
  "design fieldset is gone" assertion against the Filament form.

## Migration / rollout

1. Spec → plan → ship behind no flag (editor-only changes; on-disk shape
   preserved except for the timezone column drop).
2. Drop timezone column in a single migration; no data preservation needed.
3. Existing records with `__design` / `page_overrides.sections` data: untouched.
   They stop rendering once skins stop reading the override. We accept the
   visual flatten as part of moving design to the global panel.
4. No staged rollout — all funnels share the same editor; ship together.

## Open questions

None — naming/global-design panel are explicitly deferred to follow-up tasks.
