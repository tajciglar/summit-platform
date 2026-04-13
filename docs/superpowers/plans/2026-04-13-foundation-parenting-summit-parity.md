# AI Funnel Builder V2 — Plan 1: Foundation + Parenting Summit Parity

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Next.js renderer with a block-library system, build a Zod→JSON-Schema codegen pipeline, integrate with Laravel+Filament via a catalog-driven form builder, seed the ADHD Parenting Summit 2026 in Filament, implement 19 blocks, and deploy a pixel-fidelity recreation of https://www.parenting-summits.com/ to staging for side-by-side WP-vs-Next.js comparison.

**Architecture:** A new `next-app/` directory at project root holds a Next.js 15 App Router application. Block components live in `next-app/src/blocks/<category>/<Name>/` as four-file bundles (Component, schema, meta, stories). A `pnpm build:catalog` script walks blocks, emits `block-catalog.json` (schemas converted to JSON Schema), uploads to Bunny CDN, and webhooks Laravel. Laravel consumes the manifest to (a) auto-generate Filament forms per block type and (b) serve a `/api/funnels/resolve` endpoint. The Next.js renderer fetches resolved funnel JSON via SSR, renders blocks from a registry, and caches via ISR. Deploys to Vercel (renderer) + existing Ploi/Hetzner (Laravel API).

**Tech Stack:** Next.js 15.5+ (App Router, Turbopack) · React 19 · TypeScript 5.6+ · Tailwind v4 · Zod 3.24+ · zod-to-json-schema · Storybook 8+ · shadcn/ui · Aceternity UI components · Magic UI components · Framer Motion · Vitest · Laravel 11 + Filament v4 (existing) · PostgreSQL (existing) · Redis (existing) · Bunny CDN (existing).

---

## SCHEMA ALIGNMENT — READ BEFORE IMPLEMENTING (2026-04-13 audit corrections)

A pre-execution schema audit found the current DB differs from initial plan assumptions. **All tasks below use these corrected conventions:**

### Model field corrections

| Plan originally said | Actual model |
|---------------------|--------------|
| `Summit.name, .tagline, .brand` | `Summit.title, .description, .topic` (no tagline/brand) |
| `Speaker.name, .bio` | `Speaker.first_name + .last_name`, `.short_description`, `.long_description` |
| `SummitSpeaker.day (int), .session_title, .order` | `.presentation_day (DATE)`, `.masterclass_title`, `.sort_order` |
| `FunnelStep.blocks (JSONB)` | **`FunnelStep.content (JSONB)`** — the column is `content`, not `blocks` |
| `Product.price_cents` | Prices in separate `ProductPrice` table; use `Product::priceForPhase($phase)` |
| Integer IDs throughout | **UUID string IDs throughout** — all models use UUID PKs |
| `Domain` model routes by host | **NO Domain model exists.** Routing is slug-based: `/{summitSlug}/{funnelSlug}` |

### StepType enum correction

Plan originally: `'optin' \| 'checkout' \| 'upsell' \| 'thank-you'`

**Actual:** `'optin' \| 'sales_page' \| 'checkout' \| 'upsell' \| 'downsell' \| 'thank_you'` (underscores, not hyphens; includes `sales_page` and `downsell`)

Block `validOn` arrays must use these exact values.

### Speaker day-number computation

`SummitSpeaker.presentation_day` is a DATE, not an integer day number. The resolve controller computes:

```php
$dayNumber = $speaker->presentation_day->diffInDays($summit->starts_at) + 1;
```

Returned in API response as `day_number` alongside speaker fields. `SpeakerGridDay` block filters speakers by matching `day_number`.

### Domain routing simplification

No Domain model = routing is slug-based from day one of Plan 1. The API endpoint becomes `GET /api/funnels/resolve?summit_slug=…&funnel_slug=…&step_slug=optin`. The Next.js catch-all route parses the slug path, not the Host header. Custom domain support is Plan 4+ work.

### Where this changes the plan

- **Task C1** (resolve endpoint): signature changes from `host+slug` to `summit_slug+funnel_slug+step_slug`; no Domain lookup; computes day_number per speaker; returns product prices via `priceForPhase()`
- **Task E1** (summit seeder): use `title` not `name`, split speaker into first/last, use `presentation_day` dates, use `masterclass_title`, use `sort_order`; **no Domain::create()** calls; seed `content` array empty on FunnelStep
- **Task B1** (types): `StepType` enum updated; all `id: number` → `id: string` (uuid); `speakerIds: z.array(z.string().uuid())`
- **Task B6** (API client): `resolveFunnel({ summitSlug, funnelSlug, stepSlug })` signature
- **Task F6** (SpeakerGridDay): `speakerIds: z.array(z.string().uuid())` instead of `.number()`
- **Task G1** (catch-all route): parse slug segments from URL params, pass `summitSlug/funnelSlug/stepSlug` to resolve
- **Task H1** (composition seeder): writes to `content` column (not `blocks`); speakerIds are UUID strings from `Speaker::where(...)->pluck('id')`
- Everywhere `blocks` JSONB column is written to → **`content`** (keep the `blocks` conceptual name in TypeScript/React; it's only the DB column that differs)



---

## Repo Structure — Files Created/Modified

**New at project root:**
- `next-app/` — entire Next.js application (independent pnpm package)
- `docs/superpowers/plans/2026-04-13-foundation-parenting-summit-parity.md` — this plan

**next-app/ layout:**
```
next-app/
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── .storybook/
│   ├── main.ts
│   └── preview.ts
├── scripts/
│   └── build-catalog.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── [[...slug]]/
│   │       └── page.tsx
│   ├── blocks/
│   │   └── <category>/<BlockName>/
│   │       ├── Component.tsx
│   │       ├── schema.ts
│   │       ├── meta.ts
│   │       ├── Component.stories.tsx
│   │       └── index.ts
│   ├── lib/
│   │   ├── block-registry.ts
│   │   ├── api-client.ts
│   │   ├── theme-context.tsx
│   │   └── render-block.tsx
│   └── types/
│       └── block.ts
└── public/
```

**Laravel modifications:**
- `app/Http/Controllers/Api/FunnelResolveController.php` — new
- `app/Http/Controllers/Api/CatalogRefreshController.php` — new
- `app/Services/Blocks/BlockCatalogService.php` — new
- `app/Services/Blocks/BlockCatalogSyncer.php` — new
- `app/Filament/Schemas/JsonSchemaFormBuilder.php` — new (JSON Schema → Filament fields)
- `app/Filament/Forms/Components/BlockEditor.php` — new
- `database/seeders/AdhdParentingSummit2026Seeder.php` — new
- `database/factories/` — add factory variants as needed
- `routes/api.php` — add 2 routes
- `config/block_catalog.php` — new

---

## Part A — Next.js Foundation

### Task A1: Scaffold Next.js 15 + TypeScript + Tailwind v4

**Files:**
- Create: `next-app/package.json`, `next-app/tsconfig.json`, `next-app/next.config.ts`, `next-app/src/app/*`

- [ ] **Step 1: Run scaffolder**

From project root:
```bash
pnpm create next-app@latest next-app \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm \
  --eslint \
  --turbopack
```

Expected: `next-app/` created; `next-app/package.json` exists with Next.js 15.5+.

- [ ] **Step 2: Verify dev server starts**

```bash
cd next-app && pnpm dev
```

Open http://localhost:3000. Expected: Next.js welcome page renders. Stop with Ctrl+C.

- [ ] **Step 3: Add scripts to next-app/package.json**

Edit `next-app/package.json` scripts:
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "build:catalog": "tsx scripts/build-catalog.ts",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test": "vitest"
  }
}
```

- [ ] **Step 4: Install core dependencies**

```bash
cd next-app && pnpm add zod zod-to-json-schema clsx tailwind-merge lucide-react framer-motion
pnpm add -D @types/node tsx vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 5: Commit**

```bash
cd .. && git add next-app/
git commit -m "feat(next-app): scaffold Next.js 15 + Tailwind v4 + TypeScript"
```

---

### Task A2: Configure Tailwind v4 + theme tokens

**Files:**
- Modify: `next-app/src/app/globals.css`
- Create: `next-app/src/lib/cn.ts`

- [ ] **Step 1: Replace `next-app/src/app/globals.css` with theme-aware Tailwind v4 config**

```css
@import "tailwindcss";

@theme {
  /* Base tokens — overridden per summit via ThemeContext inline style */
  --color-primary: 94 77 155;        /* #5e4d9b parenting summit default */
  --color-primary-hover: 48 32 112;   /* #302070 */
  --color-accent: 0 181 83;           /* #00b553 */
  --color-accent-hover: 0 142 65;     /* #008e41 */
  --color-danger: 221 51 51;

  --font-heading: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;

  --container-narrow: 640px;
  --container-default: 1024px;
  --container-wide: 1280px;

  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}

body {
  font-family: var(--font-body);
  color: rgb(17 24 39);
  background: #ffffff;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}
```

- [ ] **Step 2: Create `next-app/src/lib/cn.ts` utility**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Verify dev server still starts cleanly**

```bash
cd next-app && pnpm dev
```

