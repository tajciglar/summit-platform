# V3 Multi-Stage Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-stage Gemini JSX generator with a multi-stage pipeline: Gemini designs mockup PNGs, Claude writes the code from those mockups, using a structured component registry as context.

**Architecture:** The pipeline becomes: mockup image (Gemini) -> code generation (Claude) -> validation + CSS extraction (existing). A new component registry replaces the hardcoded `design-system.ts` as the AI's source of truth for available components, design tokens, and constraints. The existing image stage, validator, CSS extractor, JSX compiler, and renderer are unchanged.

**Tech Stack:** `@anthropic-ai/sdk` (already installed), `@google/genai` (existing), Vitest for tests.

**Spec:** `docs/superpowers/specs/2026-04-16-landing-page-generation-v3-design.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/lib/blocks/component-registry.ts` | CREATE | Builds structured prompt context from style brief + primitive specs |
| `src/lib/blocks/claude-coder.ts` | CREATE | Calls Claude API with mockup + registry, returns `{ jsx, fields }` envelope |
| `src/lib/blocks/design-phase.ts` | REWRITE | Orchestrates multi-stage pipeline: mockup -> Claude code -> validate -> CSS |
| `src/lib/blocks/design-prompt.ts` | DEPRECATE | No longer used in main flow — types moved to `types.ts` |
| `src/lib/blocks/types.ts` | MODIFY | Absorb exported types from `design-prompt.ts` |
| `src/lib/blocks/__tests__/component-registry.test.ts` | CREATE | Tests for registry builder |
| `src/lib/blocks/__tests__/claude-coder.test.ts` | CREATE | Tests for Claude coder (mocked API) |
| `src/lib/blocks/__tests__/design-phase.test.ts` | REWRITE | Tests for new multi-stage pipeline |

**Unchanged files:** `css-extractor.ts`, `renderer.ts`, `field-extractor.ts`, `jsx-compile.ts`, `validator.ts`, `primitive-resolver.ts`, `gemini-client.ts`, `image-stage.ts`, `polish-stage.ts`, `publisher.ts`, API routes (`generate/route.ts`, `regenerate/route.ts`).

---

### Task 1: Move shared types from design-prompt.ts to types.ts

**Files:**
- Modify: `src/lib/blocks/types.ts`
- Modify: `src/lib/blocks/design-prompt.ts`
- Modify: `src/lib/blocks/image-stage.ts` (updates import path)

The types `SectionBrief`, `SummitContext`, `BuildDesignPromptInput`, and `DesignPrompt` are currently in `design-prompt.ts` but used across the pipeline. Move them to `types.ts` so other modules don't depend on the prompt builder.

- [ ] **Step 1: Add types to `types.ts`**

Add these types at the end of `src/lib/blocks/types.ts`:

```typescript
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
  styleBrief?: Record<string, unknown>;
  mockupImage?: { mime: string; data: string } | null;
  referenceImage?: { mime: string; data: string } | null;
}

export interface DesignPrompt {
  text: string;
  image?: { mime: string; data: string };
}
```

- [ ] **Step 2: Update `design-prompt.ts` to re-export from `types.ts`**

Replace the type definitions in `src/lib/blocks/design-prompt.ts` with re-exports:

```typescript
export type { SectionBrief, SummitContext, BuildDesignPromptInput, DesignPrompt } from './types';
```

Keep the rest of the file (the `buildDesignPrompt` function) unchanged — it's still used by the existing pipeline until Task 4 replaces it.

- [ ] **Step 3: Update `image-stage.ts` import**

Change the import in `src/lib/blocks/image-stage.ts` from:

```typescript
import type { SectionBrief, SummitContext } from './design-prompt';
```

to:

```typescript
import type { SectionBrief, SummitContext } from './types';
```

- [ ] **Step 4: Run existing tests to verify nothing broke**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/ --reporter=verbose`

Expected: All existing tests pass. The re-exports maintain backwards compatibility.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/lib/blocks/types.ts next-app/src/lib/blocks/design-prompt.ts next-app/src/lib/blocks/image-stage.ts
git commit -m "refactor: move pipeline types from design-prompt.ts to types.ts"
```

---

### Task 2: Create Component Registry

**Files:**
- Create: `src/lib/blocks/component-registry.ts`
- Create: `src/lib/blocks/__tests__/component-registry.test.ts`

The component registry is a structured text document injected into Claude's prompt during Stage 2. It replaces the hardcoded `DESIGN_SYSTEM` string and tells Claude exactly what components exist, how to use them, and what constraints to follow.

- [ ] **Step 1: Write the test**

