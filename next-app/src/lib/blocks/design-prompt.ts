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

// Inline runtime example. Deliberately NOT the gen:block CLI example —
// that one outputs a 4-file envelope ({schema_ts, meta_ts, component_tsx,
// index_ts}) and Gemini will copy that shape if shown it. Runtime needs a
// single-file {jsx, fields} envelope.
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
  const refPath = `docs/block-references/${input.section.type}.png`;
  const image = await loadReferenceImage(refPath).catch(() => null);

  const text = [
    `You are an expert React + Tailwind v4 developer designing ONE landing-page section. Match the layout, density, palette and visual hierarchy of the reference PNG (if provided).`,
    ``,
    `Section brief:`,
    `  type: ${input.section.type}`,
    `  purpose: ${input.section.purpose}`,
    `  position: ${input.section.position} of ${input.section.total}`,
    ``,
    `Summit context:`,
    JSON.stringify(input.summit, null, 2),
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
    `- Every editable string/image MUST appear in "fields" with its AST path (e.g. "props.headline").`,
  ].filter(Boolean).join('\n');

  return image ? { text, image } : { text };
}
