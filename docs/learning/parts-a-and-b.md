# Parts A + B — Teaching Guide

> A from-scratch walkthrough of everything built so far on the V2 funnel builder. Read this end-to-end; it's structured so each section only assumes what came before. No prior V2 context needed.

---

## 0. The big picture (read this first)

### The problem

V1 of the summit platform renders funnel pages by hand-coded React components — one file per page type (`Optin.tsx`, `Upsell.tsx`, etc.). Every new summit = developer writes new code. That's slow and blocks the marketing/content team.

### The V2 goal

Let AI generate funnel pages. But AI writing React is a dead end — unmaintainable, inconsistent, hallucinated props.

### The compromise

AI doesn't write React. AI **picks** from a pre-built library of ~32 React components ("blocks") and **writes the copy** that goes into each one. Developers hand-craft the blocks once. AI just arranges and fills them.

### The core idea: a page is data, not code

Instead of a page being a React file like:

```tsx
function OptinPage() {
  return (
    <>
      <HeroBlock headline="Join us" ctaText="Sign up" />
      <SpeakerGrid speakers={[...]} />
    </>
  )
}
```

…a page is a JSON array in the database:

```json
[
  { "id": "abc", "type": "HeroBlock",   "version": 1, "props": { "headline": "Join us", "ctaText": "Sign up" } },
  { "id": "def", "type": "SpeakerGrid", "version": 1, "props": { "speakers": [...] } }
]
```

One generic Next.js route reads that array and renders each item. New summit = new data. No new code.

### The three systems that must agree

Three different technologies touch blocks:

```
Next.js (renders)  ←→  Laravel (stores + admin)  ←→  Claude (generates)
```

They all need to agree on:
- What block types exist
- What props each block takes
- What the valid shape of each prop is

The solution: **one Zod schema per block** lives in the Next.js repo. A codegen script (`build:catalog`) exports those schemas to a single JSON Schema file. Laravel reads it to auto-build admin forms. Claude reads it to produce valid output.

**Rule of thumb:** the Next.js repo owns the block library. Laravel and Claude are consumers.

---

## 1. Part A — Next.js foundation

Part A was just scaffolding. Very little V2-specific. If you've set up a modern React project, 80% of this is familiar. Quick tour:

### A1 — Scaffold (Next.js 16.2.3)

```
next-app/
  src/app/          ← App Router pages (Next.js convention)
  src/components/
  src/lib/
  package.json
  next.config.ts
  tsconfig.json
```

Next 16 ships with **Turbopack** (a faster bundler) as default and removes the `next lint` subcommand — hence the `"lint": "eslint"` line in `package.json`.

The `turbopack: { root: __dirname }` in `next.config.ts` silences a workspace-root warning (the Laravel monorepo above also has a `pnpm-lock.yaml`).

### A2 — Tailwind v4 + `cn` helper

Tailwind v4 is a big change: no more `tailwind.config.js`. Tokens live directly in your CSS:

```css
/* globals.css */
@theme {
  --color-primary: 94 77 155;     /* summit purple as "R G B" triplet */
  --color-accent:  0 181 83;      /* summit green */
  --font-heading:  "Inter", sans-serif;
}
```

Those become usable as Tailwind classes automatically: `bg-primary`, `text-accent`, `font-heading`. The triplet form (instead of `#5e4d9b`) lets you do `bg-primary/50` for opacity — that's why B3's theme context converts hex to triplets.

The `cn()` helper (`src/lib/utils.ts`) combines `clsx` (conditional class strings) and `tailwind-merge` (deduplicates conflicting Tailwind classes):

```tsx
cn('p-4 p-6', isActive && 'bg-blue-500')
// → 'p-6 bg-blue-500'   (p-4 dropped; p-6 wins)
```

### A3 — shadcn + libraries

shadcn is **not a component library** you `npm install`. It's a CLI that **copies** component source code into your repo (`src/components/ui/`). You own the code, you edit it.

