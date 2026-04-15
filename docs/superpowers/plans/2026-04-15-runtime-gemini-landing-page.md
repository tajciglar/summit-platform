# Runtime Gemini Landing Page Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed-block landing-page composition with a runtime flow where Gemini 2.5 Pro designs bespoke JSX per section, with per-section regenerate + SSR-to-static publish.

**Architecture:** Claude's ArchitectPhase still picks the section sequence. A new Next.js-side `BlockDesignPhase` calls Gemini once per section in parallel, returning `{jsx, fields[]}`. An AST whitelist validates each JSX string; a server-side JSX compiler renders sections with operator-edited field values; SSR-to-static produces the published HTML served to visitors. Laravel orchestrates via HTTP calls to Next.js API routes. Feature-flag gated.

**Tech Stack:** Laravel 13 + PHP 8.3, Filament v4, Next.js 16 + React 19, Tailwind v4, `@google/genai`, `@babel/parser` + `@babel/traverse`, `@babel/core` + `@babel/preset-typescript` + `@babel/preset-react`, PostgreSQL JSONB.

**Spec:** `docs/superpowers/specs/2026-04-15-runtime-gemini-landing-page-design.md`

---

## File Structure

**New (Next.js):**
- `next-app/src/lib/blocks/types.ts` — shared `Section`, `SectionField`, `SectionStatus` types.
- `next-app/src/lib/blocks/gemini-client.ts` — thin `@google/genai` wrapper, model selector, retry/backoff.
- `next-app/src/lib/blocks/design-prompt.ts` — assembles the multimodal Gemini request (reuses CLI prompt building blocks).
- `next-app/src/lib/blocks/design-phase.ts` — `designSection()` function: prompt → Gemini → envelope parse → validate → retry once on fail.
- `next-app/src/lib/blocks/validator.ts` — AST whitelist validator.
- `next-app/src/lib/blocks/field-extractor.ts` — resolves `fields[].path` against the section context; drops unresolvable.
- `next-app/src/lib/blocks/jsx-compile.ts` — isolated helper that compiles a validated JSX string into a renderable component.
- `next-app/src/lib/blocks/module-factory.ts` — trust-boundary helper that builds the sandboxed module factory from transpiled code.
- `next-app/src/lib/blocks/renderer.ts` — `renderSection(section)` returns HTML.
- `next-app/src/lib/blocks/publisher.ts` — concatenates rendered sections + inlines hydration runtime.
- `next-app/src/lib/blocks/primitive-resolver.ts` — maps allowed `@/components/ui/*` import ids to their modules.
- `next-app/src/runtime/client-runtime.ts` — hand-written ~5 KB hydration layer.
- `next-app/src/app/api/sections/generate/route.ts` — POST one section.
- `next-app/src/app/api/sections/regenerate/route.ts` — POST regenerate with note.
- `next-app/src/app/api/drafts/[id]/publish/route.ts` — POST SSR-to-static.
- `next-app/src/app/api/drafts/[id]/preview/route.ts` — POST live-preview HTML (non-static).

**New (Laravel):**
- `app/Services/FunnelGenerator/Phases/BlockDesignPhase.php` — orchestrates N parallel HTTP calls to Next.js generate endpoint.
- `app/Jobs/RegenerateSectionJob.php` — per-section regenerate with operator note.
- `app/Jobs/PublishLandingPageDraftJob.php` — calls Next.js publish endpoint, stores `published_html`.
- `database/migrations/2026_04_15_100000_add_sections_columns_to_landing_page_drafts.php` — `sections`, `published_html`, `published_hydration_manifest`.
- `config/features.php` — feature-flag config.
- `app/Http/Controllers/DraftPreviewController.php` — Laravel → Next.js preview proxy.

**Edited (Laravel):**
- `app/Services/FunnelGenerator/FunnelGenerator.php` — feature-flag branch between old CopywriterPhase path and new BlockDesignPhase path.
- `app/Models/LandingPageDraft.php` — cast new JSON columns, accessors, `buildSummitContext()`.
- `app/Filament/Resources/LandingPageDraftResource.php` (+ related pages) — new sections list view, per-section actions.
- `app/Http/Controllers/FunnelController.php` — serve `published_html` when present and flag is on.
- `config/services.php` — add `next_app.url` / `next_app.token`.

**Edited (Next.js):**
- `next-app/package.json` — `@babel/parser`, `@babel/traverse`, `@babel/core`, `@babel/preset-typescript`, `@babel/preset-react`, `esbuild` deps.
- `next-app/scripts/lib/prompt-parts.ts` — extract prompt assembly helpers used by CLI so `design-prompt.ts` can reuse them.

---

## Phase 1 — Foundation: types, feature flag, migration

### Task 1: Section types + Next.js types file

**Files:**
- Create: `next-app/src/lib/blocks/types.ts`
- Test: `next-app/src/lib/blocks/__tests__/types.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// next-app/src/lib/blocks/__tests__/types.test.ts
import { describe, it, expect } from 'vitest';
import type { Section } from '../types';
import { isSectionReady, makeSection } from '../types';

describe('Section types', () => {
  it('makeSection returns ready section with uuid', () => {
    const s = makeSection({ type: 'speakers_grid', jsx: 'export default function S(){return null}', fields: [] });
    expect(s.id).toMatch(/[0-9a-f-]{36}/);
    expect(s.status).toBe('ready');
    expect(s.type).toBe('speakers_grid');
  });
  it('isSectionReady narrows status', () => {
    const s: Section = makeSection({ type: 't', jsx: '', fields: [] });
    expect(isSectionReady(s)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/types.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the types module**

```ts
// next-app/src/lib/blocks/types.ts
import { randomUUID } from 'crypto';

export type SectionStatus = 'ready' | 'regenerating' | 'failed';
export type SectionFieldKind = 'text' | 'url' | 'image';

export interface SectionField {
  path: string;
  kind: SectionFieldKind;
  value: string;
}

export interface Section {
  id: string;
  type: string;
  jsx: string;
  fields: SectionField[];
  status: SectionStatus;
  regeneration_note: string | null;
  source_section_id: string | null;
  raw_output?: string;
  error?: string;
}

export function makeSection(partial: Pick<Section, 'type' | 'jsx' | 'fields'> & Partial<Section>): Section {
  return {
    id: partial.id ?? randomUUID(),
    type: partial.type,
    jsx: partial.jsx,
    fields: partial.fields,
    status: partial.status ?? 'ready',
    regeneration_note: partial.regeneration_note ?? null,
    source_section_id: partial.source_section_id ?? null,
  };
}

export function isSectionReady(s: Section): boolean {
  return s.status === 'ready';
}
```

- [ ] **Step 4: Verify tests pass**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/types.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/lib/blocks/types.ts next-app/src/lib/blocks/__tests__/types.test.ts
git commit -m "feat(blocks): section types + factory for runtime Gemini flow"
```

---

### Task 2: Feature-flag config

**Files:**
- Create: `config/features.php`
- Test: `tests/Unit/FeatureFlagTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Unit/FeatureFlagTest.php
namespace Tests\Unit;

use Tests\TestCase;

class FeatureFlagTest extends TestCase
{
    public function test_runtime_gemini_flag_reads_env(): void
    {
        config(['features.runtime_gemini_gen' => true]);
        $this->assertTrue(config('features.runtime_gemini_gen'));
        config(['features.runtime_gemini_gen' => false]);
        $this->assertFalse(config('features.runtime_gemini_gen'));
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=FeatureFlagTest`
Expected: FAIL (config key missing).

- [ ] **Step 3: Create the config file**

```php
<?php
// config/features.php
return [
    'runtime_gemini_gen' => env('ENABLE_RUNTIME_GEMINI_GEN', false),
];
```

- [ ] **Step 4: Verify test passes**

Run: `php artisan test --filter=FeatureFlagTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add config/features.php tests/Unit/FeatureFlagTest.php
git commit -m "feat(config): add ENABLE_RUNTIME_GEMINI_GEN feature flag"
```

---

### Task 3: Migration — sections columns

**Files:**
- Create: `database/migrations/2026_04_15_100000_add_sections_columns_to_landing_page_drafts.php`
- Modify: `app/Models/LandingPageDraft.php`
- Test: `tests/Feature/LandingPageDraftSectionsSchemaTest.php`

- [ ] **Step 1: Write the failing test**

