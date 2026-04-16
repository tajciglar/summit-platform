# Pixel-Perfect Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate landing pages that visually match parenting-summits.com using skeleton-constrained AI generation with auto-polish.

**Architecture:** Layout skeletons constrain grid structure per section type. Gemini fills content/colors/typography within those constraints. A new Stage 3 (Claude) polishes the output against the style brief. All three stages run automatically on generation.

**Tech Stack:** Next.js 16 (TypeScript), Gemini 2.5 Pro/Flash, Claude API, Laravel 11 (PHP 8.3)

---

## File Structure

### New files
| File | Responsibility |
|------|----------------|
| `next-app/src/lib/skeletons/index.ts` | Skeleton loader — exports `loadSkeleton(type)` |
| `next-app/src/lib/skeletons/HeroWithCountdown.ts` | Hero skeleton |
| `next-app/src/lib/skeletons/StickyCountdownBar.ts` | Sticky bar skeleton |
| `next-app/src/lib/skeletons/SocialProofBadge.ts` | Social proof skeleton |
| `next-app/src/lib/skeletons/LogoStripCarousel.ts` | Logo strip skeleton |
| `next-app/src/lib/skeletons/StatsBar3Item.ts` | Stats bar skeleton |
| `next-app/src/lib/skeletons/FeatureWithImage.ts` | Feature section skeleton |
| `next-app/src/lib/skeletons/SpeakerGridDay.ts` | Speaker grid skeleton |
| `next-app/src/lib/skeletons/BonusStack.ts` | Bonus stack skeleton |
| `next-app/src/lib/skeletons/FAQAccordion.ts` | FAQ skeleton |
| `next-app/src/lib/skeletons/Footer.ts` | Footer skeleton |
| `next-app/src/lib/blocks/polish-stage.ts` | Stage 3 — Claude polish pass |
| `next-app/src/app/api/sections/polish/route.ts` | API route for Stage 3 |
| `next-app/src/lib/themes/parenting-summits.ts` | Extracted style brief for parenting-summits.com |

### Modified files
| File | Change |
|------|--------|
| `next-app/src/lib/blocks/design-prompt.ts` | Add skeleton to prompt, tighten layout instructions |
| `next-app/src/lib/blocks/image-stage.ts` | Add skeleton to Stage 1 prompt, pass reference PNG |
| `app/Services/FunnelGenerator/Phases/BlockDesignPhase.php` | Add Stage 3 call after Stage 2 |
| `app/Services/StyleBrief/DefaultStyleBrief.php` | Update defaults to match parenting-summits.com |

---

### Task 1: Create parenting-summits.com style brief

**Files:**
- Create: `next-app/src/lib/themes/parenting-summits.ts`

- [ ] **Step 1: Create the theme file**

```ts
// next-app/src/lib/themes/parenting-summits.ts
export const parentingSummitsTheme = {
  palette: {
    primary: '#704fe6',
    primary_dark: '#5e4d9b',
    primary_deep: '#4831B0',
    primary_text: '#ffffff',
    cta: '#FBA506',
    cta_secondary: '#ffc500',
    cta_orange: '#ff8f00',
    accent_red: '#b83b4b',
    accent_green: '#00b553',
    background: '#ffffff',
    surface: '#e6e6fa',
    surface_translucent: 'rgba(196,190,218,0.96)',
    text: '#000000',
    text_muted: '#898686',
    text_light: '#a9a9a9',
    border: '#e5e7eb',
  },
  typography: {
    heading_font: 'Poppins',
    body_font: 'Poppins',
    accent_font: 'Cormorant Garamond',
    social_proof_font: 'Raleway',
    heading_weight: 700,
    scale: {
      h1: '48px',
      h2: '32px',
      h3: '24px',
      h4: '20px',
      body: '18px',
      body_sm: '16px',
      label: '14px',
      tiny: '12px',
    },
    line_height: {
      heading: 1.2,
      body: 1.4,
      relaxed: 1.6,
    },
  },
  components: {
    button_shape: 'pill',
    button_radius: '500px',
    button_radius_sm: '15px',
    button_weight: 'bold',
    card_style: 'elevated',
    card_radius: '12px',
  },
  rhythm: {
    section_padding_lg: '75px',
    section_padding_md: '50px',
    section_padding_sm: '24px',
    section_padding_x: '20px',
    max_width: '1120px',
    content_width_narrow: '740px',
    grid_gap: '20px',
    density: 'comfortable',
  },
  voice: {
    tone: 'warm-expert',
    headline_style: 'benefit-driven',
  },
  hero_pattern: 'split-image-right',
  responsive: {
    tablet: '991px',
    mobile: '767px',
    small_mobile: '479px',
  },
};
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd next-app && npx tsc --noEmit src/lib/themes/parenting-summits.ts`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add next-app/src/lib/themes/parenting-summits.ts
git commit -m "feat: add parenting-summits.com style brief theme"
```

---

### Task 2: Create skeleton loader infrastructure

**Files:**
- Create: `next-app/src/lib/skeletons/index.ts`

- [ ] **Step 1: Create the skeleton loader**

```ts
// next-app/src/lib/skeletons/index.ts