Create `src/lib/blocks/__tests__/component-registry.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buildComponentRegistry } from '../component-registry';

const styleBrief = {
  palette: {
    primary: '#704fe6',
    primary_text: '#ffffff',
    accent: '#d4a843',
    background: '#ffffff',
    surface: '#f5f0ff',
    text: '#1a1a2e',
    text_muted: '#6b7280',
    border: '#e5e7eb',
  },
  typography: {
    heading_font: 'Poppins',
    body_font: 'Inter',
    heading_weight: '700',
    scale: 'large',
  },
  components: {
    button_shape: 'pill',
    button_weight: 'bold',
    card_style: 'elevated',
    card_radius: '12px',
  },
  rhythm: {
    section_padding: '75px',
    max_width: '1120px',
    density: 'comfortable',
  },
  voice: {
    tone: 'warm',
    headline_style: 'benefit-driven',
  },
};

describe('buildComponentRegistry', () => {
  it('includes primitives section with all 8 UI components', () => {
    const registry = buildComponentRegistry(styleBrief);
    expect(registry).toContain('@/components/ui/button');
    expect(registry).toContain('@/components/ui/card');
    expect(registry).toContain('@/components/ui/accordion');
    expect(registry).toContain('@/components/ui/input');
    expect(registry).toContain('@/components/ui/label');
    expect(registry).toContain('@/components/ui/select');
    expect(registry).toContain('@/components/ui/separator');
    expect(registry).toContain('@/components/ui/textarea');
  });

  it('includes design tokens from style brief palette', () => {
    const registry = buildComponentRegistry(styleBrief);
    expect(registry).toContain('#704fe6');
    expect(registry).toContain('#d4a843');
    expect(registry).toContain('#f5f0ff');
  });

  it('includes typography tokens from style brief', () => {
    const registry = buildComponentRegistry(styleBrief);
    expect(registry).toContain('Poppins');
    expect(registry).toContain('Inter');
  });

  it('includes layout rules with max-width and padding', () => {
    const registry = buildComponentRegistry(styleBrief);
    expect(registry).toContain('max-w-[1120px]');
    expect(registry).toContain('py-[75px]');
  });

  it('includes anti-patterns section', () => {
    const registry = buildComponentRegistry(styleBrief);
    expect(registry).toContain('Do NOT import lucide-react');
    expect(registry).toContain('Do NOT use useState');
  });

  it('uses fallback values when style brief fields are missing', () => {
    const registry = buildComponentRegistry({});
    expect(registry).toContain('max-w-[1120px]');
    expect(registry).toContain('py-[75px]');
    // Should still produce valid output, just with generic tokens
    expect(registry).toContain('Primitives');
    expect(registry).toContain('Anti-Patterns');
  });

  it('includes button shape from components config', () => {
    const registry = buildComponentRegistry(styleBrief);
    expect(registry).toContain('rounded-full');
  });

  it('includes alternating background instruction', () => {
    const registry = buildComponentRegistry(styleBrief);
    // Should reference both background and surface colors for alternation
    expect(registry).toContain('#ffffff');
    expect(registry).toContain('#f5f0ff');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/component-registry.test.ts --reporter=verbose`

Expected: FAIL — module `../component-registry` not found.

- [ ] **Step 3: Implement `component-registry.ts`**

Create `src/lib/blocks/component-registry.ts`:

```typescript
/**
 * Builds a structured prompt context document from a style brief.
 * Injected into Claude's context during Stage 2 (code generation).
 * Replaces the hardcoded DESIGN_SYSTEM string.
 */
export function buildComponentRegistry(styleBrief: Record<string, unknown>): string {
  const palette = (styleBrief.palette ?? {}) as Record<string, string>;
  const typography = (styleBrief.typography ?? {}) as Record<string, string>;
  const components = (styleBrief.components ?? {}) as Record<string, string>;
  const rhythm = (styleBrief.rhythm ?? {}) as Record<string, string>;

  const primary = palette.primary ?? '#6366f1';
  const primaryText = palette.primary_text ?? '#ffffff';
  const accent = palette.accent ?? '#f59e0b';
  const background = palette.background ?? '#ffffff';
  const surface = palette.surface ?? '#f5f5f5';
  const text = palette.text ?? '#1a1a2e';
  const textMuted = palette.text_muted ?? '#6b7280';
  const border = palette.border ?? '#e5e7eb';

  const headingFont = typography.heading_font ?? 'Poppins';
  const bodyFont = typography.body_font ?? 'Inter';
  const headingWeight = typography.heading_weight ?? '700';

  const buttonShape = components.button_shape === 'pill' ? 'rounded-full' : 'rounded-lg';
  const cardRadius = components.card_radius ?? '12px';

  const sectionPadding = rhythm.section_padding ?? '75px';
  const maxWidth = rhythm.max_width ?? '1120px';

  return [
    `=== Component Registry ===`,
    ``,
    `## Primitives`,
    ``,
    `Available imports (ONLY these — no other packages):`,
    ``,
    `  Button:`,
    `    module: "@/components/ui/button"`,
    `    exports: [Button]`,
    `    props: variant ("default"|"destructive"|"outline"|"secondary"|"ghost"|"link"), size ("default"|"sm"|"lg"|"icon"), asChild`,
    `    usage: <Button variant="default" size="lg">Click me</Button>`,
    ``,
    `  Card:`,
    `    module: "@/components/ui/card"`,
    `    exports: [Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter]`,
    `    usage: <Card><CardHeader><CardTitle>Title</CardTitle></CardHeader><CardContent>Body</CardContent></Card>`,
    ``,
    `  Accordion:`,
    `    module: "@/components/ui/accordion"`,
    `    exports: [Accordion, AccordionItem, AccordionTrigger, AccordionContent]`,
    `    usage: <Accordion type="single" collapsible><AccordionItem value="item-1"><AccordionTrigger>Q</AccordionTrigger><AccordionContent>A</AccordionContent></AccordionItem></Accordion>`,
    ``,
    `  Input:`,
    `    module: "@/components/ui/input"`,
    `    exports: [Input]`,
    `    usage: <Input type="email" placeholder="Enter email" />`,
    ``,
    `  Label:`,
    `    module: "@/components/ui/label"`,
    `    exports: [Label]`,
    `    usage: <Label htmlFor="email">Email</Label>`,
    ``,
    `  Select:`,
    `    module: "@/components/ui/select"`,
    `    exports: [Select, SelectContent, SelectItem, SelectTrigger, SelectValue]`,
    `    usage: <Select><SelectTrigger><SelectValue placeholder="Pick" /></SelectTrigger><SelectContent><SelectItem value="a">A</SelectItem></SelectContent></Select>`,
    ``,
    `  Separator:`,
    `    module: "@/components/ui/separator"`,
    `    exports: [Separator]`,
    `    usage: <Separator className="my-4" />`,
    ``,
    `  Textarea:`,
    `    module: "@/components/ui/textarea"`,
    `    exports: [Textarea]`,
    `    usage: <Textarea placeholder="Message" rows={4} />`,
    ``,
    `## Design Tokens`,
    ``,
    `  Colors (use inline hex — no CSS variables):`,
    `    primary: ${primary}`,
    `    primary_text: ${primaryText}`,
    `    accent: ${accent}`,
    `    background: ${background}`,
    `    surface: ${surface}`,
    `    text: ${text}`,
    `    text_muted: ${textMuted}`,
    `    border: ${border}`,
    ``,
    `  Typography:`,
    `    heading: font-['${headingFont}'] font-[${headingWeight}]`,
    `    body: font-['${bodyFont}']`,
    `    Heading hierarchy: H1 text-5xl, H2 text-4xl, H3 text-2xl, body text-lg`,
    ``,
    `  Spacing:`,
    `    section padding: py-[${sectionPadding}] px-5`,
    `    max-width: max-w-[${maxWidth}] mx-auto`,
    `    card padding: p-8`,
    ``,
    `  Buttons:`,
    `    shape: ${buttonShape}`,
    `    primary: bg-[${primary}] text-[${primaryText}] font-bold px-8 py-4`,
    `    secondary: border-2 border-[${primary}] text-[${primary}] font-bold px-8 py-4`,
    `    accent CTA: bg-[${accent}] text-white font-bold px-8 py-4`,
    ``,
    `  Cards:`,
    `    radius: rounded-[${cardRadius}]`,
    `    shadow: shadow-[0_4px_16px_rgba(0,0,0,0.06)]`,
    `    border: border border-[${border}]`,
    ``,
    `## Layout Rules`,
    ``,
    `  - Alternate section backgrounds: bg-[${background}] -> bg-[${surface}] -> bg-[${background}]`,
    `  - Odd-positioned sections use background (${background}), even use surface (${surface})`,
    `  - Hero: 2-column on desktop (text left, image/countdown right)`,
    `  - Stats: full-width grid, 3-4 columns on desktop`,
    `  - Speakers: 3-column grid with circular photos`,
    `  - NO min-h-[50vh] — sections size to content`,
    `  - Images: use gradient placeholders (from-[${primary}]/20 to-[${accent}]/20) with descriptive text`,
    ``,
    `## Anti-Patterns`,
    ``,
    `  - Do NOT import lucide-react — inline SVGs instead (24x24 viewBox, currentColor stroke)`,
    `  - Do NOT use useState, useEffect, useReducer, or any React hooks`,
    `  - Do NOT use monotone backgrounds — alternate ${background} and ${surface}`,
    `  - Do NOT leave grid cells empty — fill all slots`,
    `  - Do NOT use CSS variables (var(--xxx)) — use inline hex from Design Tokens`,
    `  - Do NOT use min-h-screen or min-h-[50vh]`,
    `  - Do NOT import any library except react and @/components/ui/*`,
  ].join('\n');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/component-registry.test.ts --reporter=verbose`

Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/lib/blocks/component-registry.ts next-app/src/lib/blocks/__tests__/component-registry.test.ts
git commit -m "feat: add component registry builder for Claude code generation context"
```