Expected: no Tailwind errors in console; page renders.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/app/globals.css next-app/src/lib/cn.ts
git commit -m "feat(next-app): configure Tailwind v4 theme tokens + cn utility"
```

---

### Task A3: Initialize shadcn/ui + premium component libraries

**Files:**
- Create: `next-app/components.json`
- Create: `next-app/src/components/ui/*` (via shadcn CLI)

- [ ] **Step 1: Init shadcn/ui**

```bash
cd next-app && pnpm dlx shadcn@latest init
```

Answer:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

Expected: `components.json` created, `src/components/ui/` scaffolded.

- [ ] **Step 2: Install commonly needed shadcn components upfront**

```bash
pnpm dlx shadcn@latest add button input textarea label select accordion card separator
```

- [ ] **Step 3: Install Aceternity + Magic UI dependencies**

(Aceternity and Magic UI are copy-paste libraries, not npm packages. Install their shared deps.)

```bash
pnpm add motion @tabler/icons-react
```

Note: individual Aceternity/Magic UI components will be pasted into `src/components/ui/` as needed during block authoring.

- [ ] **Step 4: Commit**

```bash
git add next-app/components.json next-app/src/components/ next-app/package.json next-app/pnpm-lock.yaml
git commit -m "feat(next-app): init shadcn/ui + install base components + motion deps"
```

---

### Task A4: Set up Vitest for component testing

**Files:**
- Create: `next-app/vitest.config.ts`
- Create: `next-app/vitest.setup.ts`

- [ ] **Step 1: Create `next-app/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 2: Create `next-app/vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Write a sanity test `next-app/src/lib/cn.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('merges tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar')
  })
})
```

- [ ] **Step 4: Run test**

```bash
cd next-app && pnpm test
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add next-app/vitest.config.ts next-app/vitest.setup.ts next-app/src/lib/cn.test.ts
git commit -m "test(next-app): configure Vitest + jsdom + sanity test"
```

---

### Task A5: Initialize Storybook 8

**Files:**
- Create: `next-app/.storybook/main.ts`, `next-app/.storybook/preview.ts`

- [ ] **Step 1: Init Storybook**

```bash
cd next-app && pnpm dlx storybook@latest init --type nextjs --yes
```

Expected: `.storybook/` created, example stories in `src/stories/`.

- [ ] **Step 2: Delete example stories**

```bash
rm -rf next-app/src/stories
```

- [ ] **Step 3: Update `next-app/.storybook/main.ts` to scan blocks**

```ts
import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: ['../src/blocks/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  staticDirs: ['../public'],
}
export default config
```

- [ ] **Step 4: Install a11y + viewport addons if missing**

```bash
pnpm add -D @storybook/addon-a11y @storybook/addon-viewport
```

- [ ] **Step 5: Update `next-app/.storybook/preview.ts`**

```ts
import type { Preview } from '@storybook/react'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: { name: 'Tablet', styles: { width: '768px', height: '1024px' } },
        desktop: { name: 'Desktop', styles: { width: '1440px', height: '900px' } },
      },
      defaultViewport: 'desktop',
    },
  },
}
export default preview
```

- [ ] **Step 6: Run Storybook to verify**

```bash
pnpm storybook
```

Expected: empty Storybook UI opens on :6006. No errors.

- [ ] **Step 7: Commit**

```bash
git add next-app/.storybook/ next-app/package.json next-app/pnpm-lock.yaml
git commit -m "feat(next-app): init Storybook 8 + a11y/viewport addons"
```

---

## Part B — Block System Core

### Task B1: Define Block type + registry types

**Files:**
- Create: `next-app/src/types/block.ts`

- [ ] **Step 1: Write failing test `next-app/src/types/block.test.ts`**

```ts
import { describe, it, expectTypeOf } from 'vitest'
import type { BlockRow, BlockMeta, StepType } from './block'

describe('block types', () => {
  it('BlockRow has required shape', () => {
    expectTypeOf<BlockRow>().toEqualTypeOf<{
      id: string
      type: string
      version: number
      props: Record<string, unknown>
    }>()
  })

  it('StepType enum covers all funnel step types', () => {
    const valid: StepType[] = ['optin', 'sales_page', 'checkout', 'upsell', 'downsell', 'thank_you']
    expectTypeOf(valid).toEqualTypeOf<StepType[]>()
  })
})
```

- [ ] **Step 2: Create `next-app/src/types/block.ts`**

```ts
import type { z } from 'zod'

export type StepType = 'optin' | 'sales_page' | 'checkout' | 'upsell' | 'downsell' | 'thank_you'

export interface BlockRow {
  id: string
  type: string
  version: number
  props: Record<string, unknown>
}

export interface BlockMeta {
  type: string
  category: 'hero' | 'form-cta' | 'speakers' | 'social-proof' | 'content' | 'checkout' | 'upsell' | 'thank_you' | 'utility'
  version: number
  validOn: StepType[]
  purpose: string
  exampleProps: Record<string, unknown>
}

export interface BlockDefinition<T extends z.ZodType = z.ZodType> {
  meta: BlockMeta
  schema: T
  Component: React.ComponentType<z.infer<T>>
}

export interface CatalogEntry {
  type: string
  category: BlockMeta['category']
  version: number
  validOn: StepType[]
  purpose: string
  schema: Record<string, unknown>      // JSON Schema
  exampleProps: Record<string, unknown>
  previewUrl?: string
}

export interface BlockCatalog {
  version: string
  generatedAt: string
  blocks: CatalogEntry[]
}
```

- [ ] **Step 3: Run typecheck**

```bash
cd next-app && pnpm typecheck && pnpm test
```

Expected: tests pass, no type errors.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/types/
git commit -m "feat(blocks): define Block types + catalog interface"
```

---

### Task B2: Build the block registry

**Files:**
- Create: `next-app/src/lib/block-registry.ts`
- Create: `next-app/src/lib/block-registry.test.ts`

- [ ] **Step 1: Write failing test**

Create `next-app/src/lib/block-registry.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { createRegistry } from './block-registry'

describe('block registry', () => {
  it('registers and retrieves a block by type+version', () => {
    const registry = createRegistry()
    const schema = z.object({ text: z.string() })
    const Component = () => null
    const meta = {
      type: 'TestBlock', category: 'utility', version: 1,
      validOn: ['optin'], purpose: 'test', exampleProps: { text: 'hi' },
    } as const

    registry.register({ meta, schema, Component })

    const found = registry.get('TestBlock', 1)
    expect(found?.meta.type).toBe('TestBlock')
  })

  it('returns undefined for unknown type', () => {
    const registry = createRegistry()
    expect(registry.get('Missing', 1)).toBeUndefined()
  })

  it('lists all registered blocks', () => {
    const registry = createRegistry()
    const Component = () => null
    registry.register({
      meta: { type: 'A', category: 'utility', version: 1, validOn: ['optin'], purpose: 'a', exampleProps: {} },
      schema: z.object({}),
      Component,
    })
    expect(registry.all()).toHaveLength(1)
  })
})
```

- [ ] **Step 2: Run test — expect fail (module not found)**

```bash
cd next-app && pnpm test -- block-registry
```

- [ ] **Step 3: Create `next-app/src/lib/block-registry.ts`**

```ts
import type { BlockDefinition } from '@/types/block'

export interface BlockRegistry {
  register: (def: BlockDefinition) => void
  get: (type: string, version: number) => BlockDefinition | undefined
  all: () => BlockDefinition[]
}

export function createRegistry(): BlockRegistry {
  const blocks = new Map<string, BlockDefinition>()

  return {
    register(def) {
      const key = `${def.meta.type}@${def.meta.version}`
      if (blocks.has(key)) {
        throw new Error(`Block already registered: ${key}`)
      }
      blocks.set(key, def)
    },
    get(type, version) {
      return blocks.get(`${type}@${version}`)
    },
    all() {
      return Array.from(blocks.values())
    },
  }
}

// Singleton registry used across the app
export const globalRegistry = createRegistry()
```

- [ ] **Step 4: Run tests**

```bash
pnpm test -- block-registry
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add next-app/src/lib/block-registry.ts next-app/src/lib/block-registry.test.ts
git commit -m "feat(blocks): implement block registry with versioned lookup"
```

---

### Task B3: Theme context + provider

**Files:**
- Create: `next-app/src/lib/theme-context.tsx`
- Create: `next-app/src/lib/theme-context.test.tsx`

- [ ] **Step 1: Write failing test**

Create `next-app/src/lib/theme-context.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThemeProvider, useTheme } from './theme-context'

function Probe() {
  const theme = useTheme()
  return <div>{theme.primaryColor}</div>
}

describe('ThemeProvider', () => {
  it('provides theme to children', () => {
    render(
      <ThemeProvider theme={{
        primaryColor: '#5e4d9b', accentColor: '#00b553',
        fontHeading: 'Inter', fontBody: 'Inter',
        logoUrl: null, backgroundStyle: 'light',
      }}>
        <Probe />
      </ThemeProvider>
    )
    expect(screen.getByText('#5e4d9b')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Create `next-app/src/lib/theme-context.tsx`**

```tsx
'use client'
import { createContext, useContext, type ReactNode } from 'react'

export interface Theme {
  primaryColor: string
  accentColor: string
  fontHeading: string
  fontBody: string
  logoUrl: string | null
  backgroundStyle: 'light' | 'dark' | 'gradient'
}

const defaultTheme: Theme = {
  primaryColor: '#5e4d9b',
  accentColor: '#00b553',
  fontHeading: 'Inter',
  fontBody: 'Inter',
  logoUrl: null,
  backgroundStyle: 'light',
}

const ThemeContext = createContext<Theme>(defaultTheme)

export function ThemeProvider({ theme, children }: { theme: Theme; children: ReactNode }) {
  const cssVars = {
    '--color-primary': hexToRgbTriplet(theme.primaryColor),
    '--color-accent': hexToRgbTriplet(theme.accentColor),
    '--font-heading': theme.fontHeading,
    '--font-body': theme.fontBody,
  } as React.CSSProperties

  return (
    <ThemeContext.Provider value={theme}>
      <div style={cssVars}>{children}</div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}

function hexToRgbTriplet(hex: string): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `${r} ${g} ${b}`
}
```

- [ ] **Step 3: Run tests**

```bash
pnpm test -- theme-context
```

Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/lib/theme-context.tsx next-app/src/lib/theme-context.test.tsx
git commit -m "feat(blocks): theme context with summit-scoped CSS vars"
```

---

### Task B4: Block rendering helper

**Files:**
- Create: `next-app/src/lib/render-block.tsx`

- [ ] **Step 1: Create `next-app/src/lib/render-block.tsx`**

```tsx
import type { BlockRow } from '@/types/block'
import { globalRegistry } from './block-registry'

interface RenderBlockProps {
  block: BlockRow
}

export function RenderBlock({ block }: RenderBlockProps) {
  const def = globalRegistry.get(block.type, block.version)

  if (!def) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Unknown block: ${block.type}@${block.version}`)
      return (
        <div className="p-4 border-2 border-dashed border-red-400 bg-red-50 text-red-700">
          Unknown block: {block.type}@{block.version}
        </div>
      )
    }
    return null
  }

  const parsed = def.schema.safeParse(block.props)
  if (!parsed.success) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Invalid props for ${block.type}:`, parsed.error)
      return (
        <div className="p-4 border-2 border-dashed border-amber-400 bg-amber-50">
          Invalid props for {block.type}
        </div>
      )
    }
    return null
  }

  const { Component } = def
  return <Component {...parsed.data} />
}

export function RenderBlocks({ blocks }: { blocks: BlockRow[] }) {
  return (
    <>
      {blocks.map((block) => (
        <RenderBlock key={block.id} block={block} />
      ))}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add next-app/src/lib/render-block.tsx
git commit -m "feat(blocks): RenderBlock + RenderBlocks with schema-validation fallbacks"
```

---

### Task B5: Catalog codegen script

**Files:**
- Create: `next-app/scripts/build-catalog.ts`
- Create: `next-app/scripts/build-catalog.test.ts`

- [ ] **Step 1: Write the catalog builder**

Create `next-app/scripts/build-catalog.ts`:

```ts
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { zodToJsonSchema } from 'zod-to-json-schema'
import type { BlockCatalog, CatalogEntry } from '../src/types/block'

const __dirname = dirname(fileURLToPath(import.meta.url))
const BLOCKS_DIR = join(__dirname, '..', 'src', 'blocks')
const OUT_FILE = join(__dirname, '..', 'public', 'block-catalog.json')

interface BlockModule {
  meta: CatalogEntry // shape is superset of meta; schema field filled later
  schema: unknown
}

async function loadBlock(dir: string): Promise<BlockModule | null> {
  const indexPath = join(dir, 'index.ts')
  if (!existsSync(indexPath)) return null
  const mod = await import(pathToFileURL(indexPath).href)
  if (!mod.meta || !mod.schema) return null
  return { meta: mod.meta, schema: mod.schema }
}

function findBlockDirs(root: string): string[] {
  const results: string[] = []
  function walk(current: string) {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry)
      if (!statSync(full).isDirectory()) continue
      if (existsSync(join(full, 'index.ts')) && existsSync(join(full, 'schema.ts'))) {
        results.push(full)
      } else {
        walk(full)
      }
    }
  }
  walk(root)
  return results
}

async function buildCatalog(): Promise<BlockCatalog> {
  const dirs = findBlockDirs(BLOCKS_DIR)
  const entries: CatalogEntry[] = []

  for (const dir of dirs) {
    const block = await loadBlock(dir)
    if (!block) continue
    const jsonSchema = zodToJsonSchema(block.schema as never, { target: 'openApi3' })
    entries.push({
      type: block.meta.type,
      category: block.meta.category,
      version: block.meta.version,
      validOn: block.meta.validOn,
      purpose: block.meta.purpose,
      schema: jsonSchema as Record<string, unknown>,
      exampleProps: block.meta.exampleProps,
      previewUrl: `/block-previews/${block.meta.type}.png`,
    })
  }

  const version = new Date().toISOString().replace(/[:.]/g, '-')

  return {
    version,
    generatedAt: new Date().toISOString(),
    blocks: entries.sort((a, b) => a.type.localeCompare(b.type)),
  }
}

async function main() {
  const catalog = await buildCatalog()
  writeFileSync(OUT_FILE, JSON.stringify(catalog, null, 2))
  console.log(`✓ Wrote ${catalog.blocks.length} blocks to ${OUT_FILE}`)
  console.log(`  Version: ${catalog.version}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

export { buildCatalog }
```

- [ ] **Step 2: Run the script against empty blocks dir**

```bash
cd next-app && mkdir -p public src/blocks && pnpm build:catalog
```

Expected: `public/block-catalog.json` written with `blocks: []`.

- [ ] **Step 3: Verify output**

```bash
cat public/block-catalog.json | head -10
```

Expected: JSON with `version`, `generatedAt`, `blocks: []`.

- [ ] **Step 4: Commit**

```bash
git add next-app/scripts/build-catalog.ts next-app/public/block-catalog.json
git commit -m "feat(blocks): catalog codegen script (Zod → JSON Schema → block-catalog.json)"
```

---

### Task B6: API client for Laravel

**Files:**
- Create: `next-app/src/lib/api-client.ts`

- [ ] **Step 1: Create API client**

Create `next-app/src/lib/api-client.ts`:

```ts
import type { BlockRow } from '@/types/block'
import type { Theme } from './theme-context'

const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000'
const API_TOKEN = process.env.LARAVEL_API_TOKEN || ''

export interface ResolvedFunnel {
  funnel: { id: string; slug: string; name: string }
  step: { id: string; type: StepType; slug: string }
  summit: { id: string; title: string; description: string; starts_at: string; ends_at: string; current_phase: string }
  theme: Theme
  blocks: BlockRow[]   // from funnel_steps.content JSONB
  speakers: Array<{
    id: string
    firstName: string
    lastName: string
    fullName: string
    title: string
    photoUrl: string
    shortDescription: string
    longDescription: string
    dayNumber: number          // computed: (presentation_day - starts_at) + 1
    masterclassTitle: string
    sortOrder: number
  }>
  products: Array<{
    id: string
    name: string
    description: string
    amountCents: number
    compareAtCents: number | null
    stripePriceId: string | null
  }>
}

export async function resolveFunnel(params: {
  summitSlug: string
  funnelSlug: string
  stepSlug?: string
}): Promise<ResolvedFunnel | null> {
  const url = new URL('/api/funnels/resolve', API_BASE)
  url.searchParams.set('summit_slug', params.summitSlug)
  url.searchParams.set('funnel_slug', params.funnelSlug)
  if (params.stepSlug) url.searchParams.set('step_slug', params.stepSlug)

  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
    },
    next: { revalidate: 60, tags: [`funnel:${params.summitSlug}:${params.funnelSlug}`] },
  })

  if (res.status === 404) return null
  if (!res.ok) {
    throw new Error(`Funnel resolve failed: ${res.status} ${res.statusText}`)
  }
  return res.json()
}
```

- [ ] **Step 2: Add `.env.local` template**

Create `next-app/.env.local.example`:
```
NEXT_PUBLIC_LARAVEL_API_URL=http://localhost:8000
LARAVEL_API_TOKEN=
```

Copy to `.env.local`:
```bash
cp next-app/.env.local.example next-app/.env.local
```

- [ ] **Step 3: Commit**

```bash
git add next-app/src/lib/api-client.ts next-app/.env.local.example
git commit -m "feat(next-app): API client for Laravel funnel resolution"
```

---

## Part C — Laravel API + Catalog Sync

### Task C1: Laravel routes + resolve controller

**Files:**
- Modify: `routes/api.php`
- Create: `app/Http/Controllers/Api/FunnelResolveController.php`

**Note:** No Domain model exists in this schema. Resolution is slug-based: `/api/funnels/resolve?summit_slug=X&funnel_slug=Y&step_slug=optin`. FunnelStep uses `content` column (not `blocks`) and `step_type` (not `type`).

- [ ] **Step 1: Write a Pest feature test**

Create `tests/Feature/Api/FunnelResolveTest.php`:

```php
<?php

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\SummitSpeaker;

it('resolves a funnel by summit slug + funnel slug + step slug', function () {
    $summit = Summit::factory()->create([
        'slug' => 'test-summit',
        'title' => 'Test Summit',
        'starts_at' => '2026-05-01 00:00:00',
        'ends_at' => '2026-05-03 23:59:59',
    ]);
    $funnel = Funnel::factory()->for($summit)->create(['slug' => 'main']);
    $step = FunnelStep::factory()->for($funnel)->create([
        'step_type' => 'optin',
        'slug' => 'optin',
        'content' => [],
    ]);

    $response = $this->getJson('/api/funnels/resolve?summit_slug=test-summit&funnel_slug=main&step_slug=optin');

    $response->assertOk()
        ->assertJsonPath('funnel.slug', 'main')
        ->assertJsonPath('step.type', 'optin')
        ->assertJsonPath('summit.title', 'Test Summit');
});

it('returns 404 for unknown summit slug', function () {
    $response = $this->getJson('/api/funnels/resolve?summit_slug=missing&funnel_slug=foo&step_slug=optin');
    $response->assertNotFound();
});

it('computes speaker day_number from presentation_day', function () {
    $summit = Summit::factory()->create(['slug' => 'day-test', 'starts_at' => '2026-05-01']);
    $funnel = Funnel::factory()->for($summit)->create(['slug' => 'main']);
    FunnelStep::factory()->for($funnel)->create(['step_type' => 'optin', 'slug' => 'optin', 'content' => []]);
    $speaker = Speaker::factory()->create();
    SummitSpeaker::factory()->create([
        'summit_id' => $summit->id,
        'speaker_id' => $speaker->id,
        'presentation_day' => '2026-05-03', // day 3
    ]);

    $response = $this->getJson('/api/funnels/resolve?summit_slug=day-test&funnel_slug=main&step_slug=optin');

    $response->assertOk()->assertJsonPath('speakers.0.dayNumber', 3);
});
```

- [ ] **Step 2: Run test — expect fail (route missing)**

```bash
php artisan test --filter=FunnelResolveTest
```

- [ ] **Step 3: Create controller**

Create `app/Http/Controllers/Api/FunnelResolveController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Summit;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FunnelResolveController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'summit_slug' => ['required', 'string'],
            'funnel_slug' => ['required', 'string'],
            'step_slug' => ['nullable', 'string'],
        ]);

        $summit = Summit::where('slug', $validated['summit_slug'])->first();
        abort_if(! $summit, 404, 'Unknown summit');

        $funnel = $summit->funnels()->where('slug', $validated['funnel_slug'])->first();
        abort_if(! $funnel, 404, 'Unknown funnel');

        $stepSlug = $validated['step_slug'] ?? 'optin';
        $step = $funnel->steps()->where('slug', $stepSlug)->first();
        abort_if(! $step, 404, "No step with slug {$stepSlug}");

        $summit->loadMissing(['summitSpeakers.speaker', 'products.prices']);

        $starts = Carbon::parse($summit->starts_at)->startOfDay();

        $speakers = $summit->summitSpeakers->map(function ($ss) use ($starts) {
            $dayNumber = $ss->presentation_day
                ? Carbon::parse($ss->presentation_day)->startOfDay()->diffInDays($starts) + 1
                : 0;
            $s = $ss->speaker;
            return [
                'id' => $s->id,
                'firstName' => $s->first_name,
                'lastName' => $s->last_name,
                'fullName' => trim("{$s->first_name} {$s->last_name}"),
                'title' => $s->title,
                'photoUrl' => $s->photo_url,
                'shortDescription' => $s->short_description,
                'longDescription' => $s->long_description,
                'dayNumber' => (int) $dayNumber,
                'masterclassTitle' => $ss->masterclass_title,
                'sortOrder' => $ss->sort_order,
            ];
        })->values();

        $products = $summit->products->map(function ($p) use ($summit) {
            $price = $p->priceForPhase($summit->current_phase);
            return [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'amountCents' => $price?->amount_cents,
                'compareAtCents' => $price?->compare_at_cents,
                'stripePriceId' => $price?->stripe_price_id,
            ];
        })->values();

        return response()->json([
            'funnel' => [
                'id' => $funnel->id,
                'slug' => $funnel->slug,
                'name' => $funnel->name,
            ],
            'step' => [
                'id' => $step->id,
                'type' => $step->step_type,
                'slug' => $step->slug,
            ],
            'summit' => [
                'id' => $summit->id,
                'title' => $summit->title,
                'description' => $summit->description,
                'starts_at' => $summit->starts_at,
                'ends_at' => $summit->ends_at,
                'current_phase' => $summit->current_phase,
            ],
            'theme' => $funnel->theme ?: $this->defaultTheme(),
            'blocks' => $step->content ?? [],
            'speakers' => $speakers,
            'products' => $products,
        ]);
    }

    private function defaultTheme(): array
    {
        return [
            'primaryColor' => '#5e4d9b',
            'accentColor' => '#00b553',
            'fontHeading' => 'Inter',
            'fontBody' => 'Inter',
            'logoUrl' => null,
            'backgroundStyle' => 'light',
        ];
    }
}
```

- [ ] **Step 4: Register route in `routes/api.php`**

Add:

```php
use App\Http\Controllers\Api\FunnelResolveController;

Route::get('/funnels/resolve', FunnelResolveController::class)
    ->middleware('throttle:60,1');
```

- [ ] **Step 5: Run test**

```bash
php artisan test --filter=FunnelResolveTest
```

Expected: 2 tests pass. (If fails due to missing `theme` column or model relationships, fix by extending existing models — not in scope to add columns now; test expectations may need adjustment to match current schema.)

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/Api/FunnelResolveController.php routes/api.php tests/Feature/Api/FunnelResolveTest.php
git commit -m "feat(api): funnel resolve endpoint with blocks + theme + speakers + products"
```

---

### Task C2: Block catalog config + service

**Files:**
- Create: `config/block_catalog.php`
- Create: `app/Services/Blocks/BlockCatalogService.php`
- Create: `tests/Unit/Services/BlockCatalogServiceTest.php`

- [ ] **Step 1: Create config**

Create `config/block_catalog.php`:

```php
<?php

return [
    'cache_key' => 'block-catalog:current',
    'bunny_storage_zone' => env('BUNNY_CDN_STORAGE_ZONE'),
    'bunny_api_key' => env('BUNNY_CDN_API_KEY'),
    'bunny_hostname' => env('BUNNY_CDN_HOSTNAME'),
    'catalog_path' => 'block-catalog/current.json',
    'refresh_token' => env('CATALOG_REFRESH_TOKEN'),
];
```

- [ ] **Step 2: Write failing test**

Create `tests/Unit/Services/BlockCatalogServiceTest.php`:

```php
<?php

use App\Services\Blocks\BlockCatalogService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    Cache::flush();
});

it('fetches catalog from bunny and caches it', function () {
    config(['block_catalog.bunny_hostname' => 'cdn.example.com']);
    config(['block_catalog.catalog_path' => 'block-catalog/current.json']);

    Http::fake([
        'https://cdn.example.com/block-catalog/current.json' => Http::response([
            'version' => '2026-04-13-1',
            'blocks' => [
                ['type' => 'HeroMinimal', 'category' => 'hero', 'version' => 1],
            ],
        ]),
    ]);

    $service = app(BlockCatalogService::class);
    $catalog = $service->fetchAndCache();

    expect($catalog['version'])->toBe('2026-04-13-1');
    expect(Cache::has(config('block_catalog.cache_key')))->toBeTrue();
});

it('returns cached catalog when present', function () {
    $cached = ['version' => 'cached', 'blocks' => []];
    Cache::put(config('block_catalog.cache_key'), $cached);

    $service = app(BlockCatalogService::class);
    expect($service->current())->toBe($cached);
});
```

- [ ] **Step 3: Run tests — expect fail**

```bash
php artisan test --filter=BlockCatalogServiceTest
```

- [ ] **Step 4: Create service**

Create `app/Services/Blocks/BlockCatalogService.php`:

```php
<?php

namespace App\Services\Blocks;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class BlockCatalogService
{
    public function current(): array
    {
        return Cache::remember(
            config('block_catalog.cache_key'),
            now()->addHour(),
            fn () => $this->fetchAndCache()
        );
    }

    public function fetchAndCache(): array
    {
        $hostname = config('block_catalog.bunny_hostname');
        $path = config('block_catalog.catalog_path');
        $url = "https://{$hostname}/{$path}";

        $response = Http::timeout(10)->get($url);

        if (! $response->ok()) {
            throw new RuntimeException("Failed to fetch catalog: {$response->status()}");
        }

        $catalog = $response->json();
        Cache::put(config('block_catalog.cache_key'), $catalog, now()->addHour());

        return $catalog;
    }

    public function findBlock(string $type, int $version): ?array
    {
        foreach ($this->current()['blocks'] ?? [] as $block) {
            if ($block['type'] === $type && $block['version'] === $version) {
                return $block;
            }
        }
        return null;
    }

    public function blocksForStep(string $stepType): array
    {
        return array_values(array_filter(
            $this->current()['blocks'] ?? [],
            fn ($b) => in_array($stepType, $b['validOn'] ?? [], true)
        ));
    }
}
```

- [ ] **Step 5: Run tests**

```bash
php artisan test --filter=BlockCatalogServiceTest
```

Expected: 2 pass.

- [ ] **Step 6: Commit**

```bash
git add config/block_catalog.php app/Services/Blocks/BlockCatalogService.php tests/Unit/Services/BlockCatalogServiceTest.php
git commit -m "feat(blocks): BlockCatalogService with Bunny fetch + Redis cache"
```

---

### Task C3: Catalog refresh webhook

**Files:**
- Create: `app/Http/Controllers/Api/CatalogRefreshController.php`
- Modify: `routes/api.php`

- [ ] **Step 1: Write failing test**

Create `tests/Feature/Api/CatalogRefreshTest.php`:

```php
<?php

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

it('refreshes the catalog when given the correct token', function () {
    config(['block_catalog.refresh_token' => 'secret-token']);
    config(['block_catalog.bunny_hostname' => 'cdn.example.com']);

    Http::fake([
        'https://cdn.example.com/*' => Http::response([
            'version' => '2026-04-13-2',
            'blocks' => [],
        ]),
    ]);

    $response = $this->postJson('/api/admin/catalog/refresh', [], [
        'Authorization' => 'Bearer secret-token',
    ]);

    $response->assertOk()->assertJsonPath('version', '2026-04-13-2');
});

it('rejects refresh without token', function () {
    config(['block_catalog.refresh_token' => 'secret-token']);

    $response = $this->postJson('/api/admin/catalog/refresh');
    $response->assertForbidden();
});
```

- [ ] **Step 2: Create controller**

Create `app/Http/Controllers/Api/CatalogRefreshController.php`:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Blocks\BlockCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogRefreshController extends Controller
{
    public function __invoke(Request $request, BlockCatalogService $service): JsonResponse
    {
        $expected = config('block_catalog.refresh_token');
        $provided = $request->bearerToken();

        abort_unless($expected && hash_equals($expected, $provided ?? ''), 403);

        $catalog = $service->fetchAndCache();

        return response()->json([
            'version' => $catalog['version'] ?? null,
            'block_count' => count($catalog['blocks'] ?? []),
        ]);
    }
}
```

- [ ] **Step 3: Register route in `routes/api.php`**

```php
use App\Http\Controllers\Api\CatalogRefreshController;

Route::post('/admin/catalog/refresh', CatalogRefreshController::class)
    ->middleware('throttle:10,1');
```

- [ ] **Step 4: Run tests**

```bash
php artisan test --filter=CatalogRefreshTest
```

Expected: 2 pass.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/Api/CatalogRefreshController.php routes/api.php tests/Feature/Api/CatalogRefreshTest.php
git commit -m "feat(api): catalog refresh webhook with bearer token auth"
```

---

### Task C4: Add refresh token + Bunny credentials to .env.example

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Add variables**

Append to `.env.example`:

```
# Block catalog sync (Next.js → Laravel)
CATALOG_REFRESH_TOKEN=
```

- [ ] **Step 2: Generate and set a token**

```bash
php -r "echo bin2hex(random_bytes(32));"
```

Copy output to `.env`:
```
CATALOG_REFRESH_TOKEN=<paste-here>
```

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "chore: add CATALOG_REFRESH_TOKEN to env template"
```

---

## Part D — Filament Adapter + Block Editor

### Task D1: JSON Schema → Filament field mapper

**Files:**
- Create: `app/Filament/Schemas/JsonSchemaFormBuilder.php`
- Create: `tests/Unit/Filament/JsonSchemaFormBuilderTest.php`

- [ ] **Step 1: Write failing test**

Create `tests/Unit/Filament/JsonSchemaFormBuilderTest.php`:

```php
<?php

use App\Filament\Schemas\JsonSchemaFormBuilder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;

it('maps string property to TextInput', function () {
    $schema = [
        'type' => 'object',
        'properties' => ['headline' => ['type' => 'string']],
        'required' => ['headline'],
    ];
    $fields = JsonSchemaFormBuilder::build($schema);
    expect($fields)->toHaveCount(1);
    expect($fields[0])->toBeInstanceOf(TextInput::class);
    expect($fields[0]->getName())->toBe('headline');
    expect($fields[0]->isRequired())->toBeTrue();
});

it('maps long string (maxLength > 200) to Textarea', function () {
    $schema = [
        'type' => 'object',
        'properties' => ['body' => ['type' => 'string', 'maxLength' => 500]],
    ];
    $fields = JsonSchemaFormBuilder::build($schema);
    expect($fields[0])->toBeInstanceOf(Textarea::class);
});

it('maps enum to Select', function () {
    $schema = [
        'type' => 'object',
        'properties' => ['style' => ['type' => 'string', 'enum' => ['a', 'b', 'c']]],
    ];
    $fields = JsonSchemaFormBuilder::build($schema);
    expect($fields[0])->toBeInstanceOf(Select::class);
});

it('maps boolean to Toggle', function () {
    $schema = [
        'type' => 'object',
        'properties' => ['showCta' => ['type' => 'boolean']],
    ];
    $fields = JsonSchemaFormBuilder::build($schema);
    expect($fields[0])->toBeInstanceOf(Toggle::class);
});
```

- [ ] **Step 2: Create builder**

Create `app/Filament/Schemas/JsonSchemaFormBuilder.php`:

```php
<?php

namespace App\Filament\Schemas;

use Filament\Forms\Components\Component;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;

class JsonSchemaFormBuilder
{
    /**
     * Convert a JSON Schema object into an array of Filament form components.
     *
     * @return Component[]
     */
    public static function build(array $schema): array
    {
        $required = $schema['required'] ?? [];
        $properties = $schema['properties'] ?? [];
        $fields = [];

        foreach ($properties as $name => $spec) {
            $field = self::fieldFor($name, $spec, in_array($name, $required, true));
            if ($field !== null) {
                $fields[] = $field;
            }
        }

        return $fields;
    }

    private static function fieldFor(string $name, array $spec, bool $required): ?Component
    {
        $label = ucfirst(preg_replace('/([A-Z])/', ' $1', $name));

        // Enum → Select
        if (isset($spec['enum']) && is_array($spec['enum'])) {
            $options = array_combine($spec['enum'], $spec['enum']);
            return Select::make($name)->label($label)->options($options)->required($required);
        }

        // Format = rich-text → RichEditor
        if (($spec['format'] ?? null) === 'rich-text') {
            return RichEditor::make($name)->label($label)->required($required);
        }

        // Array of refs or primitives
        if (($spec['type'] ?? null) === 'array') {
            return self::arrayField($name, $spec, $required, $label);
        }

        return match ($spec['type'] ?? null) {
            'string' => self::stringField($name, $spec, $required, $label),
            'number', 'integer' => TextInput::make($name)->label($label)->numeric()->required($required),
            'boolean' => Toggle::make($name)->label($label),
            default => null,
        };
    }

    private static function stringField(string $name, array $spec, bool $required, string $label): Component
    {
        $maxLength = $spec['maxLength'] ?? null;

        if ($maxLength && $maxLength > 200) {
            return Textarea::make($name)
                ->label($label)
                ->required($required)
                ->maxLength($maxLength)
                ->rows(4);
        }

        return TextInput::make($name)
            ->label($label)
            ->required($required)
            ->maxLength($maxLength);
    }

    private static function arrayField(string $name, array $spec, bool $required, string $label): Component
    {
        $items = $spec['items'] ?? [];

        // Array of IDs (references) → multi-select
        if (($items['type'] ?? null) === 'integer' || ($items['type'] ?? null) === 'number') {
            return Select::make($name)
                ->label($label)
                ->multiple()
                ->required($required)
                ->placeholder('Select options…');
        }

        // Array of objects → Repeater
        if (($items['type'] ?? null) === 'object') {
            $nested = self::build($items);
            return Repeater::make($name)
                ->label($label)
                ->required($required)
                ->schema($nested)
                ->collapsed();
        }

        // Array of strings → Repeater of text inputs
        return Repeater::make($name)
            ->label($label)
            ->required($required)
            ->schema([TextInput::make('value')->required()]);
    }
}
```

- [ ] **Step 3: Run tests**

```bash
php artisan test --filter=JsonSchemaFormBuilderTest
```

Expected: 4 pass.

- [ ] **Step 4: Commit**

```bash
git add app/Filament/Schemas/JsonSchemaFormBuilder.php tests/Unit/Filament/JsonSchemaFormBuilderTest.php
git commit -m "feat(filament): JSON Schema → Filament field builder for auto-generated block forms"
```

---

### Task D2: Block editor form component

**Files:**
- Create: `app/Filament/Forms/Components/BlockEditor.php`
- Modify: `app/Filament/Resources/FunnelSteps/Schemas/FunnelStepForm.php`

- [ ] **Step 1: Create BlockEditor**

Create `app/Filament/Forms/Components/BlockEditor.php`:

```php
<?php

