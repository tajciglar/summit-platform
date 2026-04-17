# Section Catalog — Phase 2 Design

**Status:** Design
**Depends on:** Phase 1 (templates-as-whole pipeline, 8 templates live) + Phase 1.5 plan (production readiness + edit page)
**Out of scope:** Sales / checkout / thankyou page generators (catalog is page-type-aware from day one, but only the `landing` page type is implemented here)

---

## Problem

Each summit operator needs a **different set of sections** on their landing page. Some summits need sponsors; some need pricing tiers; some are paid events that need a bonus stack; some need a marquee of press logos; some don't. Today, our 8 templates each render a fixed set of sections baked into the component — no variance beyond field values.

Operators need to curate which sections appear on a given summit's page without having to anticipate every section up-front. Visual coherence must be preserved: a chosen section should look like it belongs to the chosen template, not be a generic Frankenstein.

**Approach:** AI fills every section the template supports in one pass. Each template declares a *default-enabled* subset that renders out of the box. Operator curates in the edit page by toggling sections on/off — content is already there, so toggles are instant. No regeneration needed to explore different section mixes.

## Constraints

- Preserve the current templates-as-whole aesthetic — designers' intent per template stays intact.
- Extend, don't replace, the Phase 1 pipeline (Zod schemas, AI fill, manifest contract, registry).
- Page-type-aware catalog from day one so sales/checkout/thankyou drop in without re-architecting.
- No cross-template section mixing. Each template provides its own skin for every section it supports.

## Decisions (locked)

| Decision | Choice | Why |
|---|---|---|
| When sections are selected | **AI fills every supported section at generate; operator toggles in edit** | Simpler generate UX; instant iteration; no regenerate to change mix |
| Default-enabled set | Each template declares `defaultEnabledSections` | Baseline page out of the box; operator expands from there |
| Section order customization | Fixed per template in Phase 2; reorder in edit later | Simpler; template author owns aesthetic flow |
| Template missing an optional section skin | That template doesn't include the section in its supported set | No fallback ugliness |
| Core section skinning | Every template must skin every core section (enforced at build) | Guarantees any template can render the baseline |
| Enabled-sections storage | `drafts.enabled_sections` JSON array column | Keeps render decision separate from content |
| Catalog schema versioning | None | We own every consumer; Phase 2 is greenfield |
| Section schema sharing across templates | Shape shared, skin per template | Clarity in catalog; flexibility in style |
| Edit-time section toggle off | Hides from render, keeps data | Reversible; data never lost |

## Architecture

### Catalog

Single source of truth in Next.js:

```
next-app/src/sections/
├── catalog.ts                # key -> { pageTypes, tier, schema, defaultOrder }
├── hero.schema.ts
├── marquee.schema.ts
├── summit-overview.schema.ts
├── value-prop.schema.ts
├── speakers-by-day.schema.ts
├── reasons-to-attend.schema.ts
├── who-attends.schema.ts
├── testimonials-attendees.schema.ts
├── testimonials-speakers.schema.ts
├── stats-hero.schema.ts
├── facts-stats.schema.ts
├── why-this-matters.schema.ts
├── bonus-stack.schema.ts
├── social-proof-followers.schema.ts
├── references.schema.ts
├── countdown-timer.schema.ts
├── event-status-banner.schema.ts
├── capability-statement.schema.ts
├── host-founder.schema.ts
├── faq.schema.ts
├── footer.schema.ts
└── optin-modal.schema.ts
```

Catalog entry shape:

```ts
type CatalogEntry = {
  key: string;                   // 'hero', 'marquee', ...
  label: string;                 // operator-facing name
  description: string;           // operator-facing tooltip
  pageTypes: PageType[];         // ['landing'] now; ['sales'] etc. later
  tier: 'core' | 'optional';
  schema: z.ZodObject<any>;
  defaultOrder: number;          // catalog-level default; templates can override
};

type PageType = 'landing' | 'sales' | 'checkout' | 'thankyou';

export const catalog: Record<string, CatalogEntry> = { ... };
```