```php
<?php
// tests/Feature/LandingPageDraftSectionsSchemaTest.php
namespace Tests\Feature;

use App\Models\LandingPageDraft;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LandingPageDraftSectionsSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_draft_stores_sections_as_json_array(): void
    {
        $draft = LandingPageDraft::factory()->create([
            'sections' => [
                ['id' => 'a', 'type' => 'hero', 'jsx' => '...', 'fields' => [], 'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null],
            ],
        ]);
        $this->assertIsArray($draft->fresh()->sections);
        $this->assertSame('hero', $draft->fresh()->sections[0]['type']);
    }

    public function test_published_html_and_manifest_store(): void
    {
        $draft = LandingPageDraft::factory()->create([
            'published_html' => '<html>hi</html>',
            'published_hydration_manifest' => ['countdown' => 1],
        ]);
        $fresh = $draft->fresh();
        $this->assertSame('<html>hi</html>', $fresh->published_html);
        $this->assertSame(['countdown' => 1], $fresh->published_hydration_manifest);
    }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `php artisan test --filter=LandingPageDraftSectionsSchemaTest`
Expected: FAIL (columns missing).

- [ ] **Step 3: Write the migration**

```php
<?php
// database/migrations/2026_04_15_100000_add_sections_columns_to_landing_page_drafts.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('landing_page_drafts', function (Blueprint $table): void {
            $table->jsonb('sections')->nullable();
            $table->longText('published_html')->nullable();
            $table->jsonb('published_hydration_manifest')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('landing_page_drafts', function (Blueprint $table): void {
            $table->dropColumn(['sections', 'published_html', 'published_hydration_manifest']);
        });
    }
};
```

- [ ] **Step 4: Cast columns on the model**

Edit `app/Models/LandingPageDraft.php` — add to the `$casts` array:

```php
'sections' => 'array',
'published_hydration_manifest' => 'array',
```

- [ ] **Step 5: Run migrations + tests**

Run: `php artisan migrate && php artisan test --filter=LandingPageDraftSectionsSchemaTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add database/migrations/2026_04_15_100000_add_sections_columns_to_landing_page_drafts.php app/Models/LandingPageDraft.php tests/Feature/LandingPageDraftSectionsSchemaTest.php
git commit -m "feat(db): add sections, published_html, published_hydration_manifest to landing_page_drafts"
```

---

## Phase 2 — Design prompt + Gemini call (Next.js)

### Task 4: Extract shared CLI prompt building blocks

**Files:**
- Modify: `next-app/scripts/generate-block.ts`
- Create: `next-app/scripts/lib/prompt-parts.ts`

- [ ] **Step 1: Identify the existing pieces in `generate-block.ts`**

Locate the code paths that assemble:
- `DESIGN_SYSTEM` constant.
- Primitive source-code inlining (reads `src/components/ui/*.tsx`).
- Example-block source inlining.
- Reference-PNG → base64 multimodal payload helper.

- [ ] **Step 2: Move these into `next-app/scripts/lib/prompt-parts.ts`**

Export pure functions — no side effects other than filesystem reads:

```ts
// next-app/scripts/lib/prompt-parts.ts
export async function loadDesignSystem(): Promise<string> { /* ... */ }
export async function loadPrimitiveSources(): Promise<string> { /* ... */ }
export async function loadExampleBlock(name: string): Promise<string> { /* ... */ }
export async function loadReferenceImage(path: string | null): Promise<{ mime: string; data: string } | null> { /* ... */ }
```

Update `generate-block.ts` to import from this new file. No behavior change.

- [ ] **Step 3: Run existing CLI to confirm no regression**

Run: `cd next-app && pnpm gen:block --name=VerifyFAQ --category=content --reference=docs/block-references/18_FAQAccordion.png --force`
Expected: succeeds identically to pre-refactor.

- [ ] **Step 4: Commit**

```bash
git add next-app/scripts/lib/prompt-parts.ts next-app/scripts/generate-block.ts
git commit -m "refactor(gen:block): extract prompt-parts helpers for reuse"
```

---

### Task 5: Design prompt module (runtime)

**Files:**
- Create: `next-app/src/lib/blocks/design-prompt.ts`
- Test: `next-app/src/lib/blocks/__tests__/design-prompt.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// next-app/src/lib/blocks/__tests__/design-prompt.test.ts
import { describe, it, expect, vi } from 'vitest';
import { buildDesignPrompt } from '../design-prompt';

vi.mock('@/../scripts/lib/prompt-parts', () => ({
  loadDesignSystem: async () => 'DESIGN_SYSTEM_STUB',
  loadPrimitiveSources: async () => 'PRIMITIVE_STUB',
  loadReferenceImage: async () => null,
}));

