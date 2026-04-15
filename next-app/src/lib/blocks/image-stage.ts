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
    `Design ONE landing-page section as a 1440x900 mockup image.`,
    ``,
    `Section: ${input.section.type} — ${input.section.purpose || 'n/a'} (position ${input.section.position} of ${input.section.total}).`,
    ``,
    `Style Brief (authoritative visual constraints — use these EXACT hex codes, fonts, shapes):`,
    JSON.stringify(input.styleBrief, null, 2),
    ``,
    `Summit context (use real copy where natural — summit name, date, speakers):`,
    JSON.stringify(input.summit, null, 2),
    ``,
    `Design constraints:`,
    `- Output ONE image sized 1440x900, no watermarks, no cropping.`,
    `- Apply the Style Brief palette hex codes (primary/accent/background etc).`,
    `- Apply the Style Brief typography (heading_font for headlines, body_font for body).`,
    `- Apply the Style Brief hero_pattern for hero-type sections.`,
    `- Typography hierarchy: clear H1, supporting body, CTA button when relevant.`,
    `- Realistic imagery or placeholder photography; no lorem ipsum.`,
  ].join('\n');

  // NOTE: Gemini-3.1-flash-image-preview reliably drops its image output when
  // a large reference screenshot is attached (size > ~200KB payload). The
  // Style Brief already encodes the visual constraints, so we run Stage 1
  // text-only and rely on Stage 2 (which handles attachments well) to match
  // the mockup to the reference visually.
  const refs: Array<{ mime: string; data: string }> = [];
  void input.referenceImage;
  return callGeminiImage(prompt, refs);
}