### Section schema contract

Every section schema is a Zod object:

- All visible strings `.min(1)`.
- Dates `z.string().date()`.
- Speaker IDs `z.string().uuid()`.
- `describe()` hints on all string fields for LLM prompting.
- Headlines follow the canonical `headlineLead` / `headlineAccent?` / `headlineTrail?` pattern from Phase 1.

### Per-template section map

Each template declares which sections it supports and provides a skin component for each:

```
next-app/src/templates/opus-v1/
├── index.ts                # exports template metadata
├── sections.ts             # key -> skin component
├── layout.tsx              # thin shell: iterates enabled sections
├── styles.css
├── skins/
│   ├── Hero.tsx            # OpusV1 hero skin
│   ├── Marquee.tsx
│   ├── SummitOverview.tsx
│   └── ...
├── fixtures/
│   ├── hero.fixture.ts
│   └── ...
└── tests/
    ├── hero.test.ts
    └── ...
```

```ts
// opus-v1/sections.ts
import * as skins from './skins';
export const opusV1Sections: Record<string, SectionSkin> = {
  hero: skins.Hero,
  marquee: skins.Marquee,
  'summit-overview': skins.SummitOverview,
  'speakers-by-day': skins.SpeakersByDay,
  'faq': skins.Faq,
  'footer': skins.Footer,
  // … only the sections this template styles
};

export const opusV1SectionOrder: string[] = [
  'countdown-timer',       // if enabled
  'hero',
  'marquee',
  'summit-overview',
  'value-prop',
  'speakers-by-day',
  'testimonials-attendees',
  'faq',
  'footer',
];

// Subset rendered out of the box; operator can enable the rest in edit.
export const opusV1DefaultEnabledSections: string[] = [
  'hero',
  'summit-overview',
  'speakers-by-day',
  'faq',
  'footer',
];
```

A skin signature:

```ts
type SectionSkin<K extends keyof Catalog = any> = React.FC<{
  content: z.infer<Catalog[K]['schema']>;
  speakers: Record<string, Speaker>;
  funnelId: string;
}>;
```

### Template root (layout)

```tsx
// opus-v1/layout.tsx
export function OpusV1({
  sections,
  enabledSections,
  speakers,
  funnelId,
}: OpusV1Props) {
  const ordered = opusV1SectionOrder.filter(k => enabledSections.includes(k));
  return (
    <div className="opus-v1-root">
      {ordered.map(key => {
        const Skin = opusV1Sections[key];
        const content = sections[key];
        if (!Skin || !content) return null;
        return <Skin key={key} content={content} speakers={speakers} funnelId={funnelId} />;
      })}
      <OptinModal funnelId={funnelId} />
    </div>
  );
}
```

### Draft storage

`landing_page_drafts` table changes:

```php
Schema::table('landing_page_drafts', function (Blueprint $table) {
    $table->json('enabled_sections')->after('sections');
});
```

- `sections` (existing JSON) — per-section content, keyed by section key: `{ hero: {...}, marquee: {...}, faq: {...} }`.
- `enabled_sections` (new JSON array) — ordered list of included section keys: `['hero', 'marquee', 'summit-overview', ...]`.

Disabling a section at edit time removes the key from `enabled_sections` but leaves the content in `sections` (reversible).

### Generate flow

1. Operator opens Generate Landing Pages form. Picks template(s) from the pool and how many variants.
2. Submits. **No section checklist** — the form is just the template picker.
3. `GenerateLandingPagesAction`:
   - Reads `template-manifest.json`.
   - Dispatches one `GenerateLandingPageVersionJob` per version. Each job calls `TemplateFiller::fill($template, $summitContext)`.