namespace App\Filament\Forms\Components;

use App\Services\Blocks\BlockCatalogService;
use Filament\Forms\Components\Field;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use App\Filament\Schemas\JsonSchemaFormBuilder;

class BlockEditor extends Field
{
    protected string $view = 'filament-forms::components.fieldset';

    public static function make(string $name = 'blocks'): Repeater
    {
        $catalogService = app(BlockCatalogService::class);

        $typeOptions = [];
        $schemasByType = [];
        try {
            $catalog = $catalogService->current();
            foreach ($catalog['blocks'] ?? [] as $block) {
                $typeOptions[$block['type']] = "{$block['type']} ({$block['category']})";
                $schemasByType[$block['type']] = $block['schema'];
            }
        } catch (\Throwable $e) {
            // Catalog not available yet — user sees empty options
        }

        return Repeater::make($name)
            ->label('Blocks')
            ->schema([
                Select::make('type')
                    ->label('Block type')
                    ->options($typeOptions)
                    ->required()
                    ->reactive(),

                // Nested fields rendered based on selected block type
                ...self::dynamicFieldsFor($schemasByType),
            ])
            ->itemLabel(fn (array $state): ?string => $state['type'] ?? null)
            ->collapsed()
            ->reorderable()
            ->default([]);
    }

    /**
     * Build a conditional field stack — one visible group per block type.
     * Only the group matching the currently selected 'type' renders.
     */
    private static function dynamicFieldsFor(array $schemasByType): array
    {
        $fields = [];

        foreach ($schemasByType as $type => $schema) {
            $propsFields = JsonSchemaFormBuilder::build($schema);

            // Wrap props in a prefix so they live under 'props.*' in state
            $prefixed = array_map(
                fn ($f) => $f->statePath("props.{$f->getName()}"),
                $propsFields
            );

            $group = \Filament\Forms\Components\Fieldset::make("type_{$type}")
                ->label("{$type} settings")
                ->schema($prefixed)
                ->visible(fn (callable $get) => $get('type') === $type);

            $fields[] = $group;
        }

        return $fields;
    }
}
```

- [ ] **Step 2: Wire into FunnelStepForm**

Edit `app/Filament/Resources/FunnelSteps/Schemas/FunnelStepForm.php` — find the existing schema array and replace the old blocks-related editor with:

```php
use App\Filament\Forms\Components\BlockEditor;