The `base-nova` preset it chose (vs the plan's stated "Default") is functionally equivalent — `cssVariables: true`, `baseColor: neutral`. Our `@theme {}` block in `globals.css` overrides any shadcn color collisions, so `bg-primary` is our purple, not shadcn's gray.

Other deps added: `framer-motion` (animations), `lucide-react` + `@tabler/icons-react` (icon sets), `@base-ui/react` (unstyled primitives).

### A4 — Vitest

`vitest` is the test runner. Modern replacement for Jest; reuses Vite's config so it understands TS/JSX out of the box. Your tests live next to the code they test:

```
src/lib/block-registry.ts
src/lib/block-registry.test.ts    ← co-located
```

Run with `pnpm test`. It's **not** in watch mode by default in our setup — it runs once and exits.

### A5 — Storybook

Storybook is an isolated environment to develop and document UI components. You write "stories" (`Block.stories.tsx`) that mount a component with specific props. Designers and content folks can browse `pnpm storybook` to see every block without running the real app.

We're on Storybook 10.3.5, which forced three changes from the plan:
- Framework is `@storybook/nextjs-vite` (not `@storybook/nextjs`)
- `addon-essentials` and `addon-viewport` are now built-in (don't install them)
- The `Preview` type is imported from `@storybook/nextjs-vite`

Storybook also added a second "project" to `vitest.config.ts` that runs stories through a headless Chromium. Currently it no-ops because `src/blocks/**` is empty. Activates in Part F.

---

## 2. Part B — Block system core

Now the meat. Every piece here exists to make the "page is JSON data" idea actually work.

### B1 — The type foundation

**File:** `src/types/block.ts`

Five types that every other file depends on:

```ts
export type StepType = 'optin' | 'sales_page' | 'checkout' | 'upsell' | 'downsell' | 'thank_you'
```

A `StepType` is the kind of page — matches your funnel step types. A block will later declare which step types it's allowed on via `validOn: StepType[]`.

```ts
export interface BlockRow {
  id: string                          // stable UUID — React key + reorder target
  type: string                        // e.g. "HeroBlock"
  version: number                     // e.g. 1
  props: Record<string, unknown>      // raw JSON props from the DB
}
```

A `BlockRow` is one instance of a block on a page. It's the shape stored in the DB and sent over the wire. Notice `props` is `Record<string, unknown>` — intentionally loose. We don't trust DB JSON; we re-validate at render time (see B4).

```ts
export interface BlockMeta {
  type: string
  category: 'hero' | 'form-cta' | 'speakers' | 'social-proof' | 'content'
            | 'checkout' | 'upsell' | 'thank_you' | 'utility'
  version: number
  validOn: StepType[]                 // where this block is allowed
  purpose: string                     // one-liner for Claude's prompt
  exampleProps: Record<string, unknown>
}
```

`BlockMeta` describes a block's *identity and constraints*. It's what the registry and codegen need. Categories are used by the admin UI to group blocks; `validOn` prevents someone adding a `CheckoutForm` block to a thank-you page.

```ts
export interface BlockDefinition<T extends z.ZodType = z.ZodType> {
  meta: BlockMeta
  schema: T
  Component: React.ComponentType<z.infer<T>>
}
```

This is the interesting one. A block's full definition bundles three things:

1. **`meta`** — the metadata above
2. **`schema`** — a Zod schema validating the block's props
3. **`Component`** — the React component that renders it

The generic `<T extends z.ZodType>` is a TypeScript trick: it **links the schema type to the component's props type** via `z.infer<T>`.

Example: define schema as `z.object({ headline: z.string() })`. TypeScript computes `z.infer<typeof schema>` as `{ headline: string }`. So `Component` **must** accept `{ headline: string }`. Change the schema, the component's required props change with it. One source of truth.

The `= z.ZodType` default matters when you want to talk about "a block, any block" without naming the specific schema — e.g. the registry's `get()` returns `BlockDefinition` (no type param), which falls back to `z.ZodType` generic default and `z.infer<z.ZodType>` collapses to `unknown`. That's why `render-block.tsx` needs a cast.

```ts
export interface CatalogEntry { ... }
export interface BlockCatalog { version: string; generatedAt: string; blocks: CatalogEntry[] }
```

`CatalogEntry` is the "export" shape — what gets written to `block-catalog.json`. Same as `BlockMeta` plus the JSON-Schema-converted `schema` (Zod becomes JSON Schema so Laravel and Claude can read it without needing Zod).

### B2 — The registry

**File:** `src/lib/block-registry.ts`

A runtime lookup table: string key → `BlockDefinition`. Implementation is just a `Map`:

```ts
export function createRegistry(): BlockRegistry {
  const blocks = new Map<string, BlockDefinition>()
  return {
    register(def) {
      const key = `${def.meta.type}@${def.meta.version}`
      if (blocks.has(key)) throw new Error(`Block already registered: ${key}`)
      blocks.set(key, def)
    },
    get(type, version) { return blocks.get(`${type}@${version}`) },
    all() { return Array.from(blocks.values()) },
  }
}

export const globalRegistry = createRegistry()
```

**Three design decisions worth understanding:**

1. **Factory function, not a class.** `createRegistry()` returns a plain object. Why? No `this` binding bugs, easy to make fresh instances in tests (each test gets its own registry), no inheritance chain to reason about.

2. **Module-level singleton (`globalRegistry`).** One line, evaluated once. Every file that does `import { globalRegistry } from '@/lib/block-registry'` gets the **same** `Map` because Node's ES module system caches modules — a module's top-level code runs once per process.

   This is how the app-wide registry works: each block file self-registers by importing `globalRegistry` and calling `.register()`. Since all imports share the same instance, the rendering code later finds every registered block.

3. **Versioned keys (`type@version`).** Not just `type`. The reason: when you evolve a block (rename a prop, change structure), you bump the version. Old DB rows with `version: 1` still render via the old component; new rows use the new one. Without this, you'd have to migrate thousands of DB rows every time you touched a block.

   Concrete example:
   ```
   HeroBlock@1 → component expecting { headline, ctaText }
   HeroBlock@2 → component expecting { headline, ctaLabel }  (renamed)
   ```
   Both registered. Both keyed separately. Old pages unaffected.

4. **Fail-fast on duplicates.** `register()` throws if the key is already taken. This catches a silent-overwrite bug: if two files accidentally both export `type: 'HeroBlock'`, you want the app to blow up at startup, not render the wrong component to a user.

### B3 — The theme context

**File:** `src/lib/theme-context.tsx`

Every summit has its own colors, fonts, and logo. You don't want to pass `primaryColor` as a prop to every block — that's noisy and easy to forget. React Context solves it:

```tsx
'use client'   // ← this makes it a Client Component (can use hooks)

export interface Theme {
  primaryColor: string
  accentColor: string
  fontHeading: string
  fontBody: string
  logoUrl: string | null
  backgroundStyle: 'light' | 'dark' | 'gradient'
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

export function useTheme() { return useContext(ThemeContext) }
```

**Three things are happening at once:**

1. **React Context** — any block inside the provider can call `useTheme()` and get the `Theme` object. Good for imperative use: `const { logoUrl } = useTheme(); return <img src={logoUrl} />`.

2. **CSS variables on a wrapping `<div>`** — the provider injects `--color-primary: 94 77 155` (and friends) as inline CSS variables. Any Tailwind class like `bg-primary` (which is defined in globals.css as `rgb(var(--color-primary))`) automatically picks up the summit's purple.

3. **Hex → RGB triplet conversion** — Tailwind v4's opacity syntax (`bg-primary/50`) requires CSS vars in `"R G B"` form, not `#RRGGBB`. `hexToRgbTriplet('#5e4d9b')` returns `"94 77 155"`.

**Why `'use client'`?** Next.js App Router defaults components to **Server Components** (render on the server, no JS shipped). But hooks like `useContext` only work in **Client Components** — this directive flips the file. Our block components themselves can stay Server Components; only the provider needs client-side state.

### B4 — The rendering helper

**File:** `src/lib/render-block.tsx`

The bridge from JSON to React. Two components:

```tsx
export function RenderBlock({ block }: { block: BlockRow }) {
  const def = globalRegistry.get(block.type, block.version)

  // 1. Block type not registered?
  if (!def) {
    if (process.env.NODE_ENV !== 'production') {
      return <div className="border-red-400 ...">Unknown block: {block.type}@{block.version}</div>
    }
    return null
  }

  // 2. Props don't match the schema?
  const parsed = def.schema.safeParse(block.props)
  if (!parsed.success) {
    if (process.env.NODE_ENV !== 'production') {
      return <div className="border-amber-400 ...">Invalid props for {block.type}</div>
    }
    return null
  }

  // 3. All good — render.
  const Component = def.Component as React.ComponentType<Record<string, unknown>>
  return <Component {...(parsed.data as Record<string, unknown>)} />
}

export function RenderBlocks({ blocks }: { blocks: BlockRow[] }) {
  return <>{blocks.map(b => <RenderBlock key={b.id} block={b} />)}</>
}
```

**The validation step is the critical part.** DB contents can drift — someone edits JSON by hand, an old row is missing a newly-required field. Without validation you'd crash the whole page. With `safeParse`:

- **In dev:** you see a visible fallback box with the bad block name. Easy to spot.
- **In prod:** silent skip of the bad block. Page continues. Monitoring picks up the error separately.

`safeParse` returns a discriminated union: `{ success: true, data } | { success: false, error }`. If `success: true`, `data` is the fully-typed, runtime-validated props object.

**Why the cast?** Because `def` is `BlockDefinition` with no type param, `def.schema` is `z.ZodType<unknown>`, so `parsed.data` is `unknown`. React can't spread `unknown`. The cast tells TS "trust me, at runtime this is whatever the component needs". The runtime validation happened one line above.

### B5 — The catalog codegen

**File:** `scripts/build-catalog.ts` (Node script, run via `pnpm build:catalog`)

This script is the bridge between the Next.js repo (where Zod schemas live) and the other two worlds (Laravel, Claude) that speak JSON Schema.

What it does:
1. Walk `src/blocks/**/` for folders containing both `index.ts` and `schema.ts`.
2. Dynamic-import each folder; pull out `meta` and `schema` exports.
3. Convert each Zod schema to JSON Schema via `zod-to-json-schema` (with OpenAPI 3 target — compatible with most tools).
4. Assemble into a `BlockCatalog` object.
5. Write to `public/block-catalog.json`.

Key ideas:

- **Dynamic `import()`** — unlike a static `import`, this happens at runtime and takes a string path. Here it's `pathToFileURL(indexPath).href` (Node requires file URLs for ESM imports, not file paths).
- **`existsSync` for both files** — the script only treats a folder as a block if it has both `index.ts` (the barrel) and `schema.ts` (the Zod schema). Prevents accidentally pulling random folders.
- **Output in `public/`** — Next.js serves everything in `public/` as static files. `/block-catalog.json` becomes fetchable over HTTP, which is how Laravel will sync it (Part C).
- **Version = timestamp** — `2026-04-13T13-00-52-639Z`. Simple, monotonic, human-readable. Laravel stores the last-seen version to detect changes.

**Right now it outputs `{ blocks: [] }`** because no block folders exist. Part F will populate `src/blocks/` with 19 real blocks and regenerate.

### B6 — The API client

**File:** `src/lib/api-client.ts`

One function: `resolveFunnel({ summitSlug, funnelSlug, stepSlug })`. Hits Laravel's `/api/funnels/resolve` endpoint and returns everything the page needs in one blob.

```ts
export async function resolveFunnel(params: {...}): Promise<ResolvedFunnel | null> {
  const url = new URL('/api/funnels/resolve', API_BASE)
  url.searchParams.set('summit_slug', params.summitSlug)
  // ...

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json', Authorization: `Bearer ${API_TOKEN}` },
    next: { revalidate: 60, tags: [`funnel:${params.summitSlug}:${params.funnelSlug}`] },
  })

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Funnel resolve failed: ${res.status}`)
  return res.json()
}
```

Worth noting:

- **`next: { revalidate: 60 }`** — a Next.js 16 fetch option that caches the response for 60s. No redundant Laravel hits for hot pages.
- **`tags: [...]`** — when Laravel content changes, it can POST to a Next revalidation webhook with the tag; only that funnel's cache gets busted.
- **Two env vars, different prefixes:**
  - `NEXT_PUBLIC_LARAVEL_API_URL` — the `NEXT_PUBLIC_` prefix exposes the value to browser JS (required for client-side `fetch`).
  - `LARAVEL_API_TOKEN` — no prefix, so it's server-side only. Bearer token never leaves the server.
- **404 → `null`**, other errors throw. The calling page turns `null` into a 404 response; throws bubble to Next's error boundary.

`ResolvedFunnel` is a flat TS interface describing the one-shot response. It includes `blocks: BlockRow[]` — those are what get piped into `<RenderBlocks>`.

---

## 3. How it all connects (the end-to-end flow)

Imagine it's shipped. A visitor hits `https://www.althea-academy.com/aws25/`. Here's what happens (future Part G fills in the route handler):

