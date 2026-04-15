import { callGeminiVision } from './gemini-client';

export interface StyleBrief {
  palette: Record<string, string>;
  typography: Record<string, unknown>;
  components: Record<string, unknown>;
  rhythm: Record<string, unknown>;
  voice: Record<string, unknown>;
  hero_pattern: string;
  _generated_from?: string | null;
  _generated_at?: string | null;
  _locked_fields?: string[];
}

function stripFences(s: string): string {
  return s.trim()
    .replace(/^\s*```(?:json|javascript|typescript|tsx|ts)?\s*\n?/i, '')
    .replace(/\n?\s*```\s*$/i, '')
    .trim();
}

export async function extractBriefFromScreenshot(
  pngBase64: string,
  summitContext: Record<string, unknown>,
  sourceUrl: string,
): Promise<StyleBrief> {
  const prompt = [
    `You are a brand-systems analyst. Given a website screenshot and optional summit context, extract a reusable Style Brief as strict JSON.`,
    ``,
    `Summit context (for tone/voice hints only):`,
    JSON.stringify(summitContext, null, 2),
    ``,
    `Return a JSON object with these EXACT top-level keys:`,
    `- palette: { primary, primary_text, accent, background, surface, text, text_muted, border } — hex strings, sampled from the screenshot`,
    `- typography: { heading_font (string), body_font (string), heading_weight (number), scale: "compact"|"comfortable"|"generous" }`,
    `- components: { button_shape: "pill"|"rounded"|"square", button_weight: "regular"|"bold", card_style: "flat"|"elevated"|"outlined", card_radius: "sm"|"md"|"lg"|"xl" }`,
    `- rhythm: { section_padding: "tight"|"comfortable"|"airy", max_width: number (px), density: "dense"|"comfortable"|"airy" }`,
    `- voice: { tone (string), headline_style (string) }`,
    `- hero_pattern: one of "split-image-right"|"split-image-left"|"centered"|"full-bleed-image"|"stacked-copy"`,
    ``,
    `Rules:`,
    `- Base all visual decisions on the screenshot first.`,
    `- Fall back to summit context only for voice/tone inference.`,
    `- Palette MUST use real hex codes observed in the screenshot.`,
    `- No other fields, no markdown fences, no commentary — pure JSON.`,
  ].join('\n');

  const raw = await callGeminiVision({ text: prompt, image: { mime: 'image/png', data: pngBase64 } });
  const parsed = JSON.parse(stripFences(raw)) as StyleBrief;
  parsed._generated_from = sourceUrl;
  parsed._generated_at = new Date().toISOString();
  parsed._locked_fields = parsed._locked_fields ?? [];
  return parsed;
}
