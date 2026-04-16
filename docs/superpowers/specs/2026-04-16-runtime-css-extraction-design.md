# Runtime CSS Extraction for Gemini-Generated Landing Pages

**Date:** 2026-04-16
**Status:** Approved
**Problem:** Gemini generates JSX with Tailwind v4 arbitrary-value classes (`bg-[#8750F1]`, `py-[7.5rem]`, `font-['Poppins']`) that have no corresponding CSS rules. Tailwind scans source files at build time; runtime-generated JSX is never scanned. The result: all sections render as unstyled white boxes with black text.

## Solution: Per-Section CSS Extraction

After Gemini generates a section's JSX, extract the Tailwind class names from the source, compile them through Tailwind's Node API with the project's theme, and store the resulting CSS string alongside the section. Inject it as `<style>` tags during rendering.

### Flow

```
Gemini generates JSX
  -> validator checks JSX safety
  -> css-extractor extracts class candidates from JSX string
  -> Tailwind Node API compiles candidates -> CSS string (~2-5KB)
  -> Section stored: { id, type, jsx, fields, css, status }
  -> Renderer wraps HTML in <style>{css}</style> + rendered markup
```

## Components

### 1. CSS Extractor (`next-app/src/lib/blocks/css-extractor.ts`)

New module with a single public function:

```ts
extractCss(jsxSource: string): Promise<string>
```

**Implementation:**
- Parse the JSX string with regex to collect all `className="..."` and `className={...}` attribute values
- Split into individual candidate strings (space-separated class names)
- Also capture Tailwind responsive/state prefixes (e.g. `md:text-4xl`, `hover:bg-[#8750F1]/90`)
- Feed candidates to `@tailwindcss/node`'s `compile()` API with a CSS input based on the project's `globals.css` (the `@import "tailwindcss"` and `@theme` blocks that define brand tokens, fonts, and radii)
- Return the compiled CSS string

**Dependencies:**
- `@tailwindcss/node` (devDependency -- already has `tailwindcss` as a project dep via `@tailwindcss/postcss`)

**Performance:** ~1-2s per section. Negligible relative to Gemini's 20-30s generation time.

### 2. Section Type Update (`next-app/src/lib/blocks/types.ts`)

Add optional `css` field to `Section` interface:

```ts
interface Section {
  id: string;
  type: string;
  jsx: string;
  fields: SectionField[];
  css?: string;           // <- NEW: compiled Tailwind CSS for this section
  status: SectionStatus;
  regeneration_note: string | null;
  source_section_id: string | null;
  raw_output?: string;
  error?: string;
}
```

No database migration needed -- `sections` is a JSON column on `LandingPageDraft`. The `css` key is just a new optional field in the JSON.

### 3. Design Phase Integration (`next-app/src/lib/blocks/design-phase.ts`)

In `designSection()`, after Gemini returns valid JSX and the envelope is parsed:

```ts
const css = await extractCss(env.jsx);
return makeSection({ type: ..., jsx: env.jsx, fields: env.fields, css });
```

Same for the regeneration path -- the Next.js `/api/sections/regenerate` route calls `designSection()` which returns the section with CSS included.

### 4. Renderer Update (`next-app/src/lib/blocks/renderer.ts`)

In `renderSection()`:

- After rendering JSX to HTML, check `section.css`
- If present, prepend `<style>{css}</style>` to the rendered HTML
- If absent (existing drafts), extract CSS on-demand from `section.jsx` and prepend it
- Return combined CSS + HTML string

**On-demand fallback:** Existing `ready` drafts generated before this change have no `css` field. The renderer extracts CSS from their JSX on first render and returns it. The preview API route can write the extracted CSS back to the draft's sections JSON so subsequent renders are instant.

### 5. Preview Render Route Update (`next-app/src/app/api/drafts/preview/render/route.ts`)

After rendering all sections, if any sections had CSS extracted on-demand (i.e., they lacked a `css` field), write the updated sections back to the draft record. This is a one-time backfill per existing draft.

### 6. Broken Image Placeholder (`next-app/src/runtime/client-runtime.ts`)

Add an image error handler to the client runtime. Listen for `error` events on `<img>` elements (via event delegation on `document` in the capture phase). When an image fails to load:

1. Hide the broken `<img>` element
2. Insert a styled placeholder `<div>` with a gradient background and a subtle image icon (inline SVG)
3. Mark the element so it's only handled once

This catches all image load failures globally. Works for both preview and published pages. When AI image generation is built later, real images replace placeholders naturally.

**Security note:** The placeholder content is static/trusted (no user input), but use DOM methods (createElement, setAttribute) rather than string-based HTML injection.

## Scope Boundaries

**In scope:**
- CSS extractor module
- Section type update (add `css` field)
- Design phase integration (store CSS at generation time)
- Renderer integration (inject `<style>`, on-demand fallback)
- Preview route backfill (write extracted CSS back for caching)
- Broken image placeholder in client runtime

**Out of scope:**
- Standalone HTML publisher (`publisher.ts`) -- not the production path
- Gemini prompt changes -- current JSX output is good
- AI image generation -- separate future feature
- CSS variable token migration -- not needed when extraction works
- Filament editor UI changes -- same workflow, sections just look right

## Files to Create/Modify

| File | Action |
|------|--------|
| `next-app/src/lib/blocks/css-extractor.ts` | CREATE -- Tailwind CSS extraction function |
| `next-app/src/lib/blocks/types.ts` | MODIFY -- add `css?: string` to Section |
| `next-app/src/lib/blocks/design-phase.ts` | MODIFY -- extract CSS after Gemini returns JSX |
| `next-app/src/lib/blocks/renderer.ts` | MODIFY -- inject `<style>`, on-demand fallback |
| `next-app/src/app/api/drafts/preview/render/route.ts` | MODIFY -- backfill CSS to draft |
| `next-app/src/app/api/sections/regenerate/route.ts` | MODIFY -- extract CSS after regen |
| `next-app/src/runtime/client-runtime.ts` | MODIFY -- add broken image placeholder handler |
| `next-app/src/lib/blocks/__tests__/css-extractor.test.ts` | CREATE -- unit tests for extraction |
| `next-app/package.json` | MODIFY -- add `@tailwindcss/node` dependency |
