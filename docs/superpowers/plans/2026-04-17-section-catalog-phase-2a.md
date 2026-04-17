# Section Catalog — Phase 2a Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lay the section-catalog foundation AND migrate opus-v1 as the reference template. After this plan, opus-v1 renders through the new section pipeline; the other 7 templates keep their current Phase 1 render path and are untouched. Phase 2b migrates the remaining templates.

**Architecture:** Shared Zod section schemas in `next-app/src/sections/`. Each template declares `supportedSections` + `sectionOrder` + `defaultEnabledSections` in its registry entry. AI fills the full union of a template's supported section schemas at generate time. Operator curates in the edit page. A template without `supportedSections` in the manifest falls back to the Phase 1 monolithic render path.

**Tech Stack:** Next.js 16.2 · React 19.2 · Zod v4 · Laravel 13 · PHP 8.3 · Filament v4 · Pest 4 · `opis/json-schema`.

**Spec:** `docs/superpowers/specs/2026-04-17-section-catalog-design.md` (commits `3395ccf` + `d5664bc`).

---

## Prerequisites

- Phase 1 is merged and green in dev (8 templates live, commit `430798c` or later on `experiment/framer-variants-2026-04-17`).
- Phase 1.5 edit page (Task C2) is **not** required for Phase 2a — this plan extends or creates the edit page as needed.
- `ANTHROPIC_API_KEY` in `.env`.
- `pnpm build:templates` runs cleanly.
- Tests green: `./vendor/bin/pest` and `cd next-app && pnpm test`.

---

## File Map

### New files

| Path | Responsibility |
|---|---|
| `next-app/src/sections/catalog.ts` | Registry: key → `{ label, description, pageTypes, tier, schema, defaultOrder }` |
| `next-app/src/sections/types.ts` | Shared types: `PageType`, `SectionTier`, `CatalogEntry`, `SectionSkin<K>` |
| `next-app/src/sections/hero.schema.ts` | Hero section Zod schema (canonical) |
| `next-app/src/sections/masthead.schema.ts` | Masthead/nav section schema |
| `next-app/src/sections/marquee.schema.ts` | Press marquee schema |
| `next-app/src/sections/summit-overview.schema.ts` | Summit-overview schema |
| `next-app/src/sections/value-prop.schema.ts` | What-you'll-get schema |
| `next-app/src/sections/speakers-by-day.schema.ts` | Speakers schema |
| `next-app/src/sections/bonus-stack.schema.ts` | Bonus stack schema |
| `next-app/src/sections/supplement.schema.ts` | Free-gift supplement schema |
| `next-app/src/sections/host-founder.schema.ts` | Founders/host schema |
| `next-app/src/sections/testimonials-attendees.schema.ts` | Attendee testimonials schema |
| `next-app/src/sections/pull-quote.schema.ts` | Pull-quote divider schema |
| `next-app/src/sections/facts-stats.schema.ts` | Problem-space facts schema |
| `next-app/src/sections/reasons-to-attend.schema.ts` | Reasons schema |
| `next-app/src/sections/stats-hero.schema.ts` | Big-numbers social proof schema |
| `next-app/src/sections/faq.schema.ts` | FAQ schema |
| `next-app/src/sections/closing-cta.schema.ts` | Final CTA schema |
| `next-app/src/sections/footer.schema.ts` | Footer schema |
| `next-app/src/sections/__tests__/schemas.test.ts` | Schema acceptance tests (one describe block per section) |
| `next-app/src/templates/opus-v1/index.ts` | Re-exports of schema, component, sections map |
| `next-app/src/templates/opus-v1/sections.ts` | `opusV1Sections` (key→skin) + `opusV1SectionOrder` + `opusV1DefaultEnabledSections` |
| `next-app/src/templates/opus-v1/layout.tsx` | Thin layout shell that iterates enabled sections |
| `next-app/src/templates/opus-v1/skins/Masthead.tsx` | Extracted skin |
| `next-app/src/templates/opus-v1/skins/Hero.tsx` | Extracted skin |
| `next-app/src/templates/opus-v1/skins/Marquee.tsx` | Extracted from `FeaturedIn` |
| `next-app/src/templates/opus-v1/skins/StatsHero.tsx` | Extracted from `Stats` |
| `next-app/src/templates/opus-v1/skins/SummitOverview.tsx` | Extracted from `WhatIsThis` |
| `next-app/src/templates/opus-v1/skins/SpeakersByDay.tsx` | Extracted from `ContributorsByDay` |
| `next-app/src/templates/opus-v1/skins/ValueProp.tsx` | Extracted from `Transformations` |
| `next-app/src/templates/opus-v1/skins/Supplement.tsx` | Extracted skin |
| `next-app/src/templates/opus-v1/skins/BonusStack.tsx` | Extracted from `BonusSidebars` |
| `next-app/src/templates/opus-v1/skins/HostFounder.tsx` | Extracted from `Founders` |
| `next-app/src/templates/opus-v1/skins/TestimonialsAttendees.tsx` | Extracted from `Testimonials` |
| `next-app/src/templates/opus-v1/skins/PullQuote.tsx` | Extracted skin |
| `next-app/src/templates/opus-v1/skins/FactsStats.tsx` | Extracted from `Figures` |
| `next-app/src/templates/opus-v1/skins/ReasonsToAttend.tsx` | Extracted from `Shifts` |
| `next-app/src/templates/opus-v1/skins/Faq.tsx` | Extracted skin |
| `next-app/src/templates/opus-v1/skins/ClosingCta.tsx` | Extracted from `FinalCTA` |
| `next-app/src/templates/opus-v1/skins/Footer.tsx` | Extracted skin |
| `database/migrations/2026_04_17_170000_add_enabled_sections_to_landing_page_drafts.php` | Adds `enabled_sections` JSON column |
| `app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php` | Per-section Filament edit form with on/off toggles |
| `resources/views/filament/pages/edit-landing-page-draft.blade.php` | Blade view for the edit page |
| `tests/Feature/Filament/EditLandingPageDraftPageTest.php` | Edit page tests |
| `tests/Feature/Services/TemplateFillerSectionsTest.php` | Tests `TemplateFiller` uses supported-sections schema for opus-v1 |

### Modified files

| Path | What changes |
|---|---|
| `next-app/src/templates/opus-v1.schema.ts` | Re-exports composed from new section schemas (keeps `OpusV1Schema` export so other code still compiles) |
| `next-app/src/templates/OpusV1.tsx` | Becomes a thin re-export of `./opus-v1/layout`; old monolithic component archived in git |
| `next-app/src/templates/registry.ts` | `opus-v1` entry gains `supportedSections`, `sectionOrder`, `defaultEnabledSections` |
| `next-app/scripts/export-template-manifest.ts` | Emits catalog block + per-template section fields |
| `next-app/public/template-manifest.json` | Regenerated |
| `next-app/src/app/preview/[token]/page.tsx` | Reads `enabled_sections` from draft; passes to template |
| `next-app/src/app/f/[funnel]/optin/page.tsx` | Same for published render (if it reads similar shape) |
| `app/Services/Templates/TemplateFiller.php` | For templates that declare `supportedSections`, builds effective JSON Schema from the manifest's `sectionSchemas` instead of top-level `jsonSchema` |
| `app/Services/Templates/TemplateRegistry.php` | Exposes `supportedSections`, `sectionOrder`, `defaultEnabledSections`, `sectionSchemas` from the manifest |
| `app/Jobs/GenerateLandingPageVersionJob.php` | Seeds `enabled_sections` from template's `defaultEnabledSections` when the template supports sections |
| `app/Models/LandingPageDraft.php` | Casts `enabled_sections` to array |
| `app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php` | Adds `Edit` action linking to `EditLandingPageDraftPage` |
| `resources/views/filament/pages/landing-page-drafts.blade.php` | Adds `Edit` button |
| `tests/Unit/Services/Templates/ManifestIntegrityTest.php` | Extends to assert catalog/skin coverage + `defaultEnabledSections ⊂ supportedSections` |

---

## Task Order

```
T1  Shared section schemas (foundation, unblocks everything)
T2  Catalog (imports all schemas)
T3  opus-v1 skin extraction (refactor, no behaviour change yet)
T4  opus-v1 sections.ts + layout.tsx + enabled_sections rendering
T5  Manifest export changes (adds supportedSections/order/default + sectionSchemas)
T6  DB migration enabled_sections + Draft cast
T7  TemplateRegistry (PHP) reads new manifest fields
T8  TemplateFiller uses supported-sections schema
T9  GenerateLandingPageVersionJob seeds enabled_sections
T10 Preview/public render routes pass enabled_sections
T11 EditLandingPageDraftPage with per-section fieldsets + toggles
T12 Integrity test extensions
T13 End-to-end smoke + cleanup
```

Strict sequence: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12 → T13. No parallelization in Phase 2a — each task depends on the previous.

One commit per task.

---

## Task T1: Shared section schemas

Extract the 17 distinct schema shapes from `opus-v1.schema.ts` into dedicated files under `next-app/src/sections/`. Each file exports a named Zod schema and an inferred TS type.

**Files:**
- Create: `next-app/src/sections/types.ts`
- Create: `next-app/src/sections/hero.schema.ts`
- Create: `next-app/src/sections/masthead.schema.ts`
- Create: `next-app/src/sections/marquee.schema.ts`
- Create: `next-app/src/sections/summit-overview.schema.ts`
- Create: `next-app/src/sections/value-prop.schema.ts`
- Create: `next-app/src/sections/speakers-by-day.schema.ts`
- Create: `next-app/src/sections/bonus-stack.schema.ts`
- Create: `next-app/src/sections/supplement.schema.ts`
- Create: `next-app/src/sections/host-founder.schema.ts`
- Create: `next-app/src/sections/testimonials-attendees.schema.ts`
- Create: `next-app/src/sections/pull-quote.schema.ts`
- Create: `next-app/src/sections/facts-stats.schema.ts`
- Create: `next-app/src/sections/reasons-to-attend.schema.ts`
- Create: `next-app/src/sections/stats-hero.schema.ts`
- Create: `next-app/src/sections/faq.schema.ts`
- Create: `next-app/src/sections/closing-cta.schema.ts`
- Create: `next-app/src/sections/footer.schema.ts`
- Create: `next-app/src/sections/__tests__/schemas.test.ts`

- [ ] **Step 1: Create the shared types file**

`next-app/src/sections/types.ts`:

