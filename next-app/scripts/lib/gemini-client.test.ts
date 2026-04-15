import { describe, it, expect, vi, beforeEach } from 'vitest'

const generateContent = vi.fn()

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(function () {
      return { models: { generateContent } }
    }),
  }
})

import { generateBlockCode } from './gemini-client'

describe('generateBlockCode', () => {
  beforeEach(() => {
    generateContent.mockReset()
  })

  it('sends a multimodal request and returns the text response', async () => {
    generateContent.mockResolvedValue({
      candidates: [{ content: { parts: [{ text: 'response text' }] } }],
    })

    const result = await generateBlockCode({
      apiKey: 'key',
      model: 'gemini-2.5-pro',
      systemPrompt: 'system',
      designSystem: 'design',
      primitives: 'primitives',
      exampleBlock: 'example',
      blockTemplate: 'rules',
      blockSpec: { name: 'FAQAccordion', category: 'content', validOn: ['optin'] },
      referencePng: Buffer.from('fake png'),
    })

    expect(result).toBe('response text')
    expect(generateContent).toHaveBeenCalledWith(expect.objectContaining({
      model: 'gemini-2.5-pro',
    }))
    const call = generateContent.mock.calls[0][0]
    const parts = call.contents[0].parts
    expect(parts.some((p: { text?: string }) => p.text?.includes('system'))).toBe(true)
    expect(parts.some((p: { inlineData?: unknown }) => p.inlineData !== undefined)).toBe(true)
  })

  it('throws when the response has no text part', async () => {
    generateContent.mockResolvedValue({ candidates: [{ content: { parts: [] } }] })

    await expect(generateBlockCode({
      apiKey: 'key',
      model: 'gemini-2.5-pro',
      systemPrompt: 's',
      designSystem: 'd',
      primitives: 'p',
      exampleBlock: 'e',
      blockTemplate: 't',
      blockSpec: { name: 'X', category: 'content', validOn: ['optin'] },
      referencePng: Buffer.from('png'),
    })).rejects.toThrow(/no text in response/i)
  })
})