---

### Task 3: Create Claude Coder

**Files:**
- Create: `src/lib/blocks/claude-coder.ts`
- Create: `src/lib/blocks/__tests__/claude-coder.test.ts`

Claude coder takes a mockup image (optional) + component registry + section context and returns `{ jsx, fields }` via the Anthropic Messages API. It's the Stage 2 replacement for `callGemini()`.

- [ ] **Step 1: Write the test**

Create `src/lib/blocks/__tests__/claude-coder.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Anthropic SDK before importing the module under test
vi.mock('@anthropic-ai/sdk', () => {
  const create = vi.fn();
  return {
    default: vi.fn(() => ({ messages: { create } })),
  };
});

import Anthropic from '@anthropic-ai/sdk';
import { claudeGenerateCode, type ClaudeCoderInput } from '../claude-coder';

const mockCreate = vi.mocked(new Anthropic({ apiKey: 'test' }).messages.create);

const baseInput: ClaudeCoderInput = {
  registry: 'REGISTRY_STUB',
  section: { type: 'HeroWithCountdown', purpose: 'Main hero', position: 1, total: 8 },
  summit: { name: 'Test Summit', date: '2026-05-01', brandColors: {}, mode: 'light', speakers: [], toneBrief: 'warm', product: null },
  skeleton: null,
  previousSectionJsx: null,
  regenerationNote: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  process.env.ANTHROPIC_API_KEY = 'test-key';
});

describe('claudeGenerateCode', () => {
  it('returns parsed envelope on valid Claude response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify({
        jsx: 'export default function S(props) { return <section>Hello</section> }',
        fields: [{ path: 'props.headline', kind: 'text', value: 'Hello' }],
      })}],
    } as never);

    const result = await claudeGenerateCode(baseInput);
    expect(result).not.toBeNull();
    expect(result!.jsx).toContain('export default function S');
    expect(result!.fields).toHaveLength(1);
    expect(result!.fields[0].path).toBe('props.headline');
  });

  it('handles markdown-fenced JSON response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: '```json\n' + JSON.stringify({
        jsx: 'export default function S(props) { return null }',
        fields: [],
      }) + '\n```' }],
    } as never);

    const result = await claudeGenerateCode(baseInput);
    expect(result).not.toBeNull();
    expect(result!.jsx).toContain('export default function S');
  });

  it('returns null on unparseable response', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: 'I cannot help with that.' }],
    } as never);

    const result = await claudeGenerateCode(baseInput);
    expect(result).toBeNull();
  });

  it('includes mockup image in API call when provided', async () => {
    mockCreate.mockResolvedValueOnce({
      content: [{ type: 'text', text: JSON.stringify({ jsx: 'export default function S(){return null}', fields: [] }) }],
    } as never);

    await claudeGenerateCode({
      ...baseInput,
      mockupImage: { mime: 'image/png', data: 'base64data' },
    });

    const callArgs = mockCreate.mock.calls[0][0] as { messages: Array<{ content: unknown[] }> };
    const content = callArgs.messages[0].content;
    expect(content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'image' }),
      ]),
    );
  });

  it('returns null when ANTHROPIC_API_KEY is missing', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const result = await claudeGenerateCode(baseInput);
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/claude-coder.test.ts --reporter=verbose`

Expected: FAIL — module `../claude-coder` not found.

- [ ] **Step 3: Implement `claude-coder.ts`**

Create `src/lib/blocks/claude-coder.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';
import type { SectionBrief, SummitContext } from './types';

const CLAUDE_MODEL = process.env.CLAUDE_CODER_MODEL ?? 'claude-sonnet-4-20250514';

export interface ClaudeCoderInput {
  registry: string;
  section: SectionBrief;
  summit: SummitContext;
  mockupImage?: { mime: string; data: string } | null;
  skeleton: string | null;
  previousSectionJsx: string | null;
  regenerationNote: string | null;
  currentJsx?: string;
}

export interface ClaudeCoderResult {
  jsx: string;
  fields: Array<{ path: string; kind: string; value: unknown }>;
}

const RUNTIME_EXAMPLE = `{
  "jsx": "export default function S(props) {\\n  return (\\n    <section className=\\"py-20 bg-white\\">\\n      <div className=\\"mx-auto max-w-3xl px-6 text-center\\">\\n        <h2 className=\\"text-4xl font-bold tracking-tight\\">{props.headline}</h2>\\n        <p className=\\"mt-4 text-lg text-gray-600\\">{props.subheadline}</p>\\n        <a href={props.ctaHref} className=\\"mt-8 inline-block rounded-md bg-indigo-600 px-6 py-3 text-white font-semibold\\">{props.ctaLabel}</a>\\n      </div>\\n    </section>\\n  )\\n}",
  "fields": [
    { "path": "props.headline", "kind": "text", "value": "Join the Summit" },
    { "path": "props.subheadline", "kind": "text", "value": "Learn from 30+ experts in 5 days." },
    { "path": "props.ctaLabel", "kind": "text", "value": "Reserve My Free Spot" },
    { "path": "props.ctaHref", "kind": "url", "value": "#register" }
  ]
}`;

function buildPromptText(input: ClaudeCoderInput): string {
  const intro = input.mockupImage
    ? `Implement the attached mockup PNG as a single React + Tailwind v4 component. Match the mockup EXACTLY — colors, spacing, typography, layout, visual density.`
    : `Build a high-quality React + Tailwind v4 landing page section. Follow the Component Registry precisely for colors, fonts, spacing, and components.`;

  const skeletonBlock = input.skeleton
    ? [
        ``,
        `=== Layout Skeleton (MANDATORY — preserve this grid/flex structure) ===`,
        `Replace each __SLOT_xxx__ comment with styled content. Replace __bg__ with the section background color.`,
        '```',
        input.skeleton.trim(),
        '```',
      ]
    : [];

  const parts = [
    intro,
    ``,
    `Section: ${input.section.type} — ${input.section.purpose} (position ${input.section.position} of ${input.section.total})`,
    ``,
    `Summit context:`,
    JSON.stringify(input.summit, null, 2),
    ``,
    input.registry,
    ...skeletonBlock,
    ``,
    input.previousSectionJsx ? `=== Previous Section (for visual flow) ===\n${input.previousSectionJsx}` : '',
    input.currentJsx ? `=== Current JSX (regenerating — improve this) ===\n${input.currentJsx}` : '',
    input.regenerationNote ? `=== Operator Feedback ===\n${input.regenerationNote}` : '',
    ``,
    `=== Output Format ===`,
    `Return ONE JSON object with exactly two keys "jsx" and "fields". No markdown fences, no commentary:`,
    RUNTIME_EXAMPLE,
    ``,
    `=== Strict Rules ===`,
    `- "jsx": single-file component. Export default function S(props).`,
    `- Only imports: react, @/components/ui/*. Nothing else.`,
    `- For icons: inline SVG (24x24 viewBox, currentColor stroke). No lucide-react.`,
    `- No hooks (useState/useEffect/etc). No script/style tags. No dynamic imports. No fetch.`,
    `- Tailwind v4 classes only. No Framer Motion. No CSS variables.`,
    `- Apply palette hex codes inline: bg-[#704fe6], text-[#ffffff], etc.`,
    `- Font classes: font-['FontName'] with underscore for spaces (e.g. font-['Cormorant_Garamond']).`,
    `- Every editable string/URL/image MUST appear in "fields" with its props.xxx path.`,
    `- Fill ALL grid cells. No empty sections. No placeholder "coming soon" content.`,
    input.skeleton ? `- CRITICAL: Preserve the skeleton's grid/flex structure exactly. Only fill __SLOT__ placeholders.` : '',
  ].filter(Boolean).join('\n');

  return parts;
}

function parseEnvelope(text: string): ClaudeCoderResult | null {
  const trimmed = text.trim();
  const candidates: string[] = [];

  // 1. Strip markdown fences
  candidates.push(
    trimmed
      .replace(/^\s*```(?:json|javascript|typescript|tsx|ts)?\s*\n?/i, '')
      .replace(/\n?\s*```\s*$/i, '')
      .trim(),
  );

  // 2. Extract first fenced block
  const fenced = trimmed.match(/```(?:json|javascript|typescript|tsx|ts)?\s*\n?([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.push(fenced[1].trim());

  // 3. First { to last }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    candidates.push(trimmed.slice(firstBrace, lastBrace + 1));
  }

  for (const c of candidates) {
    if (!c) continue;
    try {
      const parsed = JSON.parse(c);
      if (typeof parsed?.jsx === 'string' && Array.isArray(parsed?.fields)) {
        return parsed as ClaudeCoderResult;
      }
    } catch {
      // try next
    }
  }
  return null;
}

export async function claudeGenerateCode(input: ClaudeCoderInput): Promise<ClaudeCoderResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });
  const promptText = buildPromptText(input);

  const userContent: Anthropic.MessageCreateParams['messages'][0]['content'] = [];

  if (input.mockupImage) {
    userContent.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: input.mockupImage.mime as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
        data: input.mockupImage.data,
      },
    });
  }

  userContent.push({ type: 'text', text: promptText });

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 12000,
    messages: [{ role: 'user', content: userContent }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');

  return parseEnvelope(text);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/claude-coder.test.ts --reporter=verbose`

Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/lib/blocks/claude-coder.ts next-app/src/lib/blocks/__tests__/claude-coder.test.ts
git commit -m "feat: add Claude coder for Stage 2 code generation from mockups"
```

---

### Task 4: Rewrite design-phase.ts for the multi-stage pipeline

**Files:**
- Rewrite: `src/lib/blocks/design-phase.ts`
- Rewrite: `src/lib/blocks/__tests__/design-phase.test.ts`

This is the core change. `designSection()` now orchestrates:
1. Stage 1: Generate mockup PNG via Gemini (`designSectionImage()` from `image-stage.ts`)
2. Stage 2: Generate JSX via Claude (`claudeGenerateCode()` from `claude-coder.ts`)
3. Stage 3: Validate + extract CSS (existing `validateJsx()` + `extractCss()`)

If Stage 1 (mockup) fails, Stage 2 still runs without a mockup — Claude generates from the registry + style brief alone.

- [ ] **Step 1: Write the test**

Rewrite `src/lib/blocks/__tests__/design-phase.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { designSection } from '../design-phase';

vi.mock('../image-stage', () => ({
  designSectionImage: vi.fn(),
}));
vi.mock('../claude-coder', () => ({
  claudeGenerateCode: vi.fn(),
}));
vi.mock('../validator', () => ({
  validateJsx: vi.fn(() => ({ ok: true })),
}));
vi.mock('../component-registry', () => ({
  buildComponentRegistry: vi.fn(() => 'REGISTRY_STUB'),
}));

import { designSectionImage } from '../image-stage';
import { claudeGenerateCode } from '../claude-coder';
import { validateJsx } from '../validator';

const input = {
  section: { type: 'HeroWithCountdown', purpose: 'Main hero', position: 1, total: 8 },
  summit: { name: 'Test', date: '2026-05-01', brandColors: {}, mode: 'light' as const, speakers: [], toneBrief: 'warm', product: null },
  previousSectionJsx: null,
  regenerationNote: null,
  styleBrief: { palette: { primary: '#704fe6' } },
};

beforeEach(() => vi.clearAllMocks());

describe('designSection (V3 multi-stage)', () => {
  it('generates mockup then code on happy path', async () => {
    vi.mocked(designSectionImage).mockResolvedValueOnce({ mime: 'image/png', base64: 'mockup_data' });
    vi.mocked(claudeGenerateCode).mockResolvedValueOnce({
      jsx: 'export default function S(props) { return <section>Test</section> }',
      fields: [{ path: 'props.headline', kind: 'text', value: 'Test' }],
    });

    const result = await designSection(input);
    expect(result.status).toBe('ready');
    expect(result.jsx).toContain('export default function S');
    expect(result.fields).toHaveLength(1);

    // Verify mockup was generated and passed to Claude
    expect(vi.mocked(designSectionImage)).toHaveBeenCalledOnce();
    expect(vi.mocked(claudeGenerateCode)).toHaveBeenCalledWith(
      expect.objectContaining({
        mockupImage: { mime: 'image/png', data: 'mockup_data' },
      }),
    );
  });

  it('continues without mockup when image stage fails', async () => {
    vi.mocked(designSectionImage).mockRejectedValueOnce(new Error('Gemini image timeout'));
    vi.mocked(claudeGenerateCode).mockResolvedValueOnce({
      jsx: 'export default function S(props) { return null }',
      fields: [],
    });

    const result = await designSection(input);
    expect(result.status).toBe('ready');

    // Claude called without mockup
    expect(vi.mocked(claudeGenerateCode)).toHaveBeenCalledWith(
      expect.objectContaining({
        mockupImage: null,
      }),
    );
  });

  it('retries Claude once on validation failure', async () => {
    vi.mocked(designSectionImage).mockResolvedValue({ mime: 'image/png', base64: 'data' });
    vi.mocked(claudeGenerateCode).mockResolvedValue({
      jsx: 'import bad from "lucide-react";\nexport default function S(){return null}',
      fields: [],
    });
    vi.mocked(validateJsx)
      .mockReturnValueOnce({ ok: false, error: 'forbidden import: lucide-react' })
      .mockReturnValueOnce({ ok: false, error: 'forbidden import: lucide-react' });

    const result = await designSection(input);
    expect(result.status).toBe('failed');
    expect(vi.mocked(claudeGenerateCode).mock.calls.length).toBe(2);
  });

  it('marks failed when Claude returns null', async () => {
    vi.mocked(designSectionImage).mockResolvedValue({ mime: 'image/png', base64: 'data' });
    vi.mocked(claudeGenerateCode).mockResolvedValue(null);

    const result = await designSection(input);
    expect(result.status).toBe('failed');
    expect(result.error).toContain('empty or unparseable');
  });

  it('skips image stage when mockupImage is pre-supplied', async () => {
    vi.mocked(claudeGenerateCode).mockResolvedValueOnce({
      jsx: 'export default function S(props) { return null }',
      fields: [],
    });

    const result = await designSection({
      ...input,
      mockupImage: { mime: 'image/png', data: 'pre_supplied' },
    });

    expect(result.status).toBe('ready');
    // Image stage should NOT be called when mockup is pre-supplied
    expect(vi.mocked(designSectionImage)).not.toHaveBeenCalled();
    expect(vi.mocked(claudeGenerateCode)).toHaveBeenCalledWith(
      expect.objectContaining({
        mockupImage: { mime: 'image/png', data: 'pre_supplied' },
      }),
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/design-phase.test.ts --reporter=verbose`

Expected: FAIL — tests expect new behavior but `design-phase.ts` still uses old Gemini flow.

- [ ] **Step 3: Rewrite `design-phase.ts`**

Replace the entire contents of `src/lib/blocks/design-phase.ts`:

```typescript
import { designSectionImage } from './image-stage';
import { claudeGenerateCode } from './claude-coder';
import { buildComponentRegistry } from './component-registry';
import { validateJsx } from './validator';
import { makeSection, type Section, type SectionField, type BuildDesignPromptInput } from './types';
import { extractCss } from './css-extractor';
import { loadSkeleton } from '../skeletons';

export async function designSection(input: BuildDesignPromptInput): Promise<Section> {
  const styleBrief = (input.styleBrief ?? {}) as Record<string, unknown>;
  const registry = buildComponentRegistry(styleBrief);
  const skel = await loadSkeleton(input.section.type);

  // Stage 1: Mockup image (Gemini) — skip if pre-supplied, gracefully fail
  let mockupImage: { mime: string; data: string } | null = input.mockupImage ?? null;

  if (!mockupImage && styleBrief && Object.keys(styleBrief).length > 0) {
    try {
      const result = await designSectionImage({
        section: input.section,
        summit: input.summit,
        styleBrief,
        referenceImage: input.referenceImage,
      });
      mockupImage = { mime: result.mime, data: result.base64 };
    } catch {
      // Stage 1 failed — continue without mockup
      mockupImage = null;
    }
  }

  // Stage 2 + 3: Claude code generation + validation (with retry)
  let lastError = '';

  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await claudeGenerateCode({
      registry,
      section: input.section,
      summit: input.summit,
      mockupImage,
      skeleton: skel?.skeleton ?? null,
      previousSectionJsx: input.previousSectionJsx,
      regenerationNote: attempt > 0 && lastError
        ? `${input.regenerationNote ?? ''}\nPrevious attempt failed validation: ${lastError}`
        : input.regenerationNote,
      currentJsx: input.currentJsx,
    });

    if (!result) {
      lastError = 'Claude returned empty or unparseable response';
      continue;
    }

    const v = validateJsx(result.jsx);
    if (!v.ok) {
      lastError = v.error ?? 'validator rejected';
      continue;
    }

    const css = await extractCss(result.jsx);
    return makeSection({
      type: input.section.type,
      jsx: result.jsx,
      fields: result.fields as SectionField[],
      css,
    });
  }

  return {
    ...makeSection({ type: input.section.type, jsx: '', fields: [] }),
    status: 'failed',
    error: lastError,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/design-phase.test.ts --reporter=verbose`

Expected: All 5 tests PASS.

- [ ] **Step 5: Run the full test suite to check for regressions**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/ --reporter=verbose`

Expected: All tests pass. The API routes import `designSection` from `design-phase.ts` — its signature is unchanged (`BuildDesignPromptInput => Promise<Section>`), so no route changes needed.

- [ ] **Step 6: Commit**

```bash
git add next-app/src/lib/blocks/design-phase.ts next-app/src/lib/blocks/__tests__/design-phase.test.ts
git commit -m "feat: rewrite design phase to use Gemini mockup + Claude code pipeline"
```

---

### Task 5: Clean up deprecated design-prompt.ts

**Files:**
- Modify: `src/lib/blocks/design-prompt.ts`

The mega-prompt builder is no longer used by the main flow. Mark it as deprecated and remove unused imports. The `buildDesignPrompt` function can stay for now (backward compatibility with any scripts or manual testing), but the main pipeline no longer calls it.

- [ ] **Step 1: Simplify `design-prompt.ts`**

Replace the contents of `src/lib/blocks/design-prompt.ts` with:

```typescript
/**
 * @deprecated V3 pipeline no longer uses this module for the main generation flow.
 * Types moved to ./types.ts. Code generation now uses ./claude-coder.ts.
 * Kept for backward compatibility with scripts or manual testing.
 */

export type { SectionBrief, SummitContext, BuildDesignPromptInput, DesignPrompt } from './types';

// The buildDesignPrompt function is preserved below for backward compat.
// New code should NOT import this — use claudeGenerateCode() instead.

import { loadDesignSystem, loadPrimitiveSources, loadReferenceImage } from '../../../scripts/lib/prompt-parts';
import { loadSkeleton } from '../skeletons';
import type { BuildDesignPromptInput, DesignPrompt } from './types';

const RUNTIME_EXAMPLE = `{
  "jsx": "export default function S(props) {\\n  return (\\n    <section className=\\"py-20 bg-white\\">\\n      <div className=\\"mx-auto max-w-3xl px-6 text-center\\">\\n        <h2 className=\\"text-4xl font-bold tracking-tight\\">{props.headline}</h2>\\n      </div>\\n    </section>\\n  )\\n}",
  "fields": [
    { "path": "props.headline", "kind": "text", "value": "Join the Summit" }
  ]
}`;

/** @deprecated Use claudeGenerateCode() from ./claude-coder.ts instead. */
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
    ? `You are an expert React + Tailwind v4 developer. Implement the attached mockup PNG as a single React component. Match the mockup EXACTLY.`
    : `You are an expert React + Tailwind v4 developer designing ONE landing-page section.`;

  const text = [
    intro,
    `Section: ${input.section.type} — ${input.section.purpose} (position ${input.section.position} of ${input.section.total})`,
    JSON.stringify(input.summit, null, 2),
    input.styleBrief ? JSON.stringify(input.styleBrief, null, 2) : '',
    skel ? skel.skeleton : '',
    designSystem,
    primitives,
    input.previousSectionJsx ?? '',
    input.currentJsx ?? '',
    input.regenerationNote ?? '',
    RUNTIME_EXAMPLE,
  ].filter(Boolean).join('\n\n');

  return anchor ? { text, image: anchor } : { text };
}
```

- [ ] **Step 2: Run the design-prompt test to ensure re-exports work**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/design-prompt.test.ts --reporter=verbose`

Expected: Tests pass (the function still works, just deprecated).

- [ ] **Step 3: Commit**

```bash
git add next-app/src/lib/blocks/design-prompt.ts
git commit -m "refactor: deprecate design-prompt.ts — V3 uses claude-coder.ts instead"
```

---

### Task 6: Integration verification

**Files:** None modified — this is manual verification.

- [ ] **Step 1: Run the full block test suite**

Run: `cd next-app && npx vitest run src/lib/blocks/__tests__/ --reporter=verbose`

Expected: All tests pass (component-registry, claude-coder, design-phase, design-prompt, validator, css-extractor, field-extractor, jsx-compile, renderer, publisher, types).

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd next-app && npx tsc --noEmit 2>&1 | head -30`

Expected: No type errors in the modified/created files. If there are errors in unrelated files, note them but they're pre-existing.

- [ ] **Step 3: Verify the generate endpoint can receive requests**

Start the dev server and make a test request:

```bash
cd next-app && pnpm dev &
sleep 5

# Test with curl — should return a section (may fail on missing API keys, that's OK)
curl -s -X POST http://localhost:3000/api/sections/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INTERNAL_API_TOKEN" \
  -d '{
    "section": {"type": "HeroWithCountdown", "purpose": "Main hero", "position": 1, "total": 8},
    "summit": {"name": "Test Summit", "date": "2026-05-01", "brandColors": {}, "mode": "light", "speakers": [], "toneBrief": "warm", "product": null},
    "styleBrief": {"palette": {"primary": "#704fe6", "background": "#ffffff", "surface": "#f5f0ff"}}
  }'
```

Expected: Returns a JSON `Section` object. If `ANTHROPIC_API_KEY` is set, it should have `status: "ready"` with actual JSX. If not set, `status: "failed"` with an error about the missing key.

- [ ] **Step 4: Commit final state**

If any fixes were needed during integration, commit them:

```bash
git add -A
git commit -m "fix: integration fixes for V3 multi-stage pipeline"
```

---

## Summary of Changes

| Before (V2) | After (V3) |
|---|---|
| Gemini writes JSX from scratch | Gemini generates mockup PNG, Claude writes JSX from mockup |
| Hardcoded `DESIGN_SYSTEM` string | Dynamic `buildComponentRegistry()` from style brief |
| Single model does everything | Each model does what it's best at |
| design-prompt.ts builds mega-prompt for Gemini | claude-coder.ts builds targeted prompt for Claude |
| ~$0.50/page (all Gemini) | ~$1.12/page (Gemini images + Claude code) |

**What stays unchanged:** CSS extractor, renderer, field extractor, JSX compiler, validator, primitive resolver, skeletons, API route signatures, preview page, Filament editor.