```ts
import type { z } from 'zod';

export type PageType = 'landing' | 'sales' | 'checkout' | 'thankyou';
export type SectionTier = 'core' | 'optional';

export type CatalogEntry = {
  key: string;
  label: string;
  description: string;
  pageTypes: PageType[];
  tier: SectionTier;
  schema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  defaultOrder: number;
};

export type SectionSkin<Content> = React.FC<{
  content: Content;
  speakers: Record<string, import('../templates/types').Speaker>;
  funnelId: string;
}>;
```

- [ ] **Step 2: Create hero.schema.ts**

Copy the `hero` shape from `opus-v1.schema.ts:15-28`. The canonical shape:

```ts
// next-app/src/sections/hero.schema.ts
import { z } from 'zod';

export const HeroSchema = z.object({
  issueLabel: z.string().min(1),
  dateRangeLabel: z.string().min(1),
  metaLabel: z.string().min(1),
  readerCount: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(3),
  subheadline: z.string().min(3),
  ctaLabel: z.string().min(1),
  ctaSubtext: z.string().min(1).optional(),
  ratingText: z.string().min(1),
  figCaption: z.string().min(1),
  heroSpeakerIds: z.array(z.string().uuid()).min(1).max(4),
});

export type HeroContent = z.infer<typeof HeroSchema>;
```

- [ ] **Step 3: Create masthead.schema.ts**

```ts
// next-app/src/sections/masthead.schema.ts
import { z } from 'zod';

export const MastheadSchema = z.object({
  volume: z.string().min(1),
  eyebrow: z.string().min(1),
});

export type MastheadContent = z.infer<typeof MastheadSchema>;
```

- [ ] **Step 4: Create marquee.schema.ts**

```ts
// next-app/src/sections/marquee.schema.ts
import { z } from 'zod';

export const MarqueeSchema = z.object({
  items: z.array(z.string().min(1)).min(3).max(20),
});

export type MarqueeContent = z.infer<typeof MarqueeSchema>;
```

Note: originally stored as `featuredIn: string[]` on opus-v1. We wrap in `{items}` so the section has an object shape (consistent with others).

- [ ] **Step 5: Create summit-overview.schema.ts**

Combines `whatIsThis` and `featureBand` (they render as one section with a sidebar):

```ts
// next-app/src/sections/summit-overview.schema.ts
import { z } from 'zod';

export const SummitOverviewSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  bodyParagraphs: z.array(z.string().min(1)).length(2),
  ctaLabel: z.string().min(1),
  featureBand: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    body: z.string().min(1),
    bullets: z.array(z.string()).length(3),
  }),
});

export type SummitOverviewContent = z.infer<typeof SummitOverviewSchema>;
```

- [ ] **Step 6: Create value-prop.schema.ts**

From `transformations`:

```ts
// next-app/src/sections/value-prop.schema.ts
import { z } from 'zod';

export const ValuePropSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  subhead: z.string().min(1),
  items: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  })).length(6),
});

export type ValuePropContent = z.infer<typeof ValuePropSchema>;
```

- [ ] **Step 7: Create speakers-by-day.schema.ts**

```ts
// next-app/src/sections/speakers-by-day.schema.ts
import { z } from 'zod';

export const SpeakersByDaySchema = z.object({
  days: z.array(z.object({
    dayLabel: z.string().min(1),
    dayDate: z.string().date(),
    dayTheme: z.string().min(1).optional(),
    roman: z.string().min(1).optional(),
    speakerIds: z.array(z.string().uuid()),
  })).min(1),
});

export type SpeakersByDayContent = z.infer<typeof SpeakersByDaySchema>;
```

- [ ] **Step 8: Create bonus-stack.schema.ts**

From `bonusStackSection + bonusStack`:

```ts
// next-app/src/sections/bonus-stack.schema.ts
import { z } from 'zod';

export const BonusStackSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  subhead: z.string().min(1),
  ctaLabel: z.string().min(1),
  items: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    valueLabel: z.string().min(1),
    bullets: z.array(z.string().min(1)).min(1).max(5).optional(),
  })).min(1).max(5),
});

export type BonusStackContent = z.infer<typeof BonusStackSchema>;
```

- [ ] **Step 9: Create supplement.schema.ts**

```ts
// next-app/src/sections/supplement.schema.ts
import { z } from 'zod';

export const SupplementSchema = z.object({
  cardLabel: z.string().min(1),
  cardTitle: z.string().min(1),
  cardFooter: z.string().min(1),
  cardVolume: z.string().min(1),
  badgeLabel: z.string().min(1),
  eyebrow: z.string().min(1),
  headline: z.string().min(1),
  body: z.string().min(1),
  bullets: z.array(z.string().min(1)).min(2).max(6),
  ctaLabel: z.string().min(1),
});

export type SupplementContent = z.infer<typeof SupplementSchema>;
```

- [ ] **Step 10: Create host-founder.schema.ts**

From `founders`:

```ts
// next-app/src/sections/host-founder.schema.ts
import { z } from 'zod';

export const HostFounderSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  items: z.array(z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    quote: z.string().min(1),
    initials: z.string().min(1).max(4),
  })).length(2),
});

export type HostFounderContent = z.infer<typeof HostFounderSchema>;
```

- [ ] **Step 11: Create testimonials-attendees.schema.ts**

```ts
// next-app/src/sections/testimonials-attendees.schema.ts
import { z } from 'zod';

export const TestimonialsAttendeesSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  subhead: z.string().min(1),
  items: z.array(z.object({
    quote: z.string().min(1),
    name: z.string().min(1),
    location: z.string().min(1),
    initials: z.string().min(1).max(4),
  })).length(3),
});

export type TestimonialsAttendeesContent = z.infer<typeof TestimonialsAttendeesSchema>;
```

- [ ] **Step 12: Create pull-quote.schema.ts**

```ts
// next-app/src/sections/pull-quote.schema.ts
import { z } from 'zod';

export const PullQuoteSchema = z.object({
  quote: z.string().min(1),
  attribution: z.string().min(1),
});

export type PullQuoteContent = z.infer<typeof PullQuoteSchema>;
```

- [ ] **Step 13: Create facts-stats.schema.ts**

From `figures`:

```ts
// next-app/src/sections/facts-stats.schema.ts
import { z } from 'zod';

export const FactsStatsSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  subhead: z.string().min(1),
  items: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1),
    description: z.string().min(1),
  })).length(6),
});

export type FactsStatsContent = z.infer<typeof FactsStatsSchema>;
```

- [ ] **Step 14: Create reasons-to-attend.schema.ts**

From `shifts`:

```ts
// next-app/src/sections/reasons-to-attend.schema.ts
import { z } from 'zod';

export const ReasonsToAttendSchema = z.object({
  roman: z.string().min(1),
  headline: z.string().min(1),
  items: z.array(z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  })).length(5),
});

export type ReasonsToAttendContent = z.infer<typeof ReasonsToAttendSchema>;
```

- [ ] **Step 15: Create stats-hero.schema.ts**

From `socialProof`:

```ts
// next-app/src/sections/stats-hero.schema.ts
import { z } from 'zod';

export const StatsHeroSchema = z.object({
  statLabel1: z.string().min(1), statValue1: z.string().min(1),
  statLabel2: z.string().min(1), statValue2: z.string().min(1),
  statLabel3: z.string().min(1), statValue3: z.string().min(1),
});

export type StatsHeroContent = z.infer<typeof StatsHeroSchema>;
```

- [ ] **Step 16: Create faq.schema.ts**

```ts
// next-app/src/sections/faq.schema.ts
import { z } from 'zod';

export const FaqSchema = z.object({
  items: z.array(z.object({
    question: z.string().min(1),
    answer: z.string().min(1),
  })).min(3).max(10),
});

export type FaqContent = z.infer<typeof FaqSchema>;
```

- [ ] **Step 17: Create closing-cta.schema.ts**

From `closing`:

```ts
// next-app/src/sections/closing-cta.schema.ts
import { z } from 'zod';

export const ClosingCtaSchema = z.object({
  eyebrow: z.string().min(1).optional(),
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  ctaLabel: z.string().min(1),
  fineprint: z.string().min(1).optional(),
});

export type ClosingCtaContent = z.infer<typeof ClosingCtaSchema>;
```

- [ ] **Step 18: Create footer.schema.ts**

```ts
// next-app/src/sections/footer.schema.ts
import { z } from 'zod';

export const FooterSchema = z.object({
  tagline: z.string().min(1),
  volume: z.string().min(1),
  copyright: z.string().min(1),
});

export type FooterContent = z.infer<typeof FooterSchema>;
```

- [ ] **Step 19: Write schema acceptance tests**

