# Landing Page Generation V3 — Constrained Multi-Stage Pipeline

**Date:** 2026-04-16
**Status:** Draft
**Goal:** Generate landing pages that look professionally designed — not pixel-perfect clones of one site, but high-quality pages that could pass for hand-built by a designer.

---

## What We Tried and What Failed

### Attempt 1: Gemini generates JSX from scratch
- Gemini 2.5 Pro + Flash with reference PNGs and style brief
- **Result:** Correct structure, wrong colors/fonts/spacing. Pages look generic. Monotone backgrounds, excessive whitespace, cramped grids, empty sections.

### Attempt 2: Skeleton-constrained generation
- Added layout skeletons (grid/flex structure per section type) + Stage 3 Claude polish pass
- **Result:** Better layout structure, but still doesn't look designed. `design-system.ts` hardcodes old values that override the style brief.

### Attempt 3: Claude vs Gemini head-to-head screenshot recreation
- Both given the same parenting-summits.com hero screenshot
- **Result:** Neither produced a shippable result. Claude had better code quality but left sections empty. Gemini attempted more visually but produced rougher code.

### Attempt 4: Runtime CSS extraction (today)
- Fixed the CSS delivery problem — Tailwind classes now compile correctly via `@tailwindcss/node`
- **Result:** Colors, typography, and spacing now render. But the page still looks bad because Gemini's design decisions are mediocre — the CSS was never the real problem.

### Key Learning
**No model produces good UI from scratch.** The quality comes from the system around the model, not the model itself. v0.dev uses the same Claude Sonnet that scores 64% raw — but their pipeline gets 94% error-free by adding a component registry + AutoFix.

---

## Research Findings (April 2026)

### v0.dev Architecture (the benchmark)
- **Not a fine-tuned model** — it's a composite system: Claude Sonnet + RAG retrieval + shadcn/ui component registry + custom AutoFix model
- Raw Claude Sonnet: 64.71% error-free → v0 pipeline: 93.87% error-free
- The **29-point quality boost comes from the system**, not the model
- Key components: structured design token registry, component API specs, usage examples

### Screenshot-to-Code Benchmarks
- Claude Sonnet: 70.31% accuracy (best tested model)
- Claude is "much less lazy" — completes full implementations
- All models struggle with exact color matching and side-by-side layouts
- Gemini Flash accuracy: untested but expected lower based on code quality observations

### Multi-Stage Pipeline Pattern
Every high-quality tool uses multiple stages:
- **v0:** Generation → AutoFix → Deploy
- **Manus:** Strategy document → Asset generation → Component building → Debugging
- **Builder.io:** Specialized design-to-code model → Compiler → LLM adaptation pass
- **Our current:** Style Brief → Mockup image → JSX code → Validation

### AI Strengths Split
| Capability | Gemini | Claude |
|-----------|--------|--------|
| Visual layout composition | Strong | Moderate |
| Image generation (mockups) | Available (6/10 quality) | Not available |
| Color/design taste | Good | Good with constraints |
| Code precision | Moderate | Strong |
| Following rules strictly | Moderate | Strong |
| Completing full implementations | Moderate ("lazy" sometimes) | Strong ("much less lazy") |

---

## Recommended Architecture: Constrained Multi-Stage Pipeline

### The Pipeline

```
Summit Context + Style Brief + Reference Screenshots
    |
    v
Stage 0: PLAN (Claude)
    Pick section sequence, assign section types from allowed catalog
    Output: ordered list of {type, purpose, position}
    |
    v
Stage 1: DESIGN (Gemini Flash Image)
    For each section: generate a mockup PNG
    Input: style brief palette + section purpose + reference screenshots
    Output: mockup image per section
    |
    v
Stage 2: BUILD (Claude Sonnet/Opus via Anthropic API)
    For each section: implement the mockup as JSX
    Input: mockup PNG + component registry + design system rules
    Output: {jsx, fields} per section
    |
    v
Stage 3: VALIDATE + AUTOFIX
    AST whitelist check (existing validator)
    CSS extraction (built today)
    Optional: second Claude pass for visual discrepancy correction
    |
    v
Stage 4: PREVIEW + OPERATOR REVIEW
    Render in browser, operator approves/rejects/regenerates per section
```

### Why This Split

- **Gemini for design (Stage 1):** Good at visual composition, color harmony, understanding layout conventions. Its image generation can create layout mockups. It doesn't write code — it just designs.
- **Claude for code (Stage 2):** Best screenshot-to-code accuracy (70.31%), completes full implementations, follows strict rules about imports/no-hooks/no-lucide. v0 chose Claude as their base model.
- **Separation eliminates the core problem:** Gemini no longer writes bad code. Claude no longer makes bad design decisions. Each AI does what it's best at.

### The Component Registry (v0's Secret Sauce)

The single highest-impact addition. A structured document injected into Claude's context during Stage 2:

