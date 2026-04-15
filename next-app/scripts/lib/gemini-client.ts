import { GoogleGenAI } from '@google/genai'
import type { StepType } from '../../src/types/block'

export interface GenerateBlockArgs {
  apiKey: string
  model: string
  systemPrompt: string
  designSystem: string
  primitives: string
  exampleBlock: string
  blockTemplate: string
  blockSpec: {
    name: string
    category: string
    validOn: StepType[]
  }
  referencePng: Buffer
}

export async function generateBlockCode(args: GenerateBlockArgs): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: args.apiKey })

  const res = await ai.models.generateContent({
    model: args.model,
    contents: [
      {
        role: 'user',
        parts: [
          { text: args.systemPrompt },
          { text: `\nDESIGN SYSTEM:\n${args.designSystem}` },
          { text: `\nPROJECT PRIMITIVES (source code — match their real API, do not guess):\n\n${args.primitives}` },
          { text: `\nEXAMPLE BLOCK (mirror its structure, imports, and Tailwind style):\n\n${args.exampleBlock}` },
          { text: `\nFILE-LAYOUT AND STYLE RULES:\n${args.blockTemplate}` },
          {
            text:
              `\nGENERATE BLOCK:\n` +
              `- name: ${args.blockSpec.name}\n` +
              `- category: ${args.blockSpec.category}\n` +
              `- validOn: ${JSON.stringify(args.blockSpec.validOn)}\n\n` +
              `The attached PNG is the visual reference. Match its structure, hierarchy, ` +
              `spacing, and overall look. Every piece of content must be prop-driven — ` +
              `no hard-coded copy. Return the JSON envelope only.`,
          },
          {
            inlineData: {
              mimeType: 'image/png',
              data: args.referencePng.toString('base64'),
            },
          },
        ],
      },
    ],
  })

  const parts = res.candidates?.[0]?.content?.parts ?? []
  const text = parts.find((p: { text?: string }) => typeof p.text === 'string')?.text
  if (!text) {
    throw new Error('no text in response from Gemini')
  }
  return text
}