`next-app/src/sections/__tests__/schemas.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { HeroSchema } from '../hero.schema';
import { MastheadSchema } from '../masthead.schema';
import { MarqueeSchema } from '../marquee.schema';
import { SummitOverviewSchema } from '../summit-overview.schema';
import { ValuePropSchema } from '../value-prop.schema';
import { SpeakersByDaySchema } from '../speakers-by-day.schema';
import { BonusStackSchema } from '../bonus-stack.schema';
import { SupplementSchema } from '../supplement.schema';
import { HostFounderSchema } from '../host-founder.schema';
import { TestimonialsAttendeesSchema } from '../testimonials-attendees.schema';
import { PullQuoteSchema } from '../pull-quote.schema';
import { FactsStatsSchema } from '../facts-stats.schema';
import { ReasonsToAttendSchema } from '../reasons-to-attend.schema';
import { StatsHeroSchema } from '../stats-hero.schema';
import { FaqSchema } from '../faq.schema';
import { ClosingCtaSchema } from '../closing-cta.schema';
import { FooterSchema } from '../footer.schema';

describe('section schemas', () => {
  it('HeroSchema rejects empty headline', () => {
    const res = HeroSchema.safeParse({
      issueLabel: 'I', dateRangeLabel: 'D', metaLabel: 'M', readerCount: '1',
      eyebrow: 'E', headline: '', subheadline: 'sub', ctaLabel: 'cta',
      ratingText: 'r', figCaption: 'f',
      heroSpeakerIds: ['00000000-0000-4000-8000-000000000000'],
    });
    expect(res.success).toBe(false);
  });

  it('MarqueeSchema enforces min 3 items', () => {
    const res = MarqueeSchema.safeParse({ items: ['a', 'b'] });
    expect(res.success).toBe(false);
  });

  it('SummitOverviewSchema requires exactly 2 paragraphs', () => {
    const base = {
      roman: 'II.', headline: 'H', ctaLabel: 'go',
      featureBand: { eyebrow: 'e', headline: 'h', body: 'b', bullets: ['1', '2', '3'] },
    };
    expect(SummitOverviewSchema.safeParse({ ...base, bodyParagraphs: ['one'] }).success).toBe(false);
    expect(SummitOverviewSchema.safeParse({ ...base, bodyParagraphs: ['one', 'two'] }).success).toBe(true);
  });

  it('ValuePropSchema requires exactly 6 items', () => {
    const mk = (n: number) => ({
      roman: 'IV.', headline: 'H', subhead: 'S',
      items: Array.from({ length: n }, (_, i) => ({ title: `t${i}`, description: `d${i}` })),
    });
    expect(ValuePropSchema.safeParse(mk(5)).success).toBe(false);
    expect(ValuePropSchema.safeParse(mk(6)).success).toBe(true);
  });

  it('SpeakersByDaySchema rejects non-uuid speakerIds', () => {
    const res = SpeakersByDaySchema.safeParse({
      days: [{ dayLabel: 'Day 1', dayDate: '2026-04-22', speakerIds: ['not-uuid'] }],
    });
    expect(res.success).toBe(false);
  });

  it('FaqSchema requires min 3 items', () => {
    const res = FaqSchema.safeParse({
      items: [{ question: 'q', answer: 'a' }, { question: 'q', answer: 'a' }],
    });
    expect(res.success).toBe(false);
  });

  it('StatsHeroSchema accepts 3 stat pairs', () => {
    const res = StatsHeroSchema.safeParse({
      statLabel1: 'a', statValue1: '1',
      statLabel2: 'b', statValue2: '2',
      statLabel3: 'c', statValue3: '3',
    });
    expect(res.success).toBe(true);
  });

  it('FooterSchema rejects missing tagline', () => {
    const res = FooterSchema.safeParse({ volume: 'v', copyright: 'c' });
    expect(res.success).toBe(false);
  });

  // Sanity: the rest parse successfully with minimal valid input
  it('all other schemas round-trip valid fixtures', () => {
    expect(MastheadSchema.safeParse({ volume: 'v', eyebrow: 'e' }).success).toBe(true);
    expect(BonusStackSchema.safeParse({
      roman: 'V.', headline: 'H', subhead: 'S', ctaLabel: 'cta',
      items: [{ title: 't', description: 'd', valueLabel: 'v' }],
    }).success).toBe(true);
    expect(SupplementSchema.safeParse({
      cardLabel: 'l', cardTitle: 't', cardFooter: 'f', cardVolume: 'v',
      badgeLabel: 'b', eyebrow: 'e', headline: 'h', body: 'body',
      bullets: ['a', 'b'], ctaLabel: 'cta',
    }).success).toBe(true);
    expect(HostFounderSchema.safeParse({
      roman: 'VI.', headline: 'H',
      items: [
        { name: 'n', role: 'r', quote: 'q', initials: 'NN' },
        { name: 'n', role: 'r', quote: 'q', initials: 'NN' },
      ],
    }).success).toBe(true);
    expect(TestimonialsAttendeesSchema.safeParse({
      roman: 'VII.', headline: 'H', subhead: 'S',
      items: [
        { quote: 'q', name: 'n', location: 'l', initials: 'AB' },
        { quote: 'q', name: 'n', location: 'l', initials: 'AB' },
        { quote: 'q', name: 'n', location: 'l', initials: 'AB' },
      ],
    }).success).toBe(true);
    expect(PullQuoteSchema.safeParse({ quote: 'q', attribution: 'a' }).success).toBe(true);
    expect(FactsStatsSchema.safeParse({
      roman: 'VIII.', headline: 'H', subhead: 'S',
      items: Array.from({ length: 6 }, () => ({ label: 'l', value: 'v', description: 'd' })),
    }).success).toBe(true);
    expect(ReasonsToAttendSchema.safeParse({
      roman: 'IX.', headline: 'H',
      items: Array.from({ length: 5 }, () => ({ title: 't', description: 'd' })),
    }).success).toBe(true);
    expect(ClosingCtaSchema.safeParse({
      headline: 'H', subheadline: 'S', ctaLabel: 'cta',
    }).success).toBe(true);
  });
});
```

- [ ] **Step 20: Run schema tests**

```
cd next-app && pnpm test src/sections/__tests__/schemas.test.ts
```

Expect: green.

- [ ] **Step 21: Commit**

```
git add next-app/src/sections/
git commit -m "feat(sections): extract canonical shared section schemas from opus-v1"
```

---

## Task T2: Catalog

Assemble the catalog using the section schemas from T1. This is the single source of truth for which sections exist, their tier, and their defaults.

**Files:**
- Create: `next-app/src/sections/catalog.ts`

- [ ] **Step 1: Write the catalog**

`next-app/src/sections/catalog.ts`:

```ts
import type { CatalogEntry } from './types';
import { HeroSchema } from './hero.schema';
import { MastheadSchema } from './masthead.schema';
import { MarqueeSchema } from './marquee.schema';
import { SummitOverviewSchema } from './summit-overview.schema';
import { ValuePropSchema } from './value-prop.schema';
import { SpeakersByDaySchema } from './speakers-by-day.schema';
import { BonusStackSchema } from './bonus-stack.schema';
import { SupplementSchema } from './supplement.schema';
import { HostFounderSchema } from './host-founder.schema';
import { TestimonialsAttendeesSchema } from './testimonials-attendees.schema';
import { PullQuoteSchema } from './pull-quote.schema';
import { FactsStatsSchema } from './facts-stats.schema';
import { ReasonsToAttendSchema } from './reasons-to-attend.schema';
import { StatsHeroSchema } from './stats-hero.schema';
import { FaqSchema } from './faq.schema';
import { ClosingCtaSchema } from './closing-cta.schema';
import { FooterSchema } from './footer.schema';

export const catalog: Record<string, CatalogEntry> = {
  masthead:               { key: 'masthead',               label: 'Masthead / nav',        description: 'Sticky top navigation',                        pageTypes: ['landing'], tier: 'core',     schema: MastheadSchema,               defaultOrder: 5  },
  hero:                   { key: 'hero',                   label: 'Hero',                  description: 'Above-the-fold headline + dates + CTA',        pageTypes: ['landing'], tier: 'core',     schema: HeroSchema,                   defaultOrder: 10 },
  marquee:                { key: 'marquee',                label: 'Press marquee',         description: 'Scrolling strip of publication names',         pageTypes: ['landing'], tier: 'optional', schema: MarqueeSchema,                defaultOrder: 20 },
  'stats-hero':           { key: 'stats-hero',             label: 'Big-numbers stats',     description: 'Three social-proof big numbers',               pageTypes: ['landing'], tier: 'optional', schema: StatsHeroSchema,              defaultOrder: 25 },
  'summit-overview':      { key: 'summit-overview',        label: 'Summit overview',       description: 'What this summit is about + editors note',     pageTypes: ['landing'], tier: 'core',     schema: SummitOverviewSchema,         defaultOrder: 30 },
  'speakers-by-day':      { key: 'speakers-by-day',        label: 'Speakers by day',       description: 'Speakers grouped by summit day',               pageTypes: ['landing'], tier: 'core',     schema: SpeakersByDaySchema,          defaultOrder: 40 },
  'value-prop':           { key: 'value-prop',             label: "What you'll get",       description: 'Transformations / outcomes list',              pageTypes: ['landing'], tier: 'optional', schema: ValuePropSchema,              defaultOrder: 50 },
  supplement:             { key: 'supplement',             label: 'Free supplement',       description: 'Free gift / included bonus card',              pageTypes: ['landing'], tier: 'optional', schema: SupplementSchema,             defaultOrder: 55 },
  'bonus-stack':          { key: 'bonus-stack',            label: 'Bonus stack',           description: 'Grid of included bonus items',                 pageTypes: ['landing'], tier: 'optional', schema: BonusStackSchema,             defaultOrder: 60 },
  'host-founder':         { key: 'host-founder',           label: 'Meet the host',         description: 'Founders / hosts with quotes',                 pageTypes: ['landing'], tier: 'core',     schema: HostFounderSchema,            defaultOrder: 70 },
  'testimonials-attendees': { key: 'testimonials-attendees', label: 'Attendee testimonials', description: 'Past attendee quotes',                        pageTypes: ['landing'], tier: 'optional', schema: TestimonialsAttendeesSchema,  defaultOrder: 80 },
  'pull-quote':           { key: 'pull-quote',             label: 'Pull quote',            description: 'Divider pull-quote band',                      pageTypes: ['landing'], tier: 'optional', schema: PullQuoteSchema,              defaultOrder: 85 },
  'facts-stats':          { key: 'facts-stats',            label: 'Problem-space facts',   description: 'Grid of problem-domain data points',           pageTypes: ['landing'], tier: 'optional', schema: FactsStatsSchema,             defaultOrder: 90 },
  'reasons-to-attend':    { key: 'reasons-to-attend',      label: 'Reasons to attend',     description: 'Numbered reasons to register',                 pageTypes: ['landing'], tier: 'optional', schema: ReasonsToAttendSchema,        defaultOrder: 95 },
  faq:                    { key: 'faq',                    label: 'FAQ',                   description: 'Expandable Q&A list',                          pageTypes: ['landing'], tier: 'core',     schema: FaqSchema,                    defaultOrder: 100 },
  'closing-cta':          { key: 'closing-cta',            label: 'Closing CTA',           description: 'Final call to action',                         pageTypes: ['landing'], tier: 'core',     schema: ClosingCtaSchema,             defaultOrder: 110 },
  footer:                 { key: 'footer',                 label: 'Footer',                description: 'Legal + links footer',                         pageTypes: ['landing'], tier: 'core',     schema: FooterSchema,                 defaultOrder: 120 },
};

export const catalogKeys = Object.keys(catalog) as (keyof typeof catalog)[];
```

- [ ] **Step 2: Add a catalog integrity test**

Append to `next-app/src/sections/__tests__/schemas.test.ts`:

```ts
import { catalog, catalogKeys } from '../catalog';

describe('catalog', () => {
  it('every entry has a schema', () => {
    for (const key of catalogKeys) {
      expect(catalog[key].schema).toBeDefined();
    }
  });

  it('no duplicate defaultOrder within a page type', () => {
    const byPageType: Record<string, number[]> = {};
    for (const key of catalogKeys) {
      const entry = catalog[key];
      for (const pt of entry.pageTypes) {
        byPageType[pt] ??= [];
        byPageType[pt].push(entry.defaultOrder);
      }
    }
    for (const [pt, orders] of Object.entries(byPageType)) {
      const unique = new Set(orders);
      expect(unique.size, `page-type ${pt} has duplicate defaultOrder`).toBe(orders.length);
    }
  });
});
```