interface SkeletonDef {
  skeleton: string;
  slots: string[];
}

const registry = new Map<string, () => Promise<SkeletonDef>>();

registry.set('HeroWithCountdown', () => import('./HeroWithCountdown'));
registry.set('StickyCountdownBar', () => import('./StickyCountdownBar'));
registry.set('SocialProofBadge', () => import('./SocialProofBadge'));
registry.set('LogoStripCarousel', () => import('./LogoStripCarousel'));
registry.set('StatsBar3Item', () => import('./StatsBar3Item'));
registry.set('FeatureWithImage', () => import('./FeatureWithImage'));
registry.set('SpeakerGridDay', () => import('./SpeakerGridDay'));
registry.set('BonusStack', () => import('./BonusStack'));
registry.set('FAQAccordion', () => import('./FAQAccordion'));
registry.set('Footer', () => import('./Footer'));

export async function loadSkeleton(type: string): Promise<SkeletonDef | null> {
  const loader = registry.get(type);
  if (!loader) return null;
  return loader();
}

export function hasSkeleton(type: string): boolean {
  return registry.has(type);
}
```

- [ ] **Step 2: Commit**

```bash
git add next-app/src/lib/skeletons/index.ts
git commit -m "feat: skeleton loader infrastructure"
```

---

### Task 3: Write layout skeletons (10 section types)

**Files:**
- Create: `next-app/src/lib/skeletons/HeroWithCountdown.ts`
- Create: `next-app/src/lib/skeletons/StickyCountdownBar.ts`
- Create: `next-app/src/lib/skeletons/SocialProofBadge.ts`
- Create: `next-app/src/lib/skeletons/LogoStripCarousel.ts`
- Create: `next-app/src/lib/skeletons/StatsBar3Item.ts`
- Create: `next-app/src/lib/skeletons/FeatureWithImage.ts`
- Create: `next-app/src/lib/skeletons/SpeakerGridDay.ts`
- Create: `next-app/src/lib/skeletons/BonusStack.ts`
- Create: `next-app/src/lib/skeletons/FAQAccordion.ts`
- Create: `next-app/src/lib/skeletons/Footer.ts`

Each skeleton defines the grid/flex layout only — no colors, no content. The AI fills the `__SLOT__` placeholders.

- [ ] **Step 1: Create HeroWithCountdown skeleton**

```ts
// next-app/src/lib/skeletons/HeroWithCountdown.ts
export const skeleton = `
<section className="__bg__ py-[75px] px-5">
  <div className="mx-auto max-w-[1120px] grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
    <div>
      {/* __SLOT_eyebrow__: small uppercase badge text */}
      {/* __SLOT_headline__: large h1 headline */}
      {/* __SLOT_subheadline__: supporting paragraph text */}
      {/* __SLOT_cta__: primary CTA button (pill shape) */}
      {/* __SLOT_social_proof__: avatar stack + rating + text */}
    </div>
    <div className="flex items-center justify-center">
      {/* __SLOT_hero_visual__: speaker photo collage or countdown timer */}
    </div>
  </div>
</section>
`;

export const slots = [
  'eyebrow', 'headline', 'subheadline', 'cta',
  'social_proof', 'hero_visual',
];
```

- [ ] **Step 2: Create StickyCountdownBar skeleton**

```ts
// next-app/src/lib/skeletons/StickyCountdownBar.ts
export const skeleton = `
<div className="fixed top-0 left-0 right-0 z-50 __bg__ py-2 shadow-lg">
  <div className="mx-auto max-w-[1120px] px-4 flex items-center justify-center gap-4">
    {/* __SLOT_message__: short promotional text */}
    <div className="flex items-center gap-3 shrink-0">
      {/* __SLOT_countdown__: days:hours:mins:secs digits */}
    </div>
    {/* __SLOT_cta__: small CTA button */}
  </div>
</div>
`;