4. `TemplateFiller` builds the effective JSON Schema = the full union of all `supportedSections` schemas for the chosen template. Sends to Claude; receives one JSON blob shaped as `{ hero: {...}, marquee: {...}, faq: {...}, … }` covering every section the template supports.
5. Job stores:
   - `sections` = the filled JSON blob (every supported section has content).
   - `enabled_sections` = the template's `defaultEnabledSections`, ordered per template's `sectionOrder`.

Nothing about the LLM contract changes. We just call it with the template's full supported-sections schema.

### Render flow (Next.js)

1. Request hits `/preview/{token}` (unchanged).
2. Next.js looks up draft + template.
3. Renders `<OpusV1 sections={draft.sections} enabledSections={draft.enabled_sections} speakers={speakers} funnelId={funnelId} />`.
4. Layout filters template order by enabled set and renders each skin.

### Edit flow (primary curation surface)

`EditLandingPageDraftPage` (Phase 1.5 Task C2) gets extended. Since generation always fills every supported section, the edit page is where the operator curates the page:

1. Form shows one fieldset per entry in the template's `supportedSections`, in template order — every section filled by AI is editable.
2. Each fieldset has:
   - A toggle "Include on page" (initial state = `enabled_sections` contains this key).
   - All schema fields, rendered via the existing `FilamentSchemaMapper` over that section's JSON Schema.
   - Visual treatment: enabled fieldsets render at full opacity; disabled ones render dimmed/collapsed (content preserved but visually subordinate).
3. Saving persists `sections` (content) and `enabled_sections` (the ordered list of currently-on keys, matching template `sectionOrder`).
4. No "add section" picker needed — every supported section is already there; the operator just flips toggles.

Phase 3+ adds per-section copy regeneration via Claude. Not in this spec.

### Manifest export

`pnpm build:templates` now emits:

```jsonc
{
  "catalog": {
    "hero":    { "label": "Hero", "tier": "core",     "pageTypes": ["landing"], "schema": { /* json-schema */ } },
    "marquee": { "label": "Press marquee", "tier": "optional", "pageTypes": ["landing"], "schema": { /* json-schema */ } }
    // ...
  },
  "templates": [
    {
      "key": "opus-v1",
      "label": "Opus V1 — Editorial Serif",
      "supportedSections":       ["hero", "marquee", "summit-overview", ...],
      "sectionOrder":            ["countdown-timer", "hero", "marquee", ...],
      "defaultEnabledSections":  ["hero", "summit-overview", "speakers-by-day", "faq", "footer"]
    },
    // ...
  ]
}
```

Laravel reads the same file. The `ManifestIntegrityTest` from Phase 1.5 Task A4 is extended to assert:
- Every section key used by any template appears in `catalog`.
- Every core section in `catalog` is supported by every template (catching missing skins at build time).
- `sectionOrder` contains only keys in `supportedSections`.

## Operator UX

### Generate form (simple — no section checklist)

```
┌────────────────────────────────────────────────────────────────┐
│ Generate Landing Pages                                         │
│                                                                │
│ Summit: Parenting Adhd Summit 2026                             │
│ Variants per template: [3]                                     │
│                                                                │
│ Template pool (pick one or more, AI generates variants each):  │
│  ▣ Opus V1 — Editorial Serif                                   │
│  ▣ Opus V2 — Modernist Sans                                    │
│  ▢ Opus V3 — Magazine                                          │
│  ▢ Opus V4 — Vibrant Display                                   │
│  ...                                                            │
│                                                                │
│ [Cancel]                                          [Generate]   │
└────────────────────────────────────────────────────────────────┘
```

AI fills **every** section the chosen template supports. What renders out of the box is the template's `defaultEnabledSections`. Curation happens in edit.

### Edit page (where operator curates)