- [ ] **Step 3: Run**

```
cd next-app && pnpm test src/sections/__tests__/schemas.test.ts
```

Expect: green.

- [ ] **Step 4: Commit**

```
git add next-app/src/sections/catalog.ts next-app/src/sections/__tests__/schemas.test.ts
git commit -m "feat(sections): catalog of 17 landing sections keyed by section name"
```

---

## Task T3: opus-v1 skin extraction

Move each sub-component from `OpusV1.tsx` into its own file under `templates/opus-v1/skins/`. Each skin accepts its section's content type (not the whole `OpusV1Content`) plus speakers + funnelId. No behavior change — this is a pure refactor verified by the existing template tests.

**Files:**
- Create: `next-app/src/templates/opus-v1/skins/Masthead.tsx`
- Create: `next-app/src/templates/opus-v1/skins/Hero.tsx`
- Create: `next-app/src/templates/opus-v1/skins/Marquee.tsx`
- Create: `next-app/src/templates/opus-v1/skins/StatsHero.tsx`
- Create: `next-app/src/templates/opus-v1/skins/SummitOverview.tsx`
- Create: `next-app/src/templates/opus-v1/skins/SpeakersByDay.tsx`
- Create: `next-app/src/templates/opus-v1/skins/ValueProp.tsx`
- Create: `next-app/src/templates/opus-v1/skins/Supplement.tsx`
- Create: `next-app/src/templates/opus-v1/skins/BonusStack.tsx`
- Create: `next-app/src/templates/opus-v1/skins/HostFounder.tsx`
- Create: `next-app/src/templates/opus-v1/skins/TestimonialsAttendees.tsx`
- Create: `next-app/src/templates/opus-v1/skins/PullQuote.tsx`
- Create: `next-app/src/templates/opus-v1/skins/FactsStats.tsx`
- Create: `next-app/src/templates/opus-v1/skins/ReasonsToAttend.tsx`
- Create: `next-app/src/templates/opus-v1/skins/Faq.tsx`
- Create: `next-app/src/templates/opus-v1/skins/ClosingCta.tsx`
- Create: `next-app/src/templates/opus-v1/skins/Footer.tsx`
- Create: `next-app/src/templates/opus-v1/skins/shared.ts` (gradients, initialsFromSpeaker, displayName — shared across skins)

- [ ] **Step 1: Create `skins/shared.ts` with moved constants and helpers**

Move these from `OpusV1.tsx`:

```ts
// next-app/src/templates/opus-v1/skins/shared.ts
import type { Speaker } from '../../types';

export const PORTRAIT_GRADIENTS = [
  'linear-gradient(160deg,#8A4E5D,#4A1F2D)',
  'linear-gradient(160deg,#C9812A,#A6691F)',
  'linear-gradient(160deg,#6B3340,#8A4E5D)',
  'linear-gradient(160deg,#4F4238,#6B5B4E)',
  'linear-gradient(160deg,#4A1F2D,#2A0F17)',
  'linear-gradient(160deg,#8A4E5D,#6B3340)',
  'linear-gradient(160deg,#D9963F,#C9812A)',
  'linear-gradient(160deg,#A6691F,#6B5B4E)',
];

export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#4A1F2D,#8A4E5D)',
  'linear-gradient(135deg,#C9812A,#A6691F)',
  'linear-gradient(135deg,#6B3340,#4A1F2D)',
  'linear-gradient(135deg,#4F4238,#6B5B4E)',
];

export const FOUNDER_GRADIENTS = [
  'linear-gradient(135deg,#4A1F2D,#2A0F17)',
  'linear-gradient(135deg,#C9812A,#A6691F)',
];

export const TESTIMONIAL_GRADIENTS = [
  'linear-gradient(135deg,#4A1F2D,#8A4E5D)',
  'linear-gradient(135deg,#C9812A,#A6691F)',
  'linear-gradient(135deg,#6B3340,#4F4238)',
];

export function initialsFromSpeaker(s: Speaker): string {
  const a = s.firstName?.trim()?.[0] ?? '';
  const b = s.lastName?.trim()?.[0] ?? '';
  return (a + b).toUpperCase() || '??';
}

export function displayName(s: Speaker): string {
  return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || '—';
}
```

- [ ] **Step 2: Extract each sub-component into its own skin file**

Every skin takes only the content type it needs (not the whole `OpusV1Content`). The signature for most is:

```ts
export function Hero({ content, speakers, funnelId }: { content: HeroContent; speakers: Record<string, Speaker>; funnelId: string }) { ... }
```

Skins that don't use speakers or funnelId can drop those props.

Create one file per sub-component, in pattern, copying the JSX wholesale from `OpusV1.tsx`. Examples:

```tsx
// next-app/src/templates/opus-v1/skins/Hero.tsx
import type { Speaker } from '../../types';
import type { HeroContent } from '../../../sections/hero.schema';
import { AVATAR_GRADIENTS, PORTRAIT_GRADIENTS, initialsFromSpeaker, displayName } from './shared';

type HeroPortrait = {
  initials: string;
  name: string;
  specialty: string;
  gradient: string;
};

export function Hero({
  content,
  speakers,
}: {
  content: HeroContent;
  speakers: Record<string, Speaker>;
  funnelId: string;
}) {
  const heroSpeakers: HeroPortrait[] = content.heroSpeakerIds
    .map((id, idx) => {
      const s = speakers[id];
      if (!s) return null;
      return {
        initials: initialsFromSpeaker(s),
        name: displayName(s),
        specialty: s.title ?? '',
        gradient: PORTRAIT_GRADIENTS[idx % PORTRAIT_GRADIENTS.length],
      };
    })
    .filter((p): p is HeroPortrait => Boolean(p));

  return (
    // … exact JSX from OpusV1.tsx Hero — only change: content.hero.X → content.X
    // because the skin's content type is HeroContent, not OpusV1Content.hero.
  );
}
```

For each of the 17 skins:
- `Masthead.tsx` — reads `MastheadContent` + `summit.name` via a separate `summitName` prop (see note below).
- `Hero.tsx` — reads `HeroContent` only.
- `Marquee.tsx` — reads `MarqueeContent` (was `featuredIn: string[]`; now `items: string[]`).
- `StatsHero.tsx` — reads `StatsHeroContent`.
- `SummitOverview.tsx` — reads `SummitOverviewContent`. The `featureBand` sidebar comes from the same content object.
- `SpeakersByDay.tsx` — reads `SpeakersByDayContent` + hero.ctaLabel (for the "register free" link). The `hero.ctaLabel` needs to be passed separately to skins that reference it — plumb via a `heroCtaLabel?: string` prop (all skins can accept it; see note).
- `ValueProp.tsx` — reads `ValuePropContent`.
- `Supplement.tsx` — reads `SupplementContent`.
- `BonusStack.tsx` — reads `BonusStackContent`.
- `HostFounder.tsx` — reads `HostFounderContent`.
- `TestimonialsAttendees.tsx` — reads `TestimonialsAttendeesContent`.
- `PullQuote.tsx` — reads `PullQuoteContent`.
- `FactsStats.tsx` — reads `FactsStatsContent`.
- `ReasonsToAttend.tsx` — reads `ReasonsToAttendContent`.
- `Faq.tsx` — reads `FaqContent`.
- `ClosingCta.tsx` — reads `ClosingCtaContent`.
- `Footer.tsx` — reads `FooterContent` + `summitName`.

**Note on cross-section references (summit.name, hero.ctaLabel):**

Some skins reference data from adjacent sections:
- `Masthead` shows `summit.name`.
- `Footer` shows `summit.name`.
- `SpeakersByDay` uses `hero.ctaLabel` for an anchor link.

For Phase 2a, pass these as *ambient props* from the layout, not as part of the section content. Add a shared `TemplateContext` prop shape:

```ts
// next-app/src/templates/opus-v1/skins/shared.ts — append
export type TemplateContext = {
  summitName: string;
  heroCtaLabel: string;
};
```

Each skin signature gains `context: TemplateContext` when it needs one of those fields. The layout passes context constructed from the draft's `summit` and `hero` sections.

This keeps sections self-contained-ish while avoiding awkward duplication.

- [ ] **Step 3: Leave `OpusV1.tsx` alone for now**

T3 is a pure file extraction. We won't delete `OpusV1.tsx` or change its consumers yet — that happens in T4 (layout shell).

- [ ] **Step 4: Run typecheck to verify the new skins compile**

```
cd next-app && pnpm typecheck
```

Expect: clean (the new skin files are unused but should type-check).

- [ ] **Step 5: Run existing tests to confirm no regressions**

```
cd next-app && pnpm test src/templates/opus-v1.schema.test.ts src/templates/registry.test.ts
```

Expect: green.

- [ ] **Step 6: Commit**

```
git add next-app/src/templates/opus-v1/
git commit -m "refactor(opus-v1): extract monolithic component into per-section skins"
```

---

## Task T4: opus-v1 layout shell + section maps + schema bridge

Wire the new skins into a layout shell that iterates `enabledSections`. Keep `OpusV1.tsx`'s existing export signature so consumers don't break, but route internally through the new layout. Bridge the old `OpusV1Content` shape to the new per-section content map.

**Files:**
- Create: `next-app/src/templates/opus-v1/sections.ts`
- Create: `next-app/src/templates/opus-v1/layout.tsx`
- Create: `next-app/src/templates/opus-v1/index.ts`
- Create: `next-app/src/templates/opus-v1/bridge.ts`
- Modify: `next-app/src/templates/OpusV1.tsx`
- Create: `next-app/src/templates/opus-v1/layout.test.tsx`

- [ ] **Step 1: Write sections.ts**