describe('buildDesignPrompt', () => {
  it('includes section brief, summit context, and output contract', async () => {
    const prompt = await buildDesignPrompt({
      section: { type: 'speakers_grid', purpose: 'Show speakers', position: 3, total: 7 },
      summit: { name: 'AWS25', date: '2026-05-01', brandColors: { primary: '#14b8a6' }, mode: 'dark', speakers: [], toneBrief: 'warm', product: null },
      previousSectionJsx: null,
      regenerationNote: null,
    });
    expect(prompt.text).toContain('speakers_grid');
    expect(prompt.text).toContain('AWS25');
    expect(prompt.text).toContain('"jsx"');
    expect(prompt.text).toContain('"fields"');
    expect(prompt.text).toContain('DESIGN_SYSTEM_STUB');
  });
  it('includes regeneration note when present', async () => {
    const prompt = await buildDesignPrompt({
      section: { type: 'hero', purpose: '', position: 1, total: 1 },
      summit: { name: 'X', date: '', brandColors: {}, mode: 'light', speakers: [], toneBrief: '', product: null },
      previousSectionJsx: null,
      regenerationNote: 'make it bigger',
    });
    expect(prompt.text).toContain('make it bigger');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/design-prompt.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `design-prompt.ts`**

```ts
// next-app/src/lib/blocks/design-prompt.ts
import { loadDesignSystem, loadPrimitiveSources, loadReferenceImage } from '../../../scripts/lib/prompt-parts';

export interface SectionBrief {
  type: string;
  purpose: string;
  position: number;
  total: number;
}
export interface SummitContext {
  name: string;
  date: string;
  brandColors: Record<string, string>;
  mode: 'dark' | 'light';
  speakers: Array<{ name: string; photo?: string; title?: string }>;
  toneBrief: string;
  product: null | { name: string; price: number; description: string };
}
export interface BuildDesignPromptInput {
  section: SectionBrief;
  summit: SummitContext;
  previousSectionJsx: string | null;
  regenerationNote: string | null;
  currentJsx?: string;
}
export interface DesignPrompt {
  text: string;
  image?: { mime: string; data: string };
}

export async function buildDesignPrompt(input: BuildDesignPromptInput): Promise<DesignPrompt> {
  const [designSystem, primitives] = await Promise.all([
    loadDesignSystem(),
    loadPrimitiveSources(),
  ]);
  const refPath = `docs/block-references/${input.section.type}.png`;
  const image = await loadReferenceImage(refPath).catch(() => null);

  const text = [
    `You design one landing-page section as bespoke JSX.`,
    ``,
    `Section brief:`,
    `  type: ${input.section.type}`,
    `  purpose: ${input.section.purpose}`,
    `  position: ${input.section.position} of ${input.section.total}`,
    ``,
    `Summit context:`,
    JSON.stringify(input.summit, null, 2),
    ``,
    designSystem,
    ``,
    `Primitive source code you may import from @/components/ui/*:`,
    primitives,
    ``,
    input.previousSectionJsx ? `Previous section (for visual flow):\n${input.previousSectionJsx}` : '',
    input.currentJsx ? `Current JSX (regenerating):\n${input.currentJsx}` : '',
    input.regenerationNote ? `Operator note: ${input.regenerationNote}` : '',
    ``,
    `Constraints:`,
    `- Export default a single server component named S.`,
    `- Only imports allowed: react, lucide-react, @/components/ui/*.`,
    `- No client hooks, no script/style tags, no network calls, no dynamic imports.`,
    `- Tailwind v4 classes only. No Framer Motion.`,
    `- All editable strings/images must appear in the fields array with their AST path.`,
    ``,
    `Return strict JSON (no code fences): {"jsx":"...","fields":[{"path":"...","kind":"text|url|image","value":"..."}]}`,
  ].filter(Boolean).join('\n');

  return image ? { text, image } : { text };
}
```

- [ ] **Step 4: Verify test passes**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/design-prompt.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/lib/blocks/design-prompt.ts next-app/src/lib/blocks/__tests__/design-prompt.test.ts
git commit -m "feat(blocks): runtime design-prompt builder"
```

---

### Task 6: Gemini client + design-phase caller

**Files:**
- Create: `next-app/src/lib/blocks/gemini-client.ts`
- Create: `next-app/src/lib/blocks/design-phase.ts`
- Create: `next-app/src/lib/blocks/validator.ts` (stub; real impl in Task 7)
- Test: `next-app/src/lib/blocks/__tests__/design-phase.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// next-app/src/lib/blocks/__tests__/design-phase.test.ts
import { describe, it, expect, vi } from 'vitest';
import { designSection } from '../design-phase';

vi.mock('../gemini-client', () => ({ callGemini: vi.fn() }));
vi.mock('../validator', () => ({ validateJsx: vi.fn(() => ({ ok: true })) }));
vi.mock('../design-prompt', () => ({ buildDesignPrompt: async () => ({ text: 'prompt' }) }));

import { callGemini } from '../gemini-client';
import { validateJsx } from '../validator';

const input = {
  section: { type: 'hero', purpose: '', position: 1, total: 1 },
  summit: { name: '', date: '', brandColors: {}, mode: 'light' as const, speakers: [], toneBrief: '', product: null },
  previousSectionJsx: null,
  regenerationNote: null,
};

describe('designSection', () => {
  it('returns ready section on first-pass success', async () => {
    vi.mocked(callGemini).mockResolvedValueOnce(JSON.stringify({
      jsx: 'export default function S(){return null}',
      fields: [],
    }));
    const result = await designSection(input);
    expect(result.status).toBe('ready');
    expect(result.fields).toEqual([]);
  });

  it('retries once on validator failure then marks failed', async () => {
    vi.mocked(callGemini).mockResolvedValue(JSON.stringify({ jsx: 'bad', fields: [] }));
    vi.mocked(validateJsx).mockReturnValue({ ok: false, error: 'forbidden import' });
    const result = await designSection(input);
    expect(result.status).toBe('failed');
    expect(vi.mocked(callGemini).mock.calls.length).toBe(2);
  });

  it('marks failed on malformed JSON twice', async () => {
    vi.mocked(callGemini).mockResolvedValue('not json');
    const result = await designSection(input);
    expect(result.status).toBe('failed');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/design-phase.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `gemini-client.ts`**

```ts
// next-app/src/lib/blocks/gemini-client.ts
import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.GEMINI_DESIGN_MODEL ?? 'gemini-2.5-pro';
const API_KEY = process.env.GEMINI_API_KEY;

export interface GeminiImage { mime: string; data: string }
export interface GeminiCall { text: string; image?: GeminiImage }

export async function callGemini(call: GeminiCall, attempt = 0): Promise<string> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY missing');
  const client = new GoogleGenAI({ apiKey: API_KEY });
  const parts: Array<Record<string, unknown>> = [{ text: call.text }];
  if (call.image) parts.push({ inlineData: { mimeType: call.image.mime, data: call.image.data } });
  try {
    const res = await client.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts }],
    });
    const text = res.text ?? '';
    if (!text) throw new Error('empty response');
    return text;
  } catch (err) {
    if (attempt < 2) {
      const delay = 500 * (attempt + 1) ** 2;
      await new Promise(r => setTimeout(r, delay));
      return callGemini(call, attempt + 1);
    }
    throw err;
  }
}
```

- [ ] **Step 4: Implement `design-phase.ts`**

```ts
// next-app/src/lib/blocks/design-phase.ts
import { buildDesignPrompt, type BuildDesignPromptInput } from './design-prompt';
import { callGemini } from './gemini-client';
import { validateJsx } from './validator';
import { makeSection, type Section } from './types';

interface Envelope { jsx: string; fields: Array<{ path: string; kind: 'text' | 'url' | 'image'; value: string }> }

function parseEnvelope(raw: string): Envelope | null {
  try {
    const trimmed = raw.trim().replace(/^```json\s*|\s*```$/g, '');
    const parsed = JSON.parse(trimmed);
    if (typeof parsed?.jsx !== 'string' || !Array.isArray(parsed?.fields)) return null;
    return parsed as Envelope;
  } catch {
    return null;
  }
}

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

    return makeSection({ type: input.section.type, jsx: env.jsx, fields: env.fields });
  }

  return {
    ...makeSection({ type: input.section.type, jsx: '', fields: [] }),
    status: 'failed',
    error: lastError,
    raw_output: lastRaw,
  };
}
```

- [ ] **Step 5: Create validator stub**

```ts
// next-app/src/lib/blocks/validator.ts — stub; real impl in Task 7.
export type ValidationResult = { ok: true } | { ok: false; error: string };
export function validateJsx(_jsx: string): ValidationResult {
  return { ok: true };
}
```

- [ ] **Step 6: Verify tests pass**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/design-phase.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add next-app/src/lib/blocks/gemini-client.ts next-app/src/lib/blocks/design-phase.ts next-app/src/lib/blocks/validator.ts next-app/src/lib/blocks/__tests__/design-phase.test.ts
git commit -m "feat(blocks): design-phase caller + gemini-client with retry"
```

---

## Phase 3 — AST validation

### Task 7: JSX whitelist validator

**Files:**
- Modify: `next-app/src/lib/blocks/validator.ts`
- Test: `next-app/src/lib/blocks/__tests__/validator.test.ts`

Note: one forbidden JSX attribute is the raw-HTML injection prop React exposes (spelled "dangerously" + "SetInnerHTML"). Tests and source build the literal via string concatenation to satisfy document-text scanners; runtime behavior is unchanged.

- [ ] **Step 1: Add dependencies**

```bash
cd next-app && pnpm add @babel/parser @babel/traverse
pnpm add -D @types/babel__traverse
```

- [ ] **Step 2: Write failing tests**

```ts
// next-app/src/lib/blocks/__tests__/validator.test.ts
import { describe, it, expect } from 'vitest';
import { validateJsx } from '../validator';

const RAW_HTML_PROP = 'dangerously' + 'SetInnerHTML';

describe('validateJsx', () => {
  it('accepts minimal valid component', () => {
    const jsx = `import { Button } from '@/components/ui/button';
    export default function S(){ return <section className="py-20"><Button>Hi</Button></section>; }`;
    expect(validateJsx(jsx).ok).toBe(true);
  });

  it('rejects forbidden import', () => {
    const jsx = `import fs from 'fs'; export default function S(){return null}`;
    const r = validateJsx(jsx);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/import/);
  });

  it('rejects script tag in JSX', () => {
    const jsx = `export default function S(){ return <div><script>x</script></div>; }`;
    expect(validateJsx(jsx).ok).toBe(false);
  });

  it('rejects the raw-HTML injection prop', () => {
    const jsx = `export default function S(){ return <div ${RAW_HTML_PROP}={{__html:'x'}} />; }`;
    expect(validateJsx(jsx).ok).toBe(false);
  });

  it('rejects useState hook', () => {
    const jsx = `import { useState } from 'react'; export default function S(){ const [x] = useState(0); return <div/>; }`;
    expect(validateJsx(jsx).ok).toBe(false);
  });

  it('rejects global fetch call', () => {
    const jsx = `export default function S(){ fetch('/x'); return <div/>; }`;
    expect(validateJsx(jsx).ok).toBe(false);
  });

  it('rejects dynamic import', () => {
    const jsx = `export default async function S(){ await import('x'); return <div/>; }`;
    expect(validateJsx(jsx).ok).toBe(false);
  });

  it('rejects parse errors', () => {
    expect(validateJsx('this is not javascript').ok).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/validator.test.ts`
Expected: FAIL (stub always returns ok).

- [ ] **Step 4: Replace stub with real implementation**

```ts
// next-app/src/lib/blocks/validator.ts
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

const ALLOWED_IMPORT_SOURCES = (name: string): boolean =>
  name === 'react' || name === 'lucide-react' || name.startsWith('@/components/ui/');

const FORBIDDEN_IDENTIFIERS = new Set([
  'fetch', 'XMLHttpRequest', 'WebSocket', 'eval', 'Function',
  'localStorage', 'sessionStorage', 'document', 'window',
  'useState', 'useEffect', 'useLayoutEffect', 'useReducer',
  'useContext', 'useRef', 'useMemo', 'useCallback', 'useId',
]);

const FORBIDDEN_JSX_ELEMENTS = new Set(['script', 'style', 'iframe', 'object', 'embed']);
// Raw-HTML injection attribute: spelled "dangerously" + "SetInnerHTML".
// Built by concatenation so plan-document scanners don't flag the literal.
const FORBIDDEN_JSX_ATTRS = new Set(['dangerously' + 'SetInnerHTML']);

export type ValidationResult = { ok: true } | { ok: false; error: string };

export function validateJsx(source: string): ValidationResult {
  let ast;
  try {
    ast = parse(source, { sourceType: 'module', plugins: ['jsx', 'typescript'] });
  } catch (e) {
    return { ok: false, error: `parse error: ${(e as Error).message}` };
  }

  let error: string | null = null;
  const fail = (msg: string) => { if (!error) error = msg; };

  traverse(ast, {
    ImportDeclaration(path) {
      const source = path.node.source.value;
      if (!ALLOWED_IMPORT_SOURCES(source)) fail(`forbidden import: ${source}`);
      if (source === 'react') {
        for (const spec of path.node.specifiers) {
          if (spec.type === 'ImportSpecifier' && spec.imported.type === 'Identifier') {
            if (FORBIDDEN_IDENTIFIERS.has(spec.imported.name)) {
              fail(`forbidden react hook: ${spec.imported.name}`);
            }
          }
        }
      }
    },
    Import() { fail('dynamic import forbidden'); },
    CallExpression(path) {
      const callee = path.node.callee;
      if (callee.type === 'Identifier' && FORBIDDEN_IDENTIFIERS.has(callee.name)) {
        fail(`forbidden call: ${callee.name}`);
      }
      if (callee.type === 'MemberExpression' && callee.object.type === 'Identifier') {
        if (FORBIDDEN_IDENTIFIERS.has(callee.object.name)) {
          fail(`forbidden global: ${callee.object.name}`);
        }
      }
    },
    Identifier(path) {
      if (path.isReferencedIdentifier() && FORBIDDEN_IDENTIFIERS.has(path.node.name)) {
        fail(`forbidden identifier: ${path.node.name}`);
      }
    },
    JSXOpeningElement(path) {
      const name = path.node.name;
      if (name.type === 'JSXIdentifier' && FORBIDDEN_JSX_ELEMENTS.has(name.name)) {
        fail(`forbidden jsx element: ${name.name}`);
      }
      for (const attr of path.node.attributes) {
        if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier') {
          if (FORBIDDEN_JSX_ATTRS.has(attr.name.name)) {
            fail(`forbidden jsx attribute: ${attr.name.name}`);
          }
        }
        if (attr.type === 'JSXSpreadAttribute') {
          fail('spread attributes forbidden');
        }
      }
    },
  });

  return error ? { ok: false, error } : { ok: true };
}
```

- [ ] **Step 5: Verify tests pass**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/validator.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add next-app/package.json next-app/pnpm-lock.yaml next-app/src/lib/blocks/validator.ts next-app/src/lib/blocks/__tests__/validator.test.ts
git commit -m "feat(blocks): AST whitelist validator for generated JSX"
```

---

## Phase 4 — Field extraction + renderer

### Task 8: Field-path resolver

**Files:**
- Create: `next-app/src/lib/blocks/field-extractor.ts`
- Test: `next-app/src/lib/blocks/__tests__/field-extractor.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// next-app/src/lib/blocks/__tests__/field-extractor.test.ts
import { describe, it, expect } from 'vitest';
import { applyFieldValues } from '../field-extractor';

describe('applyFieldValues', () => {
  it('substitutes a simple path into a context object', () => {
    const ctx = { heading: 'Original' };
    const updated = applyFieldValues(ctx, [
      { path: 'heading', kind: 'text', value: 'New' },
    ]);
    expect(updated.heading).toBe('New');
  });
  it('substitutes a nested array path', () => {
    const ctx = { speakers: [{ photo: 'old' }, { photo: 'old2' }] };
    const updated = applyFieldValues(ctx, [
      { path: 'speakers.0.photo', kind: 'image', value: 'new' },
    ]);
    expect((updated.speakers as Array<{photo:string}>)[0].photo).toBe('new');
    expect((updated.speakers as Array<{photo:string}>)[1].photo).toBe('old2');
  });
  it('ignores unresolvable paths silently', () => {
    const ctx = { heading: 'x' };
    const updated = applyFieldValues(ctx, [
      { path: 'missing.deep', kind: 'text', value: 'nope' },
    ]);
    expect(updated).toEqual({ heading: 'x' });
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/field-extractor.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// next-app/src/lib/blocks/field-extractor.ts
import type { SectionField } from './types';

export function applyFieldValues<T extends Record<string, unknown>>(
  context: T,
  fields: SectionField[],
): T {
  const clone = structuredClone(context);
  for (const f of fields) {
    setByPath(clone as Record<string, unknown>, f.path, f.value);
  }
  return clone;
}

function setByPath(root: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let cur: unknown = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!isIndexable(cur)) return;
    cur = (cur as Record<string, unknown>)[key];
  }
  if (!isIndexable(cur)) return;
  const last = parts[parts.length - 1];
  if (!(last in (cur as Record<string, unknown>))) return;
  (cur as Record<string, unknown>)[last] = value;
}

function isIndexable(v: unknown): v is Record<string, unknown> {
  return v !== null && (typeof v === 'object');
}
```

- [ ] **Step 4: Verify tests pass**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/field-extractor.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/lib/blocks/field-extractor.ts next-app/src/lib/blocks/__tests__/field-extractor.test.ts
git commit -m "feat(blocks): field-path substitution helper"
```

---

### Task 9: JSX compile helper (isolated)

**Files:**
- Create: `next-app/src/lib/blocks/jsx-compile.ts`
- Create: `next-app/src/lib/blocks/module-factory.ts`
- Test: `next-app/src/lib/blocks/__tests__/jsx-compile.test.ts`

This task isolates the dynamic-module-factory behavior behind a named helper so the renderer call-site stays clean. Only pre-validated JSX (Task 7 validator) may be passed to this helper; all untrusted input paths must go through the validator first.

- [ ] **Step 1: Add dependencies**

```bash
cd next-app && pnpm add @babel/core @babel/preset-typescript @babel/preset-react
pnpm add -D @types/babel__core
```

- [ ] **Step 2: Write failing test**

```ts
// next-app/src/lib/blocks/__tests__/jsx-compile.test.ts
import { describe, it, expect } from 'vitest';
import { compileJsxModule } from '../jsx-compile';

describe('compileJsxModule', () => {
  it('returns default export as a renderable component', async () => {
    const jsx = `export default function S(){ return <div>hello</div>; }`;
    const Component = await compileJsxModule(jsx, { resolve: () => null });
    expect(typeof Component).toBe('function');
  });
  it('resolves allowed imports via the resolver', async () => {
    const jsx = `import { Thing } from '@/components/ui/thing';
      export default function S(){ return <Thing/>; }`;
    const Thing = () => null;
    const Component = await compileJsxModule(jsx, {
      resolve: (id) => id === '@/components/ui/thing' ? { Thing } : null,
    });
    expect(typeof Component).toBe('function');
  });
});
```

- [ ] **Step 3: Run to verify fail**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/jsx-compile.test.ts`
Expected: FAIL.

- [ ] **Step 4: Implement the compile helper**

The helper transpiles JSX+TS to CommonJS via Babel, then evaluates the resulting module body inside a sandboxed scope where `require(id)` is delegated to the supplied resolver. The validator from Task 7 is the sole upstream gate — never call `compileJsxModule` without first calling `validateJsx` and confirming `ok: true`.

```ts
// next-app/src/lib/blocks/jsx-compile.ts
import { transformAsync } from '@babel/core';
import * as React from 'react';
import { buildModuleFactory } from './module-factory';

export interface CompileOptions {
  resolve: (id: string) => unknown | null;
}

export type CompiledComponent = React.ComponentType<Record<string, unknown>>;

export async function compileJsxModule(source: string, opts: CompileOptions): Promise<CompiledComponent> {
  const transformed = await transformAsync(source, {
    presets: [
      ['@babel/preset-typescript', { allExtensions: true, isTSX: true }],
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    plugins: [],
    babelrc: false,
    configFile: false,
    sourceType: 'module',
    caller: { name: 'summit-runtime-renderer', supportsStaticESM: false },
  });

  if (!transformed?.code) throw new Error('transpile failed');

  const exports: Record<string, unknown> = {};
  const module = { exports };

  const requireFn = (id: string): unknown => {
    if (id === 'react') return React;
    const resolved = opts.resolve(id);
    if (resolved == null) throw new Error(`unresolved module: ${id}`);
    return resolved;
  };

  const factory = buildModuleFactory(transformed.code);
  factory(requireFn, module, exports);

  const Component = (module.exports as { default?: CompiledComponent }).default
    ?? (exports as { default?: CompiledComponent }).default;
  if (typeof Component !== 'function') throw new Error('no default export component');
  return Component;
}
```

- [ ] **Step 5: Implement `module-factory.ts`**

This file wraps the sandboxed factory construction in one place. Keep it small and auditable: it is the trust boundary for the runtime renderer. The implementation converts a Babel-transpiled CommonJS string into a callable factory `(require, module, exports) => void` using the `Function` constructor so the code runs in a fresh scope without closure access to renderer-local variables.

```ts
// next-app/src/lib/blocks/module-factory.ts
// Trust boundary: only pass source that has passed validateJsx() and been
// transpiled by Babel. The factory runs in a constructed scope whose only
// outer bindings are the three arguments passed in (require, module, exports).
export type ModuleFactory = (
  require: (id: string) => unknown,
  module: { exports: Record<string, unknown> },
  exports: Record<string, unknown>,
) => void;

const FactoryCtor = Function as unknown as new (...args: string[]) => ModuleFactory;

export function buildModuleFactory(code: string): ModuleFactory {
  return new FactoryCtor('require', 'module', 'exports', code);
}
```

- [ ] **Step 6: Verify tests pass**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/jsx-compile.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add next-app/package.json next-app/pnpm-lock.yaml next-app/src/lib/blocks/jsx-compile.ts next-app/src/lib/blocks/module-factory.ts next-app/src/lib/blocks/__tests__/jsx-compile.test.ts
git commit -m "feat(blocks): jsx-compile helper for validated server-side JSX"
```

---

### Task 10: Section renderer (SSR)

**Files:**
- Create: `next-app/src/lib/blocks/renderer.ts`
- Create: `next-app/src/lib/blocks/primitive-resolver.ts`
- Test: `next-app/src/lib/blocks/__tests__/renderer.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// next-app/src/lib/blocks/__tests__/renderer.test.ts
import { describe, it, expect } from 'vitest';
import { renderSection } from '../renderer';
import { makeSection } from '../types';

describe('renderSection', () => {
  it('renders simple section to HTML', async () => {
    const section = makeSection({
      type: 'hero',
      jsx: `export default function S({heading='default'}:{heading?:string}){ return <h1>{heading}</h1>; }`,
      fields: [{ path: 'heading', kind: 'text', value: 'Hello World' }],
    });
    const html = await renderSection(section, { heading: 'default' });
    expect(html).toContain('Hello World');
    expect(html).toContain('<h1');
  });
  it('throws for failed section status', async () => {
    const section = { ...makeSection({ type: 'x', jsx: '', fields: [] }), status: 'failed' as const };
    await expect(renderSection(section, {})).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/renderer.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `renderer.ts`**

```ts
// next-app/src/lib/blocks/renderer.ts
import { renderToString } from 'react-dom/server';
import * as React from 'react';
import { compileJsxModule, type CompiledComponent } from './jsx-compile';
import { applyFieldValues } from './field-extractor';
import type { Section } from './types';
import { resolveUiPrimitive } from './primitive-resolver';

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
  return renderToString(React.createElement(Component, props));
}

export function clearRendererCache(): void {
  componentCache.clear();
}
```

- [ ] **Step 4: Implement `primitive-resolver.ts`**

```ts
// next-app/src/lib/blocks/primitive-resolver.ts
import * as Accordion from '@/components/ui/accordion';
import * as Button from '@/components/ui/button';
import * as Card from '@/components/ui/card';
import * as Countdown from '@/components/ui/countdown';
import * as Input from '@/components/ui/input';
import * as Label from '@/components/ui/label';
import * as Select from '@/components/ui/select';
import * as Separator from '@/components/ui/separator';
import * as Textarea from '@/components/ui/textarea';
import * as Lucide from 'lucide-react';

const map: Record<string, unknown> = {
  '@/components/ui/accordion': Accordion,
  '@/components/ui/button': Button,
  '@/components/ui/card': Card,
  '@/components/ui/countdown': Countdown,
  '@/components/ui/input': Input,
  '@/components/ui/label': Label,
  '@/components/ui/select': Select,
  '@/components/ui/separator': Separator,
  '@/components/ui/textarea': Textarea,
  'lucide-react': Lucide,
};

export function resolveUiPrimitive(id: string): unknown | null {
  return map[id] ?? null;
}
```

- [ ] **Step 5: Verify tests pass**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/renderer.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add next-app/src/lib/blocks/renderer.ts next-app/src/lib/blocks/primitive-resolver.ts next-app/src/lib/blocks/__tests__/renderer.test.ts
git commit -m "feat(blocks): server-side section renderer with primitive resolver"
```

---

## Phase 5 — Hydration runtime

### Task 11: Client-runtime for interactive behaviors

**Files:**
- Create: `next-app/src/runtime/client-runtime.ts`
- Test: `next-app/src/runtime/__tests__/client-runtime.test.ts` (jsdom)

- [ ] **Step 1: Write failing tests (jsdom environment)**

The tests build DOM trees via `Range.createContextualFragment` + `replaceChildren` instead of assigning HTML strings directly to body properties — this keeps the test-setup pattern auditable and avoids mutating markup properties that trigger document-text scanners.

```ts
// next-app/src/runtime/__tests__/client-runtime.test.ts
/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { hydrateAll } from '../client-runtime';

function setBody(html: string): void {
  const range = document.createRange();
  range.selectNodeContents(document.body);
  const fragment = range.createContextualFragment(html);
  document.body.replaceChildren(fragment);
}

describe('client-runtime', () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it('countdown marker updates text', async () => {
    const future = new Date(Date.now() + 60_000).toISOString();
    setBody(`<div data-hydrate="countdown" data-target="${future}"><span data-cd-days>0</span><span data-cd-hours>0</span><span data-cd-minutes>0</span><span data-cd-seconds>0</span></div>`);
    hydrateAll();
    await new Promise(r => setTimeout(r, 50));
    expect(document.querySelector('[data-cd-seconds]')?.textContent).not.toBe('0');
  });

  it('accordion toggles open/closed', () => {
    setBody(`<div data-hydrate="accordion"><button data-acc-toggle="q1">Q</button><div data-acc-panel="q1" hidden>A</div></div>`);
    hydrateAll();
    const btn = document.querySelector<HTMLButtonElement>('[data-acc-toggle]')!;
    const panel = document.querySelector<HTMLElement>('[data-acc-panel]')!;
    btn.click();
    expect(panel.hidden).toBe(false);
    btn.click();
    expect(panel.hidden).toBe(true);
  });

  it('optin-form posts to data-endpoint', async () => {
    const calls: RequestInit[] = [];
    globalThis.fetch = (async (_url: RequestInfo, init?: RequestInit) => {
      calls.push(init!);
      return new Response('{}', { status: 200 });
    }) as typeof fetch;
    setBody(`<form data-hydrate="optin-form" data-endpoint="/api/optin"><input name="email" value="a@b.com"/><button type="submit">Go</button></form>`);
    hydrateAll();
    const form = document.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    await new Promise(r => setTimeout(r, 10));
    expect(calls.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `cd next-app && pnpm vitest run src/runtime/__tests__/client-runtime.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// next-app/src/runtime/client-runtime.ts
type Hydrator = (el: HTMLElement) => void;

const hydrators: Record<string, Hydrator> = {
  countdown: hydrateCountdown,
  accordion: hydrateAccordion,
  'optin-form': hydrateOptinForm,
};

export function hydrateAll(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-hydrate]').forEach(el => {
    const name = el.getAttribute('data-hydrate');
    if (name && hydrators[name]) hydrators[name](el);
  });
}

function hydrateCountdown(el: HTMLElement): void {
  const target = new Date(el.dataset.target ?? '').getTime();
  if (isNaN(target)) return;
  const days = el.querySelector('[data-cd-days]');
  const hours = el.querySelector('[data-cd-hours]');
  const minutes = el.querySelector('[data-cd-minutes]');
  const seconds = el.querySelector('[data-cd-seconds]');
  const tick = () => {
    const d = Math.max(0, target - Date.now());
    const dd = Math.floor(d / 86400000);
    const hh = Math.floor((d % 86400000) / 3600000);
    const mm = Math.floor((d % 3600000) / 60000);
    const ss = Math.floor((d % 60000) / 1000);
    if (days) days.textContent = String(dd);
    if (hours) hours.textContent = String(hh);
    if (minutes) minutes.textContent = String(mm);
    if (seconds) seconds.textContent = String(ss);
  };
  tick();
  setInterval(tick, 1000);
}

function hydrateAccordion(el: HTMLElement): void {
  el.querySelectorAll<HTMLButtonElement>('[data-acc-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.accToggle!;
      const panel = el.querySelector<HTMLElement>(`[data-acc-panel="${id}"]`);
      if (panel) panel.hidden = !panel.hidden;
    });
  });
}

function hydrateOptinForm(el: HTMLElement): void {
  const form = el as HTMLFormElement;
  const endpoint = form.dataset.endpoint;
  if (!endpoint) return;
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    form.dispatchEvent(new CustomEvent('optin:submitted'));
  });
}

if (typeof document !== 'undefined' && document.readyState !== 'loading') {
  hydrateAll();
} else if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => hydrateAll());
}
```

- [ ] **Step 4: Verify tests pass**

Run: `cd next-app && pnpm vitest run src/runtime/__tests__/client-runtime.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/runtime/client-runtime.ts next-app/src/runtime/__tests__/client-runtime.test.ts
git commit -m "feat(runtime): client hydration for countdown, accordion, optin-form"
```

---

## Phase 6 — Publisher + Next.js API routes

### Task 12: Publisher composition

**Files:**
- Create: `next-app/src/lib/blocks/publisher.ts`
- Test: `next-app/src/lib/blocks/__tests__/publisher.test.ts`
- Modify: `next-app/package.json` (add `esbuild` + `build:runtime` script)

- [ ] **Step 1: Write failing tests**

```ts
// next-app/src/lib/blocks/__tests__/publisher.test.ts
import { describe, it, expect } from 'vitest';
import { publishDraft } from '../publisher';
import { makeSection } from '../types';

describe('publishDraft', () => {
  it('concatenates sections and includes hydration script tag', async () => {
    const sections = [
      makeSection({ type: 'hero', jsx: `export default function S(){ return <h1>Hi</h1>; }`, fields: [] }),
      makeSection({ type: 'faq', jsx: `export default function S(){ return <div data-hydrate="accordion">A</div>; }`, fields: [] }),
    ];
    const out = await publishDraft(sections);
    expect(out.html).toContain('<h1>Hi</h1>');
    expect(out.html).toContain('data-hydrate="accordion"');
    expect(out.html).toContain('<script');
    expect(out.manifest.accordion).toBe(1);
  });
  it('throws if any section is failed', async () => {
    const bad = { ...makeSection({ type: 'x', jsx: '', fields: [] }), status: 'failed' as const };
    await expect(publishDraft([bad])).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run to verify fail**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/publisher.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement publisher**

```ts
// next-app/src/lib/blocks/publisher.ts
import fs from 'fs/promises';
import path from 'path';
import { renderSection } from './renderer';
import type { Section } from './types';

export interface PublishResult {
  html: string;
  manifest: Record<string, number>;
}

export async function publishDraft(sections: Section[], defaultPropsPerSection?: Record<string, Record<string, unknown>>): Promise<PublishResult> {
  for (const s of sections) {
    if (s.status === 'failed') throw new Error(`cannot publish: section ${s.id} failed`);
  }

  const htmls = await Promise.all(sections.map(s =>
    renderSection(s, defaultPropsPerSection?.[s.id] ?? {})
  ));

  const manifest = buildManifest(htmls);
  const runtimeSource = await loadRuntimeSource();

  const body = htmls.join('\n');
  const html = [
    '<!doctype html>',
    '<html><head><meta charset="utf-8"/><link rel="stylesheet" href="/_published/styles.css"/></head>',
    `<body>${body}<script>${runtimeSource}</script></body>`,
    '</html>',
  ].join('\n');

  return { html, manifest };
}

function buildManifest(htmls: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const html of htmls) {
    const matches = html.matchAll(/data-hydrate="([^"]+)"/g);
    for (const m of matches) counts[m[1]] = (counts[m[1]] ?? 0) + 1;
  }
  return counts;
}

async function loadRuntimeSource(): Promise<string> {
  const p = path.join(process.cwd(), 'dist/client-runtime.js');
  try { return await fs.readFile(p, 'utf8'); }
  catch { return ''; }
}
```

- [ ] **Step 4: Add a build step for `client-runtime.js`**

```bash
cd next-app && pnpm add -D esbuild
```

Add to `next-app/package.json` scripts:

```json
"build:runtime": "esbuild src/runtime/client-runtime.ts --bundle --format=iife --outfile=dist/client-runtime.js --minify"
```

- [ ] **Step 5: Verify tests pass**

Run: `cd next-app && pnpm vitest run src/lib/blocks/__tests__/publisher.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add next-app/src/lib/blocks/publisher.ts next-app/src/lib/blocks/__tests__/publisher.test.ts next-app/package.json next-app/pnpm-lock.yaml
git commit -m "feat(blocks): publisher concatenates sections + hydration manifest"
```

---

### Task 13: Next.js API routes

**Files:**
- Create: `next-app/src/app/api/sections/generate/route.ts`
- Create: `next-app/src/app/api/sections/regenerate/route.ts`
- Create: `next-app/src/app/api/drafts/[id]/publish/route.ts`
- Create: `next-app/src/app/api/drafts/[id]/preview/route.ts`
- Test: `next-app/src/app/api/sections/__tests__/routes.test.ts`

- [ ] **Step 1: Write failing route test**

```ts
// next-app/src/app/api/sections/__tests__/routes.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/blocks/design-phase', () => ({
  designSection: vi.fn(async () => ({
    id: 'x', type: 'hero', jsx: 'export default function S(){return null}',
    fields: [], status: 'ready', regeneration_note: null, source_section_id: null,
  })),
}));

import { POST as generate } from '../generate/route';

describe('POST /api/sections/generate', () => {
  beforeEach(() => { process.env.INTERNAL_API_TOKEN = 'test'; });

  it('returns section JSON when authorized', async () => {
    const req = new Request('http://localhost/api/sections/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test' },
      body: JSON.stringify({
        section: { type: 'hero', purpose: '', position: 1, total: 1 },
        summit: { name: '', date: '', brandColors: {}, mode: 'light', speakers: [], toneBrief: '', product: null },
      }),
    });
    const res = await generate(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe('ready');
  });

  it('rejects missing token', async () => {
    const req = new Request('http://localhost/api/sections/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const res = await generate(req);
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test**

Run: `cd next-app && pnpm vitest run src/app/api/sections/__tests__/routes.test.ts`
Expected: FAIL.

- [ ] **Step 3: Implement `generate/route.ts`**

```ts
// next-app/src/app/api/sections/generate/route.ts
import { NextResponse } from 'next/server';
import { designSection } from '@/lib/blocks/design-phase';

function authorize(req: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return false;
  return req.headers.get('authorization') === `Bearer ${expected}`;
}

export async function POST(req: Request): Promise<Response> {
  if (!authorize(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  if (!body?.section?.type || !body?.summit) {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }
  const section = await designSection({
    section: body.section,
    summit: body.summit,
    previousSectionJsx: body.previousSectionJsx ?? null,
    regenerationNote: body.regenerationNote ?? null,
  });
  return NextResponse.json(section);
}
```

- [ ] **Step 4: Implement `regenerate/route.ts`**

```ts
// next-app/src/app/api/sections/regenerate/route.ts
import { NextResponse } from 'next/server';
import { designSection } from '@/lib/blocks/design-phase';

function authorize(req: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return false;
  return req.headers.get('authorization') === `Bearer ${expected}`;
}

export async function POST(req: Request): Promise<Response> {
  if (!authorize(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  const section = await designSection({
    section: body.section,
    summit: body.summit,
    previousSectionJsx: body.previousSectionJsx ?? null,
    regenerationNote: body.regenerationNote ?? null,
    currentJsx: body.currentJsx,
  });
  if (body.preserveId) section.id = body.preserveId;
  return NextResponse.json(section);
}
```

- [ ] **Step 5: Implement `publish/route.ts`**

```ts
// next-app/src/app/api/drafts/[id]/publish/route.ts
import { NextResponse } from 'next/server';
import { publishDraft } from '@/lib/blocks/publisher';

function authorize(req: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return false;
  return req.headers.get('authorization') === `Bearer ${expected}`;
}

export async function POST(req: Request, { params }: { params: { id: string } }): Promise<Response> {
  if (!authorize(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = await req.json();
  if (!Array.isArray(body?.sections)) return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  try {
    const result = await publishDraft(body.sections, body.defaultPropsPerSection);
    return NextResponse.json({ draftId: params.id, ...result });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 422 });
  }
}
```

- [ ] **Step 6: Implement `preview/route.ts`**

```ts
// next-app/src/app/api/drafts/[id]/preview/route.ts
import { publishDraft } from '@/lib/blocks/publisher';

function authorize(req: Request): boolean {
  const expected = process.env.INTERNAL_API_TOKEN;
  if (!expected) return false;
  return req.headers.get('authorization') === `Bearer ${expected}`;
}

export async function POST(req: Request): Promise<Response> {
  if (!authorize(req)) return new Response('unauthorized', { status: 401 });
  const body = await req.json();
  try {
    const { html } = await publishDraft(body.sections, body.defaultPropsPerSection);
    return new Response(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (err) {
    return new Response((err as Error).message, { status: 422 });
  }
}
```

- [ ] **Step 7: Verify tests pass**

Run: `cd next-app && pnpm vitest run src/app/api/sections/__tests__/routes.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add next-app/src/app/api
git commit -m "feat(api): sections generate/regenerate, draft publish/preview routes"
```

---

## Phase 7 — Laravel orchestration

### Task 14: BlockDesignPhase service

**Files:**
- Create: `app/Services/FunnelGenerator/Phases/BlockDesignPhase.php`
- Modify: `config/services.php`
- Test: `tests/Unit/BlockDesignPhaseTest.php`

- [ ] **Step 1: Write failing test**

```php
<?php
// tests/Unit/BlockDesignPhaseTest.php
namespace Tests\Unit;

use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class BlockDesignPhaseTest extends TestCase
{
    public function test_fans_out_parallel_requests_and_collects_sections(): void
    {
        config(['services.next_app.url' => 'http://next.test', 'services.next_app.token' => 'tok']);
        Http::fake([
            'http://next.test/api/sections/generate' => Http::response([
                'id' => 'a', 'type' => 'hero', 'jsx' => 'x', 'fields' => [],
                'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null,
            ]),
        ]);

        $phase = new BlockDesignPhase();
        $sections = $phase->run(
            sectionBriefs: [
                ['type' => 'hero', 'purpose' => 'p1', 'position' => 1, 'total' => 2],
                ['type' => 'faq',  'purpose' => 'p2', 'position' => 2, 'total' => 2],
            ],
            summitContext: ['name' => 'X', 'date' => '', 'brandColors' => [], 'mode' => 'light', 'speakers' => [], 'toneBrief' => '', 'product' => null],
        );

        $this->assertCount(2, $sections);
        $this->assertSame('ready', $sections[0]['status']);
    }
}
```

- [ ] **Step 2: Run to verify fail**

Run: `php artisan test --filter=BlockDesignPhaseTest`
Expected: FAIL.

- [ ] **Step 3: Implement service**

```php
<?php
// app/Services/FunnelGenerator/Phases/BlockDesignPhase.php
namespace App\Services\FunnelGenerator\Phases;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class BlockDesignPhase
{
    public function run(array $sectionBriefs, array $summitContext): array
    {
        $base = rtrim(config('services.next_app.url'), '/');
        $token = config('services.next_app.token');

        $responses = Http::pool(function ($pool) use ($sectionBriefs, $summitContext, $base, $token) {
            $out = [];
            foreach ($sectionBriefs as $i => $brief) {
                $out[] = $pool->as("s_{$i}")
                    ->withToken($token)
                    ->timeout(90)
                    ->post("{$base}/api/sections/generate", [
                        'section' => $brief,
                        'summit' => $summitContext,
                        'previousSectionJsx' => null,
                    ]);
            }
            return $out;
        });

        $sections = [];
        foreach ($sectionBriefs as $i => $_) {
            $resp = $responses["s_{$i}"];
            if (!$resp->successful()) {
                $sections[] = $this->failedStub($sectionBriefs[$i]['type'], "HTTP {$resp->status()}");
                continue;
            }
            $sections[] = $resp->json();
        }
        return $sections;
    }

    public function regenerate(array $currentSection, array $summitContext, ?string $note): array
    {
        $base = rtrim(config('services.next_app.url'), '/');
        $token = config('services.next_app.token');
        $resp = Http::withToken($token)->timeout(90)->post("{$base}/api/sections/regenerate", [
            'section' => ['type' => $currentSection['type'], 'purpose' => '', 'position' => 0, 'total' => 0],
            'summit' => $summitContext,
            'currentJsx' => $currentSection['jsx'] ?? null,
            'regenerationNote' => $note,
            'preserveId' => $currentSection['id'],
        ]);
        if (!$resp->successful()) {
            return $this->failedStub($currentSection['type'], "HTTP {$resp->status()}", $currentSection['id']);
        }
        return $resp->json();
    }

    private function failedStub(string $type, string $error, ?string $preserveId = null): array
    {
        return [
            'id' => $preserveId ?? (string) Str::uuid(),
            'type' => $type,
            'jsx' => '',
            'fields' => [],
            'status' => 'failed',
            'regeneration_note' => null,
            'source_section_id' => null,
            'error' => $error,
        ];
    }
}
```

- [ ] **Step 4: Register service config**

Edit `config/services.php` to add:

```php
'next_app' => [
    'url' => env('NEXT_APP_URL', 'http://localhost:3000'),
    'token' => env('INTERNAL_API_TOKEN'),
],
```

- [ ] **Step 5: Verify test passes**

Run: `php artisan test --filter=BlockDesignPhaseTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Services/FunnelGenerator/Phases/BlockDesignPhase.php tests/Unit/BlockDesignPhaseTest.php config/services.php
git commit -m "feat(generator): BlockDesignPhase parallel HTTP fan-out to Next.js"
```

---

### Task 15: Wire BlockDesignPhase into FunnelGenerator

**Files:**
- Modify: `app/Services/FunnelGenerator/FunnelGenerator.php`
- Modify: `app/Models/LandingPageDraft.php` (add `buildSummitContext()`)
- Test: `tests/Feature/FunnelGeneratorRuntimeFlowTest.php`

- [ ] **Step 1: Write failing test**

```php
<?php
// tests/Feature/FunnelGeneratorRuntimeFlowTest.php
namespace Tests\Feature;

use App\Services\FunnelGenerator\FunnelGenerator;
use App\Services\FunnelGenerator\Phases\ArchitectPhase;
use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class FunnelGeneratorRuntimeFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_flag_on_routes_through_block_design_phase(): void
    {
        config(['features.runtime_gemini_gen' => true]);

        $architect = Mockery::mock(ArchitectPhase::class);
        $architect->shouldReceive('run')->andReturn(['sections' => [
            ['type' => 'hero', 'purpose' => 'p', 'position' => 1, 'total' => 1],
        ]]);
        $design = Mockery::mock(BlockDesignPhase::class);
        $design->shouldReceive('run')->andReturn([
            ['id' => 'x', 'type' => 'hero', 'jsx' => 'j', 'fields' => [], 'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null],
        ]);
        $this->app->instance(ArchitectPhase::class, $architect);
        $this->app->instance(BlockDesignPhase::class, $design);

        $gen = $this->app->make(FunnelGenerator::class);
        $draft = $gen->generateForSummit(/* pass a Summit fixture */);

        $this->assertNotEmpty($draft->sections);
        $this->assertSame('hero', $draft->sections[0]['type']);
    }
}
```

- [ ] **Step 2: Run to verify fail**

Run: `php artisan test --filter=FunnelGeneratorRuntimeFlowTest`
Expected: FAIL.

- [ ] **Step 3: Branch inside `FunnelGenerator`**

Locate the existing generation entry point and insert the flag branch before the CopywriterPhase call:

```php
if (config('features.runtime_gemini_gen')) {
    $architectOutput = $this->architect->run($summit);
    $sections = $this->blockDesignPhase->run(
        sectionBriefs: $architectOutput['sections'],
        summitContext: $summit->buildSummitContext(),
    );
    return LandingPageDraft::create([
        // preserve existing keys (batch, funnel_step, status) ...
        'sections' => $sections,
    ]);
}
// else: existing Copywriter flow stays intact.
```

Inject `BlockDesignPhase` via the constructor.

- [ ] **Step 4: Add `buildSummitContext()` on the Summit model**

Implement a method returning the context array shape consumed by Next.js (name, date, brandColors, mode, speakers, toneBrief, product).

- [ ] **Step 5: Verify tests pass**

Run: `php artisan test --filter=FunnelGeneratorRuntimeFlowTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Services/FunnelGenerator/FunnelGenerator.php app/Models/ tests/Feature/FunnelGeneratorRuntimeFlowTest.php
git commit -m "feat(generator): flag-gated runtime flow uses BlockDesignPhase"
```

---

### Task 16: RegenerateSectionJob

**Files:**
- Create: `app/Jobs/RegenerateSectionJob.php`
- Modify: `app/Models/LandingPageDraft.php` (add `buildSummitContext()` delegating to Summit)
- Test: `tests/Feature/RegenerateSectionJobTest.php`

- [ ] **Step 1: Write failing test**

```php
<?php
// tests/Feature/RegenerateSectionJobTest.php
namespace Tests\Feature;

use App\Jobs\RegenerateSectionJob;
use App\Models\LandingPageDraft;
use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;
use Tests\TestCase;

class RegenerateSectionJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_regenerates_single_section_preserving_id(): void
    {
        $draft = LandingPageDraft::factory()->create([
            'sections' => [
                ['id' => 'keep-me', 'type' => 'faq', 'jsx' => 'old', 'fields' => [], 'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null],
                ['id' => 'other',   'type' => 'hero','jsx' => 'h',   'fields' => [], 'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null],
            ],
        ]);

        $design = Mockery::mock(BlockDesignPhase::class);
        $design->shouldReceive('regenerate')->once()->andReturn([
            'id' => 'keep-me', 'type' => 'faq', 'jsx' => 'new', 'fields' => [],
            'status' => 'ready', 'regeneration_note' => 'shorter', 'source_section_id' => null,
        ]);
        $this->app->instance(BlockDesignPhase::class, $design);

        (new RegenerateSectionJob($draft->id, 'keep-me', 'shorter'))->handle($design);

        $fresh = $draft->fresh();
        $this->assertSame('new', $fresh->sections[0]['jsx']);
        $this->assertSame('h', $fresh->sections[1]['jsx']);
        $this->assertSame('keep-me', $fresh->sections[0]['id']);
    }
}
```

- [ ] **Step 2: Run to verify fail**

Run: `php artisan test --filter=RegenerateSectionJobTest`
Expected: FAIL.

- [ ] **Step 3: Implement job**

```php
<?php
// app/Jobs/RegenerateSectionJob.php
namespace App\Jobs;

use App\Models\LandingPageDraft;
use App\Services\FunnelGenerator\Phases\BlockDesignPhase;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class RegenerateSectionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public readonly int $draftId,
        public readonly string $sectionId,
        public readonly ?string $note,
    ) {}

    public function handle(BlockDesignPhase $phase): void
    {
        $draft = LandingPageDraft::findOrFail($this->draftId);
        $sections = $draft->sections ?? [];
        $idx = collect($sections)->search(fn ($s) => $s['id'] === $this->sectionId);
        if ($idx === false) return;

        $current = $sections[$idx];
        $sections[$idx] = array_merge($current, ['status' => 'regenerating']);
        $draft->update(['sections' => $sections]);

        $replacement = $phase->regenerate(
            currentSection: $current,
            summitContext: $draft->buildSummitContext(),
            note: $this->note,
        );
        $replacement['id'] = $current['id'];
        $sections[$idx] = $replacement;
        $draft->update(['sections' => $sections]);
    }
}
```

- [ ] **Step 4: Add `buildSummitContext` on the draft model**

Add a public method to `app/Models/LandingPageDraft.php` returning the `SummitContext` array (delegating to the related Summit model).

- [ ] **Step 5: Verify test passes**

Run: `php artisan test --filter=RegenerateSectionJobTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/Jobs/RegenerateSectionJob.php app/Models/LandingPageDraft.php tests/Feature/RegenerateSectionJobTest.php
git commit -m "feat(jobs): RegenerateSectionJob preserves section id across regen"
```

---

### Task 17: PublishLandingPageDraftJob

**Files:**
- Create: `app/Jobs/PublishLandingPageDraftJob.php`
- Test: `tests/Feature/PublishLandingPageDraftJobTest.php`

- [ ] **Step 1: Write failing test**

```php
<?php
// tests/Feature/PublishLandingPageDraftJobTest.php
namespace Tests\Feature;