export const slots = ['message', 'countdown', 'cta'];
```

- [ ] **Step 3: Create SocialProofBadge skeleton**

```ts
// next-app/src/lib/skeletons/SocialProofBadge.ts
export const skeleton = `
<section className="__bg__ py-4">
  <div className="mx-auto max-w-[1120px] px-5 flex flex-wrap items-center justify-center gap-6">
    {/* __SLOT_avatar_stack__: overlapping circular avatars */}
    {/* __SLOT_rating__: star rating display */}
    {/* __SLOT_text__: "Loved by X parents" text */}
  </div>
</section>
`;

export const slots = ['avatar_stack', 'rating', 'text'];
```

- [ ] **Step 4: Create LogoStripCarousel skeleton**

```ts
// next-app/src/lib/skeletons/LogoStripCarousel.ts
export const skeleton = `
<section className="__bg__ py-[50px] px-5">
  <div className="mx-auto max-w-[1120px] text-center">
    {/* __SLOT_heading__: "Speakers Featured In" or similar */}
    <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-12">
      {/* __SLOT_logos__: media/brand logo images in a row */}
    </div>
  </div>
</section>
`;

export const slots = ['heading', 'logos'];
```

- [ ] **Step 5: Create StatsBar3Item skeleton**

```ts
// next-app/src/lib/skeletons/StatsBar3Item.ts
export const skeleton = `
<section className="__bg__ py-[24px] px-5">
  <div className="mx-auto max-w-[1120px] grid grid-cols-3 divide-x __divide_color__">
    {/* __SLOT_stat_1__: number + label column */}
    {/* __SLOT_stat_2__: number + label column */}
    {/* __SLOT_stat_3__: number + label column */}
  </div>
</section>
`;

export const slots = ['stat_1', 'stat_2', 'stat_3'];
```

- [ ] **Step 6: Create FeatureWithImage skeleton**

```ts
// next-app/src/lib/skeletons/FeatureWithImage.ts
export const skeleton = `
<section className="__bg__ py-[75px] px-5">
  <div className="mx-auto max-w-[1120px] grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div>
      {/* __SLOT_heading__: section heading */}
      {/* __SLOT_body__: descriptive body text, can include bullet points */}
      {/* __SLOT_cta__: CTA button */}
    </div>
    <div>
      {/* __SLOT_image__: feature image or photo */}
    </div>
  </div>
</section>
`;

export const slots = ['heading', 'body', 'cta', 'image'];
```

- [ ] **Step 7: Create SpeakerGridDay skeleton**

```ts
// next-app/src/lib/skeletons/SpeakerGridDay.ts
export const skeleton = `
<section className="__bg__ py-[75px] px-5">
  <div className="mx-auto max-w-[1120px]">
    {/* __SLOT_day_header__: "Day N: Theme Title" centered heading */}
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {/* __SLOT_speaker_cards__: array of speaker cards with circular photo, name, title, talk title, "View More" link */}
    </div>
  </div>
</section>
`;

export const slots = ['day_header', 'speaker_cards'];
```

- [ ] **Step 8: Create BonusStack skeleton**

```ts
// next-app/src/lib/skeletons/BonusStack.ts
export const skeleton = `
<section className="__bg__ py-[75px] px-5">
  <div className="mx-auto max-w-[1120px]">
    {/* __SLOT_heading__: section heading */}
    {/* __SLOT_subheading__: supporting text */}
    <div className="mt-8 space-y-6">
      {/* __SLOT_bonus_items__: vertical stack of bonus cards, each with image + title + description + value */}
    </div>
    <div className="mt-10 text-center">
      {/* __SLOT_cta__: CTA button */}
    </div>
  </div>
</section>
`;

export const slots = ['heading', 'subheading', 'bonus_items', 'cta'];
```

- [ ] **Step 9: Create FAQAccordion skeleton**

```ts
// next-app/src/lib/skeletons/FAQAccordion.ts
export const skeleton = `
<section className="__bg__ py-[75px] px-5">
  <div className="mx-auto max-w-[740px] text-center">
    {/* __SLOT_heading__: "Frequently Asked Questions" heading */}
    {/* __SLOT_subheading__: optional supporting text */}
  </div>
  <div className="mx-auto max-w-[740px] mt-8 space-y-3">
    {/* __SLOT_items__: accordion items with question + answer, collapsible */}
  </div>
</section>
`;

