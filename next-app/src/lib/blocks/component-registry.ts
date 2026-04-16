/**
 * Component Registry
 *
 * Builds a structured plain-text document describing all available UI
 * primitives, design tokens derived from the style brief, layout rules, and
 * anti-patterns. The output is injected into Claude's Stage 2 code-generation
 * prompt so it knows exactly what components exist and how to use them.
 */

// ─── Default values ────────────────────────────────────────────────────────

const DEFAULTS = {
  palette: {
    primary: '#6366f1',
    primary_text: '#ffffff',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f5f5f5',
    text: '#1a1a2e',
    text_muted: '#6b7280',
    border: '#e5e7eb',
  },
  typography: {
    heading_font: 'Poppins',
    body_font: 'Inter',
    heading_weight: '700',
  },
  rhythm: {
    section_padding: '75px',
    max_width: '1120px',
  },
  components: {
    button_shape: 'pill',
    card_radius: '12px',
  },
} as const;

// ─── Helpers ───────────────────────────────────────────────────────────────

function get(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return '';
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : '';
}

function resolve(styleBrief: Record<string, unknown>, path: string, defaultValue: string): string {
  const val = get(styleBrief, path);
  return val !== '' ? val : defaultValue;
}

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Builds the component registry text document from the provided style brief.
 * Missing fields fall back to sensible defaults.
 *
 * @param styleBrief - A (possibly partial or empty) style brief object.
 * @returns Plain-text registry document for injection into Claude's prompt.
 */
