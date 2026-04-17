# Session Handoff — 2026-04-16 Landing Page Quality

## Goal
Generate landing pages that are visually identical to parenting-summits.com with one click.

## What We Tried

### Attempt 1: AI generates from scratch with reference PNGs
- Used Gemini 2.5 Pro with the 20 block reference PNGs in `docs/block-references/`
- Result: Structure OK, but colors/fonts/layout fidelity was poor. Pages looked generic, not like the reference.

### Attempt 2: Skeleton-constrained generation
- Added layout skeletons (grid/flex structure per section type) to constrain Gemini's output
- Added Stage 3 Claude polish pass to fix colors/spacing after generation
- Updated style brief with exact parenting-summits.com design tokens
- Result: Layout improved (correct 2-column hero, 1120px max-width) but still doesn't look like parenting-summits.com. The `design-system.ts` hardcodes old teal/Montserrat values that override the style brief.

### Attempt 3: Claude vs Gemini head-to-head
- Gave both models the same screenshot of the parenting-summits.com hero
- Asked each to recreate it as JSX
- Results at `storage/app/public/hero-comparison.html`
- **Claude**: Better code quality (44 fields, clean JSX), but left the speaker collage empty
- **Gemini**: Attempted more visually (speaker initials in colored blocks), rougher code
- **Neither produced a shippable result** from a screenshot alone

## Conclusion
**Golden template approach is the only path to pixel-perfect.** Extract the actual HTML from parenting-summits.com, convert sections to JSX templates, and let the AI only fill content (summit name, speakers, dates, copy). The AI should not be designing the page.

## What's Already Built (8 commits on main)

```
328f021 feat: add parenting-summits.com style brief theme
1f79049 feat: skeleton loader + 10 layout skeletons
ac94c9f feat: Stage 1 now uses skeletons + reference PNGs
eba0884 feat: Stage 2 prompt enforces skeleton layout structure
884c811 feat: Stage 3 Claude polish pass for generated sections
abed9e9 feat: integrate Stage 3 polish into BlockDesignPhase
7f84ad1 feat: update default style brief to parenting-summits.com values
```

### New files created:
- `next-app/src/lib/themes/parenting-summits.ts` — extracted design tokens (colors, fonts, spacing)
- `next-app/src/lib/skeletons/` — 10 skeleton files + loader (HeroWithCountdown, StickyCountdownBar, SocialProofBadge, LogoStripCarousel, StatsBar3Item, FeatureWithImage, SpeakerGridDay, BonusStack, FAQAccordion, Footer)
- `next-app/src/lib/blocks/polish-stage.ts` — Stage 3 Claude polish pass
- `next-app/src/app/api/sections/polish/route.ts` — API route for Stage 3

### Modified files:
- `next-app/src/lib/blocks/image-stage.ts` — Stage 1 now loads skeletons + reference PNGs
- `next-app/src/lib/blocks/design-prompt.ts` — Stage 2 prompt enforces skeleton structure
- `app/Services/FunnelGenerator/Phases/BlockDesignPhase.php` — Stage 3 integrated after Stage 2
- `app/Services/StyleBrief/DefaultStyleBrief.php` — updated to parenting-summits.com values

## Key Design Tokens (parenting-summits.com)
- Primary purple: `#704fe6`
- Secondary purple: `#5e4d9b`
- CTA amber: `#FBA506`
- CTA gold: `#ffc500`
- Lavender surface: `#e6e6fa`
- Fonts: Poppins (primary), Cormorant Garamond (accent), Raleway (social proof)
- Max-width: 1120px, section padding: 75px, pill buttons (radius 500px)
- Full token extraction in the spec

## Source HTML
- parenting-summits.com source saved at: `/Users/tajbrzovic/Downloads/view-source_https___www.parenting-summits.com.html` (491K tokens, too big to read whole)
- Full design token extraction done by subagent — results in spec file

## Reference Screenshots
- `screenshots/parenting-summits-full.png` — full page
- `screenshots/ps-hero.png` — hero section viewport
- `screenshots/ps-speakers.png` — speaker section
- `screenshots/ps-mid.png` — middle sections
- `screenshots/ps-bottom.png` — bottom sections

## Specs & Plans
- Spec: `docs/superpowers/specs/2026-04-16-pixel-perfect-landing-page-design.md`
- Plan: `docs/superpowers/plans/2026-04-16-pixel-perfect-landing-page.md`

## Known Issues
- `design-system.ts` hardcodes teal (#0D9488) + Montserrat fonts — overrides style brief in prompts
- FAQAccordion uses `<Accordion>` component that needs mapping in preview HTML
- Preview builder needs component map for: Accordion, AccordionItem, AccordionTrigger, AccordionContent, Card, CardContent, CardHeader, CardTitle, Button, Separator

## Next Step
Extract actual sections from parenting-summits.com source HTML and convert to JSX templates. The AI only fills content — no design decisions. This is the path to "identical copy" quality.

## Research: Best Models for UI/UX Generation
- **Claude Sonnet**: Best for clean JSX/Tailwind code, better field extraction, semantic markup
- **Gemini 2.5 Pro**: Better visual interpretation, more ambitious attempts, rougher code quality
- **Recommendation**: Use Claude for code gen, Gemini for image mockups (Stage 1)
- **Reality check**: No model produces pixel-perfect code from screenshots alone — golden templates are needed

## Impeccable Plugin
Installed (`pbakaus/impeccable`). 18 commands available: `/audit`, `/critique`, `/polish`, `/typeset`, `/colorize`, `/animate`, `/bolder`, `/quieter`, etc. Not yet used for actual polishing — the generated output needs to be closer to target first before polish passes add value.