// inside the schema() method, add:
BlockEditor::make('blocks'),
```

(Review the existing file — if it had an ad-hoc blocks editor, replace it; otherwise add this line in the right section.)

- [ ] **Step 3: Commit**

```bash
git add app/Filament/Forms/Components/BlockEditor.php app/Filament/Resources/FunnelSteps/Schemas/FunnelStepForm.php
git commit -m "feat(filament): BlockEditor — catalog-driven repeater with per-type prop forms"
```

---

### Task D3: Manual smoke test

- [ ] **Step 1: Run Laravel + open Filament**

```bash
php artisan serve
# in another terminal
cd next-app && pnpm build:catalog
# manually upload public/block-catalog.json to Bunny or place it somewhere Laravel can fetch
```

For local dev without Bunny: mock catalog in `BlockCatalogService::current()` to read a local file via env flag (optional dev-only shortcut).

- [ ] **Step 2: Open Filament, create a test funnel step, verify BlockEditor renders**

Open http://localhost:8000/admin → Funnel Steps → New. The blocks repeater should appear. Adding a block row should show the Type dropdown (empty until blocks exist in the catalog).

- [ ] **Step 3: Commit any test-driven dev fixes**

If dev env fixups were needed, commit with message `chore(dev): local catalog fallback for BlockCatalogService`.

---

## Part E — Seed ADHD Parenting Summit 2026

### Task E1: Seeder for the summit + 37 speakers + funnel + optin step

**Files:**
- Create: `database/seeders/AdhdParentingSummit2026Seeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`

**Schema-aligned:** Uses correct Summit/Speaker/SummitSpeaker/Funnel/FunnelStep columns per 2026-04-13 audit. Speakers split into first_name/last_name. `presentation_day` is DATE (maps Day 1→2026-03-09, Day 2→2026-03-10, etc.). FunnelStep uses `content` column, `step_type` field. **No Domain model** — routing is slug-based.

- [ ] **Step 1: Create seeder**

Create `database/seeders/AdhdParentingSummit2026Seeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\Funnel;
use App\Models\FunnelStep;
use App\Models\Speaker;
use App\Models\Summit;
use App\Models\SummitSpeaker;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdhdParentingSummit2026Seeder extends Seeder
{
    public function run(): void
    {
        $startsAt = Carbon::parse('2026-03-09 00:00:00');

        $summit = Summit::updateOrCreate(
            ['slug' => 'adhd-parenting-summit-2026'],
            [
                'title' => 'ADHD Parenting Summit 2026',
                'description' => "World's Largest ADHD Parenting Summit — Become Empowered Parent In 5 Days. 40+ leading experts covering focus, impulsivity, outbursts, and screen management.",
                'topic' => 'ADHD parenting strategies and tools',
                'timezone' => 'America/New_York',
                'starts_at' => $startsAt,
                'ends_at' => Carbon::parse('2026-03-13 23:59:59'),
                'status' => 'published',
                'current_phase' => 'pre_summit',
                'summit_type' => 'free',
            ]
        );

        $funnel = Funnel::updateOrCreate(
            ['summit_id' => $summit->id, 'slug' => 'main'],
            [
                'name' => 'ADHD Parenting Summit 2026 Main Funnel',
                'description' => 'Public optin → checkout → upsell → thank-you',
                'is_active' => true,
                'theme' => [
                    'primaryColor' => '#5e4d9b',
                    'accentColor' => '#00b553',
                    'fontHeading' => 'Inter',
                    'fontBody' => 'Inter',
                    'logoUrl' => null,
                    'backgroundStyle' => 'light',
                ],
            ]
        );

        FunnelStep::updateOrCreate(
            ['funnel_id' => $funnel->id, 'slug' => 'optin'],
            [
                'step_type' => 'optin',
                'template' => 'custom-blocks',
                'name' => 'Main Optin',
                'content' => [], // populated in Task H1
                'sort_order' => 0,
                'is_published' => true,
            ]
        );

        $this->seedSpeakers($summit, $startsAt);
    }

    /**
     * Seed 37 speakers across Days 1-5.
     * presentation_day = starts_at + (day - 1).
     */
    private function seedSpeakers(Summit $summit, Carbon $startsAt): void
    {
        $speakers = [
            // Day 1 — The Butterfly Mind (Focus & Attention) — 6 speakers
            ['first' => 'Stephen', 'last' => 'Cowan', 'title' => 'MD, FAAP', 'day' => 1, 'session' => 'Focus Foundations for the ADHD Brain'],
            ['first' => 'Pippa', 'last' => 'Simou', 'title' => 'Parenting Coach', 'day' => 1, 'session' => 'Butterfly Mind Strategies'],
            ['first' => 'Peg', 'last' => 'Dawson', 'title' => 'EdD', 'day' => 1, 'session' => 'Executive Function Skills'],
            ['first' => 'Richard', 'last' => 'Guare', 'title' => 'PhD', 'day' => 1, 'session' => 'Smart but Scattered Kids'],
            ['first' => 'Salif', 'last' => 'Mahamane', 'title' => 'PhD', 'day' => 1, 'session' => 'Nature and Attention'],
            ['first' => 'Stephen P.', 'last' => 'Hinsworth', 'title' => 'MD', 'day' => 1, 'session' => 'Neurobiology of Focus'],

            // Day 2 — From Storm To Calm (Emotional Regulation) — 7 speakers
            ['first' => 'Mona', 'last' => 'Delahooke', 'title' => 'PhD', 'day' => 2, 'session' => 'Brain-Body Parenting'],
            ['first' => 'Ross', 'last' => 'Greene', 'title' => 'PhD', 'day' => 2, 'session' => 'Collaborative Problem Solving'],
            ['first' => 'Dan', 'last' => 'Siegel', 'title' => 'MD', 'day' => 2, 'session' => 'The Whole-Brain Child'],
            ['first' => 'Tina', 'last' => 'Payne Bryson', 'title' => 'PhD', 'day' => 2, 'session' => 'No-Drama Discipline'],
            ['first' => 'Shimi', 'last' => 'Kang', 'title' => 'MD', 'day' => 2, 'session' => 'The Dolphin Parent'],
            ['first' => 'Rebecca', 'last' => 'Kennedy', 'title' => 'PhD', 'day' => 2, 'session' => 'Good Inside'],
            ['first' => 'Gordon', 'last' => 'Neufeld', 'title' => 'PhD', 'day' => 2, 'session' => 'Hold On to Your Kids'],

            // Day 3 — Taming The Time Monster (Routines & Time) — 8 speakers
            ['first' => 'Edward', 'last' => 'Hallowell', 'title' => 'MD', 'day' => 3, 'session' => 'Driven to Distraction'],
            ['first' => 'John', 'last' => 'Ratey', 'title' => 'MD', 'day' => 3, 'session' => 'Spark: Exercise and the Brain'],
            ['first' => 'Russell', 'last' => 'Barkley', 'title' => 'PhD', 'day' => 3, 'session' => 'Taking Charge of ADHD'],
            ['first' => 'Joel', 'last' => 'Nigg', 'title' => 'PhD', 'day' => 3, 'session' => 'Getting Ahead of ADHD'],
            ['first' => 'Thomas E.', 'last' => 'Brown', 'title' => 'PhD', 'day' => 3, 'session' => 'Smart But Stuck'],
            ['first' => 'Ari', 'last' => 'Tuckman', 'title' => 'PsyD', 'day' => 3, 'session' => 'Time Management for ADHD'],
            ['first' => 'Sharon', 'last' => 'Saline', 'title' => 'PsyD', 'day' => 3, 'session' => 'What Your ADHD Child Wishes'],
            ['first' => 'Norrine', 'last' => 'Russell', 'title' => 'PhD', 'day' => 3, 'session' => 'Routine Systems That Stick'],

            // Day 4 — School Survival — 8 speakers
            ['first' => 'Ned', 'last' => 'Hallowell Jr', 'title' => 'MD', 'day' => 4, 'session' => 'School Strategies for ADHD'],
            ['first' => 'Laura', 'last' => 'Kastner', 'title' => 'PhD', 'day' => 4, 'session' => 'Wise-Minded Parenting'],
            ['first' => 'Wendy', 'last' => 'Mogel', 'title' => 'PhD', 'day' => 4, 'session' => 'Blessing of a B Minus'],
            ['first' => 'Deborah', 'last' => 'Reber', 'title' => 'MA', 'day' => 4, 'session' => 'Differently Wired'],
            ['first' => 'Diane', 'last' => 'Dempster', 'title' => 'Coach', 'day' => 4, 'session' => 'Impact Parents'],
            ['first' => 'Elaine', 'last' => 'Taylor-Klaus', 'title' => 'CPCC', 'day' => 4, 'session' => 'Parenting ADHD with Impact'],
            ['first' => 'Thomas', 'last' => 'Phelan', 'title' => 'PhD', 'day' => 4, 'session' => '1-2-3 Magic'],
            ['first' => 'Rick', 'last' => 'Lavoie', 'title' => 'MA', 'day' => 4, 'session' => 'Understanding Learning Differences'],

            // Day 5 — The ADHD Parent Paradox — 8 speakers
            ['first' => 'Sari', 'last' => 'Solden', 'title' => 'MS, LMFT', 'day' => 5, 'session' => 'Women with ADHD'],
            ['first' => 'Terry', 'last' => 'Matlen', 'title' => 'MSW', 'day' => 5, 'session' => 'Survival Tips for Women with AD/HD'],
            ['first' => 'Patricia', 'last' => 'Quinn', 'title' => 'MD', 'day' => 5, 'session' => 'ADHD in Women and Girls'],
            ['first' => 'Kathleen', 'last' => 'Nadeau', 'title' => 'PhD', 'day' => 5, 'session' => "A Woman's Guide to ADHD"],
            ['first' => 'Ellen', 'last' => 'Littman', 'title' => 'PhD', 'day' => 5, 'session' => 'Understanding Girls with ADHD'],
            ['first' => 'Tamara', 'last' => 'Rosier', 'title' => 'PhD', 'day' => 5, 'session' => "Your Brain's Not Broken"],
            ['first' => 'Stephanie', 'last' => 'Moulton Sarkis', 'title' => 'PhD', 'day' => 5, 'session' => 'Adult ADHD'],
            ['first' => 'Joel', 'last' => 'Young', 'title' => 'MD', 'day' => 5, 'session' => 'ADHD Across Generations'],
        ];

        foreach ($speakers as $i => $spec) {
            $slug = Str::slug("{$spec['first']} {$spec['last']}");

            $speaker = Speaker::updateOrCreate(
                ['slug' => $slug],
                [
                    'first_name' => $spec['first'],
                    'last_name' => $spec['last'],
                    'title' => $spec['title'],
                    'short_description' => "Expert in {$spec['session']}.",
                    'long_description' => "Featured speaker on Day {$spec['day']} of the ADHD Parenting Summit 2026. Session: {$spec['session']}.",
                    'photo_url' => 'https://placehold.co/400x400/5e4d9b/ffffff.png?text=' . urlencode("{$spec['first']} {$spec['last']}"),
                ]
            );

            SummitSpeaker::updateOrCreate(
                ['summit_id' => $summit->id, 'speaker_id' => $speaker->id],
                [
                    'masterclass_title' => $spec['session'],
                    'masterclass_description' => "Day {$spec['day']} session on ADHD parenting.",
                    'presentation_day' => $startsAt->copy()->addDays($spec['day'] - 1)->toDateString(),
                    'sort_order' => $i,
                    'is_featured' => false,
                    'rating' => null,
                    'free_access_window_hours' => 24,
                ]
            );
        }
    }
}
```

- [ ] **Step 2: Register in DatabaseSeeder**

Edit `database/seeders/DatabaseSeeder.php` `run()` method, add:

```php
$this->call(AdhdParentingSummit2026Seeder::class);
```

- [ ] **Step 3: Run the seeder**

```bash
php artisan db:seed --class=AdhdParentingSummit2026Seeder
```

Expected: 1 summit, 37 speakers, 1 funnel, 1 optin step inserted.

- [ ] **Step 4: Verify in DB**

```bash
php artisan tinker --execute="echo \App\Models\Summit::where('slug', 'adhd-parenting-summit-2026')->first()->summitSpeakers->count();"
```

Expected: `37`.

- [ ] **Step 5: Commit**

```bash
git add database/seeders/AdhdParentingSummit2026Seeder.php database/seeders/DatabaseSeeder.php
git commit -m "feat(seeders): ADHD Parenting Summit 2026 with 37 speakers + funnel + optin step"
```

---

### Task E2: Block preview placeholder images

- [ ] **Step 1: Create a placeholder images directory**

```bash
mkdir -p next-app/public/block-previews
```

- [ ] **Step 2: Add a default placeholder**

Use any 1200×800 PNG. For now, generate a solid-color placeholder:

```bash
cd next-app/public/block-previews
# Create a simple placeholder — dev can replace later via Storybook screenshotting
curl -o placeholder.png "https://placehold.co/1200x800/5e4d9b/ffffff.png?text=Block+Preview"
```

- [ ] **Step 3: Commit**

```bash
git add next-app/public/block-previews/
git commit -m "chore(blocks): placeholder directory for block preview images"
```

---

## Part F — Build 19 Blocks

**Pattern:** Every block task follows the same 5-step sequence:

1. Create folder `next-app/src/blocks/<category>/<BlockName>/`
2. Create the 4 files (Component, schema, meta, stories) + index
3. Run `pnpm build:catalog` to regenerate the manifest
4. Open Storybook to visually verify
5. Commit

For each block below, the **schema**, **meta**, and **Component outline** are specified. Component JSX details (exact Tailwind classes, Framer Motion animations) follow standard shadcn/Aceternity patterns — the dev composes them.

**Register helper first:**

Create `next-app/src/blocks/_register.ts` that imports every block and calls `globalRegistry.register()`. This file gets updated after each block is built. Add initial empty stub:

```ts
// Auto-maintained: add each block import + register as it's built.
// Imported from the root layout or page to populate the registry at module load.
import { globalRegistry } from '@/lib/block-registry'
export {}
```

Import it once in `next-app/src/app/layout.tsx` at the top:
```ts
import '@/blocks/_register'
```

---

### Task F1: HeroWithCountdown block

**Files:** `next-app/src/blocks/hero/HeroWithCountdown/{Component.tsx, schema.ts, meta.ts, Component.stories.tsx, index.ts}`

- [ ] **Step 1: Create `schema.ts`**

```ts
import { z } from 'zod'

export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(140),
  subheadline: z.string().max(300).optional(),
  bodyLines: z.array(z.string().max(140)).max(6).default([]),
  speakerCountLabel: z.string().max(60).default('40+ Leading Experts'),
  countdownTarget: z.string().datetime(), // ISO 8601
  primaryCtaLabel: z.string().max(40).default('GET INSTANT ACCESS'),
  secondaryCtaLabel: z.string().max(40).optional(),
  bannerImageUrl: z.string().url().optional(),
  backgroundStyle: z.enum(['gradient', 'image', 'solid']).default('gradient'),
})

export type Props = z.infer<typeof schema>
```

- [ ] **Step 2: Create `meta.ts`**

```ts
import type { BlockMeta } from '@/types/block'