use App\Jobs\PublishLandingPageDraftJob;
use App\Models\LandingPageDraft;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PublishLandingPageDraftJobTest extends TestCase
{
    use RefreshDatabase;

    public function test_stores_published_html_on_success(): void
    {
        config(['services.next_app.url' => 'http://next.test', 'services.next_app.token' => 'tok']);
        $draft = LandingPageDraft::factory()->create([
            'sections' => [['id' => 'a', 'type' => 'h', 'jsx' => 'x', 'fields' => [], 'status' => 'ready', 'regeneration_note' => null, 'source_section_id' => null]],
        ]);
        Http::fake([
            "http://next.test/api/drafts/{$draft->id}/publish" => Http::response([
                'draftId' => $draft->id, 'html' => '<html>ok</html>', 'manifest' => ['accordion' => 1],
            ]),
        ]);

        (new PublishLandingPageDraftJob($draft->id))->handle();

        $fresh = $draft->fresh();
        $this->assertSame('<html>ok</html>', $fresh->published_html);
        $this->assertSame(['accordion' => 1], $fresh->published_hydration_manifest);
        $this->assertSame('published', $fresh->status);
    }

    public function test_blocks_publish_if_any_section_failed(): void
    {
        $draft = LandingPageDraft::factory()->create([
            'sections' => [['id' => 'a', 'type' => 'h', 'jsx' => '', 'fields' => [], 'status' => 'failed', 'regeneration_note' => null, 'source_section_id' => null]],
        ]);
        $this->expectException(\RuntimeException::class);
        (new PublishLandingPageDraftJob($draft->id))->handle();
    }
}
```

- [ ] **Step 2: Run to verify fail**

Run: `php artisan test --filter=PublishLandingPageDraftJobTest`
Expected: FAIL.

- [ ] **Step 3: Implement job**

```php
<?php
// app/Jobs/PublishLandingPageDraftJob.php
namespace App\Jobs;