```
1. Browser →  Next.js edge/server  (GET /aws25/)
2. Next.js  →  api-client.resolveFunnel({ summitSlug: 'althea', funnelSlug: 'aws25' })
3. API call →  Laravel /api/funnels/resolve
4. Laravel  →  PostgreSQL: SELECT funnel, step, speakers, products, theme
5. Laravel  →  returns JSON { funnel, step, summit, theme, blocks: [...], speakers, products }
6. Next.js  →  wraps page in <ThemeProvider theme={theme}>
7. Next.js  →  <RenderBlocks blocks={blocks} />
8. RenderBlocks maps each BlockRow → <RenderBlock block={...}>
9. RenderBlock →  globalRegistry.get(type, version) → BlockDefinition
10. RenderBlock →  schema.safeParse(props) → validated data
11. RenderBlock →  <Component {...data} />   (actual React block renders)
12. All blocks stream to browser. Page is live.
```

Every piece of Part B exists for one step of this flow. That's the whole point.

**Separately, admin flow:**

```
Editor opens /admin/funnels/123/edit     (Filament)
 → Filament reads public/block-catalog.json (synced from Next)
 → For each block type: render a form from its JSON Schema
 → Editor changes props, saves
 → Laravel writes to funnel_steps.content (JSONB)
 → Laravel POSTs to Next revalidation webhook with tag "funnel:slug"
 → Next's cache bust → next visitor gets fresh content
```

