import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = process.env.CLAUDE_POLISH_MODEL ?? 'claude-sonnet-4-20250514';

interface PolishInput {
  jsx: string;
  styleBrief: Record<string, unknown>;
  skeleton: string | null;
  sectionType: string;
}

interface PolishResult {
  jsx: string;
  changes: string[];
}

export async function polishSection(input: PolishInput): Promise<PolishResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { jsx: input.jsx, changes: [] };
  }

  const client = new Anthropic({ apiKey });

  const prompt = [
    `You are reviewing a generated React/Tailwind landing page section. Fix ONLY color, font, spacing, and layout errors. Do not change content or add features.`,
    ``,
    `Section type: ${input.sectionType}`,
    ``,
    `=== Style Brief (authoritative — all values must match) ===`,
    JSON.stringify(input.styleBrief, null, 2),
    ``,
    input.skeleton ? `=== Layout Skeleton (grid/flex structure must match) ===\n${input.skeleton}` : '',
    ``,
    `=== Rules ===`,
    `1. Every hex color in the JSX must come from the Style Brief palette. Replace wrong colors.`,
    `2. Font families must be from the Style Brief: heading_font, body_font, accent_font.`,
    `3. Section container max-width must be max-w-[1120px].`,
    `4. Section vertical padding must use py-[75px] (large sections) or py-[50px] (medium) or py-[24px] (compact).`,
    `5. CTA buttons must be pill-shaped (rounded-full), bold font, using cta or primary color.`,
    `6. If a skeleton was provided, the grid/flex container classes must match exactly.`,
    `7. Do NOT add new content, components, hooks, or imports.`,
    `8. Do NOT remove existing content or fields.`,
    ``,
    `=== Input JSX ===`,
    input.jsx,
    ``,
    `=== Output ===`,
    `Return a JSON object with exactly two keys:`,
    `- "jsx": the corrected JSX string (full component, same format as input)`,
    `- "changes": array of strings describing each fix (empty array if no fixes needed)`,
    ``,
    `If no fixes are needed, return the original JSX unchanged with an empty changes array.`,
  ].filter(Boolean).join('\n');

  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.jsx === 'string' && Array.isArray(parsed?.changes)) {
      return { jsx: parsed.jsx, changes: parsed.changes };
    }
  } catch {
    const match = text.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
    if (match?.[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        if (typeof parsed?.jsx === 'string') {
          return { jsx: parsed.jsx, changes: parsed.changes ?? [] };
        }
      } catch { /* fall through */ }
    }
  }

  return { jsx: input.jsx, changes: [] };
}
