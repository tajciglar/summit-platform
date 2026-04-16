# Runtime CSS Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Gemini-generated landing page sections render with full styling (colors, typography, spacing, hover states) in preview and funnel pages.

**Architecture:** Extract Tailwind CSS from each section's JSX at generation time using `@tailwindcss/node`'s `compile()` API. Store the CSS string on the section object. Inject as `<style>` tags during rendering. Existing drafts get CSS extracted on-demand at first render.

**Tech Stack:** `@tailwindcss/node` (already installed), Tailwind v4 programmatic API, vitest

---

### Task 1: Add `css` field to Section type

**Files:**
- Modify: `next-app/src/lib/blocks/types.ts`

- [ ] **Step 1: Add the `css` field to the `Section` interface**

In `next-app/src/lib/blocks/types.ts`, add `css?: string` to the `Section` interface:

```ts
export interface Section {
  id: string;
  type: string;
  jsx: string;
  fields: SectionField[];
  css?: string;
  status: SectionStatus;
  regeneration_note: string | null;
  source_section_id: string | null;
  raw_output?: string;
  error?: string;
}
```

- [ ] **Step 2: Run typecheck**

Run: `cd next-app && pnpm typecheck`
Expected: Same 4 pre-existing errors (HeroWithCountdown stories/component, e2e playwright types). No new errors.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/lib/blocks/types.ts
git commit -m "feat(blocks): add css field to Section type for runtime CSS extraction"
```

---

### Task 2: Create CSS extractor module

**Files:**
- Create: `next-app/src/lib/blocks/css-extractor.ts`
- Create: `next-app/src/lib/blocks/__tests__/css-extractor.test.ts`

- [ ] **Step 1: Write the failing test**

Create `next-app/src/lib/blocks/__tests__/css-extractor.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { extractCss } from '../css-extractor';