```
┌────────────────────────────────────────────────────────────────┐
│ Edit Landing Page Draft                   [Preview] [Publish]  │
│                                                                │
│ Template: Opus V1 — Editorial Serif                            │
│                                                                │
│ ┌─ Hero ─────────────────────── [■] ON  [edit fields ▸] ──┐   │
│ └─────────────────────────────────────────────────────────┘   │
│ ┌─ Summit overview ───────────── [■] ON  [edit fields ▸] ──┐  │
│ └─────────────────────────────────────────────────────────┘   │
│ ┌─ Press marquee (dim) ──────── [□] OFF [edit fields ▸] ──┐   │
│ │  (content filled by AI, not rendering on live page)      │   │
│ └─────────────────────────────────────────────────────────┘   │
│ ┌─ Speakers by day ───────────── [■] ON  [edit fields ▸] ──┐  │
│ └─────────────────────────────────────────────────────────┘   │
│ ┌─ Value prop (dim) ───────────  [□] OFF [edit fields ▸] ──┐  │
│ └─────────────────────────────────────────────────────────┘   │
│ ...                                                            │
│                                           [Save draft]         │
└────────────────────────────────────────────────────────────────┘
```

Every supported section is listed in template order. Toggle switches enable/disable; dimmed rows indicate disabled sections whose content is kept if the operator changes their mind.

## Section catalog — initial keys

| Key | Tier | Description |
|---|---|---|
| `hero` | core | Above-the-fold headline, subhead, dates, primary CTA |
| `summit-overview` | core | "What is this summit" narrative block |
| `speakers-by-day` | core | Speakers grouped by day with session titles |
| `host-founder` | core | Meet-the-host / founder story |
| `faq` | core | Q&A list |
| `footer` | core | Legal + contact links |
| `marquee` | optional | Press / media logos scroll |
| `value-prop` | optional | "What you'll get" outcomes list |
| `reasons-to-attend` | optional | Numbered reasons |
| `who-attends` | optional | Audience segments |
| `testimonials-attendees` | optional | Past attendee quotes |
| `testimonials-speakers` | optional | Expert video testimonial callouts |
| `stats-hero` | optional | Big social-proof numbers |
| `facts-stats` | optional | Problem-space data points |
| `why-this-matters` | optional | Impact / mission statement |
| `bonus-stack` | optional | Free bonuses for registering |
| `social-proof-followers` | optional | Follower counts + review badges |
| `references` | optional | Academic citations |
| `countdown-timer` | optional | Pre-event timer |
| `event-status-banner` | optional | "Starting soon" / "Ended" banner |
| `capability-statement` | optional | "You'll gain X, Y, Z" |

The `optin-modal` is not a catalog entry — it's always mounted by the template root regardless of enabled sections, because every CTA targets it.

## Migration path

Incremental per template. Each template's migration is a single commit:

1. **Define section schemas.** Pick opus-v1 as the reference; extract each sub-section of its current Zod schema into `src/sections/<key>.schema.ts`. Align the other 7 templates' schemas to these shapes (field names, requireds, bounds).
2. **Extract skin components.** For each template, split the current monolithic `.tsx` into per-section skin files under `templates/<key>/skins/`. Most templates already have internal sub-components — this is mostly moving code into files and adding the skin signature.
3. **Wire sections map + order.** Create `<key>/sections.ts` and export the order array.
4. **Layout shell.** Replace the monolithic template component with the layout shell that iterates enabled sections.
5. **Fixtures.** Split the existing fixture into per-section fixtures; the old fixture becomes the union of all core + all optional sections so existing tests still validate a full render.
6. **Tests.** Each section schema gets its own test; visual smoke test per template stays.
7. **Registry update.** Template registry entry now stores `supportedSections` + `sectionOrder` (already covered by the manifest change).
8. **DB migration.** Add `enabled_sections` column. Backfill existing drafts with every key that has content in `sections`.

One template per commit means 8 commits, each shippable on its own because old drafts still render (backfilled enabled_sections = current behaviour).

## Risk

