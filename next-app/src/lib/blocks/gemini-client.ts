import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.GEMINI_DESIGN_MODEL ?? 'gemini-2.5-pro';
const VISION_MODEL = process.env.GEMINI_VISION_MODEL ?? 'gemini-2.5-pro';
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL ?? 'gemini-3.1-flash-image-preview';
const API_KEY = process.env.GEMINI_API_KEY;

export interface GeminiImage { mime: string; data: string }
export interface GeminiCall { text: string; image?: GeminiImage }
export interface GeminiImageResult { mime: string; base64: string }

function client() {
  if (!API_KEY) throw new Error('GEMINI_API_KEY missing');
  return new GoogleGenAI({ apiKey: API_KEY });
}

export async function callGemini(call: GeminiCall, attempt = 0): Promise<string> {
  const parts: Array<Record<string, unknown>> = [{ text: call.text }];
  if (call.image) parts.push({ inlineData: { mimeType: call.image.mime, data: call.image.data } });
  try {
    const res = await client().models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts }],
      // Force JSON-only output. Without this, Flash routinely wraps the
      // envelope in markdown fences or prepends "Here is the JSON:".
      config: { responseMimeType: 'application/json' },
    });
    const text = res.text ?? '';
    if (!text) throw new Error('empty response');
    return text;
  } catch (err) {
    if (attempt < 2) {
      const delay = 500 * (attempt + 1) ** 2;
      await new Promise(r => setTimeout(r, delay));
      return callGemini(call, attempt + 1);
    }
    throw err;
  }
}

export async function callGeminiVision(call: GeminiCall, attempt = 0): Promise<string> {
  const parts: Array<Record<string, unknown>> = [{ text: call.text }];
  if (call.image) parts.push({ inlineData: { mimeType: call.image.mime, data: call.image.data } });
  try {
    const res = await client().models.generateContent({
      model: VISION_MODEL,
      contents: [{ role: 'user', parts }],
      config: { responseMimeType: 'application/json' },
    });
    const text = res.text ?? '';
    if (!text) throw new Error('empty response');
    return text;
  } catch (err) {
    if (attempt < 2) {
      const delay = 500 * (attempt + 1) ** 2;
      await new Promise(r => setTimeout(r, delay));
      return callGeminiVision(call, attempt + 1);
    }
    throw err;
  }
}

export async function callGeminiImage(
  text: string,
  referenceImages: GeminiImage[] = [],
  attempt = 0,
): Promise<GeminiImageResult> {
  const parts: Array<Record<string, unknown>> = [{ text }];
  for (const img of referenceImages) parts.push({ inlineData: { mimeType: img.mime, data: img.data } });
  try {
    const res = await client().models.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: 'user', parts }],
      // Image-preview models return inline image parts; no responseMimeType.
    });
    const candidates = (res as unknown as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> };
      }>;
    }).candidates ?? [];
    for (const c of candidates) {
      for (const p of (c.content?.parts ?? [])) {
        if (p.inlineData?.data) {
          return { mime: p.inlineData.mimeType ?? 'image/png', base64: p.inlineData.data };
        }
      }
    }
    throw new Error('no image in gemini response');
  } catch (err) {
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 500 * (attempt + 1) ** 2));
      return callGeminiImage(text, referenceImages, attempt + 1);
    }
    throw err;
  }
}