export function buildComponentRegistry(styleBrief: Record<string, unknown>): string {
  // Resolve palette
  const primary      = resolve(styleBrief, 'palette.primary',      DEFAULTS.palette.primary);
  const primaryText  = resolve(styleBrief, 'palette.primary_text', DEFAULTS.palette.primary_text);
  const accent       = resolve(styleBrief, 'palette.accent',       DEFAULTS.palette.accent);
  const background   = resolve(styleBrief, 'palette.background',   DEFAULTS.palette.background);
  const surface      = resolve(styleBrief, 'palette.surface',      DEFAULTS.palette.surface);
  const text         = resolve(styleBrief, 'palette.text',         DEFAULTS.palette.text);
  const textMuted    = resolve(styleBrief, 'palette.text_muted',   DEFAULTS.palette.text_muted);
  const border       = resolve(styleBrief, 'palette.border',       DEFAULTS.palette.border);

  // Resolve typography
  const headingFont   = resolve(styleBrief, 'typography.heading_font',   DEFAULTS.typography.heading_font);
  const bodyFont      = resolve(styleBrief, 'typography.body_font',      DEFAULTS.typography.body_font);
  const headingWeight = resolve(styleBrief, 'typography.heading_weight', DEFAULTS.typography.heading_weight);

  // Resolve rhythm
  const sectionPadding = resolve(styleBrief, 'rhythm.section_padding', DEFAULTS.rhythm.section_padding);
  const maxWidth       = resolve(styleBrief, 'rhythm.max_width',       DEFAULTS.rhythm.max_width);

  // Resolve component tokens
  const rawButtonShape = resolve(styleBrief, 'components.button_shape', DEFAULTS.components.button_shape);
  const buttonRadius   = rawButtonShape === 'pill' ? 'rounded-full' : 'rounded-lg';
  const cardRadius     = resolve(styleBrief, 'components.card_radius', DEFAULTS.components.card_radius);

  return `
=== Component Registry ===

This registry describes every UI primitive available to you, the design tokens
you MUST apply, mandatory layout rules, and patterns that are FORBIDDEN.

────────────────────────────────────────────────────────────────────────────────
## 1. Primitives — Available UI Components
────────────────────────────────────────────────────────────────────────────────

All primitives are imported from their respective @/components/ui/* module.
Only the exports listed below exist. Do not guess at additional named exports.

### Button
  Module : @/components/ui/button
  Exports: Button
  Props  :
    variant  — "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size     — "default" | "sm" | "lg" | "icon"
    asChild  — boolean (renders as its child element, e.g. <a>)
  Example:
    import { Button } from '@/components/ui/button';
    <Button variant="default" size="lg">Reserve My Spot</Button>
    <Button asChild variant="outline"><a href="#register">Learn More</a></Button>

### Card
  Module : @/components/ui/card
  Exports: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
  Example:
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
    <Card>
      <CardHeader>
        <CardTitle>Speaker Name</CardTitle>
        <CardDescription>Role at Company</CardDescription>
      </CardHeader>
      <CardContent>Bio text here.</CardContent>
      <CardFooter>Footer actions</CardFooter>
    </Card>

### Accordion
  Module : @/components/ui/accordion
  Exports: Accordion, AccordionItem, AccordionTrigger, AccordionContent
  Example:
    import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
    <Accordion type="single" collapsible>
      <AccordionItem value="q1">
        <AccordionTrigger>Is this free?</AccordionTrigger>
        <AccordionContent>Yes, completely free to attend.</AccordionContent>
      </AccordionItem>
    </Accordion>

### Input
  Module : @/components/ui/input
  Exports: Input
  Example:
    import { Input } from '@/components/ui/input';
    <Input type="email" placeholder="your@email.com" />

### Label
  Module : @/components/ui/label
  Exports: Label
  Example:
    import { Label } from '@/components/ui/label';
    <Label htmlFor="email">Email address</Label>

### Select
  Module : @/components/ui/select
  Exports: Select, SelectContent, SelectItem, SelectTrigger, SelectValue
  Example:
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    <Select>
      <SelectTrigger><SelectValue placeholder="Choose topic" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="business">Business</SelectItem>
        <SelectItem value="health">Health</SelectItem>
      </SelectContent>
    </Select>

### Separator
  Module : @/components/ui/separator
  Exports: Separator
  Example:
    import { Separator } from '@/components/ui/separator';
    <Separator className="my-4" />

### Textarea
  Module : @/components/ui/textarea
  Exports: Textarea
  Example:
    import { Textarea } from '@/components/ui/textarea';
    <Textarea placeholder="Your message..." rows={4} />

────────────────────────────────────────────────────────────────────────────────
## 2. Design Tokens (authoritative — apply these exactly)
────────────────────────────────────────────────────────────────────────────────

### Colors (use as Tailwind arbitrary values, e.g. bg-[${primary}])
  primary      : ${primary}    — main CTA buttons, key accents
  primary_text : ${primaryText}    — text on primary-colored surfaces
  accent       : ${accent}    — secondary highlights, badges, tags
  background   : ${background}    — default page background (even sections)
  surface      : ${surface}    — alternate section background (odd sections)
  text         : ${text}    — default body text
  text_muted   : ${textMuted}    — captions, secondary text
  border       : ${border}    — dividers, card borders

### Typography
  heading_font   : ${headingFont}    — use font-['${headingFont}'] for headings
  body_font      : ${bodyFont}    — use font-['${bodyFont}'] for body copy
  heading_weight : ${headingWeight}   — apply as font-[${headingWeight}] on headings

### Spacing & Layout
  section_padding : ${sectionPadding}   — vertical section padding: py-[${sectionPadding}]
  max_width       : ${maxWidth}  — section container width: max-w-[${maxWidth}]

### Component Tokens
  button_shape : ${rawButtonShape} → use class ${buttonRadius} on all CTA buttons
  card_radius  : ${cardRadius}  → use rounded-[${cardRadius}] on Card components

────────────────────────────────────────────────────────────────────────────────
## 3. Layout Rules
────────────────────────────────────────────────────────────────────────────────

SECTION BACKGROUND ALTERNATION
  Alternate backgrounds between sections to create visual rhythm:
  - Even-positioned sections (1st, 3rd, 5th…): use background color (${background})
  - Odd-positioned sections (2nd, 4th, 6th…): use surface color (${surface})
  Never use the same background for two consecutive sections.

HERO LAYOUT
  - Full-width section with centered or split content
  - Headline: large (text-5xl or text-6xl), heading font, heading weight
  - Sub-headline: text-xl or text-2xl, body font, text_muted color
  - CTA button below sub-headline, pill-shaped (${buttonRadius}), primary color

STATS GRID
  - Horizontal row of 3–4 stat cards
  - Use grid grid-cols-2 md:grid-cols-4 gap-6
  - Each stat: large number (text-4xl, primary color) + label (text-sm, text_muted)

SPEAKER GRID
  - Use grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8
  - Each speaker card: photo (round, 96px), name (font-semibold), title (text_muted)
  - Never leave empty grid cells — only render items with actual data

SECTION CONTAINER PATTERN
  Every section must follow this wrapper pattern:
    <section className="py-[${sectionPadding}] bg-[COLOR]">
      <div className="mx-auto max-w-[${maxWidth}] px-5">
        {/* content */}
      </div>
    </section>

NO min-h-[50vh] or min-h-screen
  Never use min-h-[50vh], min-h-screen, or any min-height that forces tall blank
  sections. Let content dictate height naturally.

────────────────────────────────────────────────────────────────────────────────
## 4. Anti-Patterns — NEVER Do These
────────────────────────────────────────────────────────────────────────────────

FORBIDDEN IMPORTS
  ✗ import ... from 'lucide-react'       — no icon libraries; inline SVG instead
  ✗ import ... from 'framer-motion'      — no animation libraries
  ✗ import ... from 'react-icons'        — no icon libraries
  ✗ Any import outside react and @/components/ui/*

FORBIDDEN HOOKS & RUNTIME
  ✗ useState, useEffect, useRef, useCallback, useMemo, useContext — no hooks
  ✗ fetch(), axios, XHR — no network calls
  ✗ dynamic import() — no lazy loading
  ✗ <script> or <style> tags inside JSX

FORBIDDEN STYLING
  ✗ CSS variables (--my-color: ...) — use inline hex values or Tailwind arbitrary values
  ✗ Monotone/flat backgrounds with no contrast — always vary background between sections
  ✗ Hardcoded brand colors not from the palette above — use only the tokens in section 2
  ✗ min-h-screen, min-h-[50vh] — let content determine height

FORBIDDEN LAYOUT
  ✗ Empty grid cells — never render placeholder <div> cells in speaker/stat grids
  ✗ Nested max-width wrappers — only one max-w-[${maxWidth}] per section
  ✗ Inline style attributes — use Tailwind classes exclusively
`.trim();
}