```ts
// next-app/src/templates/opus-v1/sections.ts
import { Masthead } from './skins/Masthead';
import { Hero } from './skins/Hero';
import { Marquee } from './skins/Marquee';
import { StatsHero } from './skins/StatsHero';
import { SummitOverview } from './skins/SummitOverview';
import { SpeakersByDay } from './skins/SpeakersByDay';
import { ValueProp } from './skins/ValueProp';
import { Supplement } from './skins/Supplement';
import { BonusStack } from './skins/BonusStack';
import { HostFounder } from './skins/HostFounder';
import { TestimonialsAttendees } from './skins/TestimonialsAttendees';
import { PullQuote } from './skins/PullQuote';
import { FactsStats } from './skins/FactsStats';
import { ReasonsToAttend } from './skins/ReasonsToAttend';
import { Faq } from './skins/Faq';
import { ClosingCta } from './skins/ClosingCta';
import { Footer } from './skins/Footer';

export const opusV1Sections = {
  masthead: Masthead,
  hero: Hero,
  marquee: Marquee,
  'stats-hero': StatsHero,
  'summit-overview': SummitOverview,
  'speakers-by-day': SpeakersByDay,
  'value-prop': ValueProp,
  supplement: Supplement,
  'bonus-stack': BonusStack,
  'host-founder': HostFounder,
  'testimonials-attendees': TestimonialsAttendees,
  'pull-quote': PullQuote,
  'facts-stats': FactsStats,
  'reasons-to-attend': ReasonsToAttend,
  faq: Faq,
  'closing-cta': ClosingCta,
  footer: Footer,
} as const;

export const opusV1SupportedSections = Object.keys(opusV1Sections) as (keyof typeof opusV1Sections)[];

export const opusV1SectionOrder: string[] = [
  'masthead',
  'hero',
  'marquee',
  'stats-hero',
  'summit-overview',
  'speakers-by-day',
  'value-prop',
  'supplement',
  'bonus-stack',
  'host-founder',
  'testimonials-attendees',
  'pull-quote',
  'facts-stats',
  'reasons-to-attend',
  'faq',
  'closing-cta',
  'footer',
];

// Rendered out of the box — operator can toggle the rest on in edit.
export const opusV1DefaultEnabledSections: string[] = [
  'masthead',
  'hero',
  'summit-overview',
  'speakers-by-day',
  'value-prop',
  'host-founder',
  'testimonials-attendees',
  'faq',
  'closing-cta',
  'footer',
];
```

- [ ] **Step 2: Write bridge.ts (maps old OpusV1Content to per-section map)**

This keeps T4 a refactor — the draft database shape doesn't change in this task; the bridge translates.

```ts
// next-app/src/templates/opus-v1/bridge.ts
import type { OpusV1Content } from '../opus-v1.schema';

export type SectionContentMap = {
  masthead: { volume: string; eyebrow: string };
  hero: OpusV1Content['hero'];
  marquee: { items: string[] };
  'stats-hero': OpusV1Content['socialProof'];
  'summit-overview': {
    roman: string;
    headline: string;
    bodyParagraphs: readonly [string, string];
    ctaLabel: string;
    featureBand: OpusV1Content['featureBand'];
  };
  'speakers-by-day': { days: OpusV1Content['speakersByDay'] };
  'value-prop': OpusV1Content['transformations'];
  supplement: OpusV1Content['supplement'];
  'bonus-stack': OpusV1Content['bonusStackSection'] & { items: OpusV1Content['bonusStack'] };
  'host-founder': OpusV1Content['founders'];
  'testimonials-attendees': OpusV1Content['testimonials'];
  'pull-quote': OpusV1Content['pullQuote'];
  'facts-stats': OpusV1Content['figures'];
  'reasons-to-attend': OpusV1Content['shifts'];
  faq: { items: OpusV1Content['faqs'] };
  'closing-cta': OpusV1Content['closing'];
  footer: OpusV1Content['footer'];
};

export function opusV1ContentToSections(c: OpusV1Content): SectionContentMap {
  return {
    masthead: c.masthead,
    hero: c.hero,
    marquee: { items: c.featuredIn },
    'stats-hero': c.socialProof,
    'summit-overview': {
      roman: c.whatIsThis.roman,
      headline: c.whatIsThis.headline,
      bodyParagraphs: c.whatIsThis.bodyParagraphs as readonly [string, string],
      ctaLabel: c.whatIsThis.ctaLabel,
      featureBand: c.featureBand,
    },
    'speakers-by-day': { days: c.speakersByDay },
    'value-prop': c.transformations,
    supplement: c.supplement,
    'bonus-stack': { ...c.bonusStackSection, items: c.bonusStack },
    'host-founder': c.founders,
    'testimonials-attendees': c.testimonials,
    'pull-quote': c.pullQuote,
    'facts-stats': c.figures,
    'reasons-to-attend': c.shifts,
    faq: { items: c.faqs },
    'closing-cta': c.closing,
    footer: c.footer,
  };
}
```

- [ ] **Step 3: Write layout.tsx**

```tsx
// next-app/src/templates/opus-v1/layout.tsx
import { OptinModal } from '@/components/OptinModal';
import type { Speaker } from '../types';
import type { OpusV1Content } from '../opus-v1.schema';
import { opusV1ContentToSections, type SectionContentMap } from './bridge';
import {
  opusV1Sections,
  opusV1SectionOrder,
  opusV1DefaultEnabledSections,
} from './sections';

export type OpusV1LayoutProps = {
  content: OpusV1Content;
  enabledSections?: string[];          // optional override; falls back to default
  speakers: Record<string, Speaker>;
  funnelId: string;
};

export function OpusV1Layout({
  content,
  enabledSections,
  speakers,
  funnelId,
}: OpusV1LayoutProps) {
  const enabled = enabledSections ?? opusV1DefaultEnabledSections;
  const sections = opusV1ContentToSections(content);
  const ordered = opusV1SectionOrder.filter((k) => enabled.includes(k));

  const context = {
    summitName: content.summit.name,
    heroCtaLabel: content.hero.ctaLabel,
  };

  return (
    <div className="opus-v1-root opus-v1-body antialiased">
      <a href="#main" className="skip-nav">Skip to content</a>

      {/* Non-section wrappers (skip-nav etc.) render once; sections are iterated below */}
      <main id="main">
        {ordered.map((key) => {
          const Skin = opusV1Sections[key as keyof typeof opusV1Sections];
          const content = sections[key as keyof SectionContentMap];
          if (!Skin || !content) return null;
          return (
            <Skin
              key={key}
              content={content as never}
              speakers={speakers}
              funnelId={funnelId}
              context={context}
            />
          );
        })}
      </main>

      <OptinModal funnelId={funnelId} ctaLabel={content.hero.ctaLabel} />
    </div>
  );
}
```

Add `context?: TemplateContext` to every skin signature in T3 (already noted there). Skins that need `context.summitName` (`Masthead`, `Footer`) or `context.heroCtaLabel` (`SpeakersByDay`) destructure it; others ignore it.

- [ ] **Step 4: Write index.ts**

```ts
// next-app/src/templates/opus-v1/index.ts
export { OpusV1Layout } from './layout';
export {
  opusV1Sections,
  opusV1SupportedSections,
  opusV1SectionOrder,
  opusV1DefaultEnabledSections,
} from './sections';
```

- [ ] **Step 5: Rewrite OpusV1.tsx as a thin re-export**

```tsx
// next-app/src/templates/OpusV1.tsx
import type { Speaker } from './types';
import type { OpusV1Content } from './opus-v1.schema';
import { OpusV1Layout } from './opus-v1/layout';

export function OpusV1({
  content,
  speakers,
  funnelId,
  enabledSections,
}: {
  content: OpusV1Content;
  speakers: Record<string, Speaker>;
  funnelId: string;
  enabledSections?: string[];
}) {
  return (
    <OpusV1Layout
      content={content}
      enabledSections={enabledSections}
      speakers={speakers}
      funnelId={funnelId}
    />
  );
}
```

- [ ] **Step 6: Write a layout test**

```tsx
// next-app/src/templates/opus-v1/layout.test.tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { OpusV1Layout } from './layout';
import { opusV1DefaultEnabledSections } from './sections';
import fixture from '../__fixtures__/opus-v1.fixture';

describe('OpusV1Layout', () => {
  it('renders default enabled sections', () => {
    const { container } = render(
      <OpusV1Layout
        content={fixture.content}
        speakers={fixture.speakers}
        funnelId="funnel-1"
      />,
    );
    expect(container.querySelector('.opus-v1-root')).not.toBeNull();
  });

  it('omits a section when enabledSections excludes it', () => {
    const enabled = opusV1DefaultEnabledSections.filter((k) => k !== 'speakers-by-day');
    const { container } = render(
      <OpusV1Layout
        content={fixture.content}
        enabledSections={enabled}
        speakers={fixture.speakers}
        funnelId="funnel-1"
      />,
    );
    // SpeakersByDay renders section[id^=day-] — its absence is the assertion
    expect(container.querySelector('[class*="speakers"]')).toBeNull();
  });

  it('renders a section when explicitly enabled beyond the default', () => {
    const enabled = [...opusV1DefaultEnabledSections, 'marquee'];
    const { container } = render(
      <OpusV1Layout
        content={fixture.content}
        enabledSections={enabled}
        speakers={fixture.speakers}
        funnelId="funnel-1"
      />,
    );
    expect(container.querySelector('.marquee-wrap')).not.toBeNull();
  });
});
```

If the project doesn't have `@testing-library/react` installed, check first:

```
cd next-app && grep "@testing-library/react" package.json
```

If missing, install: `pnpm add -D @testing-library/react @testing-library/dom jsdom` and add `test: { environment: 'jsdom' }` to `vitest.config.ts`. If adding deps feels out of scope, fall back to a lightweight snapshot via `renderToStaticMarkup` from `react-dom/server`.

- [ ] **Step 7: Run tests**

```
cd next-app && pnpm test src/templates/opus-v1/ src/templates/registry.test.ts src/templates/opus-v1.schema.test.ts
```

Expect: green, including pre-existing opus-v1 tests.

- [ ] **Step 8: Run typecheck + build**

```
cd next-app && pnpm typecheck && pnpm build
```

Expect: clean.

- [ ] **Step 9: Commit**

```
git add next-app/src/templates/
git commit -m "refactor(opus-v1): layout shell + section map; OpusV1 preserves signature via re-export"
```

---

## Task T5: Manifest export includes catalog + section fields

Extend `scripts/export-template-manifest.ts` to emit the catalog and per-template `supportedSections`, `sectionOrder`, `defaultEnabledSections`, and `sectionSchemas`.

**Files:**
- Modify: `next-app/scripts/export-template-manifest.ts`
- Modify: `next-app/src/templates/registry.ts`
- Regenerate: `next-app/public/template-manifest.json`

- [ ] **Step 1: Update registry.ts for opus-v1**

Open `next-app/src/templates/registry.ts` and extend the opus-v1 entry. Exact change depends on current shape; add these three fields to the opus-v1 record:

