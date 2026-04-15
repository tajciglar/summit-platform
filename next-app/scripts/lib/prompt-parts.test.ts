import { describe, it, expect } from 'vitest'
import { loadDesignSystem, loadPrimitiveSources, loadExampleBlock, loadReferenceImage } from './prompt-parts'

describe('prompt-parts', () => {
  it('loadDesignSystem returns non-empty string', async () => {
    const s = await loadDesignSystem()
    expect(s.length).toBeGreaterThan(10)
  })

  it('loadPrimitiveSources defaults to known UI primitives', async () => {
    const s = await loadPrimitiveSources()
    expect(s).toContain('@/components/ui/button.tsx')
  })

  it('loadReferenceImage returns null for null path', async () => {
    expect(await loadReferenceImage(null)).toBeNull()
  })

  it('loadReferenceImage returns null for missing file', async () => {
    expect(await loadReferenceImage('no/such/file.png')).toBeNull()
  })

  it('loadExampleBlock wraps packExampleBlock', async () => {
    // smoke: function is callable. Don't assert on specific example content.
    expect(typeof loadExampleBlock).toBe('function')
  })
})