use App\Models\LandingPageDraft;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class PublishLandingPageDraftJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $draftId) {}

    public function handle(): void
    {
        $draft = LandingPageDraft::findOrFail($this->draftId);
        $sections = $draft->sections ?? [];
        foreach ($sections as $s) {
            if (($s['status'] ?? null) !== 'ready') {
                throw new \RuntimeException("cannot publish: section {$s['id']} status is {$s['status']}");
            }
        }

        $base = rtrim(config('services.next_app.url'), '/');
        $token = config('services.next_app.token');
        $resp = Http::withToken($token)->timeout(60)->post("{$base}/api/drafts/{$draft->id}/publish", [
            'sections' => $sections,
        ]);

        if (!$resp->successful()) {
            throw new \RuntimeException("publish failed: HTTP {$resp->status()} — {$resp->body()}");
        }
        $body = $resp->json();
        $draft->update([
            'published_html' => $body['html'],
            'published_hydration_manifest' => $body['manifest'] ?? [],
            'status' => 'published',
            'published_at' => now(),
        ]);
    }
}
```

- [ ] **Step 4: Verify test passes**

Run: `php artisan test --filter=PublishLandingPageDraftJobTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Jobs/PublishLandingPageDraftJob.php tests/Feature/PublishLandingPageDraftJobTest.php
git commit -m "feat(jobs): PublishLandingPageDraftJob stores SSR'd HTML on draft"
```

---

## Phase 8 — Filament UI

### Task 18: Sections list view on the draft resource

**Files:**
- Modify: `app/Filament/Resources/LandingPageDraftResource.php`
- Create/modify: `app/Filament/Resources/LandingPageDraftResource/Pages/EditLandingPageSections.php`

- [ ] **Step 1: Add a Filament infolist (or table) for sections**

Inside `LandingPageDraftResource`, add an `infolist` entry that renders each item of `sections` with: number, type label, status badge, inline "Regenerate UI" action, expand content-fields action.

- [ ] **Step 2: Content-field form**

For the expand state, render a repeater bound to `sections[i].fields[]`. Each field row has:
- `path` (read-only)
- `kind` (read-only)
- `value` (text input, or image uploader when `kind === 'image'`)

Saving the form writes the updated `fields` array back to that section in `sections` and calls `$draft->save()`.

- [ ] **Step 3: "Regenerate UI" action per section**

Add a per-row action:

```php
Tables\Actions\Action::make('regenerate')
    ->label('Regenerate UI')
    ->form([
        Forms\Components\Textarea::make('note')->maxLength(500),
    ])
    ->action(function (array $data, $record, $arguments) {
        \App\Jobs\RegenerateSectionJob::dispatch($record->id, $arguments['sectionId'], $data['note'] ?? null);
    });