```ts
import {
  opusV1SupportedSections,
  opusV1SectionOrder,
  opusV1DefaultEnabledSections,
} from './opus-v1/sections';

// … existing imports stay

'opus-v1': {
  key: 'opus-v1',
  // … existing fields …
  supportedSections: opusV1SupportedSections,
  sectionOrder: opusV1SectionOrder,
  defaultEnabledSections: opusV1DefaultEnabledSections,
},
```

Other template entries remain unchanged (no `supportedSections` field).

- [ ] **Step 2: Extend Template type**

Wherever the Template type is declared (check `types.ts` or `registry.ts` top), add:

```ts
supportedSections?: readonly string[];
sectionOrder?: readonly string[];
defaultEnabledSections?: readonly string[];
```

All three fields are optional — templates without them stay on the legacy render path.

- [ ] **Step 3: Update export-template-manifest.ts**

Open `next-app/scripts/export-template-manifest.ts`. Add imports for catalog + `zod-to-json-schema` (already in use):

```ts
import { catalog, catalogKeys } from '../src/sections/catalog';
import { zodToJsonSchema } from 'zod-to-json-schema';
```

Extend the emitted object:

```ts
// Build catalog JSON block
const catalogOut: Record<string, unknown> = {};
for (const key of catalogKeys) {
  const entry = catalog[key];
  catalogOut[key] = {
    label: entry.label,
    description: entry.description,
    tier: entry.tier,
    pageTypes: entry.pageTypes,
    defaultOrder: entry.defaultOrder,
    schema: zodToJsonSchema(entry.schema, { target: 'jsonSchema7' }),
  };
}

// Build per-template section metadata
for (const t of manifestTemplates) {
  if (t.supportedSections) {
    // Build template sectionSchemas from catalog subset
    const sectionSchemas: Record<string, unknown> = {};
    for (const key of t.supportedSections) {
      const entry = catalog[key];
      if (!entry) throw new Error(`Template ${t.key} references unknown section ${key}`);
      sectionSchemas[key] = zodToJsonSchema(entry.schema, { target: 'jsonSchema7' });
    }
    // Attach to the emitted template manifest entry (not the Template object)
    (t as any).sectionSchemas = sectionSchemas;
  }
}

const manifest = {
  catalog: catalogOut,
  templates: manifestTemplates,
};
```

Exact line numbers depend on the current script; the change is additive — append `catalog` to the top-level output, and per-template add `supportedSections`, `sectionOrder`, `defaultEnabledSections`, `sectionSchemas` before writing JSON.

- [ ] **Step 4: Regenerate and inspect**

```
cd next-app && pnpm build:templates
jq '.catalog | keys | length' public/template-manifest.json   # should print 17
jq '.templates[] | select(.key == "opus-v1") | .supportedSections | length' public/template-manifest.json  # 17
jq '.templates[] | select(.key == "opus-v1") | .defaultEnabledSections | length' public/template-manifest.json  # 10
jq '.templates[] | select(.key == "opus-v2") | .supportedSections // "(unset)"' public/template-manifest.json  # "(unset)"
```

- [ ] **Step 5: Confirm existing registry integrity test still passes**

```
cd next-app && pnpm test src/templates/registry.test.ts
```

Expect: green. If it asserts on manifest shape, the new fields should not trip it since they're additive, but if it does, update the test to permit the new fields.

- [ ] **Step 6: Commit**

```
git add next-app/src/templates/registry.ts next-app/scripts/export-template-manifest.ts next-app/public/template-manifest.json
git commit -m "feat(templates): manifest emits catalog + per-template section fields"
```

---

## Task T6: DB migration — `enabled_sections` on `landing_page_drafts`

**Files:**
- Create: `database/migrations/2026_04_17_170000_add_enabled_sections_to_landing_page_drafts.php`
- Modify: `app/Models/LandingPageDraft.php`

- [ ] **Step 1: Generate the migration**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
php artisan make:migration add_enabled_sections_to_landing_page_drafts --no-interaction
```

Artisan chooses the timestamp. Move / rename to `2026_04_17_170000_add_enabled_sections_to_landing_page_drafts.php` if needed for order.

- [ ] **Step 2: Write the migration body**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('landing_page_drafts', function (Blueprint $table) {
            $table->json('enabled_sections')->nullable()->after('sections');
        });
    }

    public function down(): void
    {
        Schema::table('landing_page_drafts', function (Blueprint $table) {
            $table->dropColumn('enabled_sections');
        });
    }
};
```

Nullable so existing drafts don't fail; the job (T9) populates on new drafts; a backfill is handled by the runtime (layout falls back to `defaultEnabledSections` when the column is null).

- [ ] **Step 3: Cast on the model**

Open `app/Models/LandingPageDraft.php`. In the `$casts` array add:

```php
'enabled_sections' => 'array',
```

If `$casts` is a method, update accordingly.

- [ ] **Step 4: Run the migration**

```
php artisan migrate
```

Expect: migration runs clean.

- [ ] **Step 5: Add a test that the column casts**

Append to `tests/Feature/Models/LandingPageDraftTest.php` (create if absent):

```php
<?php

use App\Models\{LandingPageDraft, LandingPageBatch, Funnel, Summit};

it('casts enabled_sections to array', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id,
        'version_number' => 1,
        'template_key' => 'opus-v1',
        'sections' => ['hero' => ['headline' => 'X']],
        'enabled_sections' => ['hero', 'footer'],
        'status' => 'ready',
        'preview_token' => 'test-token',
    ]);

    expect($draft->fresh()->enabled_sections)
        ->toBeArray()
        ->toBe(['hero', 'footer']);
});
```

- [ ] **Step 6: Run**

```
./vendor/bin/pest tests/Feature/Models/LandingPageDraftTest.php
```

Expect: green.

- [ ] **Step 7: Commit**

```
git add database/migrations/2026_04_17_170000_add_enabled_sections_to_landing_page_drafts.php \
        app/Models/LandingPageDraft.php \
        tests/Feature/Models/LandingPageDraftTest.php
git commit -m "feat(db): add enabled_sections JSON column to landing_page_drafts"
```

---

## Task T7: `TemplateRegistry` reads new manifest fields

PHP-side Registry needs to expose `supportedSections`, `sectionOrder`, `defaultEnabledSections`, and `sectionSchemas` for templates that declare them.

**Files:**
- Modify: `app/Services/Templates/TemplateRegistry.php`
- Modify: `tests/Unit/Services/Templates/TemplateRegistryTest.php` (create if absent)

- [ ] **Step 1: Read current registry**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
cat app/Services/Templates/TemplateRegistry.php | head -80
```

Understand the current shape — likely a method `get(string $key): array` returning keys from the manifest JSON.

- [ ] **Step 2: Extend the registry**

Add helpers that return the new fields when present:

```php
public function supportsSections(string $key): bool
{
    $t = $this->get($key);
    return isset($t['supportedSections']) && is_array($t['supportedSections']);
}

public function supportedSections(string $key): array
{
    $t = $this->get($key);
    return $t['supportedSections'] ?? [];
}

public function sectionOrder(string $key): array
{
    $t = $this->get($key);
    return $t['sectionOrder'] ?? [];
}

public function defaultEnabledSections(string $key): array
{
    $t = $this->get($key);
    return $t['defaultEnabledSections'] ?? [];
}

public function sectionSchemas(string $key): array
{
    $t = $this->get($key);
    return $t['sectionSchemas'] ?? [];
}
```

If the registry is a singleton reading the manifest lazily, these methods just read from the same in-memory structure.

- [ ] **Step 3: Write tests**

```php
<?php

use App\Services\Templates\TemplateRegistry;

it('returns empty arrays and false for templates without sections', function () {
    $reg = app(TemplateRegistry::class);
    // opus-v2 was not migrated in Phase 2a
    expect($reg->supportsSections('opus-v2'))->toBeFalse();
    expect($reg->supportedSections('opus-v2'))->toBe([]);
});

it('returns section metadata for opus-v1', function () {
    $reg = app(TemplateRegistry::class);
    expect($reg->supportsSections('opus-v1'))->toBeTrue();
    expect($reg->supportedSections('opus-v1'))->toContain('hero');
    expect($reg->defaultEnabledSections('opus-v1'))->toContain('hero');
    expect($reg->sectionSchemas('opus-v1'))->toHaveKey('hero');
});
```

- [ ] **Step 4: Run**

```
./vendor/bin/pest tests/Unit/Services/Templates/TemplateRegistryTest.php
```

Expect: green.

- [ ] **Step 5: Commit**

```
git add app/Services/Templates/TemplateRegistry.php tests/Unit/Services/Templates/TemplateRegistryTest.php
git commit -m "feat(registry): expose supportedSections/sectionOrder/defaults/sectionSchemas"
```

---

## Task T8: `TemplateFiller` uses supported-sections schema for migrated templates

When the template supports sections, `TemplateFiller` builds the effective JSON Schema as `{ type: "object", properties: sectionSchemas, required: supportedSections }` and asks Claude to fill it. Otherwise it keeps the Phase 1 whole-template schema behavior.

**Files:**
- Modify: `app/Services/Templates/TemplateFiller.php`
- Create: `tests/Feature/Services/TemplateFillerSectionsTest.php`

- [ ] **Step 1: Read current filler**

```
cat app/Services/Templates/TemplateFiller.php | head -120
```

Understand the entry point (`fill(...)`), how it constructs the JSON schema for Claude, and how it parses the response.

- [ ] **Step 2: Branch on `supportsSections`**

Inside `fill()` (or a helper it calls), add a branch:

```php
// Around where the JSON Schema is constructed:
if ($this->registry->supportsSections($templateKey)) {
    $schemas = $this->registry->sectionSchemas($templateKey);
    $supported = $this->registry->supportedSections($templateKey);

    $effectiveSchema = [
        'type' => 'object',
        'properties' => $schemas,
        'required' => $supported,
        'additionalProperties' => false,
    ];
} else {
    $effectiveSchema = $template['jsonSchema']; // existing Phase 1 path
}
```

Use `$effectiveSchema` wherever the Phase 1 code used the whole-template schema.

- [ ] **Step 3: Update system prompt for section-mode**

When in section mode, the prompt structure changes slightly (Claude needs to know it's filling a keyed section map). Extend the prompt-builder to note:

```php
if ($this->registry->supportsSections($templateKey)) {
    $prompt .= "\n\nReturn a single JSON object whose top-level keys are each section name. "
             . "Fill every supported section with realistic content consistent with the summit context.";
}
```

Exact placement depends on the current prompt-builder structure.

- [ ] **Step 4: Write the filler test**

```php
<?php

