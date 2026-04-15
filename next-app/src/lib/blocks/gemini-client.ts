import { GoogleGenAI } from '@google/genai';

const MODEL = process.env.GEMINI_DESIGN_MODEL ?? 'gemini-2.5-pro';
const API_KEY = process.env.GEMINI_API_KEY;

export interface GeminiImage { mime: string; data: string }
export interface GeminiCall { text: string; image?: GeminiImage }

export async function callGemini(call: GeminiCall, attempt = 0): Promise<string> {
  if (!API_KEY) throw new Error('GEMINI_API_KEY missing');
  const client = new GoogleGenAI({ apiKey: API_KEY });
  const parts: Array<Record<string, unknown>> = [{ text: call.text }];
  if (call.image) parts.push({ inlineData: { mimeType: call.image.mime, data: call.image.data } });
  try {
    const res = await client.models.generateContent({
      model: MODEL,
      contents: [{ role: 'user', parts }],
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
