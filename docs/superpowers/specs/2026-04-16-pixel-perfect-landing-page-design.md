# Pixel-Perfect Landing Page Generation

**Date:** 2026-04-16
**Status:** Draft
**Goal:** Generate landing pages that are visually identical to parenting-summits.com using the AI pipeline

---

## Problem

The current generation pipeline (Stage 1 image + Stage 2 code) produces landing pages with correct branding but poor layout fidelity. Hero sections stack vertically instead of side-by-side, spacing is inconsistent, and visual density doesn't match the reference. The AI has too much creative freedom and too little structural guidance.

## Solution

Hybrid approach: **Layout skeletons** (fixed grid structure) + **AI styling/content** (colors, typography, copy) + **Auto-polish** (Claude reviews output). The target is reproducing parenting-summits.com section by section.

## Reference: parenting-summits.com Design Tokens

### Color Palette

| Token | Hex | Purpose |
|-------|-----|---------|
| `primary` | `#704fe6` | Purple — hero background, primary CTA |
| `primary-dark` | `#5e4d9b` | Purple — speaker names, secondary buttons |
| `primary-deep` | `#4831B0` | Navigation, dark accents |
| `cta` | `#FBA506` | Amber — form submit buttons |
| `cta-secondary` | `#ffc500` | Gold — secondary CTA with pulse animation |
| `cta-orange` | `#ff8f00` | Orange — accent buttons, headline highlights |
| `bg-lavender` | `#e6e6fa` | Lavender — alternating section backgrounds |
| `bg-translucent` | `rgba(196,190,218,0.96)` | Purple overlay — sticky header |
| `text-primary` | `#000000` | Body text |
| `text-muted` | `#898686` | Speaker subtitles, secondary text |
| `text-light` | `#a9a9a9` | Labels, tertiary text |
| `white` | `#ffffff` | Text on dark backgrounds |
| `accent-red` | `#b83b4b` | Speaker highlights, urgency |
| `accent-green` | `#00b553` | Success checkmarks |

### Typography

| Font | Role | Weights |
|------|------|---------|
| Poppins | Primary — body, headings, buttons, forms | 100-900 |
| Cormorant Garamond | Decorative serif — h3 sub-headings | 100-900 |
| Raleway | Social proof / rating text | 100-900 |

### Typography Scale

| Size | Usage |
|------|-------|
| 48-50px | Section headlines |
| 32-35px | H2 headings |
| 24-26px | H3, day headers |
| 20px | Speaker names, H4 |
| 18px | Body base, buttons |
| 16px | Standard body, cards |
| 14px | Labels, small text |

### Layout Constants

| Token | Value |
|-------|-------|
| `max-width` | 1120px |
| `section-padding-lg` | 75px top/bottom, 20px left/right |
| `section-padding-md` | 50px top/bottom |
| `section-padding-sm` | 24px top/bottom |
| `speaker-grid` | `repeat(4, minmax(200px, 1fr))` gap 20px |
| `content-width-narrow` | 740px |
| `button-radius-pill` | 500px |
| `button-radius-sm` | 15px |
| `breakpoint-tablet` | 991px |
| `breakpoint-mobile` | 767px |

---

## Architecture

### Three-Stage Pipeline (revised)

```
Operator clicks "Generate" in Filament
         |
         v
  [Architect Phase] — Claude picks section sequence (existing)
         |
         v
  For each section:
    [Stage 1] Gemini generates mockup image
              Input: skeleton + style brief + reference screenshot
              Output: 1440x900 mockup PNG
         |
         v
    [Stage 2] Gemini generates JSX code
              Input: mockup + skeleton + style brief + design system
              Output: JSX component + editable fields
         |
         v
    [Stage 3] Claude polishes JSX (NEW)
              Input: JSX + style brief + skeleton
              Output: corrected JSX
         |
         v
  All sections assembled into draft
```

### What changes from current pipeline

| Component | Current | New |
|-----------|---------|-----|
| Stage 1 prompt | Vague ("clear H1, supporting body") | Skeleton-constrained ("fill this grid layout") |
| Stage 1 visual input | No reference image | Per-type reference screenshot from parenting-summits.com |
| Stage 2 prompt | "Match the reference PNG" | "Match the mockup EXACTLY, using this skeleton structure" |
| Stage 3 | Does not exist | Claude reviews JSX against style brief, fixes color/spacing/font errors |
| Style brief | Optional, auto-generated | Mandatory, extracted from source HTML (exact hex codes, fonts, spacing) |
| Layout | AI decides freely | Skeleton constrains grid/flex structure |

---

## Layout Skeletons

Stored in `next-app/src/lib/skeletons/`. Each skeleton is a JSX string defining only the grid/flex structure with `__SLOT__` placeholders. The AI fills slots with styled content.

### Skeleton format

Each skeleton is a `.ts` file exporting a plain string. The string is raw JSX with `__SLOT__` comment markers where the AI inserts styled content. The grid/flex classes are real Tailwind — the AI must not change them.

```ts
// next-app/src/lib/skeletons/HeroWithCountdown.ts
export const skeleton = `
<section className="__bg__ py-[75px] px-5">
  <div className="mx-auto max-w-[1120px] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
    <div>
      {/* __SLOT_eyebrow__ */}
      {/* __SLOT_headline__ */}
      {/* __SLOT_subheadline__ */}
      {/* __SLOT_cta__ */}
      {/* __SLOT_social_proof__ */}
    </div>
    <div>
      {/* __SLOT_speaker_collage_or_countdown__ */}
    </div>
  </div>