use App\Services\Templates\TemplateFiller;
use App\Services\Templates\TemplateRegistry;
use Illuminate\Support\Facades\Http;

it('uses supportedSections schema for opus-v1', function () {
    Http::fake(function ($request) {
        // Capture the request payload so we can assert on schema shape.
        $body = json_decode($request->body(), true);

        // Assert the tool schema includes section-keyed properties.
        $tool = collect($body['tools'] ?? [])->first();
        $props = $tool['input_schema']['properties'] ?? [];
        expect($props)->toHaveKey('hero');
        expect($props)->toHaveKey('summit-overview');
        expect($props)->not->toHaveKey('summit');  // legacy whole-schema key

        return Http::response([
            'content' => [
                [
                    'type' => 'tool_use',
                    'name' => 'fill_template',
                    'input' => [
                        'hero' => [ /* minimal valid hero */ ],
                        'summit-overview' => [ /* minimal valid */ ],
                        // … etc for each supported section. Use a dataset to build this.
                    ],
                ],
            ],
        ], 200);
    });

    $filler = app(TemplateFiller::class);
    $result = $filler->fill('opus-v1', /* $summitContext */ [...]);

    expect($result['content'])->toBeArray();
});

it('uses whole-template schema for non-migrated templates like opus-v2', function () {
    Http::fake(function ($request) {
        $body = json_decode($request->body(), true);
        $tool = collect($body['tools'] ?? [])->first();
        $props = $tool['input_schema']['properties'] ?? [];
        // opus-v2 still uses legacy shape: has top-level 'summit', 'hero', etc. — no top-level 'faq' as a section key
        expect($props)->toHaveKey('summit');
        return Http::response(['content' => [['type' => 'tool_use', 'name' => 'fill_template', 'input' => /* legacy shape */ []]]], 200);
    });

    $filler = app(TemplateFiller::class);
    $filler->fill('opus-v2', [...]);
});
```

The fixture-data for a minimal `hero` etc. can be copied from the Phase 1 fixture. Keep the test focused on the *schema shape* the filler sends to Claude — not on the content quality.

- [ ] **Step 5: Run**

```
./vendor/bin/pest tests/Feature/Services/TemplateFillerSectionsTest.php
```

Expect: green.

- [ ] **Step 6: Commit**

```
git add app/Services/Templates/TemplateFiller.php tests/Feature/Services/TemplateFillerSectionsTest.php
git commit -m "feat(templates): TemplateFiller builds per-section schema for templates that declare supportedSections"
```

---

## Task T9: `GenerateLandingPageVersionJob` seeds `enabled_sections`

When the template supports sections, the job seeds `enabled_sections` from `defaultEnabledSections`. For legacy templates, `enabled_sections` stays null (and the render layer falls back to legacy behaviour).

**Files:**
- Modify: `app/Jobs/GenerateLandingPageVersionJob.php`
- Modify: `tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php`

- [ ] **Step 1: Read current job**

```
cat app/Jobs/GenerateLandingPageVersionJob.php | head -80
```

- [ ] **Step 2: Add the seeding logic**

When creating/updating the draft's status to `ready`, before save:

```php
if ($registry->supportsSections($templateKey)) {
    $draft->enabled_sections = $registry->defaultEnabledSections($templateKey);
}
```

Exact placement: inside the try block, after the content is successfully filled and right before `$draft->update(['status' => 'ready', 'sections' => ...])`. Inject `$registry` either through constructor or via `app(TemplateRegistry::class)`.

- [ ] **Step 3: Write a test**

Append to `tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php`:

```php
it('seeds enabled_sections from defaultEnabledSections for opus-v1', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andReturn([
            'content' => [ /* fully valid section map; copy from fixture */ ],
            'tokens' => 100,
        ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v1', 1);

    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft->enabled_sections)->toContain('hero');
    expect($draft->enabled_sections)->toContain('footer');
    expect($draft->enabled_sections)->not->toContain('marquee');
});

it('leaves enabled_sections null for legacy templates like opus-v2', function () {
    $summit = Summit::factory()->create();
    $funnel = Funnel::factory()->for($summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);

    $this->mock(TemplateFiller::class, function ($m) {
        $m->shouldReceive('fill')->andReturn([
            'content' => [ /* legacy whole-shape content */ ],
            'tokens' => 100,
        ]);
    });

    GenerateLandingPageVersionJob::dispatchSync($batch->id, 'opus-v2', 1);
    $draft = LandingPageDraft::firstWhere('batch_id', $batch->id);
    expect($draft->enabled_sections)->toBeNull();
});
```

- [ ] **Step 4: Run**

```
./vendor/bin/pest tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php
```

Expect: green.

- [ ] **Step 5: Commit**

```
git add app/Jobs/GenerateLandingPageVersionJob.php tests/Feature/Jobs/GenerateLandingPageVersionJobTest.php
git commit -m "feat(jobs): seed enabled_sections from template defaults for section-aware templates"
```

---

## Task T10: Preview/public render routes pass `enabled_sections`

Wire Next.js preview and public funnel routes to pass `enabled_sections` from the draft/step into the template.

**Files:**
- Modify: `next-app/src/app/preview/[token]/page.tsx`
- Modify: `next-app/src/app/f/[funnel]/optin/page.tsx` (if it renders the same template path)

- [ ] **Step 1: Read the preview route**

```
cat next-app/src/app/preview/\[token\]/page.tsx
```

Find where it instantiates the template component.

- [ ] **Step 2: Pass enabledSections**

Wherever the template is rendered, e.g.:

```tsx
// Before
<OpusV1 content={draft.sections} speakers={speakers} funnelId={funnelId} />

// After
<OpusV1
  content={draft.sections}
  enabledSections={draft.enabled_sections}  // comes back as array or null from Laravel
  speakers={speakers}
  funnelId={funnelId}
/>
```

Note: `OpusV1`'s draft content currently is `OpusV1Content` shape (legacy). In Phase 2a the **draft on disk is still the legacy shape** — the bridge converts at render time. So `draft.sections` is the legacy `OpusV1Content`. The layout shell reads it through `opusV1ContentToSections` via bridge.ts. This keeps Phase 2a non-disruptive.

If the route wrappers exist for other templates (opus-v2, etc.), no change — they don't have `enabled_sections` anyway.

- [ ] **Step 3: Repeat for the public optin route**

Same pattern in `next-app/src/app/f/[funnel]/optin/page.tsx`, if applicable.

- [ ] **Step 4: Smoke via `pnpm build`**

```
cd next-app && pnpm typecheck && pnpm build
```

Expect: clean.

- [ ] **Step 5: Commit**

```
git add next-app/src/app/preview/ next-app/src/app/f/
git commit -m "feat(render): pass enabled_sections from draft to OpusV1 layout"
```

---

## Task T11: `EditLandingPageDraftPage` — per-section Filament form

Create (or extend, if Phase 1.5 C2 is done) the edit page. One fieldset per supported section, each with an on/off toggle + fields mapped via the existing `FilamentSchemaMapper`.

**Files:**
- Create: `app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php`
- Create: `resources/views/filament/pages/edit-landing-page-draft.blade.php`
- Modify: `app/Filament/Resources/Funnels/FunnelResource.php` (register page)
- Modify: `app/Filament/Resources/Funnels/Pages/LandingPageDraftsPage.php` (Edit action)
- Modify: `resources/views/filament/pages/landing-page-drafts.blade.php`
- Create: `tests/Feature/Filament/EditLandingPageDraftPageTest.php`

Precondition check:

```
ls -la /Users/tajbrzovic/wcc-projects/summit-platform/app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php 2>/dev/null && echo EXISTS || echo ABSENT
```

If EXISTS (Phase 1.5 C2 done), extend it. If ABSENT, create it from scratch per the code below.

- [ ] **Step 1: Implement the edit page**

```php
<?php

namespace App\Filament\Resources\Funnels\Pages;

use App\Filament\Resources\Funnels\FunnelResource;
use App\Models\{Funnel, LandingPageDraft};
use App\Services\Templates\{FilamentSchemaMapper, TemplateRegistry};
use Filament\Forms\Components\Toggle;
use Filament\Forms\Contracts\HasForms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Resources\Pages\Page;
use Filament\Schemas\Components\Fieldset;
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

        $registry = app(TemplateRegistry::class);
        $supported = $registry->supportedSections($this->draft->template_key);
        $enabled = $this->draft->enabled_sections ?? $registry->defaultEnabledSections($this->draft->template_key);

        // Compose form initial state: content keyed by section + on/off toggles
        $initial = [
            'content' => $this->draft->sections ?? [],
            'enabled' => array_fill_keys($supported, false),
        ];
        foreach ($enabled as $key) {
            $initial['enabled'][$key] = true;
        }

        $this->form->fill($initial);
    }

    public function form(Schema $schema): Schema
    {
        $registry = app(TemplateRegistry::class);
        $mapper = app(FilamentSchemaMapper::class);

        $templateKey = $this->draft->template_key;
        if (!$registry->supportsSections($templateKey)) {
            // Legacy template — fall back to the whole-schema form (Phase 1.5 behaviour).
            return $schema->components($mapper->map(
                $registry->get($templateKey)['jsonSchema'],
                'data.content',
                $this->funnel->summit_id,
            ));
        }

        $supported = $registry->supportedSections($templateKey);
        $schemas = $registry->sectionSchemas($templateKey);
        $order = $registry->sectionOrder($templateKey);
        $orderedKeys = array_values(array_filter($order, fn ($k) => in_array($k, $supported, true)));

        $fieldsets = [];
        foreach ($orderedKeys as $key) {
            $fieldsets[] = Fieldset::make($key)
                ->label(ucfirst(str_replace('-', ' ', $key)))
                ->schema([
                    Toggle::make("enabled.{$key}")->label('Include on page')->inline(false),
                    ...$mapper->map($schemas[$key], "data.content.{$key}", $this->funnel->summit_id),
                ]);
        }

        return $schema->components($fieldsets);
    }

    public function save(): void
    {
        $state = $this->form->getState();
        $content = $state['content'] ?? [];
        $enabledMap = $state['enabled'] ?? [];

        $registry = app(TemplateRegistry::class);
        $order = $registry->sectionOrder($this->draft->template_key);
        $enabled = array_values(array_filter($order, fn ($k) => !empty($enabledMap[$k])));

        $this->draft->update([
            'sections' => $content,
            'enabled_sections' => $enabled,
        ]);

        Notification::make()->title('Draft saved')->success()->send();
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

```blade
{{-- resources/views/filament/pages/edit-landing-page-draft.blade.php --}}
<x-filament-panels::page>
    <form wire:submit="save">
        {{ $this->form }}
    </form>
</x-filament-panels::page>
```

- [ ] **Step 3: Register page route**

In `FunnelResource::getPages()`, add:

```php
'edit-landing-page-draft' => EditLandingPageDraftPage::route('/{record}/landing-pages/{draft}/edit'),
```

Import namespace at top if needed.

- [ ] **Step 4: Edit button on cards**

In `resources/views/filament/pages/landing-page-drafts.blade.php`, add to each draft card's action row:

```blade
<a href="{{ \App\Filament\Resources\Funnels\Pages\EditLandingPageDraftPage::getUrl(['tenant' => $this->funnel->summit->slug, 'record' => $this->funnel->id, 'draft' => $draft->id]) }}"
   class="px-3 py-1 text-sm bg-amber-100 hover:bg-amber-200 text-amber-800 rounded">Edit</a>
```

- [ ] **Step 5: Write tests**

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

it('renders per-section fieldsets for opus-v1 drafts', function () {
    $funnel = Funnel::factory()->for($this->summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $this->summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1',
        'sections' => [/* use opus-v1 fixture content */],
        'enabled_sections' => ['hero', 'footer'],
        'status' => 'shortlisted',
        'preview_token' => 't1',
    ]);

    livewire(EditLandingPageDraftPage::class, [
        'tenant' => $this->summit->slug,
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])->assertSuccessful();
});

