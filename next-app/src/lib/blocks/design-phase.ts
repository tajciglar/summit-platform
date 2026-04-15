import { buildDesignPrompt, type BuildDesignPromptInput } from './design-prompt';
import { callGemini } from './gemini-client';
import { validateJsx } from './validator';
import { makeSection, type Section } from './types';

interface Envelope { jsx: string; fields: Array<{ path: string; kind: 'text' | 'url' | 'image'; value: string }> }

function parseEnvelope(raw: string): Envelope | null {
  try {
    const trimmed = raw.trim().replace(/^```json\s*|\s*```$/g, '');
    const parsed = JSON.parse(trimmed);
    if (typeof parsed?.jsx !== 'string' || !Array.isArray(parsed?.fields)) return null;
    return parsed as Envelope;
  } catch {
    return null;
  }
}

export async function designSection(input: BuildDesignPromptInput): Promise<Section> {
  let lastError = '';
  let lastRaw = '';

  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt = await buildDesignPrompt({
      ...input,
      regenerationNote: attempt > 0 && lastError
        ? `${input.regenerationNote ?? ''}\nPrevious attempt failed validation: ${lastError}`
        : input.regenerationNote,
    });

    let raw: string;
    try {
      raw = await callGemini(prompt);
    } catch (err) {
      lastError = (err as Error).message;
      lastRaw = '';
      continue;
    }
    lastRaw = raw;

    const env = parseEnvelope(raw);
    if (!env) { lastError = 'malformed envelope'; continue; }

    const v = validateJsx(env.jsx);
    if (!v.ok) { lastError = v.error ?? 'validator rejected'; continue; }

    return makeSection({ type: input.section.type, jsx: env.jsx, fields: env.fields });
  }

  return {
    ...makeSection({ type: input.section.type, jsx: '', fields: [] }),
    status: 'failed',
    error: lastError,
    raw_output: lastRaw,
  };
}