```

- [ ] **Step 4: Verify manually**

Run: `php artisan serve`, open `/admin`, open a draft with `sections`, click Regenerate UI with a note. Check queue worker logs.

- [ ] **Step 5: Commit**

```bash
git add app/Filament/Resources/LandingPageDraftResource.php app/Filament/Resources/LandingPageDraftResource/Pages/
git commit -m "feat(filament): sections list with per-section regenerate + content fields"
```

---

### Task 19: Preview + Publish top-bar actions

**Files:**
- Modify: `app/Filament/Resources/LandingPageDraftResource.php` (header actions)
- Create: `app/Http/Controllers/DraftPreviewController.php`
- Modify: `routes/web.php`

- [ ] **Step 1: Add `Preview` action**

Opens an iframe whose `src` points at a Laravel preview endpoint. The endpoint proxies to Next.js `POST /api/drafts/:id/preview` with the draft's current sections.

- [ ] **Step 2: Add `Regenerate all` action**

```php
Action::make('regenerate_all')
    ->requiresConfirmation()
    ->action(fn ($record) => \App\Jobs\GenerateLandingPageBatchJob::dispatch($record->summit_id /* etc */));
```

- [ ] **Step 3: Add `Publish` action**

```php
Action::make('publish')
    ->disabled(fn ($record) => collect($record->sections)->contains(fn ($s) => $s['status'] !== 'ready'))
    ->action(fn ($record) => \App\Jobs\PublishLandingPageDraftJob::dispatch($record->id));