describe('extractCss', () => {
  it('generates CSS for arbitrary-value Tailwind classes in JSX', async () => {
    const jsx = `
      export default function S(props) {
        return (
          <section className="bg-[#8750F1] py-[7.5rem] text-[#FFFFFF]">
            <h1 className="text-4xl font-bold">{props.headline}</h1>
          </section>
        );
      }
    `;
    const css = await extractCss(jsx);

    // Should contain rules for the arbitrary-value classes
    expect(css).toContain('#8750F1');
    expect(css).toContain('7.5rem');
    expect(css).toContain('#FFFFFF');
    // Should be non-trivial output
    expect(css.length).toBeGreaterThan(100);
  });

  it('handles responsive and hover prefixes', async () => {
    const jsx = `
      export default function S(props) {
        return <div className="md:text-[3rem] hover:bg-[#333]/80">x</div>;
      }
    `;
    const css = await extractCss(jsx);

    expect(css).toContain('3rem');
    expect(css).toContain('#333');
  });

  it('returns empty string for JSX with no className attributes', async () => {
    const jsx = `export default function S() { return <div>hello</div>; }`;
    const css = await extractCss(jsx);
    // May contain some boilerplate but no utility rules
    expect(css.length).toBeLessThan(50);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/css-extractor.test.ts`
Expected: FAIL — `extractCss` is not exported / module not found.

- [ ] **Step 3: Implement the CSS extractor**

Create `next-app/src/lib/blocks/css-extractor.ts`:

```ts
import { compile } from '@tailwindcss/node';
import path from 'path';

// Lazy-init: compile() is expensive (~200ms), so cache the result.
// The compiler is stateless after init — build() can be called many times.
let compilerPromise: ReturnType<typeof compile> | null = null;

function getCompiler() {
  if (!compilerPromise) {
    // Use utilities-only — theme/base layers are already on the page from
    // the Next.js build of globals.css.  This keeps per-section CSS small
    // (~2-5 KB) and avoids duplicating the full Tailwind reset.
    const input = '@import "tailwindcss/utilities" layer(utilities);';
    compilerPromise = compile(input, {
      base: path.resolve(process.cwd()),
      onDependency: () => {},
    });
  }
  return compilerPromise;
}

/**
 * Extract all Tailwind class candidates from a JSX source string,
 * compile them through Tailwind's engine, and return the resulting CSS.
 */
export async function extractCss(jsxSource: string): Promise<string> {
  const candidates = extractCandidates(jsxSource);
  if (candidates.length === 0) return '';

  const compiler = await getCompiler();
  return compiler.build(candidates);
}

/**
 * Pull every class name out of className="..." and className={`...`}
 * attribute values in a JSX string.
 */
function extractCandidates(jsx: string): string[] {
  const classes = new Set<string>();

  // Match className="..." (static)
  for (const m of jsx.matchAll(/className="([^"]+)"/g)) {
    for (const cls of splitClasses(m[1])) classes.add(cls);
  }

  // Match className={`...`} (template literal — extract static parts)
  for (const m of jsx.matchAll(/className=\{`([^`]+)`\}/g)) {
    for (const cls of splitClasses(m[1])) {
      // Skip template expression placeholders like ${...}
      if (!cls.startsWith('$')) classes.add(cls);
    }
  }

  // Match className={" (rare, single expression with string)
  for (const m of jsx.matchAll(/className=\{"([^"]+)"\}/g)) {
    for (const cls of splitClasses(m[1])) classes.add(cls);
  }

  // Match class="..." (SVG elements use class instead of className)
  for (const m of jsx.matchAll(/\bclass="([^"]+)"/g)) {
    for (const cls of splitClasses(m[1])) classes.add(cls);
  }

  return Array.from(classes);
}

function splitClasses(raw: string): string[] {
  return raw
    .split(/\s+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && !c.startsWith('${'));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/css-extractor.test.ts`
Expected: 3 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/lib/blocks/css-extractor.ts next-app/src/lib/blocks/__tests__/css-extractor.test.ts
git commit -m "feat(blocks): add CSS extractor using Tailwind v4 compile API"
```

---

### Task 3: Inject CSS in the renderer

**Files:**
- Modify: `next-app/src/lib/blocks/renderer.ts`

- [ ] **Step 1: Update `renderSection` to prepend `<style>` tag**

In `next-app/src/lib/blocks/renderer.ts`, import `extractCss` and modify `renderSection` to inject CSS:

```ts
// react-dom/server is loaded via createRequire to bypass Turbopack's static
// RSC module graph analysis, which rejects the import at compile time.
import { createRequire } from 'node:module';
import * as React from 'react';
import { compileJsxModule, type CompiledComponent } from './jsx-compile';
import { applyFieldValues } from './field-extractor';
import { extractCss } from './css-extractor';
import type { Section } from './types';
import { resolveUiPrimitive } from './primitive-resolver';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ReactDOMServer = createRequire(import.meta.url)(
  'react-dom/server',
) as typeof import('react-dom/server');

const componentCache = new Map<string, CompiledComponent>();

export async function renderSection<T extends Record<string, unknown>>(
  section: Section,
  defaultProps: T,
): Promise<string> {
  if (section.status === 'failed') throw new Error(`section ${section.id} is failed`);

  let Component = componentCache.get(section.id);
  if (!Component) {
    Component = await compileJsxModule(section.jsx, { resolve: resolveUiPrimitive });
    componentCache.set(section.id, Component);
  }

  const props = applyFieldValues(defaultProps, section.fields);
  const html = ReactDOMServer.renderToString(React.createElement(Component, props));

  // Inject per-section CSS. Use stored css if available, otherwise extract
  // on-demand (for existing drafts created before this feature).
  const css = section.css || await extractCss(section.jsx);
  if (css) {
    return `<style>${css}</style>${html}`;
  }
  return html;
}

export function clearRendererCache(): void {
  componentCache.clear();
}
```

- [ ] **Step 2: Run typecheck**

Run: `cd next-app && pnpm typecheck`
Expected: Same 4 pre-existing errors. No new errors.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/lib/blocks/renderer.ts
git commit -m "feat(blocks): inject per-section CSS in renderer"
```

---

### Task 4: Extract CSS during section generation

**Files:**
- Modify: `next-app/src/lib/blocks/design-phase.ts`

- [ ] **Step 1: Import `extractCss` and call it after validation**

In `next-app/src/lib/blocks/design-phase.ts`, add the import and extract CSS before returning the section:

```ts
import { buildDesignPrompt, type BuildDesignPromptInput } from './design-prompt';
import { callGemini } from './gemini-client';
import { validateJsx } from './validator';
import { extractCss } from './css-extractor';
import { makeSection, type Section, type SectionField } from './types';

interface Envelope { jsx: string; fields: Array<{ path: string; kind: string; value: unknown }> }

// ... parseEnvelope unchanged ...

export async function designSection(input: BuildDesignPromptInput): Promise<Section> {
  let lastError = '';
  let lastRaw = '';

  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt = await buildDesignPrompt({
      ...input,
      regenerationNote: attempt > 0 && lastError
        ? `${input.regenerationNote ?? ''}\nPrevious attempt failed validation: ${lastError}`
        : input.regenerationNote,
    });

    let raw: string;
    try {
      raw = await callGemini(prompt);
    } catch (err) {
      lastError = (err as Error).message;
      lastRaw = '';
      continue;
    }
    lastRaw = raw;

    const env = parseEnvelope(raw);
    if (!env) { lastError = 'malformed envelope'; continue; }

    const v = validateJsx(env.jsx);
    if (!v.ok) { lastError = v.error ?? 'validator rejected'; continue; }

    const css = await extractCss(env.jsx);
    return makeSection({ type: input.section.type, jsx: env.jsx, fields: env.fields as SectionField[], css });
  }

  return {
    ...makeSection({ type: input.section.type, jsx: '', fields: [] }),
    status: 'failed',
    error: lastError,
    raw_output: lastRaw,
  };
}
```

- [ ] **Step 2: Run typecheck**

Run: `cd next-app && pnpm typecheck`
Expected: Same 4 pre-existing errors. No new errors.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/lib/blocks/design-phase.ts
git commit -m "feat(blocks): extract CSS at section generation time"
```

---

### Task 5: Backfill CSS for existing drafts on preview render

**Files:**
- Modify: `next-app/src/app/api/drafts/preview/render/route.ts`

- [ ] **Step 1: Add CSS backfill logic to the render route**

The render route should detect sections that got CSS extracted on-demand (i.e., they had no `css` field) and return the updated sections in the response so the caller can persist them. Update the route:

```ts
import { renderSection } from '@/lib/blocks/renderer';
import { extractCss } from '@/lib/blocks/css-extractor';
import type { Section } from '@/lib/blocks/types';

export const runtime = 'nodejs';

function authorize(req: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return false;
  return req.headers.get('authorization') === `Bearer ${expected}`;
}

export async function POST(req: Request): Promise<Response> {
  if (!authorize(req)) {
    return new Response('unauthorized', { status: 401 });
  }

  let body: { sections?: Section[] };
  try {
    body = await req.json();
  } catch {
    return new Response('invalid json', { status: 400 });
  }

  const sections = Array.isArray(body.sections) ? body.sections : [];
  if (sections.length === 0) {
    return new Response('', { headers: { 'content-type': 'text/html; charset=utf-8' } });
  }

  // Track which sections got CSS backfilled so we can return them
  const backfilled: Array<{ id: string; css: string }> = [];

  const pieces = await Promise.all(
    sections.map(async (s) => {
      // Backfill CSS for existing sections that lack it
      if (!s.css && s.jsx && s.status !== 'failed') {
        try {
          s.css = await extractCss(s.jsx);
          backfilled.push({ id: s.id, css: s.css });
        } catch {
          // Non-fatal — section will still render, just without extracted CSS
        }
      }

      try {
        return await renderSection(s, {});
      } catch (err) {
        const msg = (err as Error).message.replace(/</g, '&lt;');
        return `<div style="padding:1rem;background:#fee;border:1px solid #fcc;color:#900;margin:1rem">Render error in ${s.type}: ${msg}</div>`;
      }
    }),
  );

  const html = pieces.join('\n');

  // Return backfilled CSS data in a header so the preview page can persist it
  const headers: Record<string, string> = {
    'content-type': 'text/html; charset=utf-8',
  };
  if (backfilled.length > 0) {
    headers['x-css-backfill'] = JSON.stringify(backfilled);
  }

  return new Response(html, { headers });
}
```

- [ ] **Step 2: Update the preview page to persist backfilled CSS**

In `next-app/src/app/preview/[token]/page.tsx`, update `fetchSectionsHtml` to read the backfill header and persist it. Replace the `fetchSectionsHtml` function:

```ts
async function fetchSectionsHtml(sections: Section[], draftId?: string): Promise<string> {
  const renderable = sections.filter((s) => s.status !== 'failed')
  const failed = sections.filter((s) => s.status === 'failed')

  let bodyHtml = ''
  if (renderable.length > 0) {
    const base = process.env.NEXT_APP_INTERNAL_URL ?? 'http://localhost:3000'
    const token = process.env.INTERNAL_API_TOKEN
    try {
      const res = await fetch(`${base}/api/drafts/preview/render`, {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'content-type': 'application/json',
          authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ sections: renderable }),
      })
      if (res.ok) {
        bodyHtml = await res.text()

        // Persist backfilled CSS to the draft so it's cached for next render
        const backfillHeader = res.headers.get('x-css-backfill')
        if (backfillHeader && draftId) {
          try {
            const backfilled = JSON.parse(backfillHeader) as Array<{ id: string; css: string }>
            const laravelBase = process.env.LARAVEL_API_URL ?? 'http://localhost:8000'
            await fetch(`${laravelBase}/api/internal/drafts/${draftId}/backfill-css`, {
              method: 'PATCH',
              headers: {
                'content-type': 'application/json',
                authorization: token ? `Bearer ${token}` : '',
              },
              body: JSON.stringify({ sections: backfilled }),
            }).catch(() => {})  // best-effort — don't block the preview
          } catch {
            // ignore parse errors
          }
        }
      } else {
        bodyHtml = `<div style="padding:1rem;background:#fee;border:1px solid #fcc;color:#900;margin:1rem">Render endpoint returned ${res.status}: ${await res.text()}</div>`
      }
    } catch (err) {
      bodyHtml = `<div style="padding:1rem;background:#fee;border:1px solid #fcc;color:#900;margin:1rem">Fetch failed: ${(err as Error).message}</div>`
    }
  }

  const failedHtml = failed
    .map(
      (s) =>
        `<div style="padding:1rem;background:#fee;border:1px solid #fcc;color:#900;margin:1rem">Section ${s.type} failed: ${s.error ?? 'unknown error'}</div>`,
    )
    .join('\n')

  return bodyHtml + '\n' + failedHtml
}
```

Also update the call site in `PreviewPage` to pass the draft ID:

```ts
const sectionsHtml = hasSections ? await fetchSectionsHtml(sections, data.draft.id) : ''
```

**Note:** The Laravel backfill endpoint (`/api/internal/drafts/{id}/backfill-css`) is a best-effort PATCH. If it's not yet implemented, the preview still works — CSS is just extracted on every render instead of being cached. The Laravel endpoint can be added as a simple controller that updates the `sections` JSON on the `LandingPageDraft` model.

- [ ] **Step 3: Run typecheck**

Run: `cd next-app && pnpm typecheck`
Expected: Same 4 pre-existing errors. No new errors.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/app/api/drafts/preview/render/route.ts next-app/src/app/preview/\[token\]/page.tsx
git commit -m "feat(blocks): backfill CSS for existing drafts on preview render"
```

---

### Task 6: Add broken image placeholder to client runtime

**Files:**
- Modify: `next-app/src/runtime/client-runtime.ts`

- [ ] **Step 1: Add image error handler**

At the end of `next-app/src/runtime/client-runtime.ts`, before the existing `DOMContentLoaded` block, add the image error handler:

```ts
// --- Broken image placeholder ---
// Catches failed <img> loads and replaces them with a styled gradient
// placeholder. Uses DOM methods only (no innerHTML for security).
function handleBrokenImages(): void {
  document.addEventListener('error', (e) => {
    const el = e.target;
    if (!(el instanceof HTMLImageElement)) return;
    if (el.dataset.placeholdered) return;
    el.dataset.placeholdered = '1';
    el.style.display = 'none';

    const placeholder = document.createElement('div');
    placeholder.style.cssText =
      'width:100%;aspect-ratio:16/9;border-radius:0.75rem;' +
      'background:linear-gradient(135deg,#e2e8f0 0%,#f1f5f9 100%);' +
      'display:flex;align-items:center;justify-content:center;';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '48');
    svg.setAttribute('height', '48');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', '#94a3b8');
    svg.setAttribute('stroke-width', '1.5');

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '3');
    rect.setAttribute('y', '3');
    rect.setAttribute('width', '18');
    rect.setAttribute('height', '18');
    rect.setAttribute('rx', '2');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '8.5');
    circle.setAttribute('cy', '8.5');
    circle.setAttribute('r', '1.5');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'm21 15-5-5L5 21');

    svg.appendChild(rect);
    svg.appendChild(circle);
    svg.appendChild(path);
    placeholder.appendChild(svg);

    el.parentNode?.insertBefore(placeholder, el.nextSibling);
  }, true);  // capture phase to catch before bubbling
}
```

Then update the initialization block at the bottom of the file:

```ts
if (typeof document !== 'undefined' && document.readyState !== 'loading') {
  handleBrokenImages();
  hydrateAll();
} else if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    handleBrokenImages();
    hydrateAll();
  });
}
```

- [ ] **Step 2: Rebuild the client runtime bundle**

Run: `cd next-app && pnpm build:runtime`
Expected: `dist/client-runtime.js` is rebuilt without errors.

- [ ] **Step 3: Commit**

```bash
git add next-app/src/runtime/client-runtime.ts next-app/dist/client-runtime.js
git commit -m "feat(runtime): add broken image placeholder handler"
```

---

### Task 7: Manual verification — preview the existing draft

**Files:** None (verification only)

- [ ] **Step 1: Start the dev server if not running**

Run: `cd next-app && pnpm dev` (in a separate terminal)

- [ ] **Step 2: Start the Laravel server if not running**

Run: `php artisan serve` (in a separate terminal)

- [ ] **Step 3: Open the preview in a browser**

Navigate to: `http://localhost:3000/preview/ps5FwrL83HeqM6OHmlXGkf2XgwMiVP3kvduuJ1Qf`

Expected:
- Sections render with purple (#8750F1) and lavender (#EAE4F5) background colors
- Text renders in dark (#202020) and gray (#5A5A5A) colors
- Typography shows Poppins font where specified
- Stat cards have white backgrounds with ring borders (#E0D9EE)
- Buttons show gold (#FFC107) or purple (#8750F1) backgrounds
- Broken images show gray gradient placeholders instead of alt text
- No red "Render error" banners

- [ ] **Step 4: Take a screenshot for comparison**

Run:
```bash
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:3000/preview/ps5FwrL83HeqM6OHmlXGkf2XgwMiVP3kvduuJ1Qf', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/preview-with-css.png', fullPage: true });
  console.log('Screenshot saved to /tmp/preview-with-css.png');
  await browser.close();
})();
"
```

- [ ] **Step 5: Commit the full feature**

If everything looks correct, create a final commit:

```bash
git add -A
git commit -m "feat(landing-pages): runtime CSS extraction for Gemini-generated sections

Extracts Tailwind CSS at section generation time via @tailwindcss/node
compile API. Injects per-section <style> tags during rendering. Existing
drafts get CSS extracted on-demand on first preview. Broken images show
gradient placeholders instead of alt text."
```