**AI flow (Part 3 in the master plan):**

```
Claude receives: "Generate a funnel for a parenting summit"
 → Claude has tool definitions auto-derived from block-catalog.json
 → Claude picks HeroBlock, SpeakerGrid, EmailOptin, etc. — outputs JSON matching each schema
 → Laravel validates (JSON Schema again) and saves as funnel_steps.content
 → Next renders normally. No new code path.
```

---

## 4. Glossary

| Term | Meaning |
|---|---|
| **Block** | A React component in the library + its Zod schema + its metadata, as one unit. |
| **BlockRow** | One block **instance** on a page: `{ id, type, version, props }`. Stored as JSON in DB. |
| **BlockMeta** | A block's *identity* — type name, version, category, where it's allowed, example props. |
| **BlockDefinition** | The full bundle for one block: `{ meta, schema, Component }`. Lives in code. |
| **CatalogEntry** | The "exported" form of a block — `BlockMeta` + JSON-Schema'd `schema`. Lives in `block-catalog.json`. |
| **Registry** | Map from `"type@version"` → `BlockDefinition`. One global instance. |
| **Zod schema** | A runtime validator for an object shape. Also provides a TS type via `z.infer`. |
| **JSON Schema** | Standard format for describing data shapes. What Laravel + Claude consume. |
| **Theme** | Summit-specific colors/fonts/logo. Flows through React context + CSS variables. |
| **Client Component** | A React component with `'use client'` at the top — runs in the browser, can use hooks. |
| **Server Component** | Default in Next App Router. Runs on server, ships zero JS for that component. |
| **`revalidate`** | Next.js fetch option: cache this response for N seconds. |
| **Tag-based invalidation** | Attach a tag to a cached fetch; blow up just that tag's cache when content changes. |
| **shadcn** | CLI that copies component source into your repo. Not a library — you own the files. |
| **Turbopack** | Next.js's default bundler as of v15+. Faster alternative to Webpack. |