export const slots = ['heading', 'subheading', 'items'];
```

- [ ] **Step 10: Create Footer skeleton**

```ts
// next-app/src/lib/skeletons/Footer.ts
export const skeleton = `
<footer className="__bg__ py-[50px] px-5">
  <div className="mx-auto max-w-[1120px]">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* __SLOT_brand__: summit name + short description */}
      {/* __SLOT_links_1__: quick links column */}
      {/* __SLOT_links_2__: support links column */}
    </div>
    <div className="mt-8 pt-8 border-t __border_color__ text-center">
      {/* __SLOT_copyright__: copyright text + tagline */}
    </div>
  </div>
</footer>
`;

export const slots = ['brand', 'links_1', 'links_2', 'copyright'];
```

- [ ] **Step 11: Verify all skeletons compile**

Run: `cd next-app && npx tsc --noEmit src/lib/skeletons/*.ts`
Expected: No errors

- [ ] **Step 12: Commit**

```bash
git add next-app/src/lib/skeletons/
git commit -m "feat: layout skeletons for 10 section types"
```

---

### Task 4: Modify Stage 1 to use skeletons + reference PNGs

**Files:**
- Modify: `next-app/src/lib/blocks/image-stage.ts`

- [ ] **Step 1: Update ImageStageInput to accept skeleton**

Add a `skeleton` field to the input interface and update the prompt to include the skeleton layout description. Also pass the per-type reference PNG to `callGeminiImage` (the earlier concern about large payloads may not apply to small per-type PNGs ~50-100KB vs full-page screenshots ~500KB+).

```ts
// next-app/src/lib/blocks/image-stage.ts
import { callGeminiImage, type GeminiImage, type GeminiImageResult } from './gemini-client';
import { loadReferenceImage } from '../../../scripts/lib/prompt-parts';
import { loadSkeleton } from '../skeletons';
import type { SectionBrief, SummitContext } from './design-prompt';

export interface ImageStageInput {
  section: SectionBrief;
  summit: SummitContext;
  styleBrief: Record<string, unknown>;
  referenceImage?: { mime: string; data: string } | null;
}

export async function designSectionImage(input: ImageStageInput): Promise<GeminiImageResult> {
  const skel = await loadSkeleton(input.section.type);

  const skeletonBlock = skel
    ? [
        `Layout skeleton (MANDATORY — match this grid/flex structure exactly):`,
        '```',
        skel.skeleton.trim(),
        '```',
        `Slots to fill: ${skel.slots.join(', ')}`,
        ``,
      ]
    : [];

  const prompt = [
    `Design ONE landing-page section as a 1440x900 mockup image.`,
    ``,
    `Section: ${input.section.type} — ${input.section.purpose || 'n/a'} (position ${input.section.position} of ${input.section.total}).`,
    ``,
    ...skeletonBlock,
    `Style Brief (authoritative visual constraints — use these EXACT hex codes, fonts, shapes):`,
    JSON.stringify(input.styleBrief, null, 2),
    ``,
    `Summit context (use real copy where natural — summit name, date, speakers):`,
    JSON.stringify(input.summit, null, 2),
    ``,
    `Design constraints:`,
    `- Output ONE image sized 1440x900, no watermarks, no cropping.`,
    `- Apply the Style Brief palette hex codes (primary/accent/background etc).`,
    `- Apply the Style Brief typography (heading_font for headlines, body_font for body).`,
    `- Section max-width: 1120px centered. Section padding: 75px vertical, 20px horizontal.`,
    `- Typography hierarchy: clear H1 (48px), supporting body (18px), CTA button when relevant.`,
    `- CTA buttons: pill shape (border-radius: 500px), bold font, primary or cta color.`,
    `- Realistic imagery or placeholder photography; no lorem ipsum.`,
    `- Match the attached reference image's visual density, spacing, and proportions if provided.`,
  ].join('\n');

  // Load per-type reference PNG as visual anchor for layout fidelity
  const refs: GeminiImage[] = [];
  const refPath = `docs/block-references/${input.section.type}.png`;
  const refImg = await loadReferenceImage(refPath).catch(() => null);
  if (refImg) refs.push(refImg);

  return callGeminiImage(prompt, refs);
}
```

- [ ] **Step 2: Test that the Next.js app still compiles**

Run: `cd next-app && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add next-app/src/lib/blocks/image-stage.ts
git commit -m "feat: Stage 1 now uses skeletons + reference PNGs"
```

---

### Task 5: Modify Stage 2 prompt to enforce skeleton structure

**Files:**
- Modify: `next-app/src/lib/blocks/design-prompt.ts`

- [ ] **Step 1: Update buildDesignPrompt to load and inject skeleton**

```ts
// next-app/src/lib/blocks/design-prompt.ts
// Add this import at the top, after existing imports:
import { loadSkeleton } from '../skeletons';

// Replace the buildDesignPrompt function body:
export async function buildDesignPrompt(input: BuildDesignPromptInput): Promise<DesignPrompt> {
  const [designSystem, primitives, skel] = await Promise.all([
    loadDesignSystem(),
    loadPrimitiveSources(),
    loadSkeleton(input.section.type),
  ]);

  let anchor: { mime: string; data: string } | null = input.mockupImage ?? input.referenceImage ?? null;
  if (!anchor) {
    const refPath = `docs/block-references/${input.section.type}.png`;
    anchor = await loadReferenceImage(refPath).catch(() => null);
  }

  const intro = input.mockupImage
    ? `You are an expert React + Tailwind v4 developer. Implement the attached mockup PNG as a single React component. Match the mockup EXACTLY — colors, spacing, typography, icon shapes, layout.`
    : `You are an expert React + Tailwind v4 developer designing ONE landing-page section. Match the layout, density, palette and visual hierarchy of the reference PNG (if provided).`;

  const styleBriefBlock = input.styleBrief
    ? [`=== Style Brief (authoritative palette/typography/components) ===`, JSON.stringify(input.styleBrief, null, 2)]
    : [];

  const skeletonBlock = skel
    ? [
        `=== Layout Skeleton (MANDATORY — preserve this structure) ===`,
        `The skeleton below defines the grid/flex layout for this section type.`,
        `You MUST use this exact grid structure. Do NOT change grid-cols, max-width, or flex layout.`,
        `Replace each __SLOT_xxx__ comment with styled JSX content.`,
        `Replace __bg__ with the appropriate background color from the Style Brief.`,
        `Replace __border_color__ and __divide_color__ with the border color from the Style Brief.`,
        '```',
        skel.skeleton.trim(),
        '```',
        `Slots to fill: ${skel.slots.join(', ')}`,
      ]
    : [];

  const text = [
    intro,
    ``,
    `Section brief:`,
    `  type: ${input.section.type}`,
    `  purpose: ${input.section.purpose}`,
    `  position: ${input.section.position} of ${input.section.total}`,
    ``,
    `Summit context:`,
    JSON.stringify(input.summit, null, 2),
    ``,
    ...styleBriefBlock,
    ``,
    ...skeletonBlock,
    ``,
    `=== Design System ===`,
    designSystem,
    ``,
    `=== Primitives (importable from @/components/ui/*) ===`,
    primitives,
    ``,
    input.previousSectionJsx ? `Previous section (for visual flow):\n${input.previousSectionJsx}` : '',
    input.currentJsx ? `Current JSX (regenerating):\n${input.currentJsx}` : '',
    input.regenerationNote ? `Operator note: ${input.regenerationNote}` : '',
    ``,
    `=== Output format ===`,
    `Return ONE JSON object matching this exact shape — no markdown fences, no commentary, no other fields:`,
    RUNTIME_EXAMPLE,
    ``,
    `Output rules:`,
    `- Top-level keys MUST be exactly "jsx" and "fields". Do NOT return schema_ts/meta_ts/component_tsx/index_ts (that is a different format).`,
    `- "jsx" is a single-file React component string. Export default a function named S that takes a props object.`,
    `- Only imports allowed inside the JSX: react, @/components/ui/*. Do NOT import lucide-react or any other icon library.`,
    `- For icons, inline SVGs directly in the JSX (24x24 viewBox, currentColor stroke).`,
    `- No client hooks (useState/useEffect/etc), no script/style tags, no network calls, no dynamic imports.`,
    `- Tailwind v4 classes only. No Framer Motion.`,
    `- Apply the Style Brief palette's hex codes inline (e.g. "bg-[#704fe6]") or via Tailwind arbitrary values.`,
    `- Font families: use font-['Poppins'] for body, font-['Cormorant_Garamond'] for accent headings per Style Brief.`,
    `- Max-width for section containers: max-w-[1120px]. Section padding: py-[75px] px-5.`,
    `- CTA buttons: rounded-full (pill shape), font-bold, px-8 py-4.`,
    `- Every editable string/image MUST appear in "fields" with its AST path (e.g. "props.headline").`,
    skel ? `- CRITICAL: Preserve the skeleton's grid/flex layout exactly. Only fill the __SLOT__ placeholders.` : '',
  ].filter(Boolean).join('\n');

  return anchor ? { text, image: anchor } : { text };
}
```

- [ ] **Step 2: Verify compilation**

Run: `cd next-app && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add next-app/src/lib/blocks/design-prompt.ts
git commit -m "feat: Stage 2 prompt enforces skeleton layout structure"
```

---

### Task 6: Add Stage 3 — Claude polish pass

**Files:**
- Create: `next-app/src/lib/blocks/polish-stage.ts`
- Create: `next-app/src/app/api/sections/polish/route.ts`

- [ ] **Step 1: Create the polish stage module**

```ts
// next-app/src/lib/blocks/polish-stage.ts
import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = process.env.CLAUDE_POLISH_MODEL ?? 'claude-sonnet-4-20250514';

interface PolishInput {
  jsx: string;
  styleBrief: Record<string, unknown>;
  skeleton: string | null;
  sectionType: string;
}

interface PolishResult {
  jsx: string;
  changes: string[];
}

export async function polishSection(input: PolishInput): Promise<PolishResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Skip polish if no API key — return original unchanged
    return { jsx: input.jsx, changes: [] };
  }

  const client = new Anthropic({ apiKey });

  const prompt = [
    `You are reviewing a generated React/Tailwind landing page section. Fix ONLY color, font, spacing, and layout errors. Do not change content or add features.`,
    ``,
    `Section type: ${input.sectionType}`,
    ``,
    `=== Style Brief (authoritative — all values must match) ===`,
    JSON.stringify(input.styleBrief, null, 2),
    ``,
    input.skeleton ? `=== Layout Skeleton (grid/flex structure must match) ===\n${input.skeleton}` : '',
    ``,
    `=== Rules ===`,
    `1. Every hex color in the JSX must come from the Style Brief palette. Replace wrong colors.`,
    `2. Font families must be from the Style Brief: heading_font, body_font, accent_font.`,
    `3. Section container max-width must be max-w-[1120px].`,
    `4. Section vertical padding must use py-[75px] (large sections) or py-[50px] (medium) or py-[24px] (compact).`,
    `5. CTA buttons must be pill-shaped (rounded-full), bold font, using cta or primary color.`,
    `6. If a skeleton was provided, the grid/flex container classes must match exactly.`,
    `7. Do NOT add new content, components, hooks, or imports.`,
    `8. Do NOT remove existing content or fields.`,
    ``,
    `=== Input JSX ===`,
    input.jsx,
    ``,
    `=== Output ===`,
    `Return a JSON object with exactly two keys:`,
    `- "jsx": the corrected JSX string (full component, same format as input)`,
    `- "changes": array of strings describing each fix (empty array if no fixes needed)`,
    ``,
    `If no fixes are needed, return the original JSX unchanged with an empty changes array.`,
  ].filter(Boolean).join('\n');

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.jsx === 'string' && Array.isArray(parsed?.changes)) {
      return { jsx: parsed.jsx, changes: parsed.changes };
    }
  } catch {
    // Parse failure — try extracting JSON from markdown fences
    const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (match?.[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (typeof parsed?.jsx === 'string') {
          return { jsx: parsed.jsx, changes: parsed.changes ?? [] };
        }
      } catch { /* fall through */ }
    }
  }

  // If parsing fails, return original unchanged
  return { jsx: input.jsx, changes: [] };
}
```

- [ ] **Step 2: Create the API route**

```ts
// next-app/src/app/api/sections/polish/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { polishSection } from '@/lib/blocks/polish-stage';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (token !== process.env.INTERNAL_API_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.jsx || !body?.sectionType) {
    return NextResponse.json({ error: 'invalid body: jsx and sectionType required' }, { status: 400 });
  }

  const result = await polishSection({
    jsx: body.jsx,
    styleBrief: body.styleBrief ?? {},
    skeleton: body.skeleton ?? null,
    sectionType: body.sectionType,
  });

  return NextResponse.json(result);
}
```

- [ ] **Step 3: Verify compilation**

Run: `cd next-app && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add next-app/src/lib/blocks/polish-stage.ts next-app/src/app/api/sections/polish/route.ts
git commit -m "feat: Stage 3 Claude polish pass for generated sections"
```

---

### Task 7: Integrate Stage 3 into BlockDesignPhase.php

**Files:**
- Modify: `app/Services/FunnelGenerator/Phases/BlockDesignPhase.php`

- [ ] **Step 1: Add Stage 3 calls after Stage 2 in the run() method**

After the Stage 2 code response loop (line ~131), add a Stage 3 polish pass for each successful section. Add after the existing `$sections = [];` line and the Stage 2 foreach loop:

```php
// After the Stage 2 foreach loop that builds $sections, add:

