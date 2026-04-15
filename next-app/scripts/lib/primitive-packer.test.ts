import { describe, it, expect } from 'vitest'
import { packPrimitives } from './primitive-packer'

describe('packPrimitives', () => {
  it('concatenates each primitive with a header in requested order and a blank-line separator', () => {
    const packed = packPrimitives(['accordion', 'button'])
    const accordionIdx = packed.indexOf('// @/components/ui/accordion.tsx')
    const buttonIdx = packed.indexOf('// @/components/ui/button.tsx')
    expect(accordionIdx).toBeGreaterThanOrEqual(0)
    expect(buttonIdx).toBeGreaterThan(accordionIdx)
    expect(packed).toContain('\n\n// @/components/ui/button.tsx')
    const nonHeaderBytes = packed.replace(/^\/\/ @\/components\/ui\/.+\.tsx$/gm, '').trim()
    expect(nonHeaderBytes.length).toBeGreaterThan(0)
  })

  it('throws when a primitive file is missing', () => {
    expect(() => packPrimitives(['doesnotexist'])).toThrow(/primitive not found/i)
  })

  it('rejects path-traversal names before touching the filesystem', () => {
    expect(() => packPrimitives(['../secrets'])).toThrow(/rejected/i)
    expect(() => packPrimitives(['foo/bar'])).toThrow(/rejected/i)
  })

  it('returns an empty string for an empty list', () => {
    expect(packPrimitives([])).toBe('')
  })
})