</section>
`;

export const slots = [
  'eyebrow', 'headline', 'subheadline', 'cta', 'social_proof',
  'speaker_collage_or_countdown',
];
```

The `slots` array documents which placeholders the AI must fill. The prompt tells Gemini: "Replace each `__SLOT_xxx__` comment with styled JSX content. Do NOT modify the grid/flex container classes."

### Sections to skeleton (Phase 1 — 10 most-used)

| # | Section Type | Layout Pattern |
|---|---|---|
| 1 | `StickyCountdownBar` | Fixed top bar, single row: message + countdown digits + CTA button |
| 2 | `HeroWithCountdown` | 2-column grid (60/40): text+CTA left, visual right |
| 3 | `SocialProofBadge` | Centered row: avatar stack + star rating + text |
| 4 | `LogoStripCarousel` | Centered heading + horizontal logo row |
| 5 | `StatsBar3Item` | 3-column equal grid with icon + number + label |
| 6 | `FeatureWithImage` | 2-column grid (50/50): text left, image right (alternating) |
| 7 | `SpeakerGridDay` | Day header + 4-column card grid per day, circular avatars |
| 8 | `BonusStack` | Vertical stack of bonus cards with image + text + value |
| 9 | `FAQAccordion` | Centered heading + vertical accordion items |
| 10 | `Footer` | Multi-column footer with links + legal |

### Sections to skeleton (Phase 2 — remaining 10)

| # | Section Type | Layout Pattern |
|---|---|---|
| 11 | `LearningOutcomes` | Heading + 3-column icon cards |
| 12 | `FoundersSection` | 2-column: large photo left, bio text right |
| 13 | `VideoTestimonialSection` | Heading + video embed grid |
| 14 | `TestimonialCarousel` | Heading + horizontal card carousel |
| 15 | `WhyThisMattersStats` | Large stat numbers with supporting text |
| 16 | `BenefitsGrid` | Heading + 3-column icon+text grid |
| 17 | `BenefitsWithImages` | Alternating image+text rows |
| 18 | `NumberedReasons` | Numbered list with heading + description |
| 19 | `ClosingCTAWithList` | Headline + checklist + CTA button |
| 20 | `OptinFormBlock` | Headline + email input + submit button |

---

## Stage 3: Auto-Polish (New)

After Stage 2 produces JSX, Stage 3 runs a Claude API call that reviews and fixes the output.

### Polish prompt structure

```
You are reviewing a generated React component for a landing page section.

RULES:
1. Colors MUST match the style brief exactly — check every hex code
2. Font families MUST be from the style brief — no system fonts
3. Font sizes MUST follow the typography scale
4. Max-width MUST be 1120px for section containers
5. Section padding MUST follow the spacing tokens
6. Grid/flex structure MUST match the skeleton — do not change layout
7. Button styles MUST match: pill radius (500px), correct colors
8. Responsive breakpoints at 991px and 767px

Input: the JSX, the style brief JSON, the skeleton
Output: corrected JSX (same format, fixed values only)
```

### What Stage 3 catches

- Wrong hex codes (Gemini picks `#6B46E5` instead of `#704fe6`)
- Wrong fonts (Gemini defaults to system fonts)
- Inconsistent spacing (40px padding where 75px is specified)
- Missing responsive breakpoints
- Layout drift from skeleton (extra wrappers, changed grid columns)

---

## Filament UI Changes

### Generation action (existing — modify)

The "Generate Landing Pages" action gets a new optional field:
- **Reference URL** — optional text input, defaults to empty
- When provided: system screenshots it and extracts style brief
- When empty: uses the summit's saved style brief or a preset theme

### Section-level actions (new — future)

Each generated section in the draft editor gets:
- **Regenerate** (existing) — re-runs Stage 1+2+3 for this section
- **Polish** (new) — re-runs Stage 3 only, fixing colors/spacing/fonts
- **Audit** (new) — runs impeccable-style checks, reports issues without editing

These are follow-up items — not in initial scope.

---

## Scope

### In scope (this spec)

1. Extract parenting-summits.com style brief into a reusable JSON
2. Write layout skeletons for the 10 Phase 1 section types
3. Modify Stage 1 prompt to include skeleton + per-type reference screenshot
4. Modify Stage 2 prompt to enforce skeleton structure
5. Add Stage 3 (Claude polish pass)
6. Test: generate a page targeting parenting-summits.com and compare

### Out of scope (follow-up)

- Multiple variations / alternate themes
- Filament theme editor for operators
- Per-section polish/audit buttons in the draft editor
- Phase 2 skeletons (remaining 10 section types)
- Preset theme library (warm-organic, bold-modern, etc.)
- Storybook integration

---

## Success Criteria

Generate a landing page for the ADHD Parenting Summit that, when placed side-by-side with parenting-summits.com:

1. Uses the same color palette (purple/amber/lavender)
2. Uses the same fonts (Poppins primary, Cormorant Garamond accents)
3. Has the same layout structure per section (2-column hero, 4-column speaker grid, etc.)
4. Has consistent spacing (75px section padding, 1120px max-width)
5. Has pill-shaped CTA buttons with correct colors
6. Is responsive at 991px and 767px breakpoints

"Pixel-perfect" means a non-designer would say "these look like the same page."
