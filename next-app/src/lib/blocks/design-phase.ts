import { designSectionImage } from './image-stage';
import { claudeGenerateCode } from './claude-coder';
import { buildComponentRegistry } from './component-registry';
import { validateJsx } from './validator';
import { makeSection, type Section, type SectionField, type BuildDesignPromptInput } from './types';
import { extractCss } from './css-extractor';
import { loadSkeleton } from '../skeletons';

export async function designSection(input: BuildDesignPromptInput): Promise<Section> {
  const styleBrief = (input.styleBrief ?? {}) as Record<string, unknown>;
  const registry = buildComponentRegistry(styleBrief);
  const skel = await loadSkeleton(input.section.type);

  // Stage 1: Mockup image (Gemini) — skip if pre-supplied, gracefully fail
  let mockupImage: { mime: string; data: string } | null = input.mockupImage ?? null;

  if (!mockupImage && styleBrief && Object.keys(styleBrief).length > 0) {
    try {
      const result = await designSectionImage({
        section: input.section,
        summit: input.summit,
        styleBrief,
        referenceImage: input.referenceImage,
      });
      mockupImage = { mime: result.mime, data: result.base64 };
    } catch {
      // Stage 1 failed — continue without mockup
      mockupImage = null;
    }
  }

  // Stage 2 + 3: Claude code generation + validation (with retry)
  let lastError = '';

  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await claudeGenerateCode({
      registry,
      section: input.section,
      summit: input.summit,
      mockupImage,
      skeleton: skel?.skeleton ?? null,
      previousSectionJsx: input.previousSectionJsx,
      regenerationNote: attempt > 0 && lastError
        ? `${input.regenerationNote ?? ''}\nPrevious attempt failed validation: ${lastError}`
        : input.regenerationNote,
      currentJsx: input.currentJsx,
    });

    if (!result) {
      lastError = 'Claude returned empty or unparseable response';
      continue;
    }

    const v = validateJsx(result.jsx);
    if (!v.ok) {
      lastError = v.error ?? 'validator rejected';
      continue;
    }

    const css = await extractCss(result.jsx);
    return makeSection({
      type: input.section.type,
      jsx: result.jsx,
      fields: result.fields as SectionField[],
      css,
    });
  }

  return {
    ...makeSection({ type: input.section.type, jsx: '', fields: [] }),
    status: 'failed',
    error: lastError,
  };
}
