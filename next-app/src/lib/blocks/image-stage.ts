import { callGeminiImage, type GeminiImageResult } from './gemini-client';
import type { SectionBrief, SummitContext } from './design-prompt';

export interface ImageStageInput {
  section: SectionBrief;
  summit: SummitContext;
  styleBrief: Record<string, unknown>;
  referenceImage?: { mime: string; data: string } | null;
}

export async function designSectionImage(input: ImageStageInput): Promise<GeminiImageResult> {
  const prompt = [
    `Design ONE landing-page section as a 1440x900 mockup PNG.`,
    ``,
    `Section: ${input.section.type} — ${input.section.purpose || 'n/a'} (position ${input.section.position} of ${input.section.total}).`,
    ``,
    `Style Brief (authoritative visual constraints):`,
    JSON.stringify(input.styleBrief, null, 2),
    ``,
    `Summit context:`,
    JSON.stringify(input.summit, null, 2),
    ``,
    `If a reference screenshot is attached, match its overall visual style (palette, typography, density, button shape, hero pattern).`,
    `Always use the Style Brief's palette hex codes.`,
    `Design constraints:`,
    `- Output ONE PNG sized 1440x900, no watermarks, no cropping.`,
    `- Realistic imagery or placeholder photography as appropriate.`,
    `- Typography hierarchy: clear H1, supporting body, CTA button when relevant.`,
    `- Use real copy drawn from the summit context where natural (name, date, speaker names).`,
  ].join('\n');

  const refs = input.referenceImage ? [input.referenceImage] : [];
  return callGeminiImage(prompt, refs);
}
