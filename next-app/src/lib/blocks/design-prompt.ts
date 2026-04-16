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
  styleBrief?: Record<string, unknown>;
  // Stage-1 output — the visual target for Stage 2. When present, Gemini is
  // instructed to match it pixel-wise (colors, spacing, typography, layout).
  mockupImage?: { mime: string; data: string } | null;
  // Fallback anchor when Stage 1 failed — the summit's Phase-0 URL screenshot.
  referenceImage?: { mime: string; data: string } | null;
}

export interface DesignPrompt {
  text: string;
  image?: { mime: string; data: string };
}

// Inline runtime example — single-file `{ jsx, fields }` envelope.
// Not the gen:block CLI's 4-file shape; Gemini will mimic whichever example we show.
const RUNTIME_EXAMPLE = `{
  "jsx": "export default function S(props) {\\n  return (\\n    <section className=\\"py-20 bg-white\\">\\n      <div className=\\"mx-auto max-w-3xl px-6 text-center\\">\\n        <h2 className=\\"text-4xl font-bold tracking-tight\\">{props.headline}</h2>\\n        <p className=\\"mt-4 text-lg text-gray-600\\">{props.subheadline}</p>\\n        <a href={props.ctaHref} className=\\"mt-8 inline-block rounded-md bg-indigo-600 px-6 py-3 text-white font-semibold\\">{props.ctaLabel}</a>\\n      </div>\\n    </section>\\n  )\\n}",
  "fields": [
    { "path": "props.headline", "kind": "text", "value": "Join the Summit" },
    { "path": "props.subheadline", "kind": "text", "value": "Learn from 30+ experts in 5 days." },
    { "path": "props.ctaLabel", "kind": "text", "value": "Reserve My Free Spot" },
    { "path": "props.ctaHref", "kind": "url", "value": "#register" }
  ]
}`;

export async function buildDesignPrompt(input: BuildDesignPromptInput): Promise<DesignPrompt> {
  const [designSystem, primitives] = await Promise.all([
    loadDesignSystem(),
    loadPrimitiveSources(),
  ]);

  // Prefer mockup (Stage 1 output) over any other visual anchor. Fallback
  // order: mockupImage → referenceImage (summit URL screenshot) → legacy
  // per-type docs/block-references/{type}.png.
  let anchor: { mime: string; data: string } | null = input.mockupImage ?? input.referenceImage ?? null;
  if (!anchor) {
    const refPath = `docs/block-references/${input.section.type}.png`;
    anchor = await loadReferenceImage(refPath).catch(() => null);
  }

  const intro = input.mockupImage
    ? `You are an expert React + Tailwind v4 developer. Implement the attached mockup PNG as a single React component. Match the mockup EXACTLY — colors, spacing, typography, icon shapes, layout.`
    : `You are an expert React + Tailwind v4 developer designing ONE landing-page section. Match the layout, density, palette and visual hierarchy of the reference PNG (if provided).`;

  const styleBriefBlock = input.styleBrief
    ? [`=== Style Brief (authoritative palette/typography/components) ===`, JSON.stringify(input.styleBrief, null, 2)]
    : [];

  const text = [
    intro,
    ``,
    `Section brief:`,
    `  type: ${input.section.type}`,
    `  purpose: ${input.section.purpose}`,
    `  position: ${input.section.position} of ${input.section.total}`,
    ``,
    `Summit context:`,
    JSON.stringify(input.summit, null, 2),
    ``,
    ...styleBriefBlock,
    ``,
    `=== Design System ===`,
    designSystem,
    ``,
    `=== Primitives (importable from @/components/ui/*) ===`,
    primitives,
    ``,
    input.previousSectionJsx ? `Previous section (for visual flow):\n${input.previousSectionJsx}` : '',
    input.currentJsx ? `Current JSX (regenerating):\n${input.currentJsx}` : '',
    input.regenerationNote ? `Operator note: ${input.regenerationNote}` : '',
    ``,
    `=== Output format ===`,
    `Return ONE JSON object matching this exact shape — no markdown fences, no commentary, no other fields:`,
    RUNTIME_EXAMPLE,
    ``,
    `Output rules:`,
    `- Top-level keys MUST be exactly "jsx" and "fields". Do NOT return schema_ts/meta_ts/component_tsx/index_ts (that is a different format).`,
    `- "jsx" is a single-file React component string. Export default a function named S that takes a props object.`,
    `- Only imports allowed inside the JSX: react, @/components/ui/*. Do NOT import lucide-react or any other icon library.`,
    `- For icons, inline SVGs directly in the JSX (24x24 viewBox, currentColor stroke).`,
    `- No client hooks (useState/useEffect/etc), no script/style tags, no network calls, no dynamic imports.`,
    `- Tailwind v4 classes only. No Framer Motion.`,
    `- Apply the Style Brief palette's hex codes inline (e.g. "bg-[#5e4d9b]") or via Tailwind arbitrary values where the design system doesn't already cover them.`,
    `- Every editable string/image MUST appear in "fields" with its AST path (e.g. "props.headline").`,
  ].filter(Boolean).join('\n');

  return anchor ? { text, image: anchor } : { text };
}