- **Cross-template schema alignment friction.** If opus-v1's `hero` has `{ headlineLead, headlineAccent?, dates }` but adhd-summit's has `{ title, eyebrow, dates }`, we have to pick one and refactor the other. Mitigation: pick opus-v1 as canonical because Phase 1 reviewers already cleaned it up. The Phase 1.5 plan treats opus-v2 as the "most polished reference" — same idea applies.
- **Template aesthetic breaks when a core section is missing a skin.** Prevented at build time by the `ManifestIntegrityTest` extension (every core section must be skinned by every template).
- **LLM token budget on the "kitchen sink" selection.** If operator checks every optional section, the effective schema is large. Mitigation: budget-check in `TemplateFiller` — if merged schema fields exceed a threshold, log a warning and continue. Real ceiling is Claude's context, which we're far from.
- **Order collisions.** Template author owns the order; catalog's `defaultOrder` is only used as a hint in the Filament UI sort. No render-time collision possible.

## Testing strategy

- **Section schema tests** (new, per section): accept fixture; reject missing required; reject `.min(1)` empties; reject malformed UUIDs. One file per section under `src/sections/<key>.schema.test.ts`.
- **Per-template skin smoke tests** (refactored): render each skin with its fixture; assert no React errors; assert key DOM structure (headline present, etc.).
- **Layout test per template**: render with all core + some optional; assert enabled sections render, disabled don't, order matches `sectionOrder`.
- **Manifest integrity** (extended): every core section skinned by every template; every template's `sectionOrder` subset of its `supportedSections`; catalog + manifest in sync with filesystem.
- **End-to-end** (Pest browser): generate with core-only, generate with all-optional-on; assert drafts ready and render correctly.

## What changes vs Phase 1.5

| Phase 1.5 | Phase 2 |
|---|---|
| Template = one Zod schema, one component | Template = layout shell + N skin components, composed from catalog |
| Generate = fill one schema | Generate = fill union of template's `supportedSections` schemas |
| Generate form has no section choices | Still no section choices — UX doesn't regress |
| Edit = one form from one schema | Edit = one fieldset per supported section + on/off toggle (curation lives here) |
| Manifest lists templates | Manifest lists templates (+ `defaultEnabledSections`) + catalog |
| `drafts.sections` = full content | `drafts.sections` = keyed content; `drafts.enabled_sections` = render list, seeded from `defaultEnabledSections` |

## Phase 2 task outline (pre-plan)

These become the skeleton of the implementation plan in the next step.

1. Extract shared section schemas from opus-v1 into `src/sections/` (canonical set).
2. Refactor opus-v1 into layout shell + skins + declare `defaultEnabledSections`.
3. Build catalog + `defaultEnabledSections` export in `build:templates`.
4. Add `enabled_sections` migration + backfill.
5. Update `TemplateFiller` to build the effective schema from template's supported set + pass to Claude.
6. Update `GenerateLandingPageVersionJob` to seed `enabled_sections` from `defaultEnabledSections`.
7. Update edit Filament page with per-section fieldsets + on/off toggles.
8. Refactor opus-v2.
9. Refactor opus-v3.
10. Refactor opus-v4.
11. Refactor variant-1.
12. Refactor variant-2.
13. Refactor variant-3.
14. Refactor adhd-summit.
15. Extend `ManifestIntegrityTest` with catalog + skin coverage asserts.
16. End-to-end smoke (browser): generate + toggle sections in edit + publish.

One commit per task. No generate-form changes — the form stays template-pool-only.

## Open items for plan step

- **Migration rollout strategy.** Ship opus-v1 as a migrated template alongside the other 7 legacy monolithic templates, or complete all 8 atomically before shipping? Recommendation: per-template incremental — the generate pipeline checks whether a template's manifest entry carries `supportedSections`; if yes, use the new merged-schema path; if no, use the Phase 1 whole-template path. This keeps every commit deployable and removes the legacy path once the last template migrates.