---

## 5. Key files, at a glance

```
next-app/
  src/
    types/
      block.ts                ← B1. All block-related TS types.
      block.test.ts           ← B1 type tests.
    lib/
      block-registry.ts       ← B2. createRegistry() + globalRegistry.
      block-registry.test.ts
      theme-context.tsx       ← B3. ThemeProvider + useTheme + hexToRgbTriplet.
      theme-context.test.tsx
      render-block.tsx        ← B4. RenderBlock + RenderBlocks.
      api-client.ts           ← B6. resolveFunnel().
      utils.ts                ← A2. cn() helper.
    blocks/                   ← Empty. Populated in Part F with 19 blocks.
    components/ui/            ← shadcn components (Button, Card, etc.).
    app/                      ← Next App Router pages (Part G).
  scripts/
    build-catalog.ts          ← B5. Zod → JSON Schema codegen.
  public/
    block-catalog.json        ← B5 output. Currently empty.
  .env.local.example          ← B6.
  package.json
```

---

## 6. Self-check questions

No peeking. Try to answer, then scan the doc to verify.

1. **Mental model.** In one sentence, what is "a page" in V2?

2. **Why `type@version`?** Give a scenario where just `type` as the registry key would cause a production outage.

3. **`createRegistry()` vs a class.** Name one concrete advantage of the factory function approach.