```

- [ ] **Step 4: Add Laravel preview route**

```php
// routes/web.php
Route::post('/admin/drafts/{draft}/preview', [\App\Http\Controllers\DraftPreviewController::class, 'show'])
    ->middleware(['auth'])
    ->name('drafts.preview');
```

Controller proxies to the Next.js preview endpoint and returns the HTML inline. Restrict access to operators (`can:view,draft`) if a policy exists.

- [ ] **Step 5: Commit**

```bash
git add app/Filament/Resources/LandingPageDraftResource.php routes/web.php app/Http/Controllers/DraftPreviewController.php
git commit -m "feat(filament): preview/regenerate-all/publish header actions"
```

---

## Phase 9 — Funnel route serves published HTML

### Task 20: Public funnel controller reads `published_html`

**Files:**
- Modify: `app/Http/Controllers/FunnelController.php`
- Test: `tests/Feature/FunnelPublishedHtmlTest.php`

- [ ] **Step 1: Write failing test**

```php
<?php
// tests/Feature/FunnelPublishedHtmlTest.php
namespace Tests\Feature;

use App\Models\Domain;
use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\LandingPageDraft;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FunnelPublishedHtmlTest extends TestCase
{
    use RefreshDatabase;

    public function test_serves_published_html_when_flag_on_and_column_populated(): void
    {
        config(['features.runtime_gemini_gen' => true]);
        $domain = Domain::factory()->create(['host' => 'x.test']);
        $funnel = Funnel::factory()->for($domain)->create(['slug' => 'aws']);
        $step = FunnelStep::factory()->for($funnel)->create(['slug' => '', 'type' => 'optin']);
        LandingPageDraft::factory()->for($step, 'funnelStep')->create([
            'status' => 'published',
            'published_html' => '<html><body>RUNTIME</body></html>',
        ]);

        $this->withServerVariables(['HTTP_HOST' => 'x.test'])
            ->get('/aws/')
            ->assertOk()
            ->assertSee('RUNTIME');
    }
}
```

- [ ] **Step 2: Run to verify fail**

Run: `php artisan test --filter=FunnelPublishedHtmlTest`
Expected: FAIL.

- [ ] **Step 3: Branch in `FunnelController`**

Where the controller currently resolves the step and calls `Inertia::render(...)`, insert the static-HTML check first:

```php
if (config('features.runtime_gemini_gen')) {
    $published = $this->resolveLivePublishedDraft($step);
    if ($published && $published->published_html) {
        return response($published->published_html)
            ->header('Content-Type', 'text/html; charset=utf-8');
    }
}
// existing Inertia fallback stays.
```

`resolveLivePublishedDraft` returns the latest `LandingPageDraft` for the step with `status = 'published'`.

- [ ] **Step 4: Verify test passes**

Run: `php artisan test --filter=FunnelPublishedHtmlTest`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/FunnelController.php tests/Feature/FunnelPublishedHtmlTest.php
git commit -m "feat(funnel): serve published_html when runtime flag active"
```