it('toggling a section off removes it from enabled_sections on save', function () {
    $funnel = Funnel::factory()->for($this->summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $this->summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v1',
        'sections' => [/* fixture content */],
        'enabled_sections' => ['hero', 'faq', 'footer'],
        'status' => 'shortlisted',
        'preview_token' => 't1',
    ]);

    livewire(EditLandingPageDraftPage::class, [
        'tenant' => $this->summit->slug,
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])
        ->set('data.enabled.faq', false)
        ->call('save')
        ->assertHasNoFormErrors();

    expect($draft->fresh()->enabled_sections)
        ->not->toContain('faq')
        ->toContain('hero')
        ->toContain('footer');
});

it('falls back to whole-schema form for legacy templates like opus-v2', function () {
    $funnel = Funnel::factory()->for($this->summit)->create();
    $batch = LandingPageBatch::create([
        'summit_id' => $this->summit->id, 'funnel_id' => $funnel->id,
        'version_count' => 1, 'status' => 'running',
    ]);
    $draft = LandingPageDraft::create([
        'batch_id' => $batch->id, 'version_number' => 1,
        'template_key' => 'opus-v2',
        'sections' => [/* opus-v2 legacy content */],
        'enabled_sections' => null,
        'status' => 'shortlisted',
        'preview_token' => 't1',
    ]);

    livewire(EditLandingPageDraftPage::class, [
        'tenant' => $this->summit->slug,
        'record' => $funnel->id,
        'draft' => $draft->id,
    ])->assertSuccessful();
});
```

- [ ] **Step 6: Run tests**

```
./vendor/bin/pest tests/Feature/Filament/EditLandingPageDraftPageTest.php
```

Expect: green.

- [ ] **Step 7: Commit**

```
git add app/Filament/Resources/Funnels/Pages/EditLandingPageDraftPage.php \
        app/Filament/Resources/Funnels/FunnelResource.php \
        resources/views/filament/pages/edit-landing-page-draft.blade.php \
        resources/views/filament/pages/landing-page-drafts.blade.php \
        tests/Feature/Filament/EditLandingPageDraftPageTest.php
git commit -m "feat(filament): edit page renders per-section fieldsets with on/off toggles"
```

---

## Task T12: Extended manifest integrity test

Phase 1.5 added a basic `ManifestIntegrityTest`. Phase 2a extends it to assert catalog/skin coverage.

**Files:**
- Modify: `tests/Unit/Services/Templates/ManifestIntegrityTest.php`

- [ ] **Step 1: Add catalog + skin coverage assertions**

Append to the test file:

```php
it('every core section in the catalog is supported by every section-aware template', function () {
    $manifestFile = base_path('next-app/public/template-manifest.json');
    $manifest = json_decode(file_get_contents($manifestFile), true);

    $coreKeys = collect($manifest['catalog'] ?? [])
        ->filter(fn ($v) => ($v['tier'] ?? null) === 'core')
        ->keys()->all();

    $sectionAware = collect($manifest['templates'] ?? [])
        ->filter(fn ($t) => !empty($t['supportedSections']));

    foreach ($sectionAware as $t) {
        foreach ($coreKeys as $ck) {
            expect($t['supportedSections'], "{$t['key']} missing core section {$ck}")
                ->toContain($ck);
        }
    }
});

it('defaultEnabledSections is a subset of supportedSections for every section-aware template', function () {
    $manifestFile = base_path('next-app/public/template-manifest.json');
    $manifest = json_decode(file_get_contents($manifestFile), true);

    foreach ($manifest['templates'] ?? [] as $t) {
        if (empty($t['supportedSections'])) continue;
        $supported = $t['supportedSections'];
        $default = $t['defaultEnabledSections'] ?? [];
        foreach ($default as $d) {
            expect($supported)->toContain($d);
        }
    }
});

it('every supportedSection key exists in the catalog', function () {
    $manifestFile = base_path('next-app/public/template-manifest.json');
    $manifest = json_decode(file_get_contents($manifestFile), true);

    $catalogKeys = array_keys($manifest['catalog'] ?? []);
    foreach ($manifest['templates'] ?? [] as $t) {
        foreach ($t['supportedSections'] ?? [] as $ss) {
            expect($catalogKeys)->toContain($ss);
        }
    }
});

it('sectionOrder is a permutation of supportedSections for every section-aware template', function () {
    $manifestFile = base_path('next-app/public/template-manifest.json');
    $manifest = json_decode(file_get_contents($manifestFile), true);

    foreach ($manifest['templates'] ?? [] as $t) {
        if (empty($t['supportedSections'])) continue;
        sort($t['supportedSections']);
        $order = $t['sectionOrder'] ?? [];
        sort($order);
        expect($order)->toBe($t['supportedSections']);
    }
});
```

- [ ] **Step 2: Run**

```
./vendor/bin/pest tests/Unit/Services/Templates/ManifestIntegrityTest.php
```

Expect: green. If it fails, either opus-v1 is missing a core section skin, or `defaultEnabledSections` contains a key not in `supportedSections` — fix at the source (registry or sections.ts), regenerate manifest, re-run.

- [ ] **Step 3: Commit**

```
git add tests/Unit/Services/Templates/ManifestIntegrityTest.php
git commit -m "test(templates): assert catalog/skin coverage + section-order integrity"
```

---

## Task T13: Smoke + cleanup

Run the full suite, do a manual smoke through the Filament panel, and clean up any dangling imports.

- [ ] **Step 1: Full test suite**

```
cd /Users/tajbrzovic/wcc-projects/summit-platform
./vendor/bin/pest --compact
cd next-app && pnpm test && pnpm typecheck && pnpm build
```

Expect: all green.

- [ ] **Step 2: Manual smoke checklist**

1. `composer dev` + `cd next-app && pnpm dev` in separate terminals.
2. Visit `/admin`, log in. Ensure a summit with a slug exists. Create a funnel with an `optin` FunnelStep.
3. Click **Generate Landing Pages**. Select opus-v1 in the template pool, 1 variant. Submit.
4. Wait for the draft to reach `ready`.
5. Click **Preview** on the opus-v1 draft card. Verify the page renders with the `defaultEnabledSections` (hero, summit-overview, speakers-by-day, etc.) and not the full section set.
6. Click **Edit** on the same card. Verify the form shows a fieldset per supported section with on/off toggles.
7. Toggle `marquee` on and save. Refresh preview — verify marquee appears.
8. Toggle `faq` off and save. Refresh preview — verify FAQ disappears but content is preserved (toggle it back on to confirm).
9. Generate a draft using opus-v2 (legacy). Verify it still works exactly as before (no `enabled_sections`, no per-section edit form — falls back to the whole-schema form).
10. Publish an opus-v1 draft. Visit `/f/{funnelId}/optin` — verify the published page renders the same section set as preview.

Report any failures in the smoke test before concluding T13.

- [ ] **Step 3: Lint**

```
./vendor/bin/pint --dirty --format agent
cd next-app && pnpm lint --fix || true
```

- [ ] **Step 4: Commit any lint fixes**

```
git add -A
git diff --cached --quiet || git commit -m "chore: lint fixes post Phase 2a"
```

- [ ] **Step 5: Final push (optional)**

Don't push to remote without user instruction.

---

## Self-Review

**Spec coverage:**

| Spec requirement | Covered by |
|---|---|
| Catalog single source of truth | T1, T2 |
| Section schema shared across templates | T1 |
| Per-template skins | T3 |
| Template declares supportedSections + order + default | T4 + T5 |
| DB `enabled_sections` column | T6 |
| TemplateRegistry exposes new fields | T7 |
| TemplateFiller builds merged schema from supported set | T8 |
| Job seeds `enabled_sections` from defaults | T9 |
| Render routes pass enabled_sections | T10 |
| Edit page = per-section fieldsets with toggles (curation surface) | T11 |
| Manifest integrity covers new fields | T12 |
| Core sections required from every section-aware template | T12 |
| defaultEnabledSections ⊂ supportedSections | T12 |
| Smoke test | T13 |

Phase 2b (not in this plan): migrate opus-v2, opus-v3, opus-v4, variant-1, variant-2, variant-3, adhd-summit.

**Placeholder scan:** no TBD/TODO. Test fixtures referenced as `/* … */` are intentionally abbreviated — the engineer copies from the existing opus-v1 fixture files.

**Type consistency:**
- `OpusV1LayoutProps.enabledSections?: string[]` matches `OpusV1.enabledSections?: string[]` (both optional).
- `TemplateRegistry::defaultEnabledSections(): array` used consistently in T7, T9, T11.
- Catalog key strings used verbatim across T1 (files), T2 (catalog keys), T4 (sections.ts map), T5 (manifest), T12 (assertions).

**Plan complete.**

Save location: `docs/superpowers/plans/2026-04-17-section-catalog-phase-2a.md`.
Phase 2b plan (to be written after Phase 2a ships): migration of the remaining 7 templates following the T3+T4+T5 pattern per template.
