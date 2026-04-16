import { callGeminiImage, type GeminiImage, type GeminiImageResult } from './gemini-client';
import { loadReferenceImage } from '../../../scripts/lib/prompt-parts';
import { loadSkeleton } from '../skeletons';
import type { SectionBrief, SummitContext } from './types';

export interface ImageStageInput {
  section: SectionBrief;
  summit: SummitContext;
  styleBrief: Record<string, unknown>;
  referenceImage?: { mime: string; data: string } | null;
}

export async function designSectionImage(input: ImageStageInput): Promise<GeminiImageResult> {
  const skel = await loadSkeleton(input.section.type);

  const skeletonBlock = skel
    ? [
        `Layout skeleton (MANDATORY — match this grid/flex structure exactly):`,
        '```',
        skel.skeleton.trim(),
        '```',
        `Slots to fill: ${skel.slots.join(', ')}`,
        ``,
      ]
    : [];

  const prompt = [
    `Design ONE landing-page section as a 1440x900 mockup image.`,
    ``,
    `Section: ${input.section.type} — ${input.section.purpose || 'n/a'} (position ${input.section.position} of ${input.section.total}).`,
    ``,
    ...skeletonBlock,
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
    `- Section max-width: 1120px centered. Section padding: 75px vertical, 20px horizontal.`,
    `- Typography hierarchy: clear H1 (48px), supporting body (18px), CTA button when relevant.`,
    `- CTA buttons: pill shape (border-radius: 500px), bold font, primary or cta color.`,
    `- Realistic imagery or placeholder photography; no lorem ipsum.`,
    `- Match the attached reference image's visual density, spacing, and proportions if provided.`,
  ].join('\n');

  // Load per-type reference PNG as visual anchor for layout fidelity
  const refs: GeminiImage[] = [];
  const refPath = `docs/block-references/${input.section.type}.png`;
  const refImg = await loadReferenceImage(refPath).catch(() => null);
  if (refImg) refs.push(refImg);

  return callGeminiImage(prompt, refs);
}