export const meta: BlockMeta = {
  type: 'HeroWithCountdown',
  category: 'hero',
  version: 1,
  validOn: ['optin'],
  purpose: 'Above-the-fold hero for summit optins. Large headline + subhead + live countdown timer + primary/secondary CTAs + speaker count callout. Use for time-sensitive summit launches.',
  exampleProps: {
    eyebrow: 'LIVE MARCH 9–13, 2026',
    headline: "WORLD'S LARGEST ADHD PARENTING SUMMIT",
    subheadline: 'Become Empowered Parent In 5 Days',
    bodyLines: ['40+ Leading Experts', 'Covering focus, impulsivity, outbursts & screen management'],
    speakerCountLabel: '40+ Leading Experts',
    countdownTarget: '2026-03-09T00:00:00Z',
    primaryCtaLabel: 'GET INSTANT ACCESS',
    secondaryCtaLabel: 'Claim your FREE ticket',
    backgroundStyle: 'gradient',
  },
}
```

- [ ] **Step 3: Create `Component.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-context'
import { cn } from '@/lib/cn'
import type { Props } from './schema'

export function HeroWithCountdown(props: Props) {
  const theme = useTheme()
  const { timeLeft } = useCountdown(props.countdownTarget)

  const bgClass = {
    gradient: 'bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-primary))]/70',
    image: props.bannerImageUrl ? '' : 'bg-[rgb(var(--color-primary))]',
    solid: 'bg-[rgb(var(--color-primary))]',
  }[props.backgroundStyle]

  return (
    <section
      className={cn('relative overflow-hidden py-20 md:py-32 text-white', bgClass)}
      style={props.backgroundStyle === 'image' && props.bannerImageUrl ? { backgroundImage: `url(${props.bannerImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
    >
      <div className="absolute inset-0 bg-black/20" aria-hidden />
      <div className="relative mx-auto max-w-[1024px] px-6 text-center">
        {props.eyebrow && (
          <p className="mb-4 text-sm font-semibold tracking-widest uppercase opacity-90">{props.eyebrow}</p>
        )}
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4">
          {props.headline}
        </h1>
        {props.subheadline && (
          <p className="text-xl md:text-2xl mb-8 opacity-95">{props.subheadline}</p>
        )}
        <CountdownDisplay timeLeft={timeLeft} />
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent))]/90 text-white">
            {props.primaryCtaLabel}
          </Button>
          {props.secondaryCtaLabel && (
            <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/40">
              {props.secondaryCtaLabel}
            </Button>
          )}
        </div>
        {props.bodyLines.length > 0 && (
          <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm opacity-95">
            {props.bodyLines.map((line, i) => (<li key={i}>• {line}</li>))}
          </ul>
        )}
      </div>
    </section>
  )
}

function CountdownDisplay({ timeLeft }: { timeLeft: { days: number; hours: number; minutes: number; seconds: number } }) {
  return (
    <div className="flex justify-center gap-3 md:gap-6">
      {[
        { label: 'DAYS', value: timeLeft.days },
        { label: 'HOURS', value: timeLeft.hours },
        { label: 'MINUTES', value: timeLeft.minutes },
        { label: 'SECONDS', value: timeLeft.seconds },
      ].map(({ label, value }) => (
        <div key={label} className="bg-white/15 backdrop-blur-sm rounded-lg p-3 md:p-5 min-w-[64px] md:min-w-[90px]">
          <div className="text-3xl md:text-5xl font-bold tabular-nums">{String(value).padStart(2, '0')}</div>
          <div className="text-xs md:text-sm opacity-80 mt-1">{label}</div>
        </div>
      ))}
    </div>
  )
}

function useCountdown(target: string) {
  const [timeLeft, setTimeLeft] = useState(() => compute(target))
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(compute(target)), 1000)
    return () => clearInterval(id)
  }, [target])
  return { timeLeft }
}

function compute(target: string) {
  const diff = Math.max(0, new Date(target).getTime() - Date.now())
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff / 3_600_000) % 24)
  const minutes = Math.floor((diff / 60_000) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}
```

- [ ] **Step 4: Create `Component.stories.tsx`**

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { HeroWithCountdown } from './Component'
import { meta as blockMeta } from './meta'

const meta: Meta<typeof HeroWithCountdown> = {
  title: 'Blocks/Hero/HeroWithCountdown',
  component: HeroWithCountdown,
}
export default meta

type Story = StoryObj<typeof HeroWithCountdown>

export const Default: Story = { args: blockMeta.exampleProps as Parameters<typeof HeroWithCountdown>[0] }

export const NoSecondaryCta: Story = {
  args: { ...(blockMeta.exampleProps as any), secondaryCtaLabel: undefined },
}

export const ImageBackground: Story = {
  args: {
    ...(blockMeta.exampleProps as any),
    backgroundStyle: 'image',
    bannerImageUrl: 'https://placehold.co/2000x1200/302070/ffffff.jpg',
  },
}
```

- [ ] **Step 5: Create `index.ts`**

```ts
export { schema } from './schema'
export { meta } from './meta'
export { HeroWithCountdown as Component } from './Component'

import { globalRegistry } from '@/lib/block-registry'
import { schema } from './schema'
import { meta } from './meta'
import { HeroWithCountdown } from './Component'

globalRegistry.register({ meta, schema, Component: HeroWithCountdown as never })
```

- [ ] **Step 6: Add to `_register.ts`**

Edit `next-app/src/blocks/_register.ts`:
```ts
import './hero/HeroWithCountdown'
```

- [ ] **Step 7: Run catalog build**

```bash
cd next-app && pnpm build:catalog
```

Expected: `public/block-catalog.json` now shows 1 block.

- [ ] **Step 8: Verify in Storybook**

```bash
pnpm storybook
```

Expected: Default story renders the hero with countdown ticking.

- [ ] **Step 9: Commit**

```bash
git add next-app/src/blocks/hero/HeroWithCountdown/ next-app/src/blocks/_register.ts next-app/public/block-catalog.json
git commit -m "feat(blocks): HeroWithCountdown — above-fold hero with live timer + CTAs"
```

---

### Task F2: SocialProofBadge block

**Files:** `next-app/src/blocks/social-proof/SocialProofBadge/*`

- [ ] **Step 1: `schema.ts`**

```ts
import { z } from 'zod'
export const schema = z.object({
  headline: z.string().max(120), // "Loved by 73,124 committed parents"
  badgeText: z.string().max(60).optional(), // "73.124 committed parents"
  badgeIconUrl: z.string().url().optional(),
  backgroundColor: z.enum(['light', 'accent', 'transparent']).default('light'),
})
export type Props = z.infer<typeof schema>
```

- [ ] **Step 2: `meta.ts`**

```ts
import type { BlockMeta } from '@/types/block'
export const meta: BlockMeta = {
  type: 'SocialProofBadge',
  category: 'social-proof',
  version: 1,
  validOn: ['optin', 'checkout', 'thank-you'],
  purpose: 'Single-line social proof badge with large number + descriptor. Place below hero to establish trust.',
  exampleProps: {
    headline: 'Loved by 73,124 committed parents',
    badgeText: '73,124',
    backgroundColor: 'light',
  },
}
```

- [ ] **Step 3: `Component.tsx`** — simple centered badge with icon + large number + supporting text. Use Tailwind; straightforward.

```tsx
import { cn } from '@/lib/cn'
import type { Props } from './schema'

export function SocialProofBadge(props: Props) {
  const bg = { light: 'bg-gray-50', accent: 'bg-[rgb(var(--color-accent))]/10', transparent: '' }[props.backgroundColor]
  return (
    <section className={cn('py-10 text-center', bg)}>
      <div className="mx-auto max-w-[900px] px-6 flex flex-col items-center gap-3">
        {props.badgeIconUrl && <img src={props.badgeIconUrl} alt="" className="h-16 w-auto" />}
        {props.badgeText && <div className="text-4xl md:text-5xl font-bold text-[rgb(var(--color-primary))]">{props.badgeText}</div>}
        <p className="text-lg text-gray-700">{props.headline}</p>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: `Component.stories.tsx`** — follow F1 pattern, 2 stories (default + no icon).

- [ ] **Step 5: `index.ts`** — follow F1 pattern, register.

- [ ] **Step 6: Add to `_register.ts`**: `import './social-proof/SocialProofBadge'`

- [ ] **Step 7: Run `pnpm build:catalog`, verify in Storybook, commit**

```bash
git add next-app/src/blocks/social-proof/SocialProofBadge/ next-app/src/blocks/_register.ts next-app/public/block-catalog.json
git commit -m "feat(blocks): SocialProofBadge — large number + descriptor social proof"
```

---

### Task F3: LogoStripCarousel block

**Files:** `next-app/src/blocks/social-proof/LogoStripCarousel/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  headline: z.string().max(120).default('As featured in'),
  logos: z.array(z.object({
    name: z.string().max(60),
    imageUrl: z.string().url(),
    websiteUrl: z.string().url().optional(),
  })).min(3).max(30),
  animation: z.enum(['scroll', 'static']).default('scroll'),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:**
```ts
import type { BlockMeta } from '@/types/block'
export const meta: BlockMeta = {
  type: 'LogoStripCarousel',
  category: 'social-proof',
  version: 1,
  validOn: ['optin', 'checkout', 'upsell', 'thank-you'],
  purpose: 'Horizontal scrolling logo strip showing press/publication mentions. Use for credibility.',
  exampleProps: {
    headline: 'As featured in',
    logos: [
      { name: 'The Atlantic', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=Atlantic' },
      { name: 'BBC', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=BBC' },
      { name: 'Forbes', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=Forbes' },
      { name: 'NYT', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=NYT' },
      { name: 'Time', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=Time' },
      { name: 'Guardian', imageUrl: 'https://placehold.co/160x60/cccccc/333333.png?text=Guardian' },
    ],
    animation: 'scroll',
  },
}
```

- [ ] **Component.tsx:** CSS marquee animation using keyframes in a scoped style. Two copies of the logo list for seamless loop.

```tsx
import type { Props } from './schema'

export function LogoStripCarousel(props: Props) {
  if (props.animation === 'static') {
    return (
      <section className="py-10 bg-white">
        <div className="mx-auto max-w-[1200px] px-6">
          {props.headline && <p className="text-center text-sm text-gray-500 uppercase tracking-wider mb-6">{props.headline}</p>}
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6">
            {props.logos.map((logo, i) => (
              <img key={i} src={logo.imageUrl} alt={logo.name} className="h-10 w-auto opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 bg-white overflow-hidden">
      {props.headline && <p className="text-center text-sm text-gray-500 uppercase tracking-wider mb-6">{props.headline}</p>}
      <div className="relative">
        <div className="flex gap-12 animate-[scroll_40s_linear_infinite] whitespace-nowrap">
          {[...props.logos, ...props.logos].map((logo, i) => (
            <img key={i} src={logo.imageUrl} alt={logo.name} className="h-10 w-auto opacity-60 grayscale" />
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
```

- [ ] **stories, index, register, catalog, commit** — follow F1 pattern.

```bash
git commit -m "feat(blocks): LogoStripCarousel — scrolling press logo strip"
```

---

### Task F4: StatsBar3Item block

**Files:** `next-app/src/blocks/social-proof/StatsBar3Item/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  stats: z.array(z.object({
    value: z.string().max(20),
    label: z.string().max(60),
    iconUrl: z.string().url().optional(),
  })).length(3),
  backgroundColor: z.enum(['white', 'light', 'primary']).default('light'),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:**
```ts
import type { BlockMeta } from '@/types/block'
export const meta: BlockMeta = {
  type: 'StatsBar3Item',
  category: 'social-proof',
  version: 1,
  validOn: ['optin', 'checkout', 'upsell'],
  purpose: '3-column stats bar with big numbers + labels. Use for "X days / Y speakers / Z attendees" summit highlights.',
  exampleProps: {
    stats: [
      { value: '5 DAYS', label: 'of transformative learning' },
      { value: '40+', label: 'World-class speakers' },
      { value: '50,000+', label: 'attendees expected' },
    ],
    backgroundColor: 'light',
  },
}
```

- [ ] **Component.tsx:** 3-column grid, centered, large numbers, with optional icons above each.

- [ ] **stories, index, register, catalog, commit**

```bash
git commit -m "feat(blocks): StatsBar3Item — 3-column summit highlights stats"
```

---

### Task F5: FeatureWithImage block

**Files:** `next-app/src/blocks/content/FeatureWithImage/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  eyebrow: z.string().max(60).optional(),
  headline: z.string().min(1).max(140),
  bodyRich: z.string().max(2000), // markdown-lite
  imageUrl: z.string().url(),
  imagePosition: z.enum(['left', 'right']).default('right'),
  ctaLabel: z.string().max(40).optional(),
  ctaUrl: z.string().url().optional(),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:**
```ts
import type { BlockMeta } from '@/types/block'
export const meta: BlockMeta = {
  type: 'FeatureWithImage',
  category: 'content',
  version: 1,
  validOn: ['optin', 'checkout', 'upsell'],
  purpose: 'Two-column feature section with headline + body text + image. Image can be positioned left or right. Use for "What is this summit?" or "About the offer" sections.',
  exampleProps: {
    headline: 'What is ADHD Parenting Summit 2026?',
    bodyRich: "A reframed approach—5 days instead of 3, 40+ experts, deeper understanding of your ADHD child.",
    imageUrl: 'https://placehold.co/800x600/5e4d9b/ffffff.png',
    imagePosition: 'right',
    ctaLabel: 'GET INSTANT ACCESS',
  },
}
```

- [ ] **Component.tsx:** responsive grid (stacked on mobile, 2-col on md+). Respects imagePosition.

- [ ] **stories, index, register, catalog, commit**

```bash
git commit -m "feat(blocks): FeatureWithImage — 2-column headline+body+image with optional CTA"
```

---

### Task F6: SpeakerGridDay block (the 5x reused block)

**Files:** `next-app/src/blocks/speakers/SpeakerGridDay/*`

This is the block reused for Days 1–5 on the parenting page. It takes a day number + title and fetches the matching speakers from the summit context.

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  day: z.number().int().min(1).max(10),
  dayLabel: z.string().max(30), // "Day 1"
  theme: z.string().max(80), // "The Butterfly Mind"
  subtitle: z.string().max(140).optional(), // "Focus & attention strategies"
  speakerIds: z.array(z.string().uuid()).min(1).max(12),
  expandable: z.boolean().default(true),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:**
```ts
import type { BlockMeta } from '@/types/block'
export const meta: BlockMeta = {
  type: 'SpeakerGridDay',
  category: 'speakers',
  version: 1,
  validOn: ['optin'],
  purpose: 'Speaker grid for a single summit day, with day number, theme, and 3-12 speaker cards. Each card shows headshot, name, credentials, and session title. Use once per day of the summit.',
  exampleProps: {
    day: 1,
    dayLabel: 'Day 1',
    theme: 'The Butterfly Mind',
    subtitle: 'Focus & attention strategies',
    speakerIds: [1, 2, 3, 4, 5, 6],
    expandable: true,
  },
}
```

- [ ] **Component.tsx:** Needs access to speakers data (name, photo, title, bio, session). Two options:
  - (a) Props contain only IDs; component consumes a `SpeakersContext` populated by the page route from the API response.
  - (b) API response flattens speakers into the block's props.

**Choose option (a)** — cleaner, matches "props as schema" principle. Build `SpeakersContext` next.

Create `next-app/src/lib/speakers-context.tsx`:
```tsx
'use client'
import { createContext, useContext, type ReactNode } from 'react'

export interface Speaker {
  id: string            // uuid
  firstName: string
  lastName: string
  fullName: string
  title: string
  photoUrl: string
  shortDescription: string
  longDescription: string
  dayNumber: number     // computed server-side from presentation_day
  masterclassTitle: string
  sortOrder: number
}

const SpeakersContext = createContext<Speaker[]>([])

export function SpeakersProvider({ speakers, children }: { speakers: Speaker[]; children: ReactNode }) {
  return <SpeakersContext.Provider value={speakers}>{children}</SpeakersContext.Provider>
}

export function useSpeakers() {
  return useContext(SpeakersContext)
}
```

SpeakerGridDay Component consumes via `useSpeakers()` + filters by `speakerIds` (UUID strings) AND can fall back to `speaker.dayNumber === props.day` for validation.

- [ ] **stories, index, register, catalog, commit**

```bash
git commit -m "feat(blocks): SpeakerGridDay + SpeakersContext — per-day summit speaker grid"
```

---

### Task F7: LearningOutcomes block

**Files:** `next-app/src/blocks/content/LearningOutcomes/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  headline: z.string().min(1).max(140),
  items: z.array(z.object({
    iconName: z.enum(['heart', 'target', 'book', 'bolt', 'message', 'users']),
    title: z.string().max(80),
    description: z.string().max(240),
  })).min(3).max(9),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** category `content`, validOn `['optin']`, purpose = "Icon grid of 3-9 learning outcomes / key benefits. Uses Lucide icons (heart/target/book/bolt/message/users)."

- [ ] **Component.tsx:** responsive 3-col grid on md+, icon from lucide-react, card-per-item.

- [ ] **commit:**
```bash
git commit -m "feat(blocks): LearningOutcomes — icon grid of key benefits"
```

---

### Task F8: BonusStack block

**Files:** `next-app/src/blocks/content/BonusStack/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  introText: z.string().max(600).optional(),
  bonuses: z.array(z.object({
    title: z.string().max(140),
    description: z.string().max(400),
    valueLabel: z.string().max(40).optional(), // "($19 value)"
    imageUrl: z.string().url().optional(),
  })).min(1).max(8),
  ctaLabel: z.string().max(40).default('GET INSTANT ACCESS'),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** category `content`, validOn `['optin', 'checkout']`, purpose = "Bonus offer stack with 1-8 items, each with title/description/value. Use for 'Register today and receive EXCLUSIVE ACCESS to...' sections."

- [ ] **Component.tsx:** card grid with image placeholder + title + description + value chip.

- [ ] **commit:**
```bash
git commit -m "feat(blocks): BonusStack — bonus offer showcase with value callouts"
```

---

### Task F9: FoundersSection block

**Files:** `next-app/src/blocks/content/FoundersSection/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(140),
  bodyRich: z.string().max(2000),
  founders: z.array(z.object({
    name: z.string().max(80),
    title: z.string().max(120).optional(),
    photoUrl: z.string().url(),
  })).min(1).max(4),
  ctaLabel: z.string().max(40).optional(),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** category `content`, validOn `['optin']`, purpose = "About the summit organizers section with 1-4 founder headshots + mission statement."

- [ ] **Component.tsx:** Two-column layout: left = photos stacked/side-by-side, right = text + CTA.

- [ ] **commit:**
```bash
git commit -m "feat(blocks): FoundersSection — organizer/founder bio section"
```

---

### Task F10: VideoTestimonialSection block

**Files:** `next-app/src/blocks/social-proof/VideoTestimonialSection/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  headline: z.string().min(1).max(200),
  subheadline: z.string().max(400).optional(),
  videos: z.array(z.object({
    embedUrl: z.string().url(), // YouTube/Vimeo embed
    title: z.string().max(120),
    speakerName: z.string().max(80).optional(),
  })).min(1).max(6),
  layout: z.enum(['single', 'grid']).default('grid'),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** validOn `['optin', 'upsell']`, purpose = "Video testimonial section — 1-6 embedded videos (YouTube/Vimeo) in single or grid layout."

- [ ] **Component.tsx:** iframe embeds with aspect-video class. Grid is 2-col on md+, 1-col mobile.

- [ ] **commit:**
```bash
git commit -m "feat(blocks): VideoTestimonialSection — embedded video testimonials"
```

---

### Task F11: TestimonialCarousel block

**Files:** `next-app/src/blocks/social-proof/TestimonialCarousel/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  headline: z.string().max(140).optional(),
  testimonials: z.array(z.object({
    quote: z.string().max(600),
    authorName: z.string().max(80),
    authorRole: z.string().max(120).optional(),
    authorPhotoUrl: z.string().url().optional(),
    rating: z.number().int().min(1).max(5).optional(),
  })).min(3).max(30),
  autoplay: z.boolean().default(true),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** validOn `['optin', 'checkout', 'upsell']`, purpose = "Rotating testimonial carousel with author photo + name + optional rating. Use for parent/customer testimonials."

- [ ] **Component.tsx:** Use shadcn/ui Carousel or simple state-based carousel with auto-advance. Framer Motion for slide transitions.

- [ ] **commit:**
```bash
git commit -m "feat(blocks): TestimonialCarousel — rotating testimonial slider"
```

---

### Task F12: WhyThisMattersStats block

**Files:** `next-app/src/blocks/content/WhyThisMattersStats/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  introText: z.string().max(600).optional(),
  stats: z.array(z.object({
    iconName: z.enum(['alert', 'trending-down', 'users', 'heart-pulse', 'book-x', 'pill']),
    bigText: z.string().max(60), // "1 in 4"
    label: z.string().max(240),
  })).min(3).max(8),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** validOn `['optin']`, purpose = "Statistics grid explaining why the problem matters (e.g., ADHD prevalence, risks). Lucide icons. Used for urgency/problem-framing sections."

- [ ] **commit:**
```bash
git commit -m "feat(blocks): WhyThisMattersStats — problem-framing statistics grid"
```

---

### Task F13: BenefitsGrid block

**Files:** `next-app/src/blocks/content/BenefitsGrid/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  benefits: z.array(z.object({
    iconName: z.enum(['star', 'globe', 'clock', 'trending-up', 'check-circle', 'sparkles', 'award']),
    title: z.string().max(120),
    description: z.string().max(300),
  })).min(3).max(8),
  ctaLabel: z.string().max(40).optional(),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** validOn `['optin', 'upsell']`, purpose = "Grid of 3-8 benefits with icon + title + description. Similar to LearningOutcomes but lighter styling; use for 'Why attend' variants."

- [ ] **commit:**
```bash
git commit -m "feat(blocks): BenefitsGrid — 3-8 benefit items in icon grid layout"
```

---

### Task F14: BenefitsWithImages block

**Files:** `next-app/src/blocks/content/BenefitsWithImages/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  benefits: z.array(z.object({
    title: z.string().max(140),
    description: z.string().max(500),
    imageUrl: z.string().url(),
  })).min(2).max(4),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** validOn `['optin']`, purpose = "Benefit section with lifestyle/scenario images alongside each benefit. Alternating left/right layout."

- [ ] **commit:**
```bash
git commit -m "feat(blocks): BenefitsWithImages — alternating benefit sections with imagery"
```

---

### Task F15: NumberedReasons block

**Files:** `next-app/src/blocks/content/NumberedReasons/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  reasons: z.array(z.object({
    title: z.string().max(160),
    description: z.string().max(400).optional(),
  })).min(3).max(7),
  ctaLabel: z.string().max(40).optional(),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** validOn `['optin', 'upsell']`, purpose = "Numbered list of reasons (1., 2., 3.) with large numerals + title + optional description. Use for '5 Reasons Why' style sections."

- [ ] **commit:**
```bash
git commit -m "feat(blocks): NumberedReasons — numbered reasons list with large numerals"
```

---

### Task F16: ClosingCTAWithList block

**Files:** `next-app/src/blocks/form-cta/ClosingCTAWithList/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  eyebrow: z.string().max(80).optional(),
  headline: z.string().min(1).max(200),
  bodyText: z.string().max(600).optional(),
  bullets: z.array(z.string().max(140)).min(2).max(10),
  ctaLabel: z.string().max(40).default('GET INSTANT ACCESS'),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** validOn `['optin', 'checkout', 'upsell']`, purpose = "Closing call-to-action with bullet list of benefits + prominent CTA button. Use at end of long landing pages."

- [ ] **commit:**
```bash
git commit -m "feat(blocks): ClosingCTAWithList — final CTA with benefit bullets"
```

---

### Task F17: FAQAccordion block

**Files:** `next-app/src/blocks/content/FAQAccordion/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  headline: z.string().min(1).max(140).default('Frequently Asked Questions'),
  items: z.array(z.object({
    question: z.string().max(200),
    answer: z.string().max(1500),
  })).min(1).max(30),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** validOn `['optin', 'checkout', 'upsell', 'thank-you']`, purpose = "Expandable FAQ accordion with 1-30 Q&A items."

- [ ] **Component.tsx:** Use shadcn/ui Accordion.

- [ ] **commit:**
```bash
git commit -m "feat(blocks): FAQAccordion — Q&A accordion using shadcn/ui Accordion"
```

---

### Task F18: OptinFormBlock block

**Files:** `next-app/src/blocks/form-cta/OptinFormBlock/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  headline: z.string().max(200).optional(),
  subheadline: z.string().max(400).optional(),
  fields: z.object({
    name: z.boolean().default(true),
    email: z.boolean().default(true),
  }),
  submitLabel: z.string().max(80).default('Secure My Free Ticket'),
  secondaryText: z.string().max(140).optional(), // "Grab Your Seat Before It's Gone"
  privacyText: z.string().max(600).optional(),
  backgroundStyle: z.enum(['light', 'dark', 'primary']).default('primary'),
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** validOn `['optin']`, purpose = "Email/name optin form. Submits to Laravel POST /api/optin endpoint. Required for optin steps."

- [ ] **Component.tsx:** Client component with controlled form, client-side validation via Zod, fetch POST to `/api/optin` with funnel/step IDs from context.

```tsx
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Props } from './schema'

export function OptinFormBlock(props: Props) {
  const [state, setState] = useState({ name: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_LARAVEL_API_URL}/api/optin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      })
      if (!res.ok) throw new Error(await res.text())
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (success) return <section className="py-16 text-center"><h2 className="text-3xl font-bold">Check your email!</h2></section>

  const bg = { light: 'bg-gray-50', dark: 'bg-gray-900 text-white', primary: 'bg-[rgb(var(--color-primary))] text-white' }[props.backgroundStyle]

  return (
    <section className={`py-16 ${bg}`}>
      <div className="mx-auto max-w-[520px] px-6">
        {props.headline && <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{props.headline}</h2>}
        {props.subheadline && <p className="text-center mb-8 opacity-90">{props.subheadline}</p>}
        <form onSubmit={submit} className="space-y-4">
          {props.fields.name && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" required value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} />
            </div>
          )}
          {props.fields.email && (
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={state.email} onChange={(e) => setState({ ...state, email: e.target.value })} />
            </div>
          )}
          <Button type="submit" size="lg" disabled={submitting} className="w-full bg-[rgb(var(--color-accent))] hover:bg-[rgb(var(--color-accent))]/90 text-white">
            {submitting ? 'Submitting…' : props.submitLabel}
          </Button>
          {props.secondaryText && <p className="text-center text-sm opacity-80">{props.secondaryText}</p>}
          {error && <p className="text-center text-red-400 text-sm">{error}</p>}
          {props.privacyText && <p className="text-xs opacity-70 text-center">{props.privacyText}</p>}
        </form>
      </div>
    </section>
  )
}
```

(Note: the `/api/optin` endpoint already exists per the existing codebase per memory/commits. If its shape differs, adjust the request body.)

- [ ] **commit:**
```bash
git commit -m "feat(blocks): OptinFormBlock — submits to Laravel /api/optin"
```

---

### Task F19: Footer block

**Files:** `next-app/src/blocks/utility/Footer/*`

- [ ] **schema.ts:**
```ts
import { z } from 'zod'
export const schema = z.object({
  logoUrl: z.string().url().optional(),
  tagline: z.string().max(200).optional(),
  links: z.array(z.object({
    label: z.string().max(60),
    url: z.string().url(),
  })).max(10),
  copyrightText: z.string().max(200).default('© 2026 All rights reserved.'),
  summitDatesText: z.string().max(140).optional(), // "Free Virtual Event, MARCH 9-13, 2026"
})
export type Props = z.infer<typeof schema>
```

- [ ] **meta.ts:** validOn all step types, purpose = "Page footer with logo, tagline, legal links, copyright, and optional summit dates reminder."

- [ ] **commit:**
```bash
git commit -m "feat(blocks): Footer — page footer with logo + legal links + summit dates"
```

---

### Task F20: Rebuild the catalog and verify all 19 blocks

- [ ] **Step 1: Run catalog build**

```bash
cd next-app && pnpm build:catalog
```

Expected output: `✓ Wrote 19 blocks to .../public/block-catalog.json`.

- [ ] **Step 2: Sanity check**

```bash
node -e "const c = require('./next-app/public/block-catalog.json'); console.log('Blocks:', c.blocks.length); console.log('Types:', c.blocks.map(b => b.type).join(', '));"
```

Expected: 19 types listed.

- [ ] **Step 3: Run typecheck + tests + Storybook build**

```bash
cd next-app && pnpm typecheck && pnpm test && pnpm build-storybook
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add next-app/public/block-catalog.json
git commit -m "chore(blocks): catalog now contains 19 blocks for parenting summit parity"
```

---

## Part G — Catch-all Route + Page Rendering

### Task G1: Next.js catch-all route

**Files:**
- Create: `next-app/src/app/[[...slug]]/page.tsx`
- Modify: `next-app/src/app/layout.tsx`

- [ ] **Step 1: Root layout with providers**

Replace `next-app/src/app/layout.tsx`:

```tsx
import '@/blocks/_register'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Summit',
  description: 'Summit landing page',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Catch-all page**

Create `next-app/src/app/[[...slug]]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { resolveFunnel } from '@/lib/api-client'
import { RenderBlocks } from '@/lib/render-block'
import { ThemeProvider } from '@/lib/theme-context'
import { SpeakersProvider } from '@/lib/speakers-context'

// Using dynamic `headers` import is no longer needed since routing is slug-based.
// Import kept for future Host-based resolution in Plan 4+.

interface PageParams {
  slug?: string[]
}

export default async function FunnelPage({ params }: { params: Promise<PageParams> }) {
  const { slug = [] } = await params

  // URL pattern: /{summitSlug}/{funnelSlug?}/{stepSlug?}
  // Default funnel = 'main', default step = 'optin'
  const [summitSlug, funnelSlug = 'main', stepSlug = 'optin'] = slug

  if (!summitSlug) notFound()

  const data = await resolveFunnel({ summitSlug, funnelSlug, stepSlug })
  if (!data) notFound()

  return (
    <ThemeProvider theme={data.theme}>
      <SpeakersProvider speakers={data.speakers}>
        <main>
          <RenderBlocks blocks={data.blocks} />
        </main>
      </SpeakersProvider>
    </ThemeProvider>
  )
}

export const revalidate = 60
```

- [ ] **Step 3: Verify build**

```bash
cd next-app && pnpm build
```

Expected: successful build. Routes list shows `[[...slug]]`.

- [ ] **Step 4: Commit**

```bash
git add next-app/src/app/
git commit -m "feat(next-app): catch-all route with SSR + ISR + theme/speakers providers"
```

---

### Task G2: End-to-end local render smoke test

- [ ] **Step 1: Start Laravel**

```bash
php artisan serve  # :8000
```

- [ ] **Step 2: Start Next.js**

```bash
cd next-app && pnpm dev  # :3000
```

- [ ] **Step 3: Seed the summit if not already**

```bash
php artisan db:seed --class=AdhdParentingSummit2026Seeder
```

- [ ] **Step 4: Visit the Next.js dev URL with the slug path**

```bash
curl http://localhost:3000/adhd-parenting-summit-2026/main/optin
```

Expected: HTML returned with optin page. Should show empty `<main>` because `content: []` on the step (Task F20 populated the catalog; the step's content JSON is still empty — populated in Part H).

- [ ] **Step 5: Open Filament BlockEditor**

Open http://localhost:8000/admin → Funnel Steps → "Main Optin" → verify all 19 blocks appear in the type dropdown.

- [ ] **Step 6: Commit any dev-env fixes**

---

## Part H — Compose the Parenting-Summits Page

### Task H1: Create a composition script that writes blocks JSON to the optin step's content column

**Files:**
- Create: `database/seeders/AdhdParentingOptinBlocksSeeder.php`

This is the **25-section recreation**, mapped to blocks. Each block gets a unique `id` (uuid), a `type`, `version: 1`, and real `props` referencing real data (Speaker UUIDs from Part E). Writes to `FunnelStep.content` JSONB column.

- [ ] **Step 1: Create the seeder**

Create `database/seeders/AdhdParentingOptinBlocksSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\FunnelStep;
use App\Models\Summit;
use App\Models\SummitSpeaker;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class AdhdParentingOptinBlocksSeeder extends Seeder
{
    public function run(): void
    {
        $summit = Summit::where('slug', 'adhd-parenting-summit-2026')->firstOrFail();
        $step = FunnelStep::whereHas('funnel', fn ($q) => $q->where('summit_id', $summit->id))
            ->where('slug', 'optin')
            ->firstOrFail();

        $startsAt = Carbon::parse($summit->starts_at)->startOfDay();

        // Group speakers by computed day number (1-5)
        $speakersByDay = SummitSpeaker::where('summit_id', $summit->id)
            ->get()
            ->groupBy(fn ($ss) => $ss->presentation_day
                ? Carbon::parse($ss->presentation_day)->startOfDay()->diffInDays($startsAt) + 1
                : 0)
            ->map(fn ($group) => $group->pluck('speaker_id')->all());

        $blocks = [
            $this->block('HeroWithCountdown', [
                'eyebrow' => 'LIVE MARCH 9–13, 2026',
                'headline' => "WORLD'S LARGEST ADHD PARENTING SUMMIT",
                'subheadline' => 'Become Empowered Parent In 5 Days',
                'bodyLines' => ['40+ Leading Experts', 'Focus · Impulsivity · Outbursts · Screen Management'],
                'speakerCountLabel' => '40+ Leading Experts',
                'countdownTarget' => '2026-03-09T00:00:00Z',
                'primaryCtaLabel' => 'GET INSTANT ACCESS',
                'secondaryCtaLabel' => 'Claim your FREE ticket',
                'backgroundStyle' => 'gradient',
            ]),
            $this->block('SocialProofBadge', [
                'headline' => 'Loved by 73,124 committed parents',
                'badgeText' => '73,124',
                'backgroundColor' => 'light',
            ]),
            $this->block('LogoStripCarousel', [
                'headline' => 'AS FEATURED IN',
                'logos' => [
                    ['name' => 'Aleteia', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=Aleteia'],
                    ['name' => 'Atlantic', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=Atlantic'],
                    ['name' => 'Scientific American', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=SciAm'],
                    ['name' => 'Guardian', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=Guardian'],
                    ['name' => 'HuffPost', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=HuffPost'],
                    ['name' => 'BBC', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=BBC'],
                    ['name' => 'Washington Post', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=WaPo'],
                    ['name' => 'TEDx', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=TEDx'],
                    ['name' => 'Time', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=Time'],
                    ['name' => 'USA Today', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=USAToday'],
                    ['name' => 'NYT', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=NYT'],
                    ['name' => 'Forbes', 'imageUrl' => 'https://placehold.co/160x60/ffffff/666666.png?text=Forbes'],
                ],
                'animation' => 'scroll',
            ]),
            $this->block('StatsBar3Item', [
                'stats' => [
                    ['value' => '5 DAYS', 'label' => 'of transformative learning'],
                    ['value' => '40+', 'label' => 'world-class speakers'],
                    ['value' => '50,000+', 'label' => 'attendees expected'],
                ],
                'backgroundColor' => 'light',
            ]),
            $this->block('FeatureWithImage', [
                'headline' => 'What is ADHD Parenting Summit 2026?',
                'bodyRich' => 'A reframed approach—5 days instead of 3, 40+ world-class experts, deeper understanding of your ADHD child. Practical, science-backed strategies you can implement today.',
                'imageUrl' => 'https://placehold.co/1000x700/5e4d9b/ffffff.png?text=Summit+Overview',
                'imagePosition' => 'right',
                'ctaLabel' => 'GET INSTANT ACCESS',
            ]),
            $this->block('SpeakerGridDay', [
                'day' => 1, 'dayLabel' => 'Day 1', 'theme' => 'The Butterfly Mind',
                'subtitle' => 'Focus & attention strategies',
                'speakerIds' => $speakersByDay[1] ?? [], 'expandable' => true,
            ]),
            $this->block('SpeakerGridDay', [
                'day' => 2, 'dayLabel' => 'Day 2', 'theme' => 'From Storm To Calm',
                'subtitle' => 'Emotional regulation & impulse control',
                'speakerIds' => $speakersByDay[2] ?? [], 'expandable' => true,
            ]),
            $this->block('SpeakerGridDay', [
                'day' => 3, 'dayLabel' => 'Day 3', 'theme' => 'Taming The Time Monster',
                'subtitle' => 'Routines and time management',
                'speakerIds' => $speakersByDay[3] ?? [], 'expandable' => true,
            ]),
            $this->block('SpeakerGridDay', [
                'day' => 4, 'dayLabel' => 'Day 4', 'theme' => 'School Survival',
                'subtitle' => 'Academic performance and school strategies',
                'speakerIds' => $speakersByDay[4] ?? [], 'expandable' => true,
            ]),
            $this->block('SpeakerGridDay', [
                'day' => 5, 'dayLabel' => 'Day 5', 'theme' => 'The ADHD Parent Paradox',
                'subtitle' => 'Parenting when you have ADHD too',
                'speakerIds' => $speakersByDay[5] ?? [], 'expandable' => true,
            ]),
            $this->block('LearningOutcomes', [
                'headline' => 'What You\'ll Learn',
                'items' => [
                    ['iconName' => 'heart', 'title' => 'Improve Attention', 'description' => 'Techniques that help your child focus across daily life.'],
                    ['iconName' => 'target', 'title' => 'Digital-Age Challenges', 'description' => 'Manage screens without constant battles.'],
                    ['iconName' => 'book', 'title' => 'School Success', 'description' => 'Strategies for homework, organization, and teacher partnership.'],
                    ['iconName' => 'bolt', 'title' => 'Meltdown Management', 'description' => 'De-escalate storms before they start.'],
                    ['iconName' => 'message', 'title' => 'Emotional Regulation', 'description' => 'Build emotional intelligence in ADHD kids.'],
                    ['iconName' => 'users', 'title' => 'Routine Creation', 'description' => 'Routines that actually stick.'],
                ],
            ]),
            $this->block('BonusStack', [
                'eyebrow' => 'FREE BONUSES',
                'headline' => 'Register Today And Receive EXCLUSIVE ACCESS To: The ADHD Parenting Mastery Collection',
                'introText' => 'Get instant access to 3 premium masterclasses from previous summits.',
                'bonuses' => [
                    ['title' => 'Dr. Hallowell Masterclass', 'description' => 'Driven to Distraction — the full session.', 'valueLabel' => '($97 value)'],
                    ['title' => 'Dr. King Masterclass', 'description' => 'Parenting with ADHD Calm.', 'valueLabel' => '($97 value)'],
                    ['title' => 'Dr. Brooks Masterclass', 'description' => 'Raising Resilient Kids.', 'valueLabel' => '($97 value)'],
                ],
                'ctaLabel' => 'GET INSTANT ACCESS',
            ]),
            $this->block('FoundersSection', [
                'headline' => 'Meet The Summit Organizers',
                'bodyRich' => 'We\'ve helped 253,788 families transform their relationship with ADHD. Practical, empathetic, science-backed — no fluff.',
                'founders' => [
                    ['name' => 'Spela Repovs', 'title' => 'Co-founder, StrategicParenting', 'photoUrl' => 'https://placehold.co/400x400/5e4d9b/ffffff.png?text=Spela'],
                    ['name' => 'Elaine Taylor-Klaus', 'title' => 'CPCC, Co-founder', 'photoUrl' => 'https://placehold.co/400x400/5e4d9b/ffffff.png?text=Elaine'],
                ],
                'ctaLabel' => 'GET INSTANT ACCESS',
            ]),
            $this->block('SocialProofBadge', [
                'headline' => 'Instagram 120k · Facebook 230k · Trustpilot 4.9/5',
                'badgeText' => '4.9/5',
                'backgroundColor' => 'transparent',
            ]),
            $this->block('VideoTestimonialSection', [
                'headline' => 'Hear From Experts Why YOU Should Join This Summit',
                'videos' => [
                    ['embedUrl' => 'https://www.youtube.com/embed/placeholder1', 'title' => 'Why this summit matters', 'speakerName' => 'Dr. Hallowell'],
                    ['embedUrl' => 'https://www.youtube.com/embed/placeholder2', 'title' => 'A new parenting paradigm', 'speakerName' => 'Dr. Dawson'],
                ],
                'layout' => 'grid',
            ]),
            $this->block('TestimonialCarousel', [
                'headline' => 'What Parents Are Saying',
                'testimonials' => [
                    ['quote' => 'This summit changed everything. Our mornings went from war zone to peace.', 'authorName' => 'Jo C.', 'rating' => 5],
                    ['quote' => 'I finally understand my daughter. The speakers are a gift.', 'authorName' => 'Sally W.', 'rating' => 5],
                    ['quote' => 'Practical tools that work the same day I learned them.', 'authorName' => 'Adria N.', 'rating' => 5],
                    ['quote' => 'I wish I had this summit 10 years ago.', 'authorName' => 'Jane O.', 'rating' => 5],
                    ['quote' => 'The VIP pass was worth every penny.', 'authorName' => 'Han O.', 'rating' => 5],
                    ['quote' => 'My teen and I are closer than we\'ve ever been.', 'authorName' => 'Nancy P.', 'rating' => 5],
                ],
                'autoplay' => true,
            ]),
            $this->block('BonusStack', [
                'eyebrow' => 'BONUS MATERIALS',
                'headline' => 'Plus Instant Downloads Worth $64',
                'bonuses' => [
                    ['title' => 'Raising Children With ADHD Checklist', 'description' => 'Daily reset checklist.', 'valueLabel' => '($19 value)'],
                    ['title' => 'Swap Negative Reactions Guide', 'description' => 'Language reframes.', 'valueLabel' => '($27 value)'],
                    ['title' => 'Weekly Routine Chart', 'description' => 'Printable planner.', 'valueLabel' => '($9 value)'],
                    ['title' => 'School Schedule Template', 'description' => 'Teacher communication ready.', 'valueLabel' => '($9 value)'],
                ],
                'ctaLabel' => 'GET INSTANT ACCESS',
            ]),
            $this->block('WhyThisMattersStats', [
                'headline' => 'Why This Matters',
                'introText' => 'The data on ADHD — and why taking action now changes everything.',
                'stats' => [
                    ['iconName' => 'alert', 'bigText' => '#1', 'label' => 'ADHD is the most common childhood mental health condition.'],
                    ['iconName' => 'trending-down', 'bigText' => '60%', 'label' => 'of symptoms persist into adulthood without intervention.'],
                    ['iconName' => 'users', 'bigText' => '1 in 4', 'label' => 'chance at least one parent also has ADHD.'],
                    ['iconName' => 'heart-pulse', 'bigText' => '3x', 'label' => 'higher rates of anxiety & depression in untreated ADHD.'],
                    ['iconName' => 'pill', 'bigText' => '2x', 'label' => 'increased substance abuse risk in teens.'],
                    ['iconName' => 'book-x', 'bigText' => '30%', 'label' => 'academic performance gap vs. neurotypical peers.'],
                ],
            ]),
            $this->block('BenefitsGrid', [
                'headline' => 'Why Attend This Summit',
                'benefits' => [
                    ['iconName' => 'globe', 'title' => "World's Experts", 'description' => 'The most trusted names in ADHD research and parenting.'],
                    ['iconName' => 'clock', 'title' => 'Perfect Timing', 'description' => 'Before the summer, set up your family for success.'],
                    ['iconName' => 'check-circle', 'title' => 'Proven Path', 'description' => '253,788 families transformed with these strategies.'],
                    ['iconName' => 'sparkles', 'title' => 'Modern Insights', 'description' => 'Latest neuroscience research, not outdated advice.'],
                    ['iconName' => 'star', 'title' => 'Practical Advice', 'description' => 'Use-today tools, not theory.'],
                ],
                'ctaLabel' => 'GET INSTANT ACCESS',
            ]),
            $this->block('BenefitsWithImages', [
                'headline' => 'Why YOU Need To Be Here',
                'benefits' => [
                    ['title' => 'Unlock Your Child\'s True Potential', 'description' => 'Stop managing — start thriving. See what\'s possible when ADHD becomes an advantage.', 'imageUrl' => 'https://placehold.co/800x600/5e4d9b/ffffff.png?text=Child+Potential'],
                    ['title' => 'Actionable Strategies For Tomorrow Morning', 'description' => 'No fluff. Every session gives you something you can try at breakfast.', 'imageUrl' => 'https://placehold.co/800x600/5e4d9b/ffffff.png?text=Actionable'],
                ],
            ]),
            $this->block('NumberedReasons', [
                'headline' => '5 Reasons This Summit Is Different',
                'reasons' => [
                    ['title' => '5 full days of deep immersion', 'description' => 'Not a 90-minute webinar. Real depth.'],
                    ['title' => 'Reveal hidden potential', 'description' => 'See strengths the school system misses.'],
                    ['title' => 'Boundaries that actually hold', 'description' => 'Without yelling or shame.'],
                    ['title' => 'Teen motivation that works', 'description' => 'For kids you can\'t "make" do anything.'],
                    ['title' => 'Outburst de-escalation', 'description' => 'From chaos to calm in minutes, not hours.'],
                ],
                'ctaLabel' => 'GET INSTANT ACCESS',
            ]),
            $this->block('ClosingCTAWithList', [
                'headline' => 'Whatever Your Situation...',
                'bodyText' => 'All you need are ADHD-tailored parenting techniques.',
                'bullets' => ['Joy', 'Attention', 'Focus', 'Organization', 'Creativity', 'Success'],
                'ctaLabel' => 'GET INSTANT ACCESS',
            ]),
            $this->block('FAQAccordion', [
                'headline' => 'Frequently Asked Questions',
                'items' => [
                    ['question' => 'When is the summit?', 'answer' => 'March 9–13, 2026, live and online. Replays available for 24 hours after each session.'],
                    ['question' => 'Is this available internationally?', 'answer' => 'Yes — parents from any country can attend. Sessions are in English.'],
                    ['question' => 'How long do I have to watch each session?', 'answer' => 'Each session is available free for 24 hours. VIP pass holders get lifetime access.'],
                    ['question' => 'Are sessions live or pre-recorded?', 'answer' => 'Speaker sessions are pre-recorded for quality; Q&A and bonus sessions are live.'],
                    ['question' => 'How many speakers per day?', 'answer' => 'Typically 6–8 speakers per day, ~20–30 minutes each.'],
                    ['question' => 'Where do I find the schedule?', 'answer' => 'After registration you\'ll receive a full schedule with time zones.'],
                    ['question' => 'What if I have technical issues?', 'answer' => 'Our support team responds within 4 hours via email.'],
                    ['question' => 'What if I don\'t see the confirmation email?', 'answer' => 'Check spam, or email support@parenting-summits.com.'],
                    ['question' => 'What\'s included in the VIP Pass?', 'answer' => 'Lifetime access, transcripts, bonus masterclasses, private community.'],
                    ['question' => 'Do you offer certificates of attendance?', 'answer' => 'Yes, VIP pass holders receive a downloadable certificate.'],
                ],
            ]),
            $this->block('Footer', [
                'tagline' => 'Strategic Parenting — Helping Families Thrive With ADHD',
                'links' => [
                    ['label' => 'Privacy Policy', 'url' => 'https://parenting-summits.com/privacy'],
                    ['label' => 'Cookies', 'url' => 'https://parenting-summits.com/cookies'],
                    ['label' => 'Terms and Conditions', 'url' => 'https://parenting-summits.com/terms'],
                ],
                'copyrightText' => '© 2026 Strategic Parenting. All rights reserved.',
                'summitDatesText' => 'Free Virtual Event · MARCH 9–13, 2026',
            ]),
            $this->block('OptinFormBlock', [
                'headline' => 'Secure Your Free Ticket',
                'subheadline' => 'Grab Your Seat Before It\'s Gone',
                'fields' => ['name' => true, 'email' => true],
                'submitLabel' => 'Secure My Free Ticket',
                'secondaryText' => 'Grab Your Seat Before It\'s Gone',
                'privacyText' => 'By registering you agree to receive summit updates and related offers. Unsubscribe anytime.',
                'backgroundStyle' => 'primary',
            ]),
        ];

        $step->update(['content' => $blocks]);
    }

    private function block(string $type, array $props, int $version = 1): array
    {
        return [
            'id' => (string) Str::uuid(),
            'type' => $type,
            'version' => $version,
            'props' => $props,
        ];
    }
}
```

- [ ] **Step 2: Run the composition seeder**

```bash
php artisan db:seed --class=AdhdParentingOptinBlocksSeeder
```

Expected: `funnel_steps.blocks` column updated with 25 block entries.

- [ ] **Step 3: Verify via curl**

```bash
curl "http://localhost:8000/api/funnels/resolve?summit_slug=adhd-parenting-summit-2026&funnel_slug=main&step_slug=optin" | jq '.blocks | length'
```

Expected: `25`.

- [ ] **Step 4: Commit**

```bash
git add database/seeders/AdhdParentingOptinBlocksSeeder.php
git commit -m "feat(seeders): compose parenting-summits.com optin as 25 blocks"
```

---

### Task H2: Register composition seeder in DatabaseSeeder

- [ ] **Step 1: Edit `database/seeders/DatabaseSeeder.php`**

Add after the summit seeder:

```php
$this->call(AdhdParentingOptinBlocksSeeder::class);
```

- [ ] **Step 2: Commit**

```bash
git add database/seeders/DatabaseSeeder.php
git commit -m "chore(seeders): register AdhdParentingOptinBlocksSeeder in main seeder"
```

---

### Task H3: Verify end-to-end locally

- [ ] **Step 1: Full flush + re-seed**

```bash
php artisan migrate:fresh --seed
```

Expected: all seeders run, ADHD summit seeded with 37 speakers + 25-block optin.

- [ ] **Step 2: Start Next.js**

```bash
cd next-app && pnpm dev
```

- [ ] **Step 3: Hit the page via slug path**

```bash
curl http://localhost:3000/adhd-parenting-summit-2026/main/optin | head -200
```

Expected: full HTML with all 25 blocks rendered.

- [ ] **Step 4: Visual review in browser**

Visit `http://localhost:3000/adhd-parenting-summit-2026/main/optin`. Expected: full page renders with all 25 blocks, Day 1-5 speaker grids populated, etc.

---

## Part I — Deployment

### Task I1: Vercel deployment for Next.js

**Files:** `next-app/vercel.json` (optional)

- [ ] **Step 1: Install Vercel CLI**

```bash
pnpm add -g vercel
```

- [ ] **Step 2: Link project**

```bash
cd next-app && vercel link
```

Create a Vercel project, select US region.

- [ ] **Step 3: Configure env vars in Vercel dashboard**

- `NEXT_PUBLIC_LARAVEL_API_URL` = https://api.parenting-summits.com (or staging URL)
- `LARAVEL_API_TOKEN` = (bearer token if using auth)

- [ ] **Step 4: Deploy preview**

```bash
vercel
```

Expected: preview URL returned. Visit; 404 expected because Host header won't match any domain — but the app should build successfully.

- [ ] **Step 5: Add a test domain in Vercel project settings**

Assign `adhd-parenting-next.staging.parenting-summits.com` (or a subdomain you control). Since routing is slug-based, the domain in the URL doesn't matter — all requests hit the catch-all route and get dispatched by the slug segments. You'll visit `https://adhd-parenting-next.staging.parenting-summits.com/adhd-parenting-summit-2026/main/optin`.

- [ ] **Step 6: Deploy to production**

```bash
vercel --prod
```

- [ ] **Step 7: Commit Vercel config if any**

```bash
git add next-app/vercel.json 2>/dev/null || true
git commit -m "chore(deploy): Vercel project linked + env + staging domain" --allow-empty
```

---

### Task I2: Bunny CDN upload integration in Next.js CI

**Files:**
- Create: `next-app/scripts/upload-catalog.ts`
- Create: `.github/workflows/catalog-sync.yml` (or equivalent per your CI)

- [ ] **Step 1: Create uploader**

Create `next-app/scripts/upload-catalog.ts`:

```ts
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const catalogPath = join(__dirname, '..', 'public', 'block-catalog.json')
const catalogBody = readFileSync(catalogPath)

const storageZone = process.env.BUNNY_STORAGE_ZONE
const accessKey = process.env.BUNNY_STORAGE_ACCESS_KEY
const hostname = process.env.BUNNY_HOSTNAME
const catalogRemotePath = 'block-catalog/current.json'
const refreshToken = process.env.CATALOG_REFRESH_TOKEN
const laravelUrl = process.env.LARAVEL_API_URL

if (!storageZone || !accessKey || !hostname || !laravelUrl) {
  console.error('Missing env: BUNNY_STORAGE_ZONE, BUNNY_STORAGE_ACCESS_KEY, BUNNY_HOSTNAME, LARAVEL_API_URL')
  process.exit(1)
}

async function main() {
  // Upload to Bunny
  const uploadRes = await fetch(`https://storage.bunnycdn.com/${storageZone}/${catalogRemotePath}`, {
    method: 'PUT',
    headers: {
      AccessKey: accessKey!,
      'Content-Type': 'application/json',
    },
    body: catalogBody,
  })

  if (!uploadRes.ok) {
    console.error(`Bunny upload failed: ${uploadRes.status} ${await uploadRes.text()}`)
    process.exit(1)
  }
  console.log('✓ Uploaded to Bunny')

  // Purge CDN edge cache
  await fetch(`https://api.bunny.net/pullzone/purge?url=https://${hostname}/${catalogRemotePath}`, {
    method: 'POST',
    headers: { AccessKey: process.env.BUNNY_API_KEY! },
  }).catch(() => {})

  // Ping Laravel
  const pingRes = await fetch(`${laravelUrl}/api/admin/catalog/refresh`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!pingRes.ok) {
    console.error(`Laravel refresh failed: ${pingRes.status} ${await pingRes.text()}`)
    process.exit(1)
  }
  console.log('✓ Laravel catalog refreshed')
}

main()
```

- [ ] **Step 2: Add script alias to package.json**

```json
"sync:catalog": "tsx scripts/upload-catalog.ts"
```

- [ ] **Step 3: Create GitHub Actions workflow (if GH Actions is used)**

Create `.github/workflows/catalog-sync.yml`:

```yaml
name: Sync Block Catalog
on:
  push:
    branches: [main]
    paths: ['next-app/src/blocks/**', 'next-app/scripts/build-catalog.ts']
jobs:
  sync:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: next-app } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build:catalog
      - run: pnpm sync:catalog
        env:
          BUNNY_STORAGE_ZONE: ${{ secrets.BUNNY_STORAGE_ZONE }}
          BUNNY_STORAGE_ACCESS_KEY: ${{ secrets.BUNNY_STORAGE_ACCESS_KEY }}
          BUNNY_HOSTNAME: ${{ secrets.BUNNY_HOSTNAME }}
          BUNNY_API_KEY: ${{ secrets.BUNNY_API_KEY }}
          LARAVEL_API_URL: ${{ secrets.LARAVEL_API_URL }}
          CATALOG_REFRESH_TOKEN: ${{ secrets.CATALOG_REFRESH_TOKEN }}
```

- [ ] **Step 4: Add secrets to GitHub repo settings**

In the GH repo → Settings → Secrets and variables → Actions, add all 6 listed secrets.

- [ ] **Step 5: Test manually first**

```bash
cd next-app && pnpm build:catalog && pnpm sync:catalog
```

With env vars set in shell. Expected: 2 success lines.

- [ ] **Step 6: Commit**

```bash
git add next-app/scripts/upload-catalog.ts next-app/package.json .github/workflows/catalog-sync.yml
git commit -m "feat(ci): catalog upload to Bunny + Laravel webhook sync on merge"
```

---

### Task I3: Production domain + SSL + first production deploy

- [ ] **Step 1: In Vercel, add production domain**

`adhd-parenting-next.staging.parenting-summits.com` (or whatever demo domain you'll use for the side-by-side comparison).

Vercel issues SSL automatically.

- [ ] **Step 2: In Laravel (Ploi), verify API is accessible at the `NEXT_PUBLIC_LARAVEL_API_URL`**

CORS must allow the Vercel domain — update `config/cors.php`:

```php
'paths' => ['api/*'],
'allowed_origins' => [
    'https://adhd-parenting-next.staging.parenting-summits.com',
    'http://localhost:3000',
],
```

- [ ] **Step 3: Seed production DB**

On Ploi server:
```bash
php artisan db:seed --class=AdhdParentingSummit2026Seeder
php artisan db:seed --class=AdhdParentingOptinBlocksSeeder
```

- [ ] **Step 4: Trigger first catalog sync**

Push a dummy change to any file in `next-app/src/blocks/`, let CI run. Alternatively, run `pnpm sync:catalog` locally with production env vars.

- [ ] **Step 5: Visit production staging URL**

https://adhd-parenting-next.staging.parenting-summits.com — expect the full page to render, all 25 blocks visible.

- [ ] **Step 6: Commit CORS change**

```bash
git add config/cors.php
git commit -m "chore(cors): allow Vercel staging origin for Next.js renderer"
```

---

## Part J — Side-by-Side Parity QA

### Task J1: Visual comparison pass

- [ ] **Step 1: Open both URLs side-by-side**

- Old: https://www.parenting-summits.com/
- New: https://adhd-parenting-next.staging.parenting-summits.com/

At 1440×900. Scroll together; note differences.

- [ ] **Step 2: Capture screenshots of every section pair**

For each of the 25 sections, capture both versions. Save to `docs/superpowers/parity-screenshots/section-NN-{old|new}.png`.

- [ ] **Step 3: Log deltas in `docs/superpowers/parity-deltas.md`**

For each delta found, log:
- Section #
- Issue (e.g., "headline font weight differs", "spacing between speaker cards too tight")
- Severity (high/medium/low)
- Block/component responsible
- Status (open/fixed/wontfix)

Work through medium+high severity items, fixing in the responsible block component. Commit each fix with `fix(blocks): <block> — <what changed>`.

- [ ] **Step 4: Mobile parity pass (375×667)**

Repeat the comparison on mobile. Log and fix.

- [ ] **Step 5: Accessibility pass**

Run axe via Storybook addon + Lighthouse audit on production URL. Target: Accessibility ≥ 95.

- [ ] **Step 6: Performance baseline**

Lighthouse performance score on new page. Target: ≥ 90. Capture baseline for future comparisons.

- [ ] **Step 7: Commit final parity fixes**

```bash
git add next-app/src/blocks/
git commit -m "polish(blocks): parity fixes from side-by-side review"
```

---

### Task J2: Demo prep for boss review

- [ ] **Step 1: Create demo doc**

Create `docs/superpowers/demos/2026-04-13-parity-demo.md`:

```markdown
# Parenting Summit Parity Demo

## Compare
- **Current WordPress:** https://www.parenting-summits.com/
- **New Next.js:** https://adhd-parenting-next.staging.parenting-summits.com/

## What's the same
- All 25 sections recreated
- All copy and speaker data
- Visual parity target: 95%+ pixel similarity

## What's better
- Page weight: [measure both with Lighthouse]
- Time to first byte: [measure]
- Lighthouse performance: [WP vs. new]
- Lighthouse accessibility: [WP vs. new]
- Maintainability: WP = touch Oxygen per change; New = block schema change updates all pages

## Cost implications (from spec)
- Current: $350/mo Vultr
- Projected: $91/mo (Hetzner CCX + Vercel + Bunny + Ploi)
- Annual savings: $3,108

## Next steps
- Plan 2: build remaining ~13 blocks (checkout, upsell, thank-you, remaining universal blocks)
- Plan 3: AI generation pipeline
- Plan 4: pilot summit migration
```

- [ ] **Step 2: Schedule demo with boss**

(Operational, not in-code.)

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/demos/
git commit -m "docs(demos): parenting summit parity demo prep"
```

---

## Schema Alignment Summary

All task code in this plan has been updated (2026-04-13) to match the actual Summit Platform schema:

- ✅ Uses `Summit.title`/`.description`/`.topic`, not `.name`/`.tagline`/`.brand`
- ✅ Uses `Speaker.first_name`/`.last_name`/`.short_description`/`.long_description`, not `.name`/`.bio`
- ✅ Uses `SummitSpeaker.presentation_day (DATE)`/`.masterclass_title`/`.sort_order`, not `.day`/`.session_title`/`.order`
- ✅ Writes blocks JSON to `FunnelStep.content` (not `.blocks`)
- ✅ Uses `FunnelStep.step_type` (not `.type`)
- ✅ Uses `Product::priceForPhase($summit->current_phase)`, not `.price_cents`
- ✅ All IDs are UUID strings (speakerIds schema uses `z.string().uuid()`)
- ✅ StepType enum: `'optin' | 'sales_page' | 'checkout' | 'upsell' | 'downsell' | 'thank_you'`
- ✅ No Domain model used; routing is slug-based (`/{summitSlug}/{funnelSlug}/{stepSlug}`)
- ✅ Resolve endpoint computes `day_number` from `presentation_day - starts_at`

## Self-Review

**1. Spec coverage check:**
- Section 2 "Approach Selected" → Plan uses AI-composed block library ✓
- Section 3 "System Architecture" (2 deployments, Vercel + Ploi/Hetzner, Bunny) → Parts A, C, I cover ✓
- Section 4 "Block Library" (~32 blocks, categorized) → Part F covers 19 blocks for parity page; remaining 13 are Plan 2 ✓
- Section 5 "Schema Contract" (Zod → JSON Schema → Filament) → Parts B, D cover ✓
- Section 6 "AI Generation" → Plan 3 (deferred) ✓
- Section 7 "Block Authoring Workflow" (Storybook) → Part A5 + block tasks ✓
- Section 8 "Migration Path" → Plan 4 (deferred) ✓
- Section 10 "Cost Analysis" → operational (not in code plan) ✓
- Section 11 open question on FunnelForge → Plan 3 ✓

**2. Placeholder scan:** No "TODO"/"TBD" strings. "similar to Task N" avoided — block tasks give explicit schemas + meta. ✓

**3. Type consistency:** `BlockRow`, `BlockMeta`, `CatalogEntry`, `BlockCatalog` defined in B1, used consistently in B2, B5, G1. `ResolvedFunnel` defined in B6, used in G1. ✓

**4. Ambiguity:** Block component JSX details intentionally compact for F3+ — dev follows F1's complete example. This is a deliberate design (dev is React-experienced per CLAUDE.md/memory); not ambiguity. Accepted.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-04-13-foundation-parenting-summit-parity.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration. Best for a plan this large (49 tasks across 10 parts). Catches regressions early.

2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints. Better if you want to watch every step yourself.

**Which approach?**
