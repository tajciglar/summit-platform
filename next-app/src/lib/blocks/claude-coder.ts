import Anthropic from '@anthropic-ai/sdk';
import type { SectionBrief, SummitContext } from './types';

const CLAUDE_MODEL = process.env.CLAUDE_CODER_MODEL ?? 'claude-sonnet-4-20250514';

export interface ClaudeCoderInput {
  registry: string;           // Component registry text (from buildComponentRegistry)
  section: SectionBrief;
  summit: SummitContext;
  mockupImage?: { mime: string; data: string } | null;  // Base64 PNG from Gemini
  skeleton: string | null;     // Grid/flex skeleton template
  previousSectionJsx: string | null;
  regenerationNote: string | null;
  currentJsx?: string;         // For regeneration
}

export interface ClaudeCoderResult {
  jsx: string;
  fields: Array<{ path: string; kind: string; value: unknown }>;
}

interface Envelope {
  jsx: string;
  fields: Array<{ path: string; kind: string; value: unknown }>;
}

function parseEnvelope(raw: string): Envelope | null {
  const trimmed = raw.trim();
  const candidates: string[] = [];

  // 1. Strip any leading/trailing fences and try the whole thing.
  candidates.push(
    trimmed
      .replace(/^\s*```(?:json|javascript|typescript|tsx|ts)?\s*\n?/i, '')
      .replace(/\n?\s*```\s*$/i, '')
      .trim(),
  );

  // 2. Pull the first fenced block out of the middle of a longer reply.
  const fenced = trimmed.match(/```(?:json|javascript|typescript|tsx|ts)?\s*\n?([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.push(fenced[1].trim());

  // 3. Last-resort: take from the first '{' to the last '}'.
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
        return parsed as Envelope;
      }
    } catch {
      // try the next candidate
    }
  }
  return null;
}

export async function claudeGenerateCode(input: ClaudeCoderInput): Promise<ClaudeCoderResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });

  const promptParts: string[] = [];

  // Intro
  if (input.mockupImage) {
    promptParts.push(
      'Implement the attached mockup PNG as a single React + Tailwind v4 component. Match the mockup EXACTLY.',
    );
  } else {
    promptParts.push(
      'Build a high-quality React + Tailwind v4 landing page section. Follow the Component Registry precisely.',
    );
  }

  // Section brief
  promptParts.push(
    '',
    `=== Section Brief ===`,
    `Type: ${input.section.type}`,
    `Purpose: ${input.section.purpose}`,
    `Position: ${input.section.position} of ${input.section.total}`,
  );

  // Summit context
  promptParts.push(
    '',
    `=== Summit Context ===`,
    JSON.stringify(input.summit),
  );

  // Registry
  promptParts.push(
    '',
    `=== Component Registry ===`,
    input.registry,
  );

  // Skeleton
  if (input.skeleton) {
    promptParts.push(
      '',
      `=== Layout Skeleton ===`,
      `Preserve the grid/flex structure exactly. Fill all __SLOT__ placeholders with appropriate content.`,
      input.skeleton,
    );
  }

  // Previous section JSX
  if (input.previousSectionJsx) {
    promptParts.push(
      '',
      `=== Previous Section JSX (for visual flow continuity) ===`,
      input.previousSectionJsx,
    );
  }

  // Current JSX (regeneration)
  if (input.currentJsx) {
    promptParts.push(
      '',
      `=== Current JSX (to improve upon) ===`,
      input.currentJsx,
    );
  }

  // Regeneration note
  if (input.regenerationNote) {
    promptParts.push(
      '',
      `=== Regeneration Note ===`,
      input.regenerationNote,
    );
  }

  // Output format
  promptParts.push(
    '',
    `=== Output Format ===`,
    `Return a JSON object with exactly two keys: "jsx" and "fields". Example:`,
    `{`,
    `  "jsx": "export default function S(props) {\\n  return (\\n    <section className=\\"py-20 bg-white\\">\\n      <div className=\\"mx-auto max-w-3xl px-6 text-center\\">\\n        <h2 className=\\"text-4xl font-bold tracking-tight\\">{props.headline}</h2>\\n        <p className=\\"mt-4 text-lg text-gray-600\\">{props.subheadline}</p>\\n        <a href={props.ctaHref} className=\\"mt-8 inline-block rounded-md bg-indigo-600 px-6 py-3 text-white font-semibold\\">{props.ctaLabel}</a>\\n      </div>\\n    </section>\\n  )\\n}",`,
    `  "fields": [`,
    `    { "path": "props.headline", "kind": "text", "value": "Join the Summit" },`,
    `    { "path": "props.subheadline", "kind": "text", "value": "Learn from 30+ experts in 5 days." },`,
    `    { "path": "props.ctaLabel", "kind": "text", "value": "Reserve My Free Spot" },`,
    `    { "path": "props.ctaHref", "kind": "url", "value": "#register" }`,
    `  ]`,
    `}`,
  );

  // Strict rules
  promptParts.push(
    '',
    `=== Strict Rules ===`,
    `1. Export default function must be named S and accept props: export default function S(props)`,
    `2. Only allowed imports: react and @/components/ui/* — no lucide-react (use inline SVGs instead)`,
    `3. No hooks, no script tags, no style tags`,
    `4. Use Tailwind v4 only — no custom CSS`,
    `5. Inline hex colors from the palette using bracket notation (e.g. bg-[#ff0000])`,
    `6. Use font-['FontName'] syntax for custom fonts`,
    `7. Fill all grid cells — leave no empty slots`,
    `8. Every editable value (text, URLs, images) must appear in the fields array`,
  );

  const promptText = promptParts.filter(s => s !== undefined).join('\n');

  // Build content array — image first if provided
  const content: Anthropic.MessageParam['content'] = [];

  if (input.mockupImage) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: input.mockupImage.mime as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
        data: input.mockupImage.data,
      },
    });
  }

  content.push({ type: 'text', text: promptText });

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 12000,
    messages: [{ role: 'user', content }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');

  return parseEnvelope(text);
}
