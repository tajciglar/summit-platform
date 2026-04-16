import { buildDesignPrompt, type BuildDesignPromptInput } from './design-prompt';
import { callGemini } from './gemini-client';
import { validateJsx } from './validator';
import { makeSection, type Section, type SectionField } from './types';
import { extractCss } from './css-extractor';

interface Envelope { jsx: string; fields: Array<{ path: string; kind: string; value: unknown }> }

function parseEnvelope(raw: string): Envelope | null {
  // Flash frequently wraps JSON in markdown code fences (with or without a
  // language tag) and adds preamble like "Here is the JSON:". Be tolerant:
  // try a few extraction strategies in order of strictness.
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

  // 3. Last-resort: take from the first '{' to the last '}'. Handles
  //    preamble/postamble commentary that Flash sometimes adds.
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

    const css = await extractCss(env.jsx);
    return makeSection({ type: input.section.type, jsx: env.jsx, fields: env.fields as SectionField[], css });
  }

  return {
    ...makeSection({ type: input.section.type, jsx: '', fields: [] }),
    status: 'failed',
    error: lastError,
    raw_output: lastRaw,
  };
}