4. **`'use client'`.** What breaks if you remove it from `theme-context.tsx`? What is *preserved*?

5. **`hexToRgbTriplet`.** Why does Tailwind v4 want `"94 77 155"` instead of `#5e4d9b`? What Tailwind feature depends on this format?

6. **`safeParse` vs `parse`.** Why does `RenderBlock` use `safeParse` and not `parse`? What's the user-facing consequence of choosing wrong?

7. **The three worlds.** Which file is the single source of truth that Laravel, Claude, and Next.js all consume? What format does it use, and why *that* format (not Zod directly)?

8. **`NEXT_PUBLIC_` prefix.** What's the functional difference between `NEXT_PUBLIC_LARAVEL_API_URL` and `LARAVEL_API_TOKEN`? Why does one have the prefix and the other not?

9. **Revalidation tags.** Walk through: editor saves a change in Filament → 30 seconds later, a visitor sees the new content. What exactly invalidated the cache?

10. **Deviations.** Name one deviation we made from the written plan and why. (Pick any.)

---

## 7. Suggested deep dives

- **Zod** — https://zod.dev/ — focus on `z.infer`, `safeParse`, and `z.object()`.
- **TS generic constraints** — https://www.typescriptlang.org/docs/handbook/2/generics.html#generic-constraints — understand `<T extends z.ZodType>`.
- **React Context** — https://react.dev/reference/react/useContext — focus on Provider/Consumer lifecycle.
- **Next.js Server vs Client Components** — https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns — understand when `'use client'` is needed.
- **Next.js fetch caching** — https://nextjs.org/docs/app/building-your-application/caching#fetch — understand `revalidate` and `tags`.
- **Tailwind v4** — https://tailwindcss.com/docs/v4-beta — understand `@theme {}` and how CSS vars work with opacity modifiers.

---

## 8. What's coming next (Part C preview)

Part C moves to the **Laravel** side. We'll build the `/api/funnels/resolve` endpoint that our API client calls. That involves:

- A Pest feature test proving the endpoint returns the right shape.
- A `FunnelResolveController` that joins summit → funnel → step → speakers → products → theme.
- URL routes for the resolver + catalog sync endpoint.

No React, no Zod. Just Laravel Eloquent + HTTP layer. You'll see how the contract you now understand from the Next side gets enforced on the Laravel side.