```
Registry:
  Primitives:
    Button: {module: "@/components/ui/button", props: [variant, size, asChild], usage: "..."}
    Card: {module: "@/components/ui/card", exports: [Card, CardHeader, CardTitle, CardContent], usage: "..."}
    Accordion: {module: "@/components/ui/accordion", exports: [...], usage: "..."}
    ...
  
  Design Tokens:
    Colors: "Use style brief values via inline hex. No CSS variables."
    Typography: "font-['Poppins'] for body, font-['Cormorant_Garamond'] for accent headings"
    Spacing: "Section padding: py-[75px]. Max-width: max-w-[1120px]. Card padding: p-8"
    Buttons: "Always rounded-full. Primary: bg-[{cta_color}] text-white. Secondary: border-2 border-[{primary}]"
    
  Layout Rules:
    - Alternate section backgrounds: white -> lavender -> white -> lavender
    - Hero: always 2-column on desktop (text left, image/countdown right)
    - Stats: full-width grid, 3-4 columns on desktop
    - Speakers: 3-column grid with photo circles
    - NO min-h-[50vh] — sections size to content
    
  Anti-Patterns:
    - Do NOT import lucide-react
    - Do NOT use useState/useEffect
    - Do NOT use monotone backgrounds (alternate white/lavender)
    - Do NOT leave grid cells empty
```

This registry is what v0's shadcn integration does — it tells the model exactly what components exist, how to use them, and what constraints to follow. The model doesn't guess; it follows the spec.

### What Changes From Current Code

| Component | Current | New |
|-----------|---------|-----|
| Code stage model | Gemini 2.5 Flash | Claude Sonnet (Anthropic API) |
| Design stage | Gemini generates JSX | Gemini generates mockup PNG |
| Prompt context | Design system + reference PNG | Component registry + mockup PNG + style brief |
| CSS delivery | Tailwind extraction (just built) | Same — unchanged |
| Validation | AST whitelist | Same + optional AutoFix pass |
| Preview | Same render pipeline | Same — unchanged |

### New Dependencies
- `@anthropic-ai/sdk` — already have `ANTHROPIC_API_KEY` in `.env`
- No other new dependencies

### Files to Create/Modify

| File | Action |
|------|--------|
| `next-app/src/lib/blocks/claude-coder.ts` | CREATE — Claude API wrapper for Stage 2 code generation |
| `next-app/src/lib/blocks/component-registry.ts` | CREATE — structured registry document builder |
| `next-app/src/lib/blocks/design-phase.ts` | MODIFY — split into design (Gemini mockup) + build (Claude code) |
| `next-app/src/lib/blocks/design-prompt.ts` | MODIFY — Gemini prompt changes from "write JSX" to "design mockup image" |
| `next-app/src/app/api/sections/generate/route.ts` | MODIFY — wire up new pipeline |
| `next-app/src/app/api/sections/regenerate/route.ts` | MODIFY — same pipeline for regen |
| `next-app/package.json` | MODIFY — add `@anthropic-ai/sdk` |

### What Stays Unchanged
- CSS extractor (`css-extractor.ts`) — still needed, Claude's JSX uses Tailwind classes
- Renderer (`renderer.ts`) — same `<style>` injection
- Field extractor (`field-extractor.ts`) — same `props.` prefix stripping
- JSX compiler (`jsx-compile.ts`) — same auto-import injection
- Validator (`validator.ts`) — same AST whitelist
- Preview page — same render pipeline
- Filament editor — same workflow
- Style Brief — same extraction, feeds into both Gemini (design) and Claude (build)

---

## The Golden Template Fallback

The previous session concluded "golden templates are the only path to pixel-perfect." This is still true for exact clones. But the multi-stage pipeline targets a different goal: **professionally designed pages that look custom**, not pixel-perfect copies of parenting-summits.com.

If the multi-stage pipeline still produces mediocre results, the fallback is:
1. Extract parenting-summits.com sections as JSX templates
2. AI only fills content (headlines, speaker names, dates, copy)
3. Style brief drives color/font customization per summit

This produces guaranteed quality but less variety. The multi-stage pipeline is the attempt to get variety WITH quality.

---

## Known Issues to Fix First

Before implementing V3, these issues from earlier sessions need resolution:

1. **`design-system.ts` hardcodes teal/Montserrat** — overrides style brief values in prompts. Must be updated to read from style brief dynamically.
2. **Speaker grid renders empty** — the SpeakerGridDay section generates but no speaker cards appear. Likely a data-passing issue (speakers array not reaching the component).
3. **`design-system.ts` vs component registry** — the new component registry should replace the current design-system.ts as the source of truth for AI prompt context.

---

## Success Criteria

A generated landing page should:
1. Have alternating white/lavender section backgrounds (visual rhythm)
2. Render with brand colors from the style brief (purple, gold/amber CTAs)
3. Have proper typography hierarchy (Poppins body, Cormorant Garamond accents)
4. Fill all grid cells (no empty speaker grids, no half-width stat cards)
5. Show gradient placeholders for images (until AI image gen is built)
6. Have no render errors in preview
7. Look like it was designed by a human, not generated by AI
8. Score at least 7/10 on visual quality when compared to professional landing pages

---

## Cost Estimate Per Page

| Stage | Model | Calls | Est. Cost |
|-------|-------|-------|-----------|
| Style Brief | Gemini Vision | 1 | ~$0.02 |
| Section Planning | Claude Sonnet | 1 | ~$0.05 |
| Mockup Images | Gemini Flash Image | 10 | ~$0.40 |
| JSX Code | Claude Sonnet | 10 | ~$0.50 |
| AutoFix (optional) | Claude Sonnet | ~3 | ~$0.15 |
| CSS Extraction | Local (Tailwind) | 10 | $0.00 |
| **Total per page** | | | **~$1.12** |

Current cost (all-Gemini): ~$0.50/page. The Claude code stage roughly doubles cost but should dramatically improve quality.
