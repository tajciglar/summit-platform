import { describe, it, expect } from 'vitest'
import { packPrimitives } from './primitive-packer'

describe('packPrimitives', () => {
  it('returns concatenated source for requested primitives', () => {
    const packed = packPrimitives(['accordion', 'button'])
    expect(packed).toMatch(/\/\/ @\/components\/ui\/accordion\.tsx/)
    expect(packed).toMatch(/\/\/ @\/components\/ui\/button\.tsx/)
    expect(packed).toMatch(/AccordionPrimitive/)
  })

  it('throws when a primitive file is missing', () => {
    expect(() => packPrimitives(['doesnotexist'])).toThrow(/primitive not found/i)
  })

  it('returns an empty string for an empty list', () => {
    expect(packPrimitives([])).toBe('')
  })
})