// Stage 3 — parallel polish calls for sections that rendered successfully.
$polishable = [];
foreach ($sections as $i => $section) {
    if (($section['status'] ?? '') === 'ready' && ! empty($section['jsx'])) {
        $polishable[$i] = $section;
    }
}

if (! empty($polishable) && ! empty($styleBrief)) {
    $polishResponses = Http::pool(function ($pool) use ($polishable, $styleBrief, $base, $token) {
        $out = [];
        foreach ($polishable as $i => $section) {
            $out[] = $pool->as("polish_{$i}")
                ->withToken($token)
                ->timeout(60)
                ->post("{$base}/api/sections/polish", [
                    'jsx' => $section['jsx'],
                    'styleBrief' => $styleBrief,
                    'skeleton' => null,
                    'sectionType' => $section['type'] ?? '',
                ]);
        }
        return $out;
    });

    foreach ($polishable as $i => $section) {
        $resp = $polishResponses["polish_{$i}"] ?? null;
        if ($resp instanceof Throwable) {
            Log::warning('BlockDesignPhase Stage 3 threw', [
                'section' => $section['type'] ?? null,
                'error' => $resp->getMessage(),
            ]);
            continue;
        }
        if (! $resp?->successful()) {
            Log::warning('BlockDesignPhase Stage 3 non-2xx', [
                'section' => $section['type'] ?? null,
                'status' => $resp?->status(),
            ]);
            continue;
        }
        $polished = $resp->json();
        if (! empty($polished['jsx'])) {
            $sections[$i]['jsx'] = $polished['jsx'];
            $sections[$i]['polish_changes'] = $polished['changes'] ?? [];
        }
    }
}
```

- [ ] **Step 2: Verify PHP syntax**

Run: `php -l app/Services/FunnelGenerator/Phases/BlockDesignPhase.php`
Expected: No syntax errors detected

- [ ] **Step 3: Commit**

```bash
git add app/Services/FunnelGenerator/Phases/BlockDesignPhase.php
git commit -m "feat: integrate Stage 3 polish into BlockDesignPhase"
```

---

### Task 8: Update DefaultStyleBrief to match parenting-summits.com

**Files:**
- Modify: `app/Services/StyleBrief/DefaultStyleBrief.php`

- [ ] **Step 1: Update the default palette and typography**

Replace the palette and typography arrays in `DefaultStyleBrief::get()`:

```php
public static function get(): array
{
    return [
        'palette' => [
            'primary' => '#704fe6',
            'primary_dark' => '#5e4d9b',
            'primary_text' => '#ffffff',
            'cta' => '#FBA506',
            'cta_secondary' => '#ffc500',
            'cta_orange' => '#ff8f00',
            'accent_green' => '#00b553',
            'background' => '#ffffff',
            'surface' => '#e6e6fa',
            'text' => '#000000',
            'text_muted' => '#898686',
            'border' => '#e5e7eb',
        ],
        'typography' => [
            'heading_font' => 'Poppins',
            'body_font' => 'Poppins',
            'accent_font' => 'Cormorant Garamond',
            'heading_weight' => 700,
            'scale' => 'comfortable',
        ],
        'components' => [
            'button_shape' => 'pill',
            'button_radius' => '500px',
            'button_weight' => 'bold',
            'card_style' => 'elevated',
            'card_radius' => '12px',
        ],
        'rhythm' => [
            'section_padding' => '75px',
            'max_width' => 1120,
            'density' => 'comfortable',
        ],
        'voice' => [
            'tone' => 'warm-expert',
            'headline_style' => 'benefit-driven',
        ],
        'hero_pattern' => 'split-image-right',
        '_generated_from' => null,
        '_generated_at' => null,
        '_locked_fields' => [],
    ];
}
```

- [ ] **Step 2: Run existing tests to make sure nothing breaks**

Run: `php artisan test --filter=StyleBrief`
Expected: All existing tests pass

- [ ] **Step 3: Commit**

```bash
git add app/Services/StyleBrief/DefaultStyleBrief.php
git commit -m "feat: update default style brief to parenting-summits.com values"
```

---

### Task 9: End-to-end test — generate a page and compare

**Files:** None (testing only)

- [ ] **Step 1: Start the Next.js dev server**

Run: `cd next-app && pnpm dev`
Expected: Server running on localhost:3000

- [ ] **Step 2: Generate a single HeroWithCountdown section via curl**

```bash
curl -s -X POST http://localhost:3000/api/sections/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer any-random-string" \
  -d '{
    "section": {"type": "HeroWithCountdown", "purpose": "Main hero with speaker collage and CTA", "position": 1, "total": 10},
    "summit": {
      "name": "ADHD Parenting Summit 2026",
      "date": "March 3-7, 2026",
      "brandColors": {"primary": "#704fe6", "accent": "#FBA506", "ink": "#5e4d9b"},
      "mode": "light",
      "speakers": [
        {"name": "Dr. Edward Hallowell", "title": "Psychiatrist"},
        {"name": "Dr. Peg Dawson", "title": "Psychologist"},
        {"name": "Dana Kay", "title": "Board Certified Holistic Health Practitioner"}
      ],
      "toneBrief": "Warm, supportive, evidence-based. Speak to overwhelmed parents with empathy.",
      "product": null
    },
    "previousSectionJsx": null,
    "styleBrief": {
      "palette": {"primary": "#704fe6", "primary_dark": "#5e4d9b", "cta": "#FBA506", "background": "#ffffff", "surface": "#e6e6fa", "text": "#000000"},
      "typography": {"heading_font": "Poppins", "body_font": "Poppins", "accent_font": "Cormorant Garamond"},
      "components": {"button_shape": "pill", "button_radius": "500px"},
      "rhythm": {"max_width": 1120, "section_padding": "75px"}
    },
    "mockupImage": null,
    "referenceImage": null
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Status:', d.get('status')); print('JSX length:', len(d.get('jsx',''))); print('Fields:', len(d.get('fields',[])))"
```

Expected: Status: ready, JSX length > 1000, Fields > 3

- [ ] **Step 3: Check the generated JSX uses correct layout**

Verify the JSX contains:
- `max-w-[1120px]` (not 1440 or 7xl)
- `grid-cols-1 lg:grid-cols-[1.2fr_1fr]` or similar 2-column split
- `#704fe6` or `#5e4d9b` (purple colors)
- `Poppins` font reference
- `rounded-full` on CTA buttons