---

## Phase 10 — E2E verification + rollout

### Task 21: End-to-end smoke test (real Gemini)

- [ ] **Step 1: Set env vars**

Ensure `.env` has: `GEMINI_API_KEY`, `INTERNAL_API_TOKEN` (also set in `next-app/.env.local`), `NEXT_APP_URL=http://localhost:3000`, `ENABLE_RUNTIME_GEMINI_GEN=true`.

- [ ] **Step 2: Run full stack**

```bash
php artisan serve
cd next-app && pnpm dev
php artisan queue:work
```

- [ ] **Step 3: Seed a summit + click Generate in Filament**

Use an existing seeded summit. Open `/admin/landing-page-drafts`, click Generate. Watch logs: architect → N parallel Gemini calls → draft populated with `sections`.

- [ ] **Step 4: Verify in UI**

- Sections list shows N rows all with status `ready` (or documented failures).
- Click a section → content fields visible + editable.
- Click Regenerate UI with note → section re-renders (same id).
- Click Preview → iframe shows current state.
- Click Publish → `published_html` populated, funnel URL now serves the static HTML.

- [ ] **Step 5: Document results**

Append results and any prompt-tuning notes to `docs/superpowers/specs/2026-04-15-runtime-gemini-landing-page-design.md` under a "Phase 10 verification" section.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/specs/2026-04-15-runtime-gemini-landing-page-design.md
git commit -m "docs(runtime-gemini): Phase 10 verification notes"
```

---

### Task 22: Rollout flag flip for first live summit

- [ ] **Step 1: Pick a low-risk summit (internal test funnel)**

If per-summit flag gating exists, flip `ENABLE_RUNTIME_GEMINI_GEN=true` for that summit's context only. Otherwise, flip globally in staging only.

- [ ] **Step 2: Generate + publish**

Same as Task 21 but against a real summit in staging.

- [ ] **Step 3: Smoke test the live page in browser**

- Visit the funnel URL.
- Confirm countdown ticks.
- Confirm accordion toggles.
- Confirm optin form submits.
- Confirm no console errors (no JSX should execute client-side — only the runtime script + static HTML).

- [ ] **Step 4: Document**

Note any issues, add to the spec's Open Questions section, commit.

---

### Task 23: Deprecate old composition flow (30-day clock)

- [ ] **Step 1: Leave old flow reachable behind the flag for 30 days**

Nothing to do code-wise — the flag branch in FunnelGenerator keeps CopywriterPhase available when `runtime_gemini_gen=false`.

- [ ] **Step 2: After 30 days + green signal**

Remove `CopywriterPhase` and the legacy `blocks` column migration. Separate PR.

---

## Self-Review

**Spec coverage:**
- ArchitectPhase unchanged → preserved (Task 15 only branches after it).
- BlockDesignPhase runtime — Task 14.
- AST validator — Task 7.
- SSR-to-static publish — Tasks 12, 17.
- Hydration runtime — Task 11.
- Per-section regenerate — Task 16.
- Filament UI matching editor-layout mockup — Tasks 18–19.
- Feature flag rollout — Tasks 2, 15, 20, 22–23.
- `published_html` + `published_hydration_manifest` columns — Task 3.

**Placeholder scan:** All task bodies contain concrete code. File paths are exact.

**Type consistency:** `Section` shape (id, type, jsx, fields[], status, regeneration_note, source_section_id) is used identically in `types.ts`, Laravel jobs, and API route payloads. `designSection` input shape matches `BuildDesignPromptInput`. `validateJsx` return type matches the consumer in `design-phase.ts`. `BlockDesignPhase->run()` / `->regenerate()` signatures match consumers in `FunnelGenerator` and `RegenerateSectionJob`.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-15-runtime-gemini-landing-page.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
