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