- [ ] **Step 4: Generate full 10-section page and build preview**

Use the test script from earlier in this session (adapted with parenting-summits.com style brief) to generate all 10 sections and build a preview HTML. Compare visually against parenting-summits.com screenshots.

- [ ] **Step 5: Test Stage 3 polish endpoint**

```bash
curl -s -X POST http://localhost:3000/api/sections/polish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer any-random-string" \
  -d '{
    "jsx": "export default function S(props) { return (<section className=\"py-20 bg-blue-500\"><div className=\"max-w-7xl mx-auto\"><h1 className=\"text-4xl font-bold\">{props.headline}</h1></div></section>) }",
    "sectionType": "HeroWithCountdown",
    "styleBrief": {
      "palette": {"primary": "#704fe6", "background": "#ffffff"},
      "typography": {"heading_font": "Poppins"},
      "rhythm": {"max_width": 1120, "section_padding": "75px"}
    }
  }' | python3 -c "import json,sys; d=json.load(sys.stdin); print('Changes:', d.get('changes',[])); print('JSX has 704fe6:', '#704fe6' in d.get('jsx',''))"
```

Expected: Changes list should include fixing `bg-blue-500` to `bg-[#704fe6]` and `max-w-7xl` to `max-w-[1120px]`.

- [ ] **Step 6: Compare generated page vs reference screenshots**

Take a full-page screenshot of the generated preview and place it side by side with `screenshots/parenting-summits-full.png`. Check:
- Same purple/amber color scheme
- Same 2-column hero layout
- Same 4-column speaker grid
- Same typography (Poppins)
- Same section spacing
- Pill-shaped CTA buttons

If significant gaps remain, iterate on the skeleton definitions and prompt wording.
