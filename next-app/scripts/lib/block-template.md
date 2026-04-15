# Block file-layout and style rules

Every block consists of 4 files in the same directory:

- **schema.ts** — Zod schema + `export type Props = z.infer<typeof schema>`
- **meta.ts** — `export const meta: BlockMeta = { type, category, version: 1, validOn, purpose, exampleProps }`
- **Component.tsx** — named functional component taking `Props`, no default export
- **index.ts** — re-exports schema/meta/Component and registers with globalRegistry

## Conventions

- Tailwind v4 classes only. Match the example block's spacing scale (py-16 md:py-20).
- Brand colors through CSS vars: `text-[rgb(var(--color-primary))]` etc.
- Server component by default. Only add "use client" when you use hooks or browser APIs.
  Primitives like Accordion handle their own interactivity — consumers stay server-safe.
- Import types via `import type { Props } from './schema'`.
- Props drive everything. No hard-coded summit copy, headlines, images, or FAQ text in the component.
- Accessible: semantic HTML, aria where needed. Responsive: mobile-first + md: breakpoint.
- No emojis. No comments unless truly non-obvious.

## Primitives — always prefer over building from scratch

Use exported names as they appear in the primitive source code you have been given.
Do NOT assume shadcn/radix API details (like `type="single"`, `collapsible`). Use only
what the attached primitive source supports.

## Output format

Return a single JSON envelope — no markdown fences, no prose, no trailing text:

```
{"schema_ts": "...", "meta_ts": "...", "component_tsx": "...", "index_ts": "..."}
```
